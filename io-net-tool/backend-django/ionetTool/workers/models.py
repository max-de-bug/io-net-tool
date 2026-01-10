from django.db import models
from django.utils import timezone
import uuid
import logging

logger = logging.getLogger(__name__)


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
    ssh_password = models.TextField()  # Encrypted password stored as text
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
    
    def get_ssh_password(self):
        """Get decrypted SSH password"""
        try:
            from .utils.encryption import decrypt_password
            return decrypt_password(self.ssh_password)
        except Exception as e:
            logger.error(f"Failed to decrypt password for server {self.id}: {e}")
            raise ValueError("Failed to decrypt password. Check ENCRYPTION_KEY setting.")
    
    def set_ssh_password(self, plain_password: str):
        """Set encrypted SSH password"""
        try:
            from .utils.encryption import encrypt_password
            self.ssh_password = encrypt_password(plain_password)
        except Exception as e:
            logger.error(f"Failed to encrypt password for server {self.id}: {e}")
            raise ValueError("Failed to encrypt password. Check ENCRYPTION_KEY setting.")
    
    @property
    def decrypted_password(self):
        """Property to access decrypted password (use get_ssh_password() instead)"""
        return self.get_ssh_password()


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
    vm_password = models.TextField(default='', blank=True)  # Encrypted password stored as text
    
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
    
    def get_vm_password(self):
        """Get decrypted VM password"""
        try:
            from .utils.encryption import decrypt_password
            return decrypt_password(self.vm_password) if self.vm_password else 'vmadm'
        except Exception as e:
            logger.error(f"Failed to decrypt password for VM {self.id}: {e}")
            # Fallback to default if decryption fails (for backward compatibility)
            return 'vmadm'
    
    def set_vm_password(self, plain_password: str):
        """Set encrypted VM password"""
        try:
            from .utils.encryption import encrypt_password
            self.vm_password = encrypt_password(plain_password)
        except Exception as e:
            logger.error(f"Failed to encrypt password for VM {self.id}: {e}")
            raise ValueError("Failed to encrypt password. Check ENCRYPTION_KEY setting.")
    
    def save(self, *args, **kwargs):
        """Override save to encrypt password if provided as plain text"""
        # If password exists and doesn't look encrypted (starts with gAAAAAB), encrypt it
        if self.vm_password and not self.vm_password.startswith('gAAAAAB'):
            try:
                self.set_vm_password(self.vm_password)
            except Exception as e:
                logger.warning(f"Failed to encrypt VM password during save: {e}")
                # Continue with plain password if encryption fails (backward compatibility)
        super().save(*args, **kwargs)


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

