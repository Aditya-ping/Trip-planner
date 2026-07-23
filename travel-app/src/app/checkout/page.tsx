"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, CreditCard, ShieldCheck, Calendar, Users, 
  MapPin, CheckCircle2, Ticket, Sparkles, Loader2, QrCode, Building, ExternalLink, PlaneTakeoff,
  X, Armchair, Compass, AlertCircle, Train
} from "lucide-react";
import { useHotels } from "@/hooks/useHotels";
import { useFlights, Flight } from "@/hooks/useFlights";
import { useTrains } from "@/hooks/useTrains";
import NavigationBrochure from "@/components/NavigationBrochure";
import TicketDivider from "@/components/TicketDivider";
import { API_BASE_URL } from "@/utils/config";
import StampSeal from "@/components/StampSeal";
import { useAuth } from "@/context/AuthContext";

// Package data matching FeaturedPackages
interface Package {
  id: number;
  flight_no?: string | null;
  title: string;
  destination: string;
  duration: string;
  rating: number;
  price: string;
  priceNum: number;
  image: string;
  inclusions: string[];
}

interface RoomOption {
  type: string;
  price: number;
  description: string;
}

interface Hotel {
  name: string;
  address: string;
  rating: number;
  price: number;
  key?: string;
  image?: string;
  website?: string;
  rooms?: RoomOption[];
}

const packages: Package[] = [
  {
    id: 1,
    title: "Rajasthan Royal Heritage Circuit",
    destination: "Jaipur • Jodhpur • Udaipur (Rajasthan)",
    duration: "7 Days / 6 Nights",
    rating: 4.9,
    price: "₹42,000",
    priceNum: 42000,
    image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80",
    inclusions: [
      "Double sharing accommodation in 4-star/Heritage hotels",
      "Daily buffet breakfast and dinner",
      "Private air-conditioned Sedan for all transfers",
      "All monument entry tickets and boat rides"
    ]
  },
  {
    id: 2,
    title: "Kerala Backwaters & Hill Stations",
    destination: "Kochi • Alleppey • Munnar (Kerala)",
    duration: "6 Days / 5 Nights",
    rating: 4.95,
    price: "₹38,500",
    priceNum: 38500,
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80",
    inclusions: [
      "1 Night luxury houseboat stay (Full board)",
      "4 Nights in premium boutique hotels",
      "Private AC Cab for the entire circuit",
      "Traditional Kathakali show tickets"
    ]
  },
  {
    id: 3,
    title: "Leh Ladakh Himalayan Odyssey",
    destination: "Leh • Nubra Valley • Pangong Lake (J&K)",
    duration: "8 Days / 7 Nights",
    rating: 4.88,
    price: "₹55,000",
    priceNum: 55000,
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80",
    inclusions: [
      "Premium Campsite stays at Pangong Lake",
      "All meals included (Breakfast, Lunch, Dinner)",
      "Dedicated 4x4 Innova for mountain passes",
      "Inner Line Permits (ILP) and Oxygen cylinders"
    ]
  }
];

const hotelImages = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=300&q=80"
];

const fallbackHotels: Record<string, Hotel[]> = {
  "bangalore": [
    { name: "The Leela Palace Bengaluru", address: "Old Airport Road, Bangalore", rating: 4.8, price: 9500 },
    { name: "Taj West End", address: "Race Course Road, Bangalore", rating: 4.7, price: 8200 },
    { name: "ITC Gardenia", address: "Residency Road, Bangalore", rating: 4.6, price: 7800 },
    { name: "Radisson Blu Atria", address: "Palace Road, Bangalore", rating: 4.3, price: 4200 }
  ],
  "jaipur": [
    { name: "Rambagh Palace", address: "Bhawani Singh Road, Jaipur", rating: 4.9, price: 12000 },
    { name: "The Oberoi Rajvilas", address: "Goner Road, Jaipur", rating: 4.8, price: 10500 },
    { name: "ITC Rajputana", address: "Palace Road, Jaipur", rating: 4.5, price: 5800 }
  ],
  "kochi": [
    { name: "Brunton Boatyard", address: "Fort Kochi, Kochi", rating: 4.7, price: 6500 },
    { name: "Grand Hyatt Bolgatty", address: "Mulavukad, Kochi", rating: 4.8, price: 7500 },
    { name: "Taj Malabar Resort & Spa", address: "Willingdon Island, Kochi", rating: 4.6, price: 6200 }
  ],
  "leh": [
    { name: "The Grand Dragon Ladakh", address: "Old Road, Leh Ladakh", rating: 4.8, price: 8500 },
    { name: "Hotel Singge Palace", address: "Main Bazaar, Leh Ladakh", rating: 4.5, price: 5200 },
    { name: "Spic n Span Hotel", address: "Fort Road, Leh Ladakh", rating: 4.3, price: 4000 }
  ],
  "delhi": [
    { name: "The Taj Mahal Hotel", address: "Mansingh Road, New Delhi", rating: 4.8, price: 11000 },
    { name: "The Imperial", address: "Janpath, Connaught Place, New Delhi", rating: 4.7, price: 9800 },
    { name: "Shangri-La Eros", address: "Ashoka Road, New Delhi", rating: 4.6, price: 7500 }
  ],
  "goa": [
    { name: "Taj Exotica Resort & Spa", address: "Benaulim Beach, South Goa", rating: 4.9, price: 13500 },
    { name: "The Leela Goa", address: "Mobor Beach, South Goa", rating: 4.8, price: 14000 },
    { name: "W Goa", address: "Vagator Beach, North Goa", rating: 4.6, price: 11500 }
  ],
  "default": [
    { name: "AeroTravel Premium Stay", address: "City Center Premier Zone", rating: 4.5, price: 3500 },
    { name: "AeroTravel Standard Inn", address: "Downtown Comfort Zone", rating: 4.2, price: 2200 },
    { name: "AeroTravel Budget Hostel", address: "Transit Circle Metro Zone", rating: 3.9, price: 1200 }
  ]
};

