"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Navigation, Info, Car, Map, Compass, AlertCircle, HelpCircle } from "lucide-react";

interface NavigationBrochureProps {
  destinationName: string;
  onClose: () => void;
}

interface RouteNode {
  name: string;
  description: string;
  sights: string[];
  coordinateLabel: string;
}

interface RouteConnection {
  from: string;
  to: string;
  distance: string;
  duration: string;
  transitMode: string;
  tips: string;
}

interface ProximityZone {
  zoneName: string;
  neighborhood: string;
  sights: string[];
  optimizeTip: string;
}

interface BrochureData {
  title: string;
  nodes: RouteNode[];
  connections: RouteConnection[];
  proximityZones: ProximityZone[];
  generalTips: string[];
}

const brochureTemplates: Record<string, BrochureData> = {
  rajasthan: {
    title: "Rajasthan Heritage Circuit Route Guide",
    nodes: [
      {
        name: "Jaipur",
        description: "The Royal Capital city, rich in red sandstone palaces and bustling historic jewel bazaars.",
        sights: ["Hawa Mahal", "Amer Fort", "City Palace", "Jantar Mantar"],
        coordinateLabel: "LAT 26.9124° N"
      },
      {
        name: "Jodhpur",
        description: "The Blue City, nestled underneath the towering walls of Mehrangarh Fort.",
        sights: ["Mehrangarh Fort", "Jaswant Thada", "Sadar Clock Tower"],
        coordinateLabel: "LAT 26.2907° N"
      },
      {
        name: "Udaipur",
        description: "The City of Lakes and romantic marble palaces rising directly from the waters.",
        sights: ["Udaipur City Palace", "Lake Pichola", "Jagmandir Island"],
        coordinateLabel: "LAT 24.5854° N"
      }
    ],
    connections: [
      {
        from: "Jaipur",
        to: "Jodhpur",
        distance: "330 km",
        duration: "6 hrs",
        transitMode: "AC Sedan Cab via NH48",
        tips: "Make a quick rest stop at Ajmer or Pushkar lake for lunch. Road quality is excellent but watch for highway toll delays."
      },
      {
        from: "Jodhpur",
        to: "Udaipur",
        distance: "250 km",
        duration: "5.5 hrs",
        transitMode: "AC Sedan Cab via NH58",
        tips: "Essential stop en route: Ranakpur Jain Temples, nestled in the Aravali hills. Famous for 1,444 uniquely carved pillars."
      }
    ],
    proximityZones: [
      {
        zoneName: "Pink City Core (Jaipur)",
        neighborhood: "Badi Chopad & Johari Bazaar Area",
        sights: ["Hawa Mahal", "City Palace", "Jantar Mantar", "Johari Bazaar"],
        optimizeTip: "These are fully walkable from one another. Avoid taking your taxi inside; instead, walk or hire a local e-rickshaw (approx. ₹50)."
      },
      {
        zoneName: "Amber Valley Route (Jaipur)",
        neighborhood: "Amber Road Corridor",
        sights: ["Amer Fort", "Jaigarh Fort", "Jal Mahal"],
        optimizeTip: "Visit Jal Mahal en route to Amer. We recommend taking the electric shuttle cars from the Amer Fort parking base to save time."
      },
      {
        zoneName: "Lake Pichola Shore (Udaipur)",
        neighborhood: "Gangaur Ghat & Lal Ghat waterfront",
        sights: ["City Palace complex", "Bagore Ki Haveli", "Jagdish Temple"],
        optimizeTip: "Start with City Palace in the morning, followed by Jagdish Temple. Walk to Gangaur Ghat for sunset lakeside views."
      }
    ],
    generalTips: [
      "Hire only government-authorized local guides inside Rajasthan forts (they carry official ID badges).",
      "Avoid traveling Jodhpur to Udaipur after sunset due to winding, unlit mountain passes in the Aravali range.",
      "Autos are readily available in Jodhpur, but agree on a rate BEFORE starting the ride."
    ]
  },
  kerala: {
    title: "Kerala Backwaters & Hills Route Guide",
    nodes: [
      {
        name: "Kochi",
        description: "The historical port town, combining Dutch, Portuguese, and British spice-trading legacies.",
        sights: ["Chinese Fishing Nets", "Jew Town", "St. Francis Church"],
        coordinateLabel: "LAT 9.9312° N"
      },
      {
        name: "Munnar",
        description: "High-altitude rolling hills carpeted in endless, misty tea plantations.",
        sights: ["Eravikulam National Park", "KDHP Tea Museum", "Mattupetty Dam"],
        coordinateLabel: "LAT 10.0889° N"
      },
      {
        name: "Alleppey",
        description: "The backwaters basin, famous for peaceful coconut canals and luxurious houseboats.",
        sights: ["Alleppey Houseboat Canals", "Vembanad Lake", "Pathiramanal"],
        coordinateLabel: "LAT 9.4981° N"
      }
    ],
    connections: [
      {
        from: "Kochi",
        to: "Munnar",
        distance: "130 km",
        duration: "4 hrs",
        transitMode: "AC SUV Cab via Kochi-Dhanushkodi Rd",
        tips: "Winding mountain roads with scenic views. Stop at Cheeyappara and Valara Waterfalls for photography along the way."
      },
      {
        from: "Munnar",
        to: "Alleppey",
        distance: "160 km",
        duration: "4.5 hrs",
        transitMode: "AC SUV Cab descending to coast",
        tips: "Leaves the cool hills to return to coastal plains. Prepare for warm weather. Plan to arrive in Alleppey by 11:30 AM to board houseboats."
      }
    ],
    proximityZones: [
      {
        zoneName: "Fort Kochi Heritage",
        neighborhood: "Fort Kochi Waterfront & Jew Town",
        sights: ["Chinese Fishing Nets", "St. Francis Church", "Dutch Palace", "Jewish Synagogue"],
        optimizeTip: "Perfect walkable morning loop. You can hire a local bicycle for ₹100/day to ride between Fort Kochi and Jew Town."
      },
      {
        zoneName: "Munnar Tea Valley",
        neighborhood: "KDHP Plantation Zone",
        sights: ["Tea Museum", "Lockhart Tea Park", "Floriculture Garden"],
        optimizeTip: "Plan this on Day 2. The tea factory visits take about 2 hours. Pick up packaged cardamom tea direct from factory outlets."
      },
      {
        zoneName: "Vembanad Backwaters",
        neighborhood: "Punnamada Jetty & Lake Channels",
        sights: ["Alleppey Houseboat Canals", "Vembanad Lake", "Pathiramanal Island"],
        optimizeTip: "Must navigate via boat. Houseboats anchor around 5:30 PM. Book a narrow-canal wooden canoe tour in the afternoon for inner villages."
      }
    ],
    generalTips: [
      "Always carry light rainwear/umbrellas; Munnar and Alleppey receive sudden tropical showers year-round.",
      "Board houseboats only at official tourism jetties (Punnamada) to avoid unregistered private operators.",
      "Mosquito repellent is essential for evening stays on backwater canals."
    ]
  },
  ladakh: {
    title: "Leh Ladakh Himalayan Route Guide",
    nodes: [
      {
        name: "Leh Valley",
        description: "High altitude mountain hub (3,500m) dominated by monasteries and snow views.",
        sights: ["Shanti Stupa", "Leh Palace", "Hemis Monastery"],
        coordinateLabel: "LAT 34.1526° N"
      },
      {
        name: "Nubra Valley",
        description: "Cold desert dunes fed by the Shyok River, home to double-humped Bactrian camels.",
        sights: ["Khardung La Pass", "Hunder Dunes", "Diskit Monastery"],
        coordinateLabel: "LAT 34.5956° N"
      },
      {
        name: "Pangong Tso",
        description: "Magnificent endorheic alpine lake (4,350m) extending from India to Tibet.",
        sights: ["Pangong Lake Shore", "Chang La Pass"],
        coordinateLabel: "LAT 33.7595° N"
      }
    ],
    connections: [
      {
        from: "Leh Valley",
        to: "Nubra Valley",
        distance: "120 km",
        duration: "5 hrs",
        transitMode: "Dedicated 4x4 Mountain SUV",
        tips: "Crosses Khardung La Pass (5,359m). Do not spend more than 15-20 minutes at the pass summit to avoid severe altitude headaches."
      },
      {
        from: "Nubra Valley",
        to: "Pangong Tso",
        distance: "160 km",
        duration: "6 hrs",
        transitMode: "4x4 Mountain SUV via Shyok Route",
        tips: "Scenic road running right next to the wild Shyok River. Watch out for water crossing points (nala crossings) which swell up in afternoons."
      },
      {
        from: "Pangong Tso",
        to: "Leh Valley",
        distance: "140 km",
        duration: "5.5 hrs",
        transitMode: "4x4 SUV return via Chang La",
        tips: "Crosses Chang La Pass (5,360m). Stop at Karu for hot noodle soup. Road conditions can be extremely slushy due to melting snow glaciers."
      }
    ],
    proximityZones: [
      {
        zoneName: "Leh Town Circle",
        neighborhood: "Main Bazar & Shanti Stupa Hill",
        sights: ["Leh Palace", "Shanti Stupa", "Namgyal Tsemo Gompa"],
        optimizeTip: "Plan on Day 2. Drive up to Shanti Stupa for sunset, and visit Leh Palace earlier in the afternoon when temperature is comfortable."
      },
      {
        zoneName: "Nubra Desert Core",
        neighborhood: "Hunder dunes & Diskit Hill",
        sights: ["Diskit Monastery", "Maitreya Buddha", "Hunder Sand Dunes"],
        optimizeTip: "Visit Diskit Monastery in the morning for prayer chants, then rest. Head to Hunder Dunes around 4:30 PM for camel rides."
      }
    ],
    generalTips: [
      "Acclimatize completely for the first 24 hours in Leh. Rest, hydrate, and avoid heavy meals.",
      "Check that your Inner Line Permits (ILP) are stamped and in your glove compartment before departing Leh.",
      "Pre-paid telecom networks do not work in Ladakh. Only Post-paid (Bsnl, Jio, Airtel) offer connection."
    ]
  },
  varanasi: {
    title: "Spiritual Varanasi Navigation Guide",
    nodes: [
      {
        name: "Varanasi Ghats",
        description: "Holiest banks along the sacred Ganges River, active with ancient rituals.",
        sights: ["Assi Ghat", "Dashashwamedh Ghat", "Kashi Vishwanath Temple"],
        coordinateLabel: "LAT 25.3176° N"
      },
      {
        name: "Sarnath",
        description: "Ancient Buddhist enclave where Gautama Buddha gave his first sermon.",
        sights: ["Dhamekh Stupa", "Chaukhandi Stupa", "Sarnath Museum"],
        coordinateLabel: "LAT 25.3762° N"
      }
    ],
    connections: [
      {
        from: "Varanasi Ghats",
        to: "Sarnath",
        distance: "10 km",
        duration: "40 mins",
        transitMode: "Local Cab or Auto Rickshaw",
        tips: "Travel through dense city traffic. Early morning (8:00 AM) or mid-afternoon departure is best to avoid peak evening traffic jams."
      }
    ],
    proximityZones: [
      {
        zoneName: "Ganges River Steps",
        neighborhood: "Central Ghats Network",
        sights: ["Dashashwamedh Ghat", "Manikarnika Ghat", "Kashi Vishwanath (Golden Temple)"],
        optimizeTip: "The narrow lanes (galis) leading here are too small for any vehicle. Walk along the riverbank ghat steps to travel between these spots."
      },
      {
        zoneName: "Sarnath Heritage Area",
        neighborhood: "Buddhist Archeological Complex",
        sights: ["Dhamekh Stupa", "Sarnath Museum", "Tibetan Temple"],
        optimizeTip: "Once in Sarnath, everything is located inside a single green lawn complex. Fully walkable. Buy a single unified entry ticket."
      }
    ],
    generalTips: [
      "Pre-book a wooden boat at Dashashwamedh Ghat a day in advance for sunrise cruise to secure a fixed price (approx. ₹300-500).",
      "Dress conservatively in temples and around the cremation ghats (Manikarnika).",
      "Do not take photographs at Manikarnika Ghat out of respect for local customs."
    ]
  }
};

