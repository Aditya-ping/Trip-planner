import sqlite3
import requests
import time

def get_wikipedia_image(place_name, city):
    url = "https://en.wikipedia.org/w/api.php"
    headers = {
        "User-Agent": "TravelEaseAI/1.0 (contact@traveleaseai.com)"
    }
    
    # Try with place name and city first for specificity
    queries = [f"{place_name} {city}", place_name]
    
    for query in queries:
        params = {
            "action": "query",
            "generator": "search",
            "gsrsearch": query,
            "gsrlimit": 1,
            "prop": "pageimages",
            "piprop": "thumbnail",
            "pithumbsize": 640,
            "format": "json"
        }
        try:
            response = requests.get(url, headers=headers, params=params, timeout=5)
            if response.status_code == 200:
                data = response.json()
                pages = data.get("query", {}).get("pages", {})
                for page_id, page_data in pages.items():
                    thumbnail = page_data.get("thumbnail", {})
                    source = thumbnail.get("source")
                    if source:
                        return source
            time.sleep(0.1) # Throttle slightly to respect MediaWiki API
        except Exception as e:
            print(f"Error querying Wikipedia for '{query}':", e)
    return None

conn = sqlite3.connect("database.db")
cursor = conn.cursor()

# Get all places using loremflickr placeholders
cursor.execute("SELECT id, name, city, image FROM places WHERE image LIKE '%loremflickr.com%'")
places = cursor.fetchall()
print(f"Found {len(places)} places with loremflickr placeholder images.")

updated_count = 0
for idx, (place_id, name, city, old_image) in enumerate(places):
    print(f"[{idx+1}/{len(places)}] Fetching image for '{name}' in '{city}'...")
    new_image = get_wikipedia_image(name, city)
    if new_image:
        cursor.execute("UPDATE places SET image = ? WHERE id = ?", (new_image, place_id))
        conn.commit()
        print(f"  -> Updated to: {new_image}")
        updated_count += 1
    else:
        print(f"  -> No Wikipedia image found. Keeping placeholder.")

conn.close()
print(f"\nCompleted database image enrichment! Updated {updated_count} places.")
