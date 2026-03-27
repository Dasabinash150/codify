
# devnotes.md — Codify Platform Development Notes

## 1. Project Overview
Codify is a LeetCode-style coding platform.

Backend
- Django
- Django REST Framework
- Django Channels (WebSockets)
- Celery (async judging)
- Redis

Frontend
- React (Vite)
- Monaco Editor

Features
- Contest system
- Run code API
- Submit contest
- Judge system
- Leaderboard
- WebSocket updates

---

# 2. Testing Setup

Install packages

pip install pytest pytest-django pytest-asyncio

Create pytest.ini

[pytest]
DJANGO_SETTINGS_MODULE = codify.settings
python_files = tests.py test_*.py *_tests.py

Run tests

pytest -v

Expected output

5 passed

---

# 3. Test Structure

contest/
 └── tests/
      ├── conftest.py
      ├── test_contest_api.py
      └── test_leaderboard_api.py

judge/
 └── tests/
      ├── test_run_code.py
      ├── test_submit_contest.py
      └── test_websocket.py

---

# 4. APIs Tested

contest list → /api/contests/
leaderboard → /api/leaderboard/<contest_id>/
run code → /api/run-code/
submit contest → /api/submit-contest/
websocket → /ws/contest/<id>/

---

# 5. Common Errors

Import mismatch

Cause
contest/tests.py
contest/tests/

Fix
Remove tests.py

---

Fixture not found

Move fixtures to project root

codify/conftest.py

---

404 in tests

Cause
Hardcoded URLs

Fix
Use reverse()

from django.urls import reverse

reverse("run-code")

---

# 6. WebSocket Test

Example

communicator = WebsocketCommunicator(
    application,
    f"/ws/contest/{contest.id}/"
)

connected, _ = await communicator.connect()
assert connected is True

---

# 7. Security Check

Run

python manage.py check --deploy

Common warnings

SECURE_HSTS_SECONDS
SECURE_SSL_REDIRECT
SESSION_COOKIE_SECURE
CSRF_COOKIE_SECURE
DEBUG=True

---

# 8. Production Security

Add in settings.py

if not DEBUG:
    SECURE_HSTS_SECONDS = 31536000
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True

---

# 9. Environment Variables

Development

.env.local

DEBUG=True
SECRET_KEY=dev-secret

Production

DEBUG=False
SECRET_KEY=long-random-key
DATABASE_URL=postgres-url
REDIS_URL=redis-url

---

# 10. Static Files

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

Use WhiteNoise middleware

---

# 11. Production Database

Use dj_database_url

DATABASES = {
 "default": dj_database_url.config(
     default=os.getenv("DATABASE_URL")
 )
}

---

# 12. Deployment Architecture

Frontend → Vercel
Backend → Render
Database → Render PostgreSQL
Queue → Redis
Worker → Celery

---

# 13. Backend Deploy

Build command

pip install -r requirements.txt
python manage.py collectstatic --noinput
python manage.py migrate

Start command

gunicorn codify.asgi:application -k uvicorn.workers.UvicornWorker

---

# 14. Celery Worker

celery -A codify worker --loglevel=info --pool=solo

---

# 15. Frontend Env

VITE_API_BASE_URL=https://backend-domain/api
VITE_WS_BASE_URL=wss://backend-domain

---

# 16. Deployment Test Checklist

login
contest list
join contest
run code
submit contest
leaderboard
websocket update
celery judge

---

# 17. Git Commit

git add .
git commit -m "test(platform): add pytest coverage"
git push origin dev

Deployment commit

git commit -m "chore(deploy): production settings and security"

---

# 18. Future Improvements

Wrong answer detection
Time limit exceeded detection
Code sandbox security
Real-time leaderboard
Plagiarism detection

---

# 19. Key Learnings

pytest for Django
mocking external APIs
websocket testing
Celery async workflows
secure Django deployment
reverse URL routing
