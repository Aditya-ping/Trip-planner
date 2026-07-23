import os
import requests
import logging
from utils.cache import get_cached_response, set_cached_response

logger = logging.getLogger("aerotravel.trains")

# Standard Indian Railway Station Code Mapping
STATION_CODE_MAP = {
    "delhi": "NDLS",
    "new delhi": "NDLS",
    "jaipur": "JP",
    "jodhpur": "JU",
    "udaipur": "UDZ",
    "mumbai": "CSMT",
    "bombay": "CSMT",
    "goa": "MAO",
    "madgaon": "MAO",
    "bangalore": "SBC",
    "bengaluru": "SBC",
    "kochi": "ERS",
    "cochin": "ERS",
    "alleppey": "ALLP",
    "munnar": "ERS",
    "chennai": "MAS",
    "kolkata": "HWH",
    "hyderabad": "SC",
    "secunderabad": "SC",
    "agra": "AGC",
    "varanasi": "BSB",
    "amritsar": "ASR",
    "shimla": "SML",
    "chandigarh": "CDG",
    "leh": "SXR",
    "ladakh": "SXR"
}

# Offline Curated Express Train Database (Fallback for API Rate Limits / Scraping Breaks)
FALLBACK_TRAINS_DB = [
    {
        "train_number": "12015",
        "train_name": "New Delhi - Ajmer Shatabdi Express",
        "from_station": "NDLS (New Delhi)",
        "to_station": "JP (Jaipur)",
        "departure_time": "06:00 AM",
        "arrival_time": "10:40 AM",
        "duration": "4h 40m",
        "classes": ["CC (AC Chair Car)", "EC (Executive Chair Car)"],
        "fare_min": 780,
        "fare_max": 1450,
        "route_key": "delhi_jaipur"
    },
    {
        "train_number": "20977",
        "train_name": "Vande Bharat Express",
        "from_station": "NDLS (New Delhi)",
        "to_station": "JP (Jaipur)",
        "departure_time": "06:10 AM",
        "arrival_time": "09:55 AM",
        "duration": "3h 45m",
        "classes": ["CC (AC Chair Car)", "EC (Executive Chair Car)"],
        "fare_min": 890,
        "fare_max": 1680,
        "route_key": "delhi_jaipur"
    },
    {
        "train_number": "12051",
        "train_name": "Jan Shatabdi Express",
        "from_station": "CSMT (Mumbai)",
        "to_station": "MAO (Madgaon, Goa)",
        "departure_time": "05:25 AM",
        "arrival_time": "02:10 PM",
        "duration": "8h 45m",
        "classes": ["2S (Second Seating)", "CC (AC Chair Car)"],
        "fare_min": 310,
        "fare_max": 940,
        "route_key": "mumbai_goa"
    },
    {
        "train_number": "22223",
        "train_name": "Mumbai - Goa Vande Bharat Express",
        "from_station": "CSMT (Mumbai)",
        "to_station": "MAO (Madgaon, Goa)",
        "departure_time": "05:35 AM",
        "arrival_time": "01:25 PM",
        "duration": "7h 50m",
        "classes": ["CC (AC Chair Car)", "EC (Executive Chair Car)"],
        "fare_min": 1435,
        "fare_max": 2855,
        "route_key": "mumbai_goa"
    },
    {
        "train_number": "12677",
        "train_name": "Ernakulam Intercity Express",
        "from_station": "SBC (Bangalore)",
        "to_station": "ERS (Ernakulam / Kochi)",
        "departure_time": "06:10 AM",
        "arrival_time": "04:55 PM",
        "duration": "10h 45m",
        "classes": ["CC (AC Chair Car)", "2S (Second Seating)"],
        "fare_min": 240,
        "fare_max": 810,
        "route_key": "bangalore_kochi"
    },
    {
        "train_number": "12004",
        "train_name": "Lucknow Shatabdi Express",
        "from_station": "NDLS (New Delhi)",
        "to_station": "AGC (Agra Cantt)",
        "departure_time": "06:10 AM",
        "arrival_time": "07:50 AM",
        "duration": "1h 40m",
        "classes": ["CC (AC Chair Car)", "EC (Executive Chair Car)"],
        "fare_min": 495,
        "fare_max": 995,
        "route_key": "delhi_agra"
    }
]


