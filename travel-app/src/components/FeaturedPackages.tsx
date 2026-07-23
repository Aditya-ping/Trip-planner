"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Star, Clock, Calendar, Check, ShieldCheck, ChevronDown, ChevronUp, 
  Sparkles, Eye, X, Info, MapPin, Compass, AlertCircle, ChevronLeft, ChevronRight, CreditCard
} from "lucide-react";
import { useRouter } from "next/navigation";
import TicketDivider from "./TicketDivider";

interface Package {
  id: number;
  title: string;
  destination: string;
  duration: string;
  rating: number;
  price: string;
  image: string;
  images: string[];
  description: string;
  amenities: string[];
  daySummary: string[];
  detailedItinerary: { day: string; title: string; description: string; activity: string }[];
  inclusions: string[];
  exclusions: string[];
  importantNotes: string[];
}

const packages: Package[] = [
  {
    id: 1,
    title: "Rajasthan Royal Heritage Circuit",
    destination: "Jaipur • Jodhpur • Udaipur (Rajasthan)",
    duration: "7 Days / 6 Nights",
    rating: 4.9,
    price: "₹42,000",
    image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1566552881560-0be862a7c445?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1477584308802-e9c3788ee454?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1524228984689-10029b370903?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Embrace the legacy of the Maharajas. Travel from the pink monuments of Jaipur to the majestic Mehrangarh Fort in Jodhpur, ending in the romance-infused lake palace city of Udaipur.",
    amenities: [
      "Palace Hotel Stay in Udaipur",
      "Private Heritage Fort Tours",
      "Camel Safari at Sam Sand Dunes",
      "AC Vehicle with Expert Guide",
    ],
    daySummary: [
      "Day 1-2: Jaipur — Amber Fort, City Palace & Hawa Mahal",
      "Day 3-4: Jodhpur — Mehrangarh Fort & Blue City walk",
      "Day 5-7: Udaipur — Lake Pichola boat ride & palace dinner",
    ],
    detailedItinerary: [
      { day: "Day 1", title: "Arrival in the Pink City", description: "Receive a traditional Rajasthani welcome. Check into your heritage hotel and explore Hawa Mahal in the evening.", activity: "Sightseeing & Welcome Dinner" },
      { day: "Day 2", title: "Grand Forts of Jaipur", description: "Ascend Amber Fort on an electric cart. Visit Jaigarh Fort and the Royal Observatory (Jantar Mantar).", activity: "Amber Fort & City Palace Guided Tour" },
      { day: "Day 3", title: "Journey to the Blue City", description: "Drive to Jodhpur. Visit the majestic Umaid Bhawan Palace and view the city's blue homes from above.", activity: "Scenic Drive & Palace Visit" },
      { day: "Day 4", title: "Jodhpur Citadels & Markets", description: "Explore Mehrangarh Fort, Jaswant Thada, and shop for hand-woven textiles at Sadar Bazaar.", activity: "Fort Exploration & Textile Shopping" },
      { day: "Day 5", title: "Travel to Lake City Udaipur", description: "En route, visit the spectacular Ranakpur Jain Temples, famous for 1444 uniquely carved marble pillars.", activity: "Ranakpur Temple Stop & Udaipur Sunset Boat Ride" },
      { day: "Day 6", title: "Palaces & Gardens of Udaipur", description: "Tour Udaipur City Palace. Walk around Sahelion-ki-Bari and enjoy a lakeside royal dinner.", activity: "Palace Tour & Royal Dinner" },
      { day: "Day 7", title: "Farewell Udaipur", description: "Enjoy a leisurely morning, souvenir shopping, and transfer to airport/railway station.", activity: "Departure Transfer" }
    ],
    inclusions: [
      "Double sharing accommodation in 4-star/Heritage hotels",
      "Daily buffet breakfast and dinner",
      "Private air-conditioned Sedan for all intercity transfers and sightseeing",
      "Certified local guides in Jaipur, Jodhpur, and Udaipur",
      "Camel safari and sunset cultural show with refreshments",
      "All monument entry tickets and boat ride charges"
    ],
    exclusions: [
      "Airfare or train tickets to Jaipur / from Udaipur",
      "Lunch and personal expenses (shopping, tips)",
      "Optional adventure activities",
      "GST (5%) applied at check-out"
    ],
    importantNotes: [
      "Carry lightweight clothing for daytime, light jacket for desert evenings.",
      "Dress code required for temple visits (shoulders and knees covered).",
      "Itinerary can be customized on special requests."
    ]
  },
  {
    id: 2,
    title: "Kerala Backwaters & Hill Stations",
    destination: "Kochi • Alleppey • Munnar (Kerala)",
    duration: "6 Days / 5 Nights",
    rating: 4.95,
    price: "₹38,500",
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80"
    ],
    description: "Relax amidst pristine nature. Witness the spice trade legacy of historic Kochi, walk through lush rolling tea estates in Munnar, and cruise through serene backwaters on a luxurious private houseboat.",
    amenities: [
      "Luxury Houseboat on Vembanad Lake",
      "Ayurvedic Spa & Wellness Session",
      "Tea Plantation Tour in Munnar",
      "Kathakali Cultural Performance",
    ],
    daySummary: [
      "Day 1-2: Kochi — Fort Kochi, Spice Market & Chinese Fishing Nets",
      "Day 3-4: Alleppey — Houseboat cruise through serene backwaters",
      "Day 5-6: Munnar — Tea gardens, Eravikulam National Park trek",
    ],
    detailedItinerary: [
      { day: "Day 1", title: "Kochi Colonial Heritage", description: "Explore the historic Fort Kochi area, Chinese Fishing Nets, and the St. Francis Church.", activity: "Heritage Walk & Cultural Performance" },
      { day: "Day 2", title: "Ascent to Tea County (Munnar)", description: "Scenic uphill drive passing Valara and Cheeyappara waterfalls. Check into a resort surrounded by tea hills.", activity: "Waterfall Stops & Tea Country Drive" },
      { day: "Day 3", title: "Munnar Tea Estates & National Park", description: "Spot the endangered Nilgiri Tahr at Eravikulam National Park and visit the tea museum.", activity: "Tea Plantation Tour & Wildlife Spotting" },
      { day: "Day 4", title: "Boarding the Luxury Houseboat", description: "Travel to Alleppey jetty to board your private Kettuvallam. Relish authentic Kerala lunch while sailing.", activity: "Overnight Houseboat Stay & Traditional Meals" },
      { day: "Day 5", title: "Ayurvedic Rejuvenation", description: "Disembark and check into a coastal resort. Experience a traditional Abhyanga Ayurvedic full-body spa session.", activity: "Ayurvedic Treatment & Beachside Rest" },
      { day: "Day 6", title: "Departure from Kochi", description: "Drive back to Kochi airport/station. Carry home fresh cardamom, pepper, and tea leaves.", activity: "Airport Transfer & Spice Shopping" }
    ],
    inclusions: [
      "1 Night luxury houseboat stay (Full board - lunch, dinner, breakfast)",
      "4 Nights in premium 4-star boutique hotels & resorts",
      "Daily breakfast and dinner at hotels",
      "Private AC Cab for the entire circuit",
      "Complimentary Ayurvedic wellness therapy session (90 mins)",
      "Traditional Kathakali show entry tickets"
    ],
    exclusions: [
      "Airfare / Train fare",
      "Expenses of personal nature",
      "Tips for driver, guides, and houseboat crew",
      "Any entrance tickets not mentioned in inclusions"
    ],
    importantNotes: [
      "Houseboat air conditioning operates from 9:00 PM to 6:00 AM.",
      "Monsoon months offer the most scenic waterfalls but can affect boat operations.",
      "Bring slip-resistant shoes for tea estate walks."
    ]
  },
  {
    id: 3,
    title: "Leh Ladakh Himalayan Odyssey",
    destination: "Leh • Nubra Valley • Pangong Lake (J&K)",
    duration: "8 Days / 7 Nights",
    rating: 4.88,
    price: "₹55,000",
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Pangong_Tso_Ladakh_India.jpg/960px-Pangong_Tso_Ladakh_India.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Shanti_Stupa_Leh_Ladakh_India.jpg/960px-Shanti_Stupa_Leh_Ladakh_India.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Leh_Palace_and_the_town_of_Leh%2C_Ladakh.jpg/960px-Leh_Palace_and_the_town_of_Leh%2C_Ladakh.jpg"
    ],
    description: "A high-altitude adventure of a lifetime. Experience absolute peace at Leh's monasteries, cross the Khardung La motorable pass, ride double-humped camels in the cold desert of Nubra, and witness Pangong Lake change colors.",
    amenities: [
      "Premium Camp Stay at Pangong",
      "Bactrian Camel Safari in Nubra",
      "Oxygen Support & Medical Kit",
      "4x4 Jeep for Mountain Passes",
    ],
    daySummary: [
      "Day 1-2: Leh acclimatization — Shanti Stupa & Leh Palace",
      "Day 3-5: Nubra Valley via Khardung La — highest motorable pass",
      "Day 6-8: Pangong Lake sunrise camp & Hemis Monastery visit",
    ],
    detailedItinerary: [
      { day: "Day 1", title: "Arrival & Mandatory Rest", description: "Land in Leh (11,500 ft). Spend the day resting completely at the hotel for high-altitude acclimatization.", activity: "Rest & Acclimatization" },
      { day: "Day 2", title: "Monasteries & Leh Heritage", description: "Visit the stunning Shanti Stupa, Hall of Fame museum, and Leh Palace in the afternoon.", activity: "Cultural Sightseeing" },
      { day: "Day 3", title: "Cross Khardung La to Nubra Valley", description: "Drive over Khardung La (17,582 ft). Visit the majestic 32m Maitreya Buddha statue in Diskit.", activity: "Mountain Pass Drive & Monastery Visit" },
      { day: "Day 4", title: "Hunder Dunes & Bactrian Camels", description: "Enjoy a safari on rare double-humped Bactrian camels. Explore the Hunder village lifestyle.", activity: "Camel Safari & Village Cultural Walk" },
      { day: "Day 5", title: "Nubra to Pangong Lake via Shyok", description: "Drive along the wild Shyok River to the legendary Pangong Tso. Check into a premium lakeside camp.", activity: "River Valley Drive & Lake Sunset Camp" },
      { day: "Day 6", title: "Pangong Sunrise & Return to Leh", description: "Capture the surreal colors of the lake at sunrise. Drive back to Leh crossing Chang La pass.", activity: "Sunrise Photography & Return Drive" },
      { day: "Day 7", title: "Magnetic Hill & Confluence Tour", description: "Visit the Indus-Zanskar confluence at Sangam, Magnetic Hill, and the ancient Gurudwara Pathar Sahib.", activity: "Nature Wonders Tour" },
      { day: "Day 8", title: "Departure from Leh", description: "Early morning transfer to Kushok Bakula Rimpochee Airport for flight back.", activity: "Airport Transfer" }
    ],
    inclusions: [
      "Double room accommodation in Leh, Nubra, and Pangong Camps",
      "All meals (Breakfast, Lunch, Dinner) included",
      "Dedicated 4x4 Scorpio/Innova for mountain terrains",
      "Inner Line Permits (ILP) and Wildlife fees",
      "Professional English/Hindi speaking driver-guide",
      "Oxygen cylinder inside the vehicle for altitude emergencies"
    ],
    exclusions: [
      "Flights to and from Leh",
      "Personal warm wear rentals",
      "Any extra hotel meals or room service",
      "Travel insurance"
    ],
    importantNotes: [
      "Acclimatization is essential. Avoid strenuous exercise on Days 1 and 2.",
      "Only post-paid BSNL/Airtel/Jio mobile connections work in Ladakh.",
      "Bring heavy woolens, gloves, thermals, and dry fruits."
    ]
  },
];

