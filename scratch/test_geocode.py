import os
import requests
from dotenv import load_dotenv

load_dotenv()

def get_city_coordinates(city):
    api_key = os.getenv("GEOAPIFY_KEY")
    if not api_key:
        print("No GEOAPIFY_KEY found")
        return None, None
    try:
        # Query WITHOUT filter=countrycode:in, but WITH type=city to ensure it is a city/locality
        response = requests.get(
            "https://api.geoapify.com/v1/geocode/search",
            params={"text": city, "limit": 1, "type": "city", "apiKey": api_key}
        )
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            if data.get("features"):
                properties = data["features"][0]["properties"]
                country_code = properties.get("country_code", "").lower()
                country = properties.get("country", "").lower()
                name = properties.get("city", properties.get("name", ""))
                result_type = properties.get("result_type", "")
                print(f"Geocoded properties: city={name}, country_code={country_code}, country={country}, type={result_type}")
                if country_code == "in" or "india" in country:
                    lon, lat = data["features"][0]["geometry"]["coordinates"]
                    return lat, lon
                else:
                    return "INTERNATIONAL", None
            else:
                print("No features in geocoding response")
    except Exception as e:
        print("Geocoding error:", e)
    return None, None

print("Testing Paris:")
print(get_city_coordinates("Paris"))
print("\nTesting London:")
print(get_city_coordinates("London"))
print("\nTesting New York:")
print(get_city_coordinates("New York"))
print("\nTesting Jaipur:")
print(get_city_coordinates("Jaipur"))
print("\nTesting Goa:")
print(get_city_coordinates("Goa"))
