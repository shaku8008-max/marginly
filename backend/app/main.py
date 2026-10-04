"""
Marginly FastAPI backend.

Provides the API that sits between the React frontend and Supabase.
The frontend handles Auth (login/signup) directly with Supabase;
this backend handles all database reads/writes using the service role
key so that the frontend never needs direct database access.

──────────────────────────────────────────────────────────────────────
Running locally
──────────────────────────────────────────────────────────────────────

1. Create and activate a virtual environment:

       cd backend
       python3 -m venv venv
       source venv/bin/activate          # macOS / Linux
       # venv\\Scripts\\activate         # Windows

2. Install dependencies:

       pip install -r requirements.txt

3. Set up environment variables:

       cp .env.example .env
       # Then open .env and fill in your Supabase project URL,
       # service role key, and allowed origins.

4. Start the development server:

       uvicorn app.main:app --reload

   The API will be available at http://localhost:8000
   Interactive docs at http://localhost:8000/docs (Swagger UI)

──────────────────────────────────────────────────────────────────────
"""

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.routers import profiles, health, comparisons
from app.core.config import ALLOWED_ORIGINS

app = FastAPI(
    title="Marginly API",
    description="Backend for the Marginly payment-processor comparison app.",
    version="0.1.0",
)


# ── Custom validation error handler ─────────────────────────────────────
# Returns a friendlier JSON shape than FastAPI's default 422 body.
# Frontend receives: { "error": "Please check your details", "fields": { ... } }
# ────────────────────────────────────────────────────────────────────────
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    fields = {}
    for err in exc.errors():
        # loc is a tuple like ("body", "monthly_volume")
        field = err["loc"][-1] if err["loc"] else "unknown"
        fields[field] = err["msg"]
    return JSONResponse(
        status_code=422,
        content={"error": "Please check your details", "fields": fields},
    )


# ── CORS ─────────────────────────────────────────────────────────────────
# Origins come from the ALLOWED_ORIGINS environment variable, parsed in
# config.py.  In production, set ALLOWED_ORIGINS in the Vercel dashboard
# → backend project → Settings → Environment Variables to your live
# frontend URL (e.g. https://marginly.vercel.app).
# Never use "*" as an origin — only explicit URLs.
# ─────────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

# Register routers
app.include_router(health.router)
app.include_router(comparisons.router)
app.include_router(profiles.router)  # legacy — the app now saves through /api/comparisons


@app.get("/")
def root():
    """Health check — confirms the backend is running."""
    return {"status": "ok", "service": "marginly-api"}