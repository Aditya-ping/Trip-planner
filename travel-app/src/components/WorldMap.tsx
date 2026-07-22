"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Star, ArrowRight, ShieldCheck } from "lucide-react";

const pins = [
  {
    id: "santorini",
    name: "Santorini",
    tag: "Cycladic White Villas",
    rating: 4.9,
    price: "$380",
    image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=150&h=150&q=80",
    x: "51%",
    y: "41%",
  },
  {
    id: "kyoto",
    name: "Kyoto",
    tag: "Cherry Blossoms & Temples",
    rating: 4.8,
    price: "$240",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=150&h=150&q=80",
    x: "82%",
    y: "44%",
  },
  {
    id: "amalfi",
    name: "Amalfi Coast",
    tag: "Cliffside Towns & Cobalt Seas",
    rating: 4.9,
    price: "$420",
    image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=150&h=150&q=80",
    x: "49%",
    y: "42%",
  },
  {
    id: "swiss",
    name: "Swiss Alps",
    tag: "Majestic Snowy Peaks",
    rating: 4.9,
    price: "$310",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=150&h=150&q=80",
    x: "47%",
    y: "36%",
  },
  {
    id: "bali",
    name: "Bali",
    tag: "Tropical Reefs & Shrines",
    rating: 4.8,
    price: "$180",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=150&h=150&q=80",
    x: "78%",
    y: "68%",
  },
  {
    id: "taj",
    name: "Taj Mahal",
    tag: "Timeless Monument of Love",
    rating: 4.9,
    price: "$220",
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=150&h=150&q=80",
    x: "68%",
    y: "49%",
  },
];

export default function WorldMap() {
  const [hoveredPin, setHoveredPin] = useState<typeof pins[number] | null>(null);
  const [activePin, setActivePin] = useState<typeof pins[number] | null>(null);

  return (
    <section className="py-24 max-w-7xl mx-auto px-6 relative overflow-hidden">
      {/* Background Grids & Blobs */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,174,239,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,174,239,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] -z-10" />

      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-xs font-bold text-accent-primary uppercase tracking-widest block mb-2">
          Interactive Atlas
        </span>
        <h2 className="font-heading font-black text-3xl md:text-5xl text-fg-main tracking-tight mb-4">
          Interactive Destination Map
        </h2>
        <p className="text-sm text-text-muted">
          Click or hover on pins to preview locations, read reviews, and explore custom luxury travel packages.
        </p>
      </div>

      {/* Map Dashboard Container */}
      <div className="max-w-4xl mx-auto relative h-[600px] md:h-[680px] rounded-3xl overflow-hidden glassmorphism border border-border-color shadow-premium flex flex-col items-center justify-center p-6 bg-cover bg-center">
        
        {/* Stylized Abstract Outline map of the World as a background graphic */}
        <div className="absolute inset-0 flex items-center justify-center opacity-30 select-none pointer-events-none p-12">
          {/* A high-end grid circle system simulating global tracking */}
          <div className="w-[500px] h-[500px] rounded-full border border-accent-primary/20 animate-pulse-slow absolute" />
          <div className="w-[380px] h-[380px] rounded-full border border-accent-primary/10 absolute" />
          <div className="w-[200px] h-[200px] rounded-full border border-border-color absolute" />
          
          {/* Simplified Visual World outline path */}
          <svg className="w-full h-full text-fg-main opacity-20" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5">
            {/* North America */}
            <path d="M 10,25 L 30,22 L 35,35 L 22,48 L 15,45 Z" />
            {/* South America */}
            <path d="M 22,48 L 28,55 L 25,82 L 20,68 L 18,52 Z" />
            {/* Africa */}
            <path d="M 42,48 L 52,48 L 58,62 L 52,78 L 46,75 L 40,58 Z" />
            {/* Eurasia / Europe / Asia */}
            <path d="M 38,20 L 78,18 L 88,38 L 78,55 L 60,52 L 48,35 Z" />
            {/* Australia */}
            <path d="M 75,68 L 85,68 L 88,78 L 78,82 Z" />
          </svg>
        </div>

        {/* Pulsing Grid Coordinates */}
        <div className="absolute left-6 bottom-6 text-[10px] text-text-muted font-mono space-y-1">
          <div>LOCATOR ACTIVE: LAT/LON IN_SUB</div>
          <div className="text-accent-secondary">SYSTEM RESOLUTION: DYNAMIC API_OK</div>
        </div>

        {/* Pulse Pins Loop */}
        {pins.map((pin) => {
          const isSelected = activePin?.id === pin.id;
          return (
            <div
              key={pin.id}
              className="absolute z-20 cursor-pointer"
              style={{ left: pin.x, top: pin.y }}
              onMouseEnter={() => setHoveredPin(pin)}
              onMouseLeave={() => setHoveredPin(null)}
              onClick={() => setActivePin(isSelected ? null : pin)}
            >
              {/* Pulse Circle Animation */}
              <div className="relative flex items-center justify-center">
                <span className="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-accent-secondary opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-accent-primary border border-white" />
                
                {/* Marker icon */}
                <div className="absolute -top-6 text-accent-primary group-hover:scale-110 transition-transform">
                  <MapPin className="w-5 h-5 fill-accent-secondary/20" />
                </div>
              </div>
            </div>
          );
        })}

        {/* 1. Tooltip Hover Preview Card */}
        <AnimatePresence>
          {hoveredPin && !activePin && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute z-30 bottom-12 p-4 rounded-2xl glassmorphism border border-border-color shadow-premium flex gap-3 items-center max-w-sm pointer-events-none"
            >
              <div
                className="w-16 h-16 rounded-xl bg-cover bg-center shrink-0 border border-white/10"
                style={{ backgroundImage: `url(${hoveredPin.image})` }}
              />
              <div>
                <h4 className="font-heading font-bold text-sm text-fg-main leading-tight">{hoveredPin.name}</h4>
                <span className="text-[10px] text-text-muted block mt-0.5">{hoveredPin.tag}</span>
                <div className="flex items-center gap-1.5 mt-2">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  <span className="text-xs font-semibold text-fg-main">{hoveredPin.rating}</span>
                  <span className="text-[10px] text-text-muted">• Starting {hoveredPin.price}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 2. Click Active Detail Card */}
        <AnimatePresence>
          {activePin && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="absolute z-40 right-6 bottom-6 p-6 rounded-3xl glassmorphism border border-border-color shadow-premium max-w-sm text-fg-main text-left"
            >
              <button
                onClick={() => setActivePin(null)}
                className="absolute top-4 right-4 text-xs font-bold text-text-muted hover:text-fg-main cursor-pointer"
              >
                Close
              </button>
              
              <div
                className="h-32 rounded-2xl bg-cover bg-center border border-white/10 mb-4"
                style={{ backgroundImage: `url(${activePin.image})` }}
              />

              <h4 className="font-heading font-extrabold text-lg tracking-tight mb-1">{activePin.name}</h4>
              <p className="text-xs text-text-muted leading-relaxed mb-4">{activePin.tag}. Custom luxury itineraries and handpicked stays are active.</p>

              <div className="flex justify-between items-center border-t border-border-color/60 pt-4">
                <div>
                  <span className="text-[10px] text-text-muted block leading-none">Tour Starts</span>
                  <span className="text-base font-extrabold text-accent-emerald">{activePin.price}</span>
                </div>

                <a
                  href="#ai-planner"
                  onClick={() => setActivePin(null)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary text-white text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  Plan Travel
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
