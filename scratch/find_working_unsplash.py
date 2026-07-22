import requests
import re

url = "https://unsplash.com/s/photos/hyderabad"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36"
}

try:
    r = requests.get(url, headers=headers, timeout=5)
    print("Response status:", r.status_code)
    
    # Search for anything matching images.unsplash.com/photo-...
    urls = re.findall(r'https://images.unsplash.com/photo-[a-zA-Z0-9\-?=&;_%]+', r.text)
    print("Found total photo URLs:", len(urls))
    
    working_urls = []
    seen = set()
    for u in urls:
        # Clean URL to base photo path
        base_match = re.search(r'photo-[a-zA-Z0-9\-]+', u)
        if base_match:
            photo_id = base_match.group(0)
            if photo_id not in seen:
                seen.add(photo_id)
                test_url = f"https://images.unsplash.com/{photo_id}?w=800&auto=format&fit=crop"
                try:
                    head_res = requests.head(test_url, timeout=2.0)
                    if head_res.status_code == 200:
                        working_urls.append(test_url)
                        print("Working URL:", test_url)
                        if len(working_urls) >= 5:
                            break
                except Exception:
                    pass
except Exception as e:
    print("Error:", e)
