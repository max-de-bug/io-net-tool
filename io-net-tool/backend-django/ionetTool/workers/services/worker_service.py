import logging
from typing import Dict, List, Optional
from django.utils import timezone
from ..models import Server, VirtualMachine, Worker, StatusLog
from .ssh_service import SSHService

logger = logging.getLogger(__name__)


class WorkerStatusService:
    """Service for tracking and managing io.net worker status"""
    
    STATUS_MAP = {
        'running': 'running',
        'up': 'running',
        'exited': 'inactive',
        'paused': 'paused',
        'dead': 'failed',
        'created': 'inactive',
        'restarting': 'restart_required',
    }
    
    def __init__(self, server: Server):
        self.server = server
        self.ssh: Optional[SSHService] = None
    
    def connect(self) -> bool:
        """Connect to the server via SSH"""
        self.ssh = SSHService(
            host=self.server.ip_address,
            username=self.server.ssh_username,
            password=self.server.ssh_password,
            port=self.server.ssh_port
        )
        return self.ssh.connect()
    
    def disconnect(self):
        """Disconnect from server"""
        if self.ssh:
            self.ssh.disconnect()
    
    def check_server_status(self) -> Dict:
        """Check and update server status"""
        try:
            if self.connect():
                # Get system info
                sys_info = self.ssh.get_system_info()
                
                old_status = self.server.status
                self.server.status = 'online'
                self.server.last_seen = timezone.now()
                self.server.last_error = None
                
                if sys_info.get('cpu'):
                    self.server.cpu_info = sys_info['cpu']
                if sys_info.get('memory'):
                    self.server.memory_total = sys_info['memory'].get('total')
                if sys_info.get('disk'):
                    self.server.disk_total = sys_info['disk'].get('total')
                
                self.server.save()
                
                if old_status != 'online':
                    self._log_status_change('server', self.server.id, old_status, 'online')
                
                return {
                    'status': 'online',
                    'system_info': sys_info,
                }
            else:
                self._update_server_offline("Connection failed")
                return {'status': 'offline', 'error': 'Connection failed'}
                
        except Exception as e:
            logger.error(f"Error checking server {self.server.name}: {e}")
            self._update_server_offline(str(e))
            return {'status': 'error', 'error': str(e)}
        finally:
            self.disconnect()
    
    def check_all_workers(self) -> List[Dict]:
        """Check status of all workers on this server"""
        results = []
        
        try:
            if not self.connect():
                return [{'error': 'Connection failed'}]
            
            # Check direct workers on server
            containers = self.ssh.get_ionet_workers()
            results.extend(self._process_containers(containers, server=self.server))
            
            # Check workers on VMs
            for vm in self.server.virtual_machines.all():
                vm_results = self._check_vm_workers(vm)
                results.extend(vm_results)
            
            return results
            
        except Exception as e:
            logger.error(f"Error checking workers on {self.server.name}: {e}")
            return [{'error': str(e)}]
        finally:
            self.disconnect()
    
    def _check_vm_workers(self, vm: VirtualMachine) -> List[Dict]:
        """Check workers running on a specific VM"""
        results = []
        
        # First check VM status via virsh
        vms = self.ssh.check_virsh_vms()
        vm_info = next((v for v in vms if v['name'] == vm.name), None)
        
        if vm_info:
            old_status = vm.status
            new_status = self._map_vm_status(vm_info['state'])
            
            if old_status != new_status:
                vm.status = new_status
                vm.last_seen = timezone.now()
                vm.save()
                self._log_status_change('vm', vm.id, old_status, new_status)
        
        # If VM is running, connect to it to check workers
        if vm.status == 'running' and vm.ip_address:
            try:
                vm_ssh = SSHService(
                    host=vm.ip_address,
                    username=vm.vm_username,
                    password=vm.vm_password,
                    port=22
                )
                
                if vm_ssh.connect():
                    containers = vm_ssh.get_ionet_workers()
                    results.extend(self._process_containers(containers, vm=vm))
                    vm_ssh.disconnect()
                    
            except Exception as e:
                logger.error(f"Error connecting to VM {vm.name}: {e}")
                results.append({
                    'vm': vm.name,
                    'error': str(e)
                })
        
        return results
    
    def _process_containers(
        self, 
        containers: List[Dict], 
        server: Optional[Server] = None,
        vm: Optional[VirtualMachine] = None
    ) -> List[Dict]:
        """Process container list and update worker statuses"""
        results = []
        
        for container in containers:
            # Find or create worker
            worker = self._get_or_create_worker(container, server, vm)
            
            old_status = worker.status
            new_status = self.STATUS_MAP.get(container['state'], 'unknown')
            
            worker.status = new_status
            worker.container_id = container['id']
            worker.container_name = container['name']
            worker.image_name = container['image']
            worker.last_seen = timezone.now()
            worker.save()
            
            if old_status != new_status:
                self._log_status_change('worker', worker.id, old_status, new_status)
            
            # Get container stats if running
            stats = {}
            if new_status == 'running' and self.ssh:
                stats = self.ssh.get_container_stats(container['id'])
                if stats.get('cpu_percent'):
                    worker.cpu_usage = stats['cpu_percent']
                    worker.save()
            
            results.append({
                'worker_id': str(worker.id),
                'name': worker.name,
                'status': new_status,
                'container_id': container['id'],
                'stats': stats,
            })
        
        return results
    
    def _get_or_create_worker(
        self, 
        container: Dict,
        server: Optional[Server] = None,
        vm: Optional[VirtualMachine] = None
    ) -> Worker:
        """Get existing worker or create new one"""
        # Try to find by container ID first
        worker = Worker.objects.filter(container_id=container['id']).first()
        
        if not worker:
            # Try by container name
            worker = Worker.objects.filter(container_name=container['name']).first()
        
        if not worker:
            # Create new worker
            worker = Worker.objects.create(
                name=container['name'],
                container_id=container['id'],
                container_name=container['name'],
                image_name=container['image'],
                server=server if not vm else None,
                virtual_machine=vm,
            )
            logger.info(f"Created new worker: {worker.name}")
        
        return worker
    
    def _map_vm_status(self, virsh_state: str) -> str:
        """Map virsh state to our VM status"""
        state_lower = virsh_state.lower()
        if 'running' in state_lower:
            return 'running'
        elif 'paused' in state_lower:
            return 'paused'
        elif 'shut off' in state_lower:
            return 'stopped'
        else:
            return 'error'
    
    def _update_server_offline(self, error: str):
        """Update server status to offline"""
        old_status = self.server.status
        self.server.status = 'offline'
        self.server.last_error = error
        self.server.save()
        
        if old_status != 'offline':
            self._log_status_change('server', self.server.id, old_status, 'offline', error)
    
    def _log_status_change(
        self, 
        entity_type: str, 
        entity_id, 
        old_status: str, 
        new_status: str,
        message: str = ""
    ):
        """Log a status change"""
        StatusLog.objects.create(
            entity_type=entity_type,
            entity_id=entity_id,
            old_status=old_status,
            new_status=new_status,
            message=message,
        )
    
    # Worker management actions
    
    def start_worker(self, worker: Worker) -> Dict:
        """Start a stopped worker"""
        if not worker.container_id:
            return {'success': False, 'error': 'No container ID'}
        
        try:
            if not self.connect():
                return {'success': False, 'error': 'Connection failed'}
            
            result = self.ssh.execute(f"docker start {worker.container_id}")
            
            if result.success:
                worker.status = 'running'
                worker.last_seen = timezone.now()
                worker.save()
                return {'success': True, 'message': 'Worker started'}
            else:
                return {'success': False, 'error': result.stderr}
                
        finally:
            self.disconnect()
    
    def stop_worker(self, worker: Worker) -> Dict:
        """Stop a running worker"""
        if not worker.container_id:
            return {'success': False, 'error': 'No container ID'}
        
        try:
            if not self.connect():
                return {'success': False, 'error': 'Connection failed'}
            
            result = self.ssh.execute(f"docker stop {worker.container_id}")
            
            if result.success:
                worker.status = 'inactive'
                worker.save()
                return {'success': True, 'message': 'Worker stopped'}
            else:
                return {'success': False, 'error': result.stderr}
                
        finally:
            self.disconnect()
    
    def restart_worker(self, worker: Worker) -> Dict:
        """Restart a worker"""
        if not worker.container_id:
            return {'success': False, 'error': 'No container ID'}
        
        try:
            if not self.connect():
                return {'success': False, 'error': 'Connection failed'}
            
            result = self.ssh.execute(f"docker restart {worker.container_id}")
            
            if result.success:
                worker.status = 'running'
                worker.last_seen = timezone.now()
                worker.save()
                return {'success': True, 'message': 'Worker restarted'}
            else:
                return {'success': False, 'error': result.stderr}
                
        finally:
            self.disconnect()
    
    def get_worker_logs(self, worker: Worker, lines: int = 100) -> Dict:
        """Get logs from a worker container"""
        if not worker.container_id:
            return {'success': False, 'error': 'No container ID'}
        
        try:
            if not self.connect():
                return {'success': False, 'error': 'Connection failed'}
            
            result = self.ssh.execute(f"docker logs --tail {lines} {worker.container_id}")
            
            return {
                'success': True,
                'logs': result.stdout,
                'errors': result.stderr,
            }
                
        finally:
            self.disconnect()
    
    def install_new_worker(self, device_id: str, user_id: str) -> Dict:
        """Install a new io.net worker"""
        try:
            if not self.connect():
                return {'success': False, 'error': 'Connection failed'}
            
            # Download and run the setup script
            commands = [
                "curl -L https://github.com/ionet-official/io-net-official-setup-script/raw/main/ionet-setup.sh -o /tmp/ionet-setup.sh",
                "chmod +x /tmp/ionet-setup.sh",
                f"/tmp/ionet-setup.sh --device-id {device_id} --user-id {user_id}",
            ]
            
            for cmd in commands:
                result = self.ssh.execute_sudo(cmd, timeout=300)
                if not result.success:
                    return {'success': False, 'error': f"Failed: {cmd}\n{result.stderr}"}
            
            return {'success': True, 'message': 'Worker installation started'}
            
        finally:
            self.disconnect()

