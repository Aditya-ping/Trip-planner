import sqlite3

def check():
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()
    cursor.execute("SELECT name, city, image FROM places")
    rows = cursor.fetchall()
    
    domains = {}
    lorem_count = 0
    null_count = 0
    other_count = 0
    examples = []
    
    for name, city, image in rows:
        if not image:
            null_count += 1
        elif "loremflickr" in image:
            lorem_count += 1
            examples.append((name, city, image))
        else:
            other_count += 1
            domain = image.split("//")[1].split("/")[0] if "//" in image else image
            domains[domain] = domains.get(domain, 0) + 1
            
    print(f"Total places: {len(rows)}")
    print(f"Null images: {null_count}")
    print(f"Loremflickr images: {lorem_count}")
    print(f"Other domains: {domains}")
    print("\nExamples of Loremflickr images:")
    for ex in examples[:10]:
        print(f" - {ex[0]} ({ex[1]}): {ex[2]}")
        
    conn.close()

if __name__ == "__main__":
    check()
