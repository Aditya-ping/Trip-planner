"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, Menu, X, Sun, Moon, Sparkles, Search, Loader2, PlaneTakeoff, CheckCircle, User, LogOut, Lock, Mail } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "@/utils/config";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [theme, setTheme] = useState("light");

  // Auth context
  const { user, login, logout, isAuthModalOpen, openAuthModal, closeAuthModal, authMode, setAuthMode } = useAuth();
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Status check modal states
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [refId, setRefId] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookingData, setBookingData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.trim() || !authPassword) return;

    setAuthLoading(true);
    setAuthError(null);

    const endpoint = authMode === "login" ? "/api/auth/login" : "/api/auth/register";

    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authEmail.trim(), password: authPassword }),
      });

      const data = await res.json();
      if (data.success) {
        login(data.token, data.user);
        setAuthEmail("");
        setAuthPassword("");
      } else {
        setAuthError(data.error || "Authentication failed.");
      }
    } catch (err) {
      console.error("Auth error:", err);
      setAuthError("Failed to connect to authentication server.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refId.trim()) return;

    setLoading(true);
    setError(null);
    setBookingData(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings/${refId.trim().toUpperCase()}`);
      const data = await res.json();
      if (data.success) {
        setBookingData(data.booking);
      } else {
        setError(data.error || "No booking found with this Reference ID.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to reach the server. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const closeStatusModal = () => {
    setIsStatusOpen(false);
    setRefId("");
    setBookingData(null);
    setError(null);
  };

  useEffect(() => {
    // Sync theme on mount
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Scroll listener
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const navLinks = [
    { name: "Explore", href: "#explore" },
    { name: "Destinations", href: "#destinations" },
    { name: "Experiences", href: "#experiences" },
    { name: "AI Planner", href: "#ai-planner" },
    { name: "Packages", href: "#packages" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#161B2C] border-b border-[#C9A15A]/20 py-4 shadow-document"
          : "bg-[#161B2C] border-b border-[#C9A15A]/20 py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* Brand Logo */}
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="p-2 rounded-md bg-[#C9A15A]/10 border border-[#C9A15A]/40 text-[#C9A15A] group-hover:border-[#C9A15A]/80 group-hover:bg-[#C9A15A]/20 transition-colors duration-200">
            <Compass className="w-5 h-5" />
          </div>
          <span className="font-display font-bold text-2xl tracking-tight text-[#EDEAE2]">
            AeroTravel
          </span>
        </a>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="font-sans text-xs font-semibold uppercase tracking-wider text-[#8A94A6] hover:text-[#C9A15A] border-b-2 border-transparent hover:border-[#C9A15A] py-1 transition-all duration-200"
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* Action Controls */}
        <div className="hidden md:flex items-center gap-3">
          {/* Check Status Button */}
          <button
            onClick={() => setIsStatusOpen(true)}
            className="font-sans flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-[#C9A15A]/25 bg-[#161B2C] hover:bg-[#C9A15A]/10 hover:text-[#C9A15A] text-xs font-semibold transition-all duration-200 cursor-pointer text-[#EDEAE2]"
          >
            <Search className="w-3.5 h-3.5" />
            Check Status
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-md border border-[#C9A15A]/25 bg-[#161B2C] hover:bg-[#C9A15A]/10 transition-colors duration-200 cursor-pointer text-[#EDEAE2]"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 text-yellow-400" />
            ) : (
              <Moon className="w-5 h-5 text-[#C9A15A]" />
            )}
          </button>

          {/* User Auth Section */}
          {user ? (
            <div className="font-sans flex items-center gap-2 px-3 py-1.5 rounded-md border border-[#C9A15A]/30 bg-[#161B2C] text-[#EDEAE2]">
              <User className="w-4 h-4 text-[#C9A15A]" />
              <span className="text-xs font-semibold max-w-[130px] truncate">{user.email}</span>
              <button
                onClick={logout}
                title="Log Out"
                className="p-1 rounded hover:bg-white/10 text-red-400 transition-colors ml-1"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => openAuthModal("login")}
              className="font-sans px-4 py-2 rounded-md border border-[#C9A15A]/40 hover:bg-[#C9A15A]/10 text-[#C9A15A] font-semibold text-xs transition-all duration-200 cursor-pointer"
            >
              Sign In
            </button>
          )}

          {/* CTA */}
          <a
            href="#ai-planner"
            className="font-sans flex items-center gap-2 px-4 py-2 rounded-md bg-[#C9A15A] hover:bg-[#E6C887] text-[#0B0F1A] font-semibold text-xs shadow-md transition-all duration-200"
          >
            <Sparkles className="w-4 h-4" />
            AI Planner
          </a>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md border border-[#C9A15A]/25 transition-colors"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-yellow-400" />
            ) : (
              <Moon className="w-4 h-4 text-[#C9A15A]" />
            )}
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-md border border-[#C9A15A]/25 text-[#EDEAE2] hover:bg-[#C9A15A]/10 transition-colors"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-[#161B2C] border-b border-[#C9A15A]/20 py-6 px-6 flex flex-col gap-4 md:hidden shadow-lg animate-in fade-in slide-in-from-top-5 duration-200">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="text-base font-medium py-2 border-b border-border-color/50 last:border-0 hover:text-accent-secondary transition-colors"
            >
              {link.name}
            </a>
          ))}
          <button
            onClick={() => {
              setIsOpen(false);
              setIsStatusOpen(true);
            }}
            className="flex items-center justify-center gap-1.5 w-full py-3 rounded-xl border border-border-color text-fg-main font-semibold text-center cursor-pointer"
          >
            <Search className="w-4 h-4" />
            Check Booking Status
          </button>
          <a
            href="#ai-planner"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary text-white font-semibold shadow-lg text-center"
          >
            <Sparkles className="w-5 h-5" />
            Launch AI Planner
          </a>
        </div>
      )}

      {/* Check Status Modal */}
      <AnimatePresence>
        {isStatusOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeStatusModal}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl glassmorphism border border-white/10 shadow-2xl z-10 bg-card-bg backdrop-blur-xl p-6 sm:p-8 text-fg-main"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-heading font-black text-xl tracking-tight flex items-center gap-2">
                  <Search className="w-5 h-5 text-accent-sunset" />
                  Check Booking Status
                </h3>
                <button
                  onClick={closeStatusModal}
                  className="p-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-text-muted hover:text-fg-main cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleLookup} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2">
                    Enter Reference ID
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="e.g. AT-123456"
                      value={refId}
                      onChange={(e) => setRefId(e.target.value)}
                      className="flex-1 px-4 py-3 rounded-xl border border-border-color focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 outline-none transition-all text-sm bg-black/20 text-fg-main"
                    />
                    <button
                      type="submit"
                      disabled={loading || !refId.trim()}
                      className="px-5 py-3 rounded-xl bg-accent-primary text-white text-xs font-bold shadow-md hover:bg-accent-sunset transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Search className="w-4 h-4" />
                      )}
                      Lookup
                    </button>
                  </div>
                </div>
              </form>

              {error && (
                <div className="mt-5 p-4 rounded-2xl border border-red-500/20 bg-red-500/5 text-red-400 text-xs text-center font-medium">
                  {error}
                </div>
              )}

              {bookingData && (
                <div className="mt-6 space-y-4 animate-in fade-in duration-300 text-left">
                  <div className="border-t border-border-color pt-5" />

                  {/* Status Indicator */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Booking Status</span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {bookingData.status || "Confirmed"}
                    </span>
                  </div>

                  {/* Booking Receipt Summary Card */}
                  <div className="p-4 rounded-2xl bg-fg-main/5 border border-border-color space-y-3.5 text-xs text-text-muted">
                    <div className="flex justify-between border-b border-border-color/60 pb-1.5">
                      <span className="font-bold">Lead Traveler</span>
                      <span className="text-fg-main font-semibold">{bookingData.guest_name}</span>
                    </div>
                    <div className="flex justify-between border-b border-border-color/60 pb-1.5">
                      <span className="font-bold">Destination</span>
                      <span className="text-fg-main font-semibold">{bookingData.destination}</span>
                    </div>
                    <div className="flex justify-between border-b border-border-color/60 pb-1.5">
                      <span className="font-bold">Hotel Stay</span>
                      <span className="text-fg-main font-semibold truncate max-w-[180px]">{bookingData.hotel_name}</span>
                    </div>
                    <div className="flex justify-between border-b border-border-color/60 pb-1.5">
                      <span className="font-bold">Room Option</span>
                      <span className="text-fg-main font-semibold truncate max-w-[180px]">{bookingData.room_type}</span>
                    </div>
                    {bookingData.flight_info && (
                      <div className="flex justify-between border-b border-border-color/60 pb-1.5">
                        <span className="font-bold">Flight Booked</span>
                        <span className="text-fg-main font-semibold truncate max-w-[180px]">{bookingData.flight_info}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-b border-border-color/60 pb-1.5">
                      <span className="font-bold">Dates</span>
                      <span className="text-fg-main font-semibold">{bookingData.check_in} to {bookingData.check_out}</span>
                    </div>
                    <div className="flex justify-between border-b border-border-color/60 pb-1.5">
                      <span className="font-bold">Guests</span>
                      <span className="text-fg-main font-semibold">{bookingData.guests} Guest(s)</span>
                    </div>
                    <div className="flex justify-between pb-0.5">
                      <span className="font-bold">Total Stay Cost</span>
                      <span className="text-accent-sunset font-extrabold text-sm">₹{bookingData.total_cost.toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  {/* Flight upsell redirection inside lookup */}
                  {!bookingData.flight_info && (
                    <div className="p-4 rounded-2xl bg-accent-primary/5 border border-accent-primary/10 space-y-2.5 text-left shadow-inner">
                      <div className="flex items-center gap-1.5 text-accent-primary">
                        <PlaneTakeoff className="w-4 h-4 text-accent-sunset animate-pulse" />
                        <h5 className="text-[10px] font-black uppercase tracking-wider">Flight Booking Assistance</h5>
                      </div>
                      <p className="text-[9px] text-text-muted leading-relaxed">
                        Do you need a flight for this trip? Integrate live flight options and customize seat selection for your stay package.
                      </p>
                      <button
                        onClick={() => {
                          closeStatusModal();
                          // Redirect to checkout with flights enabled
                          const dest = bookingData.destination;
                          // Determine nights
                          let nights = 3;
                          try {
                            const start = new Date(bookingData.check_in);
                            const end = new Date(bookingData.check_out);
                            const diff = end.getTime() - start.getTime();
                            nights = Math.ceil(diff / (1000 * 60 * 60 * 24)) || 3;
                          } catch(e) {}
                          
                          const cityCodeMapping = {
                            "kerala": "Kochi",
                            "taj mahal": "Agra",
                            "leh": "Leh"
                          };
                          let city = dest;
                          Object.entries(cityCodeMapping).forEach(([k, v]) => {
                            if (dest.toLowerCase().includes(k)) city = v;
                          });

                          window.location.href = `/checkout?packageId=custom&city=${encodeURIComponent(city)}&priceNum=${bookingData.total_cost}&days=${nights + 1} Days / ${nights} Nights&image=https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80&includeFlights=true`;
                        }}
                        className="flex items-center justify-center gap-1 w-full py-2 rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary hover:opacity-95 text-white text-[10px] font-bold shadow-md transition-colors cursor-pointer"
                      >
                        <PlaneTakeoff className="w-3 h-3" />
                        Book Flights & Customize Now
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeAuthModal}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative z-10 w-full max-w-md bg-card-bg border border-border-color rounded-3xl p-6 sm:p-8 shadow-premium text-fg-main"
            >
              <button
                onClick={closeAuthModal}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/10 text-text-muted hover:text-fg-main transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-6">
                <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-accent-primary to-accent-secondary text-white shadow-lg shadow-accent-primary/20 mb-3">
                  <Compass className="w-6 h-6 animate-pulse-slow" />
                </div>
                <h3 className="font-heading font-extrabold text-2xl tracking-tight">
                  {authMode === "login" ? "Welcome Back to AeroTravel" : "Create AeroTravel Account"}
                </h3>
                <p className="text-xs text-text-muted mt-1">
                  {authMode === "login"
                    ? "Sign in to access your saved itineraries and bookings"
                    : "Register to save your personalized trips and manage bookings"}
                </p>
              </div>

              {/* Tab selector */}
              <div className="flex p-1 bg-white/5 border border-border-color rounded-xl mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("login");
                    setAuthError(null);
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    authMode === "login" ? "bg-accent-primary text-white shadow-md" : "text-text-muted hover:text-fg-main"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("register");
                    setAuthError(null);
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    authMode === "register" ? "bg-accent-primary text-white shadow-md" : "text-text-muted hover:text-fg-main"
                  }`}
                >
                  Register
                </button>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-border-color focus:border-accent-primary focus:outline-none text-xs text-fg-main font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder="••••••••"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-border-color focus:border-accent-primary focus:outline-none text-xs text-fg-main font-medium"
                    />
                  </div>
                  {authMode === "register" && (
                    <p className="text-[10px] text-text-muted mt-1">Must be at least 6 characters</p>
                  )}
                </div>

                {authError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold text-center">
                    {authError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-accent-primary/20 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {authLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {authMode === "login" ? "Signing In..." : "Creating Account..."}
                    </>
                  ) : (
                    <>{authMode === "login" ? "Sign In" : "Register Account"}</>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </nav>
  );
}
