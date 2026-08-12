def get_guide_rate_by_location(city: str) -> int:
    """
    Returns daily guide rate (₹/day) based on regional destination tier.
    Matches the logic in travel-app/src/app/checkout/page.tsx.
    """
    c = city.lower()
    if any(k in c for k in ["jaipur", "jodhpur", "udaipur", "rajasthan"]):
        return 1500
    if any(k in c for k in ["kochi", "alleppey", "munnar", "kerala"]):
        return 1000
    if any(k in c for k in ["leh", "ladakh"]):
        return 1800
    return 1200  # Default / Other tier


def calculate_checkout_pricing(
    package_price: int,
    travelers: int,
    hotel_nightly_price: int,
    nights: int,
    days: int,
    city: str,
    include_guide: bool = False,
    flight_price: int = 0,
    include_flights: bool = False
) -> dict:
    """
    Calculates subtotal, commission, GST, and grand total for the checkout flow.
    Matches the exact pricing engine in checkout/page.tsx.
    """
    base_cost = package_price * travelers
    hotel_total = hotel_nightly_price * nights * travelers
    daily_guide_rate = get_guide_rate_by_location(city)
    guide_total = (daily_guide_rate * days * travelers) if include_guide else 0
    flight_total = (flight_price * travelers) if include_flights else 0

    subtotal_before_commission = base_cost + hotel_total + guide_total + flight_total
    commission = round(subtotal_before_commission * 0.08)
    subtotal = subtotal_before_commission + commission
    gst = round(subtotal * 0.05)
    grand_total = subtotal + gst

    return {
        "base_cost": base_cost,
        "hotel_total": hotel_total,
        "guide_total": guide_total,
        "flight_total": flight_total,
        "subtotal_before_commission": subtotal_before_commission,
        "commission": commission,
        "subtotal": subtotal,
        "gst": gst,
        "grand_total": grand_total,
        "daily_guide_rate": daily_guide_rate
    }


def calculate_even_shares(grand_total: int, traveler_count: int) -> list:
    """
    Splits grand_total evenly among traveler_count persons.
    Assigns rounding remainder to Person 1 (Lead Traveler) so sum equals grand_total.
    """
    if traveler_count <= 0:
        return []
    base = grand_total // traveler_count
    remainder = grand_total - (base * traveler_count)
    shares = []
    for i in range(traveler_count):
        shares.append({
            "id": i + 1,
            "label": f"Person {i + 1}" if i > 0 else "Person 1 (Lead)",
            "amount": base + remainder if i == 0 else base
        })
    return shares


def validate_custom_shares(grand_total: int, shares: list) -> dict:
    """
    Calculates total allocated amount and checks if custom shares sum to grand_total.
    """
    allocated = sum(s.get("amount", 0) for s in shares)
    delta = grand_total - allocated
    return {
        "allocated": allocated,
        "grand_total": grand_total,
        "delta": delta,
        "is_balanced": delta == 0
    }
