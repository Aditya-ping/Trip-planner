import requests
import json

try:
    r = requests.get("http://127.0.0.1:5000/api/hotels?city=Jaipur")
    print("STATUS:", r.status_code)
    data = r.json()
    print("SUCCESS:", data.get("success"))
    print("SOURCE:", data.get("source"))
    print("HOTELS COUNT:", len(data.get("hotels", [])))
    if data.get("hotels"):
        print("FIRST HOTEL SAMPLE:")
        print(json.dumps(data["hotels"][0], indent=2))
except Exception as e:
    print("ERROR:", e)
