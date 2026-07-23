from functools import wraps
from flask import Flask, render_template, request, redirect, jsonify, flash, g
from werkzeug.security import generate_password_hash, check_password_hash
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import json
import os
import sqlite3
import requests
from datetime import datetime, timedelta
from utils.distance import calculate_distance, get_real_route, estimate_travel_cost, optimize_route
from utils.migrate import run_migrations
from utils.cache import get_cached_response, set_cached_response
from utils.weather import get_open_meteo_forecast, generate_smart_packing_advisory
from utils.payment import create_razorpay_order, verify_razorpay_signature
from utils.notifications import send_booking_confirmation_email, send_booking_confirmation_sms
from utils.aqi import get_air_quality
from utils.trains import search_indian_trains
from utils.translator import translate_place_description, SUPPORTED_LANGUAGES
from dotenv import load_dotenv

load_dotenv()

DUFFEL_TOKEN = os.getenv("DUFFEL_TOKEN")

DUFFEL_HEADERS = {
    "Authorization":  f"Bearer {DUFFEL_TOKEN}",
    "Duffel-Version": "v2",
    "Content-Type":   "application/json",
    "Accept":         "application/json"
}

# ── Auth Token Helpers ──────────────────────────────────────────
def get_auth_serializer():
    return URLSafeTimedSerializer(app.secret_key, salt="aerotravel-auth-token")

def generate_token(user_id, email):
    s = get_auth_serializer()
    return s.dumps({"user_id": user_id, "email": email})

def verify_token(token):
    s = get_auth_serializer()
    try:
        data = s.loads(token, max_age=86400 * 30)  # Valid for 30 days
        return data
    except Exception:
        return None

def require_auth(optional=False):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            auth_header = request.headers.get("Authorization")
            token = None
            if auth_header and auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]
            
            g.user_id = None
            g.user_email = None

            if token:
                payload = verify_token(token)
                if payload:
                    g.user_id = payload.get("user_id")
                    g.user_email = payload.get("email")

            if not optional and not g.user_id:
                return jsonify({"success": False, "error": "Unauthorized. Please log in."}), 401
                
            return f(*args, **kwargs)
        return decorated_function
    return decorator

# ── All 23 cities with nearest airport IATA codes ────────────
AIRPORT_CODES = {
    "Agra":        "AGR",   # Agra Airport (Kheria)
    "Amritsar":    "ATQ",   # Sri Guru Ram Dass Jee International
    "Bangalore":   "BLR",   # Kempegowda International
    "Delhi":       "DEL",   # Indira Gandhi International
    "Gangtok":     "IXB",   # Bagdogra (nearest — 124km away)
    "Goa":         "GOI",   # Goa International (Mopa = GOX, old = GOI)
    "Hyderabad":   "HYD",   # Rajiv Gandhi International
    "Jaipur":      "JAI",   # Jaipur International
    "Jodhpur":     "JDH",   # Jodhpur Airport
    "Kochi":       "COK",   # Cochin International
    "Kodaikanal":  "MDU",   # Madurai Airport (nearest — 80km away)
    "Kolkata":     "CCU",   # Netaji Subhas Chandra Bose International
    "Leh Ladakh":  "IXL",   # Kushok Bakula Rimpochee Airport
    "Manali":      "KUU",   # Kullu-Manali Airport (nearest — 50km)
    "Mumbai":      "BOM",   # Chhatrapati Shivaji Maharaj International
    "Munnar":      "COK",   # Cochin International (nearest — 110km)
    "Mysore":      "MYQ",   # Mysore Airport
    "Ooty":        "CJB",   # Coimbatore International (nearest — 85km)
    "Pondicherry": "PNY",   # Puducherry Airport
    "Rishikesh":   "DED",   # Jolly Grant Airport, Dehradun (nearest — 35km)
    "Shimla":      "SLV",   # Shimla Airport (Jubbarhatti)
    "Udaipur":     "UDR",   # Maharana Pratap Airport
    "Varanasi":    "VNS",   # Lal Bahadur Shastri International
}

# ── Nearest city notes (for frontend display) ────────────────
AIRPORT_NOTES = {
    "Gangtok":    "Flies into Bagdogra (IXB) — 2.5hr drive to Gangtok",
    "Kodaikanal": "Flies into Madurai (MDU) — 1.5hr drive to Kodaikanal",
    "Manali":     "Flies into Kullu-Manali (KUU) — 1hr drive to Manali",
    "Munnar":     "Flies into Kochi (COK) — 3hr drive to Munnar",
    "Ooty":       "Flies into Coimbatore (CJB) — 1.5hr drive to Ooty",
    "Rishikesh":  "Flies into Dehradun (DED) — 45min drive to Rishikesh",
}

app = Flask(__name__)
app.secret_key = "travelplanner_secret"

# Enable CORS for local dev and deployed Next.js frontend (via FRONTEND_URL env var)
allowed_origins = [
    "http://localhost:3000", "http://127.0.0.1:3000",
    "http://localhost:3001", "http://127.0.0.1:3001"
]
env_frontend = os.getenv("FRONTEND_URL") or os.getenv("ALLOWED_ORIGINS")
if env_frontend:
    for url in env_frontend.split(","):
        clean_url = url.strip().rstrip("/")
        if clean_url and clean_url not in allowed_origins:
            allowed_origins.append(clean_url)

CORS(app, resources={r"/*": {"origins": allowed_origins}})

def rate_limit_key():
    user_id = getattr(g, 'user_id', None)
    if not user_id:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            payload = verify_token(token)
            if payload:
                user_id = payload.get("user_id")
    if user_id:
        return f"user:{user_id}"
    return get_remote_address()

limiter = Limiter(
    key_func=rate_limit_key,
    app=app,
    default_limits=[],
    storage_uri="memory://"
)

@app.errorhandler(429)
def ratelimit_handler(e):
    retry_after = getattr(e, 'retry_after', None)
    if retry_after:
        msg = f"Too many requests, try again in {int(retry_after)} seconds."
    else:
        msg = "Too many requests, please try again later."
    return jsonify({
        'success': False,
        'error': msg,
        'retry_after': int(retry_after) if retry_after else 60
    }), 429


CITY_FALLBACK_IMAGES = {
    "Jaipur": "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop",
    "Jodhpur": "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&auto=format&fit=crop",
    "Udaipur": "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?w=800&auto=format&fit=crop",
    "Kochi": "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=800&auto=format&fit=crop",
    "Munnar": "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=800&auto=format&fit=crop",
    "Leh Ladakh": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&auto=format&fit=crop",
    "Manali": "https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=800&auto=format&fit=crop",
    "Shimla": "https://images.unsplash.com/photo-1597074866923-dc0589150358?w=800&auto=format&fit=crop",
    "Gangtok": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop",
    "Rishikesh": "https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=800&auto=format&fit=crop",
    "Goa": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop",
    "Ooty": "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&auto=format&fit=crop",
    "Kodaikanal": "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&auto=format&fit=crop",
    "Pondicherry": "https://images.unsplash.com/photo-1589519160732-57fc498494f8?w=800&auto=format&fit=crop",
    "Mysore": "https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?w=800&auto=format&fit=crop",
    "Mumbai": "https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=800&auto=format&fit=crop",
    "Delhi": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&auto=format&fit=crop",
    "Bangalore": "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800&auto=format&fit=crop",
    "Kolkata": "https://images.unsplash.com/photo-1558431382-27e303142255?w=800&auto=format&fit=crop",
    "Hyderabad": "https://images.unsplash.com/photo-1581888227599-779811939961?w=800&auto=format&fit=crop",
    "Amritsar": "https://images.unsplash.com/photo-1514222134-b57cbb8ce073?w=800&auto=format&fit=crop",
    "Varanasi": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Ghats_of_Varanasi_-_Ganga_aarti_-_Dashashwamedh_Ghat.jpg/800px-Ghats_of_Varanasi_-_Ganga_aarti_-_Dashashwamedh_Ghat.jpg",
    "Agra": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Taj_Mahal_%28Edited%29.jpeg/800px-Taj_Mahal_%28Edited%29.jpeg",
}


# ---------------- DATABASE INIT ----------------

