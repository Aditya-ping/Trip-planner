"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Sparkles, Loader2, ArrowRight, RotateCcw, Calendar,
  CheckSquare, CloudSun, MapPin, AlertCircle, Wifi, CreditCard, ExternalLink,
  Trash2, Plus
} from "lucide-react";
import confetti from "canvas-confetti";
import dynamic from "next/dynamic";
import TicketDivider from "./TicketDivider";

import { API_BASE_URL } from "@/utils/config";
import { LocalEvents } from "./LocalEvents";
import { TravelBuddyActivities } from "./TravelBuddyActivities";

const ItineraryMap = dynamic(() => import("./ItineraryMap"), { ssr: false });

const FLASK_API = API_BASE_URL;

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
    elevation_m?: number;
    packing: string[];
    daily_forecast?: {
      day: number;
      date: string;
      temp_max: number;
      temp_min: number;
      condition: string;
      icon: string;
      precip_probability: number;
    }[];
  };
  aqi?: {
    aqi: number;
    status: string;
    color: string;
    badge_emoji: string;
    advice: string;
    pm25?: number;
    pm10?: number;
    source?: string;
  };
  itinerary: {
    day: number;
    places: {
      id?: number;
      name: string;
      category: string;
      rating: number;
      description: string;
      image: string;
      image_attribution?: string;
      image_attribution_link?: string;
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
  const prefersReducedMotion = useReducedMotion();
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

  // Regional language translation state
  const [translatedMap, setTranslatedMap] = useState<Record<string, string>>({});
  const [activeLangMap, setActiveLangMap] = useState<Record<string, string>>({});
  const [loadingLangMap, setLoadingLangMap] = useState<Record<string, boolean>>({});

  // Conversational Refinement State
  const [previousResult, setPreviousResult] = useState<GeneratedTrip | null>(null);
  const [refinementInput, setRefinementInput] = useState("");
  const [refining, setRefining] = useState(false);
  const [refinementNote, setRefinementNote] = useState<string | null>(null);

  const handleRefineTrip = async (instructionText?: string) => {
    const textToSubmit = instructionText || refinementInput;
    if (!textToSubmit.trim() || !result || refining) return;

    setRefining(true);
    setPreviousResult(result); // Save current result for 1-step Undo

    try {
      const response = await fetch(`${FLASK_API}/api/refine-trip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: result.city,
          days: result.days,
          pace: result.pace,
          vibe: result.vibe,
          instruction: textToSubmit,
          itinerary: result.itinerary
        })
      });

      if (!response.ok) {
        throw new Error("Failed to refine itinerary");
      }

      const data = await response.json();
      if (data.success && data.itinerary) {
        setResult(prev => prev ? {
          ...prev,
          itinerary: data.itinerary,
          total_trip_cost: data.total_trip_cost || prev.total_trip_cost,
          budget_remaining: data.budget_remaining || prev.budget_remaining
        } : null);
        setRefinementNote(data.refinement_note || `Refined itinerary: "${textToSubmit}"`);
        setRefinementInput("");
      } else {
        throw new Error(data.error || "Refinement failed");
      }
    } catch (err: any) {
      console.error("Refinement error:", err);
      alert(`Refinement Error: ${err.message || "Failed to modify itinerary"}`);
    } finally {
      setRefining(false);
    }
  };

  const handleUndoRefinement = () => {
    if (previousResult) {
      setResult(previousResult);
      setPreviousResult(null);
      setRefinementNote(null);
    }
  };

  const handleTranslatePlaceDesc = async (placeId: number | undefined, placeName: string, lang: string) => {
    const key = placeId ? `id_${placeId}` : `name_${placeName}`;
    
    if (lang === 'en') {
      setActiveLangMap((prev) => ({ ...prev, [key]: 'en' }));
      return;
    }

    const cacheKey = `${key}_${lang}`;
    if (translatedMap[cacheKey]) {
      setActiveLangMap((prev) => ({ ...prev, [key]: lang }));
      return;
    }

    setLoadingLangMap((prev) => ({ ...prev, [key]: true }));

    try {
      const endpoint = placeId 
        ? `${FLASK_API}/api/places/${placeId}/translate?lang=${lang}`
        : `${FLASK_API}/api/places/1/translate?lang=${lang}`;

      const res = await fetch(endpoint);
      const data = await res.json();
      if (data.success && data.translated_description) {
        setTranslatedMap((prev) => ({ ...prev, [cacheKey]: data.translated_description }));
        setActiveLangMap((prev) => ({ ...prev, [key]: lang }));
      }
    } catch (err) {
      console.error("Failed to fetch translation:", err);
    } finally {
      setLoadingLangMap((prev) => ({ ...prev, [key]: false }));
    }
  };

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

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 w-full min-w-0">
        {!loading && result ? (
          /* ── EXPANDED 12-COLUMN RESULT SHOWCASE MODE ── */
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="w-full rounded-2xl bg-[#161B2C] border border-[#C9A15A]/30 overflow-hidden shadow-2xl text-[#EDEAE2] text-left"
          >
            {/* Top Navigation & Info Header */}
            <div className="p-6 md:p-8 bg-[#0B0F1A] border-b border-[#C9A15A]/20 flex flex-wrap justify-between items-center gap-4">
              <div>
                <h3 className="font-heading font-black text-2xl md:text-3xl text-[#EDEAE2] flex items-center gap-3">
                  <MapPin className="w-6 h-6 text-[#C9A15A]" />
                  {cityEmojis[result.city] || "📍"} {result.city}
                </h3>
                <span className="text-xs font-mono text-[#8A94A6] uppercase tracking-wider block font-semibold mt-1">
                  [ {result.days} DAYS · {result.pace} pace · {result.vibe} vibe · Est. Cost: ₹{result.total_trip_cost.toLocaleString('en-IN')} ]
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setResult(null)}
                  className="px-4 py-2.5 rounded-xl bg-[#161B2C] hover:bg-[#C9A15A]/15 transition-all cursor-pointer border border-[#C9A15A]/30 flex items-center gap-2 text-xs font-bold text-[#8A94A6] hover:text-[#C9A15A]"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset & Plan New Trip
                </button>
              </div>
            </div>

            {/* Main Content Grid: 8-Column Timeline + 4-Column Sidebar */}
            <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Main Timeline (8 Columns) */}
              <div className="lg:col-span-8 space-y-8 min-w-0">
                
                {/* Weather & AQI Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Weather */}
                  <div className="p-4 rounded-xl bg-[#0B0F1A] border border-[#C9A15A]/20 flex items-start gap-3">
                    <CloudSun className="w-7 h-7 text-[#C9A15A] shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between flex-wrap gap-1.5">
                        <div className="font-bold text-xs text-[#C9A15A]">{result.weather.temp} — {result.weather.condition}</div>
                        {result.weather.elevation_m && result.weather.elevation_m > 1500 ? (
                          <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            🏔️ High Altitude ({result.weather.elevation_m}m)
                          </span>
                        ) : null}
                      </div>
                      <p className="text-xs text-[#8A94A6] mt-1 leading-relaxed">{result.weather.description}</p>
                    </div>
                  </div>

                  {/* AQI */}
                  {result.aqi && (
                    <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                      result.aqi.color === "emerald" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
                      result.aqi.color === "yellow" ? "bg-amber-500/10 border-amber-500/30 text-amber-400" :
                      result.aqi.color === "orange" ? "bg-orange-500/10 border-orange-500/30 text-orange-400" :
                      result.aqi.color === "red" ? "bg-red-500/10 border-red-500/30 text-red-400" :
                      "bg-purple-500/10 border-purple-500/30 text-purple-400"
                    }`}>
                      <div className="text-2xl shrink-0 leading-none">{result.aqi.badge_emoji}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 flex-wrap">
                          <span className="font-mono font-black text-xs tracking-wide uppercase">AQI {result.aqi.aqi} • {result.aqi.status}</span>
                          <span className="text-[9px] opacity-75 font-mono px-1.5 py-0.5 rounded bg-black/20">LIVE AQI</span>
                        </div>
                        <p className="text-xs opacity-90 mt-1 leading-snug">{result.aqi.advice}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* AI Conversational Refinement Bar */}
                <div className="p-5 rounded-2xl bg-[#0B0F1A] border border-[#C9A15A]/30 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#C9A15A]/15 border border-[#C9A15A]/40 flex items-center justify-center text-[#C9A15A]">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-heading font-black text-[#EDEAE2] uppercase tracking-wider">
                          Refine Itinerary with AI
                        </h4>
                        <p className="text-xs text-[#8A94A6]">
                          Type a request to modify specific days without regenerating the full trip.
                        </p>
                      </div>
                    </div>

                    {previousResult && (
                      <button
                        type="button"
                        onClick={handleUndoRefinement}
                        className="px-3.5 py-1.5 rounded-xl border border-[#C9A15A]/40 bg-[#161B2C] hover:bg-[#C9A15A]/15 text-[#C9A15A] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Undo Refinement</span>
                      </button>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={refinementInput}
                      onChange={(e) => setRefinementInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleRefineTrip();
                        }
                      }}
                      placeholder="e.g. 'Make Day 2 less packed' or 'Swap for a tea cafe'"
                      className="flex-1 bg-[#161B2C] border border-[#C9A15A]/30 rounded-xl px-4 py-2.5 text-xs text-[#EDEAE2] placeholder-[#8A94A6] focus:outline-none focus:border-[#C9A15A]"
                    />
                    <button
                      type="button"
                      disabled={refining || !refinementInput.trim()}
                      onClick={() => handleRefineTrip()}
                      className="px-5 py-2.5 rounded-xl bg-[#C9A15A] hover:bg-[#b08b46] text-[#0B0F1A] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                    >
                      {refining ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      <span>{refining ? "Refining..." : "Refine"}</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    <span className="text-[#8A94A6] font-semibold text-xs">Try:</span>
                    {[
                      "Make Day 2 less packed",
                      "Add a heritage tea cafe",
                      "More outdoor nature spots"
                    ].map((promptText) => (
                      <button
                        key={promptText}
                        type="button"
                        disabled={refining}
                        onClick={() => {
                          setRefinementInput(promptText);
                          handleRefineTrip(promptText);
                        }}
                        className="px-3 py-1 rounded-lg border border-[#C9A15A]/20 bg-[#161B2C] hover:border-[#C9A15A]/50 text-[#8A94A6] hover:text-[#EDEAE2] text-xs font-medium transition-all cursor-pointer"
                      >
                        ✨ {promptText}
                      </button>
                    ))}
                  </div>

                  {refinementNote && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between gap-2">
                      <span className="font-semibold">✓ {refinementNote}</span>
                      {previousResult && (
                        <button
                          type="button"
                          onClick={handleUndoRefinement}
                          className="text-xs underline font-bold hover:text-emerald-300 cursor-pointer shrink-0"
                        >
                          Undo
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Day-by-Day Timeline */}
                <div className="space-y-6">
                  {result.itinerary.map((day, dIdx) => {
                    const dayFc = result.weather.daily_forecast?.find(df => df.day === day.day) || result.weather.daily_forecast?.[day.day - 1];
                    return (
                      <motion.div
                        key={day.day}
                        initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.38,
                          delay: dIdx * 0.12,
                          ease: [0.22, 0.03, 0.26, 1]
                        }}
                      >
                        {dIdx > 0 && <TicketDivider className="opacity-60 my-6" />}
                        <div className="border-l-2 border-[#C9A15A] pl-5 ml-2 relative">
                          <div className="w-4 h-4 rounded-sm bg-[#0B0F1A] border border-[#C9A15A] absolute -left-[9px] top-0 flex items-center justify-center">
                            <div className="w-2 h-2 bg-[#C9A15A]" />
                          </div>

                          {/* Day Header Row */}
                          <div className="font-mono font-bold text-xs text-[#C9A15A] mb-4 uppercase tracking-wider flex flex-wrap items-center justify-between gap-2.5">
                            <div className="flex items-center gap-2 px-3 py-1 rounded-lg border border-[#C9A15A]/40 bg-[#C9A15A]/10 font-mono tracking-widest text-xs">
                              <Calendar className="w-4 h-4" />
                              [ TKT-SEQ 0{day.day} • DAY 0{day.day} ]
                            </div>
                            {dayFc && (
                              <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-[#0B0F1A] text-[#8A94A6] text-xs font-semibold border border-[#C9A15A]/20 font-sans tracking-normal capitalize flex-wrap">
                                <span>{dayFc.icon}</span>
                                <span>{dayFc.temp_min}°C / {dayFc.temp_max}°C</span>
                                <span>• {dayFc.condition}</span>
                                {dayFc.precip_probability >= 20 && (
                                  <span className="text-blue-400 font-semibold">• ☔ {dayFc.precip_probability}% rain</span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Day Places List */}
                          <div className="space-y-4">
                            {day.places.map((place, idx) => {
                              const placeKey = place.id ? `id_${place.id}` : `name_${place.name}`;
                              const activeLang = activeLangMap[placeKey] || 'en';
                              const displayedDesc = (activeLang !== 'en' && translatedMap[`${placeKey}_${activeLang}`]) 
                                ? translatedMap[`${placeKey}_${activeLang}`] 
                                : place.description;

                              return (
                                <div key={idx} className="p-4 sm:p-5 rounded-2xl bg-[#0B0F1A] border border-[#C9A15A]/20 flex flex-col sm:flex-row gap-4 items-start relative group/place hover:border-[#C9A15A]/50 transition-all">
                                  <img
                                    src={place.image}
                                    alt={place.name}
                                    className="w-full sm:w-20 h-32 sm:h-20 rounded-xl object-cover border border-[#C9A15A]/30 shrink-0"
                                    onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${place.name}/120/120`; }}
                                  />
                                  <div className="flex-1 min-w-0 w-full">
                                    <div className="flex justify-between items-start gap-2">
                                      <h4 className="font-heading font-bold text-sm text-[#EDEAE2] leading-snug">{place.name}</h4>
                                      <button
                                        type="button"
                                        onClick={() => handleRemovePlace(day.day - 1, idx)}
                                        className="p-1 rounded text-[#8A94A6] hover:text-red-400 transition-all cursor-pointer shrink-0"
                                        title="Remove Place"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                    <p className="text-xs text-[#8A94A6] mt-1 leading-relaxed font-sans">{displayedDesc}</p>

                                    <div className="flex items-center justify-between flex-wrap gap-2.5 mt-3 pt-2 border-t border-[#C9A15A]/20">
                                      <div className="flex items-center gap-2">
                                        <span className="text-[10px] bg-[#C9A15A]/10 text-[#C9A15A] border border-[#C9A15A]/30 px-2.5 py-0.5 rounded-md font-mono uppercase">{place.category}</span>
                                        <span className="text-xs text-[#C9A15A] font-semibold">⭐ {place.rating}</span>
                                      </div>

                                      {/* Regional Language Translation Pills */}
                                      <div className="flex items-center gap-1 flex-wrap">
                                        {[
                                          { code: 'en', label: '🇬🇧 EN' },
                                          { code: 'hi', label: '🇮🇳 हिंदी' },
                                          { code: 'kn', label: '🇮🇳 ಕನ್ನಡ' },
                                          { code: 'ta', label: '🇮🇳 தமிழ்' }
                                        ].map((l) => (
                                          <button
                                            key={l.code}
                                            type="button"
                                            onClick={() => handleTranslatePlaceDesc(place.id, place.name, l.code)}
                                            disabled={loadingLangMap[placeKey]}
                                            className={`text-[9px] px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                                              activeLang === l.code
                                                ? "bg-[#C9A15A] text-[#0B0F1A] font-bold"
                                                : "bg-[#161B2C] text-[#8A94A6] hover:text-[#EDEAE2]"
                                            }`}
                                          >
                                            {loadingLangMap[placeKey] && activeLang === l.code ? "..." : l.label}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}

                            {/* Add Spot Form */}
                            {addingPlaceForDay === day.day ? (
                              <div className="p-4 rounded-2xl border border-[#C9A15A]/30 bg-[#0B0F1A] flex flex-col gap-3">
                                <h5 className="text-xs font-mono font-bold text-[#C9A15A] uppercase tracking-wider">
                                  [ ADD SPOT — DAY 0{day.day} ]
                                </h5>
                                
                                <div className="space-y-2">
                                  <input
                                    type="text"
                                    placeholder="Spot Name (e.g. Royal Cafe)"
                                    value={newPlaceName}
                                    onChange={(e) => setNewPlaceName(e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#C9A15A]/30 bg-[#161B2C] text-xs text-[#EDEAE2] focus:outline-none focus:border-[#C9A15A]"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Category (e.g. Sightseeing, Dining)"
                                    value={newPlaceCategory}
                                    onChange={(e) => setNewPlaceCategory(e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#C9A15A]/30 bg-[#161B2C] text-xs text-[#EDEAE2] focus:outline-none focus:border-[#C9A15A]"
                                  />
                                  <textarea
                                    placeholder="Description (What to do there?)"
                                    value={newPlaceDesc}
                                    rows={2}
                                    onChange={(e) => setNewPlaceDesc(e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#C9A15A]/30 bg-[#161B2C] text-xs text-[#EDEAE2] focus:outline-none focus:border-[#C9A15A] resize-none"
                                  />
                                </div>

                                <div className="flex gap-2 justify-end">
                                  <button
                                    type="button"
                                    onClick={() => setAddingPlaceForDay(null)}
                                    className="px-4 py-2 rounded-xl border border-[#C9A15A]/30 text-xs font-bold text-[#8A94A6] hover:text-[#EDEAE2] cursor-pointer transition-all"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleAddPlace(day.day - 1)}
                                    disabled={!newPlaceName.trim()}
                                    className="px-4 py-2 rounded-xl bg-[#C9A15A] text-[#0B0F1A] text-xs font-bold hover:bg-[#E6C887] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
                                className="w-full py-2.5 rounded-xl border border-dashed border-[#C9A15A]/40 hover:border-[#C9A15A] hover:text-[#C9A15A] transition-all text-xs font-bold flex items-center justify-center gap-2 cursor-pointer text-[#8A94A6] bg-[#0B0F1A]"
                              >
                                <Plus className="w-4 h-4" />
                                Add Custom Spot to Day {day.day}
                              </button>
                            )}

                            {day.routes.length > 0 && (
                              <div className="text-xs text-[#8A94A6] space-y-1 pl-1 font-mono">
                                {day.routes.map((r, i) => (
                                  <div key={i} className="flex items-center gap-1.5 flex-wrap">
                                    <span>🚕</span>
                                    <span>{r.from} → {r.to}</span>
                                    {r.distance && <span className="opacity-60">· {r.distance}</span>}
                                    {r.cost > 0 && <span className="text-[#C9A15A] font-semibold ml-auto">₹{r.cost}</span>}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Local Events Section */}
                <LocalEvents city={result.city} />

                {/* Traveler Activity Invites Section */}
                <TravelBuddyActivities city={result.city} />

                {/* Packing Checklist */}
                <div className="p-6 rounded-2xl bg-[#0B0F1A] border border-[#C9A15A]/20">
                  <h4 className="font-heading font-extrabold text-xs mb-3 flex items-center gap-2 uppercase tracking-wider text-[#EDEAE2]">
                    <CheckSquare className="w-4 h-4 text-[#C9A15A]" />
                    Packing Checklist
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {result.weather.packing.map((item) => (
                      <label key={item} className="flex items-center gap-2.5 p-2.5 rounded-xl border border-[#C9A15A]/20 bg-[#161B2C] text-xs text-[#8A94A6] cursor-pointer hover:bg-[#161B2C]/80">
                        <input type="checkbox" className="w-3.5 h-3.5 accent-[#C9A15A]" defaultChecked />
                        <span>{item}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Prominent Full-Width Custom Booking Banner (No Horizontal Scrollbar) */}
                <div className="p-6 rounded-2xl bg-[#0B0F1A] border border-[#C9A15A]/30 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-14 h-14 rounded-2xl bg-[#C9A15A]/15 border border-[#C9A15A]/30 text-[#C9A15A] flex items-center justify-center text-2xl shrink-0">
                      🗺️
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-[#C9A15A] uppercase tracking-wider block">Custom Itinerary Booking</span>
                      <h4 className="text-base font-bold text-[#EDEAE2] truncate">Book Custom {result.city} Itinerary</h4>
                      <span className="text-xs text-[#8A94A6] block mt-0.5">{result.days} Days / {result.days - 1} Nights · Includes stay & transit planning</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const imgUrl = cityImages[result.city] || "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80";
                      const durationStr = `${result.days} Days / ${result.days - 1} Nights`;
                      router.push(`/checkout?packageId=custom&city=${encodeURIComponent(result.city)}&priceNum=9999&days=${encodeURIComponent(durationStr)}&image=${encodeURIComponent(imgUrl)}`);
                    }}
                    className="px-8 py-3.5 rounded-xl bg-[#C9A15A] hover:bg-[#E6C887] text-[#0B0F1A] text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer w-full md:w-auto"
                  >
                    <CreditCard className="w-4 h-4" />
                    Book Custom Trip Now
                  </button>
                </div>
              </div>

              {/* Right Sidebar (4 Columns): Map & Booking Card */}
              <div className="lg:col-span-4 space-y-6">
                <div className="sticky top-28 space-y-6">
                  {/* Interactive Map Card */}
                  <div className="bg-[#0B0F1A] p-5 rounded-2xl border border-[#C9A15A]/30 shadow-xl">
                    <h4 className="font-heading font-black text-xs text-[#C9A15A] uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Interactive Route Map
                    </h4>
                    <ItineraryMap itinerary={result.itinerary} />
                  </div>

                  {/* Booking Package Options */}
                  <div className="p-5 rounded-2xl bg-[#0B0F1A] border border-[#C9A15A]/30 shadow-xl">
                    {matchingPkg ? (
                      <div className="space-y-4">
                        <img 
                          src={matchingPkg.image} 
                          alt={matchingPkg.title} 
                          className="w-full h-36 object-cover rounded-xl border border-[#C9A15A]/20" 
                        />
                        <div>
                          <span className="text-[10px] font-bold text-[#C9A15A] uppercase tracking-wider block">Matching Package Found</span>
                          <h4 className="text-sm font-bold text-[#EDEAE2] mt-0.5">{matchingPkg.title}</h4>
                          <span className="text-xs text-[#8A94A6] block mt-1">{matchingPkg.duration} · <strong className="text-emerald-400">{matchingPkg.price}</strong></span>
                        </div>
                        <div className="flex gap-2 pt-1">
                          <a 
                            href="#packages" 
                            className="px-4 py-2.5 rounded-xl border border-[#C9A15A]/30 text-[#8A94A6] hover:text-[#EDEAE2] text-xs font-bold transition-all text-center flex-1"
                          >
                            Details
                          </a>
                          <button
                            onClick={() => handleBookPackage(matchingPkg.id)}
                            className="px-5 py-2.5 rounded-xl bg-[#C9A15A] hover:bg-[#E6C887] text-[#0B0F1A] text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 flex-1 cursor-pointer"
                          >
                            <CreditCard className="w-4 h-4" />
                            Book Now
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 text-center">
                        <div className="w-14 h-14 bg-[#C9A15A]/15 text-[#C9A15A] border border-[#C9A15A]/30 rounded-2xl flex items-center justify-center font-bold text-2xl mx-auto">
                          🗺️
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-[#C9A15A] uppercase tracking-wider block">Custom Itinerary Booking</span>
                          <h4 className="text-sm font-bold text-[#EDEAE2] mt-0.5">Book Custom {result.city} Itinerary</h4>
                          <span className="text-xs text-[#8A94A6] block mt-1">{result.days} Days / {result.days - 1} Nights · Includes stay & transit</span>
                        </div>
                        <button
                          onClick={() => {
                            const imgUrl = cityImages[result.city] || "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80";
                            const durationStr = `${result.days} Days / ${result.days - 1} Nights`;
                            router.push(`/checkout?packageId=custom&city=${encodeURIComponent(result.city)}&priceNum=9999&days=${encodeURIComponent(durationStr)}&image=${encodeURIComponent(imgUrl)}`);
                          }}
                          className="px-6 py-3 rounded-xl bg-[#C9A15A] hover:bg-[#E6C887] text-[#0B0F1A] text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 w-full cursor-pointer"
                        >
                          <CreditCard className="w-4 h-4" />
                          Book Custom Trip Now
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        ) : (
          /* ── STANDARD 2-COLUMN FORM & PLACEHOLDER GRID ── */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">

            {/* Left: Form */}
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

              <form onSubmit={handleGenerate} className="p-8 rounded-md bg-[#161B2C] border border-[#C9A15A]/30 shadow-document flex flex-col gap-6">

                {/* City Dropdown */}
                <div>
                  <label className="font-sans text-[11px] font-semibold text-[#8A94A6] uppercase tracking-wider block mb-2">
                    Select Destination City
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-3 rounded-md border border-[#C9A15A]/30 bg-[#0B0F1A] text-sm font-semibold focus:outline-none focus:border-[#C9A15A] focus:ring-1 focus:ring-[#C9A15A] cursor-pointer text-[#EDEAE2]"
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
                  <label className="font-sans text-[11px] font-semibold text-[#8A94A6] uppercase tracking-wider block mb-2">
                    Trip Budget: <span className="text-[#C9A15A] font-bold text-sm font-mono">₹{budget.toLocaleString("en-IN")}</span>
                  </label>
                  <input
                    type="range"
                    min={5000} max={200000} step={1000}
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full accent-[#C9A15A] cursor-pointer h-2 bg-[#0B0F1A] rounded-md appearance-none border border-[#C9A15A]/20"
                  />
                  <div className="flex justify-between text-[10px] text-[#8A94A6] mt-2 font-mono">
                    <span>₹5,000</span><span>₹1,00,000</span><span>₹2,00,000</span>
                  </div>
                </div>

                {/* Pace + Days */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-sans text-[11px] font-semibold text-[#8A94A6] uppercase tracking-wider block mb-2">Travel Pace</label>
                    <select
                      value={pace}
                      onChange={(e) => setPace(e.target.value)}
                      className="w-full px-4 py-3 rounded-md border border-[#C9A15A]/30 bg-[#0B0F1A] text-sm font-semibold focus:outline-none focus:border-[#C9A15A] focus:ring-1 focus:ring-[#C9A15A] text-[#EDEAE2]"
                    >
                      <option value="relaxed">🧘 Relaxed (2/day)</option>
                      <option value="moderate">🚶 Moderate (3/day)</option>
                      <option value="packed">⚡ Packed (4/day)</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-sans text-[11px] font-semibold text-[#8A94A6] uppercase tracking-wider block mb-2">Duration</label>
                    <select
                      value={daysCount}
                      onChange={(e) => setDaysCount(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-md border border-[#C9A15A]/30 bg-[#0B0F1A] text-sm font-semibold focus:outline-none focus:border-[#C9A15A] focus:ring-1 focus:ring-[#C9A15A] text-[#EDEAE2]"
                    >
                      {[2,3,4,5,6,7].map(d => (
                        <option key={d} value={d}>{d} Day{d > 1 ? "s" : ""}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Vibe */}
                <div>
                  <label className="font-sans text-[11px] font-semibold text-[#8A94A6] uppercase tracking-wider block mb-2">Trip Vibe</label>
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
                        className={`px-3 py-2.5 rounded-md text-xs font-semibold border transition-all cursor-pointer ${
                          vibe === item.id
                            ? "bg-[#C9A15A] border-[#C9A15A] text-[#0B0F1A] font-bold shadow-md"
                            : "border-[#C9A15A]/30 hover:bg-[#C9A15A]/10 text-[#EDEAE2]"
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
                  className="flex items-center justify-center gap-2 w-full py-4 rounded-md bg-[#C9A15A] hover:bg-[#E6C887] text-[#0B0F1A] font-bold text-sm shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sparkles className="w-4 h-4" />
                  Generate {city ? `${city} Itinerary` : "Itinerary"}
                </button>
              </form>
            </div>

            {/* Right: Placeholder / Loading / Error Box */}
            <div className="lg:col-span-7 h-[700px] relative w-full flex items-center justify-center">
              <AnimatePresence mode="wait">

                {/* Default */}
                {!loading && !error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full h-full rounded-md border border-dashed border-[#C9A15A]/30 flex flex-col justify-center items-center p-12 text-center text-text-muted bg-[#161B2C]"
                  >
                    <div className="w-16 h-16 rounded-md bg-[#C9A15A]/10 text-[#C9A15A] border border-[#C9A15A]/30 flex items-center justify-center mb-6">
                      <Sparkles className="w-8 h-8" />
                    </div>
                    <h3 className="font-heading font-extrabold text-2xl text-fg-main mb-2">
                      Your India Itinerary Awaits
                    </h3>
                    <p className="text-sm max-w-sm mb-8 leading-relaxed font-sans text-[#8A94A6]">
                      Choose from <strong>{cities.length} Indian cities</strong> in our live database. Set your vibe, budget, and duration — then hit generate!
                    </p>
                    <div className="flex flex-wrap justify-center gap-2.5 max-w-lg">
                      {cities.slice(0, 10).map(c => (
                        <button
                          key={c}
                          onClick={() => setCity(c)}
                          className={`px-3.5 py-1.5 rounded-md text-xs font-semibold border transition-all cursor-pointer ${city === c ? "bg-[#C9A15A] text-[#0B0F1A] border-[#C9A15A] font-bold shadow-md" : "border-[#C9A15A]/20 text-[#8A94A6] hover:border-[#C9A15A] bg-[#0B0F1A]"}`}
                        >
                          {cityEmojis[c]} {c}
                        </button>
                      ))}
                      {cities.length > 10 && <span className="text-xs text-[#8A94A6] self-center font-bold">+{cities.length - 10} more</span>}
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
                    className="w-full h-full rounded-md bg-[#161B2C] border border-[#C9A15A]/30 flex flex-col justify-center items-center p-8 text-center gap-4"
                  >
                    <Loader2 className="w-12 h-12 text-[#C9A15A] animate-spin" />
                    <h3 className="font-heading font-black text-xl text-fg-main">
                      Building Your {city} Guide
                    </h3>
                    <motion.p
                      key={loadingStep}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-[#8A94A6] max-w-xs font-sans"
                    >
                      {loadingStep}
                    </motion.p>
                    <div className="flex gap-1.5 mt-2">
                      {loadingSteps.map((_, i) => (
                        <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i <= loadingSteps.indexOf(loadingStep) ? "w-10 bg-[#C9A15A]" : "w-5 bg-[#C9A15A]/20"}`} />
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
                    className="w-full h-full rounded-md border border-red-500/30 bg-[#161B2C] flex flex-col justify-center items-center p-12 text-center gap-4"
                  >
                    <AlertCircle className="w-14 h-14 text-red-400" />
                    <h3 className="font-heading font-bold text-xl text-red-400">Couldn&apos;t Generate Plan</h3>
                    <p className="text-sm text-red-300 max-w-sm">{error}</p>
                    <button
                      onClick={() => setError(null)}
                      className="mt-2 px-6 py-3 rounded-md bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-bold transition-all cursor-pointer"
                    >
                      Try Again
                    </button>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

          </div>
        )}
      </div>
    </section>
  );
}