def resolve_station_code(location_name):
    if not location_name:
        return "NDLS"
    loc_clean = location_name.strip().lower()
    for city, code in STATION_CODE_MAP.items():
        if city in loc_clean or loc_clean in city:
            return code
    return location_name.strip().upper()[:4]


def search_indian_trains(origin, destination, date_str=None):
    """
    Searches domestic Indian Railways train schedules.
    Supports third-party RapidAPI wrappers and fallback to offline curated dataset.
    All returned items carry an explicit 'is_unofficial_data': True flag and disclaimer.
    """
    from_code = resolve_station_code(origin)
    to_code = resolve_station_code(destination)
    cache_key = f"trains:search:{from_code}:{to_code}"

    cached = get_cached_response(cache_key)
    if cached is not None:
        return cached

    rapidapi_key = os.getenv("RAPIDAPI_KEY") or os.getenv("RAIL_API_KEY")
    trains_list = []

    # Tier 1: RapidAPI Indian Railways wrapper (if key provided)
    if rapidapi_key:
        try:
            url = "https://indian-railways1.p.rapidapi.com/trainsBetweenStations"
            headers = {
                "X-RapidAPI-Key": rapidapi_key,
                "X-RapidAPI-Host": "indian-railways1.p.rapidapi.com"
            }
            params = {"fromStationCode": from_code, "toStationCode": to_code}
            resp = requests.get(url, headers=headers, params=params, timeout=4)
            if resp.status_code == 200:
                data = resp.json()
                results = data.get("trains", [])
                for t in results[:6]:
                    trains_list.append({
                        "train_number": str(t.get("trainNumber", "12000")),
                        "train_name": t.get("trainName", "Express Special"),
                        "from_station": f"{from_code} ({origin.title()})",
                        "to_station": f"{to_code} ({destination.title()})",
                        "departure_time": t.get("departureTime", "07:00 AM"),
                        "arrival_time": t.get("arrivalTime", "12:00 PM"),
                        "duration": t.get("duration", "5h 00m"),
                        "classes": ["CC (AC Chair)", "3A (3-Tier AC)"],
                        "fare_min": 450,
                        "fare_max": 1250,
                        "is_unofficial_data": True,
                        "data_source": "RapidAPI Scraper",
                        "disclaimer": "⚡ Unofficial third-party rail data. Schedules carry no IRCTC uptime guarantee."
                    })
        except Exception as e:
            print(f"[Train API Error] {e}")

    # Tier 2: Offline Curated Express Train Database
    if not trains_list:
        from_lower = origin.lower()
        to_lower = destination.lower()

        matched = [
            t for t in FALLBACK_TRAINS_DB
            if (from_lower in t["route_key"] or to_lower in t["route_key"])
        ]

        if not matched:
            matched = FALLBACK_TRAINS_DB[:3]

        for t in matched:
            trains_list.append({
                "train_number": t["train_number"],
                "train_name": t["train_name"],
                "from_station": t["from_station"],
                "to_station": t["to_station"],
                "departure_time": t["departure_time"],
                "arrival_time": t["arrival_time"],
                "duration": t["duration"],
                "classes": t["classes"],
                "fare_min": t["fare_min"],
                "fare_max": t["fare_max"],
                "is_unofficial_data": True,
                "data_source": "Offline Schedule Database",
                "disclaimer": "⚡ Unofficial third-party rail data. Schedules carry no IRCTC uptime guarantee."
            })

    payload = {
        "success": True,
        "origin": origin,
        "destination": destination,
        "from_code": from_code,
        "to_code": to_code,
        "trains": trains_list,
        "disclaimer": "⚡ Unofficial third-party rail data. Indian Railways/IRCTC has no public open API. Data is for informational trip-planning purposes only."
    }

    set_cached_response(cache_key, payload, 7200)  # 2 hours TTL
    return payload
