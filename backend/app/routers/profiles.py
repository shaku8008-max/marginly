"""
Business profile router.

Handles POST /api/profile — the first endpoint that proved the full
chain works: token verification → service-role database insert →
returning the saved row as JSON.

NOTE: This endpoint is now superseded by POST /api/comparisons, which
saves the profile, results, and discounts in one atomic transaction.
It is kept in place for backward compatibility but new code should use
/api/comparisons.
"""

from fastapi import APIRouter, HTTPException, Request
from app.models.business_profile import BusinessProfileIn
from app.services.auth import verify_user
from app.services.supabase_client import supabase

router = APIRouter()


@router.post("/api/profile")
async def create_profile(profile: BusinessProfileIn, request: Request):
    """
    Create a new business profile for the authenticated user.

    The user's identity comes from their bearer token — NOT from the
    request body. This prevents one user from saving data under
    another user's account.
    """
    # --- Step 1: Verify the caller is a real, authenticated user ---
    user_id = await verify_user(request)

    # --- Step 2: Check that the submitted industry exists in the DB ---
    # This prevents foreign-key violations when we insert the row.
    industry_check = (
        supabase.table("industry_multipliers")
        .select("industry")
        .eq("industry", profile.industry)
        .execute()
    )
    if not industry_check.data:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown industry: '{profile.industry}'. Please choose from the available options.",
        )

    # --- Step 3: Build the row to insert ---
    row = {
        "user_id": user_id,
        "monthly_volume": profile.monthly_volume,
        "avg_transaction": profile.avg_transaction,
        "in_person_percent": profile.in_person_percent,
        "international_percent": profile.international_percent,
        "chargebacks_last_year": profile.chargebacks_last_year,
        "industry": profile.industry,
    }

    # --- Step 4: Insert into Supabase ---
    try:
        result = supabase.table("business_profiles").insert(row).execute()
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Could not save profile. Please try again later.",
        )

    # Supabase returns the inserted row(s) in result.data
    if not result.data:
        raise HTTPException(
            status_code=500,
            detail="Could not save profile. Please try again later.",
        )

    # --- Step 5: Return the saved row ---
    return result.data[0]