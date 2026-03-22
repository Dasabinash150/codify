# Single-Developer Git Guide for a React + Django Project

Project context: solo development for a coding platform with React frontend and Django backend.

---

# 1. Goal

When you work alone, Git should help you do 5 things well:

1. save work safely
2. track features and bug fixes clearly
3. recover old versions fast
4. deploy stable code confidently
5. keep project history clean

For a single-developer project, do **not** use an over-complicated company workflow.  
Use a **clean lightweight workflow**.

---

# 2. Best Simple Git Workflow for a Solo Developer

Use these branches only:

- `main` → always stable / production-ready
- `dev` → daily working branch
- `feature/...` → optional for bigger features
- `hotfix/...` → only when production breaks

## Recommended practical setup

### Small work
Work directly in `dev`

### Large feature
Create:
- `feature/auth`
- `feature/contest`
- `feature/editor`

### Production issue
Create:
- `hotfix/login-bug`

This gives you safety without too much complexity.

---

# 3. Final Branch Strategy

## `main`
Use for:
- deployed code
- stable version
- release tags

Never use `main` for random unfinished coding.

## `dev`
Use for:
- daily coding
- testing
- integration

This is your main working branch.

## `feature/*`
Use only when:
- feature needs multiple files
- feature may take many hours/days
- you want isolation before merging to `dev`

Examples:
- `feature/google-login`
- `feature/problem-submission`
- `feature/leaderboard-ui`

## `hotfix/*`
Use only when:
- live deployed app has urgent issue

Examples:
- `hotfix/register-api-500`
- `hotfix/navbar-crash`

---

# 4. One-Time Initial Setup

## Start repo
```bash
git init
```

## Add remote
```bash
git remote add origin <your-github-repo-url>
```

## Rename default branch to main
```bash
git branch -M main
```

## First commit
```bash
git add .
git commit -m "chore(init): initial project setup"
git push -u origin main
```

## Create dev branch
```bash
git checkout -b dev
git push -u origin dev
```

Now your normal work should happen in `dev`.

---

# 5. Folder Structure Note for Your Project

For React + Django project, keep Git clean with a proper structure like:

```text
codify/
│
├── frontend/
│   └── my-app/
│
├── backend/
│   └── config/
│
├── .gitignore
├── README.md
├── devnotes/
│   ├── setup.md
│   ├── api-notes.md
│   ├── deployment.md
│   ├── bugs-fixed.md
│   └── release-notes.md
```

The `devnotes/` folder is very useful for solo projects.

---

# 6. Daily Git Workflow (Best Practical Routine)

This is the best routine for you.

## Step 1: Switch to dev
```bash
git checkout dev
```

## Step 2: Pull latest code
```bash
git pull origin dev
```

Even if you are solo, this is a good habit.

## Step 3: Do your work
Examples:
- build login
- fix API
- add leaderboard
- update UI

## Step 4: Check changed files
```bash
git status
```

## Step 5: Add only needed files
```bash
git add .
```

Better for more control:
```bash
git add frontend/my-app/src/pages/Login.jsx
git add backend/app/views.py
```

## Step 6: Commit with clear message
```bash
git commit -m "feat(auth): add email login flow"
```

## Step 7: Push to GitHub
```bash
git push origin dev
```

That is your normal daily cycle.

---

# 7. Workflow for a Big Feature

When a feature is large, do this.

## Step 1: Start from dev
```bash
git checkout dev
git pull origin dev
```

## Step 2: Create feature branch
```bash
git checkout -b feature/contest-module
```

## Step 3: Work and commit regularly
```bash
git add .
git commit -m "feat(contest): add contest model and serializer"
```

```bash
git add .
git commit -m "feat(contest): add contest CRUD APIs"
```

```bash
git add .
git commit -m "feat(contest): add contest list page"
```

## Step 4: Push feature branch
```bash
git push -u origin feature/contest-module
```

## Step 5: Merge into dev after testing
```bash
git checkout dev
git merge feature/contest-module
git push origin dev
```

## Step 6: Delete feature branch after merge
```bash
git branch -d feature/contest-module
git push origin --delete feature/contest-module
```

Use this only when needed.  
Do not create too many branches for tiny work.