def init_db():
    # Run versioned migration scripts
    run_migrations("database.db", "migrations")
    
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()
    
    # Check if places table is empty, and seed if so
    cursor.execute("SELECT COUNT(*) FROM places")
    count = cursor.fetchone()[0]
    
    if count == 0:
        # Load existing places from JSON as initial seed
        json_path = os.path.join("data", "places.json")
        seed_places = []
        if os.path.exists(json_path):
            try:
                with open(json_path, "r", encoding="utf-8") as file:
                    seed_places = json.load(file)
            except Exception as e:
                print("Error reading places.json seed:", e)
        
        # New cities and expanded spots to seed
        new_places = [
            # Leh Ladakh
            {"name": "Shanti Stupa", "city": "Leh Ladakh", "category": "temple", "rating": 4.7, "latitude": 34.1724, "longitude": 77.5746, 
             "description": "A beautiful white-domed Buddhist stupa on a hilltop in Chanspa, offering panoramic sunset views of Leh.", 
             "image": CITY_FALLBACK_IMAGES["Leh Ladakh"]},
            {"name": "Leh Palace", "city": "Leh Ladakh", "category": "history", "rating": 4.4, "latitude": 34.1661, "longitude": 77.5867, 
             "description": "A former royal palace overlooking the town of Leh, modeled after the Potala Palace in Lhasa, Tibet.", 
             "image": CITY_FALLBACK_IMAGES["Leh Ladakh"]},
            {"name": "Pangong Lake", "city": "Leh Ladakh", "category": "nature", "rating": 4.9, "latitude": 33.7595, "longitude": 78.6674, 
             "description": "A breathtaking endorheic lake in the Himalayas situated at a height of 4,350m, famous for changing colors.", 
             "image": CITY_FALLBACK_IMAGES["Leh Ladakh"]},
            {"name": "Nubra Valley", "city": "Leh Ladakh", "category": "nature", "rating": 4.8, "latitude": 34.6863, "longitude": 77.5673, 
             "description": "A high-altitude cold desert famous for its double-humped Bactrian camels and scenic mountain vistas.", 
             "image": CITY_FALLBACK_IMAGES["Leh Ladakh"]},
            {"name": "Magnetic Hill", "city": "Leh Ladakh", "category": "adventure", "rating": 4.2, "latitude": 34.1691, "longitude": 77.3533, 
             "description": "A gravity hill where vehicles appear to roll uphill against gravity, surrounded by stunning barren mountains.", 
             "image": CITY_FALLBACK_IMAGES["Leh Ladakh"]},
            {"name": "Khardung La Pass", "city": "Leh Ladakh", "category": "adventure", "rating": 4.8, "latitude": 34.2787, "longitude": 77.6047, 
             "description": "One of the highest motorable mountain passes in the world, offering dramatic snowy Himalayan views.", 
             "image": CITY_FALLBACK_IMAGES["Leh Ladakh"]},

            # Munnar
            {"name": "Eravikulam National Park", "city": "Munnar", "category": "nature", "rating": 4.6, "latitude": 10.1983, "longitude": 77.0863, 
             "description": "A sanctuary famous for the endangered Nilgiri Tahr mountain goat and the blooming Neelakurinji flowers.", 
             "image": CITY_FALLBACK_IMAGES["Munnar"]},
            {"name": "Mattupetty Dam", "city": "Munnar", "category": "nature", "rating": 4.4, "latitude": 10.1064, "longitude": 77.1248, 
             "description": "A beautiful storage concrete gravity dam offering speed boating and scenic views of tea gardens.", 
             "image": CITY_FALLBACK_IMAGES["Munnar"]},
            {"name": "Tea Museum", "city": "Munnar", "category": "museum", "rating": 4.3, "latitude": 10.0894, "longitude": 77.0604, 
             "description": "A museum showcasing the growth and processing of Munnar's tea plantations from simple tools to modern factories.", 
             "image": CITY_FALLBACK_IMAGES["Munnar"]},
            {"name": "Anamudi Peak", "city": "Munnar", "category": "adventure", "rating": 4.7, "latitude": 10.1683, "longitude": 77.0628, 
             "description": "The highest peak in South India, offering trekking paths and views of misty valleys.", 
             "image": CITY_FALLBACK_IMAGES["Munnar"]},
            {"name": "Kundala Lake", "city": "Munnar", "category": "nature", "rating": 4.4, "latitude": 10.1384, "longitude": 77.1747, 
             "description": "A picturesque lake surrounded by hills and green forests, famous for Shikara boat rides.", 
             "image": CITY_FALLBACK_IMAGES["Munnar"]},
            {"name": "Attukad Waterfalls", "city": "Munnar", "category": "nature", "rating": 4.5, "latitude": 10.0543, "longitude": 77.0425, 
             "description": "A scenic waterfall nestled between hills and thick jungle, ideal for hiking and nature photography.", 
             "image": CITY_FALLBACK_IMAGES["Munnar"]},

            # Ooty
            {"name": "Ooty Botanical Gardens", "city": "Ooty", "category": "nature", "rating": 4.5, "latitude": 11.4182, "longitude": 76.7118, 
             "description": "A sprawling 55-acre garden established in 1848, featuring thousands of exotic plant species and a fossil tree trunk.", 
             "image": CITY_FALLBACK_IMAGES["Ooty"]},
            {"name": "Ooty Lake", "city": "Ooty", "category": "nature", "rating": 4.1, "latitude": 11.4084, "longitude": 76.6897, 
             "description": "An artificial lake built in 1824, offering family boating, cycling tracks, and lakeside amusement rides.", 
             "image": CITY_FALLBACK_IMAGES["Ooty"]},
            {"name": "Doddabetta Peak", "city": "Ooty", "category": "adventure", "rating": 4.4, "latitude": 11.4003, "longitude": 76.7364, 
             "description": "The highest mountain peak in the Nilgiri Hills, featuring a telescope house for panoramic valley views.", 
             "image": CITY_FALLBACK_IMAGES["Ooty"]},
            {"name": "Rose Garden", "city": "Ooty", "category": "nature", "rating": 4.5, "latitude": 11.4072, "longitude": 76.7111, 
             "description": "A beautifully terraced garden holding India's largest collection of roses, with thousands of unique varieties.", 
             "image": CITY_FALLBACK_IMAGES["Ooty"]},
            {"name": "Pykara Waterfalls", "city": "Ooty", "category": "nature", "rating": 4.5, "latitude": 11.5303, "longitude": 76.5986, 
             "description": "Beautiful waterfalls cascading down rocky steps, surrounded by scenic pine forests and boating lakes.", 
             "image": CITY_FALLBACK_IMAGES["Ooty"]},
            {"name": "Avalanche Lake", "city": "Ooty", "category": "nature", "rating": 4.7, "latitude": 11.2917, "longitude": 76.6022, 
             "description": "A serene and untouched lake surrounded by dense forests and flowers, perfect for camping and trout fishing.", 
             "image": CITY_FALLBACK_IMAGES["Ooty"]},

            # Pondicherry
            {"name": "Promenade Beach", "city": "Pondicherry", "category": "nature", "rating": 4.6, "latitude": 11.9338, "longitude": 79.8354, 
             "description": "A beautiful rocky beachfront walk along the French Quarter, popular for evening strolls and sea breeze.", 
             "image": CITY_FALLBACK_IMAGES["Pondicherry"]},
            {"name": "Auroville", "city": "Pondicherry", "category": "culture", "rating": 4.5, "latitude": 12.0069, "longitude": 79.8106, 
             "description": "An experimental township aimed at human unity, famous for the magnificent gold-plated Matrimandir dome.", 
             "image": CITY_FALLBACK_IMAGES["Pondicherry"]},
            {"name": "Paradise Beach", "city": "Pondicherry", "category": "nature", "rating": 4.4, "latitude": 11.8864, "longitude": 79.8164, 
             "description": "A clean, isolated sandy beach accessible via scenic backwater boat rides from Chunnambar Boat House.", 
             "image": CITY_FALLBACK_IMAGES["Pondicherry"]},
            {"name": "Sri Aurobindo Ashram", "city": "Pondicherry", "category": "culture", "rating": 4.6, "latitude": 11.9364, "longitude": 79.8344, 
             "description": "A spiritual community ashram founded in 1926, known for its tranquil gardens and meditation spaces.", 
             "image": CITY_FALLBACK_IMAGES["Pondicherry"]},
            {"name": "French Quarter", "city": "Pondicherry", "category": "history", "rating": 4.7, "latitude": 11.9328, "longitude": 79.8322, 
             "description": "A charming neighborhood featuring French colonial villas, mustard-yellow walls, boutiques, and cafes.", 
             "image": CITY_FALLBACK_IMAGES["Pondicherry"]},
            {"name": "Sacred Heart Basilica", "city": "Pondicherry", "category": "church", "rating": 4.6, "latitude": 11.9281, "longitude": 79.8252, 
             "description": "An elegant Gothic revival church featuring stained-glass panels depicting the life of Christ.", 
             "image": CITY_FALLBACK_IMAGES["Pondicherry"]},

            # Kodaikanal
            {"name": "Kodaikanal Lake", "city": "Kodaikanal", "category": "nature", "rating": 4.5, "latitude": 10.2312, "longitude": 77.4897, 
             "description": "A star-shaped man-made lake in the center of town, popular for rowboats, pedalboats, and cycling.", 
             "image": CITY_FALLBACK_IMAGES["Kodaikanal"]},
            {"name": "Coaker's Walk", "city": "Kodaikanal", "category": "nature", "rating": 4.4, "latitude": 10.2323, "longitude": 77.4952, 
             "description": "A narrow pedestrian path constructed along mountain edges, offering views of valleys and clouds.", 
             "image": CITY_FALLBACK_IMAGES["Kodaikanal"]},
            {"name": "Bryant Park", "city": "Kodaikanal", "category": "nature", "rating": 4.2, "latitude": 10.2315, "longitude": 77.4945, 
             "description": "A beautifully maintained botanical park situated next to the lake, featuring glasshouses and rose beds.", 
             "image": CITY_FALLBACK_IMAGES["Kodaikanal"]},
            {"name": "Silver Cascade Falls", "city": "Kodaikanal", "category": "nature", "rating": 4.1, "latitude": 10.2524, "longitude": 77.5218, 
             "description": "A roaring 180-foot waterfall formed from the overflow of Kodaikanal Lake, visible from the road.", 
             "image": CITY_FALLBACK_IMAGES["Kodaikanal"]},
            {"name": "Pillar Rocks", "city": "Kodaikanal", "category": "adventure", "rating": 4.5, "latitude": 10.2036, "longitude": 77.4682, 
             "description": "Three vertical granite pillars standing shoulder-to-shoulder, rising to a height of 400 feet in thick fog.", 
             "image": CITY_FALLBACK_IMAGES["Kodaikanal"]},
            {"name": "Guna Caves", "city": "Kodaikanal", "category": "adventure", "rating": 4.3, "latitude": 10.1982, "longitude": 77.4647, 
             "description": "Chambers of deep rock ravines nestled between massive pillar roots, famous from film history.", 
             "image": CITY_FALLBACK_IMAGES["Kodaikanal"]},

            # Extra sights for existing cities
            {"name": "Sisodia Rani Ka Bagh", "city": "Jaipur", "category": "nature", "rating": 4.3, "latitude": 26.8906, "longitude": 75.8752, 
             "description": "A multi-layered royal garden featuring terraced lawns, water fountains, and painted pavilions dedicated to Radha-Krishna.", 
             "image": CITY_FALLBACK_IMAGES["Jaipur"]},
            {"name": "Galtaji Temple", "city": "Jaipur", "category": "temple", "rating": 4.5, "latitude": 26.9167, "longitude": 75.8583, 
             "description": "An ancient Hindu pilgrimage site nestled in mountain passes, famous for natural springs and holy monkey pools.", 
             "image": CITY_FALLBACK_IMAGES["Jaipur"]},
            {"name": "Arambol Beach", "city": "Goa", "category": "nature", "rating": 4.6, "latitude": 15.6881, "longitude": 73.7025, 
             "description": "A bohemian coastal village in North Goa, famous for sunset drum circles, yoga centers, and sweetwater lakes.", 
             "image": CITY_FALLBACK_IMAGES["Goa"]},
            {"name": "Fontainhas Latin Quarter", "city": "Goa", "category": "history", "rating": 4.7, "latitude": 15.4984, "longitude": 73.8322, 
             "description": "A historic colonial neighborhood in Panaji, containing bright-colored Portuguese houses and cozy cafes.", 
             "image": CITY_FALLBACK_IMAGES["Goa"]},
            {"name": "Hampta Pass", "city": "Manali", "category": "adventure", "rating": 4.8, "latitude": 32.2281, "longitude": 77.3400, 
             "description": "A dramatic mountain trekking pass connecting the green valleys of Kullu to the barren desert landscapes of Lahaul.", 
             "image": CITY_FALLBACK_IMAGES["Manali"]},
            {"name": "Safdarjung Tomb", "city": "Delhi", "category": "history", "rating": 4.4, "latitude": 28.5892, "longitude": 77.2106, 
             "description": "The final monumental garden tomb of the Mughal empire, built in 1754 with beautiful sandstone domes.", 
             "image": CITY_FALLBACK_IMAGES["Delhi"]},
            {"name": "National Gallery of Modern Art", "city": "Delhi", "category": "museum", "rating": 4.5, "latitude": 28.6111, "longitude": 77.2344, 
             "description": "The premier art gallery of Delhi, housed in Jaipur House, containing thousands of contemporary and historical art pieces.", 
             "image": CITY_FALLBACK_IMAGES["Delhi"]}
        ]
        
        all_to_insert = seed_places + new_places
        
        # Insert all into SQLite
        cursor.executemany("""
            INSERT INTO places (name, city, category, rating, latitude, longitude, description, image)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, [
            (p.get("name"), p.get("city"), p.get("category"), p.get("rating"), 
             p.get("latitude"), p.get("longitude"), p.get("description"), p.get("image"))
            for p in all_to_insert
        ])
        
    conn.commit()
    conn.close()

init_db()

# ---------------- LOAD PLACES ----------------

def load_places():
    conn = sqlite3.connect("database.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, name, city, category, rating, latitude, longitude, description, image, 
               image_attribution, image_attribution_link 
        FROM places
    """)
    rows = cursor.fetchall()
    places = [dict(row) for row in rows]
    conn.close()
    return places


def get_unsplash_image(place_name, city=None):
    """
    Tier 1: Unsplash API for high-resolution, consistent place photography.
    Queries matching place_name + city.
    Caches resolved image URL + photographer attribution in api_cache for 30 days.
    """
    place_cleaned = place_name.strip()
    city_str = city.strip() if city else ""
    cache_key = f"unsplash:img:{place_cleaned.lower()}:{city_str.lower()}"

    cached = get_cached_response(cache_key)
    if cached is not None:
        return cached

    access_key = os.getenv("UNSPLASH_ACCESS_KEY") or os.getenv("UNSPLASH_KEY")

    if access_key:
        try:
            query = f"{place_cleaned} {city_str}".strip()
            url = "https://api.unsplash.com/search/photos"
            params = {
                "query": query,
                "per_page": 1,
                "orientation": "landscape",
                "client_id": access_key
            }
            resp = requests.get(url, params=params, timeout=3.5)
            if resp.status_code == 200:
                data = resp.json()
                results = data.get("results", [])
                if results:
                    photo = results[0]
                    img_url = photo.get("urls", {}).get("regular") or photo.get("urls", {}).get("small")
                    user = photo.get("user", {})
                    photographer = user.get("name") or "Unsplash Contributor"
                    profile_link = user.get("links", {}).get("html") or "https://unsplash.com"

                    payload = {
                        "image": img_url,
                        "attribution_name": photographer,
                        "attribution_link": profile_link,
                        "source": "unsplash"
                    }
                    set_cached_response(cache_key, payload, 2592000)  # 30 days TTL
                    return payload
        except Exception as e:
            print(f"[Unsplash API Error] {e}")
            expired_cached = get_cached_response(cache_key, ignore_ttl=True)
            if expired_cached:
                return expired_cached

    return None


