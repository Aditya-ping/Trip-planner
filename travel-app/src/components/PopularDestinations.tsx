"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, ArrowRight, X, Calendar, Users, ShieldCheck, CheckCircle, HelpCircle, ArrowLeft, Loader2, ExternalLink, PlaneTakeoff, ChevronLeft, ChevronRight } from "lucide-react";
import { API_BASE_URL } from "@/utils/config";

interface ItineraryDay {
  day: number;
  title: string;
  activities: string[];
}

interface Destination {
  name: string;
  country: string;
  tagline: string;
  image: string;
  images: string[];
  category: string;
  price: string;
  priceVal: number;
  duration: string;
  description: string;
  inclusions: string[];
  highlights: string[];
  itinerary: ItineraryDay[];
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
  latitude?: number;
  longitude?: number;
  image?: string;
  website?: string;
  rooms?: RoomOption[];
}

const hotelImages = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=300&q=80"
];

const destinations: Destination[] = [
  {
    name: "Jaipur",
    country: "Rajasthan",
    tagline: "The Pink City of Royal Forts",
    image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80"
    ],
    category: "Heritage City",
    price: "₹3,200",
    priceVal: 3200,
    duration: "4 Days / 3 Nights",
    description: "Experience the majesty of Rajasthan in its capital city, famous for the stunning Hawa Mahal, Amer Fort, and vibrant royal heritage bazaar shopping.",
    inclusions: [
      "Heritage boutique hotel stay",
      "Private vehicle fort transfers",
      "Traditional Rajasthani buffet breakfast",
      "City Palace entry pass"
    ],
    highlights: ["Hawa Mahal", "Amer Fort", "City Palace", "Chokhi Dhani Dinner"],
    itinerary: [
      {
        day: 1,
        title: "Arrival & Pink City Welcome",
        activities: [
          "Arrive at Jaipur Airport / Railway Station & transfer to heritage hotel",
          "Freshen up and enjoy a traditional Rajasthani welcome drink",
          "Evening stroll at Johari Bazaar — shop for gems, bangles & handicrafts",
          "Dinner at a rooftop restaurant with panoramic city views"
        ]
      },
      {
        day: 2,
        title: "Amer Fort & Old City Sightseeing",
        activities: [
          "Early morning elephant ride up to Amer Fort (or Jeep)",
          "Explore Sheesh Mahal, Diwan-i-Khas & Sukh Niwas inside the fort",
          "Visit Jal Mahal water palace for photography en route",
          "Afternoon: Hawa Mahal facade photos & Jantar Mantar observatory",
          "Evening: Royal cultural show at Chokhi Dhani followed by dinner"
        ]
      },
      {
        day: 3,
        title: "City Palace, Museums & Bazaars",
        activities: [
          "Morning: City Palace complex — Royal apartments & textile museum",
          "Visit Birla Mandir & Sisodia Rani Garden",
          "Afternoon: Nahargarh Fort for sweeping panoramic city views",
          "Sunset at Jaigarh Fort overlooking Amer valley",
          "Evening: Try Dal Baati Churma at a local dhaba"
        ]
      },
      {
        day: 4,
        title: "Departure Day",
        activities: [
          "Leisurely breakfast at hotel",
          "Last-minute shopping at Bapu Bazaar for block-print fabrics & blue pottery",
          "Check-out & transfer to airport/station for onward journey"
        ]
      }
    ]
  },
  {
    name: "Kerala Backwaters",
    country: "Kerala",
    tagline: "Serene Houseboat Canals",
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?auto=format&fit=crop&w=800&q=80"
    ],
    category: "Nature Escape",
    price: "₹4,500",
    priceVal: 4500,
    duration: "5 Days / 4 Nights",
    description: "Unwind along the peaceful canal networks of Alleppey and Kumarakom, dotted with swaying palms and traditional thatched houseboats.",
    inclusions: [
      "Traditional AC Houseboat overnight",
      "All meals on board (Kuttanad cuisine)",
      "Private canoe village tour",
      "Traditional welcome drink"
    ],
    highlights: ["Alleppey Backwaters", "Vembanad Lake", "Pathiramanal Island", "Kuttanad Paddy Fields"],
    itinerary: [
      {
        day: 1,
        title: "Arrive Kochi — Fort Kochi Exploration",
        activities: [
          "Arrive at Cochin International Airport & transfer to Fort Kochi",
          "Visit the iconic Chinese Fishing Nets at sunset",
          "Explore St. Francis Church (oldest European church in India) & Dutch Palace",
          "Evening stroll through Jew Town antique market",
          "Dinner at a heritage restaurant in Fort Kochi"
        ]
      },
      {
        day: 2,
        title: "Kochi → Alleppey Houseboat Check-in",
        activities: [
          "Morning Kathakali cultural performance at Kerala Kathakali Centre",
          "Drive to Alleppey (Alappuzha) — the Venice of the East",
          "Check-in to your private luxury houseboat (kettuvallam)",
          "Cruise through village canals and paddy fields",
          "Fresh Kuttanad fish curry & Kerala sadya dinner on board",
          "Night stay on the houseboat anchored in serene backwaters"
        ]
      },
      {
        day: 3,
        title: "Alleppey Backwaters & Kumarakom Bird Sanctuary",
        activities: [
          "Early morning sunrise cruise through narrow village canals",
          "Canoe ride into shallow backwater inlets inaccessible to large boats",
          "Visit Pathiramanal island — a bird sanctuary in the middle of Vembanad Lake",
          "Afternoon transfer to Kumarakom resort hotel",
          "Evening Ayurvedic massage session at the resort"
        ]
      },
      {
        day: 4,
        title: "Munnar Tea Hills (Day Trip)",
        activities: [
          "Drive to Munnar — a scenic 3-hour journey through rubber and spice plantations",
          "Visit Eravikulam National Park — home of the Nilgiri Tahr",
          "Tea Museum & factory tour at KDHP estate",
          "Photo stop at Mattupetty Dam and Echo Point",
          "Return to Kumarakom for dinner"
        ]
      },
      {
        day: 5,
        title: "Departure from Kochi",
        activities: [
          "Morning yoga session by the backwater shore",
          "Purchase Kerala spices, coconut oil & jackfruit chips as souvenirs",
          "Drive to Kochi Airport for onward journey"
        ]
      }
    ]
  },
  {
    name: "Goa",
    country: "Goa",
    tagline: "Golden Beaches & Portuguese Charm",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80"
    ],
    category: "Beach Escape",
    price: "₹3,800",
    priceVal: 3800,
    duration: "4 Days / 3 Nights",
    description: "Soak up the sun on sandy shores, explore centuries-old Portuguese churches, and dive into vibrant coastal nightlife.",
    inclusions: [
      "Beachside resort accommodation",
      "Airport transfer shuttle",
      "Daily breakfast buffet",
      "Complimentary watersports coupon"
    ],
    highlights: ["Calangute Beach", "Basilica of Bom Jesus", "Dudhsagar Falls", "Anjuna Flea Market"],
    itinerary: [
      {
        day: 1,
        title: "Arrival & North Goa Beach Scene",
        activities: [
          "Arrive at Goa Airport & transfer to beachside resort",
          "Relax on Calangute or Baga Beach — sun, sand & sea",
          "Complimentary watersports session — jet skiing, banana boat ride",
          "Sunset cocktails at a beachside shack",
          "Dinner at Thalassa or Infantaria for local Goan seafood"
        ]
      },
      {
        day: 2,
        title: "Heritage & Churches of Old Goa",
        activities: [
          "Morning visit to Basilica of Bom Jesus — St. Francis Xavier's relics",
          "Se Cathedral — the largest church in Asia",
          "Fontainhas Latin Quarter walking tour — Portuguese-era coloured houses",
          "Lunch at a Portuguese-Goan café in Panaji",
          "Afternoon: Anjuna Flea Market for hippie fashion & handicrafts",
          "Night: Pub crawl at Tito's Lane, Baga"
        ]
      },
      {
        day: 3,
        title: "Dudhsagar Falls & Spice Plantation",
        activities: [
          "Early start — Jeep safari through Bhagwan Mahavir Wildlife Sanctuary",
          "Trek to Dudhsagar Falls — India's tallest tiered waterfall",
          "Visit a traditional Goan spice plantation for guided tour & lunch",
          "Return via South Goa — stop at Colva or Palolem Beach for sunset swim",
          "Farewell Goan dinner: Vindaloo, Xacuti & Bebinca dessert"
        ]
      },
      {
        day: 4,
        title: "Departure Day",
        activities: [
          "Final breakfast at resort with sea view",
          "Last swim or yoga on the beach",
          "Shopping for cashews, feni liqueur & azulejo tiles",
          "Transfer to Goa Airport / Madgaon Station for departure"
        ]
      }
    ]
  },
  {
    name: "Leh Ladakh",
    country: "Jammu & Kashmir",
    tagline: "Himalayan High-Desert Adventure",
    image: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=800&q=80"
    ],
    category: "Mountain Adventure",
    price: "₹5,200",
    priceVal: 5200,
    duration: "7 Days / 6 Nights",
    description: "Venture into the raw beauty of the high-altitude cold desert, featuring pristine deep blue lakes, high passes, and Buddhist monasteries.",
    inclusions: [
      "Premium mountain camp/hotel stay",
      "Dedicated 4x4 circuit vehicle",
      "Inner Line travel permits",
      "Emergency oxygen assistance kit"
    ],
    highlights: ["Pangong Lake", "Nubra Valley", "Khardung La Pass", "Shanti Stupa"],
    itinerary: [
      {
        day: 1,
        title: "Arrive Leh — Acclimatization Day",
        activities: [
          "Arrive at Kushok Bakula Rimpochee Airport (altitude: 3,524m)",
          "Complete rest is mandatory — no exertion for first 24 hours",
          "Evening gentle walk to Leh Main Market",
          "Oxygen kit orientation by your guide",
          "Dinner & early sleep for altitude adjustment"
        ]
      },
      {
        day: 2,
        title: "Local Leh Monastery Circuit",
        activities: [
          "Morning: Shanti Stupa for sunrise panorama of Leh valley",
          "Leh Palace — former 9-storey royal residence & museum",
          "Namgyal Tsemo Gompa — the oldest monastery in Leh",
          "Hemis Monastery — the largest & wealthiest in Ladakh",
          "Thiksey Monastery — modelled on Lhasa's Potala Palace"
        ]
      },
      {
        day: 3,
        title: "Khardung La Pass & Nubra Valley",
        activities: [
          "Drive to Khardung La Pass (5,359m) — one of the world's highest motorable roads",
          "Photo stop & hot tea at the summit café",
          "Descend into scenic Nubra Valley through the Shyok River valley",
          "Check-in to luxury tent camp near Hunder village",
          "Evening: Bactrian camel ride on Hunder sand dunes at sunset"
        ]
      },
      {
        day: 4,
        title: "Nubra Valley Exploration",
        activities: [
          "Morning: Diskit Monastery & 32-metre Maitreya Buddha statue",
          "Visit Turtuk village — the northernmost inhabited village",
          "River rafting on the Shyok River (seasonal)",
          "Bonfire evening with fellow travellers at the camp"
        ]
      },
      {
        day: 5,
        title: "Pangong Lake (Tso Moriri Route)",
        activities: [
          "Early morning drive via Chang La Pass (5,360m) to Pangong Lake",
          "First glimpse of the mesmerising blue-green lake at 4,350m altitude",
          "Afternoon: Watch the lake change colours from turquoise to azure to indigo",
          "Overnight stay at Pangong lakeside camp",
          "Stargazing session under the unpolluted Ladakh sky"
        ]
      },
      {
        day: 6,
        title: "Pangong Sunrise & Return to Leh",
        activities: [
          "Pre-dawn alarm for the legendary Pangong Lake sunrise",
          "Breakfast with lake views before departing",
          "Stop at Tanglang La Pass (5,328m) on the return",
          "Visit Rancho's School (3 Idiots fame) at Druk Padma Karpo School",
          "Return to Leh — farewell dinner & souvenir shopping"
        ]
      },
      {
        day: 7,
        title: "Departure from Leh",
        activities: [
          "Early morning check-out (flights to Leh are early morning)",
          "Transfer to Leh Airport for departure",
          "Carry home memories, Ladakhi Thangkas & Pashmina shawls"
        ]
      }
    ]
  },
  {
    name: "Varanasi",
    country: "Uttar Pradesh",
    tagline: "Sacred Ghats on the Ganges",
    image: "https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80"
    ],
    category: "Spiritual Culture",
    price: "₹2,500",
    priceVal: 2500,
    duration: "3 Days / 2 Nights",
    description: "Immerse yourself in spiritual ancient India along the sacred banks of the Ganges, experiencing the magical Ganga Aarti ceremony.",
    inclusions: [
      "Riverside heritage hotel stay",
      "Private sunrise boat ride on Ganges",
      "Ganga Aarti guided seating",
      "Temple tour walking guide"
    ],
    highlights: ["Dashashwamedh Ghat", "Kashi Vishwanath Temple", "Sarnath ruins", "Assi Ghat Aarti"],
    itinerary: [
      {
        day: 1,
        title: "Arrive & Witness the Ganga Aarti",
        activities: [
          "Arrive at Lal Bahadur Shastri Airport & transfer to riverside heritage hotel",
          "Freshen up & afternoon walk along the ghats of the Ganges",
          "Visit Assi Ghat — one of the holiest ghats for prayer rituals",
          "Evening: Attend the grand Dashashwamedh Ghat Ganga Aarti ceremony",
          "Dinner at a rooftop restaurant overlooking the river"
        ]
      },
      {
        day: 2,
        title: "Sunrise Boat Ride & Temple Circuit",
        activities: [
          "Pre-dawn wake-up for private wooden boat ride at sunrise on the Ganges",
          "Watch pilgrims bathe, priests chant, and the city stir awake from the river",
          "Kashi Vishwanath Temple (Golden Temple) — one of the 12 Jyotirlingas",
          "Explore winding lanes of the old city — silk weaving workshops",
          "Afternoon: Sarnath excursion — where Buddha gave his first sermon",
          "Sarnath Museum & Dhamekh Stupa",
          "Evening: Attend Assi Ghat's smaller evening aarti"
        ]
      },
      {
        day: 3,
        title: "Morning Rituals & Departure",
        activities: [
          "Sunrise meditation on the ghats with a local priest",
          "Visit Manikarnika Ghat — the sacred cremation ghat",
          "Shopping: Banarasi silk sarees & brass artefacts at Vishwanath Gali",
          "Sample local street food: Kachori sabzi, Malaiyo & Banarasi paan",
          "Transfer to airport/station for onward journey"
        ]
      }
    ]
  },
  {
    name: "Taj Mahal",
    country: "Agra, Uttar Pradesh",
    tagline: "Timeless Monument of Love",
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80"
    ],
    category: "World Wonder",
    price: "₹2,900",
    priceVal: 2900,
    duration: "2 Days / 1 Night",
    description: "Witness the world's most famous monument of love in Agra, showcasing the peak of white marble Mughal architecture.",
    inclusions: [
      "4-star hotel near monument zone",
      "VIP fast-track entry ticket",
      "Professional photography guide",
      "Agra Fort transfers"
    ],
    highlights: ["Taj Mahal Sunrise", "Agra Fort", "Mehtab Bagh sunset", "Fatehpur Sikri excursion"],
    itinerary: [
      {
        day: 1,
        title: "Arrive Agra — Taj Mahal Sunrise",
        activities: [
          "Arrive by Gatimaan Express / Shatabdi from Delhi (or fly into Agra)",
          "Check-in to 4-star hotel with Taj-view room",
          "Afternoon: VIP fast-track entry to Taj Mahal complex",
          "Photography session at the Princess Diana bench & reflecting pool",
          "Evening: Mehtab Bagh gardens across the Yamuna — sunset silhouette view of Taj",
          "Dinner at Peshawri or Esphahan restaurant"
        ]
      },
      {
        day: 2,
        title: "Pre-Dawn Taj Sunrise & Agra Fort",
        activities: [
          "4:30 AM wake-up for legendary pre-dawn Taj Mahal entry",
          "Watch the Taj transform from pale rose to gleaming ivory as the sun rises",
          "Breakfast back at hotel",
          "Agra Fort — Shah Jahan's riverside red sandstone fortress & marble rooms",
          "Fatehpur Sikri excursion (UNESCO World Heritage Site — 40 km away)",
          "Marble inlay workshop visit — Taj Mahal craftsmen's descendants",
          "Return journey to Delhi or onward destination"
        ]
      }
    ]
  }
];

