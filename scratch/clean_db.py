import sqlite3

conn = sqlite3.connect("database.db")
cursor = conn.cursor()

# Delete Tokyo entries if any
cursor.execute("DELETE FROM places WHERE LOWER(city) = 'tokyo'")
conn.commit()
print(f"Deleted {cursor.rowcount} rows for 'tokyo'")

# Check distinct cities after
cursor.execute("SELECT DISTINCT city FROM places")
cities_after = [r[0] for r in cursor.fetchall()]
print("Cities in database after cleanup:", cities_after)

conn.close()