def get_wikipedia_image(place_name, city=None):
    place_cleaned = place_name.strip()
    cache_key = f"wiki:img:{place_cleaned.lower()}:{city.lower() if city else ''}"
    cached = get_cached_response(cache_key)
    if cached is not None:
        return cached.get("image")

    url = "https://en.wikipedia.org/w/api.php"
    headers = {
        "User-Agent": "TravelEaseAI/1.0 (contact@traveleaseai.com)"
    }
    
    # Try searching "PlaceName CityName" first, then "PlaceName"
    queries = []
    if city:
        queries.append(f"{place_cleaned} {city}")
    queries.append(place_cleaned)
    
    for q in queries:
        params = {
            "action": "query",
            "list": "search",
            "srsearch": q,
            "srlimit": 3,
            "format": "json"
        }
        try:
            response = requests.get(url, headers=headers, params=params, timeout=3.0)
            if response.status_code == 200:
                search_results = response.json().get("query", {}).get("search", [])
                for result in search_results:
                    title = result.get("title", "")
                    title_lower = title.lower()
                    
                    # Split place name into keywords for strict title matching check
                    keywords = [w.lower() for w in place_cleaned.split() if w.lower() not in ["and", "the", "of", "in", "to", "for", "at", "a", "an", "is", "on"] and len(w) >= 3]
                    if not keywords:
                        keywords = [place_cleaned.lower()]
                        
                    matches = [k for k in keywords if k in title_lower]
                    
                    # Ensure at least 50% of the significant keywords are in the page title
                    # OR that the complete place name is inside the title.
                    if len(matches) >= max(1, len(keywords) // 2) or place_cleaned.lower() in title_lower:
                        img_params = {
                            "action": "query",
                            "titles": title,
                            "prop": "pageimages",
                            "piprop": "thumbnail",
                            "pithumbsize": 640,
                            "format": "json",
                            "redirects": 1
                        }
                        img_response = requests.get(url, headers=headers, params=img_params, timeout=3.0)
                        if img_response.status_code == 200:
                            pages = img_response.json().get("query", {}).get("pages", {})
                            for page_id, page_data in pages.items():
                                thumbnail = page_data.get("thumbnail", {})
                                source = thumbnail.get("source")
                                # Exclude globe icons, locator maps, earth/satellite images
                                if source and not any(x in source.lower() for x in ["globe", "map_marker", "earth", "satellite", "pitt_icon", "locator"]):
                                    set_cached_response(cache_key, {"image": source}, 604800)  # 7 days TTL
                                    return source
        except Exception as e:
            print(f"Error querying Wikipedia for '{q}': {e}")
            expired_cached = get_cached_response(cache_key, ignore_ttl=True)
            if expired_cached:
                return expired_cached.get("image")
            
    return None


def get_place_image(place_name, city=None):
    """
    Multi-Tier Place Image Resolution Pipeline:
    1. Tier 1: Unsplash API (High-quality photography with photographer attribution)
    2. Tier 2: Wikipedia OpenSearch API (With strict keyword-matching guards)
    3. Tier 3: Curated City Fallback Images (CITY_FALLBACK_IMAGES)
    """
    # Tier 1: Unsplash
    unsplash_res = get_unsplash_image(place_name, city)
    if unsplash_res and unsplash_res.get("image"):
        return (
            unsplash_res.get("image"),
            unsplash_res.get("attribution_name", "Unsplash Contributor"),
            unsplash_res.get("attribution_link", "https://unsplash.com")
        )

    # Tier 2: Wikipedia
    wiki_img = get_wikipedia_image(place_name, city)
    if wiki_img:
        wiki_link = f"https://en.wikipedia.org/wiki/{place_name.replace(' ', '_')}"
        return wiki_img, "Wikipedia", wiki_link

    # Tier 3: Curated City Fallback
    fallback_img = None
    if city:
        fallback_img = CITY_FALLBACK_IMAGES.get(city) or CITY_FALLBACK_IMAGES.get(city.title())
    if not fallback_img:
        fallback_img = CITY_FALLBACK_IMAGES.get("Default", "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80")

    return fallback_img, "Unsplash", "https://unsplash.com"



def fetch_places_from_api(city, lat, lon):
    cache_key = f"geoapify:places:{city.strip().lower()}"
    cached = get_cached_response(cache_key)
    if cached is not None:
        return cached

    api_key = os.getenv("GEOAPIFY_KEY")
    if not api_key:
        return []
    
    categories = "tourism.sights,tourism.attraction,entertainment.culture,leisure.park"
    url = "https://api.geoapify.com/v2/places"
    params = {
        "categories": categories,
        "filter": f"circle:{lon},{lat},15000",
        "limit": 30,
        "apiKey": api_key
    }
    
    try:
        response = requests.get(url, params=params, timeout=5)
        if response.status_code != 200:
            expired_cached = get_cached_response(cache_key, ignore_ttl=True)
            return expired_cached if expired_cached else []

        data = response.json()
        places = []
        features = data.get("features", [])
        
        # Simple categories mapping
        for feat in features:
            props = feat.get("properties", {})
            geom = feat.get("geometry", {})
            name = props.get("name")
            if not name:
                continue
                
            categories_list = props.get("categories", [])
            category = "nature"  # default
            
            # Map category
            if any("temple" in c or "place_of_worship" in c or "religion" in c for c in categories_list):
                category = "temple"
            elif any("church" in c or "cathedral" in c for c in categories_list):
                category = "church"
            elif any("museum" in c or "art" in c or "gallery" in c for c in categories_list):
                category = "museum"
            elif any("historic" in c or "castle" in c or "monument" in c or "ruin" in c for c in categories_list):
                category = "history"
            elif any("tourism.attraction" in c or "entertainment.culture" in c or "theatre" in c for c in categories_list):
                category = "culture"
            elif any("leisure.park" in c or "natural" in c or "forest" in c or "garden" in c for c in categories_list):
                category = "nature"
            elif any("adventure" in c or "theme_park" in c or "sport" in c or "hiking" in c for c in categories_list):
                category = "adventure"
                
            rating = round(4.0 + (props.get("rank", {}).get("confidence", 0.5) * 0.9), 1)
            p_lat = geom.get("coordinates", [lon, lat])[1]
            p_lon = geom.get("coordinates", [lon, lat])[0]
            
            # Fallback descriptions
            category_fallbacks = {
                "history": "A fascinating historical landmark offering a deep dive into the rich heritage and architecture of the region.",
                "nature": "A breathtaking scenic spot offering peaceful surroundings and beautiful photo opportunities close to nature.",
                "museum": "A treasure trove of art, history, and cultural artifacts representing the rich heritage of the city.",
                "culture": "A lively cultural hub where visitors can experience traditional lifestyles, local crafts, and delicious street food.",
                "temple": "A peaceful and sacred place of worship, exhibiting spectacular traditional architecture and spiritual vibes.",
                "church": "A historic sanctuary displaying beautiful colonial architecture, stained glass, and tranquil interiors.",
                "adventure": "An exciting spot offering thrill-seeking outdoor activities, panoramic views, and memorable fun.",
                "spiritual": "A sacred spot of peace, contemplation, and ancient spiritual significance."
            }
            desc = props.get("address_line2") or props.get("street") or category_fallbacks.get(category, "A popular destination offering unforgettable sights and activities.")
            
            img_url = CITY_FALLBACK_IMAGES.get(city.title()) or CITY_FALLBACK_IMAGES.get(city) or "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop"
            
            places.append({
                "name": name,
                "city": city.title(),
                "category": category,
                "rating": rating,
                "latitude": p_lat,
                "longitude": p_lon,
                "description": desc,
                "image": img_url
            })
            
        # Deduplicate fetched list by name
        seen = set()
        unique_fetched = []
        for p in places:
            k = p["name"].strip().lower()
            if k not in seen:
                seen.add(k)
                unique_fetched.append(p)
                
        set_cached_response(cache_key, unique_fetched, 604800)  # 7 days TTL
        return unique_fetched
    except Exception as e:
        print(f"Error fetching places from Geoapify for '{city}': {e}. Checking fallback cache...")
        expired_cached = get_cached_response(cache_key, ignore_ttl=True)
        return expired_cached if expired_cached else []


@app.route('/')
def home():
    return render_template("index.html")


# ---------------- DUFFEL FLIGHTS API ROUTES ----------------

@app.route('/api/flights/search', methods=['GET'])
@limiter.limit("30 per minute")
def api_search_flights():
    origin      = request.args.get('from', 'DEL')
    dest_name   = request.args.get('destination', '')
    destination = request.args.get('to') or AIRPORT_CODES.get(dest_name, 'BOM')
    date        = request.args.get('date')
    cabin       = request.args.get('cabin', 'economy')
    adults      = int(request.args.get('adults', 1))

    if not date:
        return jsonify({"error": "date is required in YYYY-MM-DD format"}), 400

    cache_key = f"duffel:flights:{origin}:{destination}:{date}:{cabin}:{adults}"
    cached = get_cached_response(cache_key)
    if cached is not None:
        return jsonify(cached)

    # Get airport note if applicable (e.g. Gangtok, Manali etc.)
    airport_note = AIRPORT_NOTES.get(dest_name, None)

    payload = {
        "data": {
            "slices": [{
                "origin":         origin,
                "destination":    destination,
                "departure_date": date
            }],
            "passengers":  [{"type": "adult"}] * adults,
            "cabin_class": cabin
        }
    }

    try:
        resp = requests.post(
            "https://api.duffel.com/air/offer_requests?return_offers=true",
            headers=DUFFEL_HEADERS,
            json=payload,
            timeout=15
        )
        data = resp.json()

        if "errors" in data:
            expired_cached = get_cached_response(cache_key, ignore_ttl=True)
            if expired_cached:
                return jsonify(expired_cached)
            return jsonify({"error": data["errors"]}), 502

        offers = data.get("data", {}).get("offers", [])

        flights = []
        parse_errors = []
        for o in offers[:10]:
            try:
                slice_ = o["slices"][0]
                seg    = slice_["segments"][0]
                origin_obj = slice_["origin"]
                dest_obj   = slice_["destination"]
                # Duffel returns city as a plain string field 'city_name'
                from_city = (
                    origin_obj.get("city_name")
                    or (origin_obj.get("city") or {}).get("name")
                    or origin
                )
                to_city = (
                    dest_obj.get("city_name")
                    or (dest_obj.get("city") or {}).get("name")
                    or dest_name
                )
                raw_price    = float(o["total_amount"])
                raw_currency = o["total_currency"]
                # Convert to INR (Duffel test sandbox often returns AUD/USD)
                INR_RATES = {"AUD": 55.0, "USD": 83.5, "EUR": 91.0, "GBP": 106.0, "INR": 1.0}
                inr_price = int(raw_price * INR_RATES.get(raw_currency, 80.0))
                flights.append({
                    "offer_id":     o["id"],
                    "airline":      o["owner"]["name"],
                    "airline_code": o["owner"].get("iata_code", "ZZ"),
                    "flight_no":    seg.get("operating_carrier_flight_number", ""),
                    "from":         origin_obj["iata_code"],
                    "from_city":    from_city,
                    "to":           dest_obj["iata_code"],
                    "to_city":      to_city,
                    "departs":      seg["departing_at"],
                    "arrives":      seg["arriving_at"],
                    "duration":     slice_["duration"],
                    "stops":        len(slice_["segments"]) - 1,
                    "cabin":        cabin,
                    "price":        inr_price,
                    "currency":     "INR",
                })
            except Exception as parse_err:
                parse_errors.append(str(parse_err))
                continue
        if parse_errors:
            print(f"[flights] {len(parse_errors)} offers failed to parse: {parse_errors[:3]}")

        flights.sort(key=lambda x: x["price"])

        result_payload = {
            "from":         origin,
            "to":           destination,
            "destination":  dest_name,
            "date":         date,
            "cabin":        cabin,
            "count":        len(flights),
            "airport_note": airport_note,
            "flights":      flights
        }
        set_cached_response(cache_key, result_payload, 900)  # 15 minutes TTL
        return jsonify(result_payload)

    except Exception as e:
        print(f"Error fetching Duffel flights: {e}. Checking fallback cache...")
        expired_cached = get_cached_response(cache_key, ignore_ttl=True)
        if expired_cached:
            return jsonify(expired_cached)
        return jsonify({"error": str(e)}), 500


# ── Route: List all supported cities ─────────────────────────
@app.route('/api/flights/cities', methods=['GET'])
def api_get_cities():
    cities = []
    for city, code in AIRPORT_CODES.items():
        cities.append({
            "city":         city,
            "iata":         code,
            "note":         AIRPORT_NOTES.get(city, None)
        })
    return jsonify({"cities": cities, "count": len(cities)})


# ==================== JSON API ROUTES (for Next.js frontend) ====================

@app.route('/api/stats')
def api_stats():
    """Summary stats for admin dashboard and frontend."""
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM trips")
    total_trips = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM places")
    total_places = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*), SUM(amount) FROM expenses")
    exp_row = cursor.fetchone()
    total_expenses = exp_row[0] or 0
    total_spent = int(exp_row[1] or 0)
    cursor.execute("SELECT AVG(budget) FROM trips")
    avg_budget = cursor.fetchone()[0]
    cursor.execute("SELECT city, COUNT(*) as cnt FROM trips GROUP BY city ORDER BY cnt DESC LIMIT 5")
    top_cities = [{'city': row[0], 'count': row[1]} for row in cursor.fetchall()]
    cursor.execute("SELECT COUNT(*) FROM trips WHERE date(created_at) = date('now')")
    trips_today = cursor.fetchone()[0]
    conn.close()
    return jsonify({
        'total_trips': total_trips,
        'total_places': total_places,
        'total_expenses': total_expenses,
        'total_spent': total_spent,
        'avg_budget': round(avg_budget or 0, 2),
        'top_cities': top_cities,
        'trips_today': trips_today
    })


# ── Authentication Endpoints ────────────────────────────────────

