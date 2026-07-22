-- 003_add_api_cache.sql: API Cache table for Wikipedia, Geoapify, Xotelo, and Duffel responses

CREATE TABLE IF NOT EXISTS api_cache (
    cache_key TEXT PRIMARY KEY,
    response_json TEXT NOT NULL,
    fetched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ttl_seconds INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_api_cache_key ON api_cache(cache_key);
