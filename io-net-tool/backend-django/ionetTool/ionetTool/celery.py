import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ionetTool.settings')

app = Celery('ionetTool')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

# Configure periodic tasks
app.conf.beat_schedule = {
    'check-all-workers-every-minute': {
        'task': 'workers.tasks.check_all_workers_status',
        'schedule': 60.0,  # Every 60 seconds
    },
    'check-all-servers-every-5-minutes': {
        'task': 'workers.tasks.check_all_servers_status',
        'schedule': 300.0,  # Every 5 minutes
    },
}


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f'Request: {self.request!r}')

