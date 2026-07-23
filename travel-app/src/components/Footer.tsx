"use client";

import { useState } from "react";
import { Compass, Send, CheckCircle2, X, ShieldCheck } from "lucide-react";

const Instagram = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const Facebook = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const Twitter = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const Youtube = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17z" />
    <polygon points="10 15 15 12 10 9" />
  </svg>
);

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[#C9A15A]/20 bg-[#161B2C] pt-20 pb-8 text-[#EDEAE2] overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 border-b border-[#C9A15A]/15 pb-16">
        
        {/* Brand Column */}
        <div className="lg:col-span-4 space-y-6">
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="p-2 rounded-md bg-[#C9A15A]/10 border border-[#C9A15A]/40 text-[#C9A15A]">
              <Compass className="w-5 h-5" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-[#EDEAE2]">
              AeroTravel
            </span>
          </a>

          <p className="text-xs text-text-muted leading-relaxed max-w-sm">
            Experience the future of travel planning. Craft bespoke global journeys, manage expenses, and access handpicked luxury destinations with verified local guides.
          </p>

          {/* Social Handles */}
          <div className="flex gap-4">
            {[
              { icon: Instagram, href: "#" },
              { icon: Twitter, href: "#" },
              { icon: Facebook, href: "#" },
              { icon: Youtube, href: "#" },
            ].map((soc, i) => {
              const Icon = soc.icon;
              return (
                <a
                  key={i}
                  href={soc.href}
                  className="p-2.5 rounded-md border border-[#C9A15A]/20 hover:border-[#C9A15A]/50 hover:bg-[#C9A15A]/10 text-[#8A94A6] hover:text-[#C9A15A] transition-colors duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              );
            })}
          </div>
        </div>

        {/* Navigation Maps Columns */}
        <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-3 gap-8">
          <div>
            <h4 className="font-mono text-[11px] font-bold uppercase tracking-widest text-[#8A94A6] mb-4">Discover</h4>
            <ul className="space-y-3 text-xs">
              <li><a href="#destinations" className="text-[#8A94A6] hover:text-[#C9A15A] transition-colors">Destinations</a></li>
              <li><a href="#experiences" className="text-[#8A94A6] hover:text-[#C9A15A] transition-colors">Experiences</a></li>
              <li><a href="#packages" className="text-[#8A94A6] hover:text-[#C9A15A] transition-colors">Packages</a></li>
              <li><a href="#ai-planner" className="text-[#8A94A6] hover:text-[#C9A15A] transition-colors">AI Itinerary</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-mono text-[11px] font-bold uppercase tracking-widest text-[#8A94A6] mb-4">Support</h4>
            <ul className="space-y-3 text-xs">
              <li><a href="#" className="text-[#8A94A6] hover:text-[#C9A15A] transition-colors">Help Center</a></li>
              <li><a href="#" className="text-[#8A94A6] hover:text-[#C9A15A] transition-colors">Safety Guides</a></li>
              <li><a href="#" className="text-[#8A94A6] hover:text-[#C9A15A] transition-colors">Booking Policy</a></li>
              <li><a href="#" className="text-[#8A94A6] hover:text-[#C9A15A] transition-colors">Contact Us</a></li>
            </ul>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <h4 className="font-mono text-[11px] font-bold uppercase tracking-widest text-[#8A94A6] mb-4">Company</h4>
            <ul className="space-y-3 text-xs">
              <li><a href="#" className="text-[#8A94A6] hover:text-[#C9A15A] transition-colors">About Us</a></li>
              <li><a href="#" className="text-[#8A94A6] hover:text-[#C9A15A] transition-colors">Careers</a></li>
              <li><a href="#" className="text-[#8A94A6] hover:text-[#C9A15A] transition-colors">Partnerships</a></li>
              <li><a href="#" className="text-[#8A94A6] hover:text-[#C9A15A] transition-colors">Press room</a></li>
            </ul>
          </div>
        </div>

        {/* Newsletter Signup Column */}
        <div className="lg:col-span-3 space-y-4">
          <h4 className="font-heading font-extrabold text-xs uppercase tracking-widest text-text-muted">Newsletter</h4>
          <p className="text-xs text-text-muted leading-relaxed">
            Subscribe to receive exclusive deals, travel diaries, and customized package notifications.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-2 relative mt-4">
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-md border border-[#C9A15A]/25 bg-[#0B0F1A] text-[#EDEAE2] text-xs font-semibold placeholder:text-[#8A94A6] focus:outline-none focus:border-[#C9A15A] focus:ring-1 focus:ring-[#C9A15A] transition-all pr-10"
              />
              <button
                type="submit"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-accent-primary hover:text-accent-sunset cursor-pointer transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            
            {subscribed && (
              <div className="text-[10px] text-accent-emerald font-semibold flex items-center gap-1 mt-1 animate-in fade-in duration-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Thanks for subscribing! Check your inbox.
              </div>
            )}
          </form>
        </div>

      </div>

      {/* Copyrights and Terms */}
      <div className="max-w-7xl mx-auto px-6 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-text-muted">
        <div>
          © {currentYear} AeroTravel Technologies Private Limited. All rights reserved. (Academic & Demo Project)
        </div>
        <div className="flex gap-6">
          <button 
            onClick={() => setShowPrivacyModal(true)} 
            className="hover:text-accent-primary transition-colors cursor-pointer"
          >
            Privacy & Data Notice
          </button>
          <a href="#" className="hover:text-accent-primary transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-accent-primary transition-colors">Sitemap</a>
        </div>
      </div>

      {/* Privacy & Data Collection Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#161B2C] border border-[#C9A15A]/40 rounded-xl p-6 max-w-md w-full shadow-2xl text-[#EDEAE2] space-y-4 relative">
            <button 
              onClick={() => setShowPrivacyModal(false)}
              className="absolute top-4 right-4 text-[#8A94A6] hover:text-[#C9A15A] transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-[#C9A15A]">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="font-display font-bold text-base">Privacy & Data Collection Notice</h3>
            </div>

            <div className="text-xs text-[#8A94A6] leading-relaxed space-y-3">
              <p>
                <strong className="text-[#EDEAE2]">Data Collected:</strong> AeroTravel collects minimal user information (guest name, email address, and booking details) strictly to generate trip itineraries and process mock booking entries within the application.
              </p>
              <p>
                <strong className="text-[#EDEAE2]">Academic & Demo Scope:</strong> This application is an academic/demo project for demonstration purposes. It is not intended for commercial production, real payment processing, or handling personal data at scale.
              </p>
              <p>
                <strong className="text-[#EDEAE2]">Third-Party Sharing:</strong> No personal user data is shared with third parties, beyond necessary external API queries used to fetch live mapping, hotel, and flight data (Geoapify, Wikipedia, Xotelo, Duffel, and similar APIs).
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="px-4 py-2 bg-[#C9A15A]/15 border border-[#C9A15A]/50 text-[#C9A15A] rounded-md text-xs font-semibold hover:bg-[#C9A15A]/25 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
