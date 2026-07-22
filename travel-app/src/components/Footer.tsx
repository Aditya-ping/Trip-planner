"use client";

import { useState } from "react";
import { Compass, Send, CheckCircle2 } from "lucide-react";

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
    <footer className="border-t border-border-color bg-card-bg/25 pt-20 pb-8 text-fg-main overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 border-b border-border-color pb-16">
        
        {/* Brand Column */}
        <div className="lg:col-span-4 space-y-6">
          <a href="#" className="flex items-center gap-2 group">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-accent-primary to-accent-sunset text-white shadow-lg shadow-accent-primary/25">
              <Compass className="w-5 h-5 animate-pulse-slow" />
            </div>
            <span className="font-heading font-black text-xl tracking-tight bg-gradient-to-r from-accent-primary to-accent-sunset bg-clip-text text-transparent">
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
                  className="p-2.5 rounded-xl border border-border-color hover:bg-card-bg text-text-muted hover:text-accent-primary transition-all duration-200"
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
            <h4 className="font-heading font-extrabold text-xs uppercase tracking-widest text-text-muted mb-4">Discover</h4>
            <ul className="space-y-3 text-xs">
              <li><a href="#destinations" className="text-text-muted hover:text-accent-primary transition-colors">Destinations</a></li>
              <li><a href="#experiences" className="text-text-muted hover:text-accent-primary transition-colors">Experiences</a></li>
              <li><a href="#packages" className="text-text-muted hover:text-accent-primary transition-colors">Packages</a></li>
              <li><a href="#ai-planner" className="text-text-muted hover:text-accent-primary transition-colors">AI Itinerary</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-heading font-extrabold text-xs uppercase tracking-widest text-text-muted mb-4">Support</h4>
            <ul className="space-y-3 text-xs">
              <li><a href="#" className="text-text-muted hover:text-accent-primary transition-colors">Help Center</a></li>
              <li><a href="#" className="text-text-muted hover:text-accent-primary transition-colors">Safety Guides</a></li>
              <li><a href="#" className="text-text-muted hover:text-accent-primary transition-colors">Booking Policy</a></li>
              <li><a href="#" className="text-text-muted hover:text-accent-primary transition-colors">Contact Us</a></li>
            </ul>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <h4 className="font-heading font-extrabold text-xs uppercase tracking-widest text-text-muted mb-4">Company</h4>
            <ul className="space-y-3 text-xs">
              <li><a href="#" className="text-text-muted hover:text-accent-primary transition-colors">About Us</a></li>
              <li><a href="#" className="text-text-muted hover:text-accent-primary transition-colors">Careers</a></li>
              <li><a href="#" className="text-text-muted hover:text-accent-primary transition-colors">Partnerships</a></li>
              <li><a href="#" className="text-text-muted hover:text-accent-primary transition-colors">Press room</a></li>
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
                className="w-full px-4 py-3 rounded-xl border border-border-color bg-bg-main text-xs font-semibold focus:outline-none pr-10"
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
          © {currentYear} AeroTravel Technologies Private Limited. All rights reserved.
        </div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-accent-primary transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-accent-primary transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-accent-primary transition-colors">Sitemap</a>
        </div>
      </div>
    </footer>
  );
}
