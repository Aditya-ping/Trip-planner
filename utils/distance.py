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

def get_real_route(lat1, lon1, lat2, lon2):
    api_key = os.getenv("ORS_API_KEY")

    if not api_key:
        distance = calculate_distance(lat1, lon1, lat2, lon2)
        mode = suggest_transport(distance)
        duration = estimate_travel_time(distance, mode)
        return {
            "distance": distance,
            "duration": duration,
            "mode": mode,
            "coordinates": [[lat1, lon1], [lat2, lon2]]
        }

    url = "https://api.openrouteservice.org/v2/directions/driving-car"

    headers = {
        "Authorization": api_key,
        "Content-Type": "application/json"
    }

    body = {
        "coordinates": [
            [lon1, lat1],
            [lon2, lat2]
        ]
    }

    try:
        response = requests.post(url, json=body, headers=headers, timeout=5)
        if response.status_code != 200:
            raise Exception("API error")
        data = response.json()
        route = data["routes"][0]
        distance_km = route["summary"]["distance"] / 1000
        duration_min = route["summary"]["duration"] / 60
        geometry = route["geometry"]
        decoded = [list(coord) for coord in polyline.decode(geometry)]
        return {
            "distance": round(distance_km, 2),
            "duration": round(duration_min),
            "mode": "Car/Cab",
            "coordinates": decoded
        }
    except Exception as e:
        print(f"ORS Error or Timeout: {e}. Falling back to simulation.")
        distance = calculate_distance(lat1, lon1, lat2, lon2)
        mode = suggest_transport(distance)
        duration = estimate_travel_time(distance, mode)
        return {
            "distance": distance,
            "duration": duration,
            "mode": mode,
            "coordinates": [[lat1, lon1], [lat2, lon2]]
        }
    
def estimate_travel_cost(distance_km):
    """
    Simple realistic cost model
    """

    # You can tune these
    fuel_cost_per_km = 10  # ₹ per km average mixed transport

    return round(distance_km * fuel_cost_per_km)

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

