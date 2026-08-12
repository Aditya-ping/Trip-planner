import sqlite3
import json
import time
from utils.distance import optimize_route, calculate_route_distance, two_opt, nearest_neighbor_route

def measure_tsp_performance():
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()

    cities = ["Jaipur", "Delhi", "Kochi", "Goa"]
    benchmarks = []

    for city in cities:
        cursor.execute("SELECT name, category, rating, latitude, longitude FROM places WHERE LOWER(city) = ? AND latitude IS NOT NULL AND longitude IS NOT NULL LIMIT 8", (city.lower(),))
        rows = cursor.fetchall()
        if not rows or len(rows) < 4:
            continue

        places = [
            {"name": r[0], "category": r[1], "rating": r[2], "latitude": r[3], "longitude": r[4]}
            for r in rows
        ]

        # Raw initial distance vs Nearest Neighbor vs 2-Opt
        raw_distance = calculate_route_distance(places)
        nn_route = nearest_neighbor_route(places)
        nn_distance = calculate_route_distance(nn_route)
        
        opt_route, pre_2opt_dist, post_2opt_dist = two_opt(nn_route)
        
        total_saving_km = round(raw_distance - post_2opt_dist, 2)
        total_saving_pct = round(((raw_distance - post_2opt_dist) / raw_distance) * 100, 2) if raw_distance > 0 else 0.0
        
        two_opt_saving_km = round(pre_2opt_dist - post_2opt_dist, 2)
        two_opt_saving_pct = round(((pre_2opt_dist - post_2opt_dist) / pre_2opt_dist) * 100, 2) if pre_2opt_dist > 0 else 0.0

        benchmarks.append({
            "city": city,
            "place_count": len(places),
            "raw_order_distance_km": raw_distance,
            "nn_order_distance_km": pre_2opt_dist,
            "optimized_2opt_distance_km": post_2opt_dist,
            "total_saved_km": total_saving_km,
            "total_improvement_pct": total_saving_pct,
            "two_opt_refinement_pct": two_opt_saving_pct,
            "sample_places": [p["name"] for p in places[:4]]
        })

    conn.close()
    return benchmarks


def measure_cache_statistics():
    try:
        conn = sqlite3.connect("database.db")
        cursor = conn.cursor()
        
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='api_cache'")
        if not cursor.fetchone():
            return {"cache_exists": False, "message": "Table api_cache does not exist."}

        cursor.execute("SELECT COUNT(*) FROM api_cache")
        total_entries = cursor.fetchone()[0]

        cursor.execute("SELECT cache_key, fetched_at, ttl_seconds FROM api_cache LIMIT 20")
        sample_keys = cursor.fetchall()

        # Categorize keys by API provider
        cursor.execute("SELECT cache_key FROM api_cache")
        all_keys = [r[0] for r in cursor.fetchall()]

        provider_counts = {}
        for k in all_keys:
            prefix = k.split(":")[0] if ":" in k else "other"
            provider_counts[prefix] = provider_counts.get(prefix, 0) + 1

        conn.close()
        return {
            "cache_exists": True,
            "total_cached_entries": total_entries,
            "provider_breakdown": provider_counts,
            "sample_keys": sample_keys[:5]
        }
    except Exception as e:
        return {"cache_exists": False, "error": str(e)}


if __name__ == "__main__":
    print("=== TSP OPTIMIZATION BENCHMARK ===")
    tsp_data = measure_tsp_performance()
    print(json.dumps(tsp_data, indent=2))

    print("\n=== API CACHE STATISTICS ===")
    cache_data = measure_cache_statistics()
    print(json.dumps(cache_data, indent=2))
