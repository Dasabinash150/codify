# JitCoder / Codify Project Action Checklist

This checklist is based on the uploaded project zip and is written as a practical file-by-file improvement plan.

---

## 1) Critical repo cleanup

### Files/folders to remove from version control
- `codify/codify/.env.local`
- `codify/codify/.env.production`
- `codify/codify/db.sqlite3`
- `codify/codify/staticfiles/`
- `frontend/node_modules/`
- `frontend/my-app/dist/` if generated later
- `codifyenv/`
- `.git/` should never be inside a shared zip for review

### Update `.gitignore`
**File:** `.gitignore`

Add these lines if missing:

```gitignore
# Secrets
.env
.env.*
!.env.example

# Local DB / generated
*.sqlite3
staticfiles/
dist/
node_modules/

# Virtual env
codifyenv/
.venv/
venv/

# Project noise
.qodo/
.pytest_cache/
__pycache__/
```

### Action
After updating `.gitignore`, untrack already-committed generated files:

```bash
git rm -r --cached codify/codify/.env.local codify/codify/.env.production codify/codify/db.sqlite3 codify/codify/staticfiles frontend/node_modules codifyenv
```

---

## 2) Environment and deployment hardening

### Problems found
- `codify/codify/settings.py` loads `.env.local` and `.env.production` directly from repo.
- Redis is hardcoded to `127.0.0.1`.
- `TIME_ZONE` and `CELERY_TIMEZONE` are inconsistent.
- `build.sh` is too minimal.

### Fix `settings.py`
**File:** `codify/codify/settings.py`

### Replace direct env-file loading with safer fallback
Current project behavior loads repo-stored env files directly. Better pattern:

```python
BASE_DIR = Path(__file__).resolve().parent.parent
ENVIRONMENT = os.getenv("ENVIRONMENT", "local")

if ENVIRONMENT == "production":
    load_dotenv(BASE_DIR / ".env.production", override=False)
else:
    load_dotenv(BASE_DIR / ".env.local", override=False)
```

But best practice is:
- keep `.env.local` only on local machine
- keep production secrets only in Render environment variables
- do not commit either file

### Use consistent timezone
Change:

```python
TIME_ZONE = 'UTC'
CELERY_TIMEZONE = 'Asia/Kolkata'
```

To:

```python
TIME_ZONE = 'Asia/Kolkata'
USE_TZ = True
CELERY_TIMEZONE = 'Asia/Kolkata'
```

### Make Redis configurable
Replace:

```python
CELERY_BROKER_URL = "redis://127.0.0.1:6379/0"
CELERY_RESULT_BACKEND = "redis://127.0.0.1:6379/1"
```

With:

```python
REDIS_URL = os.getenv("REDIS_URL", "redis://127.0.0.1:6379/0")
CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", REDIS_URL)
CELERY_RESULT_BACKEND = os.getenv("CELERY_RESULT_BACKEND", REDIS_URL)
```

And replace channel layer host config with env-driven config:

```python
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [os.getenv("REDIS_URL", "redis://127.0.0.1:6379/0")],
        },
    },
}
```

### Add production security settings
Inside the production branch, add or strengthen:

```python
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_SSL_REDIRECT = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"
```

---

## 3) Improve build and deploy process

### Fix build script
**File:** `codify/build.sh`

Current:

```bash
#!/usr/bin/env bash
pip install -r requirements.txt
python manage.py migrate
```

Recommended:

```bash
#!/usr/bin/env bash
set -e
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py check --deploy
```

### Check `requirements.txt`
**File:** `codify/requirements.txt`

Save it as plain UTF-8. If Render ever fails reading it, resave from editor as UTF-8 without weird encoding.

Also review duplicate Postgres drivers. Keep only what you actually use.

---

## 4) Fix custom user model for Django compatibility

### Problem found
**File:** `codify/account/models.py`

Your user extends `AbstractBaseUser` only. It works, but Django auth/admin compatibility is better with `PermissionsMixin`.

### Recommended change
Use:

```python
from django.contrib.auth.models import BaseUserManager, AbstractBaseUser, PermissionsMixin

class User(AbstractBaseUser, PermissionsMixin):
```

This makes permission handling more standard.

### Optional cleanup
Remove the second repeated `from django.db import models` line from the same file.

---

## 5) Fix serializer issues in account app

### Problem found
**File:** `codify/account/serializers.py`

There is an incorrect import:

```python
from xml.dom import ValidationErr
```

This should be removed.

### Action
Use only DRF validation errors:

