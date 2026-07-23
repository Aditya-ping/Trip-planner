import math
import polyline

def calculate_distance(lat1, lon1, lat2, lon2):
    R = 6371  # Earth radius in km

    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)

    a = (
        math.sin(d_lat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(d_lon / 2) ** 2
    )

    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return round(R * c, 2)

def suggest_transport(distance):
    if distance < 1:
        return "Walk"
    elif distance < 5:
        return "Auto/Cab"
    elif distance < 20:
        return "Car/Bus"
    else:
        return "Train"
    
def estimate_travel_time(distance, mode):
    """
    Returns estimated travel time in minutes
    """

    speed_map = {
        "Walk": 5,         # km/h
        "Auto/Cab": 25,    # km/h
        "Car/Bus": 40,     # km/h
        "Train": 60
    }

    speed = speed_map.get(mode, 30)

    time_hours = distance / speed
    time_minutes = time_hours * 60

    return round(time_minutes)
import requests
import os
from utils.cache import get_cached_response, set_cached_response

def get_real_route(lat1, lon1, lat2, lon2):
    """
    Fetches real driving road distance and travel duration between two coordinate points.
    Supports Google Directions API, Mapbox Directions API, Geoapify Routing API, and OSRM.
    Caches results per stop-pair in SQLite api_cache for 30 days.
    Falls back to 1.3x Haversine approximation on API failure/timeout.
    """
    l1_r = round(float(lat1), 4)
    l2_r = round(float(lon1), 4)
    l3_r = round(float(lat2), 4)
    l4_r = round(float(lon2), 4)
    cache_key = f"directions:{l1_r},{l2_r}:{l3_r},{l4_r}"

    cached = get_cached_response(cache_key)
    if cached is not None:
        return cached

    google_key = os.getenv("GOOGLE_MAPS_KEY")
    mapbox_key = os.getenv("MAPBOX_KEY")
    geoapify_key = os.getenv("GEOAPIFY_KEY")
    ors_key = os.getenv("ORS_API_KEY")

    route_data = None

    # Priority 1: Google Directions API
    if google_key and not route_data:
        try:
            url = "https://maps.googleapis.com/maps/api/directions/json"
            params = {
                "origin": f"{lat1},{lon1}",
                "destination": f"{lat2},{lon2}",
                "mode": "driving",
                "key": google_key
            }
            resp = requests.get(url, params=params, timeout=4)
            if resp.status_code == 200:
                d = resp.json()
                if d.get("routes"):
                    r = d["routes"][0]["legs"][0]
                    route_data = {
                        "distance": round(r["distance"]["value"] / 1000.0, 2),
                        "duration": round(r["duration"]["value"] / 60.0),
                        "mode": "Car/Cab",
                        "is_real_road": True,
                        "source": "google"
                    }
        except Exception as e:
            print(f"[Directions API] Google Directions error: {e}")

    # Priority 2: Mapbox Directions API
    if mapbox_key and not route_data:
        try:
            url = f"https://api.mapbox.com/directions/v5/mapbox/driving/{lon1},{lat1};{lon2},{lat2}"
            params = {"access_token": mapbox_key, "overview": "false"}
            resp = requests.get(url, params=params, timeout=4)
            if resp.status_code == 200:
                d = resp.json()
                if d.get("routes"):
                    r = d["routes"][0]
                    route_data = {
                        "distance": round(r["distance"] / 1000.0, 2),
                        "duration": round(r["duration"] / 60.0),
                        "mode": "Car/Cab",
                        "is_real_road": True,
                        "source": "mapbox"
                    }
        except Exception as e:
            print(f"[Directions API] Mapbox Directions error: {e}")

    # Priority 3: Geoapify Routing API
    if geoapify_key and not route_data:
        try:
            url = "https://api.geoapify.com/v1/routing"
            params = {
                "waypoints": f"{lat1},{lon1}|{lat2},{lon2}",
                "mode": "drive",
                "apiKey": geoapify_key
            }
            resp = requests.get(url, params=params, timeout=4)
            if resp.status_code == 200:
                d = resp.json()
                if d.get("features"):
                    props = d["features"][0]["properties"]
                    route_data = {
                        "distance": round(props["distance"] / 1000.0, 2),
                        "duration": round(props["time"] / 60.0),
                        "mode": "Car/Cab",
                        "is_real_road": True,
                        "source": "geoapify"
                    }
        except Exception as e:
            print(f"[Directions API] Geoapify Routing error: {e}")

    # Priority 4: OpenRouteService API
    if ors_key and not route_data:
        try:
            url = "https://api.openrouteservice.org/v2/directions/driving-car"
            headers = {"Authorization": ors_key, "Content-Type": "application/json"}
            body = {"coordinates": [[lon1, lat1], [lon2, lat2]]}
            resp = requests.post(url, json=body, headers=headers, timeout=4)
            if resp.status_code == 200:
                d = resp.json()
                r = d["routes"][0]
                route_data = {
                    "distance": round(r["summary"]["distance"] / 1000.0, 2),
                    "duration": round(r["summary"]["duration"] / 60.0),
                    "mode": "Car/Cab",
                    "is_real_road": True,
                    "source": "ors"
                }
        except Exception as e:
            print(f"[Directions API] ORS error: {e}")

    # Priority 5: OSRM Public Routing API
    if not route_data:
        try:
            url = f"http://router.project-osrm.org/route/v1/driving/{lon1},{lat1};{lon2},{lat2}"
            params = {"overview": "false"}
            resp = requests.get(url, params=params, timeout=4)
            if resp.status_code == 200:
                d = resp.json()
                if d.get("routes"):
                    r = d["routes"][0]
                    route_data = {
                        "distance": round(r["distance"] / 1000.0, 2),
                        "duration": round(r["duration"] / 60.0),
                        "mode": "Car/Cab",
                        "is_real_road": True,
                        "source": "osrm"
                    }
        except Exception as e:
            print(f"[Directions API] OSRM error: {e}")

    # Priority 6: Fallback to 1.3x Haversine approximation
    if not route_data:
        haversine_dist = calculate_distance(lat1, lon1, lat2, lon2)
        road_approx_dist = round(haversine_dist * 1.3, 2)
        mode = suggest_transport(road_approx_dist)
        duration = estimate_travel_time(road_approx_dist, mode)
        route_data = {
            "distance": road_approx_dist,
            "duration": duration,
            "mode": mode,
            "is_real_road": False,
            "source": "haversine_1.3x_fallback"
        }

    # Cache result for 30 days (2,592,000 seconds)
    set_cached_response(cache_key, route_data, 2592000)
    return route_data
    
def estimate_travel_cost(distance_km, is_road_distance=True):
    """
    Calculates cab fare based on road distance.
    Uses formula: 250 base fare + (road_distance_km * 18), with a minimum fare of 150.
    If is_road_distance is False, converts straight-line Haversine distance via 1.3x multiplier first.
    """
    if not is_road_distance:
        road_km = distance_km * 1.3
    else:
        road_km = distance_km

    fare = 250 + (road_km * 18)
    return max(150, round(fare))

def calculate_route_distance(places):
    """
    Calculates total Haversine distance for an ordered sequence of places.
    """
    total = 0.0
    for i in range(len(places) - 1):
        total += calculate_distance(
            places[i]["latitude"], places[i]["longitude"],
            places[i + 1]["latitude"], places[i + 1]["longitude"]
        )
    return round(total, 2)

def nearest_neighbor_route(places):
    """
    Constructs an initial route using nearest-neighbor heuristic starting from places[0].
    """
    if not places:
        return []
    optimized = [places[0]]
    remaining = list(places[1:])
    while remaining:
        last = optimized[-1]
        nearest = min(
            remaining,
            key=lambda p: calculate_distance(
                last["latitude"], last["longitude"],
                p["latitude"], p["longitude"]
            )
        )
        optimized.append(nearest)
        remaining.remove(nearest)
    return optimized

def two_opt(places, max_iterations=100):
    """
    Applies 2-opt local search heuristic to improve a given route.
    Swaps edge pairs to reduce total distance.
    Returns (optimized_places, pre_distance, post_distance).
    """
    if len(places) <= 3:
        dist = calculate_route_distance(places)
        return list(places), dist, dist

    best_route = list(places)
    best_distance = calculate_route_distance(best_route)
    initial_distance = best_distance

    improved = True
    iterations = 0

    while improved and iterations < max_iterations:
        improved = False
        iterations += 1

        for i in range(1, len(best_route) - 1):
            for j in range(i + 1, len(best_route)):
                # Reverse segment between i and j
                new_route = best_route[:i] + best_route[i:j + 1][::-1] + best_route[j + 1:]
                new_distance = calculate_route_distance(new_route)

                if new_distance < best_distance - 1e-4:
                    best_route = new_route
                    best_distance = new_distance
                    improved = True
                    break
            if improved:
                break

    return best_route, initial_distance, best_distance

def optimize_route(places, return_stats=False):
    """
    Combines Nearest-Neighbor construction with a 2-opt local search pass.
    Logs pre-2-opt vs post-2-opt distance improvements.
    """
    if not places:
        return ([] if not return_stats else ([], 0.0, 0.0, 0.0))

    # 1. Nearest Neighbor pass
    nn_route = nearest_neighbor_route(places)
    
    # 2. 2-Opt local search pass
    optimized_route, pre_dist, post_dist = two_opt(nn_route)

    improvement_pct = round(((pre_dist - post_dist) / pre_dist * 100), 2) if pre_dist > 0 else 0.0
    print(f"[Route Optimization] Pre 2-Opt: {pre_dist:.2f} km -> Post 2-Opt: {post_dist:.2f} km (Improvement: {improvement_pct}%)")

    if return_stats:
        return optimized_route, pre_dist, post_dist, improvement_pct
    return optimized_route

