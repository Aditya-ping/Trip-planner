import json
import sqlite3
from datetime import datetime, timezone

def get_cached_response(cache_key, ignore_ttl=False, db_path="database.db"):
    """
    Retrieves a cached JSON response for cache_key from database.db.
    If ignore_ttl is False, returns None if the entry has expired.
    If ignore_ttl is True, returns cached response even if expired (emergency fallback).
    """
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute(
            "SELECT response_json, fetched_at, ttl_seconds FROM api_cache WHERE cache_key = ?",
            (cache_key,)
        )
        row = cursor.fetchone()
        conn.close()

        if not row:
            return None

        response_json, fetched_at_str, ttl_seconds = row

        # Parse fetched_at timestamp (SQLite CURRENT_TIMESTAMP is UTC)
        try:
            fetched_at = datetime.strptime(fetched_at_str, "%Y-%m-%d %H:%M:%S").replace(tzinfo=timezone.utc)
        except Exception:
            fetched_at = datetime.now(timezone.utc)

        now_utc = datetime.now(timezone.utc)
        age_seconds = (now_utc - fetched_at).total_seconds()

        if ignore_ttl or age_seconds <= ttl_seconds:
            return json.loads(response_json)
        
        return None
    except Exception as e:
        print(f"[Cache Error] Failed to read cache for '{cache_key}': {e}")
        return None

def set_cached_response(cache_key, data, ttl_seconds, db_path="database.db"):
    """
    Saves or replaces a cached JSON response for cache_key in database.db.
    """
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        response_json = json.dumps(data)
        cursor.execute("""
            INSERT INTO api_cache (cache_key, response_json, fetched_at, ttl_seconds)
            VALUES (?, ?, CURRENT_TIMESTAMP, ?)
            ON CONFLICT(cache_key) DO UPDATE SET
                response_json = excluded.response_json,
                fetched_at = CURRENT_TIMESTAMP,
                ttl_seconds = excluded.ttl_seconds
        """, (cache_key, response_json, ttl_seconds))
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        print(f"[Cache Error] Failed to write cache for '{cache_key}': {e}")
        return False
