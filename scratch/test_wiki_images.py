import requests

def get_wikipedia_image(query):
    url = "https://en.wikipedia.org/w/api.php"
    headers = {
        "User-Agent": "TravelEaseAI/1.0 (contact@traveleaseai.com)"
    }
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
    except Exception as e:
        print(f"Error querying Wikipedia for '{query}':", e)
    return None

test_queries = [
    "Hawa Mahal Jaipur",
    "Taj Mahal Agra",
    "Amber Fort Jaipur",
    "Gateway of India Mumbai",
    "Pangong Lake Leh Ladakh",
    "Eravikulam National Park Munnar",
    "Dudhsagar Falls Goa",
    "Kashi Vishwanath Temple Varanasi",
    "Shanti Stupa Leh Ladakh",
    "Rose Garden Ooty",
    "Promenade Beach Pondicherry"
]

for q in test_queries:
    img = get_wikipedia_image(q)
    print(f"Query: {q} => Image URL: {img}")