export default function FeaturedPackages() {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [selectedPkg, setSelectedPkg] = useState<Package | null>(null);
  
  // State for active photo indices in card previews
  const [cardImageIndices, setCardImageIndices] = useState<Record<number, number>>({});
  // State for active photo in modal detail view
  const [modalImageIndex, setModalImageIndex] = useState<number>(0);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleNextCardImage = (e: React.MouseEvent, pkgId: number, maxImages: number) => {
    e.stopPropagation();
    setCardImageIndices(prev => ({
      ...prev,
      [pkgId]: ((prev[pkgId] || 0) + 1) % maxImages
    }));
  };

  const handlePrevCardImage = (e: React.MouseEvent, pkgId: number, maxImages: number) => {
    e.stopPropagation();
    setCardImageIndices(prev => ({
      ...prev,
      [pkgId]: ((prev[pkgId] || 0) - 1 + maxImages) % maxImages
    }));
  };

  const handleBookNow = (packageId: number) => {
    router.push(`/checkout?packageId=${packageId}`);
  };

  return (
    <section id="packages" className="py-24 max-w-7xl mx-auto px-6">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-14">
        <div>
          <span className="text-xs font-bold text-accent-sunset uppercase tracking-widest block mb-2">
            Inclusive Escapes
          </span>
          <h2 className="font-heading font-black text-3xl md:text-5xl text-fg-main tracking-tight">
            Featured Packages
          </h2>
        </div>
        <p className="text-sm text-text-muted max-w-md">
          Premium all-inclusive itineraries. Lodging, gourmet dining, transport, and certified local guides are fully coordinated.
        </p>
      </div>

      {/* Package Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {packages.map((pkg) => {
          const isExpanded = expandedId === pkg.id;
          const currentImageIdx = cardImageIndices[pkg.id] || 0;
          const currentImgUrl = pkg.images?.[currentImageIdx] || pkg.image;

          return (
            <div
              key={pkg.id}
              className="rounded-md overflow-hidden bg-[#161B2C] border border-[#C9A15A]/30 shadow-document flex flex-col justify-between group"
            >
              {/* Header Image with Photo Slider */}
              <div className="relative h-56 w-full overflow-hidden border-b border-[#C9A15A]/20">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${pkg.id}-${currentImageIdx}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${currentImgUrl})` }}
                  />
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F1A]/80 to-transparent pointer-events-none" />

                {/* Left/Right Slider Controls */}
                {pkg.images && pkg.images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => handlePrevCardImage(e, pkg.id, pkg.images.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-black/60 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleNextCardImage(e, pkg.id, pkg.images.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-black/60 cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    {/* Dot indicators */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                      {pkg.images.map((_, idx) => (
                        <span
                          key={idx}
                          className={`block w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                            idx === currentImageIdx ? "bg-[#C9A15A] scale-125" : "bg-white/40"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Package Details (Upper Ticket Section) */}
              <div className="p-6 flex-grow flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#C9A15A] uppercase tracking-widest block mb-2">
                    [ {pkg.destination} ]
                  </span>
                  <h3 className="font-heading font-extrabold text-xl text-[#EDEAE2] tracking-tight leading-snug mb-3">
                    {pkg.title}
                  </h3>

                  <div className="flex gap-4 mb-4 text-xs text-[#8A94A6] font-sans">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-[#C9A15A]" />
                      {pkg.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-[#C9A15A]" />
                      Daily Departures
                    </span>
                  </div>

                  {/* Short snippet description */}
                  <p className="text-xs text-[#8A94A6] mb-4 line-clamp-2 font-sans">
                    {pkg.description}
                  </p>

                  {/* Highlight Amenities */}
                  <ul className="space-y-2">
                    {pkg.amenities.slice(0, 3).map((amenity) => (
                      <li key={amenity} className="flex items-center gap-2 text-xs text-[#8A94A6] font-sans">
                        <Check className="w-4 h-4 text-[#C9A15A] shrink-0" />
                        {amenity}
                      </li>
                    ))}
                  </ul>

                  {/* Accordion Expansion Panel */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden mt-4 pt-4 border-t border-dashed border-[#C9A15A]/30"
                      >
                        {/* Day summaries */}
                        <h4 className="font-heading font-extrabold text-xs text-[#EDEAE2] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#C9A15A]" />
                          Trip Highlights
                        </h4>
                        <ul className="space-y-2 mb-4">
                          {pkg.daySummary.map((day) => (
                            <li key={day} className="text-[11px] text-[#8A94A6] leading-relaxed font-sans">
                              {day}
                            </li>
                          ))}
                        </ul>

                        {/* Additional amenity */}
                        <div className="flex items-center gap-2 text-xs text-[#8A94A6] font-sans">
                          <ShieldCheck className="w-4 h-4 text-[#C9A15A]" />
                          All flights and transfers managed
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Expand button */}
                  <button
                    onClick={() => toggleExpand(pkg.id)}
                    className="flex items-center gap-1 text-[11px] font-bold font-mono text-[#C9A15A] uppercase tracking-widest mt-4 hover:text-[#E6C887] cursor-pointer transition-colors"
                  >
                    {isExpanded ? (
                      <>
                        Close Details <ChevronUp className="w-3.5 h-3.5" />
                      </>
                    ) : (
                      <>
                        View Full Details <ChevronDown className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>

                {/* Ticket Stub Divider between Summary and Price Section */}
                <TicketDivider className="my-4 opacity-75" />

                {/* Ticket Bottom Stub Section (Price & Action) */}
                <div className="flex justify-between items-center gap-2">
                  <div>
                    <span className="text-[10px] font-mono text-[#8A94A6] uppercase tracking-wider block">Package Total</span>
                    <span className="text-xl font-extrabold text-[#C9A15A] font-sans">{pkg.price}</span>
                    <span className="text-[10px] text-[#8A94A6]"> / pax</span>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setSelectedPkg(pkg);
                        setModalImageIndex(0);
                      }}
                      className="px-3 py-2.5 rounded-md border border-[#C9A15A]/30 text-[#8A94A6] hover:text-[#EDEAE2] hover:bg-[#C9A15A]/10 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleBookNow(pkg.id)}
                      className="px-4 py-2.5 rounded-md bg-[#C9A15A] text-[#0B0F1A] text-xs font-bold shadow-md hover:bg-[#E6C887] transition-all duration-200 cursor-pointer flex items-center gap-1.5"
                    >
                      <CreditCard className="w-4 h-4" />
                      Book Now
                    </button>
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Package Detail Modal */}
      <AnimatePresence>
        {selectedPkg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPkg(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-4xl max-h-[85vh] overflow-y-auto rounded-3xl glassmorphism border border-white/10 shadow-2xl z-10 flex flex-col scrollbar-thin scrollbar-thumb-white/10"
            >
              {/* Header Image Banner with Gallery */}
              <div className="relative h-64 md:h-96 w-full shrink-0 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`modal-${selectedPkg.id}-${modalImageIndex}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${selectedPkg.images?.[modalImageIndex] || selectedPkg.image})` }}
                  />
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

                {/* Left/Right controls inside modal banner */}
                {selectedPkg.images && selectedPkg.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setModalImageIndex(prev => (prev - 1 + selectedPkg.images.length) % selectedPkg.images.length)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-white/20 transition-all border border-white/10 cursor-pointer"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setModalImageIndex(prev => (prev + 1) % selectedPkg.images.length)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-white/20 transition-all border border-white/10 cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Close Button */}
                <button
                  onClick={() => setSelectedPkg(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-white/20 transition-all border border-white/10 cursor-pointer z-10"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Overlay Text */}
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded bg-accent-primary text-white text-[10px] font-bold uppercase tracking-wider">
                      {selectedPkg.duration}
                    </span>
                  </div>
                  <h2 className="font-heading font-black text-2xl md:text-3xl tracking-tight mb-2">
                    {selectedPkg.title}
                  </h2>
                  <p className="text-xs text-white/80 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-accent-sunset" />
                    {selectedPkg.destination}
                  </p>
                </div>
              </div>

              {/* Photo Gallery Thumbnails */}
              {selectedPkg.images && selectedPkg.images.length > 1 && (
                <div className="flex justify-start gap-3 px-6 md:px-8 pt-4 overflow-x-auto shrink-0 bg-fg-main/5 pb-2 border-b border-border-color">
                  {selectedPkg.images.map((imgUrl, i) => (
                    <button
                      key={i}
                      onClick={() => setModalImageIndex(i)}
                      className={`relative w-20 h-14 rounded-lg overflow-hidden shrink-0 transition-all cursor-pointer ${
                        i === modalImageIndex ? "ring-2 ring-accent-primary scale-95" : "opacity-60 hover:opacity-100"
                      }`}
                    >
                      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${imgUrl})` }} />
                    </button>
                  ))}
                </div>
              )}

              {/* Modal Content */}
              <div className="p-6 md:p-8 space-y-8">
                {/* Description */}
                <div>
                  <h4 className="text-xs font-bold text-accent-sunset uppercase tracking-widest mb-2">Package Overview</h4>
                  <p className="text-sm text-text-muted leading-relaxed">
                    {selectedPkg.description}
                  </p>
                </div>

                {/* Itinerary */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-accent-sunset uppercase tracking-widest flex items-center gap-2">
                    <Compass className="w-4 h-4 text-accent-primary" />
                    Day-by-Day Detailed Itinerary
                  </h4>
                  <div className="space-y-4 border-l border-border-color pl-4 ml-2">
                    {selectedPkg.detailedItinerary.map((dayPlan, i) => (
                      <div key={i} className="relative space-y-1">
                        {/* Dot indicator */}
                        <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-accent-primary border border-white" />
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-accent-sunset">{dayPlan.day}</span>
                          <span className="text-xs text-text-muted font-bold">•</span>
                          <h5 className="text-sm font-bold text-fg-main">{dayPlan.title}</h5>
                        </div>
                        <p className="text-xs text-text-muted leading-relaxed pl-1">
                          {dayPlan.description}
                        </p>
                        {dayPlan.activity && (
                          <div className="inline-block px-2.5 py-0.5 rounded-md bg-fg-main/5 text-[10px] text-accent-primary font-medium pl-1">
                            🎯 Activity: {dayPlan.activity}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Inclusions and Exclusions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Inclusions */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-accent-sunset uppercase tracking-widest">Inclusions</h4>
                    <ul className="space-y-2">
                      {selectedPkg.inclusions.map((inclusion, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs text-text-muted">
                          <Check className="w-4 h-4 text-accent-emerald shrink-0 mt-0.5" />
                          <span>{inclusion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Exclusions */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-accent-sunset uppercase tracking-widest">Exclusions</h4>
                    <ul className="space-y-2">
                      {selectedPkg.exclusions.map((exclusion, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs text-text-muted">
                          <X className="w-4 h-4 text-accent-sunset shrink-0 mt-0.5" />
                          <span>{exclusion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Important Notes */}
                <div className="p-4 rounded-2xl bg-fg-main/5 border border-border-color space-y-2">
                  <h4 className="text-xs font-bold text-fg-main uppercase tracking-widest flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-accent-primary" />
                    Important Traveler Notes
                  </h4>
                  <ul className="space-y-1.5 pl-6 list-disc">
                    {selectedPkg.importantNotes.map((note, i) => (
                      <li key={i} className="text-xs text-text-muted leading-relaxed">
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Footer and Pricing */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border-color">
                  <div>
                    <span className="text-[10px] text-text-muted block">Package Total Price</span>
                    <span className="text-2xl font-black text-accent-sunset">{selectedPkg.price}</span>
                    <span className="text-[11px] text-text-muted"> / per person (Inclusive of taxes)</span>
                  </div>

                  <div className="flex gap-3 w-full sm:w-auto">
                    <button
                      onClick={() => setSelectedPkg(null)}
                      className="flex-1 sm:flex-none px-6 py-3.5 rounded-xl border border-border-color text-text-muted hover:text-fg-main text-xs font-bold transition-all cursor-pointer text-center"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPkg(null);
                        handleBookNow(selectedPkg.id);
                      }}
                      className="flex-1 sm:flex-none px-8 py-3.5 rounded-xl bg-accent-primary text-white text-xs font-bold hover:bg-accent-sunset transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
                    >
                      <CreditCard className="w-4 h-4" />
                      Proceed to Checkout
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

