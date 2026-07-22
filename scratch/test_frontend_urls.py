import requests

urls = {
    "Agra": "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1600&q=80",
    "Amritsar": "https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&w=1600&q=80",
    "Bangalore": "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1600&q=80",
    "Delhi": "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1600&q=80",
    "Gangtok": "https://images.unsplash.com/photo-1616388968889-aa2a2fdf5967?auto=format&fit=crop&w=1600&q=80",
    "Goa": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1600&q=80",
    "Hyderabad": "https://images.unsplash.com/photo-1608958220929-a39af1a4237f?auto=format&fit=crop&w=1600&q=80",
    "Jaipur": "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1600&q=80",
    "Jodhpur": "https://images.unsplash.com/photo-1572888195250-3037a59d3578?auto=format&fit=crop&w=1600&q=80",
    "Kochi": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1600&q=80",
    "Kodaikanal": "https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?auto=format&fit=crop&w=1600&q=80",
    "Kolkata": "https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=1600&q=80",
    "Leh Ladakh": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1600&q=80",
    "Manali": "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1600&q=80",
    "Mumbai": "https://images.unsplash.com/photo-1562979314-bee7453e911c?auto=format&fit=crop&w=1600&q=80",
    "Munnar": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=80",
    "Mysore": "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=1600&q=80",
    "Ooty": "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1600&q=80",
    "Pondicherry": "https://images.unsplash.com/photo-1589782182703-e8b44e355968?auto=format&fit=crop&w=1600&q=80",
    "Rishikesh": "https://images.unsplash.com/photo-1598977123418-45f04b615237?auto=format&fit=crop&w=1600&q=80",
    "Shimla": "https://images.unsplash.com/photo-1597075687490-8f673c6c17f6?auto=format&fit=crop&w=1600&q=80",
    "Udaipur": "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1600&q=80",
    "Varanasi": "https://images.unsplash.com/photo-1561361058-c24e014f9d25?auto=format&fit=crop&w=1600&q=80",
}

print("Testing frontend city images:")
for city, url in urls.items():
    try:
        r = requests.head(url, timeout=3.0)
        print(f"  {city:12} -> {r.status_code}")
    except Exception as e:
        print(f"  {city:12} -> ERROR: {e}")
