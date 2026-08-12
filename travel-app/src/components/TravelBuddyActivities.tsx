"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Calendar, MapPin, Plus, Sparkles, Clock, CheckCircle2, XCircle, AlertCircle, Loader2, X, Compass, Utensils, Mountain, Trash2, UserCheck, UserPlus, ShieldAlert, Ban, Flag, ShieldCheck } from "lucide-react";
import { API_BASE_URL } from "@/utils/config";
import { useAuth } from "@/context/AuthContext";

export interface ActivityInvite {
  id: number;
  host_user_id: number;
  host_email?: string;
  title: string;
  description: string;
  activity_type: "adventure" | "food" | "sightseeing" | "other" | string;
  city: string;
  location_name?: string;
  scheduled_date: string;
  scheduled_time?: string;
  max_participants?: number | null;
  status: "open" | "full" | "cancelled" | "completed";
  created_at?: string;
  accepted_participants_count?: number;
  pending_requests_count?: number;
  is_host?: boolean;
  user_join_status?: "none" | "requested" | "accepted" | "declined";
  host_trust_signal?: {
    badge_label: string;
    is_active_member: boolean;
    activities_count: number;
    clean_record: boolean;
  };
  participants?: Array<{
    participant_id: number;
    user_id: number;
    user_email: string;
    status: "requested" | "accepted" | "declined";
    joined_at: string;
    trust_signal?: {
      badge_label: string;
      is_active_member: boolean;
      activities_count: number;
    };
  }>;
}

interface TravelBuddyActivitiesProps {
  city: string;
}

