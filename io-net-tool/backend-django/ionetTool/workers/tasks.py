from celery import shared_task
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import logging

logger = logging.getLogger(__name__)


@shared_task
def check_all_workers_status():
    """Background task to check all workers status"""
    from .models import Server
    from .services import WorkerStatusService
    from .serializers import WorkerSerializer
    
    results = []
    channel_layer = get_channel_layer()
    
    for server in Server.objects.filter(status='online'):
        try:
            service = WorkerStatusService(server)
            worker_results = service.check_all_workers()
            results.extend(worker_results)
            
            # Send real-time update via WebSocket
            if channel_layer:
                async_to_sync(channel_layer.group_send)(
                    'status_updates',
                    {
                        'type': 'status_update',
                        'data': {
                            'server_id': str(server.id),
                            'workers': worker_results,
                        }
                    }
                )
                
        except Exception as e:
            logger.error(f"Error checking workers on {server.name}: {e}")
    
    return {'checked': len(results)}


@shared_task
def check_all_servers_status():
    """Background task to check all servers status"""
    from .models import Server
    from .services import WorkerStatusService
    from .serializers import ServerSerializer
    
    results = []
    channel_layer = get_channel_layer()
    
    for server in Server.objects.all():
        try:
            service = WorkerStatusService(server)
            result = service.check_server_status()
            results.append({
                'server_id': str(server.id),
                'status': result.get('status'),
            })
            
            # Send real-time update via WebSocket
            if channel_layer:
                async_to_sync(channel_layer.group_send)(
                    'status_updates',
                    {
                        'type': 'status_update',
                        'data': {
                            'type': 'server',
                            'server': ServerSerializer(server).data,
                        }
                    }
                )
                
        except Exception as e:
            logger.error(f"Error checking server {server.name}: {e}")
    
    return {'checked': len(results)}


@shared_task
def check_single_server(server_id: str):
    """Check status of a single server"""
    from .models import Server
    from .services import WorkerStatusService
    
    try:
        server = Server.objects.get(id=server_id)
        service = WorkerStatusService(server)
        return service.check_server_status()
    except Server.DoesNotExist:
        return {'error': 'Server not found'}


@shared_task
def check_single_worker(worker_id: str):
    """Check status of a single worker"""
    from .models import Worker
    from .services import WorkerStatusService
    
    try:
        worker = Worker.objects.get(id=worker_id)
        server = worker.server or (worker.virtual_machine.server if worker.virtual_machine else None)
        
        if not server:
            return {'error': 'No server found'}
        
        service = WorkerStatusService(server)
        results = service.check_all_workers()
        
        # Find this worker in results
        for result in results:
            if result.get('worker_id') == worker_id:
                return result
        
        return {'worker_id': worker_id, 'status': 'not_found'}
        
    except Worker.DoesNotExist:
        return {'error': 'Worker not found'}


@shared_task
def install_worker_async(server_id: str = None, vm_id: str = None, device_id: str = '', user_id: str = ''):
    """Background task to install a worker"""
    from .models import Server, VirtualMachine
    from .services import WorkerStatusService, VMService
    
    try:
        if vm_id:
            vm = VirtualMachine.objects.get(id=vm_id)
            service = VMService(vm.server)
            return service.install_worker_on_vm(vm, device_id, user_id)
        elif server_id:
            server = Server.objects.get(id=server_id)
            service = WorkerStatusService(server)
            return service.install_new_worker(device_id, user_id)
        else:
            return {'error': 'No server or VM specified'}
            
    except (Server.DoesNotExist, VirtualMachine.DoesNotExist) as e:
        return {'error': str(e)}


@shared_task
def create_vm_async(
    server_id: str,
    name: str,
    vcpus: int = 2,
    ram_mb: int = 2048,
    disk_gb: int = 10,
    vm_username: str = 'vmadm',
    vm_password: str = 'vmadm',
    ip_address: str = None
):
    """Background task to create a VM"""
    from .models import Server
    from .services import VMService
    
    try:
        server = Server.objects.get(id=server_id)
        service = VMService(server)
        return service.create_vm(
            name=name,
            vcpus=vcpus,
            ram_mb=ram_mb,
            disk_gb=disk_gb,
            vm_username=vm_username,
            vm_password=vm_password,
            ip_address=ip_address,
        )
    except Server.DoesNotExist:
        return {'error': 'Server not found'}

