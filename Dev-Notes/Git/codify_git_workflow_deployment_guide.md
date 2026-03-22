# Codify Platform -- Professional Git Workflow & Deployment Guide

Project: React + Django Coding Platform (Codify)

------------------------------------------------------------------------

# 1. Professional Git Workflow (Used in Companies)

## Branch Structure

main → Production code\
develop → Integration branch\
feature/\* → New features\
bugfix/\* → Bug fixes\
hotfix/\* → Urgent production fixes

Example:

main develop feature/google-login feature/problem-editor
bugfix/login-error hotfix/payment-fix

------------------------------------------------------------------------

## Standard Development Flow

1.  Pull latest code git checkout develop git pull origin develop

2.  Create feature branch git checkout -b feature/problem-submission

3.  Write code and test locally

4.  Commit changes git add . git commit -m "feat(problem): add code
    submission API"

5.  Push branch git push origin feature/problem-submission

6.  Create Pull Request → develop

7.  After testing merge develop → main

------------------------------------------------------------------------

# 2. Auto Deployment When Tag is Created (GitHub Actions)

Create workflow file:

.github/workflows/deploy-on-tag.yml

Example workflow:

name: Deploy on Version Tag

on: push: tags: - 'v\*'

jobs: deploy: runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm install

      - name: Build frontend
        run: npm run build

      - name: Deploy step
        run: echo "Add deployment command here"

------------------------------------------------------------------------

## Creating a Version Tag

git tag -a v1.0.0 -m "First stable release" git push origin v1.0.0

This triggers the GitHub Actions workflow.

------------------------------------------------------------------------

# 3. Best Commit Message Format (Production Projects)

Use Conventional Commits.

Format:

type(scope): short description

Examples:

feat(auth): add Google login fix(api): resolve contest submission error
docs(readme): update installation guide refactor(submission): simplify
judge response logic ci(deploy): add tag-based deployment workflow
chore(deps): update axios version

------------------------------------------------------------------------

## Common Commit Types

feat → new feature\
fix → bug fix\
docs → documentation\
style → formatting change\
refactor → code improvement\
test → tests added/updated\
chore → maintenance\
ci → CI/CD pipeline changes

------------------------------------------------------------------------

# 4. Example Release Process

feature branch → Pull Request review → merge into develop → QA testing →
merge develop → main → create version tag → GitHub Actions deploy

Example:

git tag -a v1.0.0 -m "Stable release with authentication, problems, and
contest module" git push origin v1.0.0

------------------------------------------------------------------------

# 5. Recommended Setup for Codify

Frontend: React + Vite → Vercel\
Backend: Django API → Render

Deployment flow:

feature branch → develop → main → version tag → auto deploy

------------------------------------------------------------------------

# 6. Quick Reference

Create branch git checkout -b feature/editor

Commit format git commit -m "feat(editor): add Monaco code editor"

Create release tag git tag -a v1.0.0 -m "First stable release" git push
origin v1.0.0

------------------------------------------------------------------------

End of Guide