```python
from rest_framework import serializers
```

Then raise:

```python
raise serializers.ValidationError("message")
```

### Also improve password reset URL construction
Wherever you build reset URLs, make frontend URL env-based:

```python
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
```

Then build links from that.

---

## 6) Lock down write permissions

### Problem found
**File:** `codify/contest/views.py`

These viewsets use `IsAuthenticatedOrReadOnly`:
- `ProblemViewSet`
- `TestCaseViewSet`
- `ContestViewSet`
- `ContestProblemViewSet`
- `LeaderboardViewSet`

That means any logged-in user may be able to write to resources that should be admin-only.

### Fix
Create a custom permission.

**New file suggestion:** `codify/contest/permissions.py`

```python
from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)
```

Then update `contest/views.py`:

```python
from .permissions import IsAdminOrReadOnly
```

Use:

```python
permission_classes = [IsAdminOrReadOnly]
```

For write-protected resources.

### Suggested permission mapping
- Problems: admin write, public read
- TestCases: admin write, authenticated or public sample read only
- Contests: admin write, public read
- ContestProblem: admin write, public read
- Leaderboard: read-only for everyone
- Submission: authenticated users only; users should not see everyone’s submissions unless admin

---

## 7) Hide private test cases

### High-priority security issue
**Files:**
- `codify/contest/serializers.py`
- `codify/contest/views.py`
- `codify/contest/models.py`
- `codify/judge/views.py`
- `codify/judge/tasks.py`

### Problem
`TestCaseSerializer` exposes all fields:

```python
class TestCaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestCase
        fields = "__all__"
```

And `TestCaseViewSet` exposes all test cases.

That leaks hidden judge inputs and expected outputs.

### Recommended model improvement
If not already present, ensure `TestCase` has a sample/private flag.

Example field:

```python
is_sample = models.BooleanField(default=False)
```

### Split serializers
**In `contest/serializers.py`**

```python
class PublicTestCaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestCase
        fields = ["id", "problem", "input", "expected_output", "is_sample"]
```

Only expose sample cases through public API.

### Restrict queryset
**In `contest/views.py`**

```python
class TestCaseViewSet(viewsets.ModelViewSet):
    serializer_class = PublicTestCaseSerializer

    def get_queryset(self):
        qs = TestCase.objects.all().order_by("id")
        problem_id = self.request.query_params.get("problem")
        if problem_id:
            qs = qs.filter(problem_id=problem_id)
        return qs.filter(is_sample=True)
```

### Judge should still use private cases internally
`judge/views.py` and `judge/tasks.py` can continue querying all DB testcases internally.

---

## 8) Fix problem tags mismatch

### Problem found
Frontend expects tags as array, but backend stores string.

**Relevant files:**
- `codify/contest/models.py`
- `codify/contest/serializers.py`
- `frontend/my-app/src/pages/ProblemsPage.jsx`
- `frontend/my-app/src/pages/ProblemDetailPage.jsx`

### Better short-term fix
Keep DB field as text, but serialize as array.

**In `contest/serializers.py`:**

```python
class ProblemSerializer(serializers.ModelSerializer):
    tags = serializers.SerializerMethodField()

    class Meta:
        model = Problem
        fields = "__all__"

    def get_tags(self, obj):
        if not obj.tags:
            return []
        return [tag.strip() for tag in obj.tags.split(",") if tag.strip()]
```

This will immediately fix frontend `Array.isArray(problem.tags)` usage.

---

## 9) Fix API contract and base URL usage in frontend

### Problems found
**Files:**
- `frontend/my-app/src/services/problemApi.js`
- `frontend/my-app/src/services/contestApi.js`
- `frontend/my-app/src/pages/ContestDetailsPage.jsx`
- `frontend/my-app/src/pages/LeaderboardPage.jsx`
- `frontend/my-app/src/hooks/useContestSocket.js`

You are mixing:
- env-based base URL
- hardcoded localhost URLs
- duplicated `/api` prefixes
- raw `fetch` and `axios` together

### Example problem
`problemApi.js` sets:

```js
baseURL: BASE_URL
```

Where `BASE_URL` is already like `http://127.0.0.1:8000/api`

But then calls:

```js
api.get("/api/problems/")
```

This can produce `/api/api/problems/`.

### Fix structure
Use one shared API client.

**File:** `frontend/my-app/src/api.js`

```js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### Then update service files
**File:** `frontend/my-app/src/services/problemApi.js`

```js
import api from "../api";

