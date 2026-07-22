"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

const reviews = [
  {
    id: 1,
    name: "Sarah Jenkins",
    role: "Luxury Wellness Explorer",
    location: "Santorini Cave Villa Resort",
    stars: 5,
    comment: "The AI Planner drafted a flawless 5-day route through Santorini. Booking the cliffside villa was seamless, and the sunset catamaran reservation was directly synchronized with my calendar. Unparalleled attention to detail!",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
  },
  {
    id: 2,
    name: "Kenji Takahashi",
    role: "Culture & Culinary Enthusiast",
    location: "Kyoto Traditional Ryokan",
    stars: 5,
    comment: "I was highly impressed by the tea ceremony and Ryokan booking system. Having a local guide coordinate historic temple hours and walking directions made the whole journey flow beautifully.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
  },
  {
    id: 3,
    name: "Elena Rostova",
    role: "Alpine Adventure Trekker",
    location: "Swiss Alps Scenic Rail Pass",
    stars: 5,
    comment: "The interactive map and local transit guide made getting around the Swiss Alps incredibly simple. Swapping days based on weather was handled in real-time, instantly adjusting my reservation details.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
  },
];

export default function Testimonials() {
  const [activeIdx, setActiveIdx] = useState(0);

  const handleNext = useCallback(() => {
    setActiveIdx((prev) => (prev + 1) % reviews.length);
  }, []);

  const handlePrev = useCallback(() => {
    setActiveIdx((prev) => (prev - 1 + reviews.length) % reviews.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(handleNext, 8000);
    return () => clearInterval(timer);
  }, [handleNext]);

  return (
    <section className="py-24 max-w-7xl mx-auto px-6 relative">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-accent-primary/10 blur-3xl -z-10 pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 -translate-y-1/2 translate-x-1/2 w-80 h-80 rounded-full bg-accent-primary/5 blur-3xl -z-10 pointer-events-none" />

      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-xs font-bold text-accent-sunset uppercase tracking-widest block mb-2">
          Traveler Feedback
        </span>
        <h2 className="font-heading font-black text-3xl md:text-5xl text-fg-main tracking-tight mb-4">
          What Our Travelers Say
        </h2>
        <p className="text-sm text-text-muted">
          Read genuine reviews from luxury explorers who planned their custom getaways using our smart planner interface.
        </p>
      </div>

      {/* Carousel Container */}
      <div className="max-w-4xl mx-auto relative flex items-center justify-center min-h-[300px]">
        {/* Navigation Buttons Desktop */}
        <button
          onClick={handlePrev}
          className="absolute -left-16 lg:-left-24 top-1/2 -translate-y-1/2 p-3 rounded-full border border-border-color bg-card-bg hover:bg-fg-main/5 text-fg-main transition-all scale-90 hover:scale-100 hidden md:flex cursor-pointer"
          aria-label="Previous Review"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={handleNext}
          className="absolute -right-16 lg:-right-24 top-1/2 -translate-y-1/2 p-3 rounded-full border border-border-color bg-card-bg hover:bg-fg-main/5 text-fg-main transition-all scale-90 hover:scale-100 hidden md:flex cursor-pointer"
          aria-label="Next Review"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Testimonial Active Card */}
        <div className="w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIdx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="p-8 md:p-12 rounded-3xl glassmorphism border border-border-color shadow-premium flex flex-col md:flex-row gap-8 items-center md:items-start"
            >
              {/* Avatar Column */}
              <div className="relative shrink-0 flex flex-col items-center">
                <div className="w-24 h-24 rounded-2xl overflow-hidden border border-border-color shadow-lg">
                  <img
                    src={reviews[activeIdx].avatar}
                    alt={reviews[activeIdx].name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Floating quote badge */}
                <div className="absolute -bottom-3 p-2 rounded-xl bg-accent-primary text-white shadow-md">
                  <Quote className="w-4 h-4 fill-white" />
                </div>
              </div>

              {/* Review Details Column */}
              <div className="flex-grow text-center md:text-left flex flex-col justify-between h-full">
                <div>
                  {/* Stars */}
                  <div className="flex justify-center md:justify-start gap-1 mb-4">
                    {Array.from({ length: reviews[activeIdx].stars }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>

                  {/* Comment */}
                  <p className="text-base md:text-lg text-fg-main font-light leading-relaxed italic mb-6">
                    "{reviews[activeIdx].comment}"
                  </p>
                </div>

                {/* Reviewer Meta */}
                <div>
                  <h4 className="font-heading font-extrabold text-lg leading-tight text-fg-main">
                    {reviews[activeIdx].name}
                  </h4>
                  <div className="text-xs text-text-muted mt-1 flex flex-wrap justify-center md:justify-start items-center gap-2">
                    <span>{reviews[activeIdx].role}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-border-color" />
                    <span className="text-accent-sunset font-semibold">{reviews[activeIdx].location}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Carousel dots indicator / Mobile buttons */}
      <div className="flex justify-center items-center gap-3 mt-8">
        <button
          onClick={handlePrev}
          className="p-2.5 rounded-full border border-border-color bg-card-bg md:hidden cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        {reviews.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIdx(idx)}
            className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
              activeIdx === idx ? "w-8 bg-accent-primary" : "w-2 bg-border-color"
            }`}
          />
        ))}

        <button
          onClick={handleNext}
          className="p-2.5 rounded-full border border-border-color bg-card-bg md:hidden cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}
