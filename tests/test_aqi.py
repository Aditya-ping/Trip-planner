import pytest
from utils.aqi import get_air_quality, parse_aqi_level

# ── 1. AQI Parser Unit Tests ──────────────────────────────────────

@pytest.mark.parametrize("aqi_val, expected_status, expected_emoji, expected_color", [
    (30, "Good", "🟢", "emerald"),
    (75, "Moderate", "🟡", "yellow"),
    (135, "Unhealthy for Sensitive Groups", "🟠", "orange"),
    (175, "Unhealthy", "🔴", "red"),
    (250, "Very Unhealthy", "🟣", "purple"),
    (350, "Hazardous", "🟤", "maroon"),
])
def test_parse_aqi_levels(aqi_val, expected_status, expected_emoji, expected_color):
    res = parse_aqi_level(aqi_val, pm25=28.5)
    assert res["aqi"] == aqi_val
    assert res["status"] == expected_status
    assert res["badge_emoji"] == expected_emoji
    assert res["color"] == expected_color
    assert "advice" in res


# ── 2. Real-time Air Quality API Fetcher Tests ────────────────────

def test_get_air_quality_coordinates():
    # Delhi coordinates (28.6139, 77.2090)
    aqi_data = get_air_quality(28.6139, 77.2090)
    assert "aqi" in aqi_data
    assert isinstance(aqi_data["aqi"], int)
    assert "status" in aqi_data
    assert "color" in aqi_data
    assert "badge_emoji" in aqi_data
    assert "advice" in aqi_data
