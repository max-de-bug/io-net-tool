from django.db import models
from django.utils import timezone
import uuid


class Server(models.Model):
    """Remote server that hosts VMs and workers"""
    
    STATUS_CHOICES = [
        ('online', 'Online'),
        ('offline', 'Offline'),
        ('connecting', 'Connecting'),
        ('error', 'Error'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    ip_address = models.GenericIPAddressField()
    ssh_username = models.CharField(max_length=128)
    ssh_password = models.CharField(max_length=256)  # In production, use encryption
    ssh_port = models.IntegerField(default=22)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='offline')
    last_seen = models.DateTimeField(null=True, blank=True)
    last_error = models.TextField(blank=True, null=True)
    
    # System info (populated on connection)
    cpu_info = models.JSONField(default=dict, blank=True)
    memory_total = models.BigIntegerField(null=True, blank=True)  # bytes
    disk_total = models.BigIntegerField(null=True, blank=True)    # bytes
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} ({self.ip_address})"


class VirtualMachine(models.Model):
    """KVM/QEMU Virtual Machine running on a server"""
    
    STATUS_CHOICES = [
        ('running', 'Running'),
        ('paused', 'Paused'),
        ('stopped', 'Stopped'),
        ('creating', 'Creating'),
        ('error', 'Error'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    server = models.ForeignKey(Server, on_delete=models.CASCADE, related_name='virtual_machines')
    
    name = models.CharField(max_length=255)
    vm_username = models.CharField(max_length=128, default='vmadm')
    vm_password = models.CharField(max_length=256, default='vmadm')
    
    # VM Configuration
    vcpus = models.IntegerField(default=2)
    ram_mb = models.IntegerField(default=2048)
    disk_gb = models.IntegerField(default=10)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    mac_address = models.CharField(max_length=17, blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='stopped')
    last_seen = models.DateTimeField(null=True, blank=True)
    last_error = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} on {self.server.name}"


class Worker(models.Model):
    """io.net Worker running in a Docker container"""
    
    STATUS_CHOICES = [
        ('running', 'Running'),
        ('paused', 'Paused'),
        ('inactive', 'Inactive'),
        ('failed', 'Failed'),
        ('terminated', 'Terminated'),
        ('unsupported', 'Unsupported'),
        ('blocked', 'Blocked'),
        ('restart_required', 'Restart Required'),
        ('installing', 'Installing'),
        ('unknown', 'Unknown'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    virtual_machine = models.ForeignKey(
        VirtualMachine, 
        on_delete=models.CASCADE, 
        related_name='workers',
        null=True, 
        blank=True
    )
    server = models.ForeignKey(
        Server, 
        on_delete=models.CASCADE, 
        related_name='workers',
        null=True,
        blank=True
    )
    
    name = models.CharField(max_length=255)
    device_id = models.CharField(max_length=255, blank=True)
    user_id = models.CharField(max_length=255, blank=True)
    
    # Docker container info
    container_id = models.CharField(max_length=64, blank=True)
    container_name = models.CharField(max_length=255, blank=True)
    image_name = models.CharField(max_length=255, default='ionetcontainers/io-launch')
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='unknown')
    last_seen = models.DateTimeField(null=True, blank=True)
    last_error = models.TextField(blank=True, null=True)
    
    # Performance metrics
    cpu_usage = models.FloatField(null=True, blank=True)  # percentage
    memory_usage = models.BigIntegerField(null=True, blank=True)  # bytes
    uptime_seconds = models.BigIntegerField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        host = self.virtual_machine or self.server
        return f"{self.name} on {host}"


class StatusLog(models.Model):
    """Log of status changes for audit trail"""
    
    ENTITY_TYPES = [
        ('server', 'Server'),
        ('vm', 'Virtual Machine'),
        ('worker', 'Worker'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    entity_type = models.CharField(max_length=20, choices=ENTITY_TYPES)
    entity_id = models.UUIDField()
    
    old_status = models.CharField(max_length=20)
    new_status = models.CharField(max_length=20)
    message = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.entity_type} {self.entity_id}: {self.old_status} -> {self.new_status}"

