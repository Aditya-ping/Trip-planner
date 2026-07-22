import time
import sqlite3
import pytest
from utils.cache import get_cached_response, set_cached_response
from utils.migrate import run_migrations

@pytest.fixture(autouse=True)
def setup_test_db(tmp_path):
    """
    Creates a temporary SQLite database for cache unit tests.
    """
    db_file = str(tmp_path / "test_cache.db")
    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS api_cache (
            cache_key TEXT PRIMARY KEY,
            response_json TEXT NOT NULL,
            fetched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            ttl_seconds INTEGER NOT NULL
        )
    """)
    conn.commit()
    conn.close()
    return db_file


def test_set_and_get_cached_response(setup_test_db):
    db_file = setup_test_db
    key = "test:key:valid"
    payload = {"status": "ok", "items": [1, 2, 3]}

    assert set_cached_response(key, payload, ttl_seconds=300, db_path=db_file) is True
    cached = get_cached_response(key, ignore_ttl=False, db_path=db_file)

    assert cached == payload


def test_cache_ttl_expiration_and_fallback(setup_test_db):
    db_file = setup_test_db
    key = "test:key:expired"
    payload = {"weather": "sunny", "temp": "30C"}

    # Insert an entry with 0 second TTL
    set_cached_response(key, payload, ttl_seconds=0, db_path=db_file)
    time.sleep(1)

    # With ignore_ttl=False -> should return None (expired)
    expired_result = get_cached_response(key, ignore_ttl=False, db_path=db_file)
    assert expired_result is None

    # With ignore_ttl=True -> should return cached payload (emergency fallback)
    fallback_result = get_cached_response(key, ignore_ttl=True, db_path=db_file)
    assert fallback_result == payload
