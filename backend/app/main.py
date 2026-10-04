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
       # Then open .env and fill in your Supabase project URL
       # and service role key.

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
from app.routers import profiles

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
# Allow the React dev server to call this API during local development.
# When deploying, add the live frontend URL (e.g. https://marginly.app)
# to the allowed_origins list below.
# ─────────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",  # alternate dev port
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(profiles.router)


@app.get("/")
def root():
    """Health check — confirms the backend is running."""
    return {"status": "ok", "service": "marginly-api"}