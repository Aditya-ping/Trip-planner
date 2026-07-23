import sqlite3
import requests
import urllib.parse

SUPPORTED_LANGUAGES = {
    "en": "English",
    "hi": "Hindi (हिंदी)",
    "kn": "Kannada (ಕನ್ನಡ)",
    "ta": "Tamil (தமிழ்)"
}

def translate_place_description(place_id, text, target_lang):
    """
    Translates a place description string into target regional language ('hi', 'kn', 'ta').
    Caches translated descriptions permanently in place_translations table in database.db.
    Non-blocking: Falls back cleanly to English if translation fails.
    """
    if not text or target_lang not in SUPPORTED_LANGUAGES or target_lang == "en":
        return text

    # Tier 1: Check SQLite database cache first
    try:
        conn = sqlite3.connect("database.db")
        cursor = conn.cursor()
        cursor.execute("SELECT description FROM place_translations WHERE place_id = ? AND lang_code = ?", (place_id, target_lang))
        row = cursor.fetchone()
        if row and row[0]:
            conn.close()
            return row[0]
    except Exception as db_err:
        print(f"[Translation DB Read Error] {db_err}")

    translated_text = None

    # Tier 2: Free Google Translate GTX Endpoint
    try:
        url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl={target_lang}&dt=t&q={urllib.parse.quote(text)}"
        resp = requests.get(url, timeout=4)
        if resp.status_code == 200:
            data = resp.json()
            if data and isinstance(data, list) and len(data) > 0 and isinstance(data[0], list):
                translated_text = "".join([segment[0] for segment in data[0] if segment and len(segment) > 0 and segment[0]])
    except Exception as e:
        print(f"[Translation API Error] {e}")

    # Tier 3: LibreTranslate API Fallback
    if not translated_text:
        try:
            url = "https://libretranslate.de/translate"
            payload = {
                "q": text,
                "source": "auto",
                "target": target_lang,
                "format": "text"
            }
            resp = requests.post(url, json=payload, timeout=4)
            if resp.status_code == 200:
                data = resp.json()
                translated_text = data.get("translatedText")
        except Exception as e:
            print(f"[LibreTranslate Error] {e}")

    # Fallback to original text if API fails
    if not translated_text:
        translated_text = text

    # Cache in database.db if place_id provided and translation succeeded
    if place_id and translated_text and translated_text != text:
        try:
            conn = sqlite3.connect("database.db")
            cursor = conn.cursor()
            cursor.execute("""
                INSERT OR REPLACE INTO place_translations (place_id, lang_code, description)
                VALUES (?, ?, ?)
            """, (place_id, target_lang, translated_text))
            conn.commit()
            conn.close()
        except Exception as db_write_err:
            print(f"[Translation DB Write Error] {db_write_err}")

    return translated_text
