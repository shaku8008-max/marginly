"""
Application configuration.

Loads environment variables required for Supabase access.
These values come from the .env file (see .env.example for the template)
and must NEVER be hardcoded in source code.

SUPABASE_URL      — your Supabase project URL
SUPABASE_SERVICE_ROLE_KEY — the service role secret key

The service role key bypasses Row-Level Security and has full database
access. It is loaded here once and shared with the Supabase client,
but is never exposed to the frontend, logged, or returned in responses.
"""

import os
from dotenv import load_dotenv

# Load .env file from the backend/ directory
load_dotenv()

SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

# Fail fast on startup if either value is missing, so the developer
# sees a clear message instead of a confusing Supabase auth error later.
if not SUPABASE_URL:
    raise RuntimeError(
        "SUPABASE_URL is not set. "
        "Copy .env.example to .env and fill in your Supabase project URL."
    )

if not SUPABASE_SERVICE_ROLE_KEY:
    raise RuntimeError(
        "SUPABASE_SERVICE_ROLE_KEY is not set. "
        "Copy .env.example to .env and fill in your service role key."
    )