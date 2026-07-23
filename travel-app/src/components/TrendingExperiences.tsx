"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, MapPin, Clock, ShieldCheck, X, Check, Star, HelpCircle } from "lucide-react";

interface Experience {
  id: number;
  category: string;
  title: string;
  location: string;
  duration: string;
  price: string;
  rating: string;
  image: string;
  features: string[];
  description: string;
  longDescription: string;
  highlights: string[];
  inclusions: string[];
  knowBeforeYouGo: string[];
}

const categories = [
  { id: "beach", label: "🏝️ Beach Escapes" },
  { id: "mountain", label: "⛰️ Mountain Adventures" },
  { id: "culture", label: "⛩️ Cultural Tours" },
  { id: "luxury", label: "👑 Luxury Vacations" },
  { id: "wildlife", label: "🐆 Wildlife Safaris" },
];

const experiencesData: Experience[] = [
  // Beach Escapes
  {
    id: 1,
    category: "beach",
    title: "Houseboat Sunset Cruise",
    location: "Alleppey Backwaters, Kerala",
    duration: "3 Hours",
    price: "₹3,500",
    rating: "4.9",
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80",
    features: ["Private Deck Dining", "Sunset Views", "Local Chef"],
    description: "Glide through Kerala's serene backwaters on a traditional luxury Kettuvallam (houseboat) as the sun sets.",
    longDescription: "Experience the ultimate tranquility of Kerala's famous backwaters. This private houseboat cruise takes you through the narrow canals of Alleppey, lined with coconut palms and local villages. Enjoy traditional Kerala snacks and a freshly prepared dinner by our on-board personal chef while enjoying the golden hour over the lake.",
    highlights: [
      "Private cruise on a premium traditional wooden houseboat",
      "Spectacular sunset viewing from the upper deck lounge",
      "Freshly prepared Kerala cuisine & local refreshments",
      "Pass through scenic village waterways and paddy fields"
    ],
    inclusions: [
      "3-Hour private houseboat hire",
      "Welcome tender coconut drink & local snacks",
      "Traditional Kerala buffet dinner (Veg & Non-Veg options)",
      "Dedicated Captain, Chef, and Host on board"
    ],
    knowBeforeYouGo: [
      "Reporting time is 15 minutes before the departure.",
      "Life jackets are available on board and mandatory during transit.",
      "Wear comfortable slip-on footwear."
    ]
  },
  {
    id: 2,
    category: "beach",
    title: "North Goa Beach Hopping Tour",
    location: "Baga • Anjuna • Vagator, Goa",
    duration: "6 Hours",
    price: "₹2,200",
    rating: "4.8",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80",
    features: ["AC Transport", "Beach Guide", "Seafood Lunch"],
    description: "Explore the historic forts, vibrant shacks, and sandy shores of North Goa in comfort.",
    longDescription: "Uncover the best of North Goa's coastal charm. From the panoramic views at Chapora Fort (Dil Chahta Hai fame) to the bustling sands of Baga and the bohemian vibes of Anjuna. This guided tour features local insights, historical context of Portuguese rule, and a delicious beachside lunch.",
    highlights: [
      "Visit Chapora Fort & enjoy sweeping Arabian Sea views",
      "Relax at Vagator, Anjuna, and Baga beaches",
      "Indulge in a Goan fish curry or vegetarian lunch at a top-rated shack",
      "Safe and comfortable air-conditioned private transfers"
    ],
    inclusions: [
      "Pick-up and drop-off from North Goa hotels",
      "Experienced local English/Hindi speaking driver-guide",
      "Traditional Goan lunch & one complimentary beverage",
      "All toll taxes and parking fees"
    ],
    knowBeforeYouGo: [
      "Carry swimwear, sunscreen, sunglasses, and a change of clothes.",
      "Footwear with good grip is recommended for climbing chapora fort steps.",
      "Respect local customs when entering religious shrines nearby."
    ]
  },
  // Mountain
  {
    id: 3,
    category: "mountain",
    title: "Rohtang Pass Snow Adventure",
    location: "Manali, Himachal Pradesh",
    duration: "8 Hours",
    price: "₹3,800",
    rating: "4.9",
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80",
    features: ["Snow Activities", "Scenic Drive", "Hot Lunch"],
    description: "Ascend to 13,058 ft for breathtaking Himalayan views, snow sports, and alpine beauty.",
    longDescription: "Embark on an unforgettable journey to the legendary Rohtang Pass, the gateway to Lahaul and Spiti. Witness dramatic landscapes, towering peaks, and deep valleys covered in pristine white snow. Ideal for adventure seekers wanting to try skiing, snowboarding, or snowmobile rides in the Himalayas.",
    highlights: [
      "Travel along the spectacular Manali-Leh highway with majestic views",
      "Play in year-round snow at the summit of Rohtang Pass",
      "Scenic stops at Solang Valley and Rahala Waterfalls",
      "Ample time for skiing, sledging, and photography"
    ],
    inclusions: [
      "Permits for Rohtang Pass entry",
      "Shared or private 4x4 SUV transfer from Manali hotel",
      "Hot lunch at a local Himachali dhaba",
      "Professional tour coordinator"
    ],
    knowBeforeYouGo: [
      "Rohtang Pass is subject to weather conditions and government permits.",
      "Heavy woolen clothes and snow boots can be rented on the way.",
      "Carry basic motion sickness medicine for winding mountain roads."
    ]
  },
  {
    id: 4,
    category: "mountain",
    title: "Valley of Flowers Trek",
    location: "Chamoli, Uttarakhand",
    duration: "Full Day",
    price: "₹4,500",
    rating: "4.85",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80",
    features: ["Expert Trek Guide", "Packed Meals", "Safety Gear"],
    description: "Trek through a UNESCO World Heritage Site filled with endemic alpine flowers and diverse flora.",
    longDescription: "Step into a floral wonderland. Located in the transition zone between the Zanskar and Great Himalaya ranges, the Valley of Flowers is famous for its meadows of endemic alpine flowers and outstanding natural beauty. This guided day trek from Ghangaria takes you deep into the national park where you can spot rare orchids, poppies, and primulas.",
    highlights: [
      "Walk among thousands of blooming alpine flowers in a UNESCO site",
      "Stunning views of snow-clad peaks, waterfalls, and Pushpawati river",
      "Spot rare wildlife and high-altitude birds",
      "Guided by certified mountain guides with safety equipment"
    ],
    inclusions: [
      "National Park entry permits and forest fees",
      "Certified wilderness first-aid responder guide",
      "Nutritious packed lunch and high-energy trail snacks",
      "Trekking poles and emergency oxygen support"
    ],
    knowBeforeYouGo: [
      "This is a moderate-to-difficult trek requiring good physical fitness.",
      "Rainwear is essential as weather changes rapidly in the valley.",
      "Do not pluck flowers or litter; this is a strictly protected biosphere."
    ]
  },
  // Culture
  {
    id: 5,
    category: "culture",
    title: "Varanasi Ganga Aarti Experience",
    location: "Dashashwamedh Ghat, Varanasi",
    duration: "3 Hours",
    price: "₹1,800",
    rating: "4.95",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Ghats_of_Varanasi_-_Ganga_aarti_-_Dashashwamedh_Ghat.jpg/960px-Ghats_of_Varanasi_-_Ganga_aarti_-_Dashashwamedh_Ghat.jpg",
    features: ["Boat Ride on Ganga", "Airtight Ceremony", "Heritage Walk"],
    description: "Witness the spectacular evening Ganga Aarti from a private boat on the holy river.",
    longDescription: "Immerse yourself in the spiritual heartbeat of India. Begin with a guided heritage walk through the ancient, narrow alleys of Varanasi, exploring historical temples. Board a private wooden boat to watch the mystical evening prayer ceremony (Ganga Aarti) at Dashashwamedh Ghat from the best vantage point on the water.",
    highlights: [
      "Walk through the oldest continuously inhabited streets in the world",
      "Private boat ride at twilight on the sacred Ganges River",
      "Prime viewing of the Ganga Aarti with fire, chants, and bells",
      "Release floating oil lamps (diyas) into the river for blessings"
    ],
    inclusions: [
      "Expert cultural narrator/guide",
      "Private wooden hand-rowed or motor boat",
      "Traditional snacks (Kachori & Lassi) and bottled water",
      "Flower offering lamps (diyas)"
    ],
    knowBeforeYouGo: [
      "Dress modestly; shoulders and knees should be covered.",
      "Be prepared for large crowds around the ghats during the Aarti.",
      "Keep cameras steady during the boat ride."
    ]
  },
  {
    id: 6,
    category: "culture",
    title: "Amber Fort & City Palace Tour",
    location: "Jaipur, Rajasthan",
    duration: "5 Hours",
    price: "₹2,500",
    rating: "4.8",
    image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80",
    features: ["Skip-the-line Entry", "Certified Guide", "Elephant Ride"],
    description: "Step back in time to the era of Rajput royalty with a guided tour of Jaipur's prime palaces.",
    longDescription: "Unveil the regal history of the Pink City. This tour covers the spectacular Amber Fort, built with red sandstone and marble, complete with the famous Sheesh Mahal (Mirror Palace). Next, visit the City Palace in the heart of Jaipur, displaying an exceptional blend of Rajput and Mughal architecture.",
    highlights: [
      "Skip the long queues at the fort entrance with pre-booked tickets",
      "Explore Sheesh Mahal, Diwan-i-Khas, and beautiful palace courtyards",
      "In-depth historical storytelling by a state-certified historian guide",
      "Photo opportunities at the iconic Jal Mahal (Water Palace)"
    ],
    inclusions: [
      "All monument entry tickets (Amber Fort & City Palace)",
      "Skip-the-line fast track access",
      "Government-approved expert tourist guide",
      "Eco-friendly electric cart ride up to Amber Fort"
    ],
    knowBeforeYouGo: [
      "Wear comfortable walking shoes as the fort involves climbing steps.",
      "Carry a hat, sunglasses, and sunscreen.",
      "Shopping stops are completely optional; inform the guide of your preferences."
    ]
  },
  // Luxury
  {
    id: 7,
    category: "luxury",
    title: "Palace Hotel Royal Dinner",
    location: "Taj Lake Palace, Udaipur",
    duration: "3 Hours",
    price: "₹12,000",
    rating: "4.95",
    image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80",
    features: ["Lake View Dining", "Live Folk Music", "Private Boat Transfer"],
    description: "An exclusive 4-course royal dinner at the floating marble palace of Lake Pichola.",
    longDescription: "Dine like the Mewar kings at the world-famous Taj Lake Palace. Perched in the center of Lake Pichola, this architectural marvel offers unparalleled views of the City Palace and the Aravali hills. Enjoy a curated multi-course menu featuring royal Mewari recipes, paired with premium drinks and classical folk dances.",
    highlights: [
      "Private round-trip boat transfer from the city jetty to the palace",
      "Exquisite lake-facing seating with candlelit setup",
      "Authentic 4-course Royal Mewari menu tailored by executive chefs",
      "Live performance of traditional Rajasthani strings and dance"
    ],
    inclusions: [
      "Jetty transfers to and from Lake Palace",
      "Curated 4-course royal meal",
      "A glass of fine wine or premium welcome mocktail",
      "Personal butler service"
    ],
    knowBeforeYouGo: [
      "Smart-casual or traditional Indian attire is highly recommended.",
      "Prior table reservation is mandatory; walk-ins are not permitted.",
      "Inform the chef about any food allergies at the start of your experience."
    ]
  },
  {
    id: 8,
    category: "luxury",
    title: "Ayurvedic Luxury Spa Retreat",
    location: "Kovalam, Kerala",
    duration: "Half Day",
    price: "₹8,500",
    rating: "4.9",
    image: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&q=80",
    features: ["Ayurvedic Massage", "Herbal Steam Bath", "Yoga Session"],
    description: "Rejuvenate your body, mind, and soul with a personalized ancient healing therapy.",
    longDescription: "Experience authentic wellness on the shores of Kovalam. Under the guidance of certified Ayurvedic doctors, receive a personalized Abhyanga massage using medicated herbal oils. Followed by a soothing herbal steam bath and a relaxing oceanfront yoga session to align your energy centers.",
    highlights: [
      "Consultation with a certified Ayurvedic physician",
      "90-Minute full body Abhyanga massage by professional therapists",
      "Traditional medicated herbal steam treatment",
      "Sunset yoga and meditation session overlooking the Arabian Sea"
    ],
    inclusions: [
      "Doctor consultation and pulse diagnosis",
      "Full body massage and steam treatment",
      "Organic Ayurvedic wellness juice & herbal teas",
      "Use of spa facilities (infinity pool, relaxation lounge)"
    ],
    knowBeforeYouGo: [
      "Avoid eating a heavy meal at least 2 hours before the treatment.",
      "Disposable spa garments will be provided.",
      "Wear comfortable, loose clothing for the yoga session."
    ]
  },
  // Wildlife
  {
    id: 9,
    category: "wildlife",
    title: "Tiger Safari at Ranthambore",
    location: "Ranthambore National Park, Rajasthan",
    duration: "4 Hours",
    price: "₹5,500",
    rating: "4.9",
    image: "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=800&q=80",
    features: ["Naturalist Guide", "Open Jeep Safari", "Bird Watching"],
    description: "Search for Bengal Tigers, leopards, and crocodiles in their natural forest habitat.",
    longDescription: "Venture into the ancient hunting grounds of the Jaipur Maharajas. Ranthambore is globally famous for its friendly Bengal Tigers, which can easily be spotted even during the daytime. Travel in an open-topped Gypsy through deep deciduous forests, rocky hills, and lakes, accompanied by an expert tracker.",
    highlights: [
      "Explore Ranthambore's core zones in a shared/private open Gypsy",
      "Excellent opportunities to photograph wild Bengal Tigers in action",
      "Visit historical 10th-century fort ruins inside the reserve",
      "Spot leopards, marsh crocodiles, sambar deer, and rare birds"
    ],
    inclusions: [
      "Forest department safari permits and entry fees",
      "Open 6-seater Gypsy or 20-seater Cantor seating",
      "Certified forest naturalist & wildlife guide",
      "Complimentary water bottle and binoculars for sharing"
    ],
    knowBeforeYouGo: [
      "Safaris must be booked well in advance due to strict daily zone quotas.",
      "Wear neutral, earthy-colored clothes (khaki, green, brown).",
      "Morning safaris can be very cold, while afternoon safaris are warm."
    ]
  },
  {
    id: 10,
    category: "wildlife",
    title: "Elephant Interaction Experience",
    location: "Periyar Wildlife Sanctuary, Kerala",
    duration: "3 Hours",
    price: "₹3,200",
    rating: "4.8",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Elephant_Periyar.jpg/960px-Elephant_Periyar.jpg",
    features: ["Elephant Bathing", "Forest Walk", "Wildlife Guide"],
    description: "Spend a day feeding, bathing, and bonding ethically with gentle giants in the forest.",
    longDescription: "Connect with nature in the most beautiful way. At this ethical conservation camp in Periyar, you will spend quality time learning about elephant behavior from their mahouts. Help feed them their favorite fruits, scrub them down during their bath time in the river, and walk alongside them on a forest trail.",
    highlights: [
      "Join the mahouts in scrubbing and washing elephants in the stream",
      "Prepare special food balls and feed them to the elephants",
      "Guided walk through spice plantations and natural forest trails",
      "Learn about elephant communication, diet, and conservation efforts"
    ],
    inclusions: [
      "Sanctuary and eco-tourism camp entry tickets",
      "Elephant feeding fruits and raw materials",
      "Mahout narrator and plantation guide",
      "Traditional Kerala lunch served on a banana leaf"
    ],
    knowBeforeYouGo: [
      "This is an ethical, no-riding elephant encounter program.",
      "Bring a quick-drying towel and a change of clothes as you will get wet.",
      "Use eco-friendly insect repellent."
    ]
  },
];

