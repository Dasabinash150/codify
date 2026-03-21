Local Development After Deployment Setup

Even if your project is deployment ready, you should still develop locally using a separate local environment.

Professional projects always maintain:

Local Development Environment
Production (Deployment) Environment
1. Use Separate Environment Files

Do not mix production and local settings.

Backend Environment Files

Create two files:

.env.local
.env.production
Example .env.local
DEBUG=True
ALLOWED_HOSTS=127.0.0.1,localhost

CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

DATABASE_URL=sqlite:///db.sqlite3

SECRET_KEY=your-local-secret-key
Example .env.production
DEBUG=False

ALLOWED_HOSTS=yourdomain.com,backend.onrender.com

CORS_ALLOWED_ORIGINS=https://yourfrontend.vercel.app

DATABASE_URL=your-production-database-url

SECRET_KEY=your-production-secret-key
2. Run Backend Locally

Start Django server locally.

python manage.py runserver

Local backend will run on:

http://127.0.0.1:8000
3. Use Environment Variables in React

Never hardcode backend URLs.

Create frontend environment files.

.env.local
VITE_API_BASE_URL=http://127.0.0.1:8000
.env.production
VITE_API_BASE_URL=https://your-backend.onrender.com
4. Use API Base URL in Code

Example in React:

const API = import.meta.env.VITE_API_BASE_URL

axios.get(`${API}/api/problems/`)
5. Avoid Hardcoded URLs

❌ Bad Practice

axios.get("https://backend.onrender.com/api/problems/")

✅ Good Practice

axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/problems/`)
6. Keep Local Database Separate

For local development use:

SQLite (recommended)
or Local PostgreSQL

Example:

db.sqlite3

Never use production database for development testing.

7. Local Development Workflow

Daily workflow:

Start Backend
cd backend
python manage.py runserver
Start Frontend
cd frontend/my-app
npm run dev

Now you can work on:

UI improvements
API integration
Debugging
New features
8. Deploy Updated Code

When your feature is ready:

git add .
git commit -m "Added new feature"
git push

Deployment platforms (Render / Vercel) will automatically build the new version.

9. Recommended Project Structure
project/
│
├── backend/
│   ├── .env.local
│   ├── .env.production
│   └── ...
│
├── frontend/
│   └── my-app/
│       ├── .env.local
│       ├── .env.production
│       └── ...
10. Environment Mindset

Think like this:

Environment	Purpose
Local	Build and test features
GitHub	Store project code
Deployment	Live application for users
11. Example Configuration
Local Development
DEBUG=True
VITE_API_BASE_URL=http://127.0.0.1:8000
DATABASE=SQLite
Production Deployment
DEBUG=False
VITE_API_BASE_URL=https://backend.onrender.com
DATABASE=PostgreSQL
12. Key Rule

While developing locally:

Frontend → localhost
Backend → localhost
Database → local
Debug → enabled

While deploying:

Frontend → deployed backend
Backend → production database
Debug → disabled
Secrets → production only
Summary

Professional development workflow:

Local Development → GitHub → Deployment
Develop locally
Push code to GitHub
Deployment platform builds the live version