---

# 8. Workflow for Deployment

When your `dev` branch is tested and stable:

## Step 1: Switch to main
```bash
git checkout main
git pull origin main
```

## Step 2: Merge dev into main
```bash
git merge dev
```

## Step 3: Push main
```bash
git push origin main
```

## Step 4: Create release tag
```bash
git tag -a v1.0.0 -m "Stable release with auth and contest module"
git push origin v1.0.0
```

Now:
- `main` = production version
- `tag` = exact release snapshot

---

# 9. Best Commit Message Format

Use this format:

```text
type(scope): short description
```

## Good examples
```text
feat(auth): add Google login button
fix(api): resolve register endpoint 400 error
docs(deploy): add Render deployment steps
refactor(contest): simplify score calculation
chore(git): update gitignore for env files
style(ui): improve navbar spacing
```

## Types you should use

### `feat`
New feature
```text
feat(profile): add user dashboard stats
```

### `fix`
Bug fix
```text
fix(login): handle invalid token error
```

### `docs`
Notes or documentation
```text
docs(setup): add local setup instructions
```

### `refactor`
Code improvement without changing behavior
```text
refactor(api): clean submission response logic
```

### `chore`
Config, dependency, maintenance
```text
chore(deps): update requirements file
```

### `style`
Formatting/UI polish
```text
style(home): align hero section content
```

---

# 10. Best Commit Rules for a Solo Developer

## Rule 1: Commit small logical changes
Bad:
- one giant commit for everything

Good:
- login API
- navbar UI
- deployment fix
- each in separate commit

## Rule 2: Commit before risky changes
Before:
- refactor
- package updates
- deployment changes
- auth changes

Make a commit first.

## Rule 3: Push daily
Even when solo, do not keep all work only on your laptop.

## Rule 4: Never commit secrets
Never commit:
- `.env`
- API keys
- JWT secrets
- database passwords
- OAuth client secrets

---

# 11. Important .gitignore for Your Project

Example:

```gitignore
# Python
__pycache__/
*.pyc
venv/
env/
codifyenv/

# Django
db.sqlite3
media/
staticfiles/

# Node
node_modules/
dist/
build/

# Environment
.env
.env.local
.env.production

# OS / editor
.DS_Store
Thumbs.db
.vscode/
.idea/
```

---

# 12. When to Commit

Best times to commit:

- after a bug fix
- after a UI section is complete
- after one API is working
- before trying a risky change
- before deployment
- after deployment fix
- after writing config changes

Do **not** wait 2–3 days for one big commit.

---

# 13. Best Version Tagging Style

Use semantic versioning.

## Format
```text
vMAJOR.MINOR.PATCH
```

## Example
```text
v1.0.0
v1.1.0
v1.1.1
v2.0.0
```

## Meaning
- `v1.0.0` → first stable release
- `v1.1.0` → new feature added
- `v1.1.1` → bug fix
- `v2.0.0` → major breaking change

## Create tag
```bash
git tag -a v1.0.0 -m "First stable release"
git push origin v1.0.0
```

---

# 14. How to Roll Back Safely

## See commit history
```bash
git log --oneline
```

## Temporarily check old version
```bash
git checkout <commit-id>
```

## Return back
```bash
git checkout dev
```

## Revert a bad commit safely
```bash
git revert <commit-id>
```

This is safer than rewriting history.

---

# 15. Best Commands You Should Master

## Check branch
```bash
git branch
```

## Switch branch
```bash
git checkout dev
```

## New branch
```bash
git checkout -b feature/editor
```

## Check changes
```bash
git status
```

## See commit history
```bash
git log --oneline --graph --decorate
```

## Compare changes
```bash
git diff
```

## Pull latest
```bash
git pull origin dev
```

## Push current branch
```bash
git push origin dev
```

---

# 16. Best Solo Workflow for Your Coding Platform

Use this exact workflow:

## Normal development
```bash
git checkout dev
git pull origin dev
# do work
git add .
git commit -m "feat(problem): add problem list page"
git push origin dev
```

