"""
URL configuration for ionetTool project.
"""
from django.contrib import admin
from django.urls import path, include
from .views import (
    add_server,
    setup_virtual_machine,
    start_new_worker,
    reset_containers_images,
    check_status_worker,
    restart_server
)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # New Workers API
    path('api/', include('workers.urls')),
    
    # Legacy endpoints (kept for backwards compatibility)
    path('add-server/', add_server, name='add_server'),
    path('start-new-worker/', start_new_worker, name='start_new_worker'),
    path('reset-containers-images/', reset_containers_images, name='reset_containers_images'),
    path('check-status-worker/', check_status_worker, name='check_status_worker'),
    path('restart-server/', restart_server, name='restart_server'),
    path('setup-virtual-machine/', setup_virtual_machine, name='setup_virtual_machine'),
]
