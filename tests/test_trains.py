import pytest
from utils.trains import search_indian_trains, resolve_station_code

def test_station_code_resolution():
    """
    Tests station code resolution for major Indian cities.
    """
    assert resolve_station_code("Delhi") == "NDLS"
    assert resolve_station_code("Jaipur") == "JP"
    assert resolve_station_code("Mumbai") == "CSMT"
    assert resolve_station_code("Bangalore") == "SBC"
    assert resolve_station_code("Kochi") == "ERS"


def test_search_indian_trains_structure_and_disclaimer():
    """
    Verifies that search_indian_trains returns trains with explicit unofficial data disclaimers.
    """
    res = search_indian_trains("Delhi", "Jaipur")

    assert res["success"] is True
    assert "trains" in res
    assert len(res["trains"]) > 0
    assert "disclaimer" in res

    first_train = res["trains"][0]
    assert "train_number" in first_train
    assert "train_name" in first_train
    assert first_train["is_unofficial_data"] is True
    assert "disclaimer" in first_train
    assert "Unofficial" in first_train["disclaimer"]


def test_search_indian_trains_caching():
    """
    Tests cached responses for train searches.
    """
    res1 = search_indian_trains("Mumbai", "Goa")
    res2 = search_indian_trains("Mumbai", "Goa")

    assert res1["from_code"] == res2["from_code"]
    assert len(res1["trains"]) == len(res2["trains"])
