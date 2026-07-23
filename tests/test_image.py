import pytest
from app import get_unsplash_image, get_wikipedia_image, get_place_image

def test_get_place_image_pipeline_structure():
    """
    Tests get_place_image returns a 3-element tuple (image_url, attribution_name, attribution_link).
    """
    res = get_place_image("Hawa Mahal", "Jaipur")
    assert isinstance(res, tuple)
    assert len(res) == 3
    img_url, attr_name, attr_link = res
    assert img_url.startswith("http")
    assert isinstance(attr_name, str)
    assert isinstance(attr_link, str)


def test_curated_fallback_tier():
    """
    Tests that get_place_image falls back to curated city landscape images if Tier 1 and Tier 2 return nothing.
    """
    img_url, attr_name, attr_link = get_place_image("Nonexistent Unknown Place 12345", "Jaipur")
    assert img_url.startswith("http")
    assert attr_name is not None
    assert attr_link is not None


def test_wikipedia_keyword_matching_preserved():
    """
    Verifies that the Wikipedia search fallback preserves the strict keyword matching guards.
    """
    wiki_img = get_wikipedia_image("Amber Fort", "Jaipur")
    if wiki_img:
        assert wiki_img.startswith("http")
        assert not any(x in wiki_img.lower() for x in ["globe", "map_marker", "earth", "satellite", "pitt_icon", "locator"])
