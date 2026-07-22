import requests
import re
import urllib.parse

packages = {
    "Jaipur": "jaipur+rajasthan+unsplash",
    "Kerala": "kerala+backwaters+unsplash",
    "Goa": "goa+beach+unsplash",
    "Ladakh": "leh+ladakh+unsplash",
    "Varanasi": "varanasi+ghat+unsplash",
    "TajMahal": "taj+mahal+agra+unsplash"
}

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36"
}

for name, query in packages.items():
    print(f"Searching for {name}...")
    url = f"https://html.duckduckgo.com/html/?q={query}"
    try:
        r = requests.get(url, headers=headers, timeout=5)
        # Decode the html text first to make regex matching easy
        decoded_text = urllib.parse.unquote(r.text)
        matches = re.findall(r'unsplash\.com/photos/([a-zA-Z0-9\-]+)', decoded_text)
        
        working = []
        seen = set()
        for m in matches:
            parts = m.split('-')
            photo_id = parts[-1] if len(parts[-1]) >= 8 else m
            if photo_id not in seen and len(photo_id) >= 6:
                seen.add(photo_id)
                test_url = f"https://images.unsplash.com/{photo_id}?w=800&auto=format&fit=crop"
                try:
                    res = requests.head(test_url, timeout=2.0)
                    if res.status_code == 200:
                        working.append(test_url)
                        if len(working) >= 4:
                            break
                except Exception:
                    pass
        print(f"  -> Found {len(working)} verified images for {name}:")
        for w in working:
            print(f"     {w}")
    except Exception as e:
        print(f"  -> Error for {name}: {e}")