export default function TrendingExperiences() {
  const [activeCategory, setActiveCategory] = useState("beach");
  const [selectedExp, setSelectedExp] = useState<Experience | null>(null);

  const filteredData = experiencesData.filter(
    (exp) => exp.category === activeCategory
  );

  return (
    <section id="experiences" className="py-24 bg-card-bg/25 border-y border-border-color">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-accent-sunset uppercase tracking-widest block mb-2">
            Trending Experiences
          </span>
          <h2 className="font-heading font-black text-3xl md:text-5xl text-fg-main tracking-tight mb-4">
            Curated Local Experiences
          </h2>
          <p className="text-sm text-text-muted">
            Move beyond simple sightseeing. Discover handpicked local tours, adventures, and experiences led by verified experts across India.
          </p>
        </div>

        {/* Filter Switcher Menu */}
        <div className="flex flex-wrap justify-center items-center gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-3 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer ${
                activeCategory === cat.id
                  ? "bg-accent-primary text-white shadow-md shadow-accent-primary/20 scale-[1.03]"
                  : "glassmorphism hover:bg-card-bg/60 text-fg-main"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Experiences Grid */}
        <div className="min-h-[460px]">
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            <AnimatePresence mode="popLayout">
              {filteredData.map((exp) => (
                <motion.div
                  layout
                  key={exp.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col sm:flex-row rounded-3xl overflow-hidden glassmorphism border border-border-color shadow-premium group"
                >
                  {/* Left Column Image */}
                  <div className="relative w-full sm:w-2/5 h-48 sm:h-auto overflow-hidden">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                      style={{ backgroundImage: `url(${exp.image})` }}
                    />
                  </div>

                  {/* Right Column Details */}
                  <div className="w-full sm:w-3/5 p-6 flex flex-col justify-between">
                    <div>
                      {/* Location link */}
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-accent-sunset uppercase tracking-wider mb-2">
                        <MapPin className="w-3.5 h-3.5 text-accent-primary" />
                        {exp.location}
                      </span>
                      
                      {/* Title */}
                      <h3 className="font-heading font-extrabold text-xl text-fg-main tracking-tight leading-snug mb-3 group-hover:text-accent-primary transition-colors">
                        {exp.title}
                      </h3>

                      {/* Snippet Description */}
                      <p className="text-xs text-text-muted mb-4 line-clamp-2">
                        {exp.description}
                      </p>

                      {/* Features */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {exp.features.map((feat) => (
                          <span
                            key={feat}
                            className="flex items-center gap-1 text-[9px] font-medium text-text-muted bg-fg-main/5 px-2.5 py-1 rounded-md"
                          >
                            <ShieldCheck className="w-3 h-3 text-accent-primary" />
                            {feat}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center border-t border-border-color pt-4 mt-2">
                      <div className="flex items-center gap-1.5 text-xs text-text-muted">
                        <Clock className="w-3.5 h-3.5 text-accent-primary" />
                        {exp.duration}
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-[10px] text-text-muted block leading-none">Starting at</span>
                          <span className="text-base font-extrabold text-accent-sunset">{exp.price}</span>
                        </div>
                        
                        <button 
                          onClick={() => setSelectedExp(exp)}
                          className="px-4 py-2 rounded-xl bg-accent-primary text-white text-xs font-bold shadow-md hover:bg-accent-sunset transition-colors duration-200 cursor-pointer flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Experience Details Modal */}
      <AnimatePresence>
        {selectedExp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedExp(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-3xl glassmorphism border border-white/10 shadow-2xl z-10 flex flex-col scrollbar-thin scrollbar-thumb-white/10"
            >
              {/* Top Image Banner */}
              <div className="relative h-64 md:h-80 w-full shrink-0">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${selectedExp.image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                
                {/* Close Button */}
                <button
                  onClick={() => setSelectedExp(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-white/20 transition-all border border-white/10 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Info Overlay */}
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded bg-accent-primary text-white text-[10px] font-bold uppercase tracking-wider">
                      {selectedExp.category}
                    </span>
                  </div>
                  <h2 className="font-heading font-black text-2xl md:text-3xl tracking-tight mb-2">
                    {selectedExp.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-white/80">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-accent-sunset" />
                      {selectedExp.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-accent-primary" />
                      {selectedExp.duration}
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 md:p-8 space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-accent-sunset uppercase tracking-widest mb-2">Overview</h4>
                  <p className="text-sm text-text-muted leading-relaxed">
                    {selectedExp.longDescription}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Highlights */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-accent-sunset uppercase tracking-widest">Activity Highlights</h4>
                    <ul className="space-y-2">
                      {selectedExp.highlights.map((highlight, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs text-text-muted">
                          <Check className="w-4 h-4 text-accent-emerald shrink-0 mt-0.5" />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Inclusions */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-accent-sunset uppercase tracking-widest">What's Included</h4>
                    <ul className="space-y-2">
                      {selectedExp.inclusions.map((inclusion, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs text-text-muted">
                          <Check className="w-4 h-4 text-accent-primary shrink-0 mt-0.5" />
                          <span>{inclusion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Know Before You Go */}
                <div className="p-4 rounded-2xl bg-fg-main/5 border border-border-color space-y-2">
                  <h4 className="text-xs font-bold text-fg-main uppercase tracking-widest flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-accent-primary" />
                    Know Before You Go
                  </h4>
                  <ul className="space-y-1.5 pl-6 list-disc">
                    {selectedExp.knowBeforeYouGo.map((item, i) => (
                      <li key={i} className="text-xs text-text-muted leading-relaxed">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Footer Price & View Info */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border-color">
                  <div>
                    <span className="text-[10px] text-text-muted block">Estimated Price</span>
                    <span className="text-2xl font-black text-accent-sunset">{selectedExp.price}</span>
                    <span className="text-[11px] text-text-muted"> / person</span>
                  </div>

                  <button
                    onClick={() => setSelectedExp(null)}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-accent-primary text-white text-xs font-bold hover:bg-accent-sunset transition-all cursor-pointer text-center"
                  >
                    Got It, Thanks!
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
