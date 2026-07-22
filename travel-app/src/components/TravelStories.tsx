"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MapPin, X, MessageCircle } from "lucide-react";

const Instagram = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const stories = [
  {
    id: 1,
    title: "Chasing sunsets along the cliffside of Oia.",
    location: "Oia, Santorini",
    user: "@sunset_chaser",
    likes: 1420,
    image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=600&q=80",
    size: "tall",
  },
  {
    id: 2,
    title: "Morning café and strolls around the Eiffel Tower.",
    location: "Paris, France",
    user: "@parisienne_life",
    likes: 1890,
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80",
    size: "short",
  },
  {
    id: 3,
    title: "Finding peace in the historic Zen gardens of Arashiyama.",
    location: "Kyoto, Japan",
    user: "@zen_explorer",
    likes: 1560,
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80",
    size: "medium",
  },
  {
    id: 4,
    title: "Hiking through the majestic snow peaks of the Swiss Alps.",
    location: "Zermatt, Switzerland",
    user: "@alpine_trekker",
    likes: 2110,
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80",
    size: "tall",
  },
  {
    id: 5,
    title: "Glamping on the edge of the turquoise Maldives lagoon.",
    location: "Baa Atoll, Maldives",
    user: "@luxury_escapes",
    likes: 2340,
    image: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=600&q=80",
    size: "short",
  },
  {
    id: 6,
    title: "Enjoying the vibrant streets and ocean views of Positano.",
    location: "Positano, Italy",
    user: "@bella_vita",
    likes: 1670,
    image: "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=600&q=80",
    size: "medium",
  },
];

export default function TravelStories() {
  const [selectedStory, setSelectedStory] = useState<typeof stories[number] | null>(null);
  const [likesState, setLikesState] = useState<Record<number, { count: number; liked: boolean }>>({
    1: { count: 1420, liked: false },
    2: { count: 1890, liked: false },
    3: { count: 1560, liked: false },
    4: { count: 2110, liked: false },
    5: { count: 2340, liked: false },
    6: { count: 1670, liked: false },
  });

  const handleLike = (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); // prevent opening lightbox
    setLikesState(prev => {
      const current = prev[id];
      return {
        ...prev,
        [id]: {
          count: current.liked ? current.count - 1 : current.count + 1,
          liked: !current.liked,
        }
      };
    });
  };

  return (
    <section id="stories" className="py-24 bg-card-bg/25 border-y border-border-color overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-14">
          <div>
            <span className="text-xs font-bold text-accent-sunset uppercase tracking-widest block mb-2">
              Shared Diaries
            </span>
            <h2 className="font-heading font-black text-3xl md:text-5xl text-fg-main tracking-tight">
              Traveler Stories
            </h2>
          </div>
          <p className="text-sm text-text-muted max-w-md">
            Follow the journeys of our luxury explorers. Capture real-time updates, packing reviews, and live photography from around the globe.
          </p>
        </div>

        {/* Masonry Grid (Visual Simulation with flex/grid gap) */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {stories.map((story) => {
            const sizeClass = 
              story.size === "tall" ? "h-[460px]" :
              story.size === "medium" ? "h-[380px]" : "h-[300px]";
            const isLiked = likesState[story.id]?.liked;
            const likeCount = likesState[story.id]?.count || story.likes;
            
            return (
              <motion.div
                key={story.id}
                onClick={() => setSelectedStory(story)}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5 }}
                className={`break-inside-avoid relative ${sizeClass} rounded-3xl overflow-hidden shadow-premium group cursor-pointer border border-border-color`}
              >
                {/* Background image */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-750 group-hover:scale-110"
                  style={{ backgroundImage: `url(${story.image})` }}
                />
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-90 group-hover:via-black/30 transition-all duration-300 pointer-events-none" />

                {/* Info Overlay top */}
                <div className="absolute top-5 left-5 right-5 z-10 flex justify-between items-center text-white pointer-events-none">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/5">
                    <MapPin className="w-3.5 h-3.5 text-accent-primary" />
                    {story.location}
                  </span>
                  
                  <Instagram className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Info Overlay bottom */}
                <div className="absolute bottom-5 left-5 right-5 z-10 text-white flex flex-col justify-end">
                  <span className="text-[11px] text-accent-primary font-bold mb-1">{story.user}</span>
                  <h3 className="font-heading font-bold text-sm leading-snug tracking-tight mb-3">
                    {story.title}
                  </h3>
                  
                  <div className="flex gap-4 border-t border-white/10 pt-3">
                    <button
                      onClick={(e) => handleLike(e, story.id)}
                      className="flex items-center gap-1.5 text-[11px] font-semibold text-white/90 hover:text-white cursor-pointer"
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? "fill-red-500 text-red-500" : "text-white"}`} />
                      {likeCount}
                    </button>
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-white/90">
                      <MessageCircle className="w-4 h-4" />
                      42 Comments
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Lightbox Dialog Container */}
        <AnimatePresence>
          {selectedStory && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStory(null)}
              className="fixed inset-0 z-[1000] bg-black/85 backdrop-blur-md flex items-center justify-center p-6"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedStory(null)}
                className="absolute top-6 right-6 p-3 rounded-full bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-all cursor-pointer z-10"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Lightbox content card */}
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()} // stop close on card click
                className="max-w-4xl w-full rounded-3xl overflow-hidden bg-bg-main border border-border-color shadow-premium flex flex-col md:flex-row h-[80vh] md:h-[500px]"
              >
                {/* Image */}
                <div
                  className="w-full md:w-1/2 bg-cover bg-center h-1/2 md:h-full"
                  style={{ backgroundImage: `url(${selectedStory.image})` }}
                />

                {/* Details */}
                <div className="w-full md:w-1/2 p-8 flex flex-col justify-between text-fg-main">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="flex items-center gap-1 text-xs font-bold text-accent-sunset uppercase tracking-widest">
                        <MapPin className="w-4 h-4 text-accent-primary" />
                        {selectedStory.location}
                      </span>
                      <span className="text-xs font-semibold text-accent-primary">{selectedStory.user}</span>
                    </div>

                    <h3 className="font-heading font-black text-2xl tracking-tight leading-snug mb-4">
                      {selectedStory.title}
                    </h3>

                    <p className="text-xs text-text-muted leading-relaxed">
                      Captured during an unforgettable expedition. Experiences like these are what make travel so special. From scenic landscapes to fine local dining, everything is fully personalized.
                    </p>
                  </div>

                  <div className="flex justify-between items-center border-t border-border-color pt-6 mt-6">
                    <div className="flex gap-4">
                      <button
                        onClick={(e) => handleLike(e, selectedStory.id)}
                        className="flex items-center gap-2 text-xs font-bold text-fg-main cursor-pointer"
                      >
                        <Heart className={`w-5 h-5 ${likesState[selectedStory.id]?.liked ? "fill-red-500 text-red-500" : "text-fg-main"}`} />
                        {likesState[selectedStory.id]?.count || selectedStory.likes} Likes
                      </button>
                    </div>

                    <button
                      onClick={() => setSelectedStory(null)}
                      className="px-5 py-2.5 rounded-xl border border-border-color text-xs font-bold hover:bg-card-bg cursor-pointer transition-colors"
                    >
                      Close Story
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
