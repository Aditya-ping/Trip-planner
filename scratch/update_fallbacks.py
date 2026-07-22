import sqlite3
import json
import os

NEW_FALLBACKS = {
    "Gangtok": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop",
    "Hyderabad": "https://images.unsplash.com/photo-1581888227599-779811939961?w=800&auto=format&fit=crop",
    "Jaipur": "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop",
    "Jodhpur": "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&auto=format&fit=crop",
    "Kochi": "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=800&auto=format&fit=crop",
    "Mysore": "https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?w=800&auto=format&fit=crop",
    "Pondicherry": "https://images.unsplash.com/photo-1589519160732-57fc498494f8?w=800&auto=format&fit=crop",
    "Rishikesh": "https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=800&auto=format&fit=crop",
    "Shimla": "https://images.unsplash.com/photo-1597074866923-dc0589150358?w=800&auto=format&fit=crop",
    "Varanasi": "https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800&auto=format&fit=crop"
}

OLD_FALLBACKS = {
    "Gangtok": "https://images.unsplash.com/photo-1589136775551-7c232f186359?w=800&auto=format&fit=crop",
    "Hyderabad": "https://images.unsplash.com/photo-1608958220963-6b4e9000a31a?w=800&auto=format&fit=crop",
    "Jaipur": "https://images.unsplash.com/photo-1477584308802-e9c3788ee454?w=800&auto=format&fit=crop",
    "Jodhpur": "https://images.unsplash.com/photo-1562137569-22a4669864cc?w=800&auto=format&fit=crop",
    "Kochi": "https://images.unsplash.com/photo-1582538562805-2432a59a7a97?w=800&auto=format&fit=crop",
    "Mysore": "https://images.unsplash.com/photo-1584813530366-267f339cf062?w=800&auto=format&fit=crop",
    "Pondicherry": "https://images.unsplash.com/photo-1586795493033-b184b25dfc5e?w=800&auto=format&fit=crop",
    "Rishikesh": "https://images.unsplash.com/photo-1598977123418-45f04b615237?w=800&auto=format&fit=crop",
    "Shimla": "https://images.unsplash.com/photo-1562670224-e1b66b26d80f?w=800&auto=format&fit=crop"
}

def update_json():
    json_path = "data/places.json"
    if os.path.exists(json_path):
        with open(json_path, "r", encoding="utf-8") as file:
            places = json.load(file)
        
        updated = 0
        for p in places:
            city = p.get("city")
            img = p.get("image", "")
            if city in NEW_FALLBACKS and (img == OLD_FALLBACKS.get(city) or "loremflickr" in img):
                p["image"] = NEW_FALLBACKS[city]
                updated += 1
            # Varanasi fallback was not in OLD_FALLBACKS, but let's check if it matches loremflickr or is old wiki
            if city == "Varanasi" and "loremflickr" in img:
                p["image"] = NEW_FALLBACKS[city]
                updated += 1
                
        with open(json_path, "w", encoding="utf-8") as file:
            json.dump(places, file, indent=2, ensure_ascii=False)
        print(f"Updated {updated} fallback images in {json_path}")

def update_db():
    db_path = "database.db"
    if os.path.exists(db_path):
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        updated = 0
        for city, new_img in NEW_FALLBACKS.items():
            old_img = OLD_FALLBACKS.get(city)
            if old_img:
                cursor.execute("UPDATE places SET image = ? WHERE image = ? AND LOWER(city) = ?", (new_img, old_img, city.lower()))
                updated += cursor.rowcount
            # Also cover case where some place had loremflickr and wasn't updated, or has other 404
            cursor.execute("UPDATE places SET image = ? WHERE (image LIKE '%loremflickr%' OR image IS NULL) AND LOWER(city) = ?", (new_img, city.lower()))
            updated += cursor.rowcount
            
        # Specific update for Varanasi
        cursor.execute("UPDATE places SET image = ? WHERE (image LIKE '%loremflickr%' OR image IS NULL) AND LOWER(city) = 'varanasi'", (NEW_FALLBACKS["Varanasi"],))
        updated += cursor.rowcount
        
        conn.commit()
        conn.close()
        print(f"Updated {updated} fallback images in {db_path}")

if __name__ == "__main__":
    update_json()
    update_db()