export const getProblems = () => api.get("/problems/");
export const getProblemById = (id) => api.get(`/problems/${id}/`);
export const getProblemTestCases = (id) => api.get(`/testcases/?problem=${id}`);
export const runProblemCode = (payload) => api.post("/run-code/", payload);
export const submitProblemCode = (payload) => api.post("/submit-code/", payload);
```

**File:** `frontend/my-app/src/services/contestApi.js`

```js
import api from "../api";

export const getContests = () => api.get("/contests/");
export const getContestById = (id) => api.get(`/contests/${id}/`);
export const joinContest = (id) => api.post(`/contests/${id}/join/`);
```

### Remove hardcoded localhost from pages
**File:** `frontend/my-app/src/pages/ContestDetailsPage.jsx`

Remove:

```js
const API_BASE_URL = "http://127.0.0.1:8000/api";
```

And stop using raw `fetch` for this page. Use service functions or `api` instance.

---

## 10) Fix WebSocket event shape mismatch

### Problems found
**Files:**
- `codify/contest/consumers.py`
- `codify/judge/websocket.py`
- `frontend/my-app/src/hooks/useContestSocket.js`
- `frontend/my-app/src/pages/ContestDetailsPage.jsx`
- `frontend/my-app/src/pages/LeaderboardPage.jsx`
- `frontend/my-app/src/pages/ContestEditorPage.jsx`

Backend and frontend are not speaking the same event format.

### Target contract
Standardize all websocket payloads to:

```json
{
  "event": "leaderboard_update",
  "data": { ... }
}
```

### Backend fix
**In `judge/websocket.py`**, make helper functions send consistent payloads.

Example pattern:

```python
def broadcast_leaderboard(contest_id, leaderboard_data):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"contest_{contest_id}",
        {
            "type": "leaderboard_event",
            "data": {
                "event": "leaderboard_update",
                "data": leaderboard_data,
            },
        },
    )
```

Do the same for:
- submission update
- participant count

### Consumer fix
**In `contest/consumers.py`**, add handlers for all event types and always send `event["data"]`.

Example:

```python
async def leaderboard_event(self, event):
    await self.send(text_data=json.dumps(event["data"]))

async def submission_event(self, event):
    await self.send(text_data=json.dumps(event["data"]))

async def participant_count_event(self, event):
    await self.send(text_data=json.dumps(event["data"]))
```

### Frontend fix
Make `useContestSocket` assume one consistent shape:

```js
if (msg.event === "leaderboard_update") { ... }
if (msg.event === "submission_update") { ... }
if (msg.event === "participant_count") { ... }
```

---

## 11) Move judge logic out of views

### Problem found
**File:** `codify/judge/tasks.py`

It imports helper logic from `judge/views.py`:

```python
from .views import run_single_testcase, compare_output, get_submission_status
```

That creates bad coupling between API layer and worker layer.

### Fix
Move judge helpers into `judge/services.py` or `judge/utils.py`.

### Suggested structure
- `judge/services.py`: external Judge0 HTTP calls
- `judge/utils.py`: compare output, verdict mapping, language map
- `judge/tasks.py`: Celery orchestration only
- `judge/views.py`: API endpoints only

### Concrete action
Move these functions out of `views.py`:
- `compare_output`
- `get_submission_status`
- `run_single_testcase`

Then import them from `services.py` or `utils.py` in both `views.py` and `tasks.py`.

---

## 12) Fix leaderboard calculation logic

### High-priority correctness issue
**File:** `codify/judge/tasks.py`

Current logic updates leaderboard with only the latest submission score:

```python
leaderboard_obj.score = score
leaderboard_obj.solved = solved_now
```

That is incorrect for coding contests.

### Correct approach
Leaderboard should reflect the user’s **best result per problem**, not just latest submission.

### Recommended logic
1. Fetch all submissions for the same user + contest.
2. Group by `problem_id`.
3. Keep best score per problem.
4. Sum total score.
5. `solved = number of problems with best score > 0`
6. Re-rank all leaderboard rows for the contest.

### You already have a better version commented in the file
Restore that approach and clean it up.

### Add atomicity if needed
Wrap leaderboard recomputation in transaction for safer concurrent updates.

---

## 13) Separate run-code and judge submission behavior

### Problem found
**File:** `codify/judge/views.py`

`run_code` currently executes against all problem testcases, including expected outputs in response.

That is not ideal product behavior.

### Better API split
- `run-code/`: run on custom input or sample tests only
- `submit-code/`: run against hidden tests and store verdict
- `submit-contest/`: submit all contest answers together

### Recommended immediate change
For `run_code`, use only sample testcases:

```python
testcases = TestCase.objects.filter(problem=problem, is_sample=True).order_by("id")
```

And for hidden evaluation, use `submit-code` or Celery task.

---

## 14) Fix contest join and access logic

### Relevant files
- `codify/contest/views.py`
- `frontend/my-app/src/pages/ContestDetailsPage.jsx`
- `frontend/my-app/src/pages/ContestEditorPage.jsx`

### Improvements
- Block joining ended contests.
- Allow `Enter Contest` only if joined.
- Validate on backend too, not just frontend.
- Ensure contest detail serializer always returns `joined` reliably.

### Good existing part
`ContestSerializer.get_joined()` is already a good start.

### Suggested backend checks
In join endpoint:
- if ended → reject
- if already joined → return success with existing state
- if upcoming/live → allow

---

## 15) Improve submission privacy and queryset filtering

### Problem found
**File:** `codify/contest/views.py`

`SubmissionViewSet` currently exposes all submissions ordered by date.

That can leak other users’ code.

### Fix
For normal users, only return their own submissions.

```python
class SubmissionViewSet(viewsets.ModelViewSet):
    serializer_class = SubmissionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Submission.objects.all().order_by("-submitted_at")
        return Submission.objects.filter(user=user).order_by("-submitted_at")
