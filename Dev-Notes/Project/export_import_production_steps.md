# Export Local Data and Import to Production (Django)

This guide explains how to move your **local database data** to **production** safely.

It covers:

- Export from local SQLite
- Import into PostgreSQL production database
- Verify migrated data
- Common mistakes to avoid

---

## Scenario

Typical setup:

- **Local**: SQLite
- **Production**: PostgreSQL

Example:

- Local DB: `db.sqlite3`
- Production DB: PostgreSQL on Render / cloud

---

## Recommended Method

Use Django data export/import commands:

- `dumpdata` → export data
- `loaddata` → import data

This is safer than manually copying tables between different database engines.

---

# 1. Check Local Project is Working

Run:

```bash
python manage.py showmigrations
python manage.py check
```

Make sure:

- no migration errors
- local database is working
- all data is present locally

---

# 2. Create Fresh Backup of Local SQLite Database

Before export, keep a backup:

```bash
copy db.sqlite3 db_backup.sqlite3
```

PowerShell alternative:

```powershell
Copy-Item db.sqlite3 db_backup.sqlite3
```

---

# 3. Export Data from Local Database

## Option A — Export Full Database Data

```bash
python manage.py dumpdata --indent 2 > data.json
```

This exports all app data into `data.json`.

---

## Option B — Better Export Without Django System Data

Recommended:

```bash
python manage.py dumpdata ^
  --exclude auth.permission ^
  --exclude contenttypes ^
  --exclude admin.logentry ^
  --indent 2 > data.json
```

PowerShell single line:

```powershell
python manage.py dumpdata --exclude auth.permission --exclude contenttypes --exclude admin.logentry --indent 2 > data.json
```

This avoids common production import conflicts.

---

# 4. Verify Export File

Check file exists:

```bash
dir data.json
```

Open and verify it contains records.

You should see objects like:

- users
- contests
- problems
- testcases
- submissions
- leaderboard rows

---

# 5. Push Code to Production First

Before importing data, production must already have:

- latest code
- latest models
- latest migrations applied

Run in production environment:

```bash
python manage.py migrate
```

If using Render shell or server shell, run migration there first.

---

# 6. Configure Production Database

Production should use PostgreSQL in `settings.py`.

Typical pattern:

```python
import dj_database_url
import os

DATABASES = {
    "default": dj_database_url.parse(os.getenv("DATABASE_URL"))
}
```

For local development, keep SQLite fallback if needed.

Example hybrid setup:

```python
import os
from pathlib import Path
import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent

if os.getenv("DATABASE_URL"):
    DATABASES = {
        "default": dj_database_url.parse(os.getenv("DATABASE_URL"), conn_max_age=600)
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }
```

---

# 7. Open Production Shell

Examples:

## Render shell

Open Render dashboard → Web Service → Shell

Then run commands there.

## VPS / server

```bash
ssh your-server
cd your-project-folder
source venv/bin/activate
```

Windows local PostgreSQL test:

```bash
python manage.py shell
```

---

# 8. Upload `data.json` to Production

You must place `data.json` inside production project directory.

Possible ways:

- Git ignore-safe manual upload
- SCP
- temporary commit not recommended for sensitive data
- copy/paste in shell editor if file is small

Best practice:

- do **not** commit real production data to GitHub

---

# 9. Import Data into Production

Run:

```bash
python manage.py loaddata data.json
```

If successful, Django will show installed object count.

---

# 10. Import Order Note

If `loaddata` fails because of dependency order or custom users, use app-wise export/import.

Example export:

```bash
python manage.py dumpdata account --indent 2 > account_data.json
python manage.py dumpdata contest --indent 2 > contest_data.json
```

Then import in order:

```bash
python manage.py loaddata account_data.json
python manage.py loaddata contest_data.json
```

Recommended order for your project:

```text
account
contest
```

Because contest tables depend on user records.

---

# 11. Verify Imported Data

Run checks in production shell:

```bash
python manage.py shell
```

