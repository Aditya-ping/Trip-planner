"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Loader2, ArrowRight, RotateCcw, Calendar,
  CheckSquare, CloudSun, MapPin, AlertCircle, Wifi, CreditCard, ExternalLink,
  Trash2, Plus
} from "lucide-react";
import confetti from "canvas-confetti";
import dynamic from "next/dynamic";

const ItineraryMap = dynamic(() => import("./ItineraryMap"), { ssr: false });

const FLASK_API = "http://127.0.0.1:5000";

const cityEmojis: Record<string, string> = {
  "Agra": "🕌", "Amritsar": "🙏", "Bangalore": "🌆", "Delhi": "🏛️",
  "Gangtok": "🌄", "Goa": "🏖️", "Hyderabad": "🍖", "Jaipur": "🏰",
  "Jodhpur": "🔵", "Kochi": "⛵", "Kodaikanal": "🌫️", "Kolkata": "🌉",
  "Leh Ladakh": "🏔️", "Manali": "❄️", "Mumbai": "🌊", "Munnar": "🍃",
  "Mysore": "👑", "Ooty": "🚂", "Pondicherry": "🇫🇷", "Rishikesh": "🧘",
  "Shimla": "🏡", "Udaipur": "🏯", "Varanasi": "🪔",
};

const cityImages: Record<string, string> = {
  "Agra": "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1600&q=80",
  "Amritsar": "https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&w=1600&q=80",
  "Bangalore": "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1600&q=80",
  "Delhi": "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1600&q=80",
  "Gangtok": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80",
  "Goa": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1600&q=80",
  "Hyderabad": "https://images.unsplash.com/photo-1581888227599-779811939961?auto=format&fit=crop&w=1600&q=80",
  "Jaipur": "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1600&q=80",
  "Jodhpur": "https://images.unsplash.com/photo-1572888195250-3037a59d3578?auto=format&fit=crop&w=1600&q=80",
  "Kochi": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1600&q=80",
  "Kodaikanal": "https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?auto=format&fit=crop&w=1600&q=80",
  "Kolkata": "https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=1600&q=80",
  "Leh Ladakh": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1600&q=80",
  "Manali": "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1600&q=80",
  "Mumbai": "https://images.unsplash.com/photo-1562979314-bee7453e911c?auto=format&fit=crop&w=1600&q=80",
  "Munnar": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=80",
  "Mysore": "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=1600&q=80",
  "Ooty": "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1600&q=80",
  "Pondicherry": "https://images.unsplash.com/photo-1589519160732-57fc498494f8?auto=format&fit=crop&w=1600&q=80",
  "Rishikesh": "https://images.unsplash.com/photo-1605647540924-852290f6b0d5?auto=format&fit=crop&w=1600&q=80",
  "Shimla": "https://images.unsplash.com/photo-1597075687490-8f673c6c17f6?auto=format&fit=crop&w=1600&q=80",
  "Udaipur": "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1600&q=80",
  "Varanasi": "https://images.unsplash.com/photo-1564760055775-d63b17a55c44?auto=format&fit=crop&w=1600&q=80",
};

type GeneratedTrip = {
  city: string;
  days: number;
  pace: string;
  vibe: string;
  total_trip_cost: number;
  budget_remaining: number;
  weather: {
    temp: string;
    condition: string;
    description: string;
    packing: string[];
  };
  itinerary: {
    day: number;
    places: {
      name: string;
      category: string;
      rating: number;
      description: string;
      image: string;
      latitude?: number;
      longitude?: number;
    }[];
    routes: {
      from: string;
      to: string;
      distance: string;
      time: string;
      cost: number;
      mode: string;
    }[];
  }[];
};

interface PackageSnippet {
  id: number;
  title: string;
  price: string;
  duration: string;
  image: string;
  snippet: string;
}

