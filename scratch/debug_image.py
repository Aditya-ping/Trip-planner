import requests

url = "https://en.wikipedia.org/w/api.php"
headers = {
    "User-Agent": "TravelEaseAI/1.0 (contact@traveleaseai.com)"
}
img_params = {
    "action": "query",
    "titles": "Vagator Beach",
    "prop": "pageimages",
    "piprop": "thumbnail",
    "pithumbsize": 640,
    "format": "json",
    "redirects": 1
}
response = requests.get(url, headers=headers, params=img_params)
print("Vagator Beach Image Response:")
print(response.json())