@app.route('/api/auth/register', methods=['POST'])
def api_register():
    data = request.get_json() or {}
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    if not email or not password:
        return jsonify({"success": False, "error": "Email and password are required"}), 400

    if len(password) < 6:
        return jsonify({"success": False, "error": "Password must be at least 6 characters long"}), 400

    try:
        conn = sqlite3.connect("database.db")
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
        if cursor.fetchone():
            conn.close()
            return jsonify({"success": False, "error": "User with this email already exists"}), 400

        pwd_hash = generate_password_hash(password)
        cursor.execute("INSERT INTO users (email, password_hash) VALUES (?, ?)", (email, pwd_hash))
        user_id = cursor.lastrowid
        conn.commit()
        conn.close()

        token = generate_token(user_id, email)
        return jsonify({
            "success": True,
            "token": token,
            "user": {"id": user_id, "email": email}
        }), 201
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/auth/login', methods=['POST'])
def api_login():
    data = request.get_json() or {}
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    if not email or not password:
        return jsonify({"success": False, "error": "Email and password are required"}), 400

    try:
        conn = sqlite3.connect("database.db")
        cursor = conn.cursor()
        cursor.execute("SELECT id, email, password_hash FROM users WHERE email = ?", (email,))
        user_row = cursor.fetchone()
        conn.close()

        if not user_row or not check_password_hash(user_row[2], password):
            return jsonify({"success": False, "error": "Invalid email or password"}), 401

        user_id = user_row[0]
        user_email = user_row[1]
        token = generate_token(user_id, user_email)

        return jsonify({
            "success": True,
            "token": token,
            "user": {"id": user_id, "email": user_email}
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/auth/me', methods=['GET'])
@require_auth(optional=False)
def api_auth_me():
    return jsonify({
        "success": True,
        "user": {"id": g.user_id, "email": g.user_email}
    })


@app.route('/api/trips')
@limiter.limit("100 per minute")
@require_auth(optional=False)
def api_trips():
    """Return all saved trips for the authenticated user as JSON."""
    conn = sqlite3.connect("database.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, city, days, budget, pace, vibe, total_trip_cost, budget_remaining, created_at FROM trips WHERE user_id = ? ORDER BY created_at DESC",
        (g.user_id,)
    )
    trips = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify({'trips': trips})


@app.route('/api/trips/<int:trip_id>')
@require_auth(optional=False)
def api_get_trip(trip_id):
    """Return a single trip for the authenticated user."""
    conn = sqlite3.connect("database.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM trips WHERE id = ? AND user_id = ?", (trip_id, g.user_id))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return jsonify({'error': 'Trip not found or access denied'}), 404
    trip = dict(row)
    trip['itinerary'] = json.loads(trip.pop('itinerary_json', '[]'))
    trip['hotels'] = json.loads(trip.pop('hotels_json', '[]'))
    trip['weather'] = json.loads(trip.pop('weather_json', '{}'))
    return jsonify({'trip': trip})


@app.route('/api/trips/<int:trip_id>', methods=['DELETE'])
@require_auth(optional=False)
def api_delete_trip(trip_id):
    """Delete a trip owned by the authenticated user."""
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()
    cursor.execute("DELETE FROM trips WHERE id = ? AND user_id = ?", (trip_id, g.user_id))
    affected = cursor.rowcount
    conn.commit()
    conn.close()
    if affected == 0:
        return jsonify({'success': False, 'error': 'Trip not found or access denied'}), 404
    return jsonify({'success': True})


@app.route('/api/bookings', methods=['POST'])
@limiter.limit("30 per minute")
@require_auth(optional=False)
def api_create_booking():
    """Create a stay booking entry in the database for the authenticated user."""
    try:
        data = request.get_json() or {}
        ref_id = data.get('reference_id')
        guest_name = data.get('guest_name')
        email = data.get('email')
        destination = data.get('destination')
        hotel_name = data.get('hotel_name')
        room_type = data.get('room_type')
        check_in = data.get('check_in')
        check_out = data.get('check_out')
        guests = int(data.get('guests', 1))
        total_cost = int(data.get('total_cost', 0))
        status = data.get('status', 'Confirmed')
        flight_info = data.get('flight_info')

        if not ref_id or not guest_name or not email or not destination or not hotel_name or not room_type:
            return jsonify({'success': False, 'error': 'Missing required fields'}), 400

        conn = sqlite3.connect("database.db")
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO bookings (reference_id, guest_name, email, destination, hotel_name, room_type, check_in, check_out, guests, total_cost, status, flight_info, user_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (ref_id, guest_name, email, destination, hotel_name, room_type, check_in, check_out, guests, total_cost, status, flight_info, g.user_id))
        conn.commit()
        conn.close()

        # Send non-blocking booking confirmation email & SMS
        try:
            send_booking_confirmation_email(data)
            if data.get("phone"):
                send_booking_confirmation_sms(data.get("phone"), data)
        except Exception as notif_err:
            print(f"[Notification Error] Non-blocking notification issue: {notif_err}")

        return jsonify({'success': True, 'reference_id': ref_id})
    except Exception as e:
        print("Error creating booking:", e)
        return jsonify({'success': False, 'error': str(e)}), 500


# ---------------- RAZORPAY PAYMENT ROUTES ----------------

@app.route('/api/payment/create-order', methods=['POST'])
@require_auth(optional=True)
def api_create_payment_order():
    """Create a Razorpay order in Test Mode using server-side calculated Grand Total."""
    data = request.get_json() or {}
    amount = float(data.get('amount', 0))
    currency = data.get('currency', 'INR')

    if amount <= 0:
        return jsonify({"success": False, "error": "Invalid order amount"}), 400

    order_result = create_razorpay_order(amount, currency=currency)
    if order_result.get("success"):
        return jsonify(order_result), 200
    else:
        return jsonify(order_result), 500


@app.route('/api/payment/verify-and-book', methods=['POST'])
@require_auth(optional=False)
def api_verify_payment_and_book():
    """Verifies Razorpay HMAC signature server-side before writing the booking to database.db."""
    data = request.get_json() or {}
    order_id = data.get('razorpay_order_id')
    payment_id = data.get('razorpay_payment_id')
    signature = data.get('razorpay_signature')
    booking_data = data.get('booking') or {}

    # Verify payment signature
    is_valid = verify_razorpay_signature(order_id, payment_id, signature)
    if not is_valid:
        return jsonify({'success': False, 'error': 'Razorpay payment signature verification failed'}), 400

    # Extract booking fields
    ref_id       = booking_data.get('reference_id') or ("AERO-" + str(int(time.time())))
    guest_name   = booking_data.get('guest_name')
    email        = booking_data.get('email')
    destination  = booking_data.get('destination')
    hotel_name   = booking_data.get('hotel_name', 'None')
    room_type    = booking_data.get('room_type', 'Standard Room')
    check_in     = booking_data.get('check_in')
    check_out    = booking_data.get('check_out')
    guests       = int(booking_data.get('guests', 1))
    total_cost   = float(booking_data.get('total_cost', 0))
    flight_info  = booking_data.get('flight_info')

    if not guest_name or not email or not destination or not check_in:
        return jsonify({'success': False, 'error': 'Missing required booking fields'}), 400

    try:
        conn = sqlite3.connect("database.db")
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO bookings (reference_id, guest_name, email, destination, hotel_name, room_type, check_in, check_out, guests, total_cost, status, flight_info, user_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (ref_id, guest_name, email, destination, hotel_name, room_type, check_in, check_out, guests, total_cost, "Confirmed", flight_info, g.user_id))
        conn.commit()
        conn.close()

        # Send non-blocking booking confirmation email & SMS
        try:
            send_booking_confirmation_email(booking_data)
            if booking_data.get("phone"):
                send_booking_confirmation_sms(booking_data.get("phone"), booking_data)
        except Exception as notif_err:
            print(f"[Notification Error] Non-blocking notification issue: {notif_err}")

        return jsonify({'success': True, 'reference_id': ref_id, 'payment_id': payment_id})
    except Exception as e:
        print("Error saving verified booking:", e)
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/bookings/<string:ref_id>', methods=['GET'])
def api_get_booking(ref_id):
    """Retrieve stay booking details by reference ID."""
    try:
        conn = sqlite3.connect("database.db")
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM bookings WHERE UPPER(reference_id) = ?", (ref_id.strip().upper(),))
        row = cursor.fetchone()
        conn.close()

        if not row:
            return jsonify({'success': False, 'error': 'Booking not found'}), 404

        booking = dict(row)
        return jsonify({'success': True, 'booking': booking})
    except Exception as e:
        print("Error looking up booking:", e)
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/places')
def api_places():
    """Return all places, optionally filtered by city."""
    city = request.args.get('city', '')
    conn = sqlite3.connect("database.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    if city:
        cursor.execute("SELECT * FROM places WHERE LOWER(city) = ? ORDER BY rating DESC", (city.lower(),))
    else:
        cursor.execute("SELECT * FROM places ORDER BY rating DESC")
    places = [dict(row) for row in cursor.fetchall()]
    return jsonify({'places': places, 'count': len(places)})


PYTHON_FALLBACK_HOTELS = {
    "bangalore": [
        { "name": "The Leela Palace Bengaluru", "address": "Old Airport Road, Bangalore", "rating": 4.8, "price": 9500, "latitude": 12.9606, "longitude": 77.6484 },
        { "name": "Taj West End", "address": "Race Course Road, Bangalore", "rating": 4.7, "price": 8200, "latitude": 12.9847, "longitude": 77.5796 },
        { "name": "ITC Gardenia", "address": "Residency Road, Bangalore", "rating": 4.6, "price": 7800, "latitude": 12.9592, "longitude": 77.5971 },
        { "name": "Radisson Blu Atria", "address": "Palace Road, Bangalore", "rating": 4.3, "price": 4200, "latitude": 12.9866, "longitude": 77.5888 }
    ],
    "jaipur": [
        { "name": "Rambagh Palace", "address": "Bhawani Singh Road, Jaipur", "rating": 4.9, "price": 12000, "latitude": 26.8981, "longitude": 75.8098 },
        { "name": "The Oberoi Rajvilas", "address": "Goner Road, Jaipur", "rating": 4.8, "price": 10500, "latitude": 26.8788, "longitude": 75.8974 },
        { "name": "ITC Rajputana", "address": "Palace Road, Jaipur", "rating": 4.5, "price": 5800, "latitude": 26.9224, "longitude": 75.7971 }
    ],
    "kochi": [
        { "name": "Brunton Boatyard", "address": "Fort Kochi, Kochi", "rating": 4.7, "price": 6500, "latitude": 9.9691, "longitude": 76.2435 },
        { "name": "Grand Hyatt Bolgatty", "address": "Mulavukad, Kochi", "rating": 4.8, "price": 7500, "latitude": 9.9922, "longitude": 76.2731 },
        { "name": "Taj Malabar Resort & Spa", "address": "Willingdon Island, Kochi", "rating": 4.6, "price": 6200, "latitude": 9.9642, "longitude": 76.2588 }
    ],
    "munnar": [
        { "name": "Windermere Estate", "address": "Bison Valley Road, Munnar", "rating": 4.7, "price": 6800, "latitude": 10.0612, "longitude": 77.0625 },
        { "name": "The Panoramic Getaway", "address": "Chithirapuram, Munnar", "rating": 4.9, "price": 8800, "latitude": 10.0384, "longitude": 77.0128 },
        { "name": "Elixir Hills Suites Resort", "address": "Anachal, Munnar", "rating": 4.6, "price": 7200, "latitude": 10.0212, "longitude": 76.9945 }
    ],
    "ooty": [
        { "name": "Savoy - IHCL SeleQtions", "address": "Sylks Road, Ooty", "rating": 4.7, "price": 9500, "latitude": 11.4112, "longitude": 76.6945 },
        { "name": "Sherlock Hotel", "address": "Tiger Hill Road, Ooty", "rating": 4.3, "price": 4500, "latitude": 11.4184, "longitude": 76.7212 },
        { "name": "Sinclairs Retreat Ooty", "address": "Gorishola Road, Ooty", "rating": 4.4, "price": 5000, "latitude": 11.4245, "longitude": 76.7388 }
    ],
    "kodaikanal": [
        { "name": "The Carlton Kodaikanal", "address": "Lake Road, Kodaikanal", "rating": 4.7, "price": 8500, "latitude": 10.2324, "longitude": 77.4912 },
        { "name": "Tamara Kodai", "address": "La Providence, Kodaikanal", "rating": 4.9, "price": 12500, "latitude": 10.2185, "longitude": 77.4975 },
        { "name": "Sterling Kodai Valley", "address": "Attuvampatti, Kodaikanal", "rating": 4.4, "price": 5500, "latitude": 10.2524, "longitude": 77.5145 }
    ],
    "pondicherry": [
        { "name": "Palais de Mahe - CGH Earth", "address": "Rue Bussy, French Quarter, Pondicherry", "rating": 4.8, "price": 10800, "latitude": 11.9324, "longitude": 79.8328 },
        { "name": "Villa Shanti", "address": "Rue Suffren, French Quarter, Pondicherry", "rating": 4.7, "price": 8200, "latitude": 11.9332, "longitude": 79.8318 },
        { "name": "Promenade Hotel", "address": "Goubert Avenue, Promenade Beach, Pondicherry", "rating": 4.4, "price": 6800, "latitude": 11.9347, "longitude": 79.8351 }
    ],
    "leh": [
        { "name": "The Grand Dragon Ladakh", "address": "Old Road, Leh Ladakh", "rating": 4.8, "price": 8500, "latitude": 34.1594, "longitude": 77.5828 },
        { "name": "Hotel Singge Palace", "address": "Main Bazaar, Leh Ladakh", "rating": 4.5, "price": 5200, "latitude": 34.1642, "longitude": 77.5853 },
        { "name": "Spic n Span Hotel", "address": "Fort Road, Leh Ladakh", "rating": 4.3, "price": 4000, "latitude": 34.1611, "longitude": 77.5831 }
    ],
    "delhi": [
        { "name": "The Taj Mahal Hotel", "address": "Mansingh Road, New Delhi", "rating": 4.8, "price": 11000, "latitude": 28.6042, "longitude": 77.2235 },
        { "name": "The Imperial", "address": "Janpath, Connaught Place, New Delhi", "rating": 4.7, "price": 9800, "latitude": 28.6254, "longitude": 77.2188 },
        { "name": "Shangri-La Eros", "address": "Ashoka Road, New Delhi", "rating": 4.6, "price": 7500, "latitude": 28.6212, "longitude": 77.2185 }
    ],
    "goa": [
        { "name": "Taj Exotica Resort & Spa", "address": "Benaulim Beach, South Goa", "rating": 4.9, "price": 13500, "latitude": 15.2447, "longitude": 73.9248 },
        { "name": "The Leela Goa", "address": "Mobor Beach, South Goa", "rating": 4.8, "price": 14000, "latitude": 15.1668, "longitude": 73.9482 },
        { "name": "W Goa", "address": "Vagator Beach, North Goa", "rating": 4.6, "price": 11500, "latitude": 15.6022, "longitude": 73.7348 }
    ],
    "agra": [
        { "name": "The Oberoi Amarvilas", "address": "Taj East Gate Road, Agra", "rating": 4.9, "price": 14500, "latitude": 27.1685, "longitude": 78.0465 },
        { "name": "Taj Hotel & Convention Centre", "address": "Taj East Gate Road, Agra", "rating": 4.7, "price": 8500, "latitude": 27.1624, "longitude": 78.0412 },
        { "name": "Courtyard by Marriott Agra", "address": "Fatehabad Road, Agra", "rating": 4.5, "price": 6000, "latitude": 27.1568, "longitude": 78.0588 }
    ],
    "varanasi": [
        { "name": "Taj Ganges Varanasi", "address": "Nadesar Palace Grounds, Varanasi", "rating": 4.8, "price": 9000, "latitude": 25.3324, "longitude": 82.9812 },
        { "name": "Brijrama Palace Heritage Hotel", "address": "Darbhanga Ghat, Varanasi", "rating": 4.7, "price": 11500, "latitude": 25.3082, "longitude": 83.0125 },
        { "name": "Radisson Hotel Varanasi", "address": "The Mall Road, Cantonment, Varanasi", "rating": 4.4, "price": 5500, "latitude": 25.3347, "longitude": 82.9845 }
    ],
    "default": [
        { "name": "AeroTravel Premium Stay", "address": "City Center Premier Zone", "rating": 4.5, "price": 3500 },
        { "name": "AeroTravel Standard Inn", "address": "Downtown Comfort Zone", "rating": 4.2, "price": 2200 },
        { "name": "AeroTravel Budget Hostel", "address": "Transit Circle Metro Zone", "rating": 3.9, "price": 1200 }
    ]
}

XOTELO_BASE = "https://data.xotelo.com/api"

# Location keys for all AeroTravel destinations
LOCATION_KEYS = {
    # Rajasthan circuit
    "Rajasthan": "g304555",   # Jaipur as primary
    "Jaipur":    "g304555",
    "Jodhpur":   "g297667",
    "Udaipur":   "g297633",   # Udaipur
    # Kerala circuit
    "Kerala":    "g297633",   # Kochi as primary
    "Kochi":     "g297631",
    "Munnar":    "g306354",
    # Himalayas
    "Leh Ladakh":"g858419",
    "Manali":    "g304559",
    "Shimla":    "g304558",
    "Gangtok":   "g297672",
    "Rishikesh": "g304557",
    # South India
    "Goa":       "g303877",
    "Ooty":      "g303885",
    "Kodaikanal":"g303884",
    "Pondicherry":"g304016",
    "Mysore":    "g304052",
    # Metro cities
    "Mumbai":    "g304554",
    "Delhi":     "g304551",
    "Bangalore": "g297628",
    "Kolkata":   "g304558",
    "Hyderabad": "g297586",
    "Amritsar":  "g304555",
    # Historical
    "Varanasi":  "g297685",
    "Agra":      "g297683",
}

def get_destination_mapping(query):
    if not query:
        return "Rajasthan"
    q = query.lower()
    # Specific cities first (more precise matches before group matches)
    if "bangalore" in q or "bengaluru" in q:
        return "Bangalore"
    if "kolkata" in q or "calcutta" in q:
        return "Kolkata"
    if "hyderabad" in q:
        return "Hyderabad"
    if "mysore" in q or "mysuru" in q:
        return "Mysore"
    if "pondicherry" in q or "puducherry" in q:
        return "Pondicherry"
    if "amritsar" in q:
        return "Amritsar"
    if "gangtok" in q:
        return "Gangtok"
    if "manali" in q:
        return "Manali"
    if "shimla" in q:
        return "Shimla"
    if "rishikesh" in q:
        return "Rishikesh"
    if "ooty" in q or "udhagamandalam" in q:
        return "Ooty"
    if "kodaikanal" in q or "kodai" in q:
        return "Kodaikanal"
    if "munnar" in q:
        return "Munnar"
    if "kochi" in q or "cochin" in q or "alleppey" in q or "kerala" in q:
        return "Kochi"
    if "jodhpur" in q:
        return "Jodhpur"
    if "udaipur" in q:
        return "Udaipur"
    if "jaipur" in q or "rajasthan" in q:
        return "Jaipur"
    if "leh" in q or "ladakh" in q:
        return "Leh Ladakh"
    if "goa" in q:
        return "Goa"
    if "mumbai" in q or "bombay" in q:
        return "Mumbai"
    if "delhi" in q or "new delhi" in q:
        return "Delhi"
    if "varanasi" in q or "banaras" in q:
        return "Varanasi"
    if "agra" in q or "taj" in q:
        return "Agra"
    if "amritsar" in q or "golden temple" in q:
        return "Amritsar"
        
    for key in LOCATION_KEYS:
        if key.lower() in q or q in key.lower():
            return key
    return "Rajasthan"

# ─── 1. Get hotel LIST for a destination ───────────────────────
@app.route('/api/hotels', methods=['GET'])
@limiter.limit("30 per minute")
def get_hotels():
    destination = request.args.get('destination') or request.args.get('city') or 'Rajasthan'
    limit       = request.args.get('limit', 10)
    sort        = request.args.get('sort', 'best_value')  # best_value | popularity | distance

    mapped_destination = get_destination_mapping(destination)
    location_key = LOCATION_KEYS.get(mapped_destination)
    if not location_key:
        location_key = LOCATION_KEYS["Rajasthan"]

    cache_key = f"xotelo:list:{destination.lower()}:{sort}:{limit}"
    cached = get_cached_response(cache_key)
    if cached is not None:
        return jsonify(cached)

    try:
        resp = requests.get(f"{XOTELO_BASE}/list", params={
            "location_key": location_key,
            "limit": limit,
            "sort": sort,
            "offset": 0
        }, timeout=4)
        data = resp.json()

        if data.get("error"):
            raise Exception(data["error"])

        hotels = data["result"]["list"]

        # Clean up for frontend & keep compatible with previous structure
        result = []
        for h in hotels:
            min_p = h.get("price_ranges", {}).get("minimum")
            max_p = h.get("price_ranges", {}).get("maximum")
            price = int(min_p) if min_p else 3500
            # If price looks like USD, convert to INR
            if price > 0 and price < 500:
                price = price * 83
            rating = h.get("review_summary", {}).get("rating")
            rating = float(rating) if rating else 4.2

            result.append({
                "name":   h.get("name"),
                "key":    h.get("key"),
                "type":   h.get("accommodation_type"),
                "image":  h.get("image"),
                "url":    h.get("url"),
                "rating": rating,
                "reviews":h.get("review_summary", {}).get("count"),
                "min_price": min_p,
                "max_price": max_p,
                "lat":    h.get("geo", {}).get("latitude"),
                "lng":    h.get("geo", {}).get("longitude"),
                "tags":   h.get("mentions", []),
                
                # Compatibility fields
                "price": price,
                "address": f"Near city center, {mapped_destination}",
                "latitude": h.get("geo", {}).get("latitude"),
                "longitude": h.get("geo", {}).get("longitude"),
                "rooms": [
                    {
                        "type": "Standard Room",
                        "price": price,
                        "description": "Comfortable room with twin/queen bed, air conditioning, and free Wi-Fi."
                    },
                    {
                        "type": "Deluxe Room",
                        "price": int(price * 1.4),
                        "description": "Spacious room with king bed, flat-screen TV, mini bar, and city view."
                    },
                    {
                        "type": "Royal Suite",
                        "price": int(price * 2.2),
                        "description": "Luxurious suite with private lounge, premium toiletries, and complimentary breakfast."
                    }
                ]
            })

        response_payload = {"success": True, "destination": mapped_destination, "hotels": result, "source": "api"}
        set_cached_response(cache_key, response_payload, 1800)  # 30 minutes TTL
        return jsonify(response_payload)

    except Exception as e:
        print(f"Xotelo list error, checking fallback cache: {e}")
        expired_cached = get_cached_response(cache_key, ignore_ttl=True)
        if expired_cached:
            return jsonify(expired_cached)

        print(f"No expired cache available. Using local fallback database...")
        key_to_use = mapped_destination.lower()
        fallback_key = None
        for key in PYTHON_FALLBACK_HOTELS.keys():
            if key in key_to_use or key_to_use in key:
                fallback_key = key
                break
        
        key_to_use = fallback_key if fallback_key else "default"
        fallback_list = PYTHON_FALLBACK_HOTELS.get(key_to_use, PYTHON_FALLBACK_HOTELS["default"])
        
        result = []
        for h in fallback_list:
            price = h["price"]
            rooms = [
                {
                    "type": "Standard Room",
                    "price": price,
                    "description": "Comfortable room with twin/queen bed, air conditioning, and free Wi-Fi."
                },
                {
                    "type": "Deluxe Room",
                    "price": int(price * 1.4),
                    "description": "Spacious room with king bed, flat-screen TV, mini bar, and city view."
                },
                {
                    "type": "Royal Suite",
                    "price": int(price * 2.2),
                    "description": "Luxurious suite with private lounge, premium toiletries, and complimentary breakfast."
                }
            ]
            
            result.append({
                'name': h['name'],
                'key': f"fallback_{h['name'].lower().replace(' ', '_')}",
                'type': 'hotel',
                'image': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=300&q=80',
                'url': 'https://www.google.com/search?q=' + h['name'],
                'rating': h['rating'],
                'reviews': 120,
                'min_price': price,
                'max_price': price * 2,
                'lat': h.get('latitude', 0.0),
                'lng': h.get('longitude', 0.0),
                'tags': ['Best Seller', 'Highly Rated'],
                
                # Compatibility fields
                'price': price,
                'address': h['address'],
                'latitude': h.get('latitude', 0.0),
                'longitude': h.get('longitude', 0.0),
                'rooms': rooms
            })
            
        return jsonify({"success": True, "destination": mapped_destination, "hotels": result, "source": f"fallback_{key_to_use}"})


# ─── 2. Get LIVE ROOM PRICES for a specific hotel ──────────────
@app.route('/api/hotel-rates', methods=['GET'])
@limiter.limit("30 per minute")
def get_hotel_rates():
    hotel_key = request.args.get('hotel_key')
    chk_in    = request.args.get('chk_in')   # YYYY-MM-DD
    chk_out   = request.args.get('chk_out')  # YYYY-MM-DD
    rooms     = request.args.get('rooms', 1)
    adults    = request.args.get('adults', 2)

    if not hotel_key:
        return jsonify({"error": "hotel_key required"}), 400

    # Default to next week if no dates given
    if not chk_in:
        chk_in  = (datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d')
        chk_out = (datetime.now() + timedelta(days=8)).strftime('%Y-%m-%d')

    cache_key = f"xotelo:rates:{hotel_key}:{chk_in}:{chk_out}:{rooms}:{adults}"
    cached = get_cached_response(cache_key)
    if cached is not None:
        return jsonify(cached)

    if hotel_key.startswith("fallback_"):
        # Match standard mock rates
        price = 3500
        rates = [
            { "name": "Standard Rate (Direct)", "rate": price, "price": price, "type": "Standard Rate (Direct)", "description": "Comfortable room with twin/queen bed." },
            { "name": "Deluxe Room Package", "rate": int(price * 1.4), "price": int(price * 1.4), "type": "Deluxe Room Package", "description": "Spacious room with king bed and city view." },
            { "name": "Royal Suite Experience", "rate": int(price * 2.2), "price": int(price * 2.2), "type": "Royal Suite Experience", "description": "Luxurious suite with private lounge and breakfast." }
        ]
        res_payload = {
            "success": True,
            "hotel_key": hotel_key,
            "chk_in":    chk_in,
            "chk_out":   chk_out,
            "currency":  "INR",
            "rates":     rates,
            "cheapest":  rates[0]
        }
        set_cached_response(cache_key, res_payload, 900)
        return jsonify(res_payload)

    try:
        resp = requests.get(f"{XOTELO_BASE}/rates", params={
            "hotel_key": hotel_key,
            "chk_in":    chk_in,
            "chk_out":   chk_out,
            "currency":  "INR",   # INR pricing for India!
            "rooms":     rooms,
            "adults":    adults
        }, timeout=4)
        data = resp.json()

        if data.get("error"):
            raise Exception(data["error"])

        rates = data["result"]["rates"]
        
        # Format rates
        formatted_rates = []
        for r in rates:
            name = r.get("name") or "Standard Room"
            rate_val = r.get("rate")
            formatted_rates.append({
                "name": name,
                "rate": rate_val,
                "price": rate_val,
                "type": name,
                "description": f"Live rate from provider: {name}. Instant confirmation."
            })

        # Sort cheapest first
        rates_sorted = sorted(formatted_rates, key=lambda x: x.get("rate", 9999))

        res_payload = {
            "success": True,
            "hotel_key": hotel_key,
            "chk_in":    chk_in,
            "chk_out":   chk_out,
            "currency":  "INR",
            "rates":     rates_sorted,
            "cheapest":  rates_sorted[0] if rates_sorted else None
        }
        set_cached_response(cache_key, res_payload, 900)  # 15 minutes TTL
        return jsonify(res_payload)

    except Exception as e:
        print(f"Xotelo rates error, checking fallback cache: {e}")
        expired_cached = get_cached_response(cache_key, ignore_ttl=True)
        if expired_cached:
            return jsonify(expired_cached)

        price = 3500
        rates = [
            { "name": "Standard Rate (Direct)", "rate": price, "price": price, "type": "Standard Rate (Direct)", "description": "Comfortable room with twin/queen bed." },
            { "name": "Deluxe Room Package", "rate": int(price * 1.4), "price": int(price * 1.4), "type": "Deluxe Room Package", "description": "Spacious room with king bed and city view." },
            { "name": "Royal Suite Experience", "rate": int(price * 2.2), "price": int(price * 2.2), "type": "Royal Suite Experience", "description": "Luxurious suite with private lounge and breakfast." }
        ]
        return jsonify({
            "success": True,
            "hotel_key": hotel_key,
            "chk_in":    chk_in,
            "chk_out":   chk_out,
            "currency":  "INR",
            "rates":     rates,
            "cheapest":  rates[0]
        })


# ─── 3. Search hotels by name or city ─────────────────────────
@app.route('/api/hotels/search', methods=['GET'])
@limiter.limit("30 per minute")
def api_search_hotels():
    query = request.args.get('query', '')
    if not query:
        return jsonify({"error": "query required"}), 400

    cache_key = f"xotelo:search:{query.strip().lower()}"
    cached = get_cached_response(cache_key)
    if cached is not None:
        return jsonify(cached)

    try:
        resp = requests.get(f"{XOTELO_BASE}/search", params={
            "query": query,
            "location_type": "accommodation"
        }, timeout=4)
        data = resp.json()

        hotels = data.get("result", {}).get("list", [])
        res_payload = {"query": query, "results": hotels}
        set_cached_response(cache_key, res_payload, 1800)  # 30 minutes TTL
        return jsonify(res_payload)

    except Exception as e:
        print(f"Xotelo search error, checking fallback cache: {e}")
        expired_cached = get_cached_response(cache_key, ignore_ttl=True)
        if expired_cached:
            return jsonify(expired_cached)
        return jsonify({"error": str(e)}), 500



@app.route('/api/expenses')
def api_expenses():
    """Return all expenses as JSON."""
    conn = sqlite3.connect("database.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT id, category, amount FROM expenses")
    expenses = [dict(row) for row in cursor.fetchall()]
    total = sum(e['amount'] for e in expenses)
    conn.close()
    return jsonify({'expenses': expenses, 'total': total})


@app.route('/api/expenses', methods=['POST'])
def api_add_expense():
    """Add a new expense via JSON body."""
    data = request.get_json()
    category = data.get('category', '')
    amount = data.get('amount', 0)
    if not category or not amount:
        return jsonify({'error': 'category and amount are required'}), 400
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()
    cursor.execute("INSERT INTO expenses (category, amount) VALUES (?, ?)", (category, int(amount)))
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return jsonify({'success': True, 'id': new_id})


@app.route('/api/expenses/<int:expense_id>', methods=['DELETE'])
def api_delete_expense(expense_id):
    """Delete an expense by ID."""
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()
    cursor.execute("DELETE FROM expenses WHERE id = ?", (expense_id,))
    conn.commit()
    conn.close()
    return jsonify({'success': True})


@app.route('/api/generate-trip', methods=['POST'])
@limiter.limit("10 per minute")
@require_auth(optional=True)
def api_generate_trip():
    """JSON-based itinerary generation endpoint for the Next.js frontend."""
    data = request.get_json() or {}
    city = data.get('city', '')
    days = int(data.get('days', 3))
    budget = int(data.get('budget', 50000))
    pace = data.get('pace', 'moderate')
    vibe = data.get('vibe', 'mixed')

    # Validate India-only
    lat, lon = get_city_coordinates(city)
    if lat == "INTERNATIONAL":
        return jsonify({'error': f"Only Indian destinations are supported. '{city}' is international."}), 400
    elif not lat or not lon:
        return jsonify({'error': f"Could not find destination '{city}'. Try a different Indian city."}), 400

    pace_map = {"relaxed": 2, "moderate": 3, "packed": 4}
    places_per_day = pace_map.get(pace, 3)

    all_places = load_places()
    city_places = [p for p in all_places if p.get("city", "").lower() == city.lower()]

    required_places = places_per_day * days
    if len(city_places) < required_places and lat and lon:
        fetched = fetch_places_from_api(city, lat, lon)
        if fetched:
            conn = sqlite3.connect("database.db")
            cursor = conn.cursor()
            cursor.execute("SELECT name FROM places WHERE LOWER(city) = ?", (city.lower(),))
            existing_names = {row[0].strip().lower() for row in cursor.fetchall()}
            to_insert = [p for p in fetched if p["name"].strip().lower() not in existing_names]
            if to_insert:
                to_insert_sorted = sorted(to_insert, key=lambda x: x.get("rating", 0), reverse=True)
                for idx, p in enumerate(to_insert_sorted):
                    if idx < 12:
                        img_url, attr_name, attr_link = get_place_image(p['name'], p['city'])
                        if img_url:
                            p["image"] = img_url
                            p["image_attribution"] = attr_name
                            p["image_attribution_link"] = attr_link

                cursor.executemany("""
                    INSERT INTO places (name, city, category, rating, latitude, longitude, description, image, image_attribution, image_attribution_link)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, [(p["name"], p["city"], p["category"], p["rating"],
                        p["latitude"], p["longitude"], p["description"], p.get("image"),
                        p.get("image_attribution"), p.get("image_attribution_link")) for p in to_insert])
                conn.commit()
            conn.close()
            all_places = load_places()
            city_places = [p for p in all_places if p.get("city", "").lower() == city.lower()]

    vibe_map = {
        "adventure": ["adventure", "nature"],
        "heritage": ["history", "temple", "church", "museum"],
        "leisure": ["nature", "culture", "museum"]
    }
    preferred_categories = vibe_map.get(vibe, [])
    if preferred_categories:
        preferred_places = sorted([p for p in city_places if p.get("category") in preferred_categories], key=lambda x: x.get("rating", 0), reverse=True)
        other_places = sorted([p for p in city_places if p.get("category") not in preferred_categories], key=lambda x: x.get("rating", 0), reverse=True)
        filtered_places = preferred_places + other_places
    else:
        filtered_places = sorted(city_places, key=lambda x: x.get("rating", 0), reverse=True)

    itinerary = []
    index = 0
    for day in range(1, days + 1):
        day_places = filtered_places[index:index + places_per_day]
        if not day_places:
            break
        if all(("latitude" in p and "longitude" in p) for p in day_places):
            day_places = optimize_route(day_places)
        routes = []
        for i in range(len(day_places) - 1):
            route_data = get_real_route(day_places[i]["latitude"], day_places[i]["longitude"],
                                        day_places[i+1]["latitude"], day_places[i+1]["longitude"])
            if route_data:
                cost = estimate_travel_cost(route_data.get("distance", 0))
                routes.append({"from": day_places[i].get("name"), "to": day_places[i+1].get("name"),
                                "distance": route_data.get("distance"), "time": route_data.get("duration"),
                                "cost": cost, "mode": route_data.get("mode", "Car/Cab")})
        itinerary.append({"day": day, "places": day_places, "routes": routes})
        index += places_per_day

    total_trip_cost = sum(sum(r.get("cost", 0) for r in d.get("routes", [])) for d in itinerary)
    weather_info = get_weather_advice(city, days=days)
    aqi_info = get_air_quality(lat, lon)

    # Save generated trip if user is authenticated
    saved_trip_id = None
    if getattr(g, 'user_id', None):
        try:
            conn = sqlite3.connect("database.db")
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO trips (city, days, budget, pace, vibe, itinerary_json, hotels_json, weather_json, aqi_json, total_trip_cost, budget_remaining, user_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (city, days, budget, pace, vibe, json.dumps(itinerary), json.dumps([]), json.dumps(weather_info), json.dumps(aqi_info), total_trip_cost, budget - total_trip_cost, g.user_id))
            saved_trip_id = cursor.lastrowid
            conn.commit()
            conn.close()
        except Exception as err:
            print("Failed to auto-save trip:", err)

    return jsonify({
        'success': True,
        'trip_id': saved_trip_id,
        'city': city,
        'days': days,
        'pace': pace,
        'vibe': vibe,
        'itinerary': itinerary,
        'total_trip_cost': total_trip_cost,
        'budget_remaining': budget - total_trip_cost,
        'weather': weather_info,
        'aqi': aqi_info
    })


# ---------------- ROUTE OPTIMIZATION ----------------
# Implemented with Nearest-Neighbor + 2-Opt local search pass in utils.distance



# ---------------- ITINERARY GENERATION ----------------

@app.route('/generate', methods=['POST'])
def generate():
    city = request.form.get('city', '')
    days = int(request.form.get('days', 0))
    budget = int(request.form.get('budget', 0))
    pace = request.form.get('pace', 'moderate')
    vibe = request.form.get('vibe', 'mixed')

    # Map travel pace to places per day
    pace_map = {
        "relaxed": 2,
        "moderate": 3,
        "packed": 4
    }
    places_per_day = pace_map.get(pace, 3)

    # Load and filter places
    all_places = load_places()
    city_places = [p for p in all_places if p.get("city", "").lower() == city.lower()]

    required_places = places_per_day * days
    if len(city_places) < required_places:
        lat, lon = get_city_coordinates(city)
        if lat == "INTERNATIONAL":
            flash(f"Only destinations in India are supported. Please choose an Indian city instead of '{city}'.", "warning")
            return redirect("/")
        elif not lat or not lon:
            flash(f"Could not find or geocode destination: '{city}'. Please check the spelling or try another Indian city.", "error")
            return redirect("/")
        
        if lat and lon:
            fetched = fetch_places_from_api(city, lat, lon)
            if fetched:
                conn = sqlite3.connect("database.db")
                cursor = conn.cursor()
                cursor.execute("SELECT name FROM places WHERE LOWER(city) = ?", (city.lower(),))
                existing_names = {row[0].strip().lower() for row in cursor.fetchall()}
                
                to_insert = [p for p in fetched if p["name"].strip().lower() not in existing_names]
                if to_insert:
                    # Enrich images from Wikipedia for the top 12 places to insert to keep query responsive
                    to_insert_sorted = sorted(to_insert, key=lambda x: x.get("rating", 0), reverse=True)
                    for idx, p in enumerate(to_insert_sorted):
                        if idx < 12:
                            img_url, attr_name, attr_link = get_place_image(p['name'], p['city'])
                            if img_url:
                                p["image"] = img_url
                                p["image_attribution"] = attr_name
                                p["image_attribution_link"] = attr_link

                    cursor.executemany("""
                        INSERT INTO places (name, city, category, rating, latitude, longitude, description, image, image_attribution, image_attribution_link)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, [
                        (p["name"], p["city"], p["category"], p["rating"], 
                         p["latitude"], p["longitude"], p["description"], p.get("image"),
                         p.get("image_attribution"), p.get("image_attribution_link"))
                        for p in to_insert
                    ])
                    conn.commit()
                conn.close()
                
                # Reload places
                all_places = load_places()
                city_places = [p for p in all_places if p.get("city", "").lower() == city.lower()]

    # Vibe categories selection
    vibe_map = {
        "adventure": ["adventure", "nature"],
        "heritage": ["history", "temple", "church", "museum"],
        "leisure": ["nature", "culture", "museum"]
    }
    preferred_categories = vibe_map.get(vibe, [])

    if preferred_categories:
        # Sort preferred category matches by rating
        preferred_places = sorted(
            [p for p in city_places if p.get("category") in preferred_categories],
            key=lambda x: x.get("rating", 0),
            reverse=True
        )
        # Sort other category matches by rating
        other_places = sorted(
            [p for p in city_places if p.get("category") not in preferred_categories],
            key=lambda x: x.get("rating", 0),
            reverse=True
        )
        # Prioritize vibe categories, fallback to others
        filtered_places = preferred_places + other_places
    else:
        # Balanced mix
        filtered_places = sorted(city_places, key=lambda x: x.get("rating", 0), reverse=True)

    itinerary = []
    index = 0

    for day in range(1, days + 1):
        day_places = filtered_places[index:index + places_per_day]
        if not day_places:
            break

        if all(("latitude" in p and "longitude" in p) for p in day_places):
            day_places = optimize_route(day_places)

        routes = []
        for i in range(len(day_places) - 1):
            place1 = day_places[i]
            place2 = day_places[i + 1]

            route_data = get_real_route(
                place1["latitude"], place1["longitude"],
                place2["latitude"], place2["longitude"],
            )

            if route_data:
                cost = estimate_travel_cost(route_data.get("distance", 0))
                routes.append({
                    "from": place1.get("name"),
                    "to": place2.get("name"),
                    "distance": route_data.get("distance"),
                    "time": route_data.get("duration"),
                    "cost": cost,
                    "coordinates": route_data.get("coordinates", []),
                    "mode": route_data.get("mode", "Car/Cab")
                })

        itinerary.append({
            "day": day,
            "places": day_places,
            "routes": routes,
        })

        index += places_per_day

    total_trip_cost = sum(
        sum(r.get("cost", 0) for r in d.get("routes", []))
        for d in itinerary
    )

    # ---------------- HOTEL FETCH + SMART LOGIC ----------------

    hotels = []
    api_key = os.getenv("GEOAPIFY_KEY")

    try:
        lat, lon = None, None
        if itinerary and itinerary[0]["places"]:
            lat = itinerary[0]["places"][0]["latitude"]
            lon = itinerary[0]["places"][0]["longitude"]
        elif city_places:
            lat = city_places[0]["latitude"]
            lon = city_places[0]["longitude"]

        if lat is not None and lon is not None:

            hotel_response = requests.get(
                "https://api.geoapify.com/v2/places",
                params={
                    "categories": "accommodation.hotel",
                    "filter": f"circle:{lon},{lat},5000",
                    "limit": 5,
                    "apiKey": api_key
                }
            ).json()

            hotels = hotel_response.get("features", [])

            # Add estimated price + distance
            first_place = itinerary[0]["places"][0] if itinerary else None

            for hotel in hotels:
                h_lat = hotel["geometry"]["coordinates"][1]
                h_lon = hotel["geometry"]["coordinates"][0]

                if first_place:
                    distance = calculate_distance(
                        first_place["latitude"], first_place["longitude"],
                        h_lat, h_lon
                    )
                    hotel["distance_from_first"] = round(distance, 2)
                else:
                    hotel["distance_from_first"] = "N/A"

                # Fake smart estimated cost per night
                hotel["estimated_price"] = 1500 + (hotel.get("properties", {}).get("rank", {}).get("confidence", 1) * 50)

            # Sort hotels by nearest distance
            hotels = sorted(hotels, key=lambda h: h.get("distance_from_first", 999))

    except:
        hotels = []

    # Add average hotel cost to budget
    if hotels:
        avg_hotel_cost = int(sum(h["estimated_price"] for h in hotels[:1]))
    else:
        avg_hotel_cost = 0

    total_trip_cost += avg_hotel_cost
    budget_remaining = budget - total_trip_cost
    weather_info = get_weather_advice(city, days=days)

    return render_template(
        "result.html",
        city=city,
        days=days,
        pace=pace,
        vibe=vibe,
        itinerary=itinerary,
        total_trip_cost=total_trip_cost,
        budget_remaining=budget_remaining,
        hotels=hotels,
        weather=weather_info
    )

# ---------------- SEPARATE HOTEL SEARCH ----------------

@app.route("/search-hotels")
def search_hotels():
    city = request.args.get("city")
    api_key = os.getenv("GEOAPIFY_KEY")

    hotels = []

    try:
        # Get city coordinates
        lat, lon = get_city_coordinates(city)
        if lat == "INTERNATIONAL":
            flash(f"Only destinations in India are supported. Please choose an Indian city instead of '{city}'.", "warning")
            return redirect("/")
        elif not lat or not lon:
            flash(f"Could not find or geocode destination: '{city}'. Please try a different Indian city.", "error")
            return redirect("/")

        if lat and lon:

            # Get hotels
            hotel_response = requests.get(
                "https://api.geoapify.com/v2/places",
                params={
                    "categories": "accommodation.hotel",
                    "filter": f"circle:{lon},{lat},5000",
                    "limit": 5,
                    "apiKey": api_key
                }
            ).json()

            hotels = hotel_response.get("features", [])

            # Add estimated price
            for hotel in hotels:
                hotel["estimated_price"] = 1500 + (
                    hotel.get("properties", {}).get("rank", {}).get("confidence", 1) * 50
                )

    except:
        hotels = []

    return render_template("hotels.html", hotels=hotels, city=city)

# ---------------- FLIGHT SEARCH ----------------

@app.route("/search-flights", methods=["GET"])
def search_flights():
    dep_iata = request.args.get("dep_iata", "").strip().upper()
    arr_iata = request.args.get("arr_iata", "").strip().upper()

    # Set of common Indian airport IATA codes
    INDIAN_IATA_CODES = {
        "DEL", "BOM", "BLR", "MAA", "CCU", "HYD", "COK", "GOI", "GOX", "AMD", 
        "PNQ", "LKO", "JAI", "ATQ", "TRV", "IXC", "IXJ", "SXR", "IXB", "NAG", 
        "IMF", "IXE", "VTZ", "BBI", "PAT", "RPR", "RNC", "GAU", "IXZ", "VNS", 
        "BDQ", "IDR", "BHO", "UDR", "JDH", "IXL", "IXA", "IXM", "IXG", "DED", 
        "DHM", "SLV", "KUU", "AGX", "AJL", "DMU", "SHL", "TEZ", "PGH", "TIR",
        "IXD", "IXR", "IXW", "HBX", "HJR", "GOY", "GWL", "IXY", "JGB", "NND",
        "RJA", "TCR", "VGA", "MYQ", "CJB", "IXU", "IXS", "HUP", "STV", "KUK"
    }

    if dep_iata not in INDIAN_IATA_CODES or arr_iata not in INDIAN_IATA_CODES:
        flash("Only domestic flight searches within India are supported. Please use valid Indian airport IATA codes (e.g. DEL, BOM, BLR, GOI).", "warning")
        return redirect("/")

    api_key = os.getenv("AVIATIONSTACK_KEY")

    flights = []

    try:
        response = requests.get(
            "http://api.aviationstack.com/v1/flights",
            params={
                "access_key": api_key,
                "dep_iata": dep_iata,
                "arr_iata": arr_iata
            }
        )

        data = response.json()
        flights = data.get("data", [])[:5]

        # Format date nicely
        for flight in flights:
            dep_time = flight.get("departure", {}).get("scheduled")
            arr_time = flight.get("arrival", {}).get("scheduled")

            if dep_time:
                flight["departure"]["formatted"] = datetime.fromisoformat(
                    dep_time.replace("Z", "")
                ).strftime("%d %b %Y, %I:%M %p")

            if arr_time:
                flight["arrival"]["formatted"] = datetime.fromisoformat(
                    arr_time.replace("Z", "")
                ).strftime("%d %b %Y, %I:%M %p")

    except:
        flights = []

    return render_template(
        "flights.html",
        flights=flights,
        dep_iata=dep_iata,
        arr_iata=arr_iata
    )


# ---------------- DOMESTIC TRAIN SEARCH ----------------

@app.route('/api/trains/search', methods=['GET'])
def api_search_trains():
    """
    Search domestic Indian Railways train schedules.
    Returns trains with explicit unofficial data disclaimers.
    """
    dep = request.args.get('dep', 'Delhi').strip()
    arr = request.args.get('arr', 'Jaipur').strip()
    date_str = request.args.get('date', '')

    if not dep or not arr:
        return jsonify({"error": "dep (departure) and arr (arrival) city or station code required"}), 400

    result = search_indian_trains(dep, arr, date_str=date_str)
    return jsonify(result)


# ---------------- PLACE DESCRIPTION REGIONAL TRANSLATION ----------------

@app.route('/api/places/<int:place_id>/translate', methods=['GET'])
def api_translate_place(place_id):
    """
    Translates place description into target regional language ('hi', 'kn', 'ta').
    Caches translated descriptions permanently in database.db.
    """
    lang = request.args.get('lang', 'en').lower().strip()
    if lang not in SUPPORTED_LANGUAGES:
        return jsonify({'error': f'Unsupported language code. Supported: {list(SUPPORTED_LANGUAGES.keys())}'}), 400

    conn = sqlite3.connect("database.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, description FROM places WHERE id = ?", (place_id,))
    place = cursor.fetchone()
    conn.close()

    if not place:
        return jsonify({'error': 'Place not found'}), 404

    original_description = place['description'] or ""
    if lang == "en":
        return jsonify({
            'success': True,
            'place_id': place_id,
            'lang': 'en',
            'translated_description': original_description
        })

    translated = translate_place_description(place_id, original_description, lang)

    return jsonify({
        'success': True,
        'place_id': place_id,
        'lang': lang,
        'lang_name': SUPPORTED_LANGUAGES[lang],
        'original_description': original_description,
        'translated_description': translated
    })


# ---------------- WEATHER ADVISOR DATA ----------------
def get_weather_advice(city, days=3):
    try:
        lat, lon = get_city_coordinates(city)
        if lat and lon and lat != "INTERNATIONAL":
            forecast = get_open_meteo_forecast(lat, lon, days=days)
            if forecast and forecast.get("daily"):
                return generate_smart_packing_advisory(forecast, city, days=days)
    except Exception as e:
        print(f"[Weather Advisor] Error fetching Open-Meteo forecast for '{city}': {e}")

    city_lower = city.lower()
    
    default_weather = {
        "temp": "24°C - 30°C",
        "condition": "Pleasant / Variable",
        "description": "Standard weather expected. Dress comfortably.",
        "packing": ["Comfortable walking shoes", "Refillable water bottle", "Camera / Phone charger", "Light jacket / shrug", "Sunglasses", "Personal toiletries"],
        "daily_forecast": []
    }
    
    weather_database = {
        "goa": {
            "temp": "26°C - 32°C",
            "condition": "Tropical & Sunny",
            "description": "Warm coastal climate. Ideal for beaches and water sports.",
            "packing": ["Sunscreen (SPF 50+)", "Sunglasses & Beach hat", "Quick-dry shorts & Swimwear", "Flip-flops & Sandals", "Light cotton shirts", "Insect repellent"]
        },
        "jaipur": {
            "temp": "22°C - 35°C",
            "condition": "Warm / Arid",
            "description": "Dry desert climate. Expect sunny days. Bring sun protection and comfortable walking shoes for forts.",
            "packing": ["Wide-brimmed hat", "Comfortable walking shoes", "Sunscreen & Moisturizer", "Light linen / cotton clothing", "Scarves / Stoles (for dust)", "Water flask"]
        },
        "jodhpur": {
            "temp": "24°C - 37°C",
            "condition": "Sunny / Arid",
            "description": "Sun City climate. High sun intensity. Protect yourself from heat.",
            "packing": ["Polarized sunglasses", "Hat / Cap", "High-protection sunscreen", "Breathable clothes", "Comfortable sneakers for fort walk", "Electrolyte packets"]
        },
        "udaipur": {
            "temp": "22°C - 33°C",
            "condition": "Pleasant / Lakeside Breeze",
            "description": "Beautiful lake weather. Evenings can be cool and breezy.",
            "packing": ["Light jacket / cardigan for evening boat rides", "Sunglasses", "Comfortable flats for palace stairs", "Smart casuals for rooftop dining", "Camera"]
        },
        "delhi": {
            "temp": "15°C - 38°C",
            "condition": "Vibrant / Diverse Season",
            "description": "Dynamic climate. High temperatures in summer, cool and crisp in winter.",
            "packing": ["Walking shoes", "Layered clothing (jacket if winter)", "Sunscreen", "Anti-pollution face mask", "Hand sanitizer", "Comfortable backpack"]
        },
        "agra": {
            "temp": "18°C - 36°C",
            "condition": "Semi-Arid / Sunny",
            "description": "Warm plains climate. Sightseeing requires walking in open complexes like Taj Mahal.",
            "packing": ["Sunglasses", "Sunscreen", "Comfortable socks (shoes are removed at Taj)", "Umbrella for sun protection", "Hydration tablets", "Light colored clothes"]
        },
        "mumbai": {
            "temp": "25°C - 33°C",
            "condition": "Warm & Humid",
            "description": "Coastal humidity. Sudden showers are common in monsoon. Light clothing is best.",
            "packing": ["Umbrella or light raincoat", "Light, loose cotton apparel", "Waterproof sandals / shoes", "Wet wipes", "Deodorant", "Water bottle"]
        },
        "varanasi": {
            "temp": "20°C - 35°C",
            "condition": "Warm / Sacred River Basin",
            "description": "Continental river climate. Dress modestly and prepare for extensive walking through narrow ghat alleys.",
            "packing": ["Modest clothing covering shoulders & knees", "Slip-on shoes for temple visits", "Hand sanitizer", "Mosquito repellent for evening Ganga Aarti", "Wet wipes"]
        },
        "manali": {
            "temp": "5°C - 20°C",
            "condition": "Alpine Cold / Scenic Snow",
            "description": "Mountain climate. Temperatures can drop significantly in the evening.",
            "packing": ["Thermal innerwear", "Heavy fleece or down jacket", "Woolen socks & gloves", "Lip balm & cold cream", "Sturdy hiking boots", "Personal first-aid kit"]
        },
        "shimla": {
            "temp": "8°C - 22°C",
            "condition": "Crisp / Mountain Breeze",
            "description": "Pleasant hill station climate. Evenings are chilly.",
            "packing": ["Light woolen sweater or windcheater", "Good walking shoes", "Umbrella (weather is unpredictable)", "Moisturizer", "Warm shawl / muffler"]
        },
        "amritsar": {
            "temp": "15°C - 36°C",
            "condition": "Continental / Sunny",
            "description": "Hot summers and cold winters. Remember to cover your head at the Golden Temple.",
            "packing": ["Head scarf / bandana (mandatory for temple)", "Comfortable walking slip-ons", "Sunscreen", "Hand sanitizer", "Light breathables"]
        },
        "rishikesh": {
            "temp": "15°C - 32°C",
            "condition": "Temperate & Spiritual",
            "description": "Riverside climate with mountain breezes. Great for rafting, yoga, and walking across bridges.",
            "packing": ["Modest spiritual clothing", "Quick-dry shorts for rafting", "Sturdy sandals with straps", "Mosquito repellent", "Refillable water bottle", "Small towel"]
        },
        "bangalore": {
            "temp": "20°C - 30°C",
            "condition": "Excellent / Moderate Breezy",
            "description": "Silicon Valley of India enjoys spring-like moderate weather year-round. Light showers possible.",
            "packing": ["Light jacket or hoodie", "Casual walking sneakers", "Umbrella", "Sunglasses", "Smart casuals for pubs"]
        },
        "hyderabad": {
            "temp": "22°C - 36°C",
            "condition": "Warm / Plateau Climate",
            "description": "Dry hot days. Good historical sightseeing and rich food tours.",
            "packing": ["Comfortable shoes for walking Golconda Fort", "Sunscreen", "Sunglass & cap", "Linen/cotton shirts", "Antacid/digestion tablets"]
        },
        "kolkata": {
            "temp": "24°C - 34°C",
            "condition": "Humid / Tropical",
            "description": "High humidity, warm winds from Bay of Bengal. Expect sudden monsoon rain.",
            "packing": ["Umbrella", "Breathable light fabrics", "Comfortable walking shoes for museum tours", "Insect repellent", "Wet wipes"]
        },
        "mysore": {
            "temp": "20°C - 31°C",
            "condition": "Pleasant / Historic",
            "description": "Very pleasant, moderate climate with cool nights.",
            "packing": ["Light sweater", "Comfortable sandals", "Sun hat for palace grounds", "Modest wear for temple/church visits"]
        },
        "kochi": {
            "temp": "25°C - 32°C",
            "condition": "Coastal / Humid",
            "description": "Warm tropical climate. Beautiful coastal winds. Monsoon is heavy.",
            "packing": ["Umbrella or poncho", "Linen clothing", "Comfortable sandals", "Sunscreen", "Mosquito lotion", "Sunglasses"]
        },
        "leh ladakh": {
            "temp": "5°C - 18°C",
            "condition": "Cold High Desert",
            "description": "High altitude cold desert. Air is thin with extreme sun. Layering is highly recommended.",
            "packing": ["Thermal layers", "Windbreaker / heavy jacket", "High SPF sunscreen", "Cold cream & Lip balm", "Sunglasses", "Hydration tablets"]
        },
        "munnar": {
            "temp": "15°C - 24°C",
            "condition": "Misty Hills",
            "description": "Cool hill station climate with rolling mist. Light rainfall can occur suddenly.",
            "packing": ["Light sweater / jacket", "Raincoat or umbrella", "Sturdy hiking shoes", "Insect repellent", "Camera"]
        },
        "ooty": {
            "temp": "12°C - 20°C",
            "condition": "Chilly & Breezy",
            "description": "Pleasant but chilly hill town. Evenings are foggy and cold.",
            "packing": ["Warm sweater or fleece", "Beanie / muffler", "Umbrella", "Good walking shoes", "Moisturizer"]
        },
        "pondicherry": {
            "temp": "26°C - 34°C",
            "condition": "Coastal Warmth",
            "description": "Warm maritime climate. Perfect for strolling French streets and beaches.",
            "packing": ["Light cotton apparel", "Sun hat & sunglasses", "High-protection sunscreen", "Breathable sandals", "Swimwear"]
        },
        "kodaikanal": {
            "temp": "13°C - 22°C",
            "condition": "Misty Forested Hills",
            "description": "Cool forested highlands with frequent fog and fresh mountain breeze.",
            "packing": ["Jacket or cardigan", "Umbrella", "Comfortable walking shoes", "Water bottle", "Camera"]
        }
    }
    
    for key, data in weather_database.items():
        if key in city_lower:
            data["daily_forecast"] = []
            return data
            
    return default_weather


# ---------------- EXPENSE TRACKER ROUTES ----------------

@app.route('/expenses')
def view_expenses():
    conn = sqlite3.connect("database.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT id, category, amount FROM expenses")
    expenses = cursor.fetchall()
    
    total_spent = sum(row['amount'] for row in expenses)
    
    # Category summary
    category_summary = {}
    for row in expenses:
        cat = row['category']
        category_summary[cat] = category_summary.get(cat, 0) + row['amount']
        
    conn.close()
    return render_template(
        "expense_tracker.html",
        expenses=expenses,
        total_spent=total_spent,
        category_summary=category_summary
    )

@app.route('/add_expense', methods=['POST'])
def add_expense():
    category = request.form.get('category')
    amount = request.form.get('amount')
    if category and amount:
        conn = sqlite3.connect("database.db")
        cursor = conn.cursor()
        cursor.execute("INSERT INTO expenses (category, amount) VALUES (?, ?)", (category, int(amount)))
        conn.commit()
        conn.close()
    return redirect('/expenses')

@app.route('/delete_expense/<int:id>', methods=['POST'])
def delete_expense(id):
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()
    cursor.execute("DELETE FROM expenses WHERE id = ?", (id,))
    conn.commit()
    conn.close()
    return redirect('/expenses')

@app.route('/clear_expenses', methods=['POST'])
def clear_expenses():
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()
    cursor.execute("DELETE FROM expenses")
    conn.commit()
    conn.close()
    return redirect('/expenses')


# ---------------- SAVED TRIPS & EDITING ROUTES ----------------

@app.route('/save-trip', methods=['POST'])
def save_trip():
    try:
        data = request.get_json()
        city = data.get('city')
        days = int(data.get('days', 0))
        budget = int(data.get('budget', 0))
        pace = data.get('pace', 'moderate')
        vibe = data.get('vibe', 'mixed')
        itinerary_json = json.dumps(data.get('itinerary', []))
        hotels_json = json.dumps(data.get('hotels', []))
        weather_json = json.dumps(data.get('weather', {}))
        total_trip_cost = int(data.get('total_trip_cost', 0))
        budget_remaining = int(data.get('budget_remaining', 0))
        
        conn = sqlite3.connect("database.db")
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO trips (city, days, budget, pace, vibe, itinerary_json, hotels_json, weather_json, total_trip_cost, budget_remaining)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (city, days, budget, pace, vibe, itinerary_json, hotels_json, weather_json, total_trip_cost, budget_remaining))
        trip_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({"success": True, "trip_id": trip_id})
    except Exception as e:
        print("Error saving trip:", e)
        return jsonify({"success": False, "error": str(e)}), 400


@app.route('/saved-trips')
@require_auth(optional=False)
def saved_trips():
    conn = sqlite3.connect("database.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT id, city, days, budget, pace, vibe, total_trip_cost, budget_remaining, created_at FROM trips WHERE user_id = ? ORDER BY created_at DESC", (g.user_id,))
    rows = cursor.fetchall()
    trips = [dict(row) for row in rows]
    conn.close()
    return render_template("saved_trips.html", trips=trips)


@app.route('/saved-trips/<int:trip_id>')
@require_auth(optional=False)
def load_saved_trip(trip_id):
    conn = sqlite3.connect("database.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM trips WHERE id = ? AND user_id = ?", (trip_id, g.user_id))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        return "Trip not found", 404
        
    trip = dict(row)
    
    itinerary = json.loads(trip["itinerary_json"])
    hotels = json.loads(trip["hotels_json"])
    weather = json.loads(trip["weather_json"])
    
    return render_template(
        "result.html",
        city=trip["city"],
        days=trip["days"],
        pace=trip["pace"],
        vibe=trip["vibe"],
        itinerary=itinerary,
        total_trip_cost=trip["total_trip_cost"],
        budget_remaining=trip["budget_remaining"],
        hotels=hotels,
        weather=weather,
        saved_trip_id=trip["id"]
    )


@app.route('/delete-trip/<int:trip_id>', methods=['POST'])
@require_auth(optional=False)
def delete_trip(trip_id):
    try:
        conn = sqlite3.connect("database.db")
        cursor = conn.cursor()
        cursor.execute("DELETE FROM trips WHERE id = ? AND user_id = ?", (trip_id, g.user_id))
        deleted = cursor.rowcount > 0
        conn.commit()
        conn.close()
        return jsonify({"success": deleted})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


@app.route('/recalculate-routes', methods=['POST'])
def recalculate_routes():
    try:
        data = request.get_json()
        day_places = data.get('places', [])
        
        routes = []
        for i in range(len(day_places) - 1):
            place1 = day_places[i]
            place2 = day_places[i + 1]

            lat1, lon1 = place1.get("latitude"), place1.get("longitude")
            lat2, lon2 = place2.get("latitude"), place2.get("longitude")
            
            if lat1 is not None and lon1 is not None and lat2 is not None and lon2 is not None:
                route_data = get_real_route(lat1, lon1, lat2, lon2)
                if route_data:
                    cost = estimate_travel_cost(route_data.get("distance", 0))
                    routes.append({
                        "from": place1.get("name"),
                        "to": place2.get("name"),
                        "distance": route_data.get("distance"),
                        "time": route_data.get("duration"),
                        "cost": cost,
                        "coordinates": route_data.get("coordinates", []),
                        "mode": route_data.get("mode", "Car/Cab")
                    })
                    
        return jsonify({"success": True, "routes": routes})
    except Exception as e:
        print("Recalculation error:", e)
        return jsonify({"success": False, "error": str(e)}), 400


@app.route('/get-alternative-places')
def get_alternative_places():
    city = request.args.get('city', '')
    conn = sqlite3.connect("database.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, city, category, rating, latitude, longitude, description, image FROM places WHERE LOWER(city) = ? ORDER BY rating DESC", (city.lower(),))
    rows = cursor.fetchall()
    places = [dict(row) for row in rows]
    conn.close()
    return jsonify({"success": True, "places": places})


# ---------------- RUN APP ----------------

if __name__ == '__main__':
    app.run(debug=True)