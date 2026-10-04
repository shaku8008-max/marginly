"""
Health check router.

A simple GET /api/health that returns {"status": "ok"}.
Requires no authentication — useful for uptime monitors and Vercel's
built-in health probes.
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/api/health")
def health():
    """Returns ok if the backend is running."""
    return {"status": "ok"}