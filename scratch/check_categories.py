import json

with open("data/places.json", "r", encoding="utf-8") as file:
    places = json.load(file)

cities = set()
categories = set()
for p in places:
    cities.add(p.get("city"))
    categories.add(p.get("category"))

print("Cities in JSON:", sorted(list(cities)))
print("Categories in JSON:", sorted(list(categories)))
