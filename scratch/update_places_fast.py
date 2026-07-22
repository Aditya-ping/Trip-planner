import json
import sqlite3
import os
import time
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed

CITY_FALLBACK_IMAGES = {
    "Jaipur": "https://images.unsplash.com/photo-1477584308802-e9c3788ee454?w=800&auto=format&fit=crop",
    "Jodhpur": "https://images.unsplash.com/photo-1562137569-22a4669864cc?w=800&auto=format&fit=crop",
    "Udaipur": "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?w=800&auto=format&fit=crop",
    "Kochi": "https://images.unsplash.com/photo-1582538562805-2432a59a7a97?w=800&auto=format&fit=crop",
    "Munnar": "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=800&auto=format&fit=crop",
    "Leh Ladakh": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&auto=format&fit=crop",
    "Manali": "https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=800&auto=format&fit=crop",
    "Shimla": "https://images.unsplash.com/photo-1562670224-e1b66b26d80f?w=800&auto=format&fit=crop",
    "Gangtok": "https://images.unsplash.com/photo-1589136775551-7c232f186359?w=800&auto=format&fit=crop",
    "Rishikesh": "https://images.unsplash.com/photo-1598977123418-45f04b615237?w=800&auto=format&fit=crop",
    "Goa": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop",
    "Ooty": "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&auto=format&fit=crop",
    "Kodaikanal": "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&auto=format&fit=crop",
    "Pondicherry": "https://images.unsplash.com/photo-1586795493033-b184b25dfc5e?w=800&auto=format&fit=crop",
    "Mysore": "https://images.unsplash.com/photo-1584813530366-267f339cf062?w=800&auto=format&fit=crop",
    "Mumbai": "https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=800&auto=format&fit=crop",
    "Delhi": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&auto=format&fit=crop",
    "Bangalore": "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800&auto=format&fit=crop",
    "Kolkata": "https://images.unsplash.com/photo-1558431382-27e303142255?w=800&auto=format&fit=crop",
    "Hyderabad": "https://images.unsplash.com/photo-1608958220963-6b4e9000a31a?w=800&auto=format&fit=crop",
    "Amritsar": "https://images.unsplash.com/photo-1514222134-b57cbb8ce073?w=800&auto=format&fit=crop",
    "Varanasi": "https://images.unsplash.com/photo-1561361058-c24e014f9d25?w=800&auto=format&fit=crop",
    "Agra": "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&auto=format&fit=crop",
}

def check_match(place_name, wikipedia_title):
    title_lower = wikipedia_title.lower()
    place_lower = place_name.lower()
    
    # 1. Substring matches
    p_clean = ''.join(c for c in place_lower if c.isalnum() or c.isspace())
    t_clean = ''.join(c for c in title_lower if c.isalnum() or c.isspace())
    if p_clean in t_clean or t_clean in p_clean:
        return True
        
    # 2. Keyword match
    keywords = [w.lower() for w in place_name.split() if w.lower() not in ["and", "the", "of", "in", "to", "for", "at", "a", "an", "is", "on"] and len(w) >= 3]
    if not keywords:
        return place_lower in title_lower
        
    # If <= 2 keywords, ALL must match (e.g. "Colaba Causeway" -> both "colaba" and "causeway" must be in title)
    if len(keywords) <= 2:
        return all(k in title_lower for k in keywords)
        
    # If > 2 keywords, at least len(keywords) - 1 must match
    match_count = sum(1 for k in keywords if k in title_lower)
    return match_count >= (len(keywords) - 1)

def get_wikipedia_image_strict(place_name, city):
    url = "https://en.wikipedia.org/w/api.php"
    headers = {
        "User-Agent": "TravelEaseAI/1.0 (contact@traveleaseai.com)"
    }
    
    place_cleaned = place_name.strip()
    queries = [f"{place_cleaned} {city}", place_cleaned]
    
    for q in queries:
        params = {
            "action": "query",
            "list": "search",
            "srsearch": q,
            "srlimit": 3,
            "format": "json"
        }
        try:
            response = requests.get(url, headers=headers, params=params, timeout=4.0)
            if response.status_code == 200:
                search_results = response.json().get("query", {}).get("search", [])
                for result in search_results:
                    title = result.get("title", "")
                    
                    if check_match(place_cleaned, title):
                        img_params = {
                            "action": "query",
                            "titles": title,
                            "prop": "pageimages",
                            "piprop": "thumbnail",
                            "pithumbsize": 640,
                            "format": "json",
                            "redirects": 1
                        }
                        img_response = requests.get(url, headers=headers, params=img_params, timeout=4.0)
                        if img_response.status_code == 200:
                            pages = img_response.json().get("query", {}).get("pages", {})
                            for page_id, page_data in pages.items():
                                thumbnail = page_data.get("thumbnail", {})
                                source = thumbnail.get("source")
                                if source and not any(x in source.lower() for x in ["globe", "map_marker", "earth", "satellite", "pitt_icon", "locator"]):
                                    return source
        except Exception as e:
            pass
            
    return None

