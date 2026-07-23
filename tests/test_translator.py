import pytest
import sqlite3
from utils.translator import translate_place_description, SUPPORTED_LANGUAGES

def test_supported_languages_dict():
    """
    Verifies supported regional language codes.
    """
    assert "en" in SUPPORTED_LANGUAGES
    assert "hi" in SUPPORTED_LANGUAGES
    assert "kn" in SUPPORTED_LANGUAGES
    assert "ta" in SUPPORTED_LANGUAGES


def test_translate_english_returns_original():
    """
    Verifies English ('en') target language returns original text without API calls.
    """
    text = "Beautiful royal palace in Jaipur."
    res = translate_place_description(1, text, "en")
    assert res == text


def test_translate_place_description_hindi_and_caching():
    """
    Tests translating description into Hindi and verifies database caching in place_translations.
    """
    place_id = 9991
    sample_text = "Historic royal fort built in 1592 by Raja Man Singh."

    # First translation call
    translated_hi = translate_place_description(place_id, sample_text, "hi")
    assert translated_hi is not None
    assert isinstance(translated_hi, str)
    assert len(translated_hi) > 0

    # Verify cached entry in database.db
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()
    cursor.execute("SELECT description FROM place_translations WHERE place_id = ? AND lang_code = ?", (place_id, "hi"))
    row = cursor.fetchone()
    conn.close()

    assert row is not None
    assert row[0] == translated_hi
