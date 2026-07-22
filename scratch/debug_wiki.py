import requests

url = "https://en.wikipedia.org/w/api.php"
headers = {
    "User-Agent": "TravelEaseAI/1.0 (contact@traveleaseai.com)"
}
params = {
    "action": "query",
    "list": "search",
    "srsearch": "Vagator Beach, Goa",
    "srlimit": 3,
    "format": "json"
}

response = requests.get(url, headers=headers, params=params)
print("Vagator Beach, Goa Search Results:")
print(response.json())

params["srsearch"] = "Vagator Beach"
response = requests.get(url, headers=headers, params=params)
print("\nVagator Beach Search Results:")
print(response.json())
