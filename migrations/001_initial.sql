-- 001_initial.sql: Initial schema for expenses, places, trips, and bookings

CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    amount INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS places (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    category TEXT NOT NULL,
    rating REAL,
    latitude REAL,
    longitude REAL,
    description TEXT,
    image TEXT
);

CREATE TABLE IF NOT EXISTS trips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    city TEXT NOT NULL,
    days INTEGER NOT NULL,
    budget INTEGER NOT NULL,
    pace TEXT NOT NULL,
    vibe TEXT NOT NULL,
    itinerary_json TEXT NOT NULL,
    hotels_json TEXT NOT NULL,
    weather_json TEXT NOT NULL,
    total_trip_cost INTEGER NOT NULL,
    budget_remaining INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reference_id TEXT UNIQUE NOT NULL,
    guest_name TEXT NOT NULL,
    email TEXT NOT NULL,
    destination TEXT NOT NULL,
    hotel_name TEXT NOT NULL,
    room_type TEXT NOT NULL,
    check_in TEXT NOT NULL,
    check_out TEXT NOT NULL,
    guests INTEGER NOT NULL,
    total_cost INTEGER NOT NULL,
    status TEXT DEFAULT 'Confirmed',
    flight_info TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_places_city ON places(city);
CREATE INDEX IF NOT EXISTS idx_trips_city ON trips(city);
