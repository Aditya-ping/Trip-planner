import sqlite3

conn = sqlite3.connect("database.db")
cursor = conn.cursor()
cursor.execute("SELECT city, COUNT(*), COUNT(CASE WHEN image LIKE '%loremflickr%' THEN 1 END) FROM places GROUP BY city")
rows = cursor.fetchall()
print("City | Total Places | Loremflickr Places")
print("-" * 45)
for city, total, lorem in rows:
    print(f"{city:15} | {total:12} | {lorem:18}")
conn.close()
