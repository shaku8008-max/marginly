"""
Pydantic model for the POST /api/profile request body.

FastAPI uses this model to automatically validate incoming JSON.
If a required field is missing or has the wrong type, FastAPI returns
a 422 response with a clear description of what's wrong — no custom
error handling needed for validation failures.

NOTE: The Field constraints below mirror:
  - src/utils/validationLimits.js (frontend)
  - supabase/migrations/002_hardening_and_industries.sql (database)
  Keep all three in sync when adjusting limits.
"""

from typing import Optional
from pydantic import BaseModel, Field, model_validator


class BusinessProfileIn(BaseModel):
    """Schema for creating a new business profile."""

    # Limits mirror validationLimits.js — keep in sync.
    monthly_volume: float = Field(
        ..., gt=0, le=10_000_000,
        description="Total monthly card payment volume in dollars (1 – 10,000,000)",
    )
    avg_transaction: float = Field(
        ..., gt=0, le=100_000,
        description="Average transaction amount in dollars (0.01 – 100,000)",
    )
    in_person_percent: float = Field(
        ..., ge=0, le=100,
        description="Percentage of sales made in-person (0–100)",
    )
    international_percent: float = Field(
        ..., ge=0, le=100,
        description="Percentage of sales from international customers (0–100)",
    )
    # null allowed — the calculation will use a default when the user skips this field
    chargebacks_last_year: Optional[int] = Field(
        None, ge=0, le=10_000,
        description="Number of chargeback disputes in the last year (0–10,000, or null if not provided)",
    )
    industry: str = Field(
        ..., min_length=1,
        description="Business industry (must match a row in industry_multipliers)",
    )

    @model_validator(mode="after")
    def avg_transaction_not_greater_than_volume(self):
        """Average transaction can't be larger than the monthly card volume."""
        if self.avg_transaction > self.monthly_volume:
            raise ValueError(
                "avg_transaction cannot be greater than monthly_volume"
            )
        return self