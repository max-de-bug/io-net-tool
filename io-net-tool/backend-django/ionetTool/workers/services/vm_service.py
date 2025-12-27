import logging
import random
from typing import Dict, Optional
from django.utils import timezone
from ..models import Server, VirtualMachine
from .ssh_service import SSHService

logger = logging.getLogger(__name__)


class VMService:
    """Service for managing KVM/QEMU Virtual Machines"""
    
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
    
    def setup_virtualization(self) -> Dict:
        """Install KVM/QEMU virtualization packages"""
        try:
            if not self.connect():
                return {'success': False, 'error': 'Connection failed'}
            
            commands = [
                "apt update",
                "apt install -y libvirt-clients",
                "apt install -y qemu-kvm libvirt-daemon-system bridge-utils virtinst",
                "apt install -y cloud-image-utils",
                f"usermod -aG kvm {self.server.ssh_username}",
                f"usermod -aG libvirt {self.server.ssh_username}",
            ]
            
            for cmd in commands:
                result = self.ssh.execute_sudo(cmd, timeout=300)
                logger.info(f"Executed: {cmd} - Exit: {result.exit_code}")
            
            return {'success': True, 'message': 'Virtualization setup complete'}
            
        except Exception as e:
            logger.error(f"Setup failed: {e}")
            return {'success': False, 'error': str(e)}
        finally:
            self.disconnect()
    
    def download_base_image(self) -> Dict:
        """Download Ubuntu cloud image for VMs"""
        try:
            if not self.connect():
                return {'success': False, 'error': 'Connection failed'}
            
            commands = [
                "mkdir -p $HOME/kvm/base",
                "wget -P $HOME/kvm/base https://cloud-images.ubuntu.com/focal/current/focal-server-cloudimg-amd64.img || true",
            ]
            
            for cmd in commands:
                result = self.ssh.execute(cmd, timeout=600)
                logger.info(f"Executed: {cmd}")
            
            return {'success': True, 'message': 'Base image downloaded'}
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
        finally:
            self.disconnect()
    
    def create_vm(
        self,
        name: str,
        vcpus: int = 2,
        ram_mb: int = 2048,
        disk_gb: int = 10,
        vm_username: str = "vmadm",
        vm_password: str = "vmadm",
        ip_address: str = None,
    ) -> Dict:
        """Create a new virtual machine"""
        try:
            if not self.connect():
                return {'success': False, 'error': 'Connection failed'}
            
            # Generate MAC address
            mac = self._generate_mac()
            
            # Default IP if not provided
            if not ip_address:
                # Generate based on VM name or random
                last_octet = random.randint(100, 250)
                ip_address = f"192.168.122.{last_octet}"
            
            # Create VM directory
            vm_dir = f"$HOME/kvm/{name}"
            self.ssh.execute(f"mkdir -p {vm_dir}")
            
            # Create disk from base image
            result = self.ssh.execute(
                f"qemu-img create -F qcow2 -b ~/kvm/base/focal-server-cloudimg-amd64.img "
                f"-f qcow2 {vm_dir}/{name}.qcow2 {disk_gb}G"
            )
            
            if not result.success:
                return {'success': False, 'error': f"Failed to create disk: {result.stderr}"}
            
            # Create cloud-init configs
            network_config = self._generate_network_config(mac, ip_address)
            user_data = self._generate_user_data(name, vm_username, vm_password)
            
            # Write configs
            self.ssh.execute(f"cat > {vm_dir}/network-config << 'EOF'\n{network_config}\nEOF")
            self.ssh.execute(f"cat > {vm_dir}/user-data << 'EOF'\n{user_data}\nEOF")
            self.ssh.execute(f"touch {vm_dir}/meta-data")
            
            # Create cloud-init seed
            result = self.ssh.execute(
                f"cloud-localds -v --network-config={vm_dir}/network-config "
                f"{vm_dir}/{name}-seed.qcow2 {vm_dir}/user-data {vm_dir}/meta-data"
            )
            
            if not result.success:
                logger.warning(f"cloud-localds warning: {result.stderr}")
            
            # Create VM with virt-install
            virt_install_cmd = (
                f"virt-install --connect qemu:///system --virt-type kvm --name {name} "
                f"--ram {ram_mb} --vcpus={vcpus} --os-type linux --os-variant ubuntu20.04 "
                f"--disk path={vm_dir}/{name}.qcow2,device=disk "
                f"--disk path={vm_dir}/{name}-seed.qcow2,device=disk "
                f"--import --network network=default,model=virtio,mac={mac} --noautoconsole"
            )
            
            result = self.ssh.execute_sudo(virt_install_cmd, timeout=120)
            
            if not result.success and 'already exists' not in result.stderr:
                return {'success': False, 'error': f"virt-install failed: {result.stderr}"}
            
            # Create VM record in database
            vm = VirtualMachine.objects.create(
                server=self.server,
                name=name,
                vm_username=vm_username,
                vm_password=vm_password,
                vcpus=vcpus,
                ram_mb=ram_mb,
                disk_gb=disk_gb,
                ip_address=ip_address,
                mac_address=mac,
                status='running',
                last_seen=timezone.now(),
            )
            
            return {
                'success': True,
                'message': f'VM {name} created successfully',
                'vm_id': str(vm.id),
                'ip_address': ip_address,
                'mac_address': mac,
            }
            
        except Exception as e:
            logger.error(f"VM creation failed: {e}")
            return {'success': False, 'error': str(e)}
        finally:
            self.disconnect()
    
    def start_vm(self, vm: VirtualMachine) -> Dict:
        """Start a stopped VM"""
        try:
            if not self.connect():
                return {'success': False, 'error': 'Connection failed'}
            
            result = self.ssh.execute_sudo(f"virsh start {vm.name}")
            
            if result.success:
                vm.status = 'running'
                vm.last_seen = timezone.now()
                vm.save()
                return {'success': True, 'message': f'VM {vm.name} started'}
            else:
                return {'success': False, 'error': result.stderr}
                
        finally:
            self.disconnect()
    
    def stop_vm(self, vm: VirtualMachine) -> Dict:
        """Stop a running VM"""
        try:
            if not self.connect():
                return {'success': False, 'error': 'Connection failed'}
            
            result = self.ssh.execute_sudo(f"virsh shutdown {vm.name}")
            
            if result.success:
                vm.status = 'stopped'
                vm.save()
                return {'success': True, 'message': f'VM {vm.name} stopped'}
            else:
                return {'success': False, 'error': result.stderr}
                
        finally:
            self.disconnect()
    
    def destroy_vm(self, vm: VirtualMachine) -> Dict:
        """Force stop a VM"""
        try:
            if not self.connect():
                return {'success': False, 'error': 'Connection failed'}
            
            result = self.ssh.execute_sudo(f"virsh destroy {vm.name}")
            
            if result.success:
                vm.status = 'stopped'
                vm.save()
                return {'success': True, 'message': f'VM {vm.name} destroyed'}
            else:
                return {'success': False, 'error': result.stderr}
                
        finally:
            self.disconnect()
    
    def delete_vm(self, vm: VirtualMachine) -> Dict:
        """Delete a VM and its files"""
        try:
            if not self.connect():
                return {'success': False, 'error': 'Connection failed'}
            
            # Stop if running
            self.ssh.execute_sudo(f"virsh destroy {vm.name}")
            
            # Undefine VM
            result = self.ssh.execute_sudo(f"virsh undefine {vm.name}")
            
            # Remove VM files
            self.ssh.execute(f"rm -rf $HOME/kvm/{vm.name}")
            
            # Delete from database
            vm.delete()
            
            return {'success': True, 'message': f'VM {vm.name} deleted'}
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
        finally:
            self.disconnect()
    
    def get_vm_status(self, vm: VirtualMachine) -> Dict:
        """Get current VM status"""
        try:
            if not self.connect():
                return {'success': False, 'error': 'Connection failed'}
            
            vms = self.ssh.check_virsh_vms()
            vm_info = next((v for v in vms if v['name'] == vm.name), None)
            
            if vm_info:
                return {
                    'success': True,
                    'name': vm.name,
                    'state': vm_info['state'],
                    'ip_address': vm.ip_address,
                }
            else:
                return {'success': False, 'error': 'VM not found'}
                
        finally:
            self.disconnect()
    
    def install_worker_on_vm(self, vm: VirtualMachine, device_id: str, user_id: str) -> Dict:
        """Install io.net worker on a VM"""
        try:
            if not vm.ip_address:
                return {'success': False, 'error': 'VM has no IP address'}
            
            # Connect to VM
            vm_ssh = SSHService(
                host=vm.ip_address,
                username=vm.vm_username,
                password=vm.vm_password,
            )
            
            if not vm_ssh.connect():
                return {'success': False, 'error': 'Failed to connect to VM'}
            
            # Install Docker if not present
            vm_ssh.execute_sudo("apt update && apt install -y docker.io", timeout=300)
            vm_ssh.execute_sudo(f"usermod -aG docker {vm.vm_username}")
            
            # Download and run io.net setup
            commands = [
                "curl -L https://github.com/ionet-official/io-net-official-setup-script/raw/main/ionet-setup.sh -o /tmp/ionet-setup.sh",
                "chmod +x /tmp/ionet-setup.sh",
            ]
            
            for cmd in commands:
                result = vm_ssh.execute(cmd, timeout=120)
                logger.info(f"VM {vm.name}: {cmd}")
            
            # Run setup with device/user IDs
            result = vm_ssh.execute_sudo(
                f"/tmp/ionet-setup.sh --device-id {device_id} --user-id {user_id}",
                timeout=600
            )
            
            vm_ssh.disconnect()
            
            return {
                'success': True,
                'message': 'Worker installation started on VM',
                'output': result.stdout[:1000],  # First 1000 chars
            }
            
        except Exception as e:
            logger.error(f"Worker installation on VM failed: {e}")
            return {'success': False, 'error': str(e)}
    
    def _generate_mac(self) -> str:
        """Generate a random MAC address"""
        return "52:54:00:{:02x}:{:02x}:{:02x}".format(
            random.randint(0, 255),
            random.randint(0, 255),
            random.randint(0, 255)
        )
    
    def _generate_network_config(self, mac: str, ip: str) -> str:
        """Generate cloud-init network config"""
        return f"""version: 2
ethernets:
    eth0:
        addresses:
        - {ip}/24
        dhcp4: false
        gateway4: 192.168.122.1
        match:
            macaddress: {mac}
        nameservers:
            addresses:
            - 1.1.1.1
            - 8.8.8.8
        set-name: eth0"""
    
    def _generate_user_data(self, hostname: str, username: str, password: str) -> str:
        """Generate cloud-init user-data"""
        return f"""#cloud-config
hostname: {hostname}
manage_etc_hosts: true
users:
  - name: {username}
    sudo: ALL=(ALL) NOPASSWD:ALL
    groups: users, admin, docker
    home: /home/{username}
    shell: /bin/bash
    lock_passwd: false
ssh_pwauth: true
disable_root: false
chpasswd:
  list: |
    {username}:{password}
  expire: false
packages:
  - docker.io
  - curl
  - wget
runcmd:
  - systemctl enable docker
  - systemctl start docker
  - usermod -aG docker {username}"""

