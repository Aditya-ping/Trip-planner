import requests
import json
from utils.cache import get_cached_response, set_cached_response

# WMO Weather Interpretation Codes (WW) -> Condition name & Emoji
WMO_CODE_MAP = {
    0: ("Sunny", "☀️"),
    1: ("Mainly Clear", "🌤️"),
    2: ("Partly Cloudy", "⛅"),
    3: ("Overcast", "☁️"),
    45: ("Foggy", "🌫️"),
    48: ("Depositing Rime Fog", "🌫️"),
    51: ("Light Drizzle", "🌦️"),
    53: ("Moderate Drizzle", "🌦️"),
    55: ("Dense Drizzle", "🌧️"),
    61: ("Slight Rain", "🌦️"),
    63: ("Moderate Rain", "🌧️"),
    65: ("Heavy Rain", "🌧️"),
    71: ("Slight Snow", "🌨️"),
    73: ("Moderate Snow", "❄️"),
    75: ("Heavy Snow", "❄️"),
    77: ("Snow Grains", "❄️"),
    80: ("Slight Showers", "🌦️"),
    81: ("Moderate Showers", "🌧️"),
    82: ("Violent Showers", "⛈️"),
    85: ("Slight Snow Showers", "🌨️"),
    86: ("Heavy Snow Showers", "❄️"),
    95: ("Thunderstorm", "🌩️"),
    96: ("Thunderstorm with Hail", "⛈️"),
    99: ("Heavy Thunderstorm with Hail", "⛈️"),
}

def parse_wmo_code(code):
    return WMO_CODE_MAP.get(int(code), ("Variable", "🌤️"))


def get_open_meteo_forecast(lat, lon, days=7):
    """
    Fetches multi-day weather forecast from Open-Meteo API.
    Includes latitude, longitude, elevation, daily max/min temperatures,
    precipitation probability, and weather codes.
    """
    if lat is None or lon is None or lat == "INTERNATIONAL":
        return None

    # Round coords for cache key
    lat_r = round(float(lat), 2)
    lon_r = round(float(lon), 2)
    cache_key = f"openmeteo:{lat_r}:{lon_r}:{days}"

    cached = get_cached_response(cache_key)
    if cached is not None:
        return cached

    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat_r,
        "longitude": lon_r,
        "daily": "temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode",
        "forecast_days": max(1, min(days, 16)),
        "timezone": "auto"
    }

    try:
        resp = requests.get(url, params=params, timeout=5)
        if resp.status_code != 200:
            expired_cached = get_cached_response(cache_key, ignore_ttl=True)
            return expired_cached

        data = resp.json()
        elevation = data.get("elevation", 0)
        daily = data.get("daily", {})

        times = daily.get("time", [])
        max_temps = daily.get("temperature_2m_max", [])
        min_temps = daily.get("temperature_2m_min", [])
        precip_probs = daily.get("precipitation_probability_max", [])
        weathercodes = daily.get("weathercode", [])

        daily_list = []
        for i in range(len(times)):
            cond_text, cond_icon = parse_wmo_code(weathercodes[i] if i < len(weathercodes) else 0)
            daily_list.append({
                "day": i + 1,
                "date": times[i],
                "temp_max": round(max_temps[i]) if i < len(max_temps) else 30,
                "temp_min": round(min_temps[i]) if i < len(min_temps) else 20,
                "precip_probability": precip_probs[i] if i < len(precip_probs) else 0,
                "condition": cond_text,
                "icon": cond_icon,
                "weathercode": weathercodes[i] if i < len(weathercodes) else 0
            })

        result_payload = {
            "elevation_m": round(elevation),
            "daily": daily_list
        }
        set_cached_response(cache_key, result_payload, 10800)  # 3 hours TTL
        return result_payload

    except Exception as e:
        print(f"[Open-Meteo] Forecast fetch error: {e}. Checking fallback cache...")
        expired_cached = get_cached_response(cache_key, ignore_ttl=True)
        return expired_cached


