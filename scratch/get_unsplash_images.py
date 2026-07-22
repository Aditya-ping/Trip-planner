import requests
import re

def get_unsplash_ids(query):
    url = f"https://unsplash.com/s/photos/{query}"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36"
    }
    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code == 200:
            matches = re.findall(r'photo-\d+-[a-zA-Z0-9]+', response.text)
            if matches:
                seen = set()
                unique_ids = []
                for m in matches:
                    if m not in seen:
                        seen.add(m)
                        unique_ids.append(m)
                return unique_ids[:5]
    except Exception as e:
        print(f"Error querying Unsplash for {query}:", e)
    return []

queries = ["vagator-beach-goa", "colaba-causeway-mumbai", "beatles-ashram-rishikesh", "wildlife-sos-agra"]
for q in queries:
    ids = get_unsplash_ids(q)
    print(f"Query: {q} => Photo IDs: {ids}")
    if ids:
        print(f"  First Image URL: https://images.unsplash.com/{ids[0]}?auto=format&fit=crop&w=800&q=80")