export const TravelBuddyActivities: React.FC<TravelBuddyActivitiesProps> = ({ city }) => {
  const { user, token, openAuthModal } = useAuth();
  const [activities, setActivities] = useState<ActivityInvite[]>([]);
  const [myHosted, setMyHosted] = useState<ActivityInvite[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"city" | "my">("city");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [isHostModalOpen, setIsHostModalOpen] = useState<boolean>(false);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formType, setFormType] = useState("adventure");
  const [formDate, setFormDate] = useState("");
  const [formTime, setFormTime] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formMax, setFormMax] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | number | null>(null);

  // Safety Report & Block modal states
  const [reportTarget, setReportTarget] = useState<{ userId: number; inviteId?: number; title: string } | null>(null);
  const [reportReason, setReportReason] = useState("suspicious_behavior");
  const [reportDesc, setReportDesc] = useState("");
  const [blockTarget, setBlockTarget] = useState<{ userId: number; userEmail?: string } | null>(null);

  const handleOpenReportModal = (userId: number, inviteId?: number, title: string = "User Activity") => {
    if (!user) {
      openAuthModal("login");
      return;
    }
    setReportReason("suspicious_behavior");
    setReportDesc("");
    setReportTarget({ userId, inviteId, title });
  };

  const handleOpenBlockModal = (userId: number, userEmail?: string) => {
    if (!user) {
      openAuthModal("login");
      return;
    }
    setBlockTarget({ userId, userEmail });
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !reportTarget) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          reported_user_id: reportTarget.userId,
          reported_invite_id: reportTarget.inviteId,
          reason: reportReason,
          description: reportDesc.trim()
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ type: "success", text: "Safety report submitted. Moderation will review it immediately." });
        setReportTarget(null);
      } else {
        setMessage({ type: "error", text: data.error || "Failed to submit report." });
      }
    } catch (err) {
      console.error("Error submitting report:", err);
      setMessage({ type: "error", text: "Network error submitting safety report." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmBlock = async () => {
    if (!token || !blockTarget) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/blocks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          blocked_user_id: blockTarget.userId
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ type: "success", text: `User #${blockTarget.userId} has been blocked.` });
        setBlockTarget(null);
        fetchActivities();
        fetchMyHosted();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to block user." });
      }
    } catch (err) {
      console.error("Error blocking user:", err);
      setMessage({ type: "error", text: "Network error blocking user." });
    } finally {
      setSubmitting(false);
    }
  };

  const fetchActivities = async () => {
    if (!city) return;
    setLoading(true);
    setError(null);

    try {
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/api/activities?city=${encodeURIComponent(city)}`, { headers });
      const data = await res.json();
      if (data.success) {
        setActivities(data.activities || []);
      } else {
        setError(data.error || "Failed to load activities.");
      }
    } catch (err) {
      console.error("Error fetching activities:", err);
      setError("Unable to connect to activities service.");
    } finally {
      setLoading(false);
    }
  };

  const fetchMyHosted = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/activities/my-hosted`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setMyHosted(data.activities || []);
      }
    } catch (err) {
      console.error("Error fetching hosted activities:", err);
    }
  };

  useEffect(() => {
    fetchActivities();
    if (token) {
      fetchMyHosted();
    }
  }, [city, token]);

  const handleOpenHostModal = () => {
    if (!user) {
      openAuthModal("login");
      return;
    }
    setMessage(null);
    setIsHostModalOpen(true);
  };

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      openAuthModal("login");
      return;
    }

    if (!formTitle.trim() || !formDate) {
      setMessage({ type: "error", text: "Please enter a title and scheduled date." });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/activities`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          city,
          title: formTitle.trim(),
          activity_type: formType,
          scheduled_date: formDate,
          scheduled_time: formTime.trim(),
          location_name: formLocation.trim(),
          max_participants: formMax ? parseInt(formMax) : null,
          description: formDesc.trim()
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ type: "success", text: "🎉 Activity invite created! Fellow travelers can now request to join you." });
        setFormTitle("");
        setFormLocation("");
        setFormDesc("");
        setFormDate("");
        setFormTime("");
        setFormMax("");
        fetchActivities();
        fetchMyHosted();
        setTimeout(() => {
          setIsHostModalOpen(false);
          setMessage(null);
        }, 2000);
      } else {
        setMessage({ type: "error", text: data.error || "Failed to create activity invite." });
      }
    } catch (err) {
      console.error("Error creating activity:", err);
      setMessage({ type: "error", text: "Network error creating activity." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoinRequest = async (activityId: number) => {
    if (!user || !token) {
      openAuthModal("login");
      return;
    }

    setActionLoadingId(`join-${activityId}`);
    setMessage(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/activities/${activityId}/join`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ type: "success", text: "Join request sent to host!" });
        fetchActivities();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to request join." });
      }
    } catch (err) {
      console.error("Error joining activity:", err);
      setMessage({ type: "error", text: "Network error requesting to join." });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRespondParticipant = async (activityId: number, participantUserId: number, action: "accept" | "decline") => {
    if (!token) return;
    setActionLoadingId(`resp-${activityId}-${participantUserId}`);

    try {
      const res = await fetch(`${API_BASE_URL}/api/activities/${activityId}/participants/${participantUserId}/respond`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchMyHosted();
        fetchActivities();
      }
    } catch (err) {
      console.error("Error responding to participant:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancelActivity = async (activityId: number) => {
    if (!token) return;
    if (!confirm("Are you sure you want to cancel this activity invite?")) return;

    setActionLoadingId(`cancel-${activityId}`);

    try {
      const res = await fetch(`${API_BASE_URL}/api/activities/${activityId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchMyHosted();
        fetchActivities();
      }
    } catch (err) {
      console.error("Error cancelling activity:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredActivities = activities.filter((a) => {
    if (selectedType === "all") return true;
    return a.activity_type.toLowerCase() === selectedType.toLowerCase();
  });

  const getTypeBadgeStyle = (type: string) => {
    switch (type.toLowerCase()) {
      case "adventure":
        return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20";
      case "food":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
      case "sightseeing":
        return "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20";
      default:
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "adventure":
        return <Mountain className="w-3.5 h-3.5 mr-1 text-orange-500" />;
      case "food":
        return <Utensils className="w-3.5 h-3.5 mr-1 text-rose-500" />;
      case "sightseeing":
        return <Compass className="w-3.5 h-3.5 mr-1 text-cyan-500" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 mr-1 text-purple-500" />;
    }
  };

  return (
    <div className="w-full my-8 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xl">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-200/60 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
              <Users className="w-5 h-5" />
            </span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Traveler Activity Invites — {city}
            </h3>
          </div>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Connect with fellow travelers for scuba diving, food walks, treks, and sightseeing.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {token && (
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab("city")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "city"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              >
                All Invites
              </button>
              <button
                onClick={() => setActiveTab("my")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1 ${
                  activeTab === "my"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              >
                <span>My Activities</span>
                {myHosted.some((a) => (a.participants?.filter((p) => p.status === "requested").length || 0) > 0) && (
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                )}
              </button>
            </div>
          )}

          <button
            onClick={handleOpenHostModal}
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-medium text-xs md:text-sm shadow-md transition-all transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>Host Activity Invite</span>
          </button>
        </div>
      </div>

      {/* Safety Warning Banner */}
      <div className="mb-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-start space-x-2.5 shadow-sm">
        <ShieldAlert className="w-5 h-5 flex-shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="font-bold">🛡️ Safety First:</strong> Meet in public places, inform someone of your plans, and use the <strong>Report</strong> or <strong>Block</strong> options if something feels suspicious or uncomfortable.
        </div>
      </div>

      {/* Global Status Toast */}
      {message && (
        <div
          className={`p-3 rounded-xl mb-4 text-xs flex items-center space-x-2 ${
            message.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
              : "bg-red-500/10 border border-red-500/20 text-red-600"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* TAB 1: Public City Invites */}
      {activeTab === "city" && (
        <>
          {/* Activity Type Filters */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
            {["all", "adventure", "food", "sightseeing", "other"].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize transition-all flex items-center whitespace-nowrap ${
                  selectedType === type
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                }`}
              >
                <span>{type === "all" ? "All Activity Types" : type}</span>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500 mb-2" />
              <p className="text-xs">Finding traveler activity invites in {city}...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-10 px-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-800">
              <Users className="w-10 h-10 mx-auto text-slate-400 mb-2 opacity-60" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                No open activity invites found for {city}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Going scuba diving, exploring street food, or trekking soon? Create an invite!
              </p>
              <button
                onClick={handleOpenHostModal}
                className="mt-4 px-4 py-2 text-xs font-semibold rounded-lg bg-orange-500/10 text-orange-600 hover:bg-orange-500/20"
              >
                + Host First Activity
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence>
                {filteredActivities.map((act) => (
                  <motion.div
                    key={act.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col justify-between p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 hover:border-orange-500/50 transition-all shadow-sm hover:shadow-md space-y-3"
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getTypeBadgeStyle(
                            act.activity_type
                          )}`}
                        >
                          {getTypeIcon(act.activity_type)}
                          <span className="capitalize">{act.activity_type}</span>
                        </span>

                        <div className="flex items-center space-x-1.5 flex-wrap justify-end">
                          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                            Hosted by <strong className="text-slate-700 dark:text-slate-200">{act.host_email ? act.host_email.split("@")[0] : `User #${act.host_user_id}`}</strong>
                          </span>

                          {act.host_trust_signal && (
                            <span
                              className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                act.host_trust_signal.badge_label === "Established Traveler"
                                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                                  : act.host_trust_signal.is_active_member
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                                  : "bg-slate-100 text-slate-500 border-slate-200"
                              }`}
                              title="Clean safety record & active trip history on AeroTravel"
                            >
                              <ShieldCheck className="w-3 h-3" />
                              <span>{act.host_trust_signal.badge_label}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Title */}
                      <h4 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                        {act.title}
                      </h4>

                      {/* Date, Time & Spot Info */}
                      <div className="space-y-1 my-2 text-xs">
                        <div className="flex items-center justify-between flex-wrap gap-1 text-slate-600 dark:text-slate-300">
                          <div className="flex items-center space-x-1.5 text-orange-600 dark:text-orange-400 font-medium">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{act.scheduled_date}</span>
                            {act.scheduled_time && (
                              <>
                                <span>•</span>
                                <Clock className="w-3.5 h-3.5" />
                                <span>{act.scheduled_time}</span>
                              </>
                            )}
                          </div>

                          <div className="flex items-center space-x-1 text-slate-500 font-medium">
                            <Users className="w-3.5 h-3.5" />
                            <span>
                              {act.accepted_participants_count || 0}
                              {act.max_participants ? ` / ${act.max_participants}` : ""} spots filled
                            </span>
                          </div>
                        </div>

                        {act.location_name && (
                          <div className="flex items-center space-x-1.5 text-slate-500 dark:text-slate-400">
                            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="line-clamp-1">{act.location_name}</span>
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      {act.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {act.description}
                        </p>
                      )}
                    </div>

                    {/* Card Actions & Safety Buttons */}
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        {!act.is_host && (
                          <>
                            <button
                              onClick={() => handleOpenReportModal(act.host_user_id, act.id, act.title)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 transition-colors text-xs flex items-center space-x-1"
                              title="Report Activity or Host"
                            >
                              <Flag className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline text-[11px]">Report</span>
                            </button>
                            <button
                              onClick={() => handleOpenBlockModal(act.host_user_id, act.host_email)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors text-xs flex items-center space-x-1"
                              title="Block Host"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline text-[11px]">Block</span>
                            </button>
                          </>
                        )}
                      </div>

                      <div className="flex justify-end">
                        {act.is_host ? (
                          <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                            👑 Host (You)
                          </span>
                        ) : act.user_join_status === "accepted" ? (
                          <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Accepted & Joining!</span>
                          </span>
                        ) : act.user_join_status === "requested" ? (
                          <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-blue-500/10 text-blue-600 border border-blue-500/20 flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Request Pending</span>
                          </span>
                        ) : act.user_join_status === "declined" ? (
                          <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-200 text-slate-600">
                            Request Declined
                          </span>
                        ) : act.status === "full" ? (
                          <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-200 text-slate-600">
                            Activity Full
                          </span>
                        ) : (
                          <button
                            onClick={() => handleJoinRequest(act.id)}
                            disabled={actionLoadingId === `join-${act.id}`}
                            className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-md transition-all flex items-center space-x-1.5"
                          >
                            {actionLoadingId === `join-${act.id}` ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <>
                                <UserPlus className="w-3.5 h-3.5" />
                                <span>Request to Join</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </>
      )}

      {/* TAB 2: Host Management */}
      {activeTab === "my" && (
        <div className="space-y-4">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Manage your hosted group activities & approve join requests:
          </div>

          {myHosted.length === 0 ? (
            <div className="text-center py-10 rounded-xl border border-dashed border-slate-300 dark:border-slate-800">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                You haven't hosted any activities yet.
              </p>
              <button
                onClick={handleOpenHostModal}
                className="mt-3 px-4 py-2 text-xs font-semibold rounded-lg bg-orange-500/10 text-orange-600"
              >
                + Host Your First Activity
              </button>
            </div>
          ) : (
            myHosted.map((act) => {
              const pendingRequests = act.participants?.filter((p) => p.status === "requested") || [];
              const acceptedParticipants = act.participants?.filter((p) => p.status === "accepted") || [];

              return (
                <div
                  key={act.id}
                  className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-4"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                          [{act.activity_type}] {act.city}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 uppercase font-bold">
                          {act.status}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{act.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Scheduled: {act.scheduled_date} {act.scheduled_time || ""} • {act.location_name || "Location N/A"}
                      </p>
                    </div>

                    <button
                      onClick={() => handleCancelActivity(act.id)}
                      disabled={actionLoadingId === `cancel-${act.id}`}
                      className="px-3 py-1.5 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 text-xs font-semibold flex items-center space-x-1 self-start"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Cancel Activity</span>
                    </button>
                  </div>

                  {/* Join Requests Section */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span>Pending Join Requests ({pendingRequests.length})</span>
                      <span className="text-slate-400 font-normal">
                        Accepted ({acceptedParticipants.length}{act.max_participants ? `/${act.max_participants}` : ""})
                      </span>
                    </h5>

                    {pendingRequests.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No pending requests for this activity.</p>
                    ) : (
                      <div className="space-y-2">
                        {pendingRequests.map((req) => (
                          <div
                            key={req.participant_id}
                            className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex items-center space-x-2 flex-wrap">
                              <UserCheck className="w-4 h-4 text-orange-500 flex-shrink-0" />
                              <div className="flex items-center space-x-1.5 flex-wrap">
                                <span className="font-bold text-slate-900 dark:text-white">{req.user_email}</span>
                                {req.trust_signal && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                    {req.trust_signal.badge_label}
                                  </span>
                                )}
                                <span className="text-slate-400">requested to join</span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleRespondParticipant(act.id, req.user_id, "accept")}
                                disabled={actionLoadingId === `resp-${act.id}-${req.user_id}`}
                                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] flex items-center space-x-1"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Accept</span>
                              </button>
                              <button
                                onClick={() => handleRespondParticipant(act.id, req.user_id, "decline")}
                                disabled={actionLoadingId === `resp-${act.id}-${req.user_id}`}
                                className="px-3 py-1 rounded-lg bg-red-600/80 hover:bg-red-600 text-white font-semibold text-[11px] flex items-center space-x-1"
                              >
                                <XCircle className="w-3 h-3" />
                                <span>Decline</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Modal: Host Activity */}
      <AnimatePresence>
        {isHostModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden"
            >
              <button
                onClick={() => setIsHostModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center space-x-2 mb-4">
                <span className="p-2 rounded-xl bg-orange-500/10 text-orange-600">
                  <Users className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Host Activity Invite in {city}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Invite fellow travelers to join you for scuba diving, food tours, or sightseeing.
                  </p>
                </div>
              </div>

              {message && (
                <div
                  className={`p-3 rounded-xl mb-4 text-xs flex items-center space-x-2 ${
                    message.type === "success"
                      ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600"
                      : "bg-red-500/10 border border-red-500/20 text-red-600"
                  }`}
                >
                  {message.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  )}
                  <span>{message.text}</span>
                </div>
              )}

              <form onSubmit={handleCreateActivity} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Activity Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Going Scuba Diving at Grand Island, join me!"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Activity Type *
                    </label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 capitalize"
                    >
                      <option value="adventure">Adventure / Sports</option>
                      <option value="food">Food & Drinks Walk</option>
                      <option value="sightseeing">Sightseeing / Cultural</option>
                      <option value="other">Other Activity</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Max Participants (Optional)
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g., 4"
                      value={formMax}
                      onChange={(e) => setFormMax(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Scheduled Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Scheduled Time
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 08:30 AM"
                      value={formTime}
                      onChange={(e) => setFormTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Meeting Point / Location Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Candolim Boat Jetty / Kashi Vishwanath Gate"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Description & Plan Details
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Share plan details, cost sharing, what to bring..."
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsHostModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-md flex items-center space-x-1.5"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Publishing Invite...</span>
                      </>
                    ) : (
                      <span>Publish Activity Invite</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Report User / Activity */}
      <AnimatePresence>
        {reportTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4"
            >
              <button
                onClick={() => setReportTarget(null)}
                className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center space-x-2">
                <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                  <Flag className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Report Activity or Host
                  </h3>
                  <p className="text-xs text-slate-500 truncate max-w-[260px]">
                    Target: {reportTarget.title}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmitReport} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Reason for Report *
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="suspicious_behavior">Suspicious / Inappropriate Behavior</option>
                    <option value="scam_or_commercial">Scam, Commercial Promotion, or Spam</option>
                    <option value="unsafe_meeting">Unsafe Meeting Location / Hazard</option>
                    <option value="harassment">Harassment or Offensive Language</option>
                    <option value="other">Other Concern</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Additional Details
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe what felt unsafe or inappropriate..."
                    value={reportDesc}
                    onChange={(e) => setReportDesc(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setReportTarget(null)}
                    className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white shadow-md flex items-center space-x-1.5"
                  >
                    {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Submit Report</span>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Block User */}
      <AnimatePresence>
        {blockTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4"
            >
              <button
                onClick={() => setBlockTarget(null)}
                className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center space-x-2">
                <span className="p-2 rounded-xl bg-red-500/10 text-red-600">
                  <Ban className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Block User
                  </h3>
                  <p className="text-xs text-slate-500">
                    Block {blockTarget.userEmail || `User #${blockTarget.userId}`}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Once blocked, this user’s activities will be hidden from your city feed, and they will be unable to see your activities or send join requests.
              </p>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setBlockTarget(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmBlock}
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-500 text-white shadow-md flex items-center space-x-1.5"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Confirm Block</span>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
