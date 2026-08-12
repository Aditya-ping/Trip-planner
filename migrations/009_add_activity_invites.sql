-- Migration 009: Add activity_invites and activity_participants tables

CREATE TABLE IF NOT EXISTS activity_invites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    host_user_id INTEGER NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    description TEXT,
    activity_type TEXT CHECK(activity_type IN ('adventure', 'food', 'sightseeing', 'other')) NOT NULL,
    city TEXT NOT NULL,
    location_name TEXT,
    latitude REAL,
    longitude REAL,
    scheduled_date DATE NOT NULL,
    scheduled_time TEXT,
    max_participants INTEGER,
    status TEXT CHECK(status IN ('open', 'full', 'cancelled', 'completed')) NOT NULL DEFAULT 'open',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activity_participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invite_id INTEGER NOT NULL REFERENCES activity_invites(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id),
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT CHECK(status IN ('requested', 'accepted', 'declined')) NOT NULL DEFAULT 'requested',
    UNIQUE(invite_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_activity_invites_city ON activity_invites(city);
CREATE INDEX IF NOT EXISTS idx_activity_invites_host ON activity_invites(host_user_id);
CREATE INDEX IF NOT EXISTS idx_activity_participants_invite ON activity_participants(invite_id);

-- Ensure a default host user exists for initial sample activity invites
INSERT OR IGNORE INTO users (id, email, password_hash, is_admin)
VALUES (1, 'host_explorer@aerotravel.com', 'pbkdf2:sha256:default_hash', 0);

-- Seed sample activity invites across Indian cities
INSERT INTO activity_invites (host_user_id, title, description, activity_type, city, location_name, latitude, longitude, scheduled_date, scheduled_time, max_participants, status) VALUES
(1, 'Scuba Diving & Coral Exploration', 'Going scuba diving at Grand Island! Looking for 3 fellow travelers to share boat fees and explore marine life together.', 'adventure', 'Goa', 'Grand Island Boat Jetty, Candolim', 15.5180, 73.7620, '2026-10-15', '08:00 AM', 4, 'open'),
(1, 'Varanasi Old Alleyways Street Food Crawl', 'Exploring the famous food stalls of Vishwanath Gali for Tamatar Chaat, Malaiyo, and Banarasi Lassi. Come hungry!', 'food', 'Varanasi', 'Kashi Vishwanath Corridor Gate', 25.3110, 83.0090, '2026-09-25', '05:30 PM', 6, 'open'),
(1, 'Sunrise Photography Walk at Solang Valley', 'Early morning trek up to Solang Valley viewpoint to capture mountain sunrise light over glaciers.', 'sightseeing', 'Manali', 'Solang Valley Ropeway Base', 32.3160, 77.1580, '2026-10-05', '05:45 AM', 5, 'open'),
(1, 'Amber Fort Night Light Walk & Chokhi Dhani Dinner', 'Visiting Amer Fort during evening illumination followed by traditional Rajasthani buffet dinner.', 'sightseeing', 'Jaipur', 'Amer Fort Main Entrance', 26.9855, 75.8513, '2026-09-18', '06:00 PM', 4, 'open'),
(1, 'Cubbon Park Sunday Morning Cycling & South Indian Breakfast', 'Renting bicycles for a leisurely loop around Cubbon Park, then grabbing legendary Masala Dosa at CTR.', 'food', 'Bangalore', 'Cubbon Park Metro Station Exit B', 12.9757, 77.5929, '2026-09-20', '07:00 AM', 8, 'open');
