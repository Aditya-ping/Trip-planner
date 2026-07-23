-- 006_add_translations.sql: Create place_translations cache table

CREATE TABLE IF NOT EXISTS place_translations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    place_id INTEGER NOT NULL,
    lang_code TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(place_id, lang_code)
);
