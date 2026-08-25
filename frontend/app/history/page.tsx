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
  Search,
  CheckCircle2,
  ChevronRight,
  Clock,
  BriefcaseMedical,
  Calendar,
  Filter,
  ArrowRight,
  FileText,
  Phone,
  HelpCircle,
  X,
  Download,
  Share2,
  Printer,
  Sparkles,
  Shield,
  Activity,
  HeartPulse,
  AlertTriangle,
  MessageSquareQuote,
  Check,
} from "lucide-react";
import EmergencyModal from "@/components/EmergencyModal";
import LogoutModal from "@/components/LogoutModal";
import MobileNav from "@/components/MobileNav";
import Sidebar from "@/components/Sidebar";
import { useUserProfile } from "@/lib/userUtils";

export interface ConsultationHistoryItem {
  id: string;
  consultationId: string;
  title: string;
  mainConcern: string;
  duration: string;
  date: string;
  time: string;
  status: "Completed" | "Needs follow-up" | "Follow-up required" | "Archived";
  keySymptoms: string[];
  severityAssessment: string;
  recommendedCareLevel: string;
  whatToTellDoctor: string;
}

export default function HistoryPage() {
  const [isNewUser, setIsNewUser] = useState(false);
  const { profile: userProfile, initial: userInitial, displayName } = useUserProfile();
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"All" | "Recent" | "Needs follow-up">("All");
  const [selectedConsultation, setSelectedConsultation] = useState<ConsultationHistoryItem | null>(null);
  const [toastMessage, setToastMessage] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [consultationsList, setConsultationsList] = useState<ConsultationHistoryItem[]>([]);

  // Default seed consultation history data for returning users
  const defaultHistory: ConsultationHistoryItem[] = [
    {
      id: "hist-1",
      consultationId: "AL-84920-C",
      title: "CHEST DISCOMFORT & MILD DYSPNEA",
      mainConcern: "Left-sided tightness with exertion",
      duration: "3m 42s",
      date: "Today",
      time: "10:14 AM WAT",
      status: "Follow-up required",
      keySymptoms: ["Left-sided chest tightness", "Mild shortness of breath", "Fatigue"],
      severityAssessment: "High / Urgent Care",
      recommendedCareLevel: "Urgent Clinic Consultation within 24 hours.",
      whatToTellDoctor:
        "I experienced left-sided chest tightness on mild exertion earlier today, accompanied by shortness of breath for about 15 minutes.",
    },
    {
      id: "hist-2",
      consultationId: "AL-73194-R",
      title: "PERSISTENT HEADACHE & EYE STRAIN",
      mainConcern: "Throbbing frontal headache lasting 3 days",
      duration: "2m 18s",
      date: "Feb 21, 2026",
      time: "03:40 PM WAT",
      status: "Completed",
      keySymptoms: ["Frontal throbbing pain", "Photophobia", "Eye strain"],
      severityAssessment: "Routine Care",
      recommendedCareLevel: "Primary Care / Optometry Check",
      whatToTellDoctor:
        "I have had a frontal throbbing headache for 3 consecutive days that intensifies with screen usage. Paracetamol provides temporary relief.",
    },
    {
      id: "hist-3",
      consultationId: "AL-62081-N",
      title: "ACUTE FEBRILE ILLNESS & BODY CHILLS",
      mainConcern: "High body temperature and dry cough",
      duration: "4m 05s",
      date: "Jan 14, 2026",
      time: "08:15 AM WAT",
      status: "Completed",
      keySymptoms: ["High fever", "Dry cough", "Chills"],
      severityAssessment: "Mild to Moderate",
      recommendedCareLevel: "Rest & Hydration with clinic evaluation if breathing changes.",
      whatToTellDoctor:
        "I have developed an elevated body temperature and dry persistent cough over the last 48 hours accompanied by body aches and mild chills.",
    },
  ];

  useEffect(() => {
    try {
      const storedIsNew = localStorage.getItem("alaafia_is_new_user");
      const storedSaved = localStorage.getItem("alaafia_saved_consultations");
      const profile = userProfile;

      let savedItems: any[] = [];
      if (storedSaved) {
        try {
          savedItems = JSON.parse(storedSaved);
        } catch (e) {}
      }

      // Convert custom saved items into consultation history objects
      const formattedSaved: ConsultationHistoryItem[] = savedItems.map((item: any, idx: number) => ({
        id: item.id || `saved-${Date.now()}-${idx}`,
        consultationId: `AL-${Math.floor(10000 + Math.random() * 90000)}-S`,
        title: item.title?.toUpperCase() || "CONSULTATION SUMMARY",
        mainConcern: item.title || "Health Concern",
        duration: "Recent",
        date: item.date || new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
        time: item.time || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " WAT",
        status: "Completed",
        keySymptoms: item.symptoms || ["Reported symptoms", "General discomfort"],
        severityAssessment: "Routine Care",
        recommendedCareLevel: item.outcome || "Primary care clinic evaluation.",
        whatToTellDoctor:
          item.transcript ||
          "I consulted Alaafia regarding these symptoms and am seeking professional medical evaluation.",
      }));

      // Determine if empty state or filled state
      if (storedIsNew === "true" || (profile && profile.isNewUser && formattedSaved.length === 0)) {
        setIsNewUser(true);
        setConsultationsList([]);
      } else {
        setIsNewUser(false);
        const merged = [...formattedSaved, ...defaultHistory];
        setConsultationsList(merged);
      }
    } catch (e) {
      console.error("Error loading consultation history:", e);
    }
  }, []);

  // Filter & Search consultations
  const filteredConsultations = consultationsList
    .filter((item) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.mainConcern.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.keySymptoms.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.date.toLowerCase().includes(searchQuery.toLowerCase());

      if (activeFilter === "Recent") return matchesSearch;
      if (activeFilter === "Needs follow-up") return matchesSearch && (item.status === "Needs follow-up" || item.status === "Follow-up required");
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortOrder === "oldest") return Number(a.id) - Number(b.id);
      return Number(b.id) - Number(a.id);
    });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handlePrintSummary = () => {
    window.print();
  };

  const handleShareSummary = (item: ConsultationHistoryItem) => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator
        .share({
          title: `Alaafia Summary: ${item.mainConcern}`,
          text: `Summary for consultation #${item.consultationId}: ${item.whatToTellDoctor}`,
          url: window.location.href,
        })
        .catch(() => {});
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(
        `ALAAFIA CONSULTATION SUMMARY (#${item.consultationId})\nMain Concern: ${item.mainConcern}\nDate: ${item.date} • ${item.time}\nSeverity: ${item.severityAssessment}\nCare Level: ${item.recommendedCareLevel}\nWhat to tell doctor: "${item.whatToTellDoctor}"`
      );
      showToast("Consultation summary copied to clipboard!");
    }
  };

  const handleDownloadSummary = (item: ConsultationHistoryItem) => {
    const content = `ALAAFIA HEALTHCARE CONSULTATION SUMMARY
========================================
Consultation ID: #${item.consultationId}
Date: ${item.date}
Time: ${item.time}

MAIN CONCERN: ${item.mainConcern}
DURATION: ${item.duration}

KEY SYMPTOMS:
${item.keySymptoms.map((s) => `• ${s}`).join("\n")}

SEVERITY ASSESSMENT:
${item.severityAssessment}

RECOMMENDED CARE LEVEL:
${item.recommendedCareLevel}

WHAT TO TELL THE HEALTHCARE PROFESSIONAL:
"${item.whatToTellDoctor}"

----------------------------------------
* This summary is generated based on your inputs and is not a medical diagnosis. Always consult a qualified healthcare provider for medical advice.
Alaafia AI Healthcare Navigator
`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Alaafia_Summary_${item.consultationId}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("Summary report downloaded!");
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-teal-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. LEFT SIDEBAR NAVIGATION (CONSISTENT ACROSS ALL PAGES) */}
      <Sidebar activeTab="history" />

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-slate-900">
              Consultation History
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all relative">
              <Bell className="w-5 h-5" />
            </button>
            <Link
              href="/settings"
              suppressHydrationWarning
              title={`Logged in as ${displayName} — Open Settings`}
              className="w-9 h-9 rounded-full bg-[#006666] text-white font-bold flex items-center justify-center text-sm shadow-xs cursor-pointer hover:ring-2 hover:ring-teal-400 transition-all"
            >
              <span suppressHydrationWarning>{userInitial}</span>
            </Link>
          </div>
        </header>

        {/* Main Content Body */}
        <main className="p-4 sm:p-8 space-y-8 max-w-6xl mx-auto w-full flex-1 pb-24 sm:pb-8">
          {/* ========================================================================= */}
          {/* CASE A: EMPTY STATE (NEW USER / NO CONSULTATIONS RECORDED YET)            */}
          {/* ========================================================================= */}
          {consultationsList.length === 0 || isNewUser ? (
            <div className="flex flex-col items-center justify-center min-h-[500px] py-12 animate-in fade-in zoom-in-95 duration-300">
              <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-xl max-w-lg w-full text-center space-y-6 relative overflow-hidden">
                {/* 3D Orb / Emblem Illustration */}
                <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
                  <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-teal-100 via-sky-100 to-emerald-100 flex items-center justify-center shadow-inner border border-teal-200/60">
                    <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center transform rotate-6 hover:rotate-0 transition-transform">
                      <div className="relative flex items-center justify-center">
                        <HeartPulse className="w-8 h-8 text-[#006666]" />
                        <Sparkles className="w-4 h-4 text-amber-500 absolute -top-2 -right-2" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                    Your consultation history will appear here.
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                    Once you complete a consultation, you'll be able to return to your summaries whenever you need them.
                  </p>
                </div>

                <div className="pt-2">
                  <Link
                    href="/consultation"
                    className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 bg-[#006666] hover:bg-[#004d4d] active:bg-[#003333] text-white text-sm font-semibold rounded-xl shadow-md shadow-teal-900/10 hover:shadow-teal-900/20 transition-all group"
                  >
                    <span>Start your first consultation</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            /* ========================================================================= */
            /* CASE B: FILLED STATE (RETURNING USER / CONSULTATION RECORDS PRESENT)      */
            /* ========================================================================= */
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Header Title with Subtitle & Start new consultation Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Consultation history
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Review your previous consultations and access your summaries whenever you need them.
                  </p>
                </div>

                <Link
                  href="/consultation"
                  className="inline-flex items-center justify-center gap-2 bg-[#006666] hover:bg-[#004d4d] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition-all self-start sm:self-auto shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Start new consultation</span>
                </Link>
              </div>

              {/* Filter & Search Bar */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by concern or date..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006666] focus:border-transparent transition-all shadow-2xs"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {(["All", "Recent", "Needs follow-up"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveFilter(tab)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                        activeFilter === tab
                          ? "bg-[#006666] text-white shadow-xs"
                          : "bg-white hover:bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}

                  <button
                    onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1.5 shrink-0 transition-colors"
                  >
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{sortOrder === "newest" ? "Newest first" : "Oldest first"}</span>
                  </button>
                </div>
              </div>

              {/* Consultation Cards List */}
              <div className="space-y-4 pt-2">
                {filteredConsultations.length > 0 ? (
                  filteredConsultations.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-teal-300 transition-all space-y-4 group"
                    >
                      {/* Card Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-base font-extrabold text-slate-900 group-hover:text-[#006666] transition-colors tracking-tight">
                            {item.title}
                          </h3>
                          <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{item.date} • {item.time}</span>
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100">
                            <CheckCircle2 className="w-3 h-3 text-[#006666]" />
                            <span>{item.status}</span>
                          </span>
                        </div>

                        <button
                          onClick={() => setSelectedConsultation(item)}
                          className="text-xs font-bold text-[#006666] hover:text-[#004d4d] inline-flex items-center gap-1 self-start sm:self-auto hover:underline cursor-pointer"
                        >
                          <span>View summary</span>
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>

                      {/* Card Body: 2 Column Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase block">
                            SYMPTOMS
                          </span>
                          <div className="flex items-center gap-2 text-slate-700 font-medium">
                            <Clock className="w-4 h-4 text-teal-600 shrink-0" />
                            <span>{item.keySymptoms.join(" • ")}</span>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase block">
                            RECOMMENDED CARE
                          </span>
                          <div className="flex items-center gap-2 text-slate-700 font-medium">
                            <BriefcaseMedical className="w-4 h-4 text-[#006666] shrink-0" />
                            <span className="font-semibold text-slate-900">
                              {item.recommendedCareLevel}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white rounded-2xl p-8 text-center space-y-2 border border-slate-200">
                    <p className="text-sm font-semibold text-slate-700">
                      No matching consultations found for "{searchQuery}"
                    </p>
                    <button
                      onClick={() => setSearchQuery("")}
                      className="text-xs font-bold text-[#006666] hover:underline"
                    >
                      Clear search filter
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom Urgent Help Card */}
              <div className="bg-[#fee2e2]/70 border border-red-200/90 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold shrink-0 mt-0.5">
                    ✱
                  </div>
                  <div>
                    <h4 className="font-bold text-red-950 text-sm">Need urgent help?</h4>
                    <p className="text-red-800/90 leading-tight">
                      Immediate assistance for medical emergencies.
                    </p>
                  </div>
                </div>

                <Link
                  href="/emergency"
                  className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
                >
                  <span>Get emergency help</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-white text-slate-500 text-xs py-6 border-t border-slate-200 px-6 mt-auto">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <span>© 2026 Alaafia Health</span>
            <div className="flex gap-6 text-slate-600">
              <a href="#" className="hover:text-teal-600 transition-colors">Help</a>
              <Link href="/about" className="hover:text-teal-600 transition-colors">Safety</Link>
              <a href="#" className="hover:text-teal-600 transition-colors">Privacy</a>
              <a href="#" className="hover:text-teal-600 transition-colors">Terms</a>
            </div>
          </div>
        </footer>
      </div>

      {/* ========================================================================= */}
      {/* CONSULTATION SUMMARY OVERLAY MODAL (FIGMA EXACT DESIGN MATCH)             */}
      {/* ========================================================================= */}
      {selectedConsultation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-slate-200 shadow-2xl space-y-5 relative max-h-[92vh] overflow-y-auto">
            {/* Top Modal Header */}
            <div className="flex items-center justify-between pb-1">
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Consultation summary
              </h3>
              <button
                onClick={() => setSelectedConsultation(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metadata Bar (Date, Time, ID) */}
            <div className="flex items-center gap-3 text-xs text-slate-500 font-medium flex-wrap">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{selectedConsultation.date}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{selectedConsultation.time}</span>
              </div>
              <div className="font-semibold text-slate-600">
                # ID: {selectedConsultation.consultationId}
              </div>
            </div>

            {/* Main Concern & Duration 2-Col Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Box 1: MAIN CONCERN */}
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1">
                <span className="text-[9px] font-extrabold tracking-widest text-slate-400 uppercase block">
                  MAIN CONCERN
                </span>
                <p className="text-xs sm:text-sm font-bold text-slate-900">
                  {selectedConsultation.mainConcern}
                </p>
              </div>

              {/* Box 2: DURATION */}
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1">
                <span className="text-[9px] font-extrabold tracking-widest text-slate-400 uppercase block">
                  DURATION
                </span>
                <p className="text-xs sm:text-sm font-bold text-slate-900">
                  {selectedConsultation.duration}
                </p>
              </div>
            </div>

            {/* KEY SYMPTOMS BOX */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2">
              <span className="text-[9px] font-extrabold tracking-widest text-slate-400 uppercase block">
                KEY SYMPTOMS
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {selectedConsultation.keySymptoms.map((symptom, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-semibold text-slate-800 bg-[#e6f4f1] border border-teal-200/70 px-3 py-1 rounded-lg"
                  >
                    {symptom}
                  </span>
                ))}
              </div>
            </div>

            {/* SEVERITY ASSESSMENT */}
            <div className="flex items-center gap-3 p-1">
              <div className="w-8 h-8 rounded-full bg-[#006666] text-white flex items-center justify-center font-extrabold text-xs shrink-0 shadow-xs">
                ▲
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Severity Assessment
                </span>
                <p className="text-sm font-extrabold text-slate-900">
                  {selectedConsultation.severityAssessment}
                </p>
              </div>
            </div>

            {/* RECOMMENDED CARE LEVEL BOX */}
            <div className="p-3.5 rounded-2xl bg-[#e6f4f1]/70 border border-teal-200 space-y-1">
              <span className="text-[9px] font-extrabold tracking-widest text-[#006666] uppercase block">
                RECOMMENDED CARE LEVEL
              </span>
              <p className="text-xs text-slate-800 font-semibold leading-relaxed">
                {selectedConsultation.recommendedCareLevel}
              </p>
            </div>

            {/* WHAT TO TELL THE HEALTHCARE PROFESSIONAL BOX */}
            <div className="p-4 rounded-2xl bg-[#f0f9ff]/70 border border-sky-200 space-y-2">
              <div className="flex items-center gap-1.5 text-slate-800 font-extrabold text-[10px] uppercase tracking-wider">
                <FileText className="w-3.5 h-3.5 text-[#006666]" />
                <span>WHAT TO TELL THE HEALTHCARE PROFESSIONAL</span>
              </div>
              <p className="text-xs text-slate-700 italic leading-relaxed bg-white/80 p-3 rounded-xl border border-sky-100">
                "{selectedConsultation.whatToTellDoctor}"
              </p>
            </div>

            {/* Footer Disclaimer Note */}
            <p className="text-[10px] text-slate-400 leading-relaxed italic">
              * This summary is generated based on your inputs and is not a medical diagnosis. Always consult a qualified healthcare provider for medical advice.
            </p>

            {/* Bottom Modal Action Buttons (Print, Share summary, Download summary) */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handlePrintSummary}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 hover:border-slate-400 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  <span>Print</span>
                </button>

                <button
                  onClick={() => handleShareSummary(selectedConsultation)}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 hover:border-slate-400 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Share summary</span>
                </button>
              </div>

              <button
                onClick={() => handleDownloadSummary(selectedConsultation)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#006666] hover:bg-[#004d4d] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download summary</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Assistance Modal */}
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
