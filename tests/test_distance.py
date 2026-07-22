import pytest
from utils.distance import (
    calculate_distance,
    estimate_travel_cost,
    calculate_route_distance,
    nearest_neighbor_route,
    two_opt,
    optimize_route
)

# ── 1. Haversine Distance Tests ───────────────────────────────────

@pytest.mark.parametrize("lat1, lon1, lat2, lon2, min_expected, max_expected", [
    # Mumbai to Pune (~118-120 km)
    (18.9220, 72.8347, 18.5204, 73.8567, 115.0, 125.0),
    # Delhi to Agra (~175-185 km)
    (28.6139, 77.2090, 27.1767, 78.0081, 175.0, 185.0),
    # Jaipur to Delhi (~230-245 km)
    (26.9124, 75.7873, 28.6139, 77.2090, 230.0, 245.0),
    # Same point (0 km)
    (26.9124, 75.7873, 26.9124, 75.7873, 0.0, 0.0),
])
def test_haversine_distance_known_coordinates(lat1, lon1, lat2, lon2, min_expected, max_expected):
    """
    Tests Haversine distance calculation against known geographical coordinate pairs.
    """
    dist = calculate_distance(lat1, lon1, lat2, lon2)
    assert min_expected <= dist <= max_expected, f"Distance {dist} km out of expected range [{min_expected}, {max_expected}]"


# ── 2. Cab Fare Calculation Tests ─────────────────────────────────

def test_cab_fare_short_distance_minimum():
    """
    Tests cab fare for very short distance (5 km).
    Validates if the calculation hits the ₹150 minimum fare threshold.
    """
    fare = estimate_travel_cost(5.0)
    assert fare == 150, f"Expected minimum fare of ₹150 for short distance, but got ₹{fare}"


def test_cab_fare_mid_range_distance():
    """
    Tests cab fare calculation for mid-range distance (25.4 km).
    """
    fare = estimate_travel_cost(25.4)
    assert fare == 254, f"Expected ₹254 for 25.4 km, but got ₹{fare}"


def test_cab_fare_rounding_behavior():
    """
    Tests rounding behavior of cab fare calculation (e.g. 12.37 km -> 123.7 -> 124).
    """
    fare = estimate_travel_cost(12.37)
    assert fare == 124, f"Expected rounded fare ₹124 for 12.37 km, but got ₹{fare}"


# ── 3. 2-Opt & TSP Heuristic Tests ────────────────────────────────

SAMPLE_COORDINATE_SETS = [
    # Jaipur Sights Circuit
    [
        {"name": "Amber Palace", "latitude": 26.9855, "longitude": 75.8513},
        {"name": "Hawa Mahal", "latitude": 26.9239, "longitude": 75.8267},
        {"name": "City Palace", "latitude": 26.9258, "longitude": 75.8237},
        {"name": "Jantar Mantar", "latitude": 26.9248, "longitude": 75.8246},
        {"name": "Nahargarh Fort", "latitude": 26.9378, "longitude": 75.8156},
    ],
    # Delhi Heritage Loop
    [
        {"name": "Red Fort", "latitude": 28.6562, "longitude": 77.2410},
        {"name": "Qutub Minar", "latitude": 28.5244, "longitude": 77.1855},
        {"name": "Humayun Tomb", "latitude": 28.5933, "longitude": 77.2507},
        {"name": "India Gate", "latitude": 28.6129, "longitude": 77.2295},
    ],
    # Mumbai Highlights
    [
        {"name": "Gateway of India", "latitude": 18.9220, "longitude": 72.8347},
        {"name": "Marine Drive", "latitude": 18.9440, "longitude": 72.8230},
        {"name": "Siddhivinayak Temple", "latitude": 19.0169, "longitude": 72.8304},
        {"name": "Bandra-Worli Sea Link", "latitude": 19.0330, "longitude": 72.8170},
    ]
]

@pytest.mark.parametrize("places", SAMPLE_COORDINATE_SETS)
def test_two_opt_never_increases_distance(places):
    nn_route = nearest_neighbor_route(places)
    nn_distance = calculate_route_distance(nn_route)
    opt_route, pre_dist, post_dist = two_opt(nn_route)

    assert post_dist <= pre_dist + 1e-4
    assert len(opt_route) == len(places)

@pytest.mark.parametrize("places", SAMPLE_COORDINATE_SETS)
def test_optimize_route_returns_valid_stats(places):
    opt_route, pre_dist, post_dist, imp_pct = optimize_route(places, return_stats=True)
    assert len(opt_route) == len(places)
    assert post_dist <= pre_dist + 1e-4
    assert imp_pct >= 0.0
