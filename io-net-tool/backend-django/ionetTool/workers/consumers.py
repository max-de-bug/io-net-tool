import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
import logging

logger = logging.getLogger(__name__)


class StatusConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for real-time status updates"""
    
    async def connect(self):
        self.room_group_name = 'status_updates'
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        logger.info(f"WebSocket connected: {self.channel_name}")
        
        # Send initial data
        await self.send_initial_data()
    
    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        logger.info(f"WebSocket disconnected: {self.channel_name}")
    
    async def receive(self, text_data):
        """Handle incoming WebSocket messages"""
        try:
            data = json.loads(text_data)
            action = data.get('action')
            
            if action == 'subscribe':
                # Client subscribing to specific entities
                entity_type = data.get('entity_type')
                entity_id = data.get('entity_id')
                logger.info(f"Client subscribed to {entity_type} {entity_id}")
                
            elif action == 'refresh':
                # Client requesting data refresh
                await self.send_initial_data()
                
            elif action == 'check_status':
                # Client requesting immediate status check
                server_id = data.get('server_id')
                if server_id:
                    result = await self.check_server_status(server_id)
                    await self.send(text_data=json.dumps({
                        'type': 'status_check_result',
                        'data': result,
                    }))
                    
        except json.JSONDecodeError:
            logger.error(f"Invalid JSON received: {text_data}")
    
    async def status_update(self, event):
        """Handle status update broadcast"""
        await self.send(text_data=json.dumps({
            'type': 'status_update',
            'data': event['data'],
        }))
    
    async def send_initial_data(self):
        """Send initial dashboard data to client"""
        stats = await self.get_dashboard_stats()
        servers = await self.get_all_servers()
        workers = await self.get_all_workers()
        
        await self.send(text_data=json.dumps({
            'type': 'initial_data',
            'data': {
                'stats': stats,
                'servers': servers,
                'workers': workers,
            }
        }))
    
    @database_sync_to_async
    def get_dashboard_stats(self):
        from .models import Server, VirtualMachine, Worker
        
        return {
            'total_servers': Server.objects.count(),
            'online_servers': Server.objects.filter(status='online').count(),
            'total_vms': VirtualMachine.objects.count(),
            'running_vms': VirtualMachine.objects.filter(status='running').count(),
            'total_workers': Worker.objects.count(),
            'running_workers': Worker.objects.filter(status='running').count(),
            'failed_workers': Worker.objects.filter(status='failed').count(),
        }
    
    @database_sync_to_async
    def get_all_servers(self):
        from .models import Server
        from .serializers import ServerSerializer
        
        servers = Server.objects.all()
        return ServerSerializer(servers, many=True).data
    
    @database_sync_to_async
    def get_all_workers(self):
        from .models import Worker
        from .serializers import WorkerSerializer
        
        workers = Worker.objects.all()[:50]  # Limit to 50 most recent
        return WorkerSerializer(workers, many=True).data
    
    @database_sync_to_async
    def check_server_status(self, server_id):
        from .models import Server
        from .services import WorkerStatusService
        from .serializers import ServerSerializer
        
        try:
            server = Server.objects.get(id=server_id)
            service = WorkerStatusService(server)
            result = service.check_server_status()
            return {
                'server': ServerSerializer(server).data,
                'status_check': result,
            }
        except Server.DoesNotExist:
            return {'error': 'Server not found'}

