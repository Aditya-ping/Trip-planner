import requests
import json

def get_wikipedia_image_improved(place_name, city):
    # Try searching for the exact page first
    url = "https://en.wikipedia.org/w/api.php"
    headers = {
        "User-Agent": "TravelEaseAI/1.0 (contact@traveleaseai.com)"
    }
    
    # Strategy 1: Search by title match (opensearch or query search)
    # Let's try searching Wikipedia with the query. We'll limit to 3 results and verify them.
    query = f"{place_name}, {city}"
    params = {
        "action": "query",
        "list": "search",
        "srsearch": query,
        "srlimit": 3,
        "format": "json"
    }
    
    try:
        response = requests.get(url, headers=headers, params=params, timeout=5)
        if response.status_code == 200:
            data = response.json()
            search_results = data.get("query", {}).get("search", [])
            
            # Find the best page from results
            best_title = None
            for result in search_results:
                title = result.get("title", "")
                # Clean and compare title
                # If the title is too unrelated, we might skip it.
                # E.g., for "Chokhi Dhani, Jaipur", if search results are completely unrelated, we skip.
                # Let's check if the place name or parts of it are in the title.
                words = [w.lower() for w in place_name.split() if len(w) > 2]
                title_lower = title.lower()
                
                # Check if at least one significant word from the place name is in the title, 
                # or if the title contains the city name and some place keywords.
                match_count = sum(1 for w in words if w in title_lower)
                if match_count >= max(1, len(words) // 2) or place_name.lower() in title_lower:
                    best_title = title
                    break
            
            # If we didn't find a good match with f"{place_name}, {city}", try just place_name
            if not best_title:
                params["srsearch"] = place_name
                response = requests.get(url, headers=headers, params=params, timeout=5)
                if response.status_code == 200:
                    data = response.json()
                    search_results = data.get("query", {}).get("search", [])
                    for result in search_results:
                        title = result.get("title", "")
                        words = [w.lower() for w in place_name.split() if len(w) > 2]
                        title_lower = title.lower()
                        match_count = sum(1 for w in words if w in title_lower)
                        if match_count >= max(1, len(words) // 2) or place_name.lower() in title_lower:
                            best_title = title
                            break

            if best_title:
                # Fetch the image of the best page title
                img_params = {
                    "action": "query",
                    "titles": best_title,
                    "prop": "pageimages",
                    "piprop": "thumbnail",
                    "pithumbsize": 640,
                    "format": "json",
                    "redirects": 1
                }
                img_response = requests.get(url, headers=headers, params=img_params, timeout=5)
                if img_response.status_code == 200:
                    img_data = img_response.json()
                    pages = img_data.get("query", {}).get("pages", {})
                    for page_id, page_data in pages.items():
                        thumbnail = page_data.get("thumbnail", {})
                        source = thumbnail.get("source")
                        if source:
                            return best_title, source
    except Exception as e:
        print(f"Error for '{place_name}': {e}")
    
    return None, None

test_cases = [
    ("Hawa Mahal", "Jaipur"),
    ("Patrika Gate", "Jaipur"),
    ("Chokhi Dhani", "Jaipur"),
    ("Wildlife SOS", "Agra"),
    ("Colaba Causeway", "Mumbai"),
    ("Vagator Beach", "Goa"),
    ("Banaras Hindu University", "Varanasi"),
    ("Balsamand Lake", "Jodhpur"),
    ("Beatles Ashram", "Rishikesh")
]

for name, city in test_cases:
    title, img = get_wikipedia_image_improved(name, city)
    print(f"Query: {name} ({city}) => Found Title: '{title}' => Image: {img}")
