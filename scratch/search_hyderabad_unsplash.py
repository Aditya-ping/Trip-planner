import requests
import re

url = "https://html.duckduckgo.com/html/?q=gangtok+sikkim+unsplash"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36"
}

try:
    r = requests.get(url, headers=headers, timeout=5)
    matches = re.findall(r'unsplash\.com/photos/([a-zA-Z0-9\-]+)', r.text)
    print("Matches found for Gangtok:", matches)
except Exception as e:
    print("Error:", e)
