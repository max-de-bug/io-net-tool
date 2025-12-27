from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import Server, VirtualMachine, Worker, StatusLog
from .serializers import (
    ServerSerializer, ServerCreateSerializer,
    VirtualMachineSerializer, VMCreateSerializer,
    WorkerSerializer, WorkerInstallSerializer,
    StatusLogSerializer, DashboardStatsSerializer,
)
from .services import SSHService, WorkerStatusService, VMService


class ServerViewSet(viewsets.ModelViewSet):
    """API endpoints for server management"""
    queryset = Server.objects.all()
    serializer_class = ServerSerializer
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ServerCreateSerializer
        return ServerSerializer
    
    def create(self, request):
        serializer = ServerCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        server = serializer.save()
        
        # Test connection
        service = WorkerStatusService(server)
        result = service.check_server_status()
        
        return Response({
            'server': ServerSerializer(server).data,
            'connection': result,
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def check_status(self, request, pk=None):
        """Check server status and update info"""
        server = self.get_object()
        service = WorkerStatusService(server)
        result = service.check_server_status()
        
        return Response({
            'server': ServerSerializer(server).data,
            'status_check': result,
        })
    
    @action(detail=True, methods=['post'])
    def check_workers(self, request, pk=None):
        """Check all workers on this server"""
        server = self.get_object()
        service = WorkerStatusService(server)
        results = service.check_all_workers()
        
        return Response({
            'server': ServerSerializer(server).data,
            'workers': results,
        })
    
    @action(detail=True, methods=['post'])
    def setup_virtualization(self, request, pk=None):
        """Install KVM/QEMU virtualization on server"""
        server = self.get_object()
        service = VMService(server)
        result = service.setup_virtualization()
        
        return Response(result)
    
    @action(detail=True, methods=['post'])
    def download_base_image(self, request, pk=None):
        """Download Ubuntu base image for VMs"""
        server = self.get_object()
        service = VMService(server)
        result = service.download_base_image()
        
        return Response(result)
    
    @action(detail=True, methods=['get'])
    def vms(self, request, pk=None):
        """Get all VMs on this server"""
        server = self.get_object()
        vms = server.virtual_machines.all()
        return Response(VirtualMachineSerializer(vms, many=True).data)
    
    @action(detail=True, methods=['get'])
    def workers(self, request, pk=None):
        """Get all workers on this server (direct, not in VMs)"""
        server = self.get_object()
        workers = server.workers.all()
        return Response(WorkerSerializer(workers, many=True).data)


class VirtualMachineViewSet(viewsets.ModelViewSet):
    """API endpoints for VM management"""
    queryset = VirtualMachine.objects.all()
    serializer_class = VirtualMachineSerializer
    
    def create(self, request):
        serializer = VMCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        
        server = get_object_or_404(Server, id=data['server_id'])
        service = VMService(server)
        
        result = service.create_vm(
            name=data['name'],
            vcpus=data.get('vcpus', 2),
            ram_mb=data.get('ram_mb', 2048),
            disk_gb=data.get('disk_gb', 10),
            vm_username=data.get('vm_username', 'vmadm'),
            vm_password=data.get('vm_password', 'vmadm'),
            ip_address=data.get('ip_address'),
        )
        
        if result['success']:
            vm = VirtualMachine.objects.get(id=result['vm_id'])
            return Response({
                'vm': VirtualMachineSerializer(vm).data,
                'result': result,
            }, status=status.HTTP_201_CREATED)
        else:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        """Start VM"""
        vm = self.get_object()
        service = VMService(vm.server)
        result = service.start_vm(vm)
        
        return Response({
            'vm': VirtualMachineSerializer(vm).data,
            'result': result,
        })
    
    @action(detail=True, methods=['post'])
    def stop(self, request, pk=None):
        """Stop VM"""
        vm = self.get_object()
        service = VMService(vm.server)
        result = service.stop_vm(vm)
        
        return Response({
            'vm': VirtualMachineSerializer(vm).data,
            'result': result,
        })
    
    @action(detail=True, methods=['post'])
    def destroy(self, request, pk=None):
        """Force stop VM"""
        vm = self.get_object()
        service = VMService(vm.server)
        result = service.destroy_vm(vm)
        
        return Response({
            'vm': VirtualMachineSerializer(vm).data,
            'result': result,
        })
    
    @action(detail=True, methods=['delete'])
    def remove(self, request, pk=None):
        """Delete VM completely"""
        vm = self.get_object()
        service = VMService(vm.server)
        result = service.delete_vm(vm)
        
        return Response(result)
    
    @action(detail=True, methods=['post'])
    def install_worker(self, request, pk=None):
        """Install io.net worker on this VM"""
        vm = self.get_object()
        device_id = request.data.get('device_id')
        user_id = request.data.get('user_id')
        
        if not device_id or not user_id:
            return Response(
                {'error': 'device_id and user_id are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        service = VMService(vm.server)
        result = service.install_worker_on_vm(vm, device_id, user_id)
        
        return Response(result)
    
    @action(detail=True, methods=['get'])
    def workers(self, request, pk=None):
        """Get all workers on this VM"""
        vm = self.get_object()
        workers = vm.workers.all()
        return Response(WorkerSerializer(workers, many=True).data)


class WorkerViewSet(viewsets.ModelViewSet):
    """API endpoints for worker management"""
    queryset = Worker.objects.all()
    serializer_class = WorkerSerializer
    
    def get_queryset(self):
        queryset = Worker.objects.all()
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by server
        server_id = self.request.query_params.get('server')
        if server_id:
            queryset = queryset.filter(server_id=server_id)
        
        # Filter by VM
        vm_id = self.request.query_params.get('vm')
        if vm_id:
            queryset = queryset.filter(virtual_machine_id=vm_id)
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        """Start worker container"""
        worker = self.get_object()
        server = worker.server or (worker.virtual_machine.server if worker.virtual_machine else None)
        
        if not server:
            return Response({'error': 'No server found'}, status=status.HTTP_400_BAD_REQUEST)
        
        service = WorkerStatusService(server)
        result = service.start_worker(worker)
        
        return Response({
            'worker': WorkerSerializer(worker).data,
            'result': result,
        })
    
    @action(detail=True, methods=['post'])
    def stop(self, request, pk=None):
        """Stop worker container"""
        worker = self.get_object()
        server = worker.server or (worker.virtual_machine.server if worker.virtual_machine else None)
        
        if not server:
            return Response({'error': 'No server found'}, status=status.HTTP_400_BAD_REQUEST)
        
        service = WorkerStatusService(server)
        result = service.stop_worker(worker)
        
        return Response({
            'worker': WorkerSerializer(worker).data,
            'result': result,
        })
    
    @action(detail=True, methods=['post'])
    def restart(self, request, pk=None):
        """Restart worker container"""
        worker = self.get_object()
        server = worker.server or (worker.virtual_machine.server if worker.virtual_machine else None)
        
        if not server:
            return Response({'error': 'No server found'}, status=status.HTTP_400_BAD_REQUEST)
        
        service = WorkerStatusService(server)
        result = service.restart_worker(worker)
        
        return Response({
            'worker': WorkerSerializer(worker).data,
            'result': result,
        })
    
    @action(detail=True, methods=['get'])
    def logs(self, request, pk=None):
        """Get worker container logs"""
        worker = self.get_object()
        server = worker.server or (worker.virtual_machine.server if worker.virtual_machine else None)
        
        if not server:
            return Response({'error': 'No server found'}, status=status.HTTP_400_BAD_REQUEST)
        
        lines = int(request.query_params.get('lines', 100))
        service = WorkerStatusService(server)
        result = service.get_worker_logs(worker, lines)
        
        return Response(result)


@api_view(['GET'])
def dashboard_stats(request):
    """Get dashboard statistics"""
    stats = {
        'total_servers': Server.objects.count(),
        'online_servers': Server.objects.filter(status='online').count(),
        'total_vms': VirtualMachine.objects.count(),
        'running_vms': VirtualMachine.objects.filter(status='running').count(),
        'total_workers': Worker.objects.count(),
        'running_workers': Worker.objects.filter(status='running').count(),
        'failed_workers': Worker.objects.filter(status='failed').count(),
    }
    
    serializer = DashboardStatsSerializer(stats)
    return Response(serializer.data)


@api_view(['GET'])
def status_logs(request):
    """Get recent status logs"""
    limit = int(request.query_params.get('limit', 50))
    entity_type = request.query_params.get('type')
    
    queryset = StatusLog.objects.all()
    if entity_type:
        queryset = queryset.filter(entity_type=entity_type)
    
    logs = queryset[:limit]
    serializer = StatusLogSerializer(logs, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def check_all_status(request):
    """Check status of all servers and their workers"""
    results = []
    
    for server in Server.objects.all():
        service = WorkerStatusService(server)
        server_result = service.check_server_status()
        worker_results = service.check_all_workers()
        
        results.append({
            'server': ServerSerializer(server).data,
            'status_check': server_result,
            'workers': worker_results,
        })
    
    return Response(results)


@api_view(['POST'])
def install_worker(request):
    """Install a new worker on a server or VM"""
    serializer = WorkerInstallSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data
    
    if data.get('vm_id'):
        vm = get_object_or_404(VirtualMachine, id=data['vm_id'])
        service = VMService(vm.server)
        result = service.install_worker_on_vm(vm, data['device_id'], data['user_id'])
    else:
        server = get_object_or_404(Server, id=data['server_id'])
        service = WorkerStatusService(server)
        result = service.install_new_worker(data['device_id'], data['user_id'])
    
    return Response(result)

