import requests

candidates = {
    "Jaipur": [
        "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1477584308802-e9c3788ee454?w=800&auto=format&fit=crop"
    ],
    "Jodhpur": [
        "https://images.unsplash.com/photo-1616388968889-aa2a2fdf5967?w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&auto=format&fit=crop"
    ],
    "Kochi": [
        "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&auto=format&fit=crop"
    ],
    "Hyderabad": [
        "https://images.unsplash.com/photo-1608958220963-6b4e9000a31a?w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1618245341355-d2a2c1490216?w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1600100397608-f010e4219717?w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1601931103251-2486940d9980?w=800&auto=format&fit=crop"
    ],
    "Mysore": [
        "https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1600100397608-f010e4219717?w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1584813530366-267f339cf062?w=800&auto=format&fit=crop"
    ],
    "Pondicherry": [
        "https://images.unsplash.com/photo-1586795493033-b184b25dfc5e?w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1600100397608-f010e4219717?w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1589519160732-57fc498494f8?w=800&auto=format&fit=crop"
    ],
    "Rishikesh": [
        "https://images.unsplash.com/photo-1598977123418-45f04b615237?w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop"
    ],
    "Shimla": [
        "https://images.unsplash.com/photo-1562670224-e1b66b26d80f?w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1597074866923-dc0589150358?w=800&auto=format&fit=crop"
    ]
}

print("Testing candidates...")
for city, urls in candidates.items():
    found = False
    for url in urls:
        try:
            r = requests.head(url, timeout=3.0)
            if r.status_code == 200:
                print(f"  {city} -> SUCCESS: {url}")
                found = True
                break
        except Exception as e:
            pass
    if not found:
        print(f"  {city} -> FAILED: no working candidate found!")
