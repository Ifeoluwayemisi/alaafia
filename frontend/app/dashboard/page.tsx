"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Home,
  Mic,
  History,
  Bell,
  Compass,
  Plus,
  User,
  Settings,
  AlertCircle,
  ChevronRight,
  Sparkles,
  Info,
  CalendarCheck,
  Phone,
  FileText,
  Clock,
  BriefcaseMedical,
  CheckCircle2,
  X,
  Activity,
  ShieldCheck,
  Wallet,
  ArrowUpRight,
} from "lucide-react";

import EmergencyModal from "@/components/EmergencyModal";
import LogoutModal from "@/components/LogoutModal";
import MobileNav from "@/components/MobileNav";
import Sidebar from "@/components/Sidebar";
import { useAuthRedirect } from "@/lib/useAuthRedirect";

export default function DashboardPage() {
  useAuthRedirect();
  // Automatically detected state: New User vs Returning/Existing User
  const [isNewUser, setIsNewUser] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState<any | null>(null);
  const [savedConsultations, setSavedConsultations] = useState<any[]>([]);

  // Notifications state
  const [notifications, setNotifications] = useState([
    {
      id: "n-1",
      title: "Clinical summary ready",
      desc: "Your recent consultation summary has been prepared for doctor handoff.",
      time: "10m ago",
      unread: true,
    },
    {
      id: "n-2",
      title: "Care Support balance active",
      desc: "Emergency health wallet connected with ₦30,000 available.",
      time: "2h ago",
      unread: true,
    },
    {
      id: "n-3",
      title: "Safety rules verification",
      desc: "All active triage protocols updated to 2026 clinical standards.",
      time: "Yesterday",
      unread: false,
    },
  ]);

  useEffect(() => {
    try {
      // 1. Check query string ?newUser=true
      const urlParams = new URLSearchParams(window.location.search);
      const isNewQuery = urlParams.get("newUser");
      const storedIsNew = localStorage.getItem("alaafia_is_new_user");
      const storedUser = localStorage.getItem("alaafia_user");
      const storedConsultations = JSON.parse(localStorage.getItem("alaafia_saved_consultations") || "[]");

      if (Array.isArray(storedConsultations) && storedConsultations.length > 0) {
        setSavedConsultations(storedConsultations);
      }

      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUserProfile(parsed);

        // Automatic detection
        if (isNewQuery === "true" || storedIsNew === "true" || parsed.isNewUser === true) {
          setIsNewUser(true);
        } else {
          setIsNewUser(false);
        }
      } else {
        if (isNewQuery === "true" || storedIsNew === "true") {
          setIsNewUser(true);
        } else {
          setIsNewUser(false);
        }
      }
    } catch (e) {
      console.error("Error reading dashboard state:", e);
    }
  }, []);

  // Time-of-day greeting (e.g. Good morning / afternoon / evening)
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Dynamic user display name & avatar initial
  const displayName = userProfile?.firstName
    ? userProfile.firstName.charAt(0).toUpperCase() + userProfile.firstName.slice(1)
    : userProfile?.email
    ? userProfile.email.split("@")[0].charAt(0).toUpperCase() + userProfile.email.split("@")[0].slice(1)
    : "Ruqayah";

  const userInitial = userProfile?.firstName
    ? userProfile.firstName.charAt(0).toUpperCase()
    : userProfile?.email
    ? userProfile.email.charAt(0).toUpperCase()
    : "R";

  // Default user consultation history data (for existing user view)
  const defaultConsultations = [
    {
      id: "def-1",
      title: "Chest discomfort & pain",
      time: "Today",
      outcome: "Clinic assessment recommended",
      outcomeColor: "bg-teal-50 text-teal-700 border-teal-200",
      icon: BriefcaseMedical,
      symptoms: ["Left-sided chest tightness", "Mild shortness of breath"],
      urgency: "High / Urgent Care",
      whatToSay: "Patient experienced left-sided chest tightness starting earlier today with mild exertion.",
    },
    {
      id: "def-2",
      title: "Persistent throbbing headache",
      time: "Oct 12",
      outcome: "Self-care & rest recommended",
      outcomeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: Activity,
      symptoms: ["Bilateral temple pressure", "Eye strain fatigue"],
      urgency: "Routine / Primary Clinic",
      whatToSay: "Bilateral temple headache persisting for 3 days, worsens in the evening with screen exposure.",
    },
    {
      id: "def-3",
      title: "Stomach discomfort & nausea",
      time: "Sep 28",
      outcome: "Pharmacy visit / Hydration",
      outcomeColor: "bg-sky-50 text-sky-700 border-sky-200",
      icon: FileText,
      symptoms: ["Lower abdominal dull ache", "Nausea after meals"],
      urgency: "Non-Urgent Clinic",
      whatToSay: "Dull ache in lower abdomen since yesterday with intermittent nausea.",
    },
  ];

  // Combine newly saved consultations from localStorage with defaults
  const allConsultations = [
    ...savedConsultations.map((item, idx) => ({
      id: item.id || `saved-${idx}`,
      title: item.title || "Consultation Summary",
      time: item.time || "Just now",
      outcome: item.outcome || "Medical assessment recommended",
      outcomeColor: "bg-teal-50 text-teal-700 border-teal-200",
      icon: BriefcaseMedical,
      symptoms: item.symptoms || ["Reported symptoms processed"],
      urgency: item.severity || "Standard Triage",
      whatToSay: item.whatToTellDoctor || "Summary notes generated by Alaafia AI.",
    })),
    ...defaultConsultations,
  ];

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* 1. LEFT SIDEBAR NAVIGATION (CONSISTENT ACROSS ALL PAGES) */}
      <Sidebar activeTab="home" />

      {/* 2. MAIN DASHBOARD CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900">Patient Dashboard</h1>
          </div>

          <div className="flex items-center gap-4 relative">
            {/* Notification Bell */}
            <button
              type="button"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-2 rounded-full text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all relative cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {notifications.some((n) => n.unread) && (
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600 absolute top-2 right-2 ring-2 ring-white animate-pulse" />
              )}
            </button>

            {/* Notification Dropdown Popover */}
            {isNotificationsOpen && (
              <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 animate-scale-in">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-teal-600" />
                    <span className="text-sm font-bold text-slate-800">Notifications</span>
                  </div>
                  <button
                    type="button"
                    onClick={markAllNotificationsRead}
                    className="text-xs text-teal-600 hover:underline font-semibold"
                  >
                    Mark all read
                  </button>
                </div>
                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto mt-2">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`py-3 px-2 rounded-xl transition-colors ${
                        notif.unread ? "bg-teal-50/50 font-medium" : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900">{notif.title}</span>
                        <span className="text-[10px] text-slate-400">{notif.time}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{notif.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-slate-100 text-center">
                  <button
                    type="button"
                    onClick={() => setIsNotificationsOpen(false)}
                    className="text-xs font-bold text-slate-500 hover:text-slate-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {/* User Avatar linking to Settings */}
            <Link
              href="/settings"
              title={`Logged in as ${displayName} — Open Settings`}
              className="w-9 h-9 rounded-full bg-[#006666] text-white font-bold flex items-center justify-center text-sm shadow-xs hover:ring-2 hover:ring-teal-400 transition-all cursor-pointer"
            >
              {userInitial}
            </Link>
          </div>
        </header>

        {/* Main Dashboard Grid */}
        <main className="p-6 sm:p-8 space-y-8 max-w-6xl mx-auto w-full animate-fade-in">
          {/* Greeting Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {getGreeting()}, {displayName}.
              </h2>
              <p className="text-slate-500 text-sm">
                How can Alaafia guide your health today?
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/care-support"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-teal-200 text-teal-800 text-xs font-bold shadow-2xs hover:bg-teal-50 transition-all"
              >
                <Wallet className="w-3.5 h-3.5 text-teal-600" />
                <span>Care Fund: ₦30,000</span>
              </Link>
              <Link
                href="/consultation"
                className="inline-flex items-center gap-2 bg-[#00796b] hover:bg-[#005c6e] active:scale-95 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>New Intake</span>
              </Link>
            </div>
          </div>

          {/* Grid Layout: Left Column (Hero & Consultations) vs Right Column (Guidance, Follow-ups, Emergency) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Top Left Hero Card */}
              <div className="bg-linear-to-br from-teal-500 to-[#005c6e] text-white rounded-3xl p-6 sm:p-8 shadow-lg space-y-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                <div className="space-y-2 relative z-10">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" /> Voice Triage Ready
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    Not sure what to do next?
                  </h3>
                  <p className="text-teal-50 text-sm leading-relaxed max-w-md">
                    Speak your symptoms in your own words or local dialect. Alaafia translates and guides you to safe care.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2 relative z-10">
                  <Link
                    href="/consultation"
                    className="inline-flex items-center gap-2.5 bg-white text-[#005c6e] hover:bg-teal-50 active:scale-95 font-bold text-sm px-6 py-3 rounded-full shadow-md transition-all cursor-pointer"
                  >
                    <Mic className="w-4.5 h-4.5 text-[#006666]" />
                    <span>Start Speaking</span>
                  </Link>

                  <Link
                    href="/emergency"
                    className="inline-flex items-center gap-1.5 bg-red-600/90 hover:bg-red-600 text-white font-bold text-xs px-4 py-3 rounded-full transition-all"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Emergency SOS</span>
                  </Link>
                </div>
              </div>

              {/* Bottom Left Recent Consultations Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">
                    Recent Health Consultations
                  </h3>
                  <Link
                    href="/history"
                    className="text-xs font-bold text-teal-600 hover:text-teal-700 hover:underline inline-flex items-center gap-1"
                  >
                    <span>View all</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>

                {!isNewUser ? (
                  /* EXISTING USER VIEW (WITH HISTORY & SAVED CONSULTATIONS) */
                  <div className="space-y-3">
                    {allConsultations.slice(0, 4).map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setSelectedConsultation(item)}
                        className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/80 hover:bg-teal-50/40 border border-slate-200/60 transition-all cursor-pointer group hover:-translate-y-0.5 hover:shadow-xs"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                            <item.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                              {item.title}
                            </h4>
                            <span className="text-xs text-slate-500">
                              {item.time} • <span className="font-semibold text-teal-700">{item.outcome}</span>
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="hidden sm:inline-block text-[11px] font-bold text-teal-700 bg-white px-2.5 py-1 rounded-full border border-teal-200">
                            Details
                          </span>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* NEW USER VIEW (EMPTY STATE) */
                  <div className="py-12 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center border border-slate-200">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-800">
                        No consultations yet
                      </h4>
                      <p className="text-xs text-slate-500">
                        Start your first voice consultation to see your intake records here.
                      </p>
                    </div>
                    <Link
                      href="/consultation"
                      className="inline-flex items-center gap-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded-xl transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" /> Start First Consultation
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Top Right: LATEST GUIDANCE */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4 relative">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                    ACTIVE TRIAGE SUMMARY
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                    <ShieldCheck className="w-3 h-3" /> Verified Safe
                  </span>
                </div>

                {!isNewUser ? (
                  <div className="space-y-4 pt-1">
                    <div className="space-y-1">
                      <span className="text-xs text-slate-400 font-medium">
                        Latest Assessment
                      </span>
                      <h4 className="text-lg font-extrabold text-slate-900">
                        {allConsultations[0]?.title || "Chest discomfort & pain"}
                      </h4>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-50 text-teal-700 text-xs font-bold border border-teal-200/60">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                      {allConsultations[0]?.outcome || "Clinic assessment recommended"}
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setSelectedConsultation(allConsultations[0])}
                        className="w-full py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span>View doctor handoff note</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-300 mx-auto flex items-center justify-center border border-slate-150">
                      <FileText className="w-5 h-5" />
                    </div>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                      Your latest triage guidance and doctor handoff notes will appear here.
                    </p>
                  </div>
                )}
              </div>

              {/* Middle Right: CARE SUPPORT & FOLLOW-UPS */}
              <div className="bg-[#e0f7f6]/60 rounded-3xl p-6 border border-teal-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-[#006666]" />
                    <h4 className="text-xs font-bold tracking-wider text-[#005c6e] uppercase">
                      Emergency Care Support
                    </h4>
                  </div>
                  <span className="text-xs font-extrabold text-teal-800">Active</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Avoid treatment delays with pre-authorized emergency funding and trusted contact alerts.
                </p>
                <Link
                  href="/care-support"
                  className="inline-flex items-center justify-center w-full py-2 bg-white text-teal-800 text-xs font-bold rounded-xl border border-teal-200 hover:bg-teal-50 transition-colors"
                >
                  Manage Care Safety Net →
                </Link>
              </div>

              {/* Bottom Right: EMERGENCY ALERT CARD */}
              <div className="bg-[#fee2e2]/70 rounded-3xl p-6 border border-red-200/80 shadow-xs space-y-4">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-red-950">
                      Think this may be an emergency?
                    </h4>
                    <p className="text-xs text-red-800/90 leading-relaxed">
                      Do not wait for standard appointments. Access instant emergency dispatch protocols.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEmergencyModalOpen(true)}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-bold py-2.5 px-3 rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Quick Emergency (112)</span>
                  </button>
                  <Link
                    href="/emergency"
                    className="px-3 py-2.5 bg-white border border-red-200 text-red-700 hover:bg-red-50 text-xs font-bold rounded-xl transition-colors"
                  >
                    SOS Hub
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* FOOTER */}
        <footer className="bg-white text-slate-500 text-xs py-6 border-t border-slate-200 px-6 mt-auto">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <span>© 2026 Alaafia Healthcare Navigator. Built for patient safety.</span>
            <div className="flex gap-6 text-slate-600 font-medium">
              <Link href="/about" className="hover:text-teal-600 transition-colors">About</Link>
              <Link href="/safety" className="hover:text-teal-600 transition-colors">Safety Rules</Link>
              <Link href="/services" className="hover:text-teal-600 transition-colors">Services</Link>
              <Link href="/care-support" className="hover:text-teal-600 transition-colors">Care Fund</Link>
            </div>
          </div>
        </footer>
      </div>

      {/* Interactive Consultation Details Modal */}
      {selectedConsultation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5 animate-scale-in">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[#006666] flex items-center justify-center">
                  <BriefcaseMedical className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {selectedConsultation.title}
                  </h3>
                  <span className="text-xs text-slate-400">
                    Recorded {selectedConsultation.time}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedConsultation(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
                aria-label="Close details modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-100 space-y-1">
                <span className="font-bold text-teal-900 block">Triage Outcome</span>
                <p className="text-teal-800 font-medium">{selectedConsultation.outcome}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="font-bold text-slate-800 block">What to tell the doctor</span>
                <p className="text-slate-600 leading-relaxed italic">
                  "{selectedConsultation.whatToSay || selectedConsultation.whatToTellDoctor || "Reported symptoms evaluated by Alaafia triage."}"
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <Link
                href="/consultation"
                className="flex-1 py-2.5 px-4 bg-[#006666] hover:bg-[#005c6e] text-white text-xs font-bold rounded-xl text-center transition-all shadow-xs"
              >
                Start Follow-up Consultation
              </Link>
              <button
                type="button"
                onClick={() => setSelectedConsultation(null)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Modal */}
      <EmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
      />

      {/* Logout Modal */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
      />

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
}