```

---

## 16) Add frontend route fallback and better page resilience

### Relevant files
- `frontend/my-app/src/App.jsx`
- `frontend/my-app/src/pages/*`

### Add
- 404 page
- loading skeletons or spinners
- reusable error state component
- consistent `try/catch/finally` API handling

### Route fallback
In `App.jsx`, add a final route:

```jsx
<Route path="*" element={<NotFoundPage />} />
```

---

## 17) Strengthen frontend theme consistency

### Relevant files
- `frontend/my-app/src/styles/*.css`
- dashboard, problems, leaderboard, editor pages

### Problem
You already have theme variables, but some pages still rely on Bootstrap light-mode utility classes.

### Action
Replace hardcoded utilities like:
- `bg-light`
- `bg-white`
- `text-dark`
- low-contrast table styles

With theme-aware custom classes using CSS variables.

This is especially important for:
- tags
- cards
- tables
- editor sidebars
- leaderboard rows

---

## 18) Clean project structure in frontend

### Problem found
Project has both:
- `frontend/package.json`
- `frontend/my-app/package.json`

### Action
Keep one frontend app root only.

Recommended:
- use `frontend/my-app/` as the real app root
- remove stray duplicate frontend-level package files if unused

This reduces confusion in build commands and deployment.

---

## 19) Add stronger tests around real bugs you already hit

### Relevant test files already exist
- `codify/contest/tests/test_contest_api.py`
- `codify/contest/tests/test_leaderboard_api.py`
- `codify/judge/tests/test_run_code.py`
- `codify/judge/tests/test_submit_contest.py`
- `codify/judge/tests/test_websocket.py`

### Add tests for
1. hidden testcase is never returned publicly
2. non-admin cannot create/edit problems
3. leaderboard uses best submission, not latest submission
4. contest join rejects ended contest
5. websocket sends `event` + `data` format consistently
6. service URLs do not duplicate `/api/api`

---

## 20) Recommended priority order

### Phase 1: must do now
1. remove secrets/generated files from repo
2. fix `.gitignore`
3. unify frontend API client
4. remove hardcoded localhost URLs
5. hide private testcases
6. restrict write permissions
7. fix websocket payload shape
8. fix leaderboard scoring logic

### Phase 2: should do next
1. move judge helpers from views to services/utils
2. make Redis env-based
3. fix timezone consistency
4. limit submission visibility
5. improve build script

### Phase 3: polish
1. add 404 page and shared error components
2. improve dark theme consistency
3. submission history UI
4. server-synced timers
5. richer dashboard stats

---

## 21) Final assessment

### Current state
The project is already a strong portfolio base because it includes:
- custom auth
- contests
- problems/testcases
- judge integration
- leaderboard
- WebSocket attempt
- theme work
- deployment setup

### What holds it back
- security leaks around testcase exposure
- inconsistent frontend API usage
- websocket contract mismatch
- scoreboard correctness issue
- repo hygiene and deployment hygiene

### Outcome after fixes
If you complete the Phase 1 items well, the project will become much more credible as:
- a real interview project
- a deployable student coding platform MVP
- a good base for async judging and live contest features

