import json
import os

def enrich():
    file_path = os.path.join("data", "places.json")
    with open(file_path, "r", encoding="utf-8") as file:
        places = json.load(file)

    # Deduplicate places by name and city
    seen = set()
    unique_places = []
    for p in places:
        key = (p["name"].strip().lower(), p["city"].strip().lower())
        if key not in seen:
            seen.add(key)
            unique_places.append(p)

    # Dictionary of curated realistic descriptions for popular attractions
    curated_descriptions = {
        "hawa mahal": "A stunning five-story palace built of red and pink sandstone, famous for its unique honeycomb window design.",
        "amber fort": "A magnificent hilltop fort featuring majestic sandstone architecture, beautiful courtyards, and scenic lake views.",
        "city palace": "A grand royal palace complex displaying a blend of Rajasthani and Mughal architecture with exquisite museums.",
        "nahargarh fort": "A historic fort standing on the edge of the Aravalli Hills, offering breathtaking panoramic views of Jaipur.",
        "jaigarh fort": "A rugged fortress overlooking Amber Fort, famous for housing the Jaivana cannon—the world's largest cannon on wheels.",
        "jal mahal": "An enchanting palace constructed in the middle of Man Sagar Lake, showcasing symmetrical architectural beauty.",
        "albert hall museum": "The oldest museum of Rajasthan, showcasing a rich collection of artifacts, paintings, and historical relics.",
        "patrika gate": "A vibrant, colorful gateway serving as a monument and photogenic entrance to Jawahar Circle garden.",
        "birla mandir jaipur": "A modern white marble temple dedicated to Lord Vishnu and Goddess Lakshmi, glowing beautifully in the evening.",
        "chokhi dhani": "An ethnic resort village offering an immersive cultural experience of traditional Rajasthani food, dance, and arts.",
        
        "india gate": "A majestic war memorial archway honoring fallen soldiers, surrounded by lush green lawns and fountains.",
        "red fort": "An iconic UNESCO World Heritage site built of red sandstone, representing the hub of the historical Mughal empire.",
        "qutub minar": "A towering 73-meter brick minaret built in 1193, surrounded by ancient ruins of Delhi's first mosque.",
        "lotus temple": "A striking flowerlike Bahai House of Worship open to all, renowned for its architectural beauty and silence.",
        "humayun's tomb": "A grand garden-tomb of the Mughal Emperor Humayun, featuring spectacular Persian double-dome architecture.",
        "akshardham temple": "A massive spiritual-cultural campus displaying traditional Hindu architecture, gardens, and light shows.",
        "jama masjid": "One of the largest mosques in India, built by Shah Jahan with impressive red sandstone and white marble.",
        "chandni chowk": "One of Delhi's oldest and busiest markets, famous for street food, traditional shopping, and narrow alleys.",
        "rashtrapati bhavan": "The official residence of the President of India, featuring grand architectural domes and Mughal Gardens.",
        "lodhi garden": "A peaceful city park containing the tombs of the Sayyid and Lodi dynasties, popular for morning walks.",
        
        "taj mahal": "The world-famous white marble mausoleum on the banks of Yamuna, built by Shah Jahan in memory of Mumtaz Mahal.",
        "agra fort": "A massive 16th-century red sandstone fortress that served as the primary residence of the Mughal emperors.",
        "mehtab bagh": "A serene garden complex situated opposite the Taj Mahal, offering perfect sunset view photography.",
        "fatehpur sikri": "A ghost city of red sandstone ruins founded by Emperor Akbar, featuring Buland Darwaza.",
        "itmad-ud-daulah": "Often called the 'Baby Taj', this exquisite marble tomb is renowned for its delicate stone inlay work.",
        
        "gateway of india": "An iconic 26-meter arch monument built to commemorate the visit of King George V, overlooking the Arabian Sea.",
        "marine drive": "A scenic 3.6 km promenade along the coast, popular for evening walks and viewing the glowing 'Queen's Necklace'.",
        "elephanta caves": "A network of sculpted cave temples on Elephanta Island, dedicated primarily to the Hindu god Shiva.",
        "juhu beach": "One of Mumbai's most popular beaches, famous for its lively atmosphere and delicious local street food.",
        "siddhivinayak temple": "A highly revered temple dedicated to Lord Ganesha, attracting thousands of devotees and tourists daily.",
        
        "baga beach": "A lively beach in North Goa, famous for its energetic nightlife, water sports, and beach shacks.",
        "calangute beach": "Known as the 'Queen of Beaches', it is the largest and most popular beach in North Goa.",
        "dudhsagar falls": "A majestic four-tiered waterfall on the Mandovi River, looking like a cascading sea of milk.",
        "fort aguada": "A well-preserved 17th-century Portuguese fort and lighthouse overlooking the meeting point of Mandovi River and sea.",
        "basilica of bom jesus": "A historic world heritage church holding the mortal remains of St. Francis Xavier.",
        
        "kashi vishwanath temple": "One of the most famous Hindu temples dedicated to Lord Shiva, located on the sacred western bank of the Ganges.",
        "dashashwamedh ghat": "The main and most spectacular ghat on the Ganges River, famous for the magnificent evening Ganga Aarti ceremony.",
        "assi ghat": "A prominent ghat located at the confluence of the Ganga and Assi rivers, popular for morning yoga and rituals.",
        "sarnath": "The holy site where Lord Buddha gave his first sermon after attaining enlightenment.",
        
        "city palace udaipur": "A colossal palace complex built over 400 years, showcasing ornate mirrors, paintings, and lake views.",
        "lake pichola": "A scenic artificial freshwater lake, famous for the white marble Lake Palace floating in its center.",
        
        "mehrangarh fort": "One of India's largest forts, rising 400 feet above Jodhpur, featuring carved courtyards and weapons galleries.",
        "umaid bhawan palace": "One of the world's largest private residences, part of which is a museum showcasing royal history and vintage cars.",
        
        "solang valley": "A beautiful side valley offering adventure sports like paragliding, skiing, and Zorbing amidst mountain peaks.",
        "rohtang pass": "A spectacular high mountain pass offering snow-covered vistas and dramatic views of the Himalayas.",
        
        "the ridge": "A spacious open space in the heart of Shimla, offering stunning views of snow-clad mountain ranges.",
        
        "golden temple": "The holiest Gurdwara of Sikhism, a gilded temple reflecting beautifully in its surrounding sacred pool.",
        "jallianwala bagh": "A poignant memorial park commemorating the peaceful protesters massacred by British troops in 1919.",
        "wagah border": "The border crossing between India and Pakistan, famous for its daily military drill and retreat ceremony.",
        
        "laxman jhula": "An iconic iron suspension bridge across the holy Ganges River, associated with mythological legends.",
        "ram jhula": "A beautiful suspension bridge crossing the Ganges, connecting famous ashrams and temples.",
        "beatles ashram": "The ruins of the ashram where the Beatles stayed in 1968, now covered in vibrant wall art and graffiti.",
        
        "lalbagh botanical garden": "A historic 240-acre botanical garden containing India's largest collection of tropical plants and a Glass House.",
        "cubbon park": "A lush 300-acre park in Bangalore's administrative area, providing a peaceful green escape.",
        "bangalore palace": "A grand royal palace inspired by Windsor Castle, displaying classic wooden carvings and historical photos.",
        
        "charminar": "An iconic 16th-century mosque and monument featuring four ornate minarets, situated in the heart of Hyderabad.",
        "golconda fort": "A historic fortress complex famous for its acoustic engineering, diamond vaults, and massive ruins.",
        "ramoji film city": "The largest integrated film studio complex in the world, featuring tours, sets, and theme parks.",
        
        "victoria memorial": "A majestic white marble palace built in memory of Queen Victoria, set within sprawling gardens.",
        "howrah bridge": "A massive steel cantilever bridge across the Hooghly River, serving as the cultural symbol of Kolkata.",
        
        "mysore palace": "An incredibly grand palace that serves as the official residence of the Wadiyar dynasty, illuminated spectacular on Sundays.",
        
        "fort kochi": "A charming seaside district famous for colonial Dutch/Portuguese architecture and relaxed cafes."
    }

    category_fallbacks = {
        "history": "A fascinating historical landmark offering a deep dive into the rich heritage and architecture of the region.",
        "nature": "A breathtaking scenic spot offering peaceful surroundings and beautiful photo opportunities close to nature.",
        "museum": "A treasure trove of art, history, and cultural artifacts representing the rich heritage of the city.",
        "culture": "A lively cultural hub where visitors can experience traditional lifestyles, local crafts, and delicious street food.",
        "temple": "A peaceful and sacred place of worship, exhibiting spectacular traditional architecture and spiritual vibes.",
        "church": "A historic sanctuary displaying beautiful colonial architecture, stained glass, and tranquil interiors.",
        "adventure": "An exciting spot offering thrill-seeking outdoor activities, panoramic views, and memorable fun.",
        "spiritual": "A sacred spot of peace, contemplation, and ancient spiritual significance."
    }

    # Enrich each place
    for p in unique_places:
        name_lower = p["name"].strip().lower()
        city_lower = p["city"].strip().lower()
        
        # Determine realistic description
        desc = None
        # Try finding direct match
        for key, text in curated_descriptions.items():
            if key in name_lower:
                desc = text
                break
        
        if not desc:
            category = p.get("category", "nature")
            desc = category_fallbacks.get(category, "A highly recommended destination offering unforgettable sights and activities.")
            
        p["description"] = desc
        
        # Add a realistic Image URL
        # We use LoremFlickr which serves real, high-quality images based on search tags (e.g. goa,bagabeach)
        clean_name = p["name"].replace("’", "").replace("'", "").replace("&", "").replace(" ", "")
        p["image"] = f"https://loremflickr.com/640/480/{p['city'].lower()},{clean_name.lower()}/all"

    # Write enriched data back
    with open(file_path, "w", encoding="utf-8") as file:
        json.dump(unique_places, file, indent=2, ensure_ascii=False)

    print(f"Enriched {len(unique_places)} places successfully.")

if __name__ == "__main__":
    enrich()
