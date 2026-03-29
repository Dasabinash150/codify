import os
from celery import Celery
from django.conf import settings

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "codify.settings")

app = Celery("codify")

app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()

app.conf.timezone = settings.TIME_ZONE

@app.task(bind=True)
def debug_task(self):
    print(f"Request: {self.request!r}")