def generate_smart_packing_advisory(forecast_data, city_name, days=3):
    """
    Generates dynamic packing list and climate summary based on:
    - Temperature thresholds (below 10°C, 10°C-18°C, above 32°C)
    - Precipitation probability (rain gear)
    - Elevation / Altitude (above 1500m)
    """
    city_lower = city_name.lower()
    
    # Defaults if no live forecast
    if not forecast_data or not forecast_data.get("daily"):
        min_temp = 18
        max_temp = 30
        max_precip = 20
        elevation = 200
        daily_list = []
    else:
        daily_list = forecast_data["daily"]
        min_temps = [d["temp_min"] for d in daily_list]
        max_temps = [d["temp_max"] for d in daily_list]
        precip_probs = [d["precip_probability"] for d in daily_list]
        min_temp = min(min_temps) if min_temps else 18
        max_temp = max(max_temps) if max_temps else 30
        max_precip = max(precip_probs) if precip_probs else 0
        elevation = forecast_data.get("elevation_m", 0)

    # Determine climate category & packing items dynamically
    packing_items = set()

    # Base Essentials
    packing_items.add("Comfortable walking / trail shoes")
    packing_items.add("Personal identification & travel documents")
    packing_items.add("Phone charger & portable power bank")
    packing_items.add("Personal medicines & basic first-aid kit")

    # 1. Temperature-Based Packing Rules
    if min_temp < 10:
        packing_items.add("Heavy fleece or down jacket")
        packing_items.add("Thermal innerwear set")
        packing_items.add("Woolen beanie & warm gloves")
        packing_items.add("Lip balm & moisturizing cold cream")
    elif min_temp < 18:
        packing_items.add("Light sweater / hoodie / windcheater")
        packing_items.add("Long trousers / comfortable jeans")

    if max_temp > 32:
        packing_items.add("Breathable linen / cotton apparel")
        packing_items.add("High protection sunscreen (SPF 50+)")
        packing_items.add("Polarized sunglasses & sun hat")
        packing_items.add("Electrolyte hydration packets")

    # 2. Precipitation-Based Packing Rules
    if max_precip >= 40:
        packing_items.add("Compact umbrella or waterproof raincoat / poncho")
        packing_items.add("Quick-dry clothing")
        packing_items.add("Waterproof footwear or sandals")

    # 3. Altitude & High-Elevation Rules (>1500m or known mountain towns)
    high_alt_keywords = ["leh", "ladakh", "manali", "shimla", "munnar", "ooty", "kodaikanal", "gangtok", "darjeeling", "gulmarg"]
    is_high_alt = elevation > 1500 or any(k in city_lower for k in high_alt_keywords)

    if is_high_alt:
        packing_items.add("Altitude sickness hydration tablets / Diamox (consult doctor)")
        packing_items.add("High-UV protective sunglasses")
        packing_items.add("Warm woolen socks & shawl")
        packing_items.add("Thermal water flask")

    # Dynamic Condition Summary String
    if is_high_alt:
        condition_str = "Alpine / High Altitude"
        desc_str = f"High elevation ({elevation}m). Expect crisp mountain air with high UV intensity and chilly evenings."
    elif max_precip >= 50:
        condition_str = "Wet / Rainy Showers"
        desc_str = f"Rain expected ({max_precip}% max precipitation chance). Keep waterproof gear handy."
    elif max_temp > 33:
        condition_str = "Hot & Sunny"
        desc_str = f"Warm sunny climate (up to {max_temp}°C). Stay hydrated and protect yourself from intense sun."
    elif min_temp < 12:
        condition_str = "Cold & Chilly"
        desc_str = f"Chilly temperatures (low of {min_temp}°C). Layering warm clothes is essential."
    else:
        condition_str = "Pleasant / Moderate"
        desc_str = f"Comfortable moderate weather ({min_temp}°C to {max_temp}°C). Great conditions for sightseeing."

    return {
        "temp": f"{min_temp}°C - {max_temp}°C",
        "condition": condition_str,
        "description": desc_str,
        "elevation_m": elevation,
        "packing": sorted(list(packing_items)),
        "daily_forecast": daily_list
    }
