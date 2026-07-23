import os
import requests
import logging
from utils.cache import get_cached_response, set_cached_response

logger = logging.getLogger("aerotravel.aqi")

def get_air_quality(lat, lon):
    """
    Fetches real-time Air Quality Index (AQI) and PM2.5 / PM10 levels for destination coordinates.
    Supports Open-Meteo Air Quality API (No key required) and IQAir AirVisual API.
    Caches results in SQLite api_cache for 3 hours.
    """
    try:
        lat_r = round(float(lat), 3)
        lon_r = round(float(lon), 3)
    except (ValueError, TypeError):
        logger.warning(f"[AQI Warning] Invalid coordinates provided: lat={lat}, lon={lon}")
        return parse_aqi_level(50, source="Default")

    cache_key = f"aqi:{lat_r}:{lon_r}"

    cached = get_cached_response(cache_key)
    if cached is not None:
        return cached

    iqair_key = os.getenv("IQAIR_KEY") or os.getenv("AIRVISUAL_KEY")

    aqi_data = None

    # Tier 1: IQAir AirVisual API (if key provided)
    if iqair_key:
        try:
            logger.info(f"[IQAir API] Fetching AQI for lat={lat_r}, lon={lon_r}")
            url = "https://api.airvisual.com/v2/nearest_city"
            params = {"lat": lat, "lon": lon, "key": iqair_key}
            resp = requests.get(url, params=params, timeout=4)
            logger.info(f"[IQAir API] Response status={resp.status_code}")
            if resp.status_code == 200:
                d = resp.json()
                if d.get("status") == "success":
                    current = d["data"]["current"]["pollution"]
                    aqi_val = current.get("aqius", 50)
                    aqi_data = parse_aqi_level(aqi_val, pm25=current.get("mainus"), source="IQAir AirVisual")
        except Exception as e:
            logger.error(f"[AQI Error] IQAir API error for lat={lat_r}, lon={lon_r}: {e}")

    # Tier 2: Open-Meteo Air Quality API (Free, no key required)
    if not aqi_data:
        try:
            logger.info(f"[Open-Meteo AQI API] Fetching AQI for lat={lat_r}, lon={lon_r}")
            url = f"https://air-quality-api.open-meteo.com/v1/air-quality?latitude={lat}&longitude={lon}&current=us_aqi,pm10,pm2_5"
            resp = requests.get(url, timeout=4)
            logger.info(f"[Open-Meteo AQI API] Response status={resp.status_code}")
            if resp.status_code == 200:
                d = resp.json()
                current = d.get("current", {})
                us_aqi = current.get("us_aqi") or 50
                pm25 = current.get("pm2_5")
                pm10 = current.get("pm10")
                aqi_data = parse_aqi_level(us_aqi, pm25=pm25, pm10=pm10, source="Open-Meteo Air Quality")
        except Exception as e:
            logger.error(f"[AQI Error] Open-Meteo Air Quality error for lat={lat_r}, lon={lon_r}: {e}")

    # Fallback default if network fails
    if not aqi_data:
        aqi_data = parse_aqi_level(55, source="Estimated Default")

    set_cached_response(cache_key, aqi_data, 10800)  # 3 hours TTL
    return aqi_data


def parse_aqi_level(aqi_val, pm25=None, pm10=None, source="Open-Meteo"):
    """
    Parses numerical US AQI into color code, health advisory badge, and risk rating.
    """
    aqi = int(aqi_val)

    if aqi <= 50:
        status = "Good"
        color = "emerald"
        badge_emoji = "🟢"
        advice = "Clean air! Ideal for sightseeing and outdoor activities."
    elif aqi <= 100:
        status = "Moderate"
        color = "yellow"
        badge_emoji = "🟡"
        advice = "Acceptable air quality. Sensitive individuals should consider light precautions."
    elif aqi <= 150:
        status = "Unhealthy for Sensitive Groups"
        color = "orange"
        badge_emoji = "🟠"
        advice = "Elevated PM2.5. Sensitive travelers (asthma/elderly) should carry N95 masks."
    elif aqi <= 200:
        status = "Unhealthy"
        color = "red"
        badge_emoji = "🔴"
        advice = "Unhealthy smog level. Limit long outdoor walks; prefer indoor attractions & N95 masks."
    elif aqi <= 300:
        status = "Very Unhealthy"
        color = "purple"
        badge_emoji = "🟣"
        advice = "Severe pollution. Wear N95 mask outdoors and use air-conditioned transport."
    else:
        status = "Hazardous"
        color = "maroon"
        badge_emoji = "🟤"
        advice = "Hazardous smog alert! Stay indoors where possible."

    return {
        "aqi": aqi,
        "status": status,
        "color": color,
        "badge_emoji": badge_emoji,
        "advice": advice,
        "pm25": round(pm25, 1) if pm25 is not None else None,
        "pm10": round(pm10, 1) if pm10 is not None else None,
        "source": source
    }
