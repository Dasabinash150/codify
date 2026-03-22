# Git Workflow

1. Create feature branch
2. Commit changes
3. Push branch
4. Create Pull Request
5. Merge to main

```
git checkout -b feature/login
git add .
git commit -m "Add login"
git push origin feature/login
```

git log --oneline

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

2️⃣ Tracking relationship created

Git set:

dev  → tracks → origin/devls
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
