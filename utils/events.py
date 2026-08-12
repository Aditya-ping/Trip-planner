import os
import requests
import logging
from datetime import datetime
from utils.cache import get_cached_response, set_cached_response

logger = logging.getLogger("aerotravel")

SERPAPI_KEY = os.getenv("SERPAPI_KEY")

def fetch_live_events(city: str):
    """
    Fetches live events from SerpApi Google Events API for a given city in India.
    Falls back gracefully to an empty list if API key is not configured or request fails.
    Results are cached to prevent unnecessary external API calls.
    """
    if not SERPAPI_KEY:
        logger.info(f"SERPAPI_KEY not configured. Skipping live API fetch for {city}.")
        return []

    cache_key = f"serpapi_events_{city.lower()}"
    cached = get_cached_response(cache_key)
    if cached:
        return cached

    url = "https://serpapi.com/search.json"
    params = {
        "engine": "google_events",
        "q": f"events in {city}, India",
        "hl": "en",
        "gl": "in",
        "api_key": SERPAPI_KEY
    }

    try:
        response = requests.get(url, params=params, timeout=8)
        if response.status_code != 200:
            logger.warning(f"SerpApi request failed with status {response.status_code} for city {city}")
            return []

        data = response.json()
        events_data = data.get("events_results", [])
        
        parsed_events = []
        for item in events_data:
            title = item.get("title")
            if not title:
                continue

            date_info = item.get("date", {})
            start_date_str = date_info.get("start_date") or datetime.now().strftime("%Y-%m-%d")
            # Parse or default dates
            description = item.get("description", "")
            venue = item.get("venue", {}).get("name", f"{city}, India")
            
            # Map category heuristics
            title_lower = title.lower()
            category = "concert" if any(w in title_lower for w in ["concert", "music", "dj", "band", "live"]) else \
                       "festival" if any(w in title_lower for w in ["fest", "festival", "utsav", "carnival"]) else \
                       "market" if any(w in title_lower for w in ["bazaar", "market", "flea", "craft"]) else \
                       "fair" if any(w in title_lower for w in ["fair", "mela", "expo"]) else "other"

            parsed_events.append({
                "id": None, # Dynamic API event
                "city": city,
                "title": title,
                "description": description or f"Live event taking place at {venue}.",
                "category": category,
                "start_date": start_date_str,
                "end_date": start_date_str,
                "location_name": venue,
                "latitude": None,
                "longitude": None,
                "source": "api",
                "submitted_by": None,
                "status": "approved",
                "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            })

        set_cached_response(cache_key, parsed_events, ttl_seconds=3600)
        return parsed_events

    except Exception as e:
        logger.error(f"Error fetching live events from SerpApi for {city}: {e}")
        return []