def process_place(p, idx, total):
    name = p.get("name")
    city = p.get("city")
    img = p.get("image", "")
    
    # If the image contains loremflickr or is empty, we must update it
    if "loremflickr" in img or not img:
        new_img = get_wikipedia_image_strict(name, city)
        if new_img:
            p["image"] = new_img
            print(f"[{idx}/{total}] {name} ({city}) -> Found Strict Wiki: {new_img}")
        else:
            fallback = CITY_FALLBACK_IMAGES.get(city) or "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop"
            p["image"] = fallback
            print(f"[{idx}/{total}] {name} ({city}) -> Fallback: {fallback}")
    return p

def main():
    start_time = time.time()
    print("Starting optimized parallel migration...")
    
    # 1. Update data/places.json
    json_path = "data/places.json"
    if os.path.exists(json_path):
        print(f"Loading {json_path}...")
        with open(json_path, "r", encoding="utf-8") as file:
            places = json.load(file)
            
        print(f"Enriching {len(places)} JSON entries in parallel...")
        
        # Parallel processing using ThreadPoolExecutor
        updated_places = []
        with ThreadPoolExecutor(max_workers=12) as executor:
            futures = [executor.submit(process_place, dict(p), i+1, len(places)) for i, p in enumerate(places)]
            for fut in as_completed(futures):
                updated_places.append(fut.result())
                
        # Re-sort updated_places to match original order if possible, or just dump it
        # Let's preserve order by keeping a mapping
        order_map = {p["name"]+p["city"]: i for i, p in enumerate(places)}
        updated_places.sort(key=lambda x: order_map.get(x["name"]+x["city"], 999))
        
        with open(json_path, "w", encoding="utf-8") as file:
            json.dump(updated_places, file, indent=2, ensure_ascii=False)
            
        print(f"places.json updated successfully.")
    
    # 2. Update database.db
    db_path = "database.db"
    if os.path.exists(db_path):
        print(f"Loading SQLite database {db_path}...")
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT id, name, city, image FROM places")
        rows = cursor.fetchall()
        
        places_to_verify = []
        for pid, name, city, img in rows:
            # We update if:
            # - loremflickr URL
            # - None / empty
            # - Wikipedia URL, but we want to make sure it satisfies check_match!
            # Let's perform validation. If it is wiki image but doesn't pass check_match, we fetch again!
            needs_update = False
            if not img or "loremflickr" in img:
                needs_update = True
            elif "wikimedia.org" in img:
                # Extract page title from URL or search again to verify.
                # Actually, to be safe and simple, let's query Wiki for all places and verify if the current image is correct.
                # Since Chokhi Dhani had Dubai image and Patrika Gate had Bhitthamore image, let's just check if we can query them.
                # To keep it fast, we will verify all.
                needs_update = True
            
            if needs_update:
                places_to_verify.append((pid, name, city, img))
                
        print(f"Verifying {len(places_to_verify)} database entries in parallel...")
        
        db_updates = []
        def verify_db_place(pid, name, city, old_img):
            # For wikimedia images, check if they are already correct
            # Actually, let's search Wikipedia strictly. If it finds a strict match, use it.
            # If not, use fallback.
            new_img = get_wikipedia_image_strict(name, city)
            if not new_img:
                new_img = CITY_FALLBACK_IMAGES.get(city) or "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop"
            return pid, name, city, new_img
            
        with ThreadPoolExecutor(max_workers=12) as executor:
            futures = [executor.submit(verify_db_place, pid, name, city, img) for pid, name, city, img in places_to_verify]
            for fut in as_completed(futures):
                pid, name, city, new_img = fut.result()
                db_updates.append((new_img, pid))
                print(f"Verified Database Pid {pid}: {name} ({city}) -> {new_img}")
                
        # Bulk update database
        cursor.executemany("UPDATE places SET image = ? WHERE id = ?", db_updates)
        conn.commit()
        conn.close()
        print(f"Database updated successfully. Total updated/verified: {len(db_updates)}")
        
    print(f"Total time elapsed: {time.time() - start_time:.2f} seconds")

if __name__ == "__main__":
    main()
