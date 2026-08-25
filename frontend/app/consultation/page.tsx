"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
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
  Sparkles,
  Lock,
  Phone,
  MessageSquareText,
  ShieldAlert,
  Volume2,
  HelpCircle,
  X,
  CheckCircle2,
  Edit3,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Check,
  Info,
  MapPin,
  Navigation,
  FileText,
  Download,
  Share2,
  Bookmark,
  ListOrdered,
  BriefcaseMedical,
  Shield,
  Flag,
  Share,
} from "lucide-react";
import EmergencyModal from "@/components/EmergencyModal";
import LogoutModal from "@/components/LogoutModal";
import VoiceListeningBox from "@/components/VoiceListeningBox";
import MobileNav from "@/components/MobileNav";
import Sidebar from "@/components/Sidebar";
import { useUserProfile } from "@/lib/userUtils";

// Dynamic import for Leaflet map component (No SSR)
const RealMap = dynamic(() => import("@/components/RealMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[540px] rounded-3xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center gap-2 text-slate-500 font-medium text-xs">
      <div className="w-8 h-8 rounded-full border-2 border-teal-600 border-t-transparent animate-spin" />
      <span>Detecting live location & loading OpenStreetMap...</span>
    </div>
  ),
});

export default function ConsultationPage() {
  const { profile: userProfile, initial: userInitial, displayName } = useUserProfile();

  // Stage 1: Speak, Stage 2: Understand, Stage 3: Guide, Stage 4: Connect (Map), Stage 5: Full Found Summary
  const [stage, setStage] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [understandStep, setUnderstandStep] = useState<"review" | "questions">("review"); // Sub-steps in Stage 2
  const [isRecording, setIsRecording] = useState(false);
  const [isTypingMode, setIsTypingMode] = useState(false);
  const [typedInput, setTypedInput] = useState("");
  const [isEditingTranscript, setIsEditingTranscript] = useState(false);
  const [userTranscript, setUserTranscript] = useState(
    "Persistent headache and feeling tired. Started 3 days ago and becomes worse in the evening."
  );
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");

  // Live Location & Live Hospitals State
  const [liveLocationName, setLiveLocationName] = useState("Lagos, Nigeria");
  const [isLocating, setIsLocating] = useState(true);
  const [liveHospitals, setLiveHospitals] = useState<any[]>([]);
  const [selectedHospitalDirections, setSelectedHospitalDirections] = useState<any | null>(null);

  const handleLocationUpdated = (data: {
    locationName: string;
    hospitals: any[];
    isLocating: boolean;
  }) => {
    setLiveLocationName(data.locationName);
    setLiveHospitals(data.hospitals);
    setIsLocating(data.isLocating);
  };

  // Stage 2 Follow-Up Questions State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [customTextInputs, setCustomTextInputs] = useState<Record<number, string>>({});
  const [isVoiceAnswering, setIsVoiceAnswering] = useState(false);

  const followUpQuestions = [
    {
      id: 1,
      question: "When did your symptoms start?",
      subtext: "An approximate timeline helps evaluate progression.",
      options: [
        "Within the last few hours",
        "Earlier today",
        "3 days ago",
        "More than a week ago",
        "Something else...",
      ],
    },
    {
      id: 2,
      question: "How would you describe the headache?",
      subtext: "Select the option that feels most accurate.",
      options: [
        "Persistent dull pressure across temples",
        "Throbbing or pulsating on one side",
        "Sharp shooting pain",
        "Tension around neck and forehead",
        "Something else...",
      ],
    },
    {
      id: 3,
      question: "When are the symptoms most intense?",
      subtext: "Pattern recognition helps determine the cause.",
      options: [
        "Becomes worse in the evening",
        "First thing in the morning",
        "Constant throughout the day",
        "Triggered by screen time or stress",
        "Something else...",
      ],
    },
    {
      id: 4,
      question: "Are you experiencing any other accompanying sensations?",
      subtext: "Select any signs present right now.",
      options: [
        "Feeling tired and low on energy",
        "Mild eye strain or light sensitivity",
        "Mild nausea or loss of appetite",
        "No other symptoms",
        "Something else...",
      ],
    },
  ];

  const currentQ = followUpQuestions[currentQuestionIndex];
  const isCurrentAnswerSelected = Boolean(
    selectedAnswers[currentQuestionIndex] &&
      selectedAnswers[currentQuestionIndex].trim() !== ""
  );

  const startRecording = () => {
    setIsRecording(true);
  };

  const stopRecordingAndProceedToUnderstand = () => {
    setIsRecording(false);
    setStage(2);
    setUnderstandStep("review");
    setCurrentQuestionIndex(0);
  };

  const handleTypeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typedInput.trim()) {
      setUserTranscript(typedInput);
      setTypedInput("");
      setStage(2);
      setUnderstandStep("review");
      setCurrentQuestionIndex(0);
    }
  };

  const handleOptionSelect = (option: string) => {
    if (option === "Something else...") {
      const currentTyped = customTextInputs[currentQuestionIndex] || "";
      setSelectedAnswers((prev) => ({
        ...prev,
        [currentQuestionIndex]: currentTyped || "Something else...",
      }));
    } else {
      setSelectedAnswers((prev) => ({
        ...prev,
        [currentQuestionIndex]: option,
      }));
    }
  };

  const handleNextQuestion = () => {
    if (!isCurrentAnswerSelected) return;
    if (currentQuestionIndex < followUpQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setStage(3);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    } else {
      setUnderstandStep("review");
    }
  };

  const handleVoiceAnswer = () => {
    setIsVoiceAnswering(true);
    setTimeout(() => {
      setIsVoiceAnswering(false);
      if (!selectedAnswers[currentQuestionIndex]) {
        setSelectedAnswers((prev) => ({
          ...prev,
          [currentQuestionIndex]: currentQ.options[0],
        }));
      }
    }, 2000);
  };

  const handleSaveConsultation = () => {
    const newConsultation = {
      id: Date.now(),
      title: "Persistent headache & fatigue",
      time: "Just now",
      outcome: "Routine care • Primary care",
      outcomeColor: "bg-teal-50 text-teal-700 border-teal-200",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      transcript: userTranscript,
    };

    try {
      const existing = JSON.parse(localStorage.getItem("alaafia_saved_consultations") || "[]");
      const updated = [newConsultation, ...existing.filter((item: any) => item.id !== newConsultation.id)];
      localStorage.setItem("alaafia_saved_consultations", JSON.stringify(updated));
      setSaveSuccessMsg("Consultation summary saved!");
      setTimeout(() => setSaveSuccessMsg(""), 4000);
    } catch (e) {
      console.error("Error saving consultation:", e);
    }
  };

  const handleDownloadSummary = () => {
    const summaryText = `ALAAFIA HEALTHCARE CONSULTATION SUMMARY
========================================
Date: ${new Date().toLocaleDateString()}
Status: Complete (Routine Care)

WHAT YOU TOLD US:
- Persistent headache
- Feeling tired
- Symptoms started 3 days ago
- Symptoms become worse in the evening

WHAT THIS MAY SUGGEST:
Your symptoms may be consistent with several possible causes. Based on what you've shared, further evaluation may be helpful. Tension headaches or mild dehydration are common explanations, but only a healthcare professional can provide an accurate diagnosis.

RECOMMENDED URGENCY: Routine care (No immediate danger indicated)
RECOMMENDED CARE: Primary care clinic / General practitioner
NEARBY CLINIC: City Clinic, Ikeja (2.4km)

WHAT TO DO NEXT:
1. Monitor symptoms
2. Follow self-care guidance (hydration & rest)
3. Speak with a professional
4. Seek urgent care if warning signs appear

Disclaimer: Alaafia provides guidance based on user-reported information and does not replace professional medical diagnosis.`;

    const blob = new Blob([summaryText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Alaafia_Consultation_Summary_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setSaveSuccessMsg("Summary downloaded!");
    setTimeout(() => setSaveSuccessMsg(""), 3000);
  };

  const handleShareSummary = () => {
    if (navigator.share) {
      navigator.share({
        title: "Alaafia Consultation Summary",
        text: "Here is what we found from my Alaafia health consultation.",
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setSaveSuccessMsg("Consultation link copied to clipboard!");
      setTimeout(() => setSaveSuccessMsg(""), 3000);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* 1. LEFT SIDEBAR NAVIGATION (CONSISTENT ACROSS ALL PAGES) */}
      <Sidebar activeTab="consultation" />

      {/* 2. MAIN CONSULTATION CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-slate-900">Consultation</h1>
            {saveSuccessMsg && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full animate-in fade-in">
                ✓ {saveSuccessMsg}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
              <HelpCircle className="w-5 h-5" />
            </button>
            <Link
              href="/settings"
              suppressHydrationWarning
              title={`Logged in as ${displayName} — Open Settings`}
              className="w-9 h-9 rounded-full bg-[#006666] text-white font-bold flex items-center justify-center text-sm shadow-xs hover:ring-2 hover:ring-teal-400 transition-all cursor-pointer"
            >
              <span suppressHydrationWarning>{userInitial}</span>
            </Link>
          </div>
        </header>

        {/* Main Content Body */}
        <main className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto w-full flex-1 pb-24 sm:pb-8">
          {/* Stepper Progress Indicator */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 text-xs font-bold text-slate-400 overflow-x-auto pb-2">
            <button
              onClick={() => setStage(1)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full shrink-0 shadow-2xs cursor-pointer transition-all ${
                stage === 1
                  ? "bg-[#006666] text-white"
                  : "bg-teal-100 text-teal-800 hover:bg-teal-200"
              }`}
            >
              {stage > 1 ? <Check className="w-3.5 h-3.5" /> : <span>01</span>}
              <span>Speak</span>
            </button>
            <span className="text-slate-300">—</span>

            <button
              onClick={() => stage >= 2 && setStage(2)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full shrink-0 shadow-2xs transition-all ${
                stage === 2
                  ? "bg-[#006666] text-white"
                  : stage > 2
                  ? "bg-teal-100 text-teal-800 cursor-pointer"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}
            >
              {stage > 2 ? <Check className="w-3.5 h-3.5" /> : <span>02</span>}
              <span>Understand</span>
            </button>
            <span className="text-slate-300">—</span>

            <button
              onClick={() => stage >= 3 && setStage(3)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full shrink-0 shadow-2xs transition-all ${
                stage === 3
                  ? "bg-[#006666] text-white"
                  : stage > 3
                  ? "bg-teal-100 text-teal-800 cursor-pointer"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}
            >
              {stage > 3 ? <Check className="w-3.5 h-3.5" /> : <span>03</span>}
              <span>Guide</span>
            </button>
            <span className="text-slate-300">—</span>

            <button
              onClick={() => stage >= 4 && setStage(4)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full shrink-0 shadow-2xs transition-all ${
                stage === 4
                  ? "bg-[#006666] text-white"
                  : stage > 4
                  ? "bg-teal-100 text-teal-800 cursor-pointer"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}
            >
              {stage > 4 ? <Check className="w-3.5 h-3.5" /> : <span>04</span>}
              <span>Connect</span>
            </button>
            <span className="text-slate-300">—</span>

            <button
              onClick={() => stage >= 4 && setStage(5)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full shrink-0 shadow-2xs transition-all ${
                stage === 5
                  ? "bg-[#006666] text-white font-bold"
                  : "bg-slate-100 text-slate-400 hover:text-slate-600"
              }`}
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Complete</span>
            </button>
          </div>

          {/* ========================================================================= */}
          {/* STAGE 5: FULL FOUND CONSULTATION SUMMARY (Figma Screenshots Exact Match) */}
          {/* ========================================================================= */}
          {stage === 5 ? (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* Top Centered Header with Checkmark & Action Pills */}
              <div className="text-center space-y-3 pt-2">
                <div className="w-14 h-14 rounded-full bg-[#e6f4f1] border-2 border-teal-300 text-[#006666] flex items-center justify-center mx-auto shadow-sm">
                  <Check className="w-8 h-8 text-[#006666] stroke-[3]" />
                </div>
                <div className="space-y-1.5">
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                    Here's what we found
                  </h2>
                  <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
                    We've reviewed what you shared and organized the most important information to help you decide what to do next.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={handleDownloadSummary}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-slate-300 hover:border-slate-400 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-2xs cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={handleShareSummary}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-slate-300 hover:border-slate-400 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-2xs cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Share</span>
                  </button>
                </div>
              </div>

              {/* Two Column Layout Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* LEFT COLUMN: 7 Cols */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Card 1: Your consultation summary */}
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
                    <div className="flex items-center gap-2.5 text-slate-900">
                      <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                        <FileText className="w-4.5 h-4.5" />
                      </div>
                      <h3 className="text-lg font-bold">Your consultation summary</h3>
                    </div>

                    {/* Section 1: What you told us */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#006666]" />
                        <span>What you told us</span>
                      </h4>
                      <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/60 space-y-2.5 text-xs text-slate-700 font-medium">
                        <div className="flex items-center gap-2.5">
                          <span className="w-3.5 h-3.5 rounded-full border-2 border-teal-600 shrink-0" />
                          <span>Persistent headache</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <span className="w-3.5 h-3.5 rounded-full border-2 border-teal-600 shrink-0" />
                          <span>Feeling tired</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <span className="w-3.5 h-3.5 rounded-full border-2 border-teal-600 shrink-0" />
                          <span>Symptoms started 3 days ago</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <span className="w-3.5 h-3.5 rounded-full border-2 border-teal-600 shrink-0" />
                          <span>Symptoms become worse in the evening</span>
                        </div>
                      </div>
                    </div>

                    {/* Section 2: What this may suggest */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#006666]" />
                        <span>What this may suggest</span>
                      </h4>
                      <div className="p-4 bg-[#f0f9ff]/70 border border-sky-200/80 rounded-2xl text-xs text-slate-700 leading-relaxed">
                        Your symptoms may be consistent with several possible causes. Based on what you've shared, further evaluation may be helpful. <strong>Tension headaches or mild dehydration</strong> are common explanations, but only a healthcare professional can provide an accurate diagnosis.
                      </div>
                    </div>
                  </div>

                  {/* Card 2: What to do next */}
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-5">
                    <div className="flex items-center gap-2.5 text-slate-900">
                      <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                        <ListOrdered className="w-4.5 h-4.5" />
                      </div>
                      <h3 className="text-lg font-bold">What to do next</h3>
                    </div>

                    <div className="space-y-3">
                      {/* Step 1 */}
                      <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-teal-50/30 transition-all flex items-start gap-3.5">
                        <div className="w-7 h-7 rounded-full border-2 border-[#006666] text-[#006666] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          01
                        </div>
                        <div className="space-y-0.5">
                          <h5 className="text-xs font-bold text-slate-900">Monitor symptoms</h5>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            Keep track of when the headaches occur and if they change in intensity.
                          </p>
                        </div>
                      </div>

                      {/* Step 2 */}
                      <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-teal-50/30 transition-all flex items-start gap-3.5">
                        <div className="w-7 h-7 rounded-full border-2 border-[#006666] text-[#006666] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          02
                        </div>
                        <div className="space-y-0.5">
                          <h5 className="text-xs font-bold text-slate-900">Follow self-care guidance</h5>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            Ensure you are well-hydrated and getting adequate rest.
                          </p>
                        </div>
                      </div>

                      {/* Step 3 */}
                      <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-teal-50/30 transition-all flex items-start gap-3.5">
                        <div className="w-7 h-7 rounded-full border-2 border-[#006666] text-[#006666] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          03
                        </div>
                        <div className="space-y-0.5">
                          <h5 className="text-xs font-bold text-slate-900">Speak with a professional</h5>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            If symptoms persist for more than a few days, schedule a consultation.
                          </p>
                        </div>
                      </div>

                      {/* Step 4: Seek urgent care (red border) */}
                      <div className="p-4 rounded-2xl border border-red-200/80 bg-red-50/40 hover:bg-red-50/60 transition-all flex items-start gap-3.5">
                        <div className="w-7 h-7 rounded-full border-2 border-red-500 text-red-600 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          04
                        </div>
                        <div className="space-y-0.5">
                          <h5 className="text-xs font-bold text-red-700">Seek urgent care</h5>
                          <p className="text-xs text-red-600/90 leading-relaxed">
                            If warning signs appear (e.g., sudden severe pain, vision changes, confusion).
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: 5 Cols */}
                <div className="lg:col-span-5 space-y-6">
                  {/* Card 1: RECOMMENDED URGENCY */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-2.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center border border-cyan-100">
                        <Info className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
                          RECOMMENDED URGENCY
                        </span>
                        <h4 className="text-base font-bold text-slate-900">Routine care</h4>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      There is no immediate danger indicated by your symptoms. You can seek care at your convenience.
                    </p>
                  </div>

                  {/* Card 2: RECOMMENDED CARE */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-2.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center border border-cyan-100">
                        <BriefcaseMedical className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
                          RECOMMENDED CARE
                        </span>
                        <h4 className="text-base font-bold text-slate-900">Primary care</h4>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      A general practitioner or primary care clinic is best suited for evaluating these symptoms.
                    </p>
                  </div>

                  {/* Card 3: Nearby care */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900">Nearby care</h4>
                      <button
                        onClick={() => setStage(4)}
                        className="text-xs font-semibold text-[#006666] hover:underline cursor-pointer"
                      >
                        View map
                      </button>
                    </div>

                    {/* Mini Map Graphic */}
                    <div className="relative h-28 w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                      <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-sky-50 to-emerald-50 flex items-center justify-center">
                        <div className="flex items-center gap-2 bg-white/95 px-3 py-1.5 rounded-full shadow-xs border border-teal-100 text-xs font-bold text-slate-800">
                          <span className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-ping" />
                          <MapPin className="w-3.5 h-3.5 text-[#006666]" />
                          <span>City Clinic, Ikeja</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <h5 className="text-sm font-bold text-slate-900">City Clinic</h5>
                        <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
                          2.4km
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        General Practice • Open Now
                      </p>
                    </div>

                    <button
                      onClick={() => setStage(4)}
                      className="w-full py-2.5 rounded-xl border border-slate-300 hover:border-teal-500 hover:bg-teal-50/50 text-slate-700 font-semibold text-xs transition-all cursor-pointer text-center"
                    >
                      Find nearby care
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3 pt-2">
                    <button
                      onClick={handleSaveConsultation}
                      className="w-full py-3.5 bg-[#006666] hover:bg-[#004d4d] text-white font-bold text-xs rounded-xl shadow-md shadow-teal-900/10 hover:shadow-teal-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Bookmark className="w-4 h-4" />
                      <span>Save consultation</span>
                    </button>

                    <button
                      onClick={() => {
                        setStage(1);
                        setUnderstandStep("review");
                        setCurrentQuestionIndex(0);
                      }}
                      className="w-full py-3 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all cursor-pointer text-center"
                    >
                      Start a new consultation
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Full-Width Disclaimer */}
              <div className="bg-[#f0fdfa] border border-teal-200/90 rounded-2xl p-4 flex items-start gap-3 text-xs text-slate-700">
                <Shield className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  <strong>Disclaimer:</strong> Alaafia provides guidance based on the information you shared. It does not replace a professional medical diagnosis. If you feel worse or experience severe symptoms, seek emergency medical help immediately.
                </span>
              </div>
            </div>
          ) : (
            /* STAGES 1 - 4 */
            <>
              {/* Dynamic Headline & Subtitle per Stage */}
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                  {stage === 1 && "Let's talk about what's going on."}
                  {stage === 2 && understandStep === "review" && "Here's what I heard."}
                  {stage === 2 && understandStep === "questions" && "Let's understand this a little better"}
                  {stage === 3 && "Here's what you can do next."}
                  {stage === 4 && "Find the right care near you."}
                </h2>

                {stage !== 4 ? (
                  <p className="text-slate-600 text-sm sm:text-base">
                    {stage === 1 && "Tell Alaafia what's happening in your own words. You don't need to know the medical terms."}
                    {stage === 2 && understandStep === "review" && "Review your words before we continue. You can edit anything that isn't quite right."}
                    {stage === 2 && understandStep === "questions" && "A few quick questions will help us understand what's happening and what you may need next."}
                    {stage === 3 && "Based on what you've shared, we've identified the next step that may be most appropriate."}
                  </p>
                ) : (
                  <div className="flex items-center gap-2 text-xs font-semibold text-teal-800 bg-teal-50/90 border border-teal-200/90 px-3.5 py-1.5 rounded-full w-fit">
                    <MapPin className="w-4 h-4 text-teal-600" />
                    <span>Using your live location: <strong className="text-slate-900">{liveLocationName}</strong></span>
                    {isLocating ? (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full animate-pulse">
                        Locating...
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                        <span>Live GPS Active</span>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Grid Layout: Broadened Map Column (8 Cols in Stage 4) vs Compact Sidebar */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* LEFT MAIN MAP / STORY CARD */}
                <div className={stage === 4 ? "lg:col-span-8 space-y-6" : "lg:col-span-7 space-y-6"}>
                  {/* STAGE 1: SPEAK STAGE */}
                  {stage === 1 && (
                    <>
                      {!isRecording ? (
                        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-8 relative overflow-hidden">
                          <div className="space-y-2 text-center sm:text-left">
                            <span className="text-xs font-bold tracking-widest text-teal-600 uppercase block">
                              START WITH YOUR STORY
                            </span>
                            <h3 className="text-2xl font-bold text-slate-900">
                              Tell Alaafia what you're experiencing.
                            </h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                              Speak naturally and explain what is happening. You can take your time.
                            </p>
                          </div>

                          <div className="flex flex-col items-center justify-center py-6 space-y-4">
                            <div className="relative">
                              <button
                                onClick={startRecording}
                                className="w-28 h-28 rounded-full bg-teal-100 text-teal-700 hover:bg-teal-200/80 flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-teal-600/20 cursor-pointer"
                              >
                                <Mic className="w-12 h-12 text-[#0d9488]" />
                              </button>
                            </div>

                            <p className="text-xs font-medium text-slate-600 text-center max-w-xs">
                              Ready when you are. Tap the microphone and start speaking.
                            </p>

                            <button
                              onClick={() => setIsTypingMode(!isTypingMode)}
                              className="px-4 py-1.5 rounded-full border border-teal-600 text-teal-700 hover:bg-teal-50 text-xs font-semibold transition-all cursor-pointer"
                            >
                              {isTypingMode ? "Use voice instead" : "Type instead"}
                            </button>

                            {isTypingMode && (
                              <form onSubmit={handleTypeSubmit} className="w-full space-y-2 pt-2">
                                <textarea
                                  rows={3}
                                  value={typedInput}
                                  onChange={(e) => setTypedInput(e.target.value)}
                                  placeholder="Type your symptoms here..."
                                  className="w-full p-3 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                                />
                                <button
                                  type="submit"
                                  className="w-full py-2 bg-teal-600 text-white rounded-xl font-medium text-xs hover:bg-teal-700 cursor-pointer"
                                >
                                  Submit symptoms
                                </button>
                              </form>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 border-t border-slate-100 text-xs font-medium text-slate-500">
                            <div className="flex items-center gap-1.5">
                              <Volume2 className="w-4 h-4 text-teal-600" />
                              <span>Speak naturally</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-teal-600" />
                              <span>No medical terms required</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Lock className="w-4 h-4 text-teal-600" />
                              <span>You can stop anytime</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl space-y-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                          <div className="space-y-1 text-center">
                            <span className="text-[11px] font-bold tracking-widest text-teal-600 uppercase block">
                              SPEAKING
                            </span>
                            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                              I'm listening...
                            </h3>
                            <p className="text-slate-500 text-xs sm:text-sm">
                              Tell me what's happening in your own words.
                            </p>
                          </div>

                          {/* Voice Listening Box with all 4 states (Active, Silent, Error, Processing) */}
                          <VoiceListeningBox
                            initialState="active"
                            defaultText={userTranscript}
                            onTranscriptChange={(txt) => setUserTranscript(txt)}
                          />

                          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                            <button
                              onClick={() => setIsRecording(false)}
                              className="border border-slate-300 hover:border-slate-400 bg-white text-slate-700 font-semibold text-xs px-5 py-2.5 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={stopRecordingAndProceedToUnderstand}
                              className="bg-[#006666] hover:bg-[#004d4d] text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2"
                            >
                              <span>Done & Continue</span>
                              <span>→</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* STAGE 2: UNDERSTAND STAGE (2A: REVIEW) */}
                  {stage === 2 && understandStep === "review" && (
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl space-y-8 relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                      <div className="space-y-2">
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest text-teal-700 uppercase">
                          <User className="w-3.5 h-3.5" />
                          <span>YOUR WORDS</span>
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                          Tell us if we got anything wrong.
                        </h3>
                      </div>

                      <div className="p-6 rounded-2xl bg-[#e6f4f1]/80 border border-teal-200/80 shadow-2xs space-y-3">
                        {!isEditingTranscript ? (
                          <p className="text-sm sm:text-base text-teal-950 font-medium leading-relaxed italic">
                            "{userTranscript}"
                            <span className="inline-block w-1.5 h-4 bg-teal-600 ml-1 animate-pulse" />
                          </p>
                        ) : (
                          <div className="space-y-3">
                            <textarea
                              rows={4}
                              value={userTranscript}
                              onChange={(e) => setUserTranscript(e.target.value)}
                              className="w-full p-3 text-sm rounded-xl border border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
                            />
                            <button
                              onClick={() => setIsEditingTranscript(false)}
                              className="px-4 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-700 cursor-pointer"
                            >
                              Save changes
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 pt-2">
                        <button
                          onClick={() => {
                            setUnderstandStep("questions");
                            setCurrentQuestionIndex(0);
                          }}
                          className="inline-flex items-center gap-2 bg-[#0d9488] hover:bg-[#0f766e] text-white font-semibold text-xs px-6 py-2.5 rounded-xl shadow-2xs transition-all cursor-pointer"
                        >
                          <span>Continue</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setIsEditingTranscript(!isEditingTranscript)}
                          className="inline-flex items-center gap-2 border border-slate-300 hover:border-slate-400 bg-white text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                          <span>{isEditingTranscript ? "Done editing" : "Edit transcript"}</span>
                        </button>

                        <button
                          onClick={() => {
                            setStage(1);
                            setIsRecording(true);
                          }}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors px-3 py-2 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                          <span>Re-record</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STAGE 2: UNDERSTAND STAGE (2B: QUESTIONS) */}
                  {stage === 2 && understandStep === "questions" && (
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl space-y-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                      <div className="space-y-2">
                        <span className="text-xs font-extrabold tracking-widest text-slate-400 uppercase block">
                          QUESTION {currentQuestionIndex + 1} OF {followUpQuestions.length}
                        </span>
                        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                          {currentQ.question}
                        </h3>
                        <p className="text-slate-500 text-xs sm:text-sm font-medium">
                          {currentQ.subtext}
                        </p>
                      </div>

                      <div className="space-y-3 pt-1">
                        {currentQ.options.map((option, idx) => {
                          const isSomethingElse = option === "Something else...";
                          const currentAns = selectedAnswers[currentQuestionIndex];
                          const isSelected = isSomethingElse
                            ? currentAns === "Something else..." ||
                              (customTextInputs[currentQuestionIndex] !== undefined &&
                                currentAns === customTextInputs[currentQuestionIndex])
                            : currentAns === option;

                          return (
                            <div key={idx} className="space-y-2">
                              <div
                                onClick={() => handleOptionSelect(option)}
                                className={`flex items-center gap-3.5 p-4 rounded-2xl cursor-pointer border transition-all ${
                                  isSelected
                                    ? "border-2 border-[#0d9488] bg-[#f0fdfa] text-slate-900 shadow-2xs"
                                    : "border-slate-200 hover:border-teal-300 bg-white text-slate-700 hover:bg-slate-50/80"
                                }`}
                              >
                                <div
                                  className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                                    isSelected
                                      ? "border-[#0d9488] bg-[#0d9488]"
                                      : "border-slate-300"
                                  }`}
                                >
                                  {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
                                </div>
                                <span className="text-sm font-medium leading-snug flex-1">
                                  {option}
                                </span>
                              </div>

                              {isSomethingElse && isSelected && (
                                <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/90 space-y-2 animate-in fade-in zoom-in-95 duration-200">
                                  <label className="text-xs font-bold text-teal-900 block">
                                    Type your response in your own words:
                                  </label>
                                  <textarea
                                    rows={3}
                                    value={customTextInputs[currentQuestionIndex] || ""}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setCustomTextInputs((prev) => ({
                                        ...prev,
                                        [currentQuestionIndex]: val,
                                      }));
                                      setSelectedAnswers((prev) => ({
                                        ...prev,
                                        [currentQuestionIndex]: val || "Something else...",
                                      }));
                                    }}
                                    placeholder="Type details here..."
                                    className="w-full p-3 text-xs sm:text-sm rounded-xl border border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white text-slate-900 font-medium"
                                    autoFocus
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="space-y-3 pt-6 border-t border-slate-100">
                        <div className="flex items-center justify-between gap-3">
                          <button
                            onClick={handlePrevQuestion}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors py-2 px-1 cursor-pointer"
                          >
                            <ArrowLeft className="w-4 h-4 text-slate-400" />
                            <span>Back</span>
                          </button>

                          <div className="flex items-center gap-3">
                            <button
                              onClick={handleVoiceAnswer}
                              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-xl border transition-all cursor-pointer ${
                                isVoiceAnswering
                                  ? "bg-teal-100 text-teal-800 border-teal-300 animate-pulse"
                                  : "border-slate-200 hover:border-teal-300 text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              <Mic className="w-4 h-4 text-teal-600" />
                              <span>{isVoiceAnswering ? "Listening..." : "Answer by voice"}</span>
                            </button>

                            <button
                              onClick={handleNextQuestion}
                              disabled={!isCurrentAnswerSelected}
                              className={`inline-flex items-center justify-center text-xs font-bold px-7 py-2.5 rounded-xl transition-all ${
                                isCurrentAnswerSelected
                                  ? "bg-[#0d9488] hover:bg-[#0f766e] text-white shadow-2xs cursor-pointer"
                                  : "bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed opacity-60"
                              }`}
                            >
                              <span>Continue</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STAGE 3: GUIDE STAGE */}
                  {stage === 3 && (
                    <>
                      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-300">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-800 text-xs font-extrabold uppercase tracking-wider">
                          <span>• ROUTINE CARE</span>
                        </div>

                        <div className="space-y-2">
                          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                            Routine primary care consultation suggested.
                          </h3>
                          <p className="text-slate-600 text-sm leading-relaxed">
                            Based on what you've shared, your symptoms suggest mild tension headache or fatigue that can be safely evaluated by a general practitioner.
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 pt-2">
                          <button
                            onClick={() => setStage(4)}
                            className="inline-flex items-center gap-2 bg-[#0d9488] hover:bg-[#0f766e] text-white font-semibold text-xs px-6 py-2.5 rounded-xl shadow-2xs transition-all cursor-pointer"
                          >
                            <span>Find nearby clinics</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setStage(5)}
                            className="inline-flex items-center gap-2 border border-slate-300 hover:border-slate-400 bg-white text-slate-700 font-semibold text-xs px-5 py-2.5 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
                          >
                            <span>View full summary</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {/* STAGE 4: CONNECT STAGE (MAP SCREEN) */}
                  {stage === 4 && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <RealMap
                        onLocationUpdated={handleLocationUpdated}
                        selectedHospitalDirections={selectedHospitalDirections}
                      />
                    </div>
                  )}
                </div>

                {/* RIGHT COLUMN FOR STAGES 1 - 4 */}
                <div className={stage === 4 ? "lg:col-span-4 space-y-5" : "lg:col-span-5 space-y-6"}>
                  {/* STAGE 4 RIGHT SIDEBAR */}
                  {stage === 4 && (
                    <>
                      {/* Card 1: Your consultation summary card on Map */}
                      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3">
                        <div className="flex items-center gap-2 text-[#005c6e] font-bold text-xs">
                          <FileText className="w-4 h-4 text-[#005c6e]" />
                          <span>Your consultation</span>
                        </div>

                        <div className="space-y-2.5 pt-2 border-t border-slate-100 text-[11px]">
                          <div className="flex justify-between items-start gap-2">
                            <span className="text-slate-500 font-medium shrink-0">Main Concern</span>
                            <span className="font-semibold text-slate-900 text-right leading-tight">
                              Persistent headache, Fatigue
                            </span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-slate-500 font-medium">Started</span>
                            <span className="font-semibold text-slate-900">3 days ago</span>
                          </div>

                          <div className="flex justify-between items-start gap-2">
                            <span className="text-slate-500 font-medium shrink-0">Guidance</span>
                            <span className="font-bold text-[#006666] text-right flex items-center gap-1 justify-end leading-tight">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#006666] shrink-0" />
                              <span>Routine Care Recommended</span>
                            </span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-slate-500 font-medium">Urgency</span>
                            <span className="font-semibold text-slate-900">At your convenience</span>
                          </div>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-slate-100">
                          <button
                            onClick={() => setStage(5)}
                            className="w-full bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold text-xs py-2.5 rounded-xl shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>View full consultation</span>
                          </button>
                          <button
                            onClick={handleSaveConsultation}
                            className="w-full border border-slate-300 hover:border-slate-400 bg-white text-slate-700 font-semibold text-xs py-2 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
                          >
                            Save consultation
                          </button>
                        </div>
                      </div>

                      {/* Card 2: Nearby healthcare facilities */}
                      <div className="space-y-2.5">
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
                          <span>Nearby healthcare facilities</span>
                          {liveHospitals.length > 0 && (
                            <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                              {liveHospitals.length} found
                            </span>
                          )}
                        </h4>

                        <div className="space-y-2.5">
                          {liveHospitals.length > 0 ? (
                            liveHospitals.map((h, idx) => (
                              <div
                                key={h.id || idx}
                                className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-2.5 transition-all hover:border-teal-300"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <h5 className="text-xs font-bold text-slate-900">{h.name}</h5>
                                    <p className="text-[11px] text-slate-500">{h.address}</p>
                                  </div>
                                  <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100 shrink-0">
                                    📍 {h.distance}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-semibold">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  <span>{h.status}</span>
                                </div>

                                <div className="flex items-center gap-2 pt-1">
                                  <button
                                    onClick={() => setStage(5)}
                                    className="flex-1 border border-slate-300 hover:border-slate-400 text-slate-700 font-semibold text-xs py-1.5 rounded-lg hover:bg-slate-50 transition-all cursor-pointer"
                                  >
                                    View summary
                                  </button>
                                  <button
                                    onClick={() => setSelectedHospitalDirections(h)}
                                    className="flex-1 bg-[#0d9488] hover:bg-[#0f766e] text-white text-center font-bold text-xs py-1.5 rounded-lg shadow-2xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                                  >
                                    <Navigation className="w-3 h-3" />
                                    <span>Directions</span>
                                  </button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-4 bg-white rounded-2xl border border-slate-200 text-xs text-slate-500 text-center animate-pulse">
                              Searching live medical facilities near your GPS position...
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* DEFAULT RIGHT COLUMN FOR STAGES 1 - 3 */}
                  {stage !== 4 && (
                    <>
                      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
                        <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                          BEFORE YOU CONTINUE
                        </h3>
                        <div className="space-y-3 text-xs sm:text-sm text-slate-700">
                          <div className="flex items-start gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                            <span>Understand what you're experiencing</span>
                          </div>
                          <div className="flex items-start gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                            <span>Check urgency</span>
                          </div>
                          <div className="flex items-start gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                            <span>Help understand next steps</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-[#fee2e2]/80 rounded-2xl p-6 border border-red-200/80 shadow-2xs space-y-4">
                        <div className="flex items-start gap-2.5">
                          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <h4 className="text-sm font-bold text-red-950">
                              Think this may be an emergency?
                            </h4>
                            <p className="text-xs text-red-800/90 leading-relaxed">
                              Get urgent help immediately →
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => setIsEmergencyModalOpen(true)}
                          className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-xs transition-all cursor-pointer"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Emergency SOS</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </main>

        {/* FOOTER */}
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

      {/* EMERGENCY MODAL POPUP */}
      <EmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
      />

      {/* LOGOUT MODAL */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
      />

      {/* MOBILE NAVIGATION */}
      <MobileNav />
    </div>
  );
}
