import requests
import urllib.parse

url = "https://html.duckduckgo.com/html/?q=site:unsplash.com+jaipur"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36"
}
try:
    r = requests.get(url, headers=headers, timeout=5)
    for line in r.text.splitlines():
        if "unsplash" in line:
            print(line[:200])
except Exception as e:
    print(e)
