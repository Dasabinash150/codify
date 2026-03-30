# Celery + Redis (Memurai) Setup Notes

## 1. Install Redis on Windows (Memurai)

Download Memurai Developer Edition (free):

https://www.memurai.com/download

Start service (Admin PowerShell):

```powershell
net start Memurai
```

Check service status:

```powershell
sc query Memurai
```

Expected:

```
STATE : RUNNING
```

---

## 2. Test Redis Connection

Run CLI:

```powershell
& "C:\Program Files\Memurai\memurai-cli.exe"
```

Then inside CLI:

```
ping
```

Expected output:

```
PONG
```

Exit CLI:

```
exit
```

---

## 3. Django Celery Configuration

Install packages:

```bash
pip install celery redis
```

Add to **settings.py**

```python
CELERY_BROKER_URL = "redis://127.0.0.1:6379/0"
CELERY_RESULT_BACKEND = "redis://127.0.0.1:6379/0"
```

---

## 4. Create Celery App

File: `codify/celery.py`

```python
import os
from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "codify.settings")

app = Celery("codify")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()
```

---

## 5. Load Celery in Django

File: `codify/__init__.py`

```python
from .celery import app as celery_app

__all__ = ("celery_app",)
```

---

## 6. Create Simple Test Task

File: `judge/tasks.py`

```python
from celery import shared_task

@shared_task
def test_task(x, y):
    print("Running test task...")
    return x + y
```

---

## 7. Start Celery Worker

Run from project folder:

```bash
celery -A codify worker -l info --pool=solo
```

Expected startup output:

```
Connected to redis://127.0.0.1:6379/0
celery@<machine-name> ready.
```

---

## 8. Test Celery Task

Open Django shell:

```bash
python manage.py shell
```

Run:

```python
from judge.tasks import test_task

result = test_task.delay(5, 10)
result.get()
```

Expected result:

```
15
```

Celery worker should show:

```
Task judge.tasks.test_task received
Task succeeded
```

---

## 9. Architecture (Coding Platform)

```
React Editor
     ↓
Django API
     ↓
Celery Task
     ↓
Redis (Memurai)
     ↓
Judge0 API
     ↓
Compare TestCases
     ↓
Save Result → Leaderboard
```

---

## 10. Security Note

Do **NOT expose API keys** in logs.

Use `.env` file.

Example:

```python
import os

JUDGE0_API_KEY = os.getenv("JUDGE0_API_KEY")
```

---

## 11. Git Commit

```bash
git add .
git commit -m "feat(celery): add Redis + Celery async task setup and test task"
git push origin dev
```

---
