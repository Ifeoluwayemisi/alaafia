"use client";

import React, { useState } from "react";
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
  Sparkles,
  Lock,
  Phone,
  MessageSquareText,
  ShieldAlert,
  Volume2,
  Square,
  HelpCircle,
  X,
  CheckCircle2,
  Edit3,
  RotateCcw,
  ArrowRight,
  Check,
} from "lucide-react";

export default function ConsultationPage() {
  const [stage, setStage] = useState<1 | 2 | 3 | 4>(1); // 1: Speak, 2: Understand, 3: Guide, 4: Connect
  const [isRecording, setIsRecording] = useState(false);
  const [isTypingMode, setIsTypingMode] = useState(false);
  const [typedInput, setTypedInput] = useState("");
  const [isEditingTranscript, setIsEditingTranscript] = useState(false);
  const [userTranscript, setUserTranscript] = useState(
    "My dad suddenly started complaining about chest pain, and he's finding it difficult to breathe. It started about ten minutes ago."
  );
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

  const startRecording = () => {
    setIsRecording(true);
  };

  const stopRecordingAndProceedToUnderstand = () => {
    setIsRecording(false);
    setStage(2); // Automatically advance to Stage 2: Understand
  };

  const handleTypeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typedInput.trim()) {
      setUserTranscript(typedInput);
      setTypedInput("");
      setStage(2);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* 1. LEFT SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between p-5 hidden md:flex shrink-0 sticky top-0 h-screen">
        <div className="space-y-8">
          {/* Logo & Category */}
          <div className="space-y-1">
            <Link href="/" className="flex items-center gap-2 cursor-pointer">
              <span className="text-2xl font-bold text-[#0e7490] tracking-tight">
                Alaafia
              </span>
            </Link>
            <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase block">
              HEALTHCARE NAVIGATOR
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <Link
              href="/dashboard"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all"
            >
              <Home className="w-4 h-4 text-slate-400" />
              <span>Home</span>
            </Link>

            <Link
              href="/consultation"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold bg-teal-50 text-[#0e7490] border border-teal-100 shadow-xs transition-all"
            >
              <Mic className="w-4 h-4 text-[#0e7490]" />
              <span>Consultation</span>
            </Link>

            <Link
              href="/how-it-works"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all"
            >
              <History className="w-4 h-4 text-slate-400" />
              <span>History</span>
            </Link>

            <a
              href="#"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all"
            >
              <Bell className="w-4 h-4 text-slate-400" />
              <span>Follow-ups</span>
            </a>

            <Link
              href="/about"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all"
            >
              <Compass className="w-4 h-4 text-slate-400" />
              <span>Guidance</span>
            </Link>
          </nav>
        </div>

        {/* Sidebar Bottom Actions (Consistent with Dashboard) */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <Link
            href="/consultation"
            className="w-full flex items-center justify-center gap-2 bg-[#0d9488] hover:bg-[#0f766e] text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Consultation</span>
          </Link>

          <div className="space-y-1">
            <button className="w-full flex items-center gap-3 px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg">
              <User className="w-4 h-4 text-slate-400" />
              <span>Profile</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg">
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Settings</span>
            </button>
            <button
              onClick={() => setIsEmergencyModalOpen(true)}
              className="w-full flex items-center gap-3 px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span>Emergency help</span>
            </button>
          </div>
        </div>
      </aside>

      {/* 2. MAIN CONSULTATION CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-slate-900">Consultation</h1>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
              <HelpCircle className="w-5 h-5" />
            </button>
            <div className="w-9 h-9 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-sm shadow-xs cursor-pointer">
              R
            </div>
          </div>
        </header>

        {/* Main Content Body */}
        <main className="p-6 sm:p-8 space-y-8 max-w-6xl mx-auto w-full flex-1">
          {/* Stepper Progress Indicator */}
          <div className="flex items-center gap-4 text-xs font-bold text-slate-400 overflow-x-auto pb-2">
            <button
              onClick={() => setStage(1)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full shrink-0 shadow-xs cursor-pointer transition-all ${
                stage === 1
                  ? "bg-teal-600 text-white"
                  : "bg-teal-100 text-teal-800 hover:bg-teal-200"
              }`}
            >
              {stage > 1 ? <Check className="w-3.5 h-3.5" /> : <span>01</span>}
              <span>Speak</span>
            </button>
            <span className="text-slate-300">—</span>

            <button
              onClick={() => stage >= 2 && setStage(2)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full shrink-0 shadow-xs transition-all ${
                stage === 2
                  ? "bg-teal-600 text-white"
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
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full shrink-0 shadow-xs transition-all ${
                stage === 3
                  ? "bg-teal-600 text-white"
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
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full shrink-0 shadow-xs transition-all ${
                stage === 4
                  ? "bg-teal-600 text-white"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}
            >
              <span>04</span>
              <span>Connect</span>
            </button>
          </div>

          {/* Dynamic Headline & Subtitle per Stage */}
          <div className="space-y-1">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              {stage === 1 && "Let's talk about what's going on."}
              {stage === 2 && "Here's what I heard."}
              {stage === 3 && "Guidance & Urgency Assessment."}
              {stage === 4 && "Care Routing & Digital Handoff."}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              {stage === 1 && "Tell Alaafia what's happening in your own words. You don't need to know the medical terms."}
              {stage === 2 && "Review your words before we continue. You can edit anything that isn't quite right."}
              {stage === 3 && "Based on your described symptoms, here is the structured clinical safety assessment."}
              {stage === 4 && "Matched emergency facilities near you and instant digital triage summary."}
            </p>
          </div>

          {/* Grid Layout: Left Main Consultation Box vs Right Column Guidance & Emergency */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT MAIN STORY CARD (7 Cols) */}
            <div className="lg:col-span-7">
              {/* STAGE 1: SPEAK STAGE */}
              {stage === 1 && (
                <>
                  {!isRecording ? (
                    /* IDLE STATE: START WITH YOUR STORY */
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-8 relative overflow-hidden">
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

                      {/* Center Microphone Recording Action */}
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

                        {/* Typing input form if enabled */}
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

                      {/* Helper Feature Badges */}
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
                    /* ACTIVE LISTENING STATE (MATCHING FIGMA SCREENSHOT) */
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl space-y-8 relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                      {/* Top Header */}
                      <div className="space-y-1 text-center">
                        <span className="text-[11px] font-bold tracking-widest text-teal-600 uppercase block">
                          SPEAKING
                        </span>
                        <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                          I'm listening...
                        </h3>
                        <p className="text-slate-500 text-xs sm:text-sm">
                          Tell me what's happening in your own words.
                        </p>
                      </div>

                      {/* Mic & Waveform Visualizer */}
                      <div className="flex flex-col items-center justify-center space-y-3 py-2">
                        <div className="relative flex items-center justify-center">
                          <div className="w-24 h-24 rounded-full bg-teal-500/20 animate-ping absolute" />
                          <div className="w-20 h-20 rounded-full bg-[#0d9488] text-white flex items-center justify-center shadow-lg shadow-teal-600/30 relative z-10">
                            <Mic className="w-10 h-10" />
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                          <span className="text-xs font-semibold text-teal-700">Listening</span>
                        </div>

                        {/* Animated Waveform Bars */}
                        <div className="flex items-center justify-center gap-1.5 h-6">
                          <span className="w-1 h-3 bg-teal-500 rounded-full animate-wave-1" />
                          <span className="w-1 h-6 bg-teal-500 rounded-full animate-wave-2" />
                          <span className="w-1 h-4 bg-teal-500 rounded-full animate-wave-3" />
                          <span className="w-1 h-5 bg-teal-500 rounded-full animate-wave-4" />
                          <span className="w-1 h-2 bg-teal-500 rounded-full animate-wave-1" />
                        </div>
                      </div>

                      {/* Live Speech Transcribed Card */}
                      <div className="p-5 rounded-2xl bg-[#e6f4f1]/80 border border-teal-200/80 shadow-xs space-y-2">
                        <p className="text-xs sm:text-sm text-teal-950 font-medium leading-relaxed">
                          "{userTranscript}"
                          <span className="inline-block w-1.5 h-4 bg-teal-600 ml-1 animate-pulse" />
                        </p>
                      </div>

                      {/* Actions Row */}
                      <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                        <button
                          onClick={stopRecordingAndProceedToUnderstand}
                          className="bg-[#0d9488] hover:bg-[#0f766e] text-white font-semibold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
                        >
                          Stop speaking
                        </button>
                        <button
                          onClick={() => alert("Recording paused")}
                          className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors px-3 py-2"
                        >
                          Pause
                        </button>
                        <span className="text-slate-300">•</span>
                        <button
                          onClick={() => {
                            setIsRecording(false);
                            setIsTypingMode(true);
                          }}
                          className="text-xs font-semibold text-teal-700 hover:text-teal-900 hover:underline transition-colors px-3 py-2"
                        >
                          Type instead
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* STAGE 2: UNDERSTAND STAGE ("Here's what I heard." - MATCHING FIGMA SCREENSHOT) */}
              {stage === 2 && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl space-y-8 relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest text-teal-700 uppercase">
                      <User className="w-3.5 h-3.5" />
                      YOUR WORDS
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900">
                      Tell us if we got anything wrong.
                    </h3>
                  </div>

                  {/* Transcribed Text Review Box */}
                  <div className="p-6 rounded-2xl bg-[#e6f4f1]/80 border border-teal-200/80 shadow-xs space-y-3">
                    {!isEditingTranscript ? (
                      <p className="text-sm text-teal-950 font-medium leading-relaxed italic">
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

                  {/* Stage 2 Action Buttons */}
                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <button
                      onClick={() => setStage(3)}
                      className="inline-flex items-center gap-2 bg-[#0d9488] hover:bg-[#0f766e] text-white font-semibold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
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

              {/* STAGE 3: GUIDE STAGE (SUMMARY & RECOMMENDATION) */}
              {stage === 3 && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl space-y-6 animate-in fade-in duration-300">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold uppercase">
                    <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                    STAGE 03. GUIDE
                  </div>

                  <h3 className="text-2xl font-bold text-slate-900">
                    Clinical Urgency Assessment
                  </h3>

                  <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200/80 space-y-2">
                    <span className="text-xs font-bold text-amber-800 uppercase tracking-widest block">
                      TRIAGE SEVERITY: HIGH / URGENT
                    </span>
                    <p className="text-sm text-amber-950 font-medium leading-relaxed">
                      Symptoms describe acute onset chest pain with associated breathing difficulty. Immediate medical evaluation at an equipped clinic or hospital ER is recommended.
                    </p>
                  </div>

                  <div className="flex gap-4 pt-2">
                    <button
                      onClick={() => setStage(4)}
                      className="inline-flex items-center gap-2 bg-[#0d9488] hover:bg-[#0f766e] text-white font-semibold text-xs px-6 py-2.5 rounded-xl shadow-xs cursor-pointer"
                    >
                      <span>Proceed to Facility Connect</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STAGE 4: CONNECT STAGE (FACILITIES & DIGITAL HANDOFF) */}
              {stage === 4 && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl space-y-6 animate-in fade-in duration-300">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    STAGE 04. CONNECT
                  </div>

                  <h3 className="text-2xl font-bold text-slate-900">
                    Nearby Equipped Facilities
                  </h3>

                  <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3">
                    <div className="flex items-center justify-between text-xs text-teal-400 font-bold uppercase">
                      <span>St. Nicholas Emergency Center</span>
                      <span>1.8 km away</span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Active ICU, Cardiac Trauma Care & Oxygen Ready. Direct digital handoff available.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN (5 Cols): Dynamic Guidance & Emergency Alert */}
            <div className="lg:col-span-5 space-y-6">
              {/* STAGE 1 RIGHT COLUMN */}
              {stage === 1 && (
                <>
                  {!isRecording ? (
                    <>
                      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
                        <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                          BEFORE YOU START
                        </h3>
                        <div className="space-y-3 text-xs sm:text-sm text-slate-700">
                          <div className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                              1
                            </div>
                            <span>Tell us what's bothering you in plain language.</span>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                              2
                            </div>
                            <span>Answer a few follow-up questions from Alaafia.</span>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                              3
                            </div>
                            <span>Understand your next best step for care.</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
                        <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                          WHAT HAPPENS NEXT?
                        </h3>
                        <div className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                          <p className="font-semibold text-slate-800">Alaafia will:</p>
                          <div className="flex items-center gap-2.5">
                            <Mic className="w-4 h-4 text-teal-600" />
                            <span>Listen carefully</span>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <MessageSquareText className="w-4 h-4 text-teal-600" />
                            <span>Ask follow-ups</span>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <ShieldAlert className="w-4 h-4 text-teal-600" />
                            <span>Assess urgency</span>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <Compass className="w-4 h-4 text-teal-600" />
                            <span>Help understand next steps</span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    /* ACTIVE LISTENING STATE RIGHT CARDS */
                    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4 animate-in fade-in duration-300">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                        <span>💡 While you speak</span>
                      </div>
                      <div className="space-y-3 text-xs sm:text-sm text-slate-600">
                        <div className="flex items-start gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                          <span>Speak naturally, as if talking to a doctor.</span>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                          <span>Pause whenever you need to think.</span>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                          <span>It's okay to correct yourself mid-sentence.</span>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                          <span>Tap 'Stop speaking' when you're ready to proceed.</span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* STAGE 2 RIGHT COLUMN (MATCHING FIGMA SCREENSHOT EXACTLY) */}
              {stage === 2 && (
                <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4 animate-in fade-in duration-300">
                  <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                    BEFORE WE CONTINUE
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
              )}

              {/* YOU'RE IN CONTROL CARD */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <Lock className="w-4 h-4 text-teal-600" />
                  <span>You're in control.</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Your data is secure and private.
                </p>
              </div>

              {/* EMERGENCY RED ALERT CARD (SHIFTED DIRECTLY UP UNDER YOU'RE IN CONTROL AS REQUESTED) */}
              <div className="bg-[#fee2e2]/80 rounded-2xl p-6 border border-red-200/80 shadow-xs space-y-4">
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
                  className="w-full flex items-center justify-center gap-2 bg-[#b91c1c] hover:bg-[#991b1b] text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Get emergency help
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* FOOTER FOR CONSISTENCY */}
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
      {isEmergencyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-red-100 shadow-2xl space-y-6 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setIsEmergencyModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold">
              <Phone className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900">
                Medical Emergency Assistance
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                If you are experiencing life-threatening symptoms (chest pain, unconsciousness, severe bleeding), call national emergency services immediately.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-center space-y-1">
              <span className="text-xs font-semibold text-red-600 uppercase tracking-widest block">
                NATIONAL EMERGENCY TOLL-FREE
              </span>
              <a
                href="tel:112"
                className="text-3xl font-extrabold text-red-700 block tracking-tight hover:underline"
              >
                112
              </a>
            </div>

            <button
              onClick={() => setIsEmergencyModalOpen(false)}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
