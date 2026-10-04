"""
Authentication helper.

Verifies that an incoming request is from a real, logged-in Supabase user
by validating the JWT bearer token against Supabase's auth service.

Why we verify server-side instead of trusting the frontend:
- The frontend could send any user_id in the request body — that would
  let one user save data under another user's account.
- By extracting and verifying the bearer token here, we confirm the
  request came from someone who actually authenticated with Supabase,
  and we get their real user ID from the token — not from the request body.
"""

from fastapi import HTTPException, Request
from app.services.supabase_client import supabase


async def verify_user(request: Request) -> str:
    """
    Extract and verify the bearer token from the Authorization header.

    Returns the authenticated user's ID (a UUID string) on success.
    Raises HTTPException(401) if the token is missing, invalid, or expired.
    """
    # Pull the Authorization header: expected format is "Bearer <token>"
    auth_header: str | None = request.headers.get("Authorization")

    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Missing or malformed Authorization header. "
                   "Expected format: Bearer <token>",
        )

    # Strip the "Bearer " prefix to get the raw JWT
    token = auth_header.removeprefix("Bearer ").strip()

    # Ask Supabase to verify the token and return the user.
    # If the token is expired, revoked, or tampered with, this will raise.
    try:
        response = supabase.auth.get_user(token)
    except Exception:
        # Catches network errors, invalid token errors, etc.
        # We don't expose internal details — just tell the caller
        # their session is no good.
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired session. Please log in again.",
        )

    user = response.user

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired session. Please log in again.",
        )

    # user.id is the Supabase Auth UUID — this is the value we trust,
    # not anything the frontend sends in the request body.
    return user.id