Then:

```python
from contest.models import Contest, Problem, TestCase, Submission, Leaderboard
from django.contrib.auth import get_user_model

User = get_user_model()

print("Users:", User.objects.count())
print("Contests:", Contest.objects.count())
print("Problems:", Problem.objects.count())
print("TestCases:", TestCase.objects.count())
print("Submissions:", Submission.objects.count())
print("Leaderboard:", Leaderboard.objects.count())
```

Make sure counts match local database.

---

# 12. Verify in Django Admin

Login to production admin and check:

- Users
- Contests
- Problems
- TestCases
- Submissions
- Leaderboard

Also test frontend pages:

- contest list
- contest detail
- problem editor
- leaderboard page

---

# 13. If You Use Media Files Too

`dumpdata` does **not** export uploaded files.

If your project has media, also copy:

```text
media/
```

to production storage.

Examples:

- profile images
- attachments
- problem files

---

# 14. Common Problems

## Problem: `no such table`

Cause:
- migrations not applied in production

Fix:

```bash
python manage.py migrate
```

---

## Problem: duplicate key value violates unique constraint

Cause:
- same data already exists in production

Fix options:

- clear existing data before import
- import only missing tables
- reset production DB if safe

---

## Problem: foreign key constraint fails

Cause:
- dependent tables imported before parent tables

Fix:
- import `account` first
- import `contest` after

---

## Problem: custom user model issues

Cause:
- user table not imported first
- inconsistent auth data

Fix:
- export/import `account` app first
- exclude system tables if needed

---

## Problem: permission/contenttypes conflict

Fix:
Use export command excluding these:

```bash
python manage.py dumpdata --exclude auth.permission --exclude contenttypes --exclude admin.logentry --indent 2 > data.json
```

---

# 15. Safer Production Strategy

Best strategy:

1. deploy code
2. run migrations
3. take DB backup
4. import data
5. verify counts
6. test frontend
7. test admin

---

# 16. Full Copy-Paste Flow

## Local machine

```bash
python manage.py check
python manage.py showmigrations
python manage.py dumpdata --exclude auth.permission --exclude contenttypes --exclude admin.logentry --indent 2 > data.json
```

Backup local DB:

```bash
copy db.sqlite3 db_backup.sqlite3
```

---

## Production shell

Run migrations:

```bash
python manage.py migrate
```

Upload `data.json` into project folder, then run:

```bash
python manage.py loaddata data.json
```

Verify:

```bash
python manage.py shell
```

```python
from contest.models import Contest, Problem, TestCase, Submission, Leaderboard
from django.contrib.auth import get_user_model

User = get_user_model()

print("Users:", User.objects.count())
print("Contests:", Contest.objects.count())
print("Problems:", Problem.objects.count())
print("TestCases:", TestCase.objects.count())
print("Submissions:", Submission.objects.count())
print("Leaderboard:", Leaderboard.objects.count())
```

---

# 17. Best for Your JitCoder Project

For your coding platform, export/import these main areas:

- `account.User`
- `contest.Contest`
- `contest.Problem`
- `contest.TestCase`
- `contest.ContestProblem`
- `contest.ContestRegistration`
- `contest.Submission`
- `contest.Leaderboard`

Your contest data depends heavily on user records, so always ensure users are imported first.

---

# 18. Optional App-Wise Export Commands

## Export users

```bash
python manage.py dumpdata account --indent 2 > account_data.json
```

## Export contest app

```bash
python manage.py dumpdata contest --indent 2 > contest_data.json
```

## Import users first

```bash
python manage.py loaddata account_data.json
```

## Import contest data after

```bash
python manage.py loaddata contest_data.json
```

---

# 19. Final Recommendation

For first migration from local to production:

- use `dumpdata`
- exclude Django system tables
- migrate production first
- import app data carefully
- verify with counts and admin panel

For very large production systems later, prefer direct PostgreSQL backup/restore instead of JSON fixtures.

---
