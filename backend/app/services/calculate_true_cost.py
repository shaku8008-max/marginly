"""
Server-side true-cost calculation.

This MUST match the logic in src/utils/calculateTrueCost.js on the frontend.
Both files must be kept in sync — if you change the formula here, update the
JS version too (and vice versa).

Uses Python Decimal for precise arithmetic; only rounds to 2 decimals at the
end so that intermediate additions don't compound floating-point drift.
"""

from decimal import Decimal, ROUND_HALF_UP

# When the user skips the chargebacks field we assume a low-average figure
# rather than zero, so the estimate still reflects real-world risk.
DEFAULT_ANNUAL_CHARGEBACKS = Decimal("2")


def calculate_true_costs(
    monthly_volume: Decimal,
    avg_transaction: Decimal,
    international_percent: Decimal,
    chargebacks_last_year: int | None,
    industry_multiplier: Decimal,
    processors: list[dict],
) -> list[dict]:
    """
    Calculate the true monthly cost for each processor and return them
    sorted by total cost ascending, with rank starting at 1.

    Each processor dict must have: name, percent_fee, flat_fee,
    chargeback_fee, fx_markup_percent.

    Returns a list of dicts:
      { processor_name, calculated_cost (Decimal, 2dp), rank (int),
        breakdown: { base_cost, chargeback_cost, fx_cost } }
    """
    # --- Defensive Decimal conversion (prevents float/Decimal mixing) ---
    monthly_volume = Decimal(str(monthly_volume))
    avg_transaction = Decimal(str(avg_transaction))
    international_percent = Decimal(str(international_percent))
    industry_multiplier = Decimal(str(industry_multiplier))

    # --- Transaction count ---
    # Guard against zero avg_transaction to avoid division by zero.
    transactions = (
        monthly_volume / avg_transaction if avg_transaction > 0 else Decimal("0")
    )

    # --- Chargebacks ---
    # Annual count → monthly: (annual / 12)
    # Then multiply by the processor's per-chargeback fee and the
    # industry risk multiplier.
    if chargebacks_last_year is None:
        annual_chargebacks = DEFAULT_ANNUAL_CHARGEBACKS
        used_default = True
    else:
        annual_chargebacks = Decimal(str(chargebacks_last_year))
        used_default = False

    results = []

    for proc in processors:
        pct_fee = Decimal(str(proc["percent_fee"]))
        flat_fee = Decimal(str(proc["flat_fee"]))
        cb_fee = Decimal(str(proc["chargeback_fee"]))
        fx_markup = Decimal(str(proc["fx_markup_percent"]))

        # Base cost: percentage fee on volume + flat fee per transaction
        base_cost = monthly_volume * (pct_fee / Decimal("100")) + transactions * flat_fee

        # Chargeback cost — annual count converted to monthly, then scaled
        # by the processor's per-chargeback fee and the industry multiplier
        chargeback_cost = (
            (annual_chargebacks / Decimal("12")) * cb_fee * industry_multiplier
        )

        # Foreign exchange cost
        fx_cost = (
            monthly_volume
            * (international_percent / Decimal("100"))
            * (fx_markup / Decimal("100"))
        )

        total = base_cost + chargeback_cost + fx_cost

        # Round only at the final step
        total_2dp = total.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        results.append({
            "processor_name": proc["name"],
            "calculated_cost": total_2dp,
            "rank": 0,  # filled after sorting
            "breakdown": {
                "base_cost": str(base_cost.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)),
                "chargeback_cost": str(chargeback_cost.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)),
                "fx_cost": str(fx_cost.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)),
            },
            "used_default_chargebacks": used_default,
        })

    # Sort by total cost ascending and assign ranks
    results.sort(key=lambda r: r["calculated_cost"])
    for i, r in enumerate(results, start=1):
        r["rank"] = i

    return results