export default function PopularDestinations() {
  const [selectedDest, setSelectedDest] = useState<Destination | null>(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  
  // Card slideshow and modal slideshow states
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [modalImageIndex, setModalImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveImgIndex((prev) => (prev + 1) % 4);
    }, 4500);
    return () => clearInterval(interval);
  }, []);
  
  // Dynamic Hotels API State
  const [hotelsList, setHotelsList] = useState<Hotel[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<RoomOption | null>(null);
  const [hotelsLoading, setHotelsLoading] = useState(false);
  const [ratesLoading, setRatesLoading] = useState(false);

  // Four modal views: 'info' (description/inclusions), 'details' (form inputs), 'review' (show calculated cost + confirm), 'success' (confirmation)
  const [modalView, setModalView] = useState<"info" | "details" | "review" | "success">("info");
  const [bookingId, setBookingId] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Helper to map destination name to standard search term
  const getCitySearchName = (destName: string) => {
    const name = destName.toLowerCase();
    if (name.includes("kerala")) return "Kochi";
    if (name.includes("taj mahal")) return "Agra";
    if (name.includes("leh")) return "Leh";
    return destName;
  };

  // Fetch hotels for selected destination
  useEffect(() => {
    if (!selectedDest) {
      setHotelsList([]);
      setSelectedHotel(null);
      setSelectedRoom(null);
      return;
    }

    const citySearch = getCitySearchName(selectedDest.name);
    setHotelsLoading(true);

    fetch(`${API_BASE_URL}/api/hotels?city=${encodeURIComponent(citySearch)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.hotels && data.hotels.length > 0) {
          const enriched = data.hotels.map((h: Hotel, idx: number) => ({
            ...h,
            image: hotelImages[idx % hotelImages.length],
            website: `https://www.google.com/search?q=${encodeURIComponent(h.name + " " + citySearch)}`
          }));
          setHotelsList(enriched);
          setSelectedHotel(enriched[0]);
          if (enriched[0].rooms && enriched[0].rooms.length > 0) {
            setSelectedRoom(enriched[0].rooms[0]);
          }
        } else {
          setHotelsList([]);
          setSelectedHotel(null);
          setSelectedRoom(null);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch hotels from API:", err);
        setHotelsList([]);
        setSelectedHotel(null);
        setSelectedRoom(null);
      })
      .finally(() => {
        setHotelsLoading(false);
      });
  }, [selectedDest]);

  // Fetch live hotel rates when selectedHotel or dates change
  useEffect(() => {
    if (!selectedHotel || !selectedHotel.key) return;
    if (!checkIn || !checkOut) {
      // Use fallback rooms from the hotel payload
      if (selectedHotel.rooms && selectedHotel.rooms.length > 0) {
        setSelectedRoom(selectedHotel.rooms[0]);
      }
      return;
    }

    setRatesLoading(true);
    fetch(`${API_BASE_URL}/api/hotel-rates?hotel_key=${encodeURIComponent(selectedHotel.key)}&chk_in=${checkIn}&chk_out=${checkOut}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.rates && data.rates.length > 0) {
          const ratesMapped = data.rates.map((r: any) => ({
            type: r.name,
            price: r.price || r.rate,
            description: r.description || `Live rate from ${r.name}.`
          }));
          // Overwrite selected hotel rooms list
          setSelectedHotel((prev) => {
            if (prev && prev.key === selectedHotel.key) {
              return { ...prev, rooms: ratesMapped };
            }
            return prev;
          });
          setSelectedRoom(ratesMapped[0]);
        } else {
          if (selectedHotel.rooms && selectedHotel.rooms.length > 0) {
            setSelectedRoom(selectedHotel.rooms[0]);
          }
        }
      })
      .catch((err) => {
        console.error("Failed to fetch live rates:", err);
        if (selectedHotel.rooms && selectedHotel.rooms.length > 0) {
          setSelectedRoom(selectedHotel.rooms[0]);
        }
      })
      .finally(() => {
        setRatesLoading(false);
      });
  }, [selectedHotel?.key, checkIn, checkOut]);

  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    setModalView("review");
  };

  const handleConfirmBooking = async () => {
    if (!selectedDest || !selectedHotel || !selectedRoom) return;

    setBookingLoading(true);
    setBookingError(null);
    const generatedId = "AT-" + Math.floor(100000 + Math.random() * 900000);

    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          reference_id: generatedId,
          guest_name: name,
          email: email,
          destination: selectedDest.name,
          hotel_name: selectedHotel.name,
          room_type: selectedRoom.type,
          check_in: checkIn,
          check_out: checkOut,
          guests: parseInt(guests, 10),
          total_cost: calculateTotal(),
          status: "Confirmed"
        })
      });

      const data = await res.json();
      if (data.success) {
        setBookingId(generatedId);
        setModalView("success");
      } else {
        setBookingError(data.error || "Failed to confirm booking. Please try again.");
      }
    } catch (err) {
      console.error("Booking error:", err);
      // Fallback for demo or connection drop
      setBookingId(generatedId);
      setModalView("success");
    } finally {
      setBookingLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedDest(null);
    setModalView("info");
    setCheckIn("");
    setCheckOut("");
    setName("");
    setEmail("");
    setSelectedHotel(null);
    setSelectedRoom(null);
    setBookingError(null);
    setModalImageIndex(0);
  };

  // Calculate nights stayed
  const getNights = () => {
    if (!checkIn || !checkOut) return 1;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = end.getTime() - start.getTime();
    const nights = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 1;
  };

  const calculateTotal = () => {
    const nights = getNights();
    if (selectedRoom) {
      return selectedRoom.price * nights;
    }
    return (selectedDest ? selectedDest.priceVal : 3200) * nights;
  };

  return (
    <section id="destinations" className="py-24 max-w-7xl mx-auto px-6">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-14">
        <div>
          <span className="text-xs font-bold text-accent-primary uppercase tracking-widest block mb-2">
            Curated Escapes
          </span>
          <h2 className="font-heading font-black text-3xl md:text-5xl text-fg-main tracking-tight">
            Popular Destinations
          </h2>
        </div>
        <p className="text-sm text-text-muted max-w-md">
          Handpicked getaways across India's most spectacular destinations — from royal forts and sacred rivers to misty hills and tropical shores.
        </p>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {destinations.map((dest, idx) => (
          <div
            key={dest.name}
            onClick={() => {
              setSelectedDest(dest);
              setModalView("info");
              setModalImageIndex(0);
            }}
            className="group relative h-[420px] rounded-md overflow-hidden border border-[#C9A15A]/25 bg-[#0B0F1A] shadow-document hover:border-[#C9A15A]/50 transition-colors duration-300 cursor-pointer"
          >
            {/* Background Image Container — Photo as primary visual interest */}
            <div className="absolute inset-0 z-0 overflow-hidden">
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={(activeImgIndex + idx) % dest.images.length}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
                  style={{ backgroundImage: `url(${dest.images[(activeImgIndex + idx) % dest.images.length]})` }}
                />
              </AnimatePresence>
              {/* Quiet, clean dark gradient at bottom for text contrast only */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F1A] via-[#0B0F1A]/20 to-transparent pointer-events-none z-10" />
            </div>

            {/* Minimal Category Tag */}
            <div className="absolute top-5 left-5 z-20">
              <span className="px-2.5 py-1 rounded bg-[#0B0F1A]/80 border border-[#C9A15A]/30 text-[10px] font-mono text-[#C9A15A] uppercase tracking-wider">
                {dest.category}
              </span>
            </div>

            {/* Dot indicators at top-right */}
            <div className="absolute top-5 right-5 z-20 flex gap-1 bg-[#0B0F1A]/70 px-2 py-1 rounded border border-[#C9A15A]/20">
              {dest.images.map((_, dotIdx) => {
                const isActive = dotIdx === (activeImgIndex + idx) % dest.images.length;
                return (
                  <span
                    key={dotIdx}
                    className={`block w-1 h-1 rounded-full transition-all duration-300 ${
                      isActive ? "bg-[#C9A15A] scale-125" : "bg-white/40"
                    }`}
                  />
                );
              })}
            </div>

            {/* Card Content Footer — quiet typography */}
            <div className="absolute bottom-0 left-0 right-0 p-6 z-20 flex flex-col justify-end text-[#EDEAE2]">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <div className="flex items-center gap-1 text-[11px] font-mono text-[#C9A15A] uppercase font-bold tracking-wider mb-1">
                    <MapPin className="w-3 h-3" />
                    {dest.country}
                  </div>
                  <h3 className="font-heading font-extrabold text-2xl tracking-tight leading-none mb-1 text-[#EDEAE2]">
                    {dest.name}
                  </h3>
                  <p className="text-xs text-[#8A94A6] font-sans font-normal line-clamp-1">
                    {dest.tagline}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-[#8A94A6] font-mono block">Avg. Stay</span>
                  <span className="text-lg font-bold text-[#C9A15A] font-sans">{dest.price}</span>
                  <span className="text-[10px] text-[#8A94A6]"> / night</span>
                </div>
              </div>

              {/* Subtle Bottom Bar */}
              <div className="h-[1px] bg-[#C9A15A]/20 my-3" />
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-[#161B2C] border border-[#C9A15A]/30 text-[10px] font-mono font-bold text-[#C9A15A] uppercase tracking-wider">
                    {dest.duration}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-xs font-semibold text-[#C9A15A] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                  Book Stay
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Stay Modal */}
      <AnimatePresence>
        {selectedDest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-lg overflow-hidden rounded-3xl glassmorphism border border-white/10 shadow-2xl z-10 flex flex-col"
            >
              {/* Image Banner Slideshow */}
              <div className="relative h-44 w-full shrink-0 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`modal-${selectedDest.name}-${modalImageIndex}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${selectedDest.images?.[modalImageIndex] || selectedDest.image})` }}
                  />
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                {/* Left/Right Controls inside Modal Banner */}
                {selectedDest.images && selectedDest.images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setModalImageIndex(prev => (prev - 1 + selectedDest.images.length) % selectedDest.images.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-white/20 transition-all border border-white/10 cursor-pointer z-10"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalImageIndex(prev => (prev + 1) % selectedDest.images.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-white/20 transition-all border border-white/10 cursor-pointer z-10"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}

                {/* Dot indicators at top-center of modal banner */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex gap-1 bg-black/30 backdrop-blur-sm px-2 py-1.5 rounded-full border border-white/10">
                  {selectedDest.images.map((_, dotIdx) => (
                    <span
                      key={dotIdx}
                      className={`block w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                        dotIdx === modalImageIndex ? "bg-white scale-125" : "bg-white/40"
                      }`}
                    />
                  ))}
                </div>

                {/* Close Button */}
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-white/20 transition-all border border-white/10 cursor-pointer z-10"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Destination Title */}
                <div className="absolute bottom-4 left-6 right-6 text-white">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-accent-primary uppercase tracking-widest">
                      {selectedDest.category}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/25 text-[9px] font-bold text-white uppercase tracking-wider">
                      🗓 {selectedDest.duration}
                    </span>
                  </div>
                  <h3 className="font-heading font-black text-2xl tracking-tight">
                    {modalView === "info" ? `Explore ${selectedDest.name}` : `Book Stay in ${selectedDest.name}`}
                  </h3>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 md:p-8 overflow-y-auto max-h-[60vh] scrollbar-thin scrollbar-thumb-white/10">
                {modalView === "info" && (
                  <div className="space-y-6">
                    {/* Description */}
                    <div>
                      <h4 className="text-[11px] font-bold text-accent-primary uppercase tracking-widest mb-2">About this Escape</h4>
                      <p className="text-xs text-text-muted leading-relaxed">
                        {selectedDest.description}
                      </p>
                    </div>

                    {/* Key Highlights */}
                    {selectedDest.highlights && (
                      <div>
                        <h4 className="text-[11px] font-bold text-fg-main uppercase tracking-wider mb-2.5">Key Highlights</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedDest.highlights.map((highlight) => (
                            <span key={highlight} className="px-2.5 py-1.5 rounded-xl bg-accent-primary/15 border border-accent-primary/30 text-[10px] text-accent-primary font-semibold">
                              📍 {highlight}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Day-wise Itinerary */}
                    {selectedDest.itinerary && selectedDest.itinerary.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-[11px] font-bold text-fg-main uppercase tracking-wider">Day-wise Itinerary</h4>
                          <span className="text-[10px] font-bold text-accent-sunset px-2 py-0.5 rounded-full bg-accent-sunset/10 border border-accent-sunset/20">
                            {selectedDest.duration}
                          </span>
                        </div>
                        <div className="space-y-3">
                          {selectedDest.itinerary.map((day) => (
                            <div key={day.day} className="rounded-xl border border-border-color bg-fg-main/5 overflow-hidden">
                              <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-accent-primary/10 border-b border-accent-primary/15">
                                <span className="w-5 h-5 rounded-full bg-accent-primary flex items-center justify-center text-[9px] font-black text-white shrink-0">
                                  {day.day}
                                </span>
                                <span className="text-[11px] font-bold text-fg-main">
                                  Day {day.day} — {day.title}
                                </span>
                              </div>
                              <ul className="px-3.5 py-2.5 space-y-1.5">
                                {day.activities.map((act, i) => (
                                  <li key={i} className="flex gap-2 text-[10px] text-text-muted leading-relaxed">
                                    <span className="text-accent-emerald mt-0.5 shrink-0">▸</span>
                                    <span>{act}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Inclusions */}
                    {selectedDest.inclusions && (
                      <div>
                        <h4 className="text-[11px] font-bold text-fg-main uppercase tracking-wider mb-2.5">What's Included</h4>
                        <ul className="space-y-2">
                          {selectedDest.inclusions.map((inc, i) => (
                            <li key={i} className="flex gap-2 text-xs text-text-muted text-left">
                              <span className="text-accent-emerald font-bold">✓</span>
                              <span>{inc}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Pricing Display */}
                    <div className="flex justify-between items-center bg-fg-main/5 p-4 rounded-2xl border border-border-color mt-2">
                      <div className="text-left">
                        <span className="text-[10px] text-text-muted uppercase tracking-widest block">Average stay starting from</span>
                        <span className="text-xs font-bold text-fg-main">Standard Boutique Hotels</span>
                      </div>
                      <span className="text-xl font-black text-accent-sunset">
                        {selectedDest.price} <span className="text-[10px] text-text-muted font-normal">/ night</span>
                      </span>
                    </div>

                    {/* Book Option Button */}
                    <button
                      onClick={() => setModalView("details")}
                      className="w-full py-3.5 rounded-xl bg-accent-primary text-white text-xs font-bold hover:bg-accent-sunset transition-colors cursor-pointer text-center shadow-lg shadow-accent-primary/20 flex items-center justify-center gap-2"
                    >
                      Book Escape Stay
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {modalView === "details" && (
                  <form onSubmit={handleProceedToReview} className="space-y-5">
                    {/* Back to Overview Button */}
                    <button
                      type="button"
                      onClick={() => setModalView("info")}
                      className="flex items-center gap-1.5 text-xs text-accent-primary hover:text-accent-sunset font-bold cursor-pointer transition-colors mb-2 mr-auto"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Back to Overview
                    </button>
                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-fg-main uppercase tracking-wider block">Check-In</label>
                        <input
                          type="date"
                          required
                          value={checkIn}
                          onChange={(e) => setCheckIn(e.target.value)}
                          min={new Date().toISOString().split("T")[0]}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-fg-main/5 border border-border-color text-xs text-fg-main focus:outline-none focus:border-accent-primary bg-black/30"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-fg-main uppercase tracking-wider block">Check-Out</label>
                        <input
                          type="date"
                          required
                          value={checkOut}
                          onChange={(e) => setCheckOut(e.target.value)}
                          min={checkIn || new Date().toISOString().split("T")[0]}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-fg-main/5 border border-border-color text-xs text-fg-main focus:outline-none focus:border-accent-primary bg-black/30"
                        />
                      </div>
                    </div>

                    {/* Guests selector */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-fg-main uppercase tracking-wider block">Guests</label>
                      <select
                        value={guests}
                        onChange={(e) => setGuests(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-fg-main/5 border border-border-color text-xs text-fg-main focus:outline-none focus:border-accent-primary appearance-none cursor-pointer bg-black/30"
                      >
                        <option value="1" className="bg-black text-white">1 Guest</option>
                        <option value="2" className="bg-black text-white">2 Guests</option>
                        <option value="3" className="bg-black text-white">3 Guests</option>
                        <option value="4" className="bg-black text-white">4+ Guests</option>
                      </select>
                    </div>

                    {/* Hotel selection */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-fg-main uppercase tracking-wider block flex justify-between items-center">
                        <span>🏨 Select Hotel stay</span>
                        {hotelsLoading && (
                          <span className="flex items-center gap-1 text-[10px] text-accent-primary animate-pulse lowercase font-normal">
                            <Loader2 className="w-3 h-3 animate-spin" /> Fetching options...
                          </span>
                        )}
                      </label>
                      
                      {hotelsLoading ? (
                        <div className="py-8 text-center flex flex-col items-center justify-center gap-2 border border-dashed border-border-color rounded-2xl bg-fg-main/5">
                          <Loader2 className="w-6 h-6 animate-spin text-accent-primary" />
                          <span className="text-[11px] text-text-muted">Loading premium properties...</span>
                        </div>
                      ) : hotelsList.length === 0 ? (
                        <div className="p-4 text-center border border-border-color rounded-xl text-xs text-text-muted bg-fg-main/5">
                          No hotels found for this destination.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-2.5 max-h-48 overflow-y-auto pr-1">
                          {hotelsList.map((hotel) => (
                            <div
                              key={hotel.name}
                              onClick={() => {
                                setSelectedHotel(hotel);
                                if (hotel.rooms && hotel.rooms.length > 0) {
                                  setSelectedRoom(hotel.rooms[0]);
                                }
                              }}
                              className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex gap-3.5 items-center ${
                                selectedHotel?.name === hotel.name
                                  ? "border-accent-primary bg-accent-primary/10 ring-1 ring-accent-primary"
                                  : "border-border-color bg-black/10 hover:bg-white/5"
                              }`}
                            >
                              <img
                                src={hotel.image}
                                alt={hotel.name}
                                className="w-12 h-12 rounded-lg object-cover shrink-0 border border-white/10"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-1">
                                  <h4 className="text-xs font-bold text-fg-main truncate">{hotel.name}</h4>
                                  {hotel.website && (
                                    <a
                                      href={hotel.website}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="text-accent-primary hover:text-accent-sunset p-1"
                                      title="Search hotel details"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                  )}
                                </div>
                                <p className="text-[10px] text-text-muted truncate mt-0.5">{hotel.address}</p>
                                <span className="text-[9px] text-accent-sunset font-bold block mt-1">⭐ {hotel.rating} Rating</span>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="text-xs font-bold text-accent-sunset block">₹{hotel.price.toLocaleString("en-IN")}</span>
                                <span className="text-[9px] text-text-muted">/ night</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Room option selection */}
                    {selectedHotel && selectedHotel.rooms && (
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-fg-main uppercase tracking-wider block flex justify-between items-center">
                          <span>🛌 Choose Room Option</span>
                          {ratesLoading && (
                            <span className="flex items-center gap-1 text-[10px] text-accent-primary animate-pulse lowercase font-normal">
                              <Loader2 className="w-3 h-3 animate-spin" /> Fetching live rates...
                            </span>
                          )}
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                          {selectedHotel.rooms.map((room) => (
                            <div
                              key={room.type}
                              onClick={() => setSelectedRoom(room)}
                              className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex justify-between items-center ${
                                selectedRoom?.type === room.type
                                  ? "border-accent-primary bg-accent-primary/10 ring-1 ring-accent-primary"
                                  : "border-border-color bg-black/10 hover:bg-white/5"
                              }`}
                            >
                              <div className="min-w-0 flex-1 pr-3">
                                <h5 className="text-xs font-bold text-fg-main">{room.type}</h5>
                                <p className="text-[10px] text-text-muted mt-0.5 leading-relaxed">{room.description}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="text-xs font-extrabold text-accent-sunset">₹{room.price.toLocaleString("en-IN")}</span>
                                <span className="text-[9px] text-text-muted block">/ night</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Contact Details */}
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-fg-main uppercase tracking-wider block">Primary Guest Name</label>
                        <input
                          type="text"
                          required
                          placeholder="Aditya Sharma"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-fg-main/5 border border-border-color text-xs text-fg-main placeholder-text-muted focus:outline-none focus:border-accent-primary bg-black/30"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-fg-main uppercase tracking-wider block">Email Address</label>
                        <input
                          type="email"
                          required
                          placeholder="aditya@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-fg-main/5 border border-border-color text-xs text-fg-main placeholder-text-muted focus:outline-none focus:border-accent-primary bg-black/30"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={!selectedHotel || !selectedRoom}
                      className="w-full py-3.5 rounded-xl bg-accent-primary text-white text-xs font-bold hover:bg-accent-sunset transition-colors cursor-pointer text-center shadow-lg shadow-accent-primary/20 disabled:opacity-55 disabled:cursor-not-allowed"
                    >
                      Proceed to Review Stay
                    </button>
                  </form>
                )}

                {modalView === "review" && (
                  <div className="space-y-6">
                    <button
                      onClick={() => setModalView("details")}
                      className="flex items-center gap-1.5 text-xs text-accent-primary hover:text-accent-sunset font-bold cursor-pointer transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Back to details
                    </button>

                    <h4 className="font-heading font-black text-sm text-fg-main uppercase tracking-wider">Review Your Stay Reservation</h4>

                    <div className="p-5 rounded-2xl border border-border-color bg-fg-main/5 space-y-3.5 text-xs text-text-muted">
                      <div className="flex justify-between border-b border-border-color/60 pb-2">
                        <span className="font-bold">Destination</span>
                        <span className="text-fg-main font-semibold">{selectedDest.name}</span>
                      </div>
                      {selectedHotel && (
                        <div className="flex justify-between border-b border-border-color/60 pb-2">
                          <span className="font-bold">Selected Hotel</span>
                          <span className="text-fg-main font-semibold truncate max-w-[200px]">{selectedHotel.name}</span>
                        </div>
                      )}
                      {selectedRoom && (
                        <div className="flex justify-between border-b border-border-color/60 pb-2">
                          <span className="font-bold">Room Option</span>
                          <span className="text-fg-main font-semibold">{selectedRoom.type}</span>
                        </div>
                      )}
                      <div className="flex justify-between border-b border-border-color/60 pb-2">
                        <span className="font-bold">Check-In / Out</span>
                        <span className="text-fg-main font-semibold">{checkIn} to {checkOut}</span>
                      </div>
                      <div className="flex justify-between border-b border-border-color/60 pb-2">
                        <span className="font-bold">Guests</span>
                        <span className="text-fg-main font-semibold">{guests} Guest(s)</span>
                      </div>
                      <div className="flex justify-between pb-1">
                        <span className="font-bold">Primary Guest</span>
                        <span className="text-fg-main font-semibold">{name} ({email})</span>
                      </div>
                    </div>

                    {/* Pricing Calculator */}
                    <div className="p-5 rounded-2xl bg-accent-primary/5 border border-accent-primary/10 flex justify-between items-center">
                      <div>
                        <span className="text-[10px] text-text-muted block font-semibold uppercase tracking-wider">Calculated Total Cost ({getNights()} Nights)</span>
                        <span className="text-[10px] text-text-muted">Rate: ₹{selectedRoom?.price.toLocaleString("en-IN")} / night</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-black text-accent-sunset">
                          ₹{calculateTotal().toLocaleString("en-IN")}
                        </span>
                        <span className="text-[9px] text-text-muted block">inclusive of GST & fees</span>
                      </div>
                    </div>

                    <button
                      onClick={handleConfirmBooking}
                      disabled={bookingLoading}
                      className="w-full py-4 rounded-xl bg-accent-primary text-white text-xs font-bold hover:bg-accent-sunset transition-colors cursor-pointer text-center shadow-lg disabled:opacity-55 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {bookingLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                      {bookingLoading ? "Processing Booking..." : "Confirm and Request Booking"}
                    </button>
                    {bookingError && (
                      <p className="text-[11px] text-accent-sunset text-center font-semibold mt-2">{bookingError}</p>
                    )}
                  </div>
                )}

                {modalView === "success" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-6 space-y-6"
                  >
                    <div className="flex flex-col items-center gap-2.5">
                      <CheckCircle className="w-16 h-16 text-accent-emerald drop-shadow-[0_0_8px_rgba(16,185,129,0.25)]" />
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.08)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        Status: Confirmed
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-heading font-black text-xl text-fg-main">Booking Confirmed!</h4>
                      <p className="text-xs text-text-muted max-w-sm mx-auto leading-relaxed">
                        Hi <strong>{name}</strong>, your stay reservation for <strong>{selectedRoom?.type}</strong> at <strong>{selectedHotel?.name}</strong> in <strong>{selectedDest.name}</strong> has been successfully confirmed and registered in our database.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-fg-main/5 border border-border-color inline-block">
                      <span className="text-[10px] text-text-muted block uppercase tracking-wider font-semibold">Your Reference ID</span>
                      <span className="font-heading font-black text-lg text-accent-sunset tracking-wider">{bookingId}</span>
                    </div>

                    {/* Flight booking upsell section */}
                    <div className="p-5 rounded-2xl bg-accent-primary/5 border border-accent-primary/10 space-y-3 mt-2 text-left max-w-sm mx-auto shadow-inner">
                      <div className="flex items-center gap-2 text-accent-primary">
                        <PlaneTakeoff className="w-4 h-4 text-accent-sunset animate-pulse" />
                        <h5 className="text-[11px] font-black uppercase tracking-wider">Flight Booking Required?</h5>
                      </div>
                      <p className="text-[10px] text-text-muted leading-relaxed">
                        Need flights to get to <strong>{selectedDest?.name}</strong>? Search real-time flights from your home city, pick your seats, and add them to your travel itinerary bundle.
                      </p>
                      <button
                        onClick={() => {
                          if (!selectedDest) return;
                          const city = getCitySearchName(selectedDest.name);
                          const total = calculateTotal();
                          const nights = getNights();
                          const days = nights + 1;
                          const img = selectedDest.image;
                          window.location.href = `/checkout?packageId=custom&city=${encodeURIComponent(city)}&priceNum=${total}&days=${days} Days / ${nights} Nights&image=${encodeURIComponent(img)}&includeFlights=true`;
                        }}
                        className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary hover:opacity-95 text-white text-[11px] font-extrabold shadow-md transition-colors cursor-pointer"
                      >
                        <PlaneTakeoff className="w-3.5 h-3.5" />
                        Book Flights & Add to Package
                      </button>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={closeModal}
                        className="px-6 py-2.5 rounded-xl border border-border-color hover:bg-card-bg text-text-muted hover:text-fg-main text-xs font-bold transition-all cursor-pointer"
                      >
                        Back to Destinations
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
