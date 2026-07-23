import pytest
from utils.weather import parse_wmo_code, generate_smart_packing_advisory

# ── 1. WMO Weather Code Parser Tests ──────────────────────────────

@pytest.mark.parametrize("code, expected_condition, expected_emoji", [
    (0, "Sunny", "☀️"),
    (2, "Partly Cloudy", "⛅"),
    (63, "Moderate Rain", "🌧️"),
    (75, "Heavy Snow", "❄️"),
    (95, "Thunderstorm", "🌩️"),
])
def test_wmo_code_parsing(code, expected_condition, expected_emoji):
    cond, emoji = parse_wmo_code(code)
    assert cond == expected_condition
    assert emoji == expected_emoji


# ── 2. Smart Packing Advisory Logic Tests ─────────────────────────

def test_packing_advisory_cold_climate():
    forecast_data = {
        "elevation_m": 500,
        "daily": [
            {"day": 1, "date": "2026-07-23", "temp_max": 14, "temp_min": 4, "precip_probability": 10, "condition": "Sunny", "icon": "☀️"},
            {"day": 2, "date": "2026-07-24", "temp_max": 12, "temp_min": 2, "precip_probability": 15, "condition": "Overcast", "icon": "☁️"},
        ]
    }
    adv = generate_smart_packing_advisory(forecast_data, "Chandigarh", days=2)

    assert adv["temp"] == "2°C - 14°C"
    assert "Cold & Chilly" in adv["condition"]
    assert "Heavy fleece or down jacket" in adv["packing"]
    assert "Thermal innerwear set" in adv["packing"]
    assert "Woolen beanie & warm gloves" in adv["packing"]


def test_packing_advisory_hot_desert_climate():
    forecast_data = {
        "elevation_m": 300,
        "daily": [
            {"day": 1, "date": "2026-07-23", "temp_max": 38, "temp_min": 24, "precip_probability": 5, "condition": "Sunny", "icon": "☀️"},
            {"day": 2, "date": "2026-07-24", "temp_max": 39, "temp_min": 25, "precip_probability": 0, "condition": "Sunny", "icon": "☀️"},
        ]
    }
    adv = generate_smart_packing_advisory(forecast_data, "Jodhpur", days=2)

    assert adv["temp"] == "24°C - 39°C"
    assert "Hot & Sunny" in adv["condition"]
    assert "High protection sunscreen (SPF 50+)" in adv["packing"]
    assert "Polarized sunglasses & sun hat" in adv["packing"]
    assert "Electrolyte hydration packets" in adv["packing"]


def test_packing_advisory_rainy_monsoon_climate():
    forecast_data = {
        "elevation_m": 15,
        "daily": [
            {"day": 1, "date": "2026-07-23", "temp_max": 29, "temp_min": 24, "precip_probability": 85, "condition": "Heavy Rain", "icon": "🌧️"},
            {"day": 2, "date": "2026-07-24", "temp_max": 28, "temp_min": 23, "precip_probability": 90, "condition": "Heavy Rain", "icon": "🌧️"},
        ]
    }
    adv = generate_smart_packing_advisory(forecast_data, "Kochi", days=2)

    assert "Wet / Rainy Showers" in adv["condition"]
    assert "Compact umbrella or waterproof raincoat / poncho" in adv["packing"]
    assert "Quick-dry clothing" in adv["packing"]


def test_packing_advisory_high_altitude():
    forecast_data = {
        "elevation_m": 3500,
        "daily": [
            {"day": 1, "date": "2026-07-23", "temp_max": 16, "temp_min": 5, "precip_probability": 10, "condition": "Clear", "icon": "☀️"},
        ]
    }
    adv = generate_smart_packing_advisory(forecast_data, "Leh Ladakh", days=1)

    assert adv["elevation_m"] == 3500
    assert "Alpine / High Altitude" in adv["condition"]
    assert "Altitude sickness hydration tablets / Diamox (consult doctor)" in adv["packing"]
    assert "High-UV protective sunglasses" in adv["packing"]
