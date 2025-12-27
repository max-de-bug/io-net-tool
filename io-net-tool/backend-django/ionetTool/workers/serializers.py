from rest_framework import serializers
from .models import Server, VirtualMachine, Worker, StatusLog


class ServerSerializer(serializers.ModelSerializer):
    workers_count = serializers.SerializerMethodField()
    vms_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Server
        fields = [
            'id', 'name', 'ip_address', 'ssh_username', 'ssh_port',
            'status', 'last_seen', 'last_error',
            'cpu_info', 'memory_total', 'disk_total',
            'workers_count', 'vms_count',
            'created_at', 'updated_at',
        ]
        extra_kwargs = {
            'ssh_password': {'write_only': True},
        }
    
    def get_workers_count(self, obj):
        return obj.workers.count()
    
    def get_vms_count(self, obj):
        return obj.virtual_machines.count()


class ServerCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Server
        fields = ['name', 'ip_address', 'ssh_username', 'ssh_password', 'ssh_port']


class VirtualMachineSerializer(serializers.ModelSerializer):
    server_name = serializers.CharField(source='server.name', read_only=True)
    workers_count = serializers.SerializerMethodField()
    
    class Meta:
        model = VirtualMachine
        fields = [
            'id', 'server', 'server_name', 'name',
            'vm_username', 'vcpus', 'ram_mb', 'disk_gb',
            'ip_address', 'mac_address',
            'status', 'last_seen', 'last_error',
            'workers_count',
            'created_at', 'updated_at',
        ]
        extra_kwargs = {
            'vm_password': {'write_only': True},
        }
    
    def get_workers_count(self, obj):
        return obj.workers.count()


class VMCreateSerializer(serializers.Serializer):
    server_id = serializers.UUIDField()
    name = serializers.CharField(max_length=255)
    vcpus = serializers.IntegerField(default=2, min_value=1, max_value=32)
    ram_mb = serializers.IntegerField(default=2048, min_value=512, max_value=65536)
    disk_gb = serializers.IntegerField(default=10, min_value=5, max_value=500)
    vm_username = serializers.CharField(default='vmadm', max_length=128)
    vm_password = serializers.CharField(default='vmadm', max_length=256)
    ip_address = serializers.IPAddressField(required=False, allow_null=True)


class WorkerSerializer(serializers.ModelSerializer):
    host_name = serializers.SerializerMethodField()
    host_type = serializers.SerializerMethodField()
    
    class Meta:
        model = Worker
        fields = [
            'id', 'name', 'device_id', 'user_id',
            'virtual_machine', 'server',
            'host_name', 'host_type',
            'container_id', 'container_name', 'image_name',
            'status', 'last_seen', 'last_error',
            'cpu_usage', 'memory_usage', 'uptime_seconds',
            'created_at', 'updated_at',
        ]
    
    def get_host_name(self, obj):
        if obj.virtual_machine:
            return obj.virtual_machine.name
        elif obj.server:
            return obj.server.name
        return None
    
    def get_host_type(self, obj):
        if obj.virtual_machine:
            return 'vm'
        elif obj.server:
            return 'server'
        return None


class WorkerInstallSerializer(serializers.Serializer):
    device_id = serializers.CharField(max_length=255)
    user_id = serializers.CharField(max_length=255)
    vm_id = serializers.UUIDField(required=False, allow_null=True)
    server_id = serializers.UUIDField(required=False, allow_null=True)
    
    def validate(self, data):
        if not data.get('vm_id') and not data.get('server_id'):
            raise serializers.ValidationError(
                "Either vm_id or server_id must be provided"
            )
        return data


class StatusLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = StatusLog
        fields = ['id', 'entity_type', 'entity_id', 'old_status', 'new_status', 'message', 'created_at']


class DashboardStatsSerializer(serializers.Serializer):
    total_servers = serializers.IntegerField()
    online_servers = serializers.IntegerField()
    total_vms = serializers.IntegerField()
    running_vms = serializers.IntegerField()
    total_workers = serializers.IntegerField()
    running_workers = serializers.IntegerField()
    failed_workers = serializers.IntegerField()

