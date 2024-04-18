"""
URL configuration for ionetTool project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from .views import (
    add_server,
    start_new_worker,
    reset_containers_images,
    check_status_worker,
    restart_server
)

urlpatterns = [
    path('add-server/', add_server, name='add_server'),
    path('start-new-worker/', start_new_worker, name='start_new_worker'),
    path('reset-containers-images/', reset_containers_images, name='reset_containers_images'),
    path('check-status-worker/', check_status_worker, name='check_status_worker'),
    path('restart-server/', restart_server, name='restart_server'),
]