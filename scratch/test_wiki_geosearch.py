import requests
import json

def test_geosearch(lat, lon):
    url = "https://en.wikipedia.org/w/api.php"
    headers = {
        "User-Agent": "TravelEaseAI/1.0 (contact@traveleaseai.com)"
    }
    params = {
        "action": "query",
        "generator": "geosearch",
        "ggscoord": f"{lat}|{lon}",
        "ggsradius": 10000, # 10km radius
        "ggslimit": 50,
        "prop": "pageimages",
        "piprop": "thumbnail",
        "pithumbsize": 640,
        "format": "json"
    }
    
    try:
        response = requests.get(url, headers=headers, params=params, timeout=5)
        print("Status Code:", response.status_code)
        if response.status_code == 200:
            data = response.json()
            pages = data.get("query", {}).get("pages", {})
            print(f"Found {len(pages)} Wikipedia pages nearby.")
            for page_id, page_data in list(pages.items())[:10]:
                title = page_data.get("title")
                thumbnail = page_data.get("thumbnail", {})
                source = thumbnail.get("source")
                print(f"Page: {title} => Image: {source}")
    except Exception as e:
        print("Error:", e)

print("Testing for Jaipur (26.915, 75.818):")
test_geosearch(26.9154576, 75.8189817)