const generateOccupiedSeats = (offerId: string): Set<string> => {
  const occupied = new Set<string>();
  if (!offerId) return occupied;
  let hash = 0;
  for (let i = 0; i < offerId.length; i++) {
    hash = (hash << 5) - hash + offerId.charCodeAt(i);
    hash |= 0;
  }
  const random = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };
  let seed = hash;
  // Business Rows 1-3: seats A, C, D, F
  const busCols = ["A", "C", "D", "F"];
  for (let r = 1; r <= 3; r++) {
    for (const c of busCols) {
      seed += 1;
      if (random(seed) > 0.45) occupied.add(`${r}${c}`);
    }
  }
  // Economy Rows 4-25: seats A, B, C, D, E, F
  const ecoCols = ["A", "B", "C", "D", "E", "F"];
  for (let r = 4; r <= 25; r++) {
    for (const c of ecoCols) {
      seed += 1;
      if (random(seed) > 0.35) occupied.add(`${r}${c}`);
    }
  }
  return occupied;
};

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const packageIdParam = searchParams.get("packageId");

  const { hotels, rates, loading: hookLoading, error: hookError, fetchHotels, fetchRates } = useHotels();
  
  const [pkg, setPkg] = useState<Package | null>(null);
  const [step, setStep] = useState<number>(1); // 1: Details, 2: Payment, 3: Processing, 4: Success
  
  // Traveler Details State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [travelDate, setTravelDate] = useState("");
  const [travelers, setTravelers] = useState(1);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Guide Fee Toggle
  const [includeGuide, setIncludeGuide] = useState(false);

  // Dynamic Hotels API State
  const [hotelsList, setHotelsList] = useState<Hotel[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<RoomOption | null>(null);
  const [hotelsLoading, setHotelsLoading] = useState(false);
  const [ratesLoading, setRatesLoading] = useState(false);

  // Flights State
  const { cities, flightsLoading, fetchCities, searchFlights } = useFlights();
  const [includeFlights, setIncludeFlights] = useState(searchParams.get("includeFlights") === "true");
  const [originCityIata, setOriginCityIata] = useState<string>("");
  const [availableFlights, setAvailableFlights] = useState<Flight[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [showSeatMap, setShowSeatMap] = useState<boolean>(false);
  const [showBrochure, setShowBrochure] = useState<boolean>(false);

  // Train State
  const [includeTrains, setIncludeTrains] = useState<boolean>(false);
  const [selectedTrain, setSelectedTrain] = useState<import("@/hooks/useTrains").TrainOption | null>(null);
  const trainCitySearch = packageIdParam === "custom"
    ? (searchParams.get("city") || "")
    : (pkg?.id === 1 ? "Jaipur" : pkg?.id === 2 ? "Kochi" : "Leh Ladakh");
  const { trains: availableTrains, loading: trainsLoading } = useTrains(
    includeTrains ? (originCityIata || "") : "",
    includeTrains ? trainCitySearch : ""
  );

  useEffect(() => {
    setSelectedSeats([]);
    setShowSeatMap(false);
  }, [selectedFlight?.offer_id, travelers]);

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  useEffect(() => {
    if (includeFlights && originCityIata && travelDate && pkg) {
      const citySearch = packageIdParam === "custom" 
        ? (searchParams.get("city") || "Bangalore") 
        : (pkg.id === 1 ? "Jaipur" : pkg.id === 2 ? "Kochi" : "Leh Ladakh");
      
      searchFlights(originCityIata, citySearch, travelDate, travelers).then(data => {
        if (data) setAvailableFlights(data.flights);
        else setAvailableFlights([]);
      });
    }
  }, [includeFlights, originCityIata, travelDate, travelers, pkg, searchFlights, packageIdParam, searchParams]);

  // Auth State
  const { token, user, openAuthModal } = useAuth();

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "netbanking">("card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);
  const [upiId, setUpiId] = useState("");
  const [bookingRef, setBookingRef] = useState("");

  // Load package details
  useEffect(() => {
    if (packageIdParam === "custom") {
      const city = searchParams.get("city") || "Custom Destination";
      const priceVal = parseInt(searchParams.get("priceNum") || "30000", 10);
      const days = searchParams.get("days") || "3 Days";
      const imageVal = searchParams.get("image") || "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80";
      
      setPkg({
        id: -1,
        title: `Custom ${city} Tour Package`,
        destination: `${city} (Custom AI Itinerary)`,
        duration: days,
        rating: 4.8,
        price: `₹${priceVal.toLocaleString("en-IN")}`,
        priceNum: priceVal,
        image: imageVal,
        inclusions: [
          "All transit cab route costs as optimized by AI",
          "Recommended hotel bookings coordinated",
          "Full day-by-day sightseeing checklist mapping",
          "Live local guide recommendations & advisories"
        ]
      });
    } else {
      const id = parseInt(packageIdParam || "1", 10);
      const selected = packages.find(p => p.id === id) || packages[0];
      setPkg(selected);
    }
  }, [packageIdParam, searchParams]);

  const addDaysToDateStr = (dateStr: string, daysToAdd: number) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      d.setDate(d.getDate() + daysToAdd);
      return d.toISOString().split("T")[0];
    } catch (e) {
      return dateStr;
    }
  };

  // Fetch hotels for package destination
  useEffect(() => {
    if (!pkg) return;
    const citySearch = packageIdParam === "custom" 
      ? (searchParams.get("city") || "Bangalore") 
      : (pkg.id === 1 ? "Jaipur" : pkg.id === 2 ? "Kochi" : "Leh Ladakh");
    
    setHotelsLoading(true);
    fetchHotels(citySearch).finally(() => {
      setHotelsLoading(false);
    });
  }, [pkg, packageIdParam, searchParams]);

  // Synchronize hook hotels state to checkout hotels list
  useEffect(() => {
    const citySearch = packageIdParam === "custom" 
      ? (searchParams.get("city") || "Bangalore") 
      : (pkg?.id === 1 ? "Jaipur" : pkg?.id === 2 ? "Kochi" : "Leh Ladakh");

    if (hotels && hotels.length > 0) {
      const enriched = hotels.map((h: any, idx: number) => ({
        ...h,
        image: hotelImages[idx % hotelImages.length],
        website: `https://www.google.com/search?q=${encodeURIComponent(h.name + " " + citySearch)}`
      }));
      setHotelsList(enriched);
      setSelectedHotel(enriched[0]);
      if (enriched[0].rooms && enriched[0].rooms.length > 0) {
        setSelectedRoom(enriched[0].rooms[0]);
      }
    } else if (!hotelsLoading && hotels.length === 0) {
      // Fallback
      const key = (citySearch || "default").toLowerCase();
      const fallbackKey = Object.keys(fallbackHotels).find(k => key.includes(k)) || "default";
      const list = fallbackHotels[fallbackKey].map((h, idx) => ({
        ...h,
        key: `fallback_${h.name.toLowerCase().replace(/ /g, '_')}`,
        image: hotelImages[idx % hotelImages.length],
        website: `https://www.google.com/search?q=${encodeURIComponent(h.name + " " + citySearch)}`,
        rooms: [
          { type: "Standard Room", price: h.price, description: "Comfortable room with twin/queen bed." },
          { type: "Deluxe Room", price: Math.round(h.price * 1.4), description: "Spacious room with king bed and city view." },
          { type: "Royal Suite", price: Math.round(h.price * 2.2), description: "Luxurious suite with private lounge and breakfast." }
        ]
      }));
      setHotelsList(list);
      setSelectedHotel(list[0]);
      setSelectedRoom(list[0].rooms[0]);
    }
  }, [hotels, hotelsLoading, pkg]);

  // Fetch dynamic rates when selected hotel or travel date changes
  useEffect(() => {
    if (!selectedHotel || !selectedHotel.key || !travelDate) return;
    
    const chkIn = travelDate;
    const chkOut = addDaysToDateStr(travelDate, nights);
    
    if (chkIn && chkOut) {
      setRatesLoading(true);
      fetchRates(selectedHotel.key, chkIn, chkOut).finally(() => {
        setRatesLoading(false);
      });
    }
  }, [selectedHotel?.key, travelDate]);

  // Synchronize dynamic rates to selected hotel rooms list
  useEffect(() => {
    const ratesData = rates as any;
    if (ratesData && ratesData.success && ratesData.rates && ratesData.rates.length > 0 && selectedHotel && selectedHotel.key === ratesData.hotel_key) {
      const ratesMapped = ratesData.rates.map((r: any) => ({
        type: r.name,
        price: r.price || r.rate,
        description: r.description || `Live rate from ${r.name}.`
      }));
      
      setSelectedHotel((prev) => prev ? { ...prev, rooms: ratesMapped } : null);
      setSelectedRoom(ratesMapped[0]);
    }
  }, [rates, selectedHotel?.key]);

  if (!pkg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-main text-text-muted">
        <Loader2 className="w-8 h-8 animate-spin text-accent-primary" />
      </div>
    );
  }

  // Parse days & nights
  const days = parseInt(pkg.duration.match(/\d+/)?.[0] || "3", 10);
  const nights = Math.max(1, days - 1);

  // Guide daily rate varies depending on location
  const getGuideRateByLocation = (citySearch: string) => {
    const c = citySearch.toLowerCase();
    if (c.includes("jaipur") || c.includes("jodhpur") || c.includes("udaipur") || c.includes("rajasthan")) return 1500;
    if (c.includes("kochi") || c.includes("alleppey") || c.includes("munnar") || c.includes("kerala")) return 1000;
    if (c.includes("leh") || c.includes("ladakh")) return 1800;
    return 1200; // default
  };

  const citySearch = packageIdParam === "custom" 
    ? (searchParams.get("city") || "Bangalore") 
    : (pkg.id === 1 ? "Jaipur" : pkg.id === 2 ? "Kochi" : "Leh Ladakh");

  const dailyGuideRate = getGuideRateByLocation(citySearch);

  // Dynamic pricing calculation
  const baseCost = pkg.priceNum * travelers;
  const hotelNightly = selectedRoom ? selectedRoom.price : (selectedHotel ? selectedHotel.price : 0);
  const hotelTotal = hotelNightly * nights * travelers;

  // Local Guide Fee is optional (added if checked)
  const guideTotal = includeGuide ? (dailyGuideRate * days * travelers) : 0;

  // Flight Fee
  const flightTotal = selectedFlight && includeFlights ? (selectedFlight.price * travelers) : 0;

  // Subtotal before platform commission
  const subtotalBeforeCommission = baseCost + hotelTotal + guideTotal + flightTotal;
  
  // Platform Commission: 8%
  const commission = Math.round(subtotalBeforeCommission * 0.08);

  const subtotal = subtotalBeforeCommission + commission;
  
  // GST: 5%
  const gst = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + gst;

  const validateStep1 = () => {
    const errors: Record<string, string> = {};
    if (!fullName.trim()) errors.fullName = "Full name is required";
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) errors.email = "Please enter a valid email";
    if (!phone.trim() || phone.length < 10) errors.phone = "Valid 10-digit phone number is required";
    if (!travelDate) errors.travelDate = "Please choose a travel date";
    if (includeFlights && selectedFlight && selectedSeats.length !== travelers) {
      errors.selectedSeats = `Please select exactly ${travelers} seat${travelers > 1 ? "s" : ""} on your flight`;
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) {
      setStep(2);
    }
  };

  const [isProcessing, setIsProcessing] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      alert("Please sign in or register to complete your booking.");
      openAuthModal("login");
      return;
    }

    setIsProcessing(true);
    setCardError(null);

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      alert("Failed to load Razorpay payment gateway script. Please check your internet connection.");
      setIsProcessing(false);
      return;
    }

    try {
      // 1. Create Razorpay Order server-side
      const orderResp = await fetch(`${API_BASE_URL}/api/payment/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: grandTotal,
          currency: "INR"
        })
      });

      const orderData = await orderResp.json();
      if (!orderData.success) {
        alert("Failed to initialize payment: " + (orderData.error || "Order creation failed"));
        setIsProcessing(false);
        return;
      }

      const ref = "AERO-" + Math.floor(100000 + Math.random() * 900000);
      const flightInfoStr = includeFlights && selectedFlight 
        ? `${selectedFlight.airline} (${selectedFlight.from} → ${selectedFlight.to})${selectedFlight.flight_no ? ` [${selectedFlight.flight_no}]` : ''}${selectedSeats.length > 0 ? ` (Seats: ${selectedSeats.join(", ")})` : ''}` 
        : null;

      const bookingPayload = {
        reference_id: ref,
        guest_name: fullName,
        email: email,
        destination: citySearch,
        hotel_name: selectedHotel?.name || "None",
        room_type: selectedRoom?.type || "Standard Room",
        check_in: travelDate,
        check_out: addDaysToDateStr(travelDate, nights),
        guests: travelers,
        total_cost: grandTotal,
        flight_info: flightInfoStr,
      };

      // 2. Open Razorpay Checkout.js Widget
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "AeroTravel",
        description: pkg.title,
        order_id: orderData.id,
        prefill: {
          name: fullName,
          email: email,
          contact: phone
        },
        theme: {
          color: "#0284c7"
        },
        handler: async function (response: any) {
          setStep(3); // Show processing screen
          try {
            // 3. Verify signature server-side & book
            const verifyResp = await fetch(`${API_BASE_URL}/api/payment/verify-and-book`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id || orderData.id,
                razorpay_payment_id: response.razorpay_payment_id || `pay_demo_${Date.now()}`,
                razorpay_signature: response.razorpay_signature || "demo_signature",
                booking: bookingPayload
              })
            });

            const verifyData = await verifyResp.json();
            if (verifyData.success) {
              setBookingRef(verifyData.reference_id || ref);
              setStep(4); // Show digital boarding pass & invoice
            } else {
              alert("Payment verification failed: " + (verifyData.error || "Signature invalid"));
              setStep(2);
            }
          } catch (verifyErr) {
            console.error("Verification error:", verifyErr);
            alert("Verification failed due to a network error.");
            setStep(2);
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
          }
        }
      };

      const razorpayInstance = new (window as any).Razorpay(options);
      razorpayInstance.open();

    } catch (err) {
      console.error("Payment initialization error:", err);
      alert("Payment failed due to a network error. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-main py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Back navigation */}
        {step <= 2 && (
          <button
            onClick={() => step === 2 ? setStep(1) : router.push("/")}
            className="flex items-center gap-2 text-xs font-bold text-accent-primary uppercase tracking-widest hover:text-accent-sunset transition-colors mb-8 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            {step === 2 ? "Back to Details" : "Back to Packages"}
          </button>
        )}

        {/* Steps indicator */}
        {step < 3 && (
          <div className="flex justify-center mb-12">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  step >= 1 ? "bg-accent-primary text-white" : "bg-fg-main/10 text-text-muted"
                }`}>
                  1
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-fg-main">Traveler Details</span>
              </div>
              <div className="w-12 h-0.5 bg-border-color" />
              <div className="flex items-center gap-2">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  step === 2 ? "bg-accent-primary text-white" : "bg-fg-main/10 text-text-muted"
                }`}>
                  2
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Secure Payment</span>
              </div>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Form Side */}
              <div className="lg:col-span-7 bg-[#161B2C] rounded-md border border-[#C9A15A]/30 p-6 sm:p-8 space-y-8">
                <h2 className="font-heading font-black text-2xl text-fg-main tracking-tight mb-6 flex items-center gap-2">
                  <Users className="w-6 h-6 text-accent-sunset" />
                  Traveler & Accommodation Details
                </h2>

                <form onSubmit={handleNextToPayment} className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">Lead Traveler Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-3 rounded-md border border-[#C9A15A]/25 bg-[#0B0F1A] text-[#EDEAE2] text-sm focus:outline-none focus:border-[#C9A15A] focus:ring-1 focus:ring-[#C9A15A] transition-all placeholder:text-[#8A94A6]"
                    />
                    {formErrors.fullName && <p className="text-xs text-accent-sunset mt-1">{formErrors.fullName}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">Email Address</label>
                      <input
                        type="email"
                        placeholder="john@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-md border border-[#C9A15A]/25 bg-[#0B0F1A] text-[#EDEAE2] text-sm focus:outline-none focus:border-[#C9A15A] focus:ring-1 focus:ring-[#C9A15A] transition-all placeholder:text-[#8A94A6]"
                      />
                      {formErrors.email && <p className="text-xs text-accent-sunset mt-1">{formErrors.email}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">Phone Number</label>
                      <input
                        type="tel"
                        placeholder="e.g. 9876543210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-3 rounded-md border border-[#C9A15A]/25 bg-[#0B0F1A] text-[#EDEAE2] text-sm focus:outline-none focus:border-[#C9A15A] focus:ring-1 focus:ring-[#C9A15A] transition-all placeholder:text-[#8A94A6]"
                      />
                      {formErrors.phone && <p className="text-xs text-accent-sunset mt-1">{formErrors.phone}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">Departure Date</label>
                      <input
                        type="date"
                        value={travelDate}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => setTravelDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-md border border-[#C9A15A]/25 bg-[#0B0F1A] text-[#EDEAE2] text-sm focus:outline-none focus:border-[#C9A15A] focus:ring-1 focus:ring-[#C9A15A] transition-all placeholder:text-[#8A94A6]"
                      />
                      {formErrors.travelDate && <p className="text-xs text-accent-sunset mt-1">{formErrors.travelDate}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">No. of Travelers</label>
                      <div className="flex items-center border border-border-color rounded-xl h-11 overflow-hidden bg-card-bg">
                        <button
                          type="button"
                          onClick={() => setTravelers(prev => Math.max(1, prev - 1))}
                          className="flex-1 h-full text-lg font-bold text-text-muted hover:bg-fg-main/5 transition-colors cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-12 text-center text-sm font-bold">{travelers}</span>
                        <button
                          type="button"
                          onClick={() => setTravelers(prev => Math.min(10, prev + 1))}
                          className="flex-1 h-full text-lg font-bold text-text-muted hover:bg-fg-main/5 transition-colors cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Guide Toggle */}
                  <div className="p-4 rounded-md border border-[#C9A15A]/25 bg-[#0B0F1A] flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <input
                        id="include-guide"
                        type="checkbox"
                        checked={includeGuide}
                        onChange={(e) => setIncludeGuide(e.target.checked)}
                        className="w-4 h-4 text-accent-primary focus:ring-accent-primary border-gray-300 rounded mt-1 cursor-pointer"
                      />
                      <label htmlFor="include-guide" className="cursor-pointer">
                        <span className="block text-xs font-bold text-fg-main uppercase tracking-wider">Include Professional Tour Guide</span>
                        <span className="block text-[10px] text-text-muted mt-0.5">
                          Add local guide services at <strong className="text-accent-sunset">₹{dailyGuideRate.toLocaleString("en-IN")}/day</strong>. (Varies by destination)
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Hotel selection */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-3 flex justify-between">
                      <span>🏨 Select Hotel Accommodation</span>
                      {hotelsLoading && <span className="text-accent-primary animate-pulse text-[10px]">Loading hotels...</span>}
                    </label>
                    
                    <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto pr-1">
                      {hotelsList.map((hotel) => (
                        <div
                          key={hotel.name}
                          onClick={() => setSelectedHotel(hotel)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex gap-3.5 items-center ${
                            selectedHotel?.name === hotel.name
                              ? "border-accent-primary bg-accent-primary/5 ring-1 ring-accent-primary"
                              : "border-border-color bg-card-bg hover:bg-fg-main/5"
                          }`}
                        >
                          <img
                            src={hotel.image || hotelImages[0]}
                            alt={hotel.name}
                            className="w-14 h-14 rounded-lg object-cover shrink-0 border border-border-color"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-1">
                              <h4 className="text-xs font-bold text-fg-main truncate">{hotel.name}</h4>
                              {hotel.website && (
                                <a
                                  href={hotel.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-accent-primary hover:text-accent-sunset p-1"
                                  title="View Hotel Website & Photos"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                            <p className="text-[10px] text-text-muted truncate mt-0.5">{hotel.address}</p>
                            <span className="text-[9px] text-accent-sunset font-bold block mt-1">⭐ {hotel.rating} Rating</span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-xs font-extrabold text-accent-sunset block">₹{hotel.price.toLocaleString("en-IN")}</span>
                            <span className="text-[9px] text-text-muted">/ night</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Room Option Selection */}
                  {selectedHotel && selectedHotel.rooms && (
                    <div className="space-y-3">
                      <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2 flex justify-between items-center">
                        <span>🛌 Select Room Option</span>
                        {ratesLoading && (
                          <span className="text-accent-primary animate-pulse text-[10px] flex items-center gap-1 font-normal lowercase">
                            <Loader2 className="w-3 h-3 animate-spin" /> Fetching live rates...
                          </span>
                        )}
                      </label>
                      <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto pr-1">
                        {selectedHotel.rooms.map((room) => (
                          <div
                            key={room.type}
                            onClick={() => setSelectedRoom(room)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${
                              selectedRoom?.type === room.type
                                ? "border-accent-primary bg-accent-primary/5 ring-1 ring-accent-primary"
                                : "border-border-color bg-card-bg hover:bg-fg-main/5"
                            }`}
                          >
                            <div className="min-w-0 flex-1 pr-3 text-left">
                              <h5 className="text-xs font-bold text-fg-main">{room.type}</h5>
                              <p className="text-[10px] text-text-muted mt-0.5 leading-relaxed">{room.description}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-xs font-extrabold text-accent-sunset block">₹{room.price.toLocaleString("en-IN")}</span>
                              <span className="text-[9px] text-text-muted">/ night</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Flight Options */}
                  <div className="p-4 rounded-md border border-[#C9A15A]/25 bg-[#0B0F1A] flex flex-col gap-4 mb-6">
                    <div className="flex items-start gap-3">
                      <input
                        id="include-flights"
                        type="checkbox"
                        checked={includeFlights}
                        onChange={(e) => {
                          setIncludeFlights(e.target.checked);
                          if (!e.target.checked) setSelectedFlight(null);
                        }}
                        className="w-4 h-4 text-accent-primary focus:ring-accent-primary border-gray-300 rounded mt-1 cursor-pointer"
                      />
                      <label htmlFor="include-flights" className="cursor-pointer">
                        <span className="block text-xs font-bold text-fg-main uppercase tracking-wider flex items-center gap-1"><PlaneTakeoff className="w-3.5 h-3.5" /> Include Flights</span>
                        <span className="block text-[10px] text-text-muted mt-0.5">
                          Search and book flights to your destination.
                        </span>
                      </label>
                    </div>

                    {includeFlights && (
                      <div className="pl-7 space-y-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">Flying From (Origin)</label>
                          <select
                            value={originCityIata}
                            onChange={(e) => setOriginCityIata(e.target.value)}
                            className="w-full px-4 py-3 rounded-md border border-[#C9A15A]/25 bg-[#0B0F1A] text-[#EDEAE2] text-sm focus:outline-none focus:border-[#C9A15A] focus:ring-1 focus:ring-[#C9A15A] transition-all placeholder:text-[#8A94A6]"
                          >
                            <option value="">Select Origin City</option>
                            {cities.map(c => (
                              <option key={c.iata} value={c.iata}>{c.city} ({c.iata})</option>
                            ))}
                          </select>
                        </div>

                        {originCityIata && travelDate && flightsLoading && (
                          <div className="flex items-center gap-2 text-accent-primary text-xs animate-pulse">
                            <Loader2 className="w-4 h-4 animate-spin" /> Searching live flights...
                          </div>
                        )}

                        {/* Hint when city chosen but no date set yet */}
                        {originCityIata && !travelDate && (
                          <p className="text-xs text-text-muted bg-fg-main/5 border border-border-color rounded-lg px-3 py-2">
                            ✈️ Please select a <strong>Departure Date</strong> above to search available flights.
                          </p>
                        )}

                        {originCityIata && travelDate && !flightsLoading && availableFlights.length === 0 && (
                          <p className="text-xs text-accent-sunset">No flights found for this route/date. Try a different date or origin city.</p>
                        )}

                        {availableFlights.length > 0 && (
                          <div className="space-y-3">
                            <label className="block text-xs font-bold uppercase tracking-wider text-text-muted">Select Flight</label>
                            <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto pr-1">
                              {availableFlights.map(flight => (
                                <div
                                  key={flight.offer_id}
                                  onClick={() => setSelectedFlight(flight)}
                                  className={`p-3 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${
                                    selectedFlight?.offer_id === flight.offer_id
                                      ? "border-accent-primary bg-accent-primary/5 ring-1 ring-accent-primary"
                                      : "border-border-color bg-card-bg hover:bg-fg-main/5"
                                  }`}
                                >
                                  <div className="min-w-0 flex-1 pr-3 text-left">
                                    <h5 className="text-xs font-bold text-fg-main truncate">{flight.airline} {flight.flight_no ? `(${flight.flight_no})` : ''}</h5>
                                    <p className="text-[10px] text-text-muted mt-0.5">{flight.departs.substring(11, 16)} - {flight.arrives.substring(11, 16)} • {flight.duration.replace("PT", "").toLowerCase()}</p>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <span className="text-xs font-extrabold text-accent-sunset block">₹{flight.price.toLocaleString("en-IN")}</span>
                                    <span className="text-[9px] text-text-muted">per person</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            {selectedFlight && (
                              <div className="mt-4 space-y-2">
                                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted">
                                  Seat Selection
                                </label>
                                {selectedSeats.length === 0 ? (
                                  <div>
                                    <button
                                      type="button"
                                      onClick={() => setShowSeatMap(true)}
                                      className="w-full py-3 px-4 rounded-xl border border-dashed border-accent-primary text-accent-primary hover:bg-accent-primary/5 transition-all text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                      <Armchair className="w-4 h-4" />
                                      Choose {travelers} Seat{travelers > 1 ? "s" : ""}
                                    </button>
                                  </div>
                                ) : (
                                  <div className="p-3.5 rounded-md border border-[#C9A15A]/25 bg-[#0B0F1A]/50 flex justify-between items-center gap-4">
                                    <div className="flex flex-wrap gap-2">
                                      {selectedSeats.map(seat => (
                                        <span key={seat} className="px-2.5 py-1 rounded bg-accent-primary text-white text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                                          <Armchair className="w-3 h-3" />
                                          Seat {seat}
                                        </span>
                                      ))}
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setShowSeatMap(true)}
                                      className="text-xs font-bold text-accent-primary hover:text-accent-sunset transition-colors cursor-pointer"
                                    >
                                      Change Seats
                                    </button>
                                  </div>
                                )}
                                {formErrors.selectedSeats && (
                                  <p className="text-xs text-accent-sunset mt-1 flex items-center gap-1">
                                    <span>⚠️</span> {formErrors.selectedSeats}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Domestic Train Options (Multi-Modal) */}
                    <div className="p-4 rounded-md border border-[#C9A15A]/25 bg-[#0B0F1A] flex flex-col gap-4 mb-6">
                      <div className="flex items-start gap-3">
                        <input
                          id="include-trains"
                          type="checkbox"
                          checked={includeTrains}
                          onChange={(e) => {
                            setIncludeTrains(e.target.checked);
                            if (!e.target.checked) setSelectedTrain(null);
                          }}
                          className="w-4 h-4 text-accent-primary focus:ring-accent-primary border-gray-300 rounded mt-1 cursor-pointer"
                        />
                        <label htmlFor="include-trains" className="cursor-pointer">
                          <span className="block text-xs font-bold text-fg-main uppercase tracking-wider flex items-center gap-1.5">
                            <Train className="w-4 h-4 text-emerald-400" /> Multi-Modal Domestic Trains (Shatabdi / Vande Bharat)
                          </span>
                          <span className="block text-[10px] text-text-muted mt-0.5">
                            Explore rail connections between {originCityIata || "Origin"} and {citySearch}.
                          </span>
                        </label>
                      </div>

                      {includeTrains && (
                        <div className="pl-7 space-y-4">
                          {/* Prominent Unofficial Data Disclaimer */}
                          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 space-y-1">
                            <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-300">
                              <span>⚡ UNOFFICIAL / THIRD-PARTY RAIL DATA</span>
                              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-[8px]">NO UPTIME GUARANTEE</span>
                            </div>
                            <p className="text-[10px] text-amber-200/90 leading-relaxed">
                              IRCTC does not provide a public open API. Train schedules and fares are retrieved via unofficial third-party data providers for informational trip-planning purposes only.
                            </p>
                          </div>

                          {trainsLoading ? (
                            <div className="flex items-center gap-2 text-accent-primary text-xs animate-pulse">
                              <Loader2 className="w-4 h-4 animate-spin" /> Searching Indian Railways schedules...
                            </div>
                          ) : availableTrains.length > 0 ? (
                            <div className="space-y-3">
                              <label className="block text-xs font-bold uppercase tracking-wider text-text-muted">Available Train Schedules</label>
                              <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto pr-1">
                                {availableTrains.map((train) => (
                                  <div
                                    key={train.train_number}
                                    onClick={() => setSelectedTrain(train)}
                                    className={`p-3 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${
                                      selectedTrain?.train_number === train.train_number
                                        ? "border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500"
                                        : "border-border-color bg-card-bg hover:bg-fg-main/5"
                                    }`}
                                  >
                                    <div className="min-w-0 flex-1 pr-3 text-left">
                                      <h5 className="text-xs font-bold text-fg-main truncate">{train.train_name} ({train.train_number})</h5>
                                      <p className="text-[10px] text-text-muted mt-0.5">
                                        {train.departure_time} → {train.arrival_time} ({train.duration}) • {train.classes.join(", ")}
                                      </p>
                                      <span className="text-[9px] text-amber-400/80 font-mono mt-1 block">⚡ Unofficial Third-Party Schedule</span>
                                    </div>
                                    <div className="text-right shrink-0">
                                      <span className="text-xs font-extrabold text-emerald-400 block">₹{train.fare_min.toLocaleString("en-IN")} - ₹{train.fare_max.toLocaleString("en-IN")}</span>
                                      <span className="text-[9px] text-text-muted">est. fare</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-text-muted">No train schedules found for this route.</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!selectedHotel || !selectedRoom}
                    className="w-full py-4 rounded-xl bg-accent-primary hover:bg-accent-sunset text-white text-sm font-bold shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-95 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-55 disabled:cursor-not-allowed"
                  >
                    Proceed to Secure Payment
                  </button>
                </form>
              </div>

              {/* Summary Side */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-[#161B2C] rounded-md border border-[#C9A15A]/30 p-6 overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#C9A15A]/8 rounded-full blur-2xl pointer-events-none" />
                  <div className="relative h-44 rounded-2xl overflow-hidden mb-6">
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${pkg.image})` }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-accent-primary mb-1 inline-block">
                        {pkg.duration}
                      </span>
                      <h3 className="font-heading font-black text-lg tracking-tight leading-snug">{pkg.title}</h3>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-2.5 items-start text-xs text-text-muted">
                      <MapPin className="w-4 h-4 text-accent-sunset shrink-0 mt-0.5" />
                      <span>{pkg.destination}</span>
                    </div>

                    <div className="border-t border-dashed border-border-color my-4" />

                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-fg-main mb-3">Inclusions</h4>
                      <ul className="space-y-2">
                        {pkg.inclusions.map((inc, i) => (
                          <li key={i} className="flex gap-2 text-[11px] text-text-muted">
                            <span className="text-accent-emerald">✓</span>
                            <span>{inc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="border-t border-dashed border-border-color my-4" />

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-text-muted">
                        <span>Base Package ({travelers} pax)</span>
                        <span>₹{baseCost.toLocaleString("en-IN")}</span>
                      </div>
                      {selectedHotel && (
                        <div className="flex justify-between text-xs text-text-muted">
                          <span className="truncate max-w-[180px]">Hotel: {selectedHotel.name} ({selectedRoom?.type || "Standard Room"}) ({nights} nights)</span>
                          <span>₹{hotelTotal.toLocaleString("en-IN")}</span>
                        </div>
                      )}
                      {includeGuide && (
                        <div className="flex justify-between text-xs text-text-muted">
                          <span>Local Guide Fee ({days} Days)</span>
                          <span>₹{guideTotal.toLocaleString("en-IN")}</span>
                        </div>
                      )}
                      {includeFlights && selectedFlight && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-text-muted">
                            <span className="truncate max-w-[180px]">Flight: {selectedFlight.airline} ({selectedFlight.from} → {selectedFlight.to})</span>
                            <span>₹{flightTotal.toLocaleString("en-IN")}</span>
                          </div>
                          {selectedSeats.length > 0 && (
                            <div className="flex justify-between text-[10px] text-text-muted pl-4">
                              <span>Selected Seats:</span>
                              <span className="font-semibold text-accent-primary">{selectedSeats.join(", ")}</span>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="flex justify-between text-xs text-text-muted">
                        <span>Platform Commission (8%)</span>
                        <span>₹{commission.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between text-xs text-text-muted">
                        <span>GST (5%)</span>
                        <span>₹{gst.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between items-end pt-2 border-t border-border-color">
                        <span className="text-sm font-bold text-fg-main">Total Amount</span>
                        <span className="text-xl font-black text-accent-sunset">₹{grandTotal.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-2xl bg-fg-main/5 border border-border-color">
                  <ShieldCheck className="w-8 h-8 text-accent-emerald shrink-0" />
                  <p className="text-[10px] text-text-muted leading-relaxed">
                    <strong>100% Protected Bookings.</strong> Your transaction is encrypted with 256-bit SSL technology. Free cancellation up to 7 days before departure.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Payment Methods Side */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-[#161B2C] rounded-md border border-[#C9A15A]/30 p-6 sm:p-8">
                  <h2 className="font-heading font-black text-2xl text-fg-main tracking-tight mb-6 flex items-center gap-2">
                    <CreditCard className="w-6 h-6 text-accent-sunset" />
                    Select Payment Method
                  </h2>

                  {/* Switcher Tab */}
                  <div className="flex gap-2 p-1.5 rounded-2xl bg-fg-main/5 border border-border-color mb-8">
                    <button
                      onClick={() => setPaymentMethod("card")}
                      className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        paymentMethod === "card" ? "bg-bg-main text-accent-primary shadow-sm" : "text-text-muted hover:text-fg-main"
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      Card
                    </button>
                    <button
                      onClick={() => setPaymentMethod("upi")}
                      className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        paymentMethod === "upi" ? "bg-bg-main text-accent-primary shadow-sm" : "text-text-muted hover:text-fg-main"
                      }`}
                    >
                      <QrCode className="w-4 h-4" />
                      UPI
                    </button>
                    <button
                      onClick={() => setPaymentMethod("netbanking")}
                      className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        paymentMethod === "netbanking" ? "bg-bg-main text-accent-primary shadow-sm" : "text-text-muted hover:text-fg-main"
                      }`}
                    >
                      <Building className="w-4 h-4" />
                      NetBanking
                    </button>
                  </div>

                  <form onSubmit={handlePay} className="space-y-6">
                    {paymentMethod === "card" && (
                      <div className="space-y-6">
                        {/* Razorpay Test Mode Banner */}
                        <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-start gap-3 shadow-inner">
                          <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5 text-sky-400" />
                          <div className="space-y-1.5 text-xs">
                            <div className="font-extrabold uppercase tracking-wider text-sky-300 flex items-center gap-1.5">
                              <span>💳 RAZORPAY TEST MODE GATEWAY</span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-500/20 border border-sky-400/30">SANDBOX</span>
                            </div>
                            <p className="text-[11px] opacity-90 leading-relaxed text-sky-200/90">
                              Clicking below will launch Razorpay&apos;s secure test checkout widget. You can use Razorpay&apos;s built-in test credentials (e.g. 4111 1111 1111 1111) or test UPI. Payment signature is verified server-side.
                            </p>
                          </div>
                        </div>

                        {cardError && (
                          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold text-center">
                            {cardError}
                          </div>
                        )}
                      </div>
                    )}

                    {paymentMethod === "upi" && (
                      <div className="space-y-6 text-center">
                        <div className="bg-fg-main/5 p-6 rounded-2xl border border-border-color max-w-sm mx-auto flex flex-col items-center">
                          {/* Fake QR Code */}
                          <div className="w-40 h-40 bg-white border border-border-color rounded-xl p-3 shadow-md flex items-center justify-center mb-4">
                            <QrCode className="w-full h-full text-slate-800" />
                          </div>
                          <span className="text-xs text-text-muted font-bold block mb-1">Scan QR Code with BHIM / GPay / PhonePe</span>
                          <span className="text-[10px] text-accent-sunset font-bold uppercase tracking-widest animate-pulse">Waiting for scan...</span>
                        </div>

                        <div className="text-text-muted text-xs">or pay using UPI ID</div>
                        
                        <div className="max-w-md mx-auto">
                          <input
                            type="text"
                            placeholder="username@okaxis"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            className="w-full px-4 py-3 rounded-md border border-[#C9A15A]/25 bg-[#0B0F1A] text-[#EDEAE2] text-sm focus:outline-none focus:border-[#C9A15A] focus:ring-1 focus:ring-[#C9A15A] transition-all text-center placeholder:text-[#8A94A6]"
                          />
                        </div>
                      </div>
                    )}

                    {paymentMethod === "netbanking" && (
                      <div className="space-y-4">
                        <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">Select Your Bank</label>
                        <select className="w-full px-4 py-3 rounded-md border border-[#C9A15A]/25 bg-[#0B0F1A] text-[#EDEAE2] text-sm focus:outline-none focus:border-[#C9A15A] focus:ring-1 focus:ring-[#C9A15A] transition-all">
                          <option>SBI (State Bank of India)</option>
                          <option>HDFC Bank</option>
                          <option>ICICI Bank</option>
                          <option>Axis Bank</option>
                          <option>Kotak Mahindra Bank</option>
                        </select>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full py-4 rounded-xl bg-accent-emerald hover:bg-accent-sunset text-white text-sm font-bold shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-95 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Opening Razorpay Gateway...
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          Pay with Razorpay (Test Mode) — ₹{grandTotal.toLocaleString("en-IN")}
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>

              {/* Order Summary Side */}
              <div className="lg:col-span-5 bg-[#161B2C] rounded-md border border-[#C9A15A]/30 p-6 h-fit">
                <h3 className="font-heading font-black text-lg text-fg-main tracking-tight mb-4">Booking Summary</h3>
                <div className="space-y-3 text-xs text-text-muted mb-6">
                  <div className="flex justify-between">
                    <span>Package:</span>
                    <strong className="text-fg-main">{pkg.title}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Traveler:</span>
                    <strong className="text-fg-main">{fullName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Departure Date:</span>
                    <strong className="text-fg-main">{travelDate}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Pax:</span>
                    <strong className="text-fg-main">{travelers} {travelers > 1 ? "Travelers" : "Traveler"}</strong>
                  </div>
                  {includeFlights && selectedFlight && (
                    <>
                      <div className="flex justify-between">
                        <span>Flight Route:</span>
                        <strong className="text-fg-main">{selectedFlight.from} → {selectedFlight.to}</strong>
                      </div>
                      {selectedSeats.length > 0 && (
                        <div className="flex justify-between">
                          <span>Flight Seats:</span>
                          <strong className="text-accent-primary uppercase">{selectedSeats.join(", ")}</strong>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="border-t border-dashed border-border-color pt-4 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Base Package</span>
                    <span>₹{baseCost.toLocaleString("en-IN")}</span>
                  </div>
                  {selectedHotel && (
                    <div className="flex justify-between text-xs">
                      <span>Hotel stay ({nights} nights)</span>
                      <span>₹{hotelTotal.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  {includeGuide && (
                    <div className="flex justify-between text-xs">
                      <span>Local Guide Fee</span>
                      <span>₹{guideTotal.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs">
                    <span>Platform Commission (8%)</span>
                    <span>₹{commission.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>GST (5%)</span>
                    <span>₹{gst.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-base font-extrabold text-fg-main pt-2 border-t border-border-color">
                    <span>Total Amount</span>
                    <span className="text-accent-sunset">₹{grandTotal.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="relative w-24 h-24 mb-8">
                <div className="absolute inset-0 rounded-full border-4 border-accent-primary/10" />
                <Loader2 className="w-full h-full text-accent-primary animate-spin" />
              </div>
              <h2 className="font-heading font-black text-2xl text-fg-main tracking-tight mb-2">Authorizing Payment</h2>
              <p className="text-sm text-text-muted max-w-sm">
                Please do not refresh this page or click back. We are communicating with your bank to secure your booking.
              </p>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto text-center"
            >
              {/* Premium Ticket Receipt Presentation */}
              <div className="bg-[#161B2C] rounded-md border border-[#C9A15A]/40 overflow-hidden shadow-document relative">
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-accent-primary to-accent-sunset p-8 text-white">
                  <CheckCircle2 className="w-14 h-14 mx-auto mb-4 drop-shadow-md text-white" />
                  <h2 className="font-heading font-black text-3xl tracking-tight mb-2">Booking Confirmed!</h2>
                  <p className="text-white/80 text-xs uppercase tracking-widest font-bold">
                    Booking Reference: {bookingRef}
                  </p>
                </div>

                {/* Ticket Details */}
                <div className="p-8 space-y-6 text-left relative">
                  {/* Earned Stamp Seal */}
                  <StampSeal className="absolute top-4 right-6 z-20 hidden sm:inline-flex" />

                  <div className="grid grid-cols-2 gap-6 pt-4">
                    <div>
                      <span className="text-[10px] text-text-muted uppercase tracking-widest font-bold block">Lead Traveler</span>
                      <span className="text-sm font-bold text-fg-main">{fullName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-text-muted uppercase tracking-widest font-bold block">Destination</span>
                      <span className="text-sm font-bold text-fg-main">{pkg.title.split(" ")[0]}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-text-muted uppercase tracking-widest font-bold block">Hotel Accommodation</span>
                      <span className="text-sm font-bold text-fg-main truncate block" title={selectedHotel?.name}>
                        🏨 {selectedHotel?.name || "Arranged"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-text-muted uppercase tracking-widest font-bold block">Travel Date</span>
                      <span className="text-sm font-bold text-fg-main flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-accent-primary" />
                        {travelDate}
                      </span>
                    </div>
                    {includeFlights && selectedFlight && (
                      <div className="col-span-2">
                        <span className="text-[10px] text-text-muted uppercase tracking-widest font-bold block">Flight Details</span>
                        <span className="text-sm font-bold text-fg-main truncate block" title={`${selectedFlight.airline} (${selectedFlight.from} → ${selectedFlight.to})`}>
                          ✈️ {selectedFlight.airline} ({selectedFlight.from} → {selectedFlight.to}){selectedFlight.flight_no ? ` - ${selectedFlight.flight_no}` : ''} (Seats: {selectedSeats.join(", ")})
                        </span>
                      </div>
                    )}
                  </div>

                  <TicketDivider />

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-fg-main uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-accent-sunset" />
                      Trip Highlights Included
                    </h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {pkg.inclusions.slice(0, 4).map((inc, i) => (
                        <li key={i} className="flex gap-2 text-[11px] text-text-muted">
                          <span className="text-accent-emerald">✓</span>
                          <span>{inc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-t border-border-color pt-6 flex justify-between items-center bg-fg-main/5 p-4 rounded-xl">
                    <div>
                      <span className="text-[9px] text-text-muted uppercase tracking-widest block">Amount Paid</span>
                      <span className="text-xs text-text-muted font-bold">Secure Netbanking/Card</span>
                    </div>
                    <span className="text-2xl font-black text-accent-emerald">
                      ₹{grandTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  type="button"
                  onClick={() => setShowBrochure(true)}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary text-white text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Compass className="w-4 h-4 animate-spin-slow" />
                  View Navigation Brochure
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-md border border-[#C9A15A]/30 bg-[#161B2C] hover:border-[#C9A15A]/60 text-[#8A94A6] hover:text-[#EDEAE2] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Go Back to Dashboard
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Plane Cabin Seating Selection Modal */}
        <AnimatePresence>
          {showSeatMap && selectedFlight && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-card-bg border border-border-color rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden text-left"
              >
                {/* Header */}
                <div className="p-6 border-b border-border-color flex justify-between items-center bg-fg-main/5">
                  <div>
                    <h3 className="font-heading font-black text-xl text-fg-main tracking-tight flex items-center gap-2">
                      <PlaneTakeoff className="w-5 h-5 text-accent-primary" />
                      Select Cabin Seats
                    </h3>
                    <p className="text-xs text-text-muted mt-1">
                      {selectedFlight.airline} • {selectedFlight.from} → {selectedFlight.to} • {travelers} Traveler{travelers > 1 ? "s" : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowSeatMap(false)}
                    className="p-2 rounded-xl bg-fg-main/5 hover:bg-fg-main/10 text-text-muted hover:text-fg-main transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Legend */}
                <div className="px-6 py-3 border-b border-border-color flex flex-wrap gap-4 text-[10px] uppercase font-bold tracking-wider justify-center bg-fg-main/[0.02]">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-accent-emerald/20 border border-accent-emerald text-accent-emerald flex items-center justify-center font-bold text-[8px]">
                      A
                    </div>
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-accent-primary border border-accent-primary text-white flex items-center justify-center font-bold text-[8px]">
                      ✓
                    </div>
                    <span>Selected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-fg-main/10 border border-border-color text-text-muted flex items-center justify-center font-bold text-[8px] opacity-55">
                      ✕
                    </div>
                    <span>Occupied</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4.5 h-4.5 rounded border border-dashed border-accent-sunset/60 text-accent-sunset font-extrabold text-[8px] flex items-center justify-center">
                      ★
                    </div>
                    <span>Business Class</span>
                  </div>
                </div>

                {/* Main Cabin scroll view */}
                <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center select-none bg-bg-main/30">
                  {/* Plane nose top illustration */}
                  <div className="w-64 h-16 border-t-2 border-x-2 border-border-color rounded-t-[80px] bg-card-bg flex flex-col items-center justify-end pb-2 relative mb-6 shadow-sm">
                    <div className="absolute top-4 w-12 h-1 bg-border-color/30 rounded-full" />
                    <div className="flex gap-14 mt-1">
                      <div className="w-8 h-2 bg-fg-main/5 border border-border-color/40 rounded-tl-full rounded-tr-md rotate-[-5deg]" />
                      <div className="w-8 h-2 bg-fg-main/5 border border-border-color/40 rounded-tr-full rounded-tl-md rotate-[5deg]" />
                    </div>
                    <span className="text-[9px] font-extrabold tracking-widest text-text-muted mt-2 uppercase">Cockpit</span>
                  </div>

                  {/* Airplane Body / Seating Grid container */}
                  <div className="w-80 border-x-2 border-border-color bg-card-bg p-4 flex flex-col items-center relative shadow-sm">
                    {/* Wings indicator */}
                    <div className="absolute left-[-40px] top-[30%] w-10 h-32 border-l-2 border-y-2 border-border-color rounded-l-2xl bg-card-bg shadow-sm flex items-center justify-center" style={{ writingMode: "vertical-rl" }}>
                      <span className="text-[8px] font-black tracking-widest text-text-muted select-none uppercase rotate-180">Left Wing</span>
                    </div>
                    <div className="absolute right-[-40px] top-[30%] w-10 h-32 border-r-2 border-y-2 border-border-color rounded-r-2xl bg-card-bg shadow-sm flex items-center justify-center" style={{ writingMode: "vertical-rl" }}>
                      <span className="text-[8px] font-black tracking-widest text-text-muted select-none uppercase">Right Wing</span>
                    </div>

                    {/* Cabin Divider / Business label */}
                    <div className="w-full flex items-center justify-center gap-2 mb-4">
                      <div className="h-[1px] bg-border-color flex-1" />
                      <span className="text-[9px] font-extrabold text-accent-sunset tracking-wider uppercase">Business Class</span>
                      <div className="h-[1px] bg-border-color flex-1" />
                    </div>

                    {/* Seating Map columns labels */}
                    <div className="grid grid-cols-5 gap-2 w-full mb-3 text-center text-xs font-black text-text-muted">
                      <div>A</div>
                      <div>C</div>
                      <div className="text-[9px] font-bold text-text-muted/60">Aisle</div>
                      <div>D</div>
                      <div>F</div>
                    </div>

                    {/* Business Class Seating rows 1-3 */}
                    {Array.from({ length: 3 }).map((_, rIdx) => {
                      const rowNum = rIdx + 1;
                      const occupied = generateOccupiedSeats(selectedFlight.offer_id);
                      return (
                        <div key={`row-${rowNum}`} className="grid grid-cols-5 gap-2 items-center w-full mb-3">
                          {["A", "C", "_aisle", "D", "F"].map((col) => {
                            if (col === "_aisle") {
                              return <div key={`row-${rowNum}-aisle`} className="text-center font-bold text-[10px] text-text-muted/60">{rowNum}</div>;
                            }
                            const seatId = `${rowNum}${col}`;
                            const isOccupied = occupied.has(seatId);
                            const isSelected = selectedSeats.includes(seatId);

                            return (
                              <button
                                key={seatId}
                                type="button"
                                disabled={isOccupied}
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedSeats(selectedSeats.filter(s => s !== seatId));
                                  } else {
                                    if (selectedSeats.length >= travelers) {
                                      if (travelers === 1) {
                                        setSelectedSeats([seatId]);
                                      } else {
                                        setSelectedSeats([...selectedSeats.slice(1), seatId]);
                                      }
                                    } else {
                                      setSelectedSeats([...selectedSeats, seatId]);
                                    }
                                  }
                                }}
                                className={`h-11 rounded-lg border flex flex-col items-center justify-center transition-all ${
                                  isOccupied 
                                    ? "bg-fg-main/5 border-border-color text-text-muted/30 cursor-not-allowed opacity-55"
                                    : isSelected
                                      ? "bg-accent-primary border-accent-primary text-white shadow-md ring-2 ring-accent-primary/20 scale-[1.05]"
                                      : "bg-accent-sunset/5 hover:bg-accent-sunset/15 border-accent-sunset/45 text-accent-sunset hover:scale-[1.03] cursor-pointer"
                                }`}
                              >
                                <span className="text-[10px] font-black">{seatId}</span>
                                <span className="text-[8px] font-medium leading-none opacity-85">₹2.5K</span>
                              </button>
                            );
                          })}
                        </div>
                      );
                    })}

                    {/* Cabin Divider / Economy label */}
                    <div className="w-full flex items-center justify-center gap-2 my-4">
                      <div className="h-[1px] bg-border-color flex-1" />
                      <span className="text-[9px] font-extrabold text-accent-primary tracking-wider uppercase">Economy Class</span>
                      <div className="h-[1px] bg-border-color flex-1" />
                    </div>

                    {/* Seating Map Economy columns labels */}
                    <div className="grid grid-cols-7 gap-1.5 w-full mb-3 text-center text-xs font-black text-text-muted">
                      <div>A</div>
                      <div>B</div>
                      <div>C</div>
                      <div className="text-[8px] font-bold text-text-muted/60">Aisle</div>
                      <div>D</div>
                      <div>E</div>
                      <div>F</div>
                    </div>

                    {/* Economy Class Seating rows 4-25 */}
                    {Array.from({ length: 22 }).map((_, rIdx) => {
                      const rowNum = rIdx + 4;
                      const occupied = generateOccupiedSeats(selectedFlight.offer_id);
                      const isExitRow = rowNum === 10 || rowNum === 18;
                      
                      return (
                        <div key={`row-${rowNum}`} className={`grid grid-cols-7 gap-1.5 items-center w-full ${isExitRow ? "my-4 py-2 border-y border-dashed border-border-color/50 relative" : "mb-2"}`}>
                          {isExitRow && (
                            <span className="absolute top-[-8px] left-1 bg-card-bg px-1.5 text-[8px] font-bold text-accent-sunset uppercase tracking-widest border border-border-color/55 rounded-full select-none">
                              Exit Row (Extra Legroom)
                            </span>
                          )}
                          {["A", "B", "C", "_aisle", "D", "E", "F"].map((col) => {
                            if (col === "_aisle") {
                              return <div key={`row-${rowNum}-aisle`} className="text-center font-bold text-[9px] text-text-muted/60">{rowNum}</div>;
                            }
                            const seatId = `${rowNum}${col}`;
                            const isOccupied = occupied.has(seatId);
                            const isSelected = selectedSeats.includes(seatId);

                            return (
                              <button
                                key={seatId}
                                type="button"
                                disabled={isOccupied}
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedSeats(selectedSeats.filter(s => s !== seatId));
                                  } else {
                                    if (selectedSeats.length >= travelers) {
                                      if (travelers === 1) {
                                        setSelectedSeats([seatId]);
                                      } else {
                                        setSelectedSeats([...selectedSeats.slice(1), seatId]);
                                      }
                                    } else {
                                      setSelectedSeats([...selectedSeats, seatId]);
                                    }
                                  }
                                }}
                                className={`h-8 rounded border flex items-center justify-center transition-all ${
                                  isOccupied 
                                    ? "bg-fg-main/5 border-border-color text-text-muted/30 cursor-not-allowed opacity-55"
                                    : isSelected
                                      ? "bg-accent-primary border-accent-primary text-white shadow shadow-accent-primary/20 ring-1 ring-accent-primary/20 scale-[1.05]"
                                      : "bg-accent-emerald/5 hover:bg-accent-emerald/15 border-accent-emerald/35 text-accent-emerald hover:scale-[1.03] cursor-pointer"
                                }`}
                              >
                                <span className="text-[9px] font-extrabold">{seatId}</span>
                              </button>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>

                  {/* Plane tail bottom illustration */}
                  <div className="w-64 h-12 border-b-2 border-x-2 border-border-color rounded-b-[40px] bg-card-bg flex items-center justify-center relative mt-6 shadow-sm">
                    {/* Tail fin indicators */}
                    <div className="absolute bottom-[-15px] w-2 h-6 border-x border-b border-border-color bg-card-bg rounded-b" />
                    <span className="text-[9px] font-extrabold tracking-widest text-text-muted uppercase">Cabin End</span>
                  </div>
                </div>

                {/* Footer status tracker */}
                <div className="p-6 border-t border-border-color bg-fg-main/5 flex justify-between items-center gap-4">
                  <div className="text-left">
                    <span className="text-[10px] text-text-muted uppercase font-bold block">Travelers Seating Status</span>
                    <span className="text-sm font-bold text-fg-main">
                      {selectedSeats.length === 0 
                        ? `Select ${travelers} seat${travelers > 1 ? "s" : ""}` 
                        : selectedSeats.length < travelers
                          ? `Selected ${selectedSeats.length} of ${travelers} seats`
                          : `All ${travelers} seats selected: ${selectedSeats.join(", ")}`
                      }
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedSeats.length === travelers) {
                        setShowSeatMap(false);
                      }
                    }}
                    disabled={selectedSeats.length !== travelers}
                    className="px-6 py-2.5 rounded-xl bg-accent-primary hover:bg-accent-sunset text-white text-xs font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-55 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Confirm Selection
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Interactive Navigation Brochure Modal */}
        <AnimatePresence>
          {showBrochure && pkg && (
            <NavigationBrochure
              destinationName={pkg.title}
              onClose={() => setShowBrochure(false)}
            />
          )}
        </AnimatePresence>
      </div>
      
      {/* Visual perspective styling injected */}
      <style jsx global>{`
        .perspective {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotateY-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-bg-main text-text-muted">
        <Loader2 className="w-8 h-8 animate-spin text-accent-primary" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
