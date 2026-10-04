"""
Random discount generator — illustrative demo values only.

These are NOT real partner terms.  In a production app the discount
percentages would come from an affiliate agreement or a negotiated
rate table.  Here we generate random values between 2.0% and 5.0%
so the UI has something to display and the save/load flow can be
tested end-to-end.
"""

import random
from decimal import Decimal, ROUND_HALF_UP


def generate_discounts(processor_names: list[str]) -> dict[str, Decimal]:
    """
    Return {processor_name: random Decimal between 2.0 and 5.0 (1 dp)}
    for each name in the input list.
    """
    discounts: dict[str, Decimal] = {}
    for name in processor_names:
        # Random float between 2.0 and 5.0, rounded to 1 decimal place
        value = round(random.uniform(2.0, 5.0), 1)
        discounts[name] = Decimal(str(value))
    return discounts