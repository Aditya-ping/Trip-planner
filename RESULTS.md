# BIS605 Experiential Learning Project — Quantified Empirical Results

**Project Title**: AeroTravel — AI-Powered Indian Itinerary Planner & Booking System  
**Course Code**: BIS605 Experiential Learning  
**Measurement Date**: July 23, 2026  
**Environment**: Python 3.13.7 (Pytest 9.1.1), SQLite3, Next.js 16.2.7 (Turbopack)

---

## 1. Automated Test Suite Benchmark

The automated backend test suite was executed against all core system modules, including distance calculations, price engine formulas, external API wrappers, rate limiters, security parameters, and LLM refinement scope guardrails.

### Test Execution Summary
- **Total Test Cases**: 68 collected
- **Pass Rate**: 100% (68 passed, 0 failed, 0 errors)
- **Total Execution Time**: 3.77 seconds

### Test Breakdown by Module

| Module Name | Test File Path | Test Count | Status | Key Coverage |
| :--- | :--- | :---: | :---: | :--- |
| **Air Quality Index (AQI)** | `tests/test_aqi.py` | 7 | PASS | IQAir AirVisual API & Open-Meteo fallback parsing |
| **SQLite API Cache** | `tests/test_cache.py` | 2 | PASS | TTL expiration, JSON serialization, cache key hashing |
| **Checkout Price Engine** | `tests/test_checkout_pricing.py` | 20 | PASS | Base cost, regional guide rates, platform commission (8%), GST (5%), and Group Cost Splitter math |
| **TSP Distance & Routing** | `tests/test_distance.py` | 13 | PASS | Haversine distance, Nearest-Neighbor construction, 2-Opt local search |
| **Image Resolution Pipeline**| `tests/test_image.py` | 3 | PASS | Unsplash API, Wikipedia pageimage fallback, city defaults |
| **Notification Services** | `tests/test_notifications.py` | 3 | PASS | SendGrid email HTML template generation, Twilio SMS payloads, email masking |
| **Razorpay Payment Engine** | `tests/test_payment.py` | 2 | PASS | Order creation, HMAC-SHA256 signature verification |
| **Itinerary AI Refiner** | `tests/test_refiner.py` | 3 | PASS | Day-scoped JSON diff extraction, non-targeted day preservation, rule fallback |
| **Indian Railways API** | `tests/test_trains.py` | 3 | PASS | Station code resolution (e.g. NDLS, JP), train search parsing |
| **Regional Translator** | `tests/test_translator.py` | 3 | PASS | Regional translation ('hi', 'kn', 'ta'), database cache persistence |
| **Weather & Advisory** | `tests/test_weather.py` | 9 | PASS | Open-Meteo daily forecast, WMO code interpretation, high-altitude packing advice |

---

## 2. Travelling Salesperson Problem (TSP) Route Optimizer Performance

The itinerary engine uses a combined **Nearest-Neighbor (NN) construction heuristic** followed by a **2-Opt local search pass** (`utils/distance.py`) to minimize total transit distance between daily sightseeing stops. 

### Empirical Route Distance Measurements (8 Sightseeing Places per City)

| Destination | Unoptimized Raw Distance (km) | Nearest-Neighbor Route (km) | 2-Opt Optimized Route (km) | Total Distance Saved (km) | Overall Distance Reduction (%) | 2-Opt Gain over NN (%) | Sample Sightseeing Stops |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **Jaipur** (Rajasthan) | 38.69 | 30.21 | **24.69** | 14.00 | **36.19%** | **18.27%** | Hawa Mahal, Amber Fort, City Palace, Nahargarh Fort |
| **Delhi** (NCR) | 42.99 | 33.60 | **27.66** | 15.33 | **35.66%** | **17.68%** | India Gate, Red Fort, Qutub Minar, Lotus Temple |
| **Kochi** (Kerala) | 44.96 | 42.18 | **39.15** | 5.81 | **12.92%** | **7.18%** | Fort Kochi, Chinese Nets, Mattancherry, Jew Town |
| **Goa** (Coastal Circuit) | 206.52 | 101.47 | **98.82** | 107.70 | **52.15%** | **2.61%** | Baga Beach, Calangute, Dudhsagar Falls, Fort Aguada |

### Analytical Observations
1. **Overall Mean Distance Savings**: The combined NN + 2-Opt optimization achieves an average **34.23% reduction in total transit distance** compared to unoptimized stop ordering.
2. **Impact of Regional Geography**:
   - In geographically spread-out circuits like **Goa** (spanning North and South Goa across 200+ km), the initial Nearest-Neighbor pass achieves the bulk of optimization (**50.8% reduction**), preventing wasteful back-and-forth transit between distant hubs.
   - In dense urban circuits like **Jaipur** and **Delhi**, the 2-Opt local search refinement pass provides significant additional gains (**17.68% – 18.27% improvement** over Nearest-Neighbor alone) by eliminating overlapping route crossovers.
   - In coastal peninsula layouts like **Kochi**, spatial constraints limit maximum savings to **12.92%**.

---

## 3. Persistent API Cache Statistics (`api_cache` Table)

To eliminate redundant external API requests, optimize response latency, and protect against third-party rate limits, AeroTravel implements SQLite-backed response caching (`utils/cache.py`).

### Cache Database Summary
- **Database File**: `database.db`
- **Active Cached API Records**: 7 records stored

### Provider Breakdown & Expiration TTL Policies

| Provider Prefix | Resource Type | Active Cached Entries | Time-To-Live (TTL) Policy | Primary Purpose |
| :--- | :--- | :---: | :---: | :--- |
| `directions` | Geoapify / Google Directions | 1 | 30 Days (2,592,000s) | Driving distance & travel duration between coordinate pairs |
| `wiki` | Wikipedia OpenSearch | 2 | 7 Days (604,800s) | Place thumbnail image URLs and attributions |
| `aqi` | Open-Meteo Air Quality | 1 | 3 Hours (10,800s) | Real-time Air Quality Index (PM2.5 / PM10) |
| `trains` | Indian Railways RapidAPI | 2 | 2 Hours (7,200s) | Train schedules & fare ranges |
| `xotelo` | Xotelo Hotel Directory | 1 | 15–30 Mins (900–1,800s) | Dynamic hotel availability and live room rates |

---

## 4. Frontend Production Build Benchmark

- **Framework**: Next.js 16.2.7 (Turbopack)
- **TypeScript Compilation Time**: 7.4 seconds
- **Production Bundle Status**: 0 errors, 0 lint warnings
- **Static Page Generation**: Completed in 1,398 ms across 5 static routes (`/`, `/_not-found`, `/checkout`)
