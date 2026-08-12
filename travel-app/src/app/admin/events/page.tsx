"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "@/utils/config";
import { ShieldCheck, CheckCircle2, XCircle, AlertTriangle, Calendar, MapPin, Loader2, ArrowLeft, RefreshCw, Mail, Tag } from "lucide-react";
import Link from "next/link";

interface PendingEvent {
  id: number;
  city: string;
  title: string;
  description: string;
  category: string;
  start_date: string;
  end_date: string;
  location_name?: string;
  source: string;
  submitted_by?: number;
  submitter_email?: string;
  status: string;
  created_at: string;
  is_flagged: number;
  flag_reason?: string;
}

export default function AdminEventsPage() {
  const { user, token, openAuthModal } = useAuth();
  const [events, setEvents] = useState<PendingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchPendingEvents = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/events`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setEvents(data.events || []);
      } else {
        setError(data.error || "Failed to load pending events. Admin access required.");
      }
    } catch (err) {
      console.error("Error fetching admin events:", err);
      setError("Network error connecting to admin service.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingEvents();
  }, [token]);

  const handleApprove = async (eventId: number) => {
    if (!token) return;
    setActionLoadingId(eventId);
    setActionMessage(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/events/${eventId}/approve`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionMessage({ type: "success", text: `Event #${eventId} approved successfully and is now live!` });
        setEvents((prev) => prev.filter((e) => e.id !== eventId));
      } else {
        setActionMessage({ type: "error", text: data.error || "Failed to approve event." });
      }
    } catch (err) {
      console.error("Error approving event:", err);
      setActionMessage({ type: "error", text: "Network error approving event." });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (eventId: number) => {
    if (!token) return;
    setActionLoadingId(eventId);
    setActionMessage(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/events/${eventId}/reject`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionMessage({ type: "success", text: `Event #${eventId} rejected.` });
        setEvents((prev) => prev.filter((e) => e.id !== eventId));
      } else {
        setActionMessage({ type: "error", text: data.error || "Failed to reject event." });
      }
    } catch (err) {
      console.error("Error rejecting event:", err);
      setActionMessage({ type: "error", text: "Network error rejecting event." });
    } finally {
      setActionLoadingId(null);
    }
  };

  if (!user || !token) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
        <div className="p-8 max-w-md w-full rounded-2xl bg-slate-900 border border-slate-800 text-center shadow-2xl space-y-4">
          <ShieldCheck className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-xl font-bold">Admin Privileges Required</h2>
          <p className="text-xs text-slate-400">
            Please log in with an administrator account to access the event moderation queue.
          </p>
          <button
            onClick={() => openAuthModal("login")}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 font-semibold text-xs shadow-lg hover:from-amber-600 hover:to-orange-700 transition-all"
          >
            Log In as Admin
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <Link
              href="/"
              className="inline-flex items-center space-x-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to AeroTravel</span>
            </Link>
            <div className="flex items-center space-x-3">
              <span className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <ShieldCheck className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">Admin Event Moderation</h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Review pending user-submitted events before they go live on public city guides.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={fetchPendingEvents}
            disabled={loading}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-amber-400" : ""}`} />
            <span>Refresh Queue</span>
          </button>
        </div>

        {/* Action Status Toast */}
        {actionMessage && (
          <div
            className={`p-4 rounded-xl text-xs flex items-center space-x-2 border ${
              actionMessage.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            {actionMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{actionMessage.text}</span>
          </div>
        )}

        {/* Main Content Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-10 h-10 animate-spin text-amber-500 mb-3" />
            <p className="text-xs">Loading moderation queue...</p>
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 flex-shrink-0" />
            <span>{error}</span>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 px-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">Queue Clear!</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              There are no pending user submissions waiting for moderation. All submissions are reviewed.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-xs font-semibold text-slate-400 flex items-center justify-between">
              <span>{events.length} Pending Event{events.length > 1 ? "s" : ""} Awaiting Review</span>
              <span className="text-amber-400">Sorted by Priority & Submission Date</span>
            </div>

            {events.map((event) => (
              <div
                key={event.id}
                className={`p-6 rounded-2xl bg-slate-900/80 border transition-all shadow-lg space-y-4 ${
                  event.is_flagged
                    ? "border-amber-500/50 bg-amber-500/5"
                    : "border-slate-800 hover:border-slate-700"
                }`}
              >
                {/* Priority Flag Alert */}
                {event.is_flagged === 1 && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span className="font-semibold">Priority Review Flag: {event.flag_reason || "Suspicious content detected"}</span>
                  </div>
                )}

                {/* Event Details Grid */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        📍 {event.city}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700 capitalize flex items-center">
                        <Tag className="w-3 h-3 mr-1 text-slate-400" />
                        {event.category}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center">
                        <Mail className="w-3.5 h-3.5 mr-1 text-slate-500" />
                        {event.submitter_email || `User #${event.submitted_by}`}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white">{event.title}</h3>

                    <div className="flex items-center space-x-4 text-xs text-slate-400 flex-wrap gap-y-1">
                      <div className="flex items-center space-x-1 text-amber-300">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{event.start_date} to {event.end_date}</span>
                      </div>

                      {event.location_name && (
                        <div className="flex items-center space-x-1 text-slate-400">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{event.location_name}</span>
                        </div>
                      )}
                    </div>

                    {event.description && (
                      <p className="text-xs text-slate-300 bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
                        {event.description}
                      </p>
                    )}
                  </div>

                  {/* Approve / Reject Actions */}
                  <div className="flex items-center space-x-3 md:flex-col md:space-x-0 md:space-y-2 shrink-0 pt-2 md:pt-0">
                    <button
                      onClick={() => handleApprove(event.id)}
                      disabled={actionLoadingId === event.id}
                      className="flex-1 md:w-32 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-md flex items-center justify-center space-x-1.5 disabled:opacity-50"
                    >
                      {actionLoadingId === event.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Approve</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleReject(event.id)}
                      disabled={actionLoadingId === event.id}
                      className="flex-1 md:w-32 py-2.5 px-4 rounded-xl bg-red-600/80 hover:bg-red-600 text-white font-semibold text-xs transition-all shadow-md flex items-center justify-center space-x-1.5 disabled:opacity-50"
                    >
                      {actionLoadingId === event.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" />
                          <span>Reject</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
