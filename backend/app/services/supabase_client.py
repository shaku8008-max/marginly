"""
Supabase client — service role instance.

This client is initialised with the **service role key**, which means it
has full access to every table and bypasses Row-Level Security (RLS).
That is intentional: this backend verifies the user's identity via their
auth token (see auth.py) and then writes data on their behalf using this
privileged client.

⚠️  This client must ONLY exist in backend code.
    It must NEVER be sent to the frontend, logged, or returned in any
    API response. If the service role key is exposed, anyone can read
    or modify any row in your database regardless of RLS policies.
"""

from supabase import create_client, Client
from app.core.config import SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

# Single shared instance — reuse across all requests
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)