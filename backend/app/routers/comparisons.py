"""
Comparisons router — POST /api/comparisons and GET /api/comparisons/latest.

POST validates the profile, runs the server-side cost calculation, and saves
profile + results + discounts in a single atomic database transaction via the
save_comparison() Postgres function.

GET returns the user's most recent saved comparison so a returning user can
pick up where they left off without re-entering data.
"""

from decimal import Decimal
from fastapi import APIRouter, HTTPException, Request
from app.models.business_profile import BusinessProfileIn
from app.services.auth import verify_user
from app.services.supabase_client import supabase
from app.services.calculate_true_cost import calculate_true_costs
from app.services.generate_discounts import generate_discounts

router = APIRouter()


def _get_industry_multiplier(industry_name: str) -> Decimal:
    """Look up the chargeback multiplier for an industry.  Raises 400 if unknown."""
    result = (
        supabase.table("industry_multipliers")
        .select("chargeback_multiplier")
        .eq("industry", industry_name)
        .execute()
    )
    if not result.data:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown industry: '{industry_name}'. Please choose from the available options.",
        )
    return Decimal(str(result.data[0]["chargeback_multiplier"]))


def _get_processors() -> list[dict]:
    """Load all processors from the database, ordered by name."""
    result = supabase.table("processors").select("*").order("name").execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="No payment processors found.")
    return result.data


@router.post("/api/comparisons")
async def create_comparison(profile: BusinessProfileIn, request: Request):
    """
    Save a full comparison: profile + ranked results + discounts.
    The three-table write goes through save_comparison() so it is atomic.
    """
    user_id = await verify_user(request)
    multiplier = _get_industry_multiplier(profile.industry)
    processors = _get_processors()

    results = calculate_true_costs(
        monthly_volume=Decimal(str(profile.monthly_volume)),
        avg_transaction=Decimal(str(profile.avg_transaction)),
        international_percent=Decimal(str(profile.international_percent)),
        chargebacks_last_year=profile.chargebacks_last_year,
        industry_multiplier=multiplier,
        processors=processors,
    )

    # Reuse existing discounts; generate only for processors that don't have one
    existing_discounts = _get_user_discounts(user_id)
    processor_names = [p["name"] for p in processors]
    new_discounts = generate_discounts(
        [n for n in processor_names if n not in existing_discounts]
    )
    all_discounts = {**existing_discounts, **new_discounts}

    # Build JSON payloads for the atomic save function
    profile_json = {
        "monthly_volume": str(profile.monthly_volume),
        "avg_transaction": str(profile.avg_transaction),
        "in_person_percent": str(profile.in_person_percent),
        "international_percent": str(profile.international_percent),
        "chargebacks_last_year": (
            str(profile.chargebacks_last_year)
            if profile.chargebacks_last_year is not None else ""
        ),
        "industry": profile.industry,
    }
    results_json = [
        {"processor_name": r["processor_name"], "calculated_cost": str(r["calculated_cost"]), "rank": r["rank"]}
        for r in results
    ]
    discounts_json = [
        {"processor_name": n, "discount_percent": str(p)} for n, p in all_discounts.items()
    ]

    # Call the atomic save — verified user_id only, never from request body
    try:
        supabase.rpc("save_comparison", {
            "p_user_id": user_id,
            "p_profile": profile_json,
            "p_results": results_json,
            "p_discounts": discounts_json,
        }).execute()
    except Exception:
        raise HTTPException(status_code=500, detail="Could not save your comparison. Please try again.")

    used_default = results[0].get("used_default_chargebacks", False) if results else False
    return {
        "profile": profile_json,
        "results": [
            {"processor_name": r["processor_name"], "calculated_cost": str(r["calculated_cost"]),
             "rank": r["rank"], "breakdown": r["breakdown"]}
            for r in results
        ],
        "discounts": {n: str(p) for n, p in all_discounts.items()},
        "used_default_chargebacks": used_default,
    }


@router.get("/api/comparisons/latest")
async def get_latest_comparison(request: Request):
    """
    Return the user's most recent saved comparison, or {"comparison": null}.
    Every query is scoped to the verified user_id.
    """
    user_id = await verify_user(request)

    profile_result = (
        supabase.table("business_profiles").select("*")
        .eq("user_id", user_id).order("created_at", desc=True).limit(1).execute()
    )
    if not profile_result.data:
        return {"comparison": None}

    profile_row = profile_result.data[0]
    profile_id = profile_row["id"]

    results_result = (
        supabase.table("results").select("processor_name, calculated_cost, rank")
        .eq("profile_id", profile_id).order("rank").execute()
    )
    discounts_result = (
        supabase.table("discounts").select("processor_name, discount_percent")
        .eq("user_id", user_id).execute()
    )

    results = results_result.data or []
    discounts = {
        row["processor_name"]: str(row["discount_percent"])
        for row in (discounts_result.data or [])
    }
    profile_json = {
        "monthly_volume": str(profile_row["monthly_volume"]),
        "avg_transaction": str(profile_row["avg_transaction"]),
        "in_person_percent": str(profile_row["in_person_percent"]),
        "international_percent": str(profile_row["international_percent"]),
        "chargebacks_last_year": (
            str(profile_row["chargebacks_last_year"])
            if profile_row["chargebacks_last_year"] is not None else ""
        ),
        "industry": profile_row["industry"],
    }
    return {
        "comparison": {
            "profile": profile_json,
            "results": [
                {"processor_name": r["processor_name"], "calculated_cost": str(r["calculated_cost"]),
                 "rank": r["rank"], "breakdown": None}
                for r in results
            ],
            "discounts": discounts,
            "used_default_chargebacks": profile_row["chargebacks_last_year"] is None,
        }
    }