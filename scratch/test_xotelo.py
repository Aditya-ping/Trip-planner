import requests
import json

url = "https://data.xotelo.com/api/list"
params = {
    "location_key": "g304555",
    "limit": 3,
    "offset": 0
}

try:
    r = requests.get(url, params=params, timeout=10)
    print("STATUS CODE:", r.status_code)
    data = r.json()
    print("KEYS:", list(data.keys()))
    if "result" in data:
        print("RESULT KEYS:", list(data["result"].keys()))
        print("HOTELS COUNT:", len(data["result"].get("list", [])))
        if data["result"].get("list"):
            print("FIRST HOTEL DATA:")
            print(json.dumps(data["result"]["list"][0], indent=2))
except Exception as e:
    print("ERROR:", e)
