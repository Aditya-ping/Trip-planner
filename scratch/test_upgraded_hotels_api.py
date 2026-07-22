import requests
import json

try:
    print("=== TESTING HOTELS LIST ===")
    r = requests.get("http://127.0.0.1:5000/api/hotels?city=Jaipur")
    print("STATUS:", r.status_code)
    data = r.json()
    print("SUCCESS:", data.get("success"))
    print("DESTINATION:", data.get("destination"))
    print("HOTELS COUNT:", len(data.get("hotels", [])))
    if data.get("hotels"):
        hotel = data["hotels"][0]
        print("FIRST HOTEL SAMPLE:")
        print(f"Name: {hotel.get('name')}")
        print(f"Key: {hotel.get('key')}")
        print(f"Price: {hotel.get('price')}")
        print(f"Rating: {hotel.get('rating')}")
        print(f"Address: {hotel.get('address')}")
        print(f"Rooms count: {len(hotel.get('rooms', []))}")
        
        print("\n=== TESTING HOTEL RATES ===")
        hotel_key = hotel.get('key')
        r_rates = requests.get(f"http://127.0.0.1:5000/api/hotel-rates?hotel_key={hotel_key}")
        print("RATES STATUS:", r_rates.status_code)
        rates_data = r_rates.json()
        print("RATES SUCCESS:", rates_data.get("success"))
        print("RATES COUNT:", len(rates_data.get("rates", [])))
        if rates_data.get("rates"):
            print("FIRST RATE:", rates_data["rates"][0])
            
except Exception as e:
    print("ERROR:", e)
