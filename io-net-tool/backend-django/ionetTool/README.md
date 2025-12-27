# io.net Worker Manager - Django Backend

A comprehensive Django backend for managing io.net workers across multiple servers and virtual machines.

## Features

- **Server Management**: Add and monitor remote servers via SSH
- **Virtual Machine Management**: Create, manage, and monitor KVM/QEMU VMs
- **Worker Tracking**: Real-time monitoring of io.net worker containers
- **Background Tasks**: Celery-based periodic status checking
- **Real-time Updates**: WebSocket support for live status updates
- **REST API**: Full CRUD operations for all resources

## Setup

### 1. Install Dependencies

```bash
cd backend-django
pip install -r requirements.txt
```

### 2. Database Setup

```bash
cd ionetTool
python manage.py makemigrations workers
python manage.py migrate
python manage.py createsuperuser
```

### 3. Run Development Server

```bash
# Using Daphne (recommended for WebSocket support)
daphne -b 0.0.0.0 -p 8000 ionetTool.asgi:application

# Or using Django's development server (no WebSocket)
python manage.py runserver
```

### 4. Run Celery Worker (for background tasks)

```bash
# Start Redis first (required for Celery)
redis-server

# Run Celery worker
celery -A ionetTool worker -l INFO

# Run Celery beat (for scheduled tasks)
celery -A ionetTool beat -l INFO
```

## API Endpoints

### Dashboard
- `GET /api/dashboard/stats/` - Get dashboard statistics

### Servers
- `GET /api/servers/` - List all servers
- `POST /api/servers/` - Add a new server
- `GET /api/servers/{id}/` - Get server details
- `DELETE /api/servers/{id}/` - Delete a server
- `POST /api/servers/{id}/check_status/` - Check server status
- `POST /api/servers/{id}/check_workers/` - Check workers on server
- `POST /api/servers/{id}/setup_virtualization/` - Setup KVM/QEMU
- `POST /api/servers/{id}/download_base_image/` - Download Ubuntu base image

### Virtual Machines
- `GET /api/vms/` - List all VMs
- `POST /api/vms/` - Create a new VM
- `GET /api/vms/{id}/` - Get VM details
- `DELETE /api/vms/{id}/remove/` - Delete a VM
- `POST /api/vms/{id}/start/` - Start VM
- `POST /api/vms/{id}/stop/` - Stop VM
- `POST /api/vms/{id}/install_worker/` - Install io.net worker on VM

### Workers
- `GET /api/workers/` - List all workers
- `GET /api/workers/{id}/` - Get worker details
- `POST /api/workers/{id}/start/` - Start worker container
- `POST /api/workers/{id}/stop/` - Stop worker container
- `POST /api/workers/{id}/restart/` - Restart worker container
- `GET /api/workers/{id}/logs/` - Get container logs

### Bulk Operations
- `POST /api/check-all/` - Check all servers and workers
- `POST /api/install-worker/` - Install new worker

## WebSocket

Connect to `ws://localhost:8000/ws/status/` for real-time updates.

### Message Types
- `initial_data` - Sent on connection with current stats
- `status_update` - Sent when a status changes

### Actions
Send JSON messages to trigger actions:
```json
{"action": "refresh"}
{"action": "check_status", "server_id": "uuid"}
```

## Models

### Server
- SSH connection details
- System info (CPU, memory, disk)
- Status tracking

### VirtualMachine
- KVM/QEMU VM configuration
- Resource allocation (vCPUs, RAM, disk)
- Network settings

### Worker
- Docker container info
- io.net worker configuration
- Performance metrics

### StatusLog
- Audit trail of all status changes

## Environment Variables

- `DJANGO_SECRET_KEY` - Django secret key
- `DEBUG` - Enable debug mode
- `CELERY_BROKER_URL` - Redis URL for Celery
- `CELERY_RESULT_BACKEND` - Redis URL for Celery results

