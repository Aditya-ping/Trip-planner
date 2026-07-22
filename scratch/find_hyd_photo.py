import requests
import re

url = "https://html.duckduckgo.com/html/?q=charminar+hyderabad+unsplash"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36"
}

try:
    r = requests.get(url, headers=headers, timeout=5)
    # Find all references to "photo-" followed by digits and hex values
    matches = re.findall(r'photo-\d+-[a-zA-Z0-9]+', r.text)
    print("Found photo matches:", set(matches))
except Exception as e:
    print("Error:", e)
