# Marginly

A payment-processor comparison tool for small business owners.

## Tech stack

- **Frontend:** React 19, Vite, Tailwind CSS 4
- **Backend:** FastAPI (Python), Supabase (Auth + Postgres)
- **State:** lifted into `App.jsx` and passed down as props

## Local development

### Frontend (runs on http://localhost:5173)

```bash
npm install
cp .env.example .env   # then fill in VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
npm run dev
```

### Backend (runs on http://localhost:8000)

```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # then fill in SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
uvicorn app.main:app --reload
```

## Deployment (Vercel)

This repo is deployed as **two separate Vercel projects** from the same GitHub repository.

| Project | Root directory | Description |
|---------|---------------|-------------|
| **Frontend** | `./` (repo root) | React/Vite static site |
| **Backend** | `backend/` | FastAPI API server |

### Environment variables

**Frontend project** (Vercel → Settings → Environment Variables):

| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key (public, safe for browser) |
| `VITE_API_URL` | Live backend URL, e.g. `https://marginly-api.vercel.app` |

**Backend project** (Vercel → Settings → Environment Variables):

| Variable | Purpose |
|----------|---------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (**secret — never expose to frontend**) |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed CORS origins. Set to your live frontend URL, e.g. `https://marginly.vercel.app,http://localhost:5173` |

> `ALLOWED_ORIGINS` **must** include the live frontend URL or the browser will block API requests. Never use `*` as an origin.

## Project structure

```
├── src/                        # React frontend
│   ├── screens/                # Route-level components
│   ├── components/             # Shared UI (Button, Card, FormField, Input)
│   ├── services/
│   │   ├── supabaseClient.js   # Supabase Auth client (anon key)
│   │   └── api.js              # Backend API helper (authenticated fetch)
│   ├── data/                   # Industry definitions and themes
│   └── utils/                  # Calculation and validation helpers
├── backend/
│   ├── app/
│   │   ├── main.py             # FastAPI app, CORS, error handlers
│   │   ├── core/config.py      # Environment variable loading
│   │   ├── models/             # Pydantic request schemas
│   │   ├── routers/            # API endpoints
│   │   └── services/           # Supabase client and auth verification
│   └── .env.example
├── supabase/migrations/        # SQL migrations (run in Supabase SQL Editor)
├── vercel.json                 # SPA rewrite for React Router deep links
└── .env.example
```
