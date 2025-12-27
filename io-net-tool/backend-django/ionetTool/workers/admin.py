from django.contrib import admin
from .models import Server, VirtualMachine, Worker, StatusLog


@admin.register(Server)
class ServerAdmin(admin.ModelAdmin):
    list_display = ['name', 'ip_address', 'status', 'last_seen', 'created_at']
    list_filter = ['status']
    search_fields = ['name', 'ip_address']
    readonly_fields = ['id', 'created_at', 'updated_at', 'last_seen', 'cpu_info']


@admin.register(VirtualMachine)
class VirtualMachineAdmin(admin.ModelAdmin):
    list_display = ['name', 'server', 'status', 'ip_address', 'vcpus', 'ram_mb']
    list_filter = ['status', 'server']
    search_fields = ['name', 'ip_address']
    readonly_fields = ['id', 'created_at', 'updated_at', 'last_seen']


@admin.register(Worker)
class WorkerAdmin(admin.ModelAdmin):
    list_display = ['name', 'virtual_machine', 'server', 'status', 'container_id', 'last_seen']
    list_filter = ['status']
    search_fields = ['name', 'container_id', 'device_id']
    readonly_fields = ['id', 'created_at', 'updated_at', 'last_seen']


@admin.register(StatusLog)
class StatusLogAdmin(admin.ModelAdmin):
    list_display = ['entity_type', 'entity_id', 'old_status', 'new_status', 'created_at']
    list_filter = ['entity_type', 'new_status']
    readonly_fields = ['id', 'created_at']

