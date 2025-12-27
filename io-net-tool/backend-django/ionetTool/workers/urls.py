from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'servers', views.ServerViewSet)
router.register(r'vms', views.VirtualMachineViewSet)
router.register(r'workers', views.WorkerViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/stats/', views.dashboard_stats, name='dashboard-stats'),
    path('status-logs/', views.status_logs, name='status-logs'),
    path('check-all/', views.check_all_status, name='check-all-status'),
    path('install-worker/', views.install_worker, name='install-worker'),
]

