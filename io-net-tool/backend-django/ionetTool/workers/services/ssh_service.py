import paramiko
import json
import re
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)


@dataclass
class CommandResult:
    """Result of an SSH command execution"""
    success: bool
    stdout: str
    stderr: str
    exit_code: int


class SSHService:
    """Service for executing commands on remote servers via SSH"""
    
    def __init__(self, host: str, username: str, password: str, port: int = 22):
        self.host = host
        self.username = username
        self.password = password
        self.port = port
        self._client: Optional[paramiko.SSHClient] = None
    
    def connect(self) -> bool:
        """Establish SSH connection"""
        try:
            self._client = paramiko.SSHClient()
            self._client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            self._client.connect(
                self.host,
                port=self.port,
                username=self.username,
                password=self.password,
                timeout=30
            )
            logger.info(f"Connected to {self.host}")
            return True
        except Exception as e:
            logger.error(f"Failed to connect to {self.host}: {e}")
            return False
    
    def disconnect(self):
        """Close SSH connection"""
        if self._client:
            self._client.close()
            self._client = None
            logger.info(f"Disconnected from {self.host}")
    
    def execute(self, command: str, timeout: int = 60) -> CommandResult:
        """Execute a command on the remote server"""
        if not self._client:
            if not self.connect():
                return CommandResult(
                    success=False,
                    stdout="",
                    stderr="Failed to connect",
                    exit_code=-1
                )
        
        try:
            stdin, stdout, stderr = self._client.exec_command(command, timeout=timeout)
            exit_code = stdout.channel.recv_exit_status()
            
            return CommandResult(
                success=exit_code == 0,
                stdout=stdout.read().decode('utf-8', errors='replace'),
                stderr=stderr.read().decode('utf-8', errors='replace'),
                exit_code=exit_code
            )
        except Exception as e:
            logger.error(f"Command execution failed on {self.host}: {e}")
            return CommandResult(
                success=False,
                stdout="",
                stderr=str(e),
                exit_code=-1
            )
    
    def execute_sudo(self, command: str, timeout: int = 60) -> CommandResult:
        """Execute a command with sudo"""
        sudo_command = f"echo '{self.password}' | sudo -S {command}"
        return self.execute(sudo_command, timeout)
    
    def get_system_info(self) -> Dict:
        """Get system information from the server"""
        info = {}
        
        # CPU info
        cpu_result = self.execute("lscpu")
        if cpu_result.success:
            info['cpu'] = self._parse_lscpu(cpu_result.stdout)
        
        # Memory info
        mem_result = self.execute("free -b")
        if mem_result.success:
            info['memory'] = self._parse_free(mem_result.stdout)
        
        # Disk info
        disk_result = self.execute("df -B1 /")
        if disk_result.success:
            info['disk'] = self._parse_df(disk_result.stdout)
        
        # Uptime
        uptime_result = self.execute("uptime -s")
        if uptime_result.success:
            info['uptime_since'] = uptime_result.stdout.strip()
        
        return info
    
    def get_docker_containers(self) -> List[Dict]:
        """Get list of Docker containers with their status"""
        result = self.execute(
            'docker ps -a --format "{{.ID}}|{{.Names}}|{{.Image}}|{{.Status}}|{{.State}}"'
        )
        
        if not result.success:
            logger.error(f"Failed to get containers: {result.stderr}")
            return []
        
        containers = []
        for line in result.stdout.strip().split('\n'):
            if not line:
                continue
            parts = line.split('|')
            if len(parts) >= 5:
                containers.append({
                    'id': parts[0],
                    'name': parts[1],
                    'image': parts[2],
                    'status_text': parts[3],
                    'state': parts[4].lower(),
                })
        
        return containers
    
    def get_container_stats(self, container_id: str) -> Dict:
        """Get stats for a specific container"""
        result = self.execute(
            f'docker stats {container_id} --no-stream --format '
            '"{{.CPUPerc}}|{{.MemUsage}}|{{.NetIO}}|{{.BlockIO}}"'
        )
        
        if not result.success:
            return {}
        
        parts = result.stdout.strip().split('|')
        if len(parts) >= 4:
            return {
                'cpu_percent': self._parse_percentage(parts[0]),
                'memory': parts[1],
                'network_io': parts[2],
                'block_io': parts[3],
            }
        return {}
    
    def get_ionet_workers(self) -> List[Dict]:
        """Get io.net worker containers specifically"""
        containers = self.get_docker_containers()
        return [
            c for c in containers 
            if 'ionet' in c['image'].lower() or 'io-launch' in c['image'].lower()
        ]
    
    def check_virsh_vms(self) -> List[Dict]:
        """Get list of KVM/QEMU VMs via virsh"""
        result = self.execute("virsh list --all")
        
        if not result.success:
            logger.error(f"Failed to get VMs: {result.stderr}")
            return []
        
        vms = []
        lines = result.stdout.strip().split('\n')
        # Skip header lines
        for line in lines[2:]:
            if not line.strip():
                continue
            parts = line.split()
            if len(parts) >= 3:
                vm_id = parts[0] if parts[0] != '-' else None
                name = parts[1]
                state = ' '.join(parts[2:])
                vms.append({
                    'vm_id': vm_id,
                    'name': name,
                    'state': state,
                })
        
        return vms
    
    def get_vm_ip(self, vm_name: str) -> Optional[str]:
        """Get IP address of a VM"""
        result = self.execute(f"virsh domifaddr {vm_name}")
        
        if not result.success:
            return None
        
        # Parse output for IP
        for line in result.stdout.split('\n'):
            match = re.search(r'(\d+\.\d+\.\d+\.\d+)', line)
            if match:
                return match.group(1)
        
        return None
    
    def _parse_lscpu(self, output: str) -> Dict:
        """Parse lscpu output"""
        info = {}
        for line in output.split('\n'):
            if ':' in line:
                key, value = line.split(':', 1)
                info[key.strip()] = value.strip()
        return info
    
    def _parse_free(self, output: str) -> Dict:
        """Parse free -b output"""
        lines = output.strip().split('\n')
        if len(lines) >= 2:
            parts = lines[1].split()
            if len(parts) >= 3:
                return {
                    'total': int(parts[1]),
                    'used': int(parts[2]),
                    'free': int(parts[3]) if len(parts) > 3 else 0,
                }
        return {}
    
    def _parse_df(self, output: str) -> Dict:
        """Parse df output"""
        lines = output.strip().split('\n')
        if len(lines) >= 2:
            parts = lines[1].split()
            if len(parts) >= 4:
                return {
                    'total': int(parts[1]),
                    'used': int(parts[2]),
                    'available': int(parts[3]),
                }
        return {}
    
    def _parse_percentage(self, value: str) -> float:
        """Parse percentage string like '45.5%' """
        try:
            return float(value.rstrip('%'))
        except (ValueError, AttributeError):
            return 0.0
    
    def __enter__(self):
        self.connect()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.disconnect()

