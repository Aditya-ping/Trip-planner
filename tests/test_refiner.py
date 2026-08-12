import pytest
from utils.refiner import parse_target_days_from_instruction, fallback_rule_refiner, refine_itinerary

def test_parse_target_days():
    """
    Verifies that target day numbers are extracted correctly from natural language prompts.
    """
    assert parse_target_days_from_instruction("Make Day 2 less packed", 3) == [2]
    assert parse_target_days_from_instruction("Swap spots on day 1 and day 3", 4) == [1, 3]
    assert parse_target_days_from_instruction("Change the first day", 5) == [1]
    assert parse_target_days_from_instruction("Add a cafe to the last day", 4) == [4]


def test_fallback_rule_refiner():
    """
    Verifies that the fallback refiner correctly reduces or adds places for targeted days.
    """
    mock_itinerary = [
        {
            "day": 1,
            "places": [
                {"name": "Spot 1", "category": "Sightseeing", "rating": 4.5, "description": "Desc 1"},
                {"name": "Spot 2", "category": "Sightseeing", "rating": 4.6, "description": "Desc 2"},
                {"name": "Spot 3", "category": "Sightseeing", "rating": 4.7, "description": "Desc 3"}
            ],
            "routes": []
        },
        {
            "day": 2,
            "places": [
                {"name": "Spot 4", "category": "Sightseeing", "rating": 4.5, "description": "Desc 4"},
                {"name": "Spot 5", "category": "Sightseeing", "rating": 4.6, "description": "Desc 5"}
            ],
            "routes": []
        }
    ]

    diff = fallback_rule_refiner(mock_itinerary, "Make day 1 less packed", [1], "Jaipur")
    assert "1" in diff
    assert len(diff["1"]) == 2  # Reduced from 3 to 2 places


def test_refine_itinerary_scope_preservation():
    """
    Verifies that refine_itinerary preserves untouched days completely.
    """
    mock_itinerary = [
        {
            "day": 1,
            "places": [{"name": "Amer Fort", "category": "Heritage", "rating": 4.8}],
            "routes": []
        },
        {
            "day": 2,
            "places": [{"name": "City Palace", "category": "Heritage", "rating": 4.7}],
            "routes": []
        },
        {
            "day": 3,
            "places": [{"name": "Hawa Mahal", "category": "Heritage", "rating": 4.6}],
            "routes": []
        }
    ]

    res = refine_itinerary(mock_itinerary, "Add a cafe spot to day 2", city="Jaipur")
    assert res["success"] is True
    assert res["modified_days"] == [2]

    # Day 1 and Day 3 MUST remain 100% identical to original
    assert res["itinerary"][0]["places"] == mock_itinerary[0]["places"]
    assert res["itinerary"][2]["places"] == mock_itinerary[2]["places"]

    # Day 2 should have updated places
    assert len(res["itinerary"][1]["places"]) > len(mock_itinerary[1]["places"])
