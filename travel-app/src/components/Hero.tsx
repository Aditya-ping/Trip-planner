"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";

const slides = [
  {
    url: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1920&q=80",
    location: "Taj Mahal, Agra",
  },
  {
    url: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1920&q=80",
    location: "Amber Palace, Jaipur",
  },
  {
    url: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1920&q=80",
    location: "Alleppey Backwaters, Kerala",
  },
  {
    url: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1920&q=80",
    location: "Nubra Valley, Leh Ladakh",
  },
  {
    url: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1920&q=80",
    location: "Vagator Beach, Goa",
  },
  {
    url: "https://images.unsplash.com/photo-1561361058-c24e014f9d25?auto=format&fit=crop&w=1920&q=80",
    location: "Dashashwamedh Ghat, Varanasi",
  },
  {
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1920&q=80",
    location: "Munnar Tea Estates, Kerala",
  },
  {
    url: "https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&w=1920&q=80",
    location: "Golden Temple, Amritsar",
  },
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-[#0B0F1A]">
      {/* Background Slideshow */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: prefersReduced ? 1 : 1.05 }}
            animate={{ opacity: 0.5, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReduced ? 0 : 1.5, ease: "easeInOut" }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slides[currentSlide].url})` }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F1A]/70 via-[#0B0F1A]/30 to-[#0B0F1A]" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center flex flex-col items-center">
        {/* Subtle Brass Stamp Badge */}
        <motion.div
          initial={{ opacity: 0, y: prefersReduced ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReduced ? 0 : 0.6 }}
          className="flex items-center gap-2 px-4 py-1.5 rounded-sm border border-[#C9A15A]/30 bg-[#161B2C]/90 text-xs font-mono text-[#C9A15A] uppercase tracking-widest mb-6"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#C9A15A]" />
          Instant India Itinerary Engine
        </motion.div>

        {/* Headline with Fraunces Display Font */}
        <motion.h1
          initial={{ opacity: 0, y: prefersReduced ? 0 : 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReduced ? 0 : 0.8, delay: prefersReduced ? 0 : 0.1 }}
          className="font-display font-black text-6xl md:text-8xl leading-none text-[#EDEAE2] tracking-tight mb-6"
        >
          Discover Extraordinary <br />
          <span className="text-[#C9A15A] italic">Places</span>
        </motion.h1>

        {/* Subheading in Inter Body Font */}
        <motion.p
          initial={{ opacity: 0, y: prefersReduced ? 0 : 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReduced ? 0 : 0.8, delay: prefersReduced ? 0 : 0.2 }}
          className="font-sans text-base md:text-lg text-[#8A94A6] max-w-2xl font-normal leading-relaxed mb-10"
        >
          Explore bespoke Indian destinations with personalized AI travel itineraries and passport-style package bookings.
        </motion.p>

        {/* Action Buttons: single brass-gold CTA button, neutral secondary */}
        <motion.div
          initial={{ opacity: 0, y: prefersReduced ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReduced ? 0 : 0.8, delay: prefersReduced ? 0 : 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <a
            href="#ai-planner"
            className="font-sans px-8 py-3.5 rounded-md bg-[#C9A15A] hover:bg-[#E6C887] text-[#0B0F1A] font-semibold text-sm transition-all shadow-md cursor-pointer"
          >
            Start AI Planning
          </a>
          <a
            href="#destinations"
            className="font-sans px-8 py-3.5 rounded-md border border-[#C9A15A]/30 bg-[#161B2C]/80 hover:bg-[#161B2C] text-[#EDEAE2] font-semibold text-sm transition-all cursor-pointer"
          >
            Explore Destinations
          </a>
        </motion.div>
      </div>

      {/* Floating Location indicator */}
      <div className="absolute bottom-8 right-8 z-10 hidden md:block text-right border-l-2 border-[#C9A15A]/50 pl-3">
        <span className="text-[10px] font-mono text-[#8A94A6] uppercase tracking-widest block">Current Highlight</span>
        <span className="text-xs font-semibold text-[#EDEAE2] font-sans">{slides[currentSlide].location}</span>
      </div>
    </section>
  );
}
