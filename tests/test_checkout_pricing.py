import pytest
from utils.pricing import get_guide_rate_by_location, calculate_checkout_pricing

# ── 1. Regional Guide Pricing Tier Tests ──────────────────────────

@pytest.mark.parametrize("city, expected_rate", [
    ("Jaipur", 1500),
    ("Jodhpur", 1500),
    ("Udaipur", 1500),
    ("Rajasthan", 1500),
    ("Kochi", 1000),
    ("Alleppey", 1000),
    ("Munnar", 1000),
    ("Kerala", 1000),
    ("Leh", 1800),
    ("Leh Ladakh", 1800),
    ("Delhi", 1200),
    ("Goa", 1200),
    ("Mumbai", 1200),
    ("Bangalore", 1200),
])
def test_guide_pricing_tiers(city, expected_rate):
    """
    Verifies that get_guide_rate_by_location returns the correct regional tier guide rate.
    """
    assert get_guide_rate_by_location(city) == expected_rate


# ── 2. Checkout Price Engine Math Scenarios ───────────────────────

def test_pricing_scenario_rajasthan_tier():
    """
    Scenario 1: Rajasthan regional tier (Jaipur)
    Package: ₹42,000, 2 travelers, Hotel: ₹5,800/night (5 nights, 6 days), Guide: True, Flight: ₹4,500
    """
    res = calculate_checkout_pricing(
        package_price=42000,
        travelers=2,
        hotel_nightly_price=5800,
        nights=5,
        days=6,
        city="Jaipur",
        include_guide=True,
        flight_price=4500,
        include_flights=True
    )

    assert res["daily_guide_rate"] == 1500
    assert res["base_cost"] == 84000
    assert res["hotel_total"] == 58000
    assert res["guide_total"] == 18000
    assert res["flight_total"] == 9000
    assert res["subtotal_before_commission"] == 169000
    assert res["commission"] == 13520
    assert res["subtotal"] == 182520
    assert res["gst"] == 9126
    assert res["grand_total"] == 191646


def test_pricing_scenario_kerala_tier():
    """
    Scenario 2: Kerala regional tier (Kochi)
    Package: ₹38,500, 1 traveler, Hotel: ₹6,500/night (5 nights, 6 days), Guide: True, Flight: None
    """
    res = calculate_checkout_pricing(
        package_price=38500,
        travelers=1,
        hotel_nightly_price=6500,
        nights=5,
        days=6,
        city="Kochi",
        include_guide=True,
        flight_price=0,
        include_flights=False
    )

    assert res["daily_guide_rate"] == 1000
    assert res["base_cost"] == 38500
    assert res["hotel_total"] == 32500
    assert res["guide_total"] == 6000
    assert res["flight_total"] == 0
    assert res["subtotal_before_commission"] == 77000
    assert res["commission"] == 6160
    assert res["subtotal"] == 83160
    assert res["gst"] == 4158
    assert res["grand_total"] == 87318


def test_pricing_scenario_himalayan_tier():
    """
    Scenario 3: Himalayan regional tier (Leh Ladakh)
    Package: ₹55,000, 2 travelers, Hotel: ₹8,500/night (7 nights, 8 days), Guide: True, Flight: None
    """
    res = calculate_checkout_pricing(
        package_price=55000,
        travelers=2,
        hotel_nightly_price=8500,
        nights=7,
        days=8,
        city="Leh Ladakh",
        include_guide=True,
        flight_price=0,
        include_flights=False
    )

    assert res["daily_guide_rate"] == 1800
    assert res["base_cost"] == 110000
    assert res["hotel_total"] == 119000
    assert res["guide_total"] == 28800
    assert res["flight_total"] == 0
    assert res["subtotal_before_commission"] == 257800
    assert res["commission"] == 20624
    assert res["subtotal"] == 278424
    assert res["gst"] == 13921
    assert res["grand_total"] == 292345


def test_pricing_scenario_other_tier():
    """
    Scenario 4: Other / Default regional tier (Goa)
    Package: ₹25,000, 2 travelers, Hotel: ₹4,000/night (3 nights, 4 days), Guide: True, Flight: ₹3,200
    """
    res = calculate_checkout_pricing(
        package_price=25000,
        travelers=2,
        hotel_nightly_price=4000,
        nights=3,
        days=4,
        city="Goa",
        include_guide=True,
        flight_price=3200,
        include_flights=True
    )

    assert res["daily_guide_rate"] == 1200
    assert res["base_cost"] == 50000
    assert res["hotel_total"] == 24000
    assert res["guide_total"] == 9600
    assert res["flight_total"] == 6400
    assert res["subtotal_before_commission"] == 90000
    assert res["commission"] == 7200
    assert res["subtotal"] == 97200
    assert res["gst"] == 4860
    assert res["grand_total"] == 102060
