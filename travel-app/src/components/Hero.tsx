"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-black">
      {/* Background Slideshow */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 0.65, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slides[currentSlide].url})` }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-bg-main" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center flex flex-col items-center">
        {/* Subtle Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full glassmorphism text-xs font-semibold text-accent-primary uppercase tracking-widest mb-6"
        >
          <Sparkles className="w-3.5 h-3.5 animate-spin-slow text-yellow-400" />
          Instant India Itinerary Planner
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-heading font-black text-5xl md:text-7xl leading-tight md:leading-none text-white tracking-tight mb-6"
        >
          Discover Extraordinary <br />
          <span className="text-gradient">Places</span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-xl text-gray-200 max-w-2xl font-light leading-relaxed mb-10"
        >
          Explore the world's most beautiful destinations with personalized travel experiences.
        </motion.p>
      </div>

      {/* Floating Location indicator */}
      <div className="absolute bottom-8 right-8 z-10 hidden md:block text-right">
        <span className="text-[10px] text-white/40 uppercase tracking-widest block">Current Highlight</span>
        <span className="text-sm font-medium text-white/80">{slides[currentSlide].location}</span>
      </div>
    </section>
  );
}