## Bigger feature
```bash
git checkout dev
git pull origin dev
git checkout -b feature/judge0-integration
# do work
git add .
git commit -m "feat(judge): add Judge0 API integration"
git push -u origin feature/judge0-integration
```

After testing:
```bash
git checkout dev
git merge feature/judge0-integration
git push origin dev
```

## Deployment
```bash
git checkout main
git pull origin main
git merge dev
git push origin main
git tag -a v1.0.0 -m "Stable release"
git push origin v1.0.0
```

---

# 17. Dev Notes System (Very Important for Solo Projects)

Create a folder:

```text
devnotes/
```

Inside it, keep these files:

## `devnotes/setup.md`
Write:
- local setup steps
- frontend start command
- backend start command
- environment variables needed
- common setup issues

## `devnotes/api-notes.md`
Write:
- API endpoints
- request body format
- response format
- auth requirement
- known API issues

## `devnotes/bugs-fixed.md`
Write:
- bug name
- cause
- fix
- date

Example:
```md
## Login 401 error
- Cause: access token not sent in header
- Fix: added Authorization Bearer token in axios request
- Date: 2026-03-21
```

## `devnotes/deployment.md`
Write:
- Vercel setup
- Render setup
- domain setup
- environment variables
- build command
- output directory
- common deployment issues

## `devnotes/release-notes.md`
Write:
- what changed in each version

Example:
```md
## v1.0.0
- login/register system added
- problem CRUD added
- contest module basic version added
```

---

# 18. Best Dev Notes Writing Style

Your notes should be:

- short
- searchable
- practical
- updated after important changes

Do not write theory only.  
Write exactly what will help future-you.

## Good example
```md
## Google login error
- Problem: origin_mismatch in production
- Cause: Vercel domain not added in Google console
- Fix:
  1. open Google Cloud Console
  2. add domain in Authorized JavaScript origins
  3. add redirect URI
```

This type of note is very valuable.

---

# 19. Clean Weekly Routine

Use this weekly pattern.

## Every day
- code in `dev`
- commit small changes
- push to GitHub

## For bigger work
- create `feature/...`

## Before deployment
- test properly in `dev`

## On release day
- merge `dev` into `main`
- create version tag
- update `release-notes.md`

---

# 20. Best Practices Summary

## Do
- keep `main` stable
- use `dev` daily
- write clean commit messages
- push regularly
- create tags for releases
- keep dev notes updated
- use `.gitignore` correctly

## Avoid
- coding directly in `main`
- giant messy commits
- committing `.env`
- too many unnecessary branches
- skipping release tags
- relying on memory instead of notes

---

# 21. Best Final Setup for You

For your solo project, use this exact system:

## Branches
```text
main
dev
feature/*
hotfix/*
```

## Commit format
```text
type(scope): message
```

## Release flow
```text
dev → test → merge to main → tag → deploy
```

## Notes folder
```text
devnotes/
  setup.md
  api-notes.md
  bugs-fixed.md
  deployment.md
  release-notes.md
```

This is simple, clean, and efficient.

---

# 22. Quick Copy-Paste Commands

## First time
```bash
git init
git remote add origin <repo-url>
git branch -M main
git add .
git commit -m "chore(init): initial project setup"
git push -u origin main
git checkout -b dev
git push -u origin dev
```

## Daily work
```bash
git checkout dev
git pull origin dev
git add .
git commit -m "feat(auth): add login page"
git push origin dev
```

## Feature work
```bash
git checkout dev
git pull origin dev
git checkout -b feature/leaderboard
git add .
git commit -m "feat(leaderboard): add leaderboard UI"
git push -u origin feature/leaderboard
```

## Merge feature to dev
```bash
git checkout dev
git merge feature/leaderboard
git push origin dev
```

## Release
```bash
git checkout main
git pull origin main
git merge dev
git push origin main
git tag -a v1.0.0 -m "Stable release"
git push origin v1.0.0
```

---

# 23. Final Advice

As a solo developer, your Git system should be:

- simple enough to follow daily
- safe enough to recover mistakes
- clean enough to understand after months
- structured enough for deployment

The best workflow for you is **not the biggest workflow**.  
It is the one you can use consistently.

For your project, `main + dev + optional feature branches + release tags + devnotes` is the best balance.
