"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, MapPin, Plus, Sparkles, Tag, CheckCircle2, AlertCircle, Loader2, X, Music, Tent, Store, Compass } from "lucide-react";
import { API_BASE_URL } from "@/utils/config";
import { useAuth } from "@/context/AuthContext";

export interface LocalEvent {
  id?: number | null;
  city: string;
  title: string;
  description: string;
  category: "fair" | "festival" | "concert" | "market" | "other" | string;
  start_date: string;
  end_date: string;
  location_name?: string;
  latitude?: number | null;
  longitude?: number | null;
  source: "api" | "user_submitted";
  submitted_by?: number | null;
  status: "pending" | "approved" | "rejected";
  created_at?: string;
}

interface LocalEventsProps {
  city: string;
}

export const LocalEvents: React.FC<LocalEventsProps> = ({ city }) => {
  const { user, token, openAuthModal } = useAuth();
  const [events, setEvents] = useState<LocalEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);

  // Form state for user event submission
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("festival");
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchEvents = async () => {
    if (!city) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/events?city=${encodeURIComponent(city)}`);
      const data = await res.json();
      if (data.success) {
        setEvents(data.events || []);
      } else {
        setError(data.error || "Failed to load local events.");
      }
    } catch (err) {
      console.error("Error fetching local events:", err);
      setError("Unable to connect to events server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [city]);

  const handleOpenSubmitModal = () => {
    if (!user) {
      openAuthModal("login");
      return;
    }
    setSubmitMessage(null);
    setIsSubmitModalOpen(true);
  };

  const handleSubmitEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      openAuthModal("login");
      return;
    }

    if (!formTitle.trim() || !formStartDate || !formEndDate) {
      setSubmitMessage({ type: "error", text: "Please fill in title, start date, and end date." });
      return;
    }

    setSubmitting(true);
    setSubmitMessage(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          city,
          title: formTitle.trim(),
          category: formCategory,
          start_date: formStartDate,
          end_date: formEndDate,
          location_name: formLocation.trim(),
          description: formDescription.trim()
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitMessage({
          type: "success",
          text: "🎉 Your event was submitted! It is currently pending review by our local moderators."
        });
        // Reset form
        setFormTitle("");
        setFormLocation("");
        setFormDescription("");
        setFormStartDate("");
        setFormEndDate("");
        setTimeout(() => {
          setIsSubmitModalOpen(false);
          setSubmitMessage(null);
        }, 2500);
      } else {
        setSubmitMessage({ type: "error", text: data.error || "Failed to submit event." });
      }
    } catch (err) {
      console.error("Error submitting event:", err);
      setSubmitMessage({ type: "error", text: "Network error submitting event." });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredEvents = events.filter((e) => {
    if (selectedCategory === "all") return true;
    return e.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  const getCategoryBadgeStyle = (cat: string) => {
    switch (cat.toLowerCase()) {
      case "concert":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
      case "festival":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "fair":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "market":
        return "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20";
      default:
        return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20";
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat.toLowerCase()) {
      case "concert":
        return <Music className="w-3.5 h-3.5 mr-1 text-purple-500" />;
      case "festival":
        return <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-500" />;
      case "fair":
        return <Tent className="w-3.5 h-3.5 mr-1 text-emerald-500" />;
      case "market":
        return <Store className="w-3.5 h-3.5 mr-1 text-cyan-500" />;
      default:
        return <Compass className="w-3.5 h-3.5 mr-1 text-slate-500" />;
    }
  };

  const formatDateRange = (startStr: string, endStr: string) => {
    try {
      const s = new Date(startStr);
      const e = new Date(endStr);
      const sFmt = s.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      const eFmt = e.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      if (sFmt === eFmt) return sFmt;
      return `${sFmt} - ${eFmt}`;
    } catch {
      return `${startStr} to ${endStr}`;
    }
  };

  return (
    <div className="w-full my-8 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xl">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-200/60 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Sparkles className="w-5 h-5" />
            </span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Real Local Events in {city}
            </h3>
          </div>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Major festivals, concerts, night markets & authentic local fairs happening in {city}.
          </p>
        </div>

        <button
          onClick={handleOpenSubmitModal}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-medium text-xs md:text-sm shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          <span>Submit Local Event</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
        {["all", "festival", "concert", "fair", "market", "other"].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize transition-all duration-200 flex items-center space-x-1 whitespace-nowrap ${
              selectedCategory === cat
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            <Tag className="w-3 h-3 mr-1" />
            <span>{cat === "all" ? "All Events" : cat}</span>
          </button>
        ))}
      </div>

      {/* Events List Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-2" />
          <p className="text-xs">Discovering real events in {city}...</p>
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-10 px-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-800">
          <Calendar className="w-10 h-10 mx-auto text-slate-400 mb-2 opacity-60" />
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            No {selectedCategory !== "all" ? selectedCategory : ""} events found for {city}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Know a temple fest, market, or fair happening soon? Be the first to submit it!
          </p>
          <button
            onClick={handleOpenSubmitModal}
            className="mt-4 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
          >
            + Submit Event
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {filteredEvents.map((ev, idx) => (
              <motion.div
                key={ev.id || `${ev.title}-${idx}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: idx * 0.05 }}
                className="group relative flex flex-col justify-between p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 hover:border-amber-500/50 dark:hover:border-amber-500/50 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <div>
                  {/* Category & Source Row */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getCategoryBadgeStyle(
                        ev.category
                      )}`}
                    >
                      {getCategoryIcon(ev.category)}
                      <span className="capitalize">{ev.category}</span>
                    </span>

                    <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 dark:text-slate-500 bg-slate-200/60 dark:bg-slate-700/50 px-2 py-0.5 rounded">
                      {ev.source === "user_submitted" ? "Community" : "Official"}
                    </span>
                  </div>

                  {/* Title */}
                  <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
                    {ev.title}
                  </h4>

                  {/* Date & Location */}
                  <div className="space-y-1 my-2 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center space-x-1.5 text-amber-700 dark:text-amber-300 font-medium">
                      <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{formatDateRange(ev.start_date, ev.end_date)}</span>
                    </div>

                    {ev.location_name && (
                      <div className="flex items-center space-x-1.5 text-slate-500 dark:text-slate-400">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="line-clamp-1">{ev.location_name}</span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {ev.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mt-1">
                      {ev.description}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Submission Modal */}
      <AnimatePresence>
        {isSubmitModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center space-x-2 mb-4">
                <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                  <Sparkles className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Submit Event for {city}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Share a fair, temple fest, or local market with fellow travelers.
                  </p>
                </div>
              </div>

              {submitMessage && (
                <div
                  className={`p-3 rounded-xl mb-4 text-xs flex items-center space-x-2 ${
                    submitMessage.type === "success"
                      ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                      : "bg-red-500/10 border border-red-500/20 text-red-600"
                  }`}
                >
                  {submitMessage.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  )}
                  <span>{submitMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleSubmitEvent} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Annual Temple Night Fair & Food Festival"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Category *
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 capitalize"
                    >
                      <option value="festival">Festival</option>
                      <option value="fair">Fair / Mela</option>
                      <option value="concert">Concert / Gig</option>
                      <option value="market">Market / Flea</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Venue / Location Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Town Hall Grounds"
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formStartDate}
                      onChange={(e) => setFormStartDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      End Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formEndDate}
                      onChange={(e) => setFormEndDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Short Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Provide details about activities, food stalls, entry pass, timing..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsSubmitModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-md flex items-center space-x-1.5"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <span>Submit for Review</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