const allPackages: PackageSnippet[] = [
  {
    id: 1,
    title: "Rajasthan Royal Heritage Circuit",
    price: "₹42,000",
    duration: "7 Days / 6 Nights",
    image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=300&q=80",
    snippet: "Heritage palaces & desert safaris."
  },
  {
    id: 2,
    title: "Kerala Backwaters & Hill Stations",
    price: "₹38,500",
    duration: "6 Days / 5 Nights",
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=300&q=80",
    snippet: "Houseboat cruises & tea estate walks."
  },
  {
    id: 3,
    title: "Leh Ladakh Himalayan Odyssey",
    price: "₹55,000",
    duration: "8 Days / 7 Nights",
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=300&q=80",
    snippet: "High-altitude lakes & jeep safaris."
  }
];

export default function AITripPlanner() {
  const router = useRouter();
  const [cities, setCities] = useState<string[]>([]);
  const [city, setCity] = useState("");
  const [budget, setBudget] = useState(25000);
  const [pace, setPace] = useState("moderate");
  const [vibe, setVibe] = useState("mixed");
  const [daysCount, setDaysCount] = useState(3);

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [result, setResult] = useState<GeneratedTrip | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiOnline, setApiOnline] = useState(true);
  
  // Custom places customizer state
  const [addingPlaceForDay, setAddingPlaceForDay] = useState<number | null>(null);
  const [newPlaceName, setNewPlaceName] = useState("");
  const [newPlaceDesc, setNewPlaceDesc] = useState("");
  const [newPlaceCategory, setNewPlaceCategory] = useState("Sightseeing");

  const handleRemovePlace = (dayIndex: number, placeIndex: number) => {
    if (!result) return;
    const newItinerary = [...result.itinerary];
    newItinerary[dayIndex].places = newItinerary[dayIndex].places.filter((_, idx) => idx !== placeIndex);
    setResult({
      ...result,
      itinerary: newItinerary
    });
  };

  const handleAddPlace = (dayIndex: number) => {
    if (!result || !newPlaceName.trim()) return;
    const newItinerary = [...result.itinerary];
    const newPlace = {
      name: newPlaceName,
      category: newPlaceCategory || "Sightseeing",
      rating: 4.8,
      description: newPlaceDesc || "Custom added place of interest.",
      image: "https://images.unsplash.com/photo-1596463059386-29186cd30063?auto=format&fit=crop&w=150&q=80"
    };
    newItinerary[dayIndex].places = [...newItinerary[dayIndex].places, newPlace];
    setResult({
      ...result,
      itinerary: newItinerary
    });
    setAddingPlaceForDay(null);
    setNewPlaceName("");
    setNewPlaceDesc("");
    setNewPlaceCategory("Sightseeing");
  };

  const loadingSteps = [
    "Searching destination database...",
    "Querying Geoapify for city coordinates...",
    "Fetching nearby attractions...",
    "Optimizing routes & travel times...",
    "Generating climate & packing advisory...",
  ];

  // Fetch all cities from the Flask API on mount
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await fetch(`${FLASK_API}/api/places`);
        const data = await res.json();
        const unique = [...new Set<string>((data.places || []).map((p: { city: string }) => p.city))].sort();
        setCities(unique);
        if (unique.length > 0) setCity(unique[0]);
        setApiOnline(true);
      } catch {
        // Fallback to known cities if API is offline
        const fallback = [
          "Agra","Amritsar","Bangalore","Delhi","Gangtok","Goa","Hyderabad",
          "Jaipur","Jodhpur","Kochi","Kodaikanal","Kolkata","Leh Ladakh",
          "Manali","Mumbai","Munnar","Mysore","Ooty","Pondicherry",
          "Rishikesh","Shimla","Udaipur","Varanasi"
        ];
        setCities(fallback);
        setCity(fallback[5]); // Goa default
        setApiOnline(false);
      }
    };
    fetchCities();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city) return;
    setLoading(true);
    setResult(null);
    setError(null);

    // Animate loading steps
    let step = 0;
    setLoadingStep(loadingSteps[0]);
    const interval = setInterval(() => {
      step++;
      if (step < loadingSteps.length) {
        setLoadingStep(loadingSteps[step]);
      }
    }, 900);

    try {
      const res = await fetch(`${FLASK_API}/api/generate-trip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city, days: daysCount, budget, pace, vibe }),
      });
      const data = await res.json();
      clearInterval(interval);
      setLoading(false);

      if (!res.ok || !data.success) {
        setError(data.error || "Failed to generate itinerary. Try a different city.");
        return;
      }

      setResult(data as GeneratedTrip);
      confetti({ particleCount: 130, spread: 80, origin: { y: 0.6 } });
    } catch {
      clearInterval(interval);
      setLoading(false);
      setError("Cannot reach the backend. Make sure Flask is running on port 5000.");
    }
  };

  const getMatchingPackage = (cityName: string) => {
    const c = cityName.toLowerCase();
    if (c.includes("jaipur") || c.includes("jodhpur") || c.includes("udaipur") || c.includes("rajasthan")) {
      return allPackages[0]; // Rajasthan
    }
    if (c.includes("kochi") || c.includes("alleppey") || c.includes("munnar") || c.includes("kerala")) {
      return allPackages[1]; // Kerala
    }
    if (c.includes("leh") || c.includes("ladakh") || c.includes("nubra") || c.includes("pangong")) {
      return allPackages[2]; // Leh Ladakh
    }
    return null;
  };

  const handleBookPackage = (pkgId: number) => {
    router.push(`/checkout?packageId=${pkgId}`);
  };

  const matchingPkg = result ? getMatchingPackage(result.city) : null;

  return (
    <section id="ai-planner" className="relative py-28 w-full min-h-[920px] flex items-center overflow-hidden bg-black/40 border-y border-border-color">
      
      {/* Dynamic Background Image cross-fading smoothly */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={city}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 0.18, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: `url(${cityImages[city] || "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1600&q=80"})` 
            }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-r from-bg-main via-bg-main/90 to-bg-main" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">

          {/* ── Left: Form ── */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <span className="text-xs font-bold text-accent-primary uppercase tracking-widest block mb-2">
              🚀 AI Magic Engine
            </span>
            <h2 className="font-heading font-black text-4xl md:text-6xl text-fg-main tracking-tight mb-5 leading-none">
              Instant India Itinerary Planner
            </h2>
            <p className="text-base text-text-muted mb-8 leading-relaxed">
              Pick any Indian city from our database, select your vibe, budget, and travel days. Watch the AI build a complete itinerary with transit routes, live costs, and weather advisories.
            </p>

            {/* API status pill */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-6 w-fit shadow-inner ${apiOnline ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-orange-50 text-orange-700 border border-orange-200"}`}>
              <Wifi className="w-3.5 h-3.5" />
              {apiOnline ? `Live DB — ${cities.length} cities loaded` : "Offline — showing cached cities"}
            </div>

            <form onSubmit={handleGenerate} className="p-10 rounded-3xl glassmorphism border border-border-color shadow-2xl flex flex-col gap-6 backdrop-blur-xl bg-card-bg/40">

              {/* City Dropdown — from DB */}
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2.5">
                  🇮🇳 Select Destination City
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-4 rounded-xl border border-border-color bg-bg-main text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-accent-primary cursor-pointer text-fg-main"
                >
                  {cities.map((c) => (
                    <option key={c} value={c}>
                      {cityEmojis[c] || "📍"} {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Budget slider */}
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2.5">
                  Trip Budget: <span className="text-accent-primary font-black text-sm">₹{budget.toLocaleString("en-IN")}</span>
                </label>
                <input
                  type="range"
                  min={5000} max={200000} step={1000}
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full accent-accent-primary cursor-pointer h-2 bg-fg-main/10 rounded-lg appearance-none"
                />
                <div className="flex justify-between text-[10px] text-text-muted mt-2 font-medium">
                  <span>₹5,000</span><span>₹1,00,000</span><span>₹2,00,000</span>
                </div>
              </div>

              {/* Pace + Days */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2.5">Travel Pace</label>
                  <select
                    value={pace}
                    onChange={(e) => setPace(e.target.value)}
                    className="w-full px-4 py-4 rounded-xl border border-border-color bg-bg-main text-sm font-semibold focus:outline-none text-fg-main"
                  >
                    <option value="relaxed">🧘 Relaxed (2/day)</option>
                    <option value="moderate">🚶 Moderate (3/day)</option>
                    <option value="packed">⚡ Packed (4/day)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2.5">Duration</label>
                  <select
                    value={daysCount}
                    onChange={(e) => setDaysCount(Number(e.target.value))}
                    className="w-full px-4 py-4 rounded-xl border border-border-color bg-bg-main text-sm font-semibold focus:outline-none text-fg-main"
                  >
                    {[2,3,4,5,6,7].map(d => (
                      <option key={d} value={d}>{d} Day{d > 1 ? "s" : ""}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Vibe */}
              <div>
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2.5">Trip Vibe</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "mixed",     label: "🎯 Mixed" },
                    { id: "adventure", label: "⛰️ Adventure" },
                    { id: "heritage",  label: "🕌 Heritage" },
                    { id: "leisure",   label: "✨ Leisure" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setVibe(item.id)}
                      className={`px-3 py-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        vibe === item.id
                          ? "bg-accent-primary border-accent-primary text-white shadow-md shadow-accent-primary/20"
                          : "border-border-color hover:bg-card-bg text-fg-main"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !city}
                className="flex items-center justify-center gap-2 w-full py-4.5 rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary hover:opacity-95 text-white font-black text-sm shadow-xl shadow-accent-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
                Generate {city ? `${city} Itinerary` : "Itinerary"}
              </button>
            </form>
          </div>

          {/* ── Right: Output ── */}
          <div className="lg:col-span-7 h-[700px] relative w-full flex items-center justify-center">
            <AnimatePresence mode="wait">

              {/* Default */}
              {!loading && !result && !error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full rounded-3xl border border-dashed border-border-color/80 flex flex-col justify-center items-center p-12 text-center text-text-muted bg-card-bg/10 backdrop-blur-md"
                >
                  <div className="w-20 h-20 rounded-2xl bg-accent-primary/10 text-accent-primary flex items-center justify-center mb-6 shadow-inner">
                    <Sparkles className="w-10 h-10" />
                  </div>
                  <h3 className="font-heading font-extrabold text-2xl text-fg-main mb-2">
                    Your India Itinerary Awaits
                  </h3>
                  <p className="text-sm max-w-sm mb-8 leading-relaxed">
                    Choose from <strong>{cities.length} Indian cities</strong> in our live database. Set your vibe, budget, and duration — then hit generate!
                  </p>
                  <div className="flex flex-wrap justify-center gap-2.5 max-w-lg">
                    {cities.slice(0, 10).map(c => (
                      <button
                        key={c}
                        onClick={() => setCity(c)}
                        className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer ${city === c ? "bg-accent-primary text-white border-accent-primary shadow-md" : "border-border-color text-text-muted hover:border-accent-primary bg-card-bg/30"}`}
                      >
                        {cityEmojis[c]} {c}
                      </button>
                    ))}
                    {cities.length > 10 && <span className="text-xs text-text-muted self-center font-bold">+{cities.length - 10} more</span>}
                  </div>
                </motion.div>
              )}

              {/* Loading */}
              {loading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full rounded-3xl glassmorphism border border-border-color flex flex-col justify-center items-center p-8 text-center gap-4 bg-card-bg/25"
                >
                  <Loader2 className="w-12 h-12 text-accent-secondary animate-spin" />
                  <h3 className="font-heading font-black text-xl text-fg-main">
                    Building Your {city} Guide
                  </h3>
                  <motion.p
                    key={loadingStep}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-text-muted max-w-xs"
                  >
                    {loadingStep}
                  </motion.p>
                  <div className="flex gap-1.5 mt-2">
                    {loadingSteps.map((_, i) => (
                      <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i <= loadingSteps.indexOf(loadingStep) ? "w-10 bg-accent-primary" : "w-5 bg-border-color"}`} />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Error */}
              {!loading && error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full rounded-3xl border border-red-200 bg-red-50 flex flex-col justify-center items-center p-12 text-center gap-4"
                >
                  <AlertCircle className="w-14 h-14 text-red-400" />
                  <h3 className="font-heading font-bold text-xl text-red-700">Couldn&apos;t Generate Plan</h3>
                  <p className="text-sm text-red-500 max-w-sm">{error}</p>
                  <button
                    onClick={() => setError(null)}
                    className="mt-2 px-6 py-3 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold transition-all cursor-pointer"
                  >
                    Try Again
                  </button>
                </motion.div>
              )}

              {/* Result */}
              {!loading && result && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full rounded-3xl glassmorphism border border-border-color flex flex-col overflow-hidden shadow-premium text-fg-main text-left"
                >
                  {/* Header */}
                  <div className="p-6 bg-gradient-to-r from-accent-primary/10 to-accent-secondary/10 border-b border-border-color flex justify-between items-center shrink-0">
                    <div>
                      <h3 className="font-heading font-black text-xl text-fg-main flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-accent-secondary" />
                        {cityEmojis[result.city] || "📍"} {result.city}
                      </h3>
                      <span className="text-[11px] text-text-muted uppercase tracking-wider block font-semibold mt-1">
                        {result.days} Days · {result.pace} pace · {result.vibe} vibe · 🇮🇳 India
                      </span>
                    </div>
                    <div>
                      <button
                        onClick={() => setResult(null)}
                        className="p-2.5 rounded-xl bg-card-bg hover:bg-fg-main/5 transition-all cursor-pointer border border-border-color flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-fg-main"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Reset Itinerary
                      </button>
                    </div>
                  </div>

                  {/* Scrollable Body */}
                  <div className="p-6 flex-grow overflow-y-auto flex flex-col md:flex-row gap-6">
                    {/* Left Column: Itinerary Details */}
                    <div className="flex-1 space-y-6">
                      {/* Weather */}
                      <div className="p-4 rounded-2xl bg-accent-secondary/5 border border-accent-secondary/10 flex gap-3">
                        <CloudSun className="w-7 h-7 text-accent-secondary shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-sm text-accent-secondary">{result.weather.temp} — {result.weather.condition}</div>
                          <p className="text-[11px] text-text-muted mt-0.5">{result.weather.description}</p>
                        </div>
                      </div>

                      {/* Day-by-Day */}
                      <div className="space-y-6">
                        {result.itinerary.map((day) => (
                          <div key={day.day} className="border-l-2 border-accent-primary pl-4 ml-2 relative">
                            <div className="w-4 h-4 rounded-full bg-bg-main border-2 border-accent-primary absolute -left-[9px] top-0 flex items-center justify-center">
                              <div className="w-1.5 h-1.5 rounded-full bg-accent-primary" />
                            </div>
                            <div className="font-heading font-extrabold text-xs text-accent-primary mb-3 uppercase tracking-wider flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" />
                              Day {day.day}
                            </div>
                            <div className="space-y-3">
                              {day.places.map((place, idx) => (
                                <div key={idx} className="p-4 rounded-xl bg-card-bg/60 border border-border-color flex gap-3.5 items-start relative group/place">
                                  <img
                                    src={place.image}
                                    alt={place.name}
                                    className="w-14 h-14 rounded-lg object-cover shrink-0"
                                    onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${place.name}/80/80`; }}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                      <h4 className="font-heading font-bold text-xs text-fg-main truncate">{place.name}</h4>
                                      <button
                                        type="button"
                                        onClick={() => handleRemovePlace(day.day - 1, idx)}
                                        className="p-1 rounded-lg text-text-muted hover:text-accent-sunset hover:bg-fg-main/5 transition-all cursor-pointer shrink-0 ml-1"
                                        title="Remove Place"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                    <p className="text-[10px] text-text-muted mt-0.5 line-clamp-2 leading-relaxed">{place.description}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-[9px] bg-accent-primary/10 text-accent-primary px-2 py-0.5 rounded-full font-semibold">{place.category}</span>
                                      <span className="text-[9px] text-accent-sunset font-semibold">⭐ {place.rating}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}

                              {/* Add Spot Custom Form */}
                              {addingPlaceForDay === day.day ? (
                                <div className="p-4 rounded-xl border border-border-color bg-card-bg/95 flex flex-col gap-3">
                                  <h5 className="text-[10px] font-bold text-accent-primary uppercase tracking-wider">
                                    Add Custom Spot to Day {day.day}
                                  </h5>
                                  
                                  <div className="space-y-2">
                                    <input
                                      type="text"
                                      placeholder="Spot Name (e.g. Royal Cafe)"
                                      value={newPlaceName}
                                      onChange={(e) => setNewPlaceName(e.target.value)}
                                      className="w-full px-3 py-2 rounded-lg border border-border-color bg-bg-main text-xs text-fg-main focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/30"
                                    />
                                    <input
                                      type="text"
                                      placeholder="Category (e.g. Sightseeing, Dining)"
                                      value={newPlaceCategory}
                                      onChange={(e) => setNewPlaceCategory(e.target.value)}
                                      className="w-full px-3 py-2 rounded-lg border border-border-color bg-bg-main text-xs text-fg-main focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/30"
                                    />
                                    <textarea
                                      placeholder="Description (What to do there?)"
                                      value={newPlaceDesc}
                                      rows={2}
                                      onChange={(e) => setNewPlaceDesc(e.target.value)}
                                      className="w-full px-3 py-2 rounded-lg border border-border-color bg-bg-main text-xs text-fg-main focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/30 resize-none"
                                    />
                                  </div>

                                  <div className="flex gap-2 justify-end">
                                    <button
                                      type="button"
                                      onClick={() => setAddingPlaceForDay(null)}
                                      className="px-3 py-1.5 rounded-lg border border-border-color text-[10px] font-bold text-text-muted hover:text-fg-main hover:bg-fg-main/5 cursor-pointer transition-all"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleAddPlace(day.day - 1)}
                                      disabled={!newPlaceName.trim()}
                                      className="px-3 py-1.5 rounded-lg bg-accent-primary text-white text-[10px] font-bold shadow-md hover:bg-accent-sunset transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                      Add Spot
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAddingPlaceForDay(day.day);
                                    setNewPlaceName("");
                                    setNewPlaceDesc("");
                                    setNewPlaceCategory("Sightseeing");
                                  }}
                                  className="w-full py-2 rounded-xl border border-dashed border-border-color/60 hover:border-accent-primary hover:text-accent-primary transition-all text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer text-text-muted bg-fg-main/[0.02] hover:bg-accent-primary/5"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  Add Custom Spot to Day {day.day}
                                </button>
                              )}
                              {day.routes.length > 0 && (
                                <div className="text-[10px] text-text-muted space-y-1 pl-1">
                                  {day.routes.map((r, i) => (
                                    <div key={i} className="flex items-center gap-1">
                                      <span>🚕</span>
                                      <span>{r.from} → {r.to}</span>
                                      {r.distance && <span className="opacity-60">· {r.distance}</span>}
                                      {r.cost > 0 && <span className="text-accent-emerald font-semibold ml-auto">₹{r.cost}</span>}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Packing List */}
                      <div className="pt-1">
                        <h4 className="font-heading font-extrabold text-xs mb-2.5 flex items-center gap-1.5 uppercase tracking-wider">
                          <CheckSquare className="w-3.5 h-3.5 text-accent-sunset" />
                          Packing Checklist
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {result.weather.packing.map((item) => (
                            <label key={item} className="flex items-center gap-2 p-2 rounded-lg border border-border-color bg-card-bg/25 text-[11px] text-text-muted cursor-pointer hover:bg-card-bg">
                              <input type="checkbox" className="w-3 h-3 accent-accent-primary" defaultChecked />
                              {item}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Live Map */}
                    <div className="w-full md:w-[320px] lg:w-[380px] shrink-0 sticky top-0 self-start">
                      <div className="bg-card-bg/40 p-4 rounded-3xl border border-border-color backdrop-blur-md">
                        <h4 className="font-heading font-black text-xs text-accent-primary uppercase tracking-wider mb-3 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          Interactive Route Map
                        </h4>
                        <ItineraryMap itinerary={result.itinerary} />
                      </div>
                    </div>
                  </div>

                  {/* Contextual Premium Booking Options Footer */}
                  <div className="p-5 bg-card-bg border-t border-border-color shrink-0 space-y-4">
                    {matchingPkg ? (
                      <div className="p-4 rounded-2xl bg-fg-main/5 border border-border-color flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <img 
                            src={matchingPkg.image} 
                            alt={matchingPkg.title} 
                            className="w-16 h-12 object-cover rounded-lg shrink-0 border border-border-color" 
                          />
                          <div>
                            <span className="text-[9px] font-bold text-accent-sunset uppercase tracking-wider block">Matching Package Found</span>
                            <h4 className="text-xs font-bold text-fg-main leading-tight line-clamp-1">{matchingPkg.title}</h4>
                            <span className="text-[10px] text-text-muted">{matchingPkg.duration} · <strong className="text-accent-emerald">{matchingPkg.price}</strong></span>
                          </div>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto shrink-0 justify-end">
                          <a 
                            href="#packages" 
                            className="px-4 py-2.5 rounded-xl border border-border-color text-text-muted hover:text-fg-main text-xs font-bold transition-all text-center flex-1 sm:flex-none"
                          >
                            View Details
                          </a>
                          <button
                            onClick={() => handleBookPackage(matchingPkg.id)}
                            className="px-5 py-2.5 rounded-xl bg-accent-primary text-white text-xs font-bold shadow-md hover:bg-accent-sunset transition-all flex items-center justify-center gap-1.5 flex-1 sm:flex-none cursor-pointer"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            Book Now
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-fg-main/5 border border-border-color flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <div className="w-12 h-12 bg-accent-sunset/10 text-accent-sunset rounded-lg flex items-center justify-center font-bold text-lg">
                            🗺️
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-accent-sunset uppercase tracking-wider block">Custom Itinerary Booking</span>
                            <h4 className="text-xs font-bold text-fg-main leading-tight">Book Custom {result.city} Itinerary</h4>
                            <span className="text-[10px] text-text-muted">{result.days} Days / {result.days - 1} Nights · Includes stay & transit planning</span>
                          </div>
                        </div>
                        <div className="w-full sm:w-auto shrink-0 flex justify-end">
                          <button
                            onClick={() => {
                              const imgUrl = cityImages[result.city] || "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80";
                              // Standard package coordination fee baseline of 9,999 INR
                              router.push(`/checkout?packageId=custom&city=${encodeURIComponent(result.city)}&priceNum=9999&days=${result.days} Days / ${result.days - 1} Nights&image=${encodeURIComponent(imgUrl)}`);
                            }}
                            className="px-6 py-2.5 rounded-xl bg-accent-primary text-white text-xs font-bold shadow-md hover:bg-accent-sunset transition-all flex items-center justify-center gap-1.5 w-full sm:w-auto cursor-pointer"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            Book Custom Trip Now
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
}