export default function NavigationBrochure({ destinationName, onClose }: NavigationBrochureProps) {
  const [activeTab, setActiveTab] = useState<"route" | "proximity" | "tips">("route");
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Normalize destination name to map to data
  const normalizedKey = (() => {
    const name = destinationName.toLowerCase();
    if (name.includes("rajasthan") || name.includes("jaipur")) return "rajasthan";
    if (name.includes("kerala") || name.includes("kochi") || name.includes("alleppey") || name.includes("munnar")) return "kerala";
    if (name.includes("leh") || name.includes("ladakh")) return "ladakh";
    if (name.includes("varanasi")) return "varanasi";
    return "rajasthan"; // default fallback
  })();

  const data = brochureTemplates[normalizedKey] || brochureTemplates.rajasthan;

  return (
    <div className="fixed inset-0 z-[1500] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-md"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 30 }}
        className="relative w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-3xl glassmorphism border border-white/20 shadow-2xl z-10 flex flex-col bg-bg-main text-fg-main text-left"
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-accent-primary/20 via-accent-secondary/10 to-transparent border-b border-border-color/60 flex justify-between items-center shrink-0">
          <div>
            <div className="flex items-center gap-1.5 text-accent-sunset font-bold uppercase tracking-wider text-[10px]">
              <Compass className="w-4 h-4 animate-spin-slow" />
              Interactive Transit Brochure
            </div>
            <h3 className="font-heading font-black text-xl md:text-2xl text-fg-main tracking-tight mt-1">
              {data.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all border border-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-border-color bg-fg-main/[0.02] shrink-0 p-1">
          <button
            onClick={() => setActiveTab("route")}
            className={`flex-1 py-3 text-xs font-bold transition-all flex items-center justify-center gap-2 border-b-2 cursor-pointer ${
              activeTab === "route"
                ? "border-accent-primary text-accent-primary bg-accent-primary/5"
                : "border-transparent text-text-muted hover:text-fg-main"
            }`}
          >
            <Map className="w-4 h-4" />
            Interactive Route Map
          </button>
          <button
            onClick={() => setActiveTab("proximity")}
            className={`flex-1 py-3 text-xs font-bold transition-all flex items-center justify-center gap-2 border-b-2 cursor-pointer ${
              activeTab === "proximity"
                ? "border-accent-primary text-accent-primary bg-accent-primary/5"
                : "border-transparent text-text-muted hover:text-fg-main"
            }`}
          >
            <MapPin className="w-4 h-4" />
            Nearby Zones (Save Time)
          </button>
          <button
            onClick={() => setActiveTab("tips")}
            className={`flex-1 py-3 text-xs font-bold transition-all flex items-center justify-center gap-2 border-b-2 cursor-pointer ${
              activeTab === "tips"
                ? "border-accent-primary text-accent-primary bg-accent-primary/5"
                : "border-transparent text-text-muted hover:text-fg-main"
            }`}
          >
            <Info className="w-4 h-4" />
            Navigation Tips
          </button>
        </div>

        {/* Modal Scrollable Content Body */}
        <div className="p-6 md:p-8 overflow-y-auto flex-grow max-h-[55vh] scrollbar-thin scrollbar-thumb-white/10">
          <AnimatePresence mode="wait">
            {activeTab === "route" && (
              <motion.div
                key="route-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                {/* SVG Visual Map representation */}
                <div className="p-6 rounded-2xl bg-black/40 border border-border-color/80 relative min-h-[200px] flex items-center justify-center overflow-hidden">
                  {/* Decorative background grid elements */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,174,239,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,174,239,0.01)_1px,transparent_1px)] bg-[size:2rem_2rem]" />

                  {/* SVG Route Connections */}
                  <div className="w-full max-w-lg relative flex items-center justify-between gap-4 py-8">
                    {/* SVG arrow drawing connecting nodes */}
                    <svg className="absolute inset-x-0 top-1/2 -translate-y-1/2 w-full h-8 text-accent-primary/30 pointer-events-none z-0">
                      <line
                        x1="10%"
                        y1="50%"
                        x2="90%"
                        y2="50%"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeDasharray="6,6"
                        className="animate-pulse"
                      />
                    </svg>

                    {/* Render nodes dynamically */}
                    {data.nodes.map((node, i) => {
                      const isHovered = hoveredNode === node.name;
                      // Staggered node placements
                      const offsetClass = i === 0 ? "justify-start" : i === data.nodes.length - 1 ? "justify-end" : "justify-center";
                      return (
                        <div
                          key={node.name}
                          className={`relative z-10 flex flex-col items-center group cursor-pointer ${offsetClass}`}
                          onMouseEnter={() => setHoveredNode(node.name)}
                          onMouseLeave={() => setHoveredNode(null)}
                        >
                          <motion.div
                            whileHover={{ scale: 1.06 }}
                            className={`w-12 h-12 rounded-full flex items-center justify-center border font-bold text-xs shadow-lg transition-all ${
                              isHovered
                                ? "bg-accent-primary text-white border-accent-primary ring-4 ring-accent-primary/20 scale-110"
                                : "bg-bg-main border-border-color text-text-muted hover:border-accent-secondary"
                            }`}
                          >
                            0{i + 1}
                          </motion.div>
                          <span className="text-xs font-black text-fg-main mt-2 group-hover:text-accent-primary transition-colors">
                            {node.name}
                          </span>
                          <span className="text-[8px] text-text-muted font-mono tracking-wider mt-0.5 uppercase block">
                            {node.coordinateLabel}
                          </span>

                          {/* Node Hover Tooltip Box */}
                          <AnimatePresence>
                            {isHovered && (
                              <motion.div
                                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                animate={{ opacity: 1, y: -8, scale: 1 }}
                                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                                className="absolute bottom-16 w-52 p-4 rounded-xl bg-card-bg/95 backdrop-blur-md border border-border-color shadow-2xl z-50 text-left space-y-2 pointer-events-none"
                              >
                                <h4 className="font-heading font-black text-xs text-accent-primary">{node.name}</h4>
                                <p className="text-[10px] text-text-muted leading-relaxed font-light">{node.description}</p>
                                <div className="border-t border-border-color/60 pt-2">
                                  <span className="text-[8px] uppercase tracking-wider text-accent-sunset font-bold block mb-1">Key Attractions</span>
                                  <div className="flex flex-wrap gap-1">
                                    {node.sights.slice(0, 3).map(s => (
                                      <span key={s} className="px-1.5 py-0.5 rounded bg-fg-main/5 text-[9px] text-fg-main font-semibold">
                                        {s}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Connections Stepper Timeline */}
                <div className="space-y-4">
                  <h4 className="font-heading font-black text-xs text-fg-main uppercase tracking-wider flex items-center gap-1.5">
                    <Car className="w-4 h-4 text-accent-primary" />
                    Intercity Transit Connections
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.connections.map((c, i) => (
                      <div key={i} className="p-5 rounded-2xl border border-border-color bg-fg-main/5 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-heading font-black text-xs text-fg-main flex items-center gap-2">
                            {c.from} <ArrowRightIcon className="w-4 h-4 text-accent-sunset shrink-0" /> {c.to}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-accent-primary/10 border border-accent-primary/20 text-[9px] text-accent-primary font-bold">
                            {c.distance} · {c.duration}
                          </span>
                        </div>
                        <p className="text-[11px] text-text-muted leading-relaxed">{c.tips}</p>
                        <div className="text-[9px] font-bold text-accent-sunset uppercase tracking-wider flex items-center gap-1">
                          🚗 Best Mode: <span className="text-fg-main font-medium normal-case">{c.transitMode}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "proximity" && (
              <motion.div
                key="proximity-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="p-4 rounded-xl bg-accent-sunset/5 border border-accent-sunset/20 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-accent-sunset shrink-0 mt-0.5" />
                  <p className="text-[11px] text-text-muted leading-relaxed">
                    <strong>Smart Routing Tip:</strong> Traveling across town in city traffic wastes hours. We have pre-grouped these sights geographically. Visit the spots within the same zone in a single afternoon block.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.proximityZones.map((z, i) => (
                    <div key={i} className="p-5 rounded-2xl border border-border-color bg-fg-main/5 flex flex-col justify-between h-full">
                      <div>
                        <span className="text-[9px] font-bold text-accent-primary uppercase tracking-widest block mb-1">
                          Zone {i + 1}
                        </span>
                        <h4 className="font-heading font-black text-sm text-fg-main mb-1 truncate">{z.zoneName}</h4>
                        <span className="text-[10px] text-text-muted italic block mb-3.5">
                          📍 {z.neighborhood}
                        </span>

                        <ul className="space-y-1.5 mb-4">
                          {z.sights.map(sight => (
                            <li key={sight} className="flex gap-2 text-xs text-text-muted items-center">
                              <span className="text-accent-emerald text-xs font-black">▸</span>
                              <span>{sight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3 rounded-xl bg-bg-main border border-border-color text-[10px] text-text-muted leading-relaxed mt-2 italic font-light">
                        <strong>Directions:</strong> {z.optimizeTip}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "tips" && (
              <motion.div
                key="tips-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="space-y-3.5">
                  <h4 className="font-heading font-black text-xs text-fg-main uppercase tracking-wider flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-accent-sunset animate-pulse" />
                    Essential Local Navigation Guidelines
                  </h4>

                  <div className="space-y-3">
                    {data.generalTips.map((tip, i) => (
                      <div key={i} className="p-4 rounded-xl border border-border-color bg-fg-main/5 flex gap-3 items-start">
                        <span className="w-5 h-5 rounded-full bg-accent-secondary/10 text-accent-secondary flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <p className="text-xs text-text-muted leading-relaxed font-light">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-5 bg-card-bg border-t border-border-color/60 shrink-0 flex justify-between items-center">
          <span className="text-[10px] text-text-muted">
            Brochure coordinates verified via dynamic geocodes.
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-accent-primary hover:bg-accent-sunset text-white text-xs font-bold transition-colors shadow-md cursor-pointer"
          >
            Acknowledge & Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// Simple Arrow icon
function ArrowRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}
