import json

with open("data/places.json", "r", encoding="utf-8") as file:
    places = json.load(file)

domains = {}
lorem_count = 0
wiki_count = 0
other_count = 0

for p in places:
    image = p.get("image", "")
    if "loremflickr" in image:
        lorem_count += 1
    elif "wikimedia" in image or "wikipedia" in image:
        wiki_count += 1
    else:
        other_count += 1
        domain = image.split("//")[1].split("/")[0] if "//" in image else image
        domains[domain] = domains.get(domain, 0) + 1

print(f"Total places in JSON: {len(places)}")
print(f"Loremflickr images: {lorem_count}")
print(f"Wikipedia/Wikimedia images: {wiki_count}")
print(f"Other domains: {domains}")
