"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Smartphone, Download, Sparkles, Navigation, DollarSign, ListTodo, ShieldCheck } from "lucide-react";

const screens = [
  {
    id: "route",
    title: "Live Route Map",
    desc: "Seamlessly trace optimized driving, walking, or auto-cab routes. Real-time Leaflet overlays update automatically.",
    icon: Navigation,
    previewColor: "from-accent-primary to-accent-sunset",
    screenContent: (
      <div className="flex flex-col h-full bg-slate-950 p-4 text-white font-sans text-xs">
        <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-3">
          <span className="font-bold">🌍 Active Navigation</span>
          <span className="text-[10px] text-accent-primary">GPS_ON</span>
        </div>
        <div className="flex-grow flex flex-col justify-center items-center rounded-xl border border-white/10 bg-slate-900/50 p-3 mb-3 relative overflow-hidden">
          {/* Mock Map graphics */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] bg-[size:10px_10px]" />
          <div className="w-1.5 h-1.5 rounded-full bg-accent-primary animate-ping absolute top-1/3 left-1/3" />
          <div className="w-2.5 h-2.5 rounded-full bg-accent-primary border border-white absolute top-1/3 left-1/3" />
          
          <div className="w-2.5 h-2.5 rounded-full bg-accent-sunset absolute bottom-1/3 right-1/3" />
          
          <svg className="w-full h-1/2 text-accent-primary absolute inset-0 m-auto opacity-40" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3">
            <path d="M 33,33 C 45,40 60,35 66,66" />
          </svg>

          <span className="z-10 text-[9px] text-gray-400 mt-20">Oia Castle ➔ Amoudi Bay</span>
        </div>
        <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 flex justify-between">
          <div>
            <div className="text-[8px] text-gray-400 uppercase">Est. Distance</div>
            <div className="font-bold">1.8 km (Walk)</div>
          </div>
          <div className="text-right">
            <div className="text-[8px] text-gray-400 uppercase">Est. Time</div>
            <div className="font-bold text-accent-primary">15 mins</div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: "expenses",
    title: "Smart Budget Tracker",
    desc: "Log travel expenditures in real-time. Review category breakdowns and prevent budget overruns dynamically.",
    icon: DollarSign,
    previewColor: "from-accent-primary to-accent-emerald",
    screenContent: (
      <div className="flex flex-col h-full bg-slate-950 p-4 text-white font-sans text-xs">
        <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-3">
          <span className="font-bold">💰 Trip Budget</span>
          <span className="text-[10px] text-accent-emerald">$2,500 limit</span>
        </div>
        
        {/* Mock Chart */}
        <div className="flex-grow flex items-center justify-center relative mb-3">
          {/* Doughnut simulator */}
          <div className="w-24 h-24 rounded-full border-[10px] border-white/5 border-t-accent-primary border-r-accent-sunset flex items-center justify-center font-bold text-[10px]">
            $820 Spent
          </div>
          <div className="absolute right-0 flex flex-col gap-1 text-[8px] text-gray-400">
            <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-accent-primary" /> Ferry</div>
            <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-accent-sunset" /> Dining</div>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between p-2 rounded bg-white/5 border border-white/5">
            <span>🥗 Cliffside Seafood Dinner</span>
            <span className="font-bold text-accent-sunset">$120</span>
          </div>
          <div className="flex justify-between p-2 rounded bg-white/5 border border-white/5">
            <span>🚢 Island Ferry Tickets</span>
            <span className="font-bold text-accent-primary">$280</span>
          </div>
        </div>
      </div>
    )
  },
  {
    id: "checklist",
    title: "Packing Advisor",
    desc: "Receive customized checklists based on destination climate. Tick off items and prepare stress-free.",
    icon: ListTodo,
    previewColor: "from-accent-sunset to-accent-primary",
    screenContent: (
      <div className="flex flex-col h-full bg-slate-950 p-4 text-white font-sans text-xs">
        <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-3">
          <span className="font-bold">🎒 Packing Guide</span>
          <span className="text-[10px] text-accent-sunset">Santorini Summer</span>
        </div>

        <div className="flex-grow space-y-2.5">
          {[
            { label: "High SPF Sunscreen", checked: true },
            { label: "Polarized Sunglasses", checked: true },
            { label: "Light linen shirts", checked: false },
            { label: "Travel adapter (Type C)", checked: false },
          ].map((item, i) => (
            <label key={i} className="flex items-center gap-2 p-2 rounded-lg border border-white/5 bg-white/5">
              <input type="checkbox" className="w-3.5 h-3.5 accent-accent-primary" defaultChecked={item.checked} />
              <span className={item.checked ? "line-through text-gray-500" : ""}>{item.label}</span>
            </label>
          ))}
        </div>

        <div className="p-2 bg-accent-primary/10 border border-accent-primary/20 rounded-lg text-center text-[9px] text-accent-primary font-semibold uppercase">
          🚨 Sunshine intensity advisory active
        </div>
      </div>
    )
  }
];

export default function AppShowcase() {
  const [activeScreenTab, setActiveScreenTab] = useState("route");

  const activeData = screens.find((s) => s.id === activeScreenTab) || screens[0];

  return (
    <section className="py-24 max-w-7xl mx-auto px-6 relative">
      {/* Background graphic */}
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-accent-primary/5 blur-3xl -z-10" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        
        {/* Left Column: Details */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <span className="text-xs font-bold text-accent-sunset uppercase tracking-widest block mb-2">
            Mobile Companion
          </span>
          <h2 className="font-heading font-black text-3xl md:text-5xl text-fg-main tracking-tight mb-4">
            Travel App Showcase
          </h2>
          <p className="text-sm text-text-muted mb-8 leading-relaxed max-w-xl">
            Carry the ultimate travel companion in your pocket. Synchronize generated AI itineraries, manage your live travel expenditures, track checklist progress offline, and enjoy emergency travel advisories on the move.
          </p>

          {/* Interactive Screen Selector Buttons */}
          <div className="space-y-4 mb-8">
            {screens.map((scr) => {
              const Icon = scr.icon;
              const isSelected = activeScreenTab === scr.id;
              return (
                <button
                  key={scr.id}
                  onClick={() => setActiveScreenTab(scr.id)}
                  className={`w-full max-w-md text-left p-4 rounded-2xl border transition-all duration-300 flex items-start gap-4 cursor-pointer ${
                    isSelected
                      ? "glassmorphism border-accent-primary shadow-md animate-pulse-slow"
                      : "border-border-color hover:bg-card-bg/50"
                  }`}
                >
                  <div className={`p-3 rounded-xl bg-gradient-to-tr ${scr.previewColor} text-white shrink-0 shadow-md`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-sm text-fg-main">{scr.title}</h3>
                    <p className="text-xs text-text-muted mt-1 leading-normal">{scr.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Download CTAs */}
          <div className="flex flex-wrap gap-4 mt-2">
            <a
              href="#"
              className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-accent-primary text-white font-bold text-xs shadow-md hover:bg-accent-sunset hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <Smartphone className="w-4.5 h-4.5" />
              App Store
            </a>
            <a
              href="#"
              className="flex items-center gap-2.5 px-6 py-3 rounded-2xl border border-border-color hover:bg-card-bg text-fg-main font-bold text-xs hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <Download className="w-4.5 h-4.5" />
              Google Play
            </a>
          </div>
        </div>

        {/* Right Column: Visual Smartphone Mockup */}
        <div className="lg:col-span-5 flex justify-center items-center">
          <div className="relative">
            
            {/* Phone outer frame container */}
            <div className="w-[280px] h-[560px] rounded-[44px] bg-slate-900 border-[8px] border-slate-800 shadow-2xl relative overflow-hidden flex flex-col justify-between p-2.5">
              
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-900 rounded-b-2xl z-50 flex items-center justify-center">
                {/* Speaker line & Camera dot */}
                <div className="w-8 h-1 bg-slate-800 rounded-full mb-1" />
                <div className="w-2.5 h-2.5 bg-slate-800 rounded-full ml-2" />
              </div>

              {/* Status bar mock */}
              <div className="h-6 flex justify-between items-center px-4 text-[9px] text-gray-400 select-none z-40 shrink-0">
                <span>09:42 AM</span>
                <div className="flex gap-1">
                  <span>5G</span>
                  <span>🔋</span>
                </div>
              </div>

              {/* Screen Content Window */}
              <div className="flex-grow rounded-[32px] overflow-hidden border border-slate-800 bg-slate-950 relative z-30">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeScreenTab}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full w-full"
                  >
                    {activeData.screenContent}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Home bar indicator */}
              <div className="h-4 flex justify-center items-center select-none z-40 shrink-0">
                <div className="w-20 h-1 bg-gray-500 rounded-full" />
              </div>

            </div>

            {/* Glowing Accent Ring behind the phone */}
            <div className={`absolute inset-0 m-auto w-[290px] h-[570px] rounded-[50px] bg-gradient-to-tr ${activeData.previewColor} opacity-20 blur-md -z-10`} />

            {/* Float Badge */}
            <div className="absolute -top-6 -right-6 bg-gradient-to-r from-accent-primary to-accent-sunset p-2.5 rounded-2xl shadow-lg rotate-12 flex items-center gap-1.5 text-white font-bold text-[10px] uppercase">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300 animate-pulse" />
              v2.4 Live
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
