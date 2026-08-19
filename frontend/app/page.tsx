"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Mic,
  ArrowRight,
  Phone,
  Sparkles,
  ShieldCheck,
  UserCheck,
  MessageSquare,
  Compass,
  MapPin,
  Lock,
  AlertTriangle,
  User,
  CheckCircle2,
  BriefcaseMedical,
} from "lucide-react";

export default function Home() {
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* 1. HEADER / NAVBAR */}
      <header className="sticky top-0 z-40 bg-[#f0f9ff]/90 backdrop-blur-md border-b border-sky-100 px-4 sm:px-8 py-3.5 transition-all">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <span className="text-2xl font-bold text-[#0e7490] tracking-tight">
              Alaafia
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <Link
              href="/how-it-works"
              className="hover:text-[#0e7490] transition-colors"
            >
              How it works
            </Link>
            <Link href="/about" className="hover:text-[#0e7490] transition-colors">
              About
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center bg-[#0d9488] hover:bg-[#0f766e] text-white text-sm font-medium px-5 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* 2. HERO SECTION */}
        <section className="relative px-4 sm:px-8 pt-12 pb-20 overflow-hidden bg-dot-pattern">
          {/* Animated Background Decorative Blur & Floating Dots */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-teal-200/40 rounded-full blur-3xl -z-10" />

          {/* Floating particle dots */}
          <div className="absolute top-12 left-10 w-4 h-4 rounded-full bg-teal-400/40 blur-xs animate-particle-1 -z-10" />
          <div className="absolute top-1/3 right-16 w-6 h-6 rounded-full bg-teal-500/30 blur-xs animate-particle-2 -z-10" />
          <div className="absolute bottom-16 left-1/3 w-5 h-5 rounded-full bg-emerald-400/35 blur-xs animate-particle-3 -z-10" />
          <div className="absolute top-20 right-1/3 w-3 h-3 rounded-full bg-teal-600/40 animate-particle-1 -z-10" />

          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/60 text-teal-700 text-xs font-semibold tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                Healthcare Navigation
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.15]">
                Not sure what's wrong? <br className="hidden sm:inline" />
                <span className="text-teal-600">Start with a conversation.</span>
              </h1>

              <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0">
                You don't need to know medical terms to get the right help. Just
                tell us what's happening in your own words, and Alaafia will
                guide you to your next safe step.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <a
                  href="#consultation"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-medium px-7 py-3.5 rounded-full shadow-lg shadow-teal-600/25 hover:shadow-teal-600/35 transition-all text-base"
                >
                  <Mic className="w-5 h-5" />
                  Start speaking
                </a>
                <Link
                  href="/how-it-works"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-slate-700 hover:text-teal-600 font-medium px-5 py-3 rounded-full hover:bg-slate-100/80 transition-all text-base"
                >
                  See how it works
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>


              <p className="text-xs text-slate-500 font-medium">
                No medical terms required. Just tell us what's happening.
              </p>
            </div>

            {/* Right Card Preview - Floating levitation animation */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl p-6 shadow-2xl hover:shadow-teal-500/15 border border-slate-200/90 relative overflow-hidden animate-float hover:[animation-play-state:paused] transition-all duration-300 transform hover:-translate-y-2 cursor-pointer">
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-bl-full pointer-events-none" />

                {/* Card Top */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center">
                      <Mic className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-semibold text-slate-800">
                      Alaafia is listening...
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1 h-3 bg-teal-500 rounded-full animate-wave-1" />
                    <span className="w-1 h-5 bg-teal-500 rounded-full animate-wave-2" />
                    <span className="w-1 h-4 bg-teal-500 rounded-full animate-wave-3" />
                    <span className="w-1 h-2 bg-teal-500 rounded-full animate-wave-4" />
                  </div>
                </div>

                {/* Transcribed text box */}
                <div className="my-6 p-4 rounded-xl bg-slate-50 border border-slate-200/70 text-slate-800 text-sm leading-relaxed italic font-medium">
                  "My dad suddenly has chest pain and he's finding it difficult to breathe."
                </div>

                {/* Bottom Status Tag */}
                <div className="flex items-center gap-2 pt-2 text-xs font-medium text-teal-700 bg-teal-50/80 px-3 py-2 rounded-lg border border-teal-100">
                  <Sparkles className="w-4 h-4 text-teal-600 animate-spin" />
                  Analyzing symptoms and urgency level...
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. EMERGENCY RED ALERT BANNER */}
        <section className="bg-[#fee2e2] border-y border-red-200/60 px-4 sm:px-8 py-3.5">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-center sm:text-left">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-[#991b1b] text-white flex items-center justify-center shrink-0 shadow-xs">
                <BriefcaseMedical className="w-4 h-4" />
              </div>
              <span className="text-sm sm:text-base font-semibold text-[#881337]">
                If it's a life-threatening emergency, don't wait.
              </span>
            </div>
            <button
              onClick={() => setIsEmergencyModalOpen(true)}
              className="inline-flex items-center gap-2 bg-[#b91c1c] hover:bg-[#991b1b] text-white text-sm font-semibold px-5 py-2 rounded-full shadow-sm hover:shadow transition-all shrink-0 cursor-pointer"
            >
              <Phone className="w-4 h-4" />
              Get emergency help now
            </button>
          </div>
        </section>


        {/* 4. PROCESS FLOW: From uncertainty to your next step. */}
        <section id="how-it-works" className="px-4 sm:px-8 py-20 bg-slate-100/60">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">
                HOW ALAAFIA WORKS
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                From uncertainty to your next step.
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Four simple steps from speaking your symptoms to getting guided care.
              </p>
            </div>

            {/* 4 Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Step 1 */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 hover:shadow-md transition-all space-y-4">
                <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-lg">
                  <Mic className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
                    01. Speak
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">
                    Describe it
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Tell us what you're feeling in your own words or native language.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 hover:shadow-md transition-all space-y-4">
                <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-lg">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
                    02. Understand
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">
                    AI Translation
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Our AI structures your input into clinical-grade symptom profiles.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 hover:shadow-md transition-all space-y-4">
                <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-lg">
                  <Compass className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
                    03. Guide
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">
                    Clear Options
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Receive immediate, human-readable advice on what to do next.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 hover:shadow-md transition-all space-y-4">
                <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-lg">
                  <MapPin className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
                    04. Connect
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">
                    Find Care
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    We connect you to the nearest appropriate facility or specialist.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. SIDE BY SIDE COMPARISON: Healthcare guidance should feel human. */}
        <section id="services" className="px-4 sm:px-8 py-20 bg-white">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Healthcare guidance should feel human.
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                We bridge the gap between how you experience symptoms and how the
                medical system categorizes them.
              </p>
            </div>

            {/* Comparison Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left: WHAT YOU SAY */}
              <div className="bg-teal-50/50 rounded-2xl p-6 sm:p-8 border border-teal-100 space-y-6">
                <div className="flex items-center gap-2 text-xs font-bold text-teal-700 uppercase tracking-wider">
                  <User className="w-4 h-4" />
                  What You Say
                </div>

                <div className="bg-white rounded-xl p-5 border border-slate-200/70 shadow-xs text-slate-700 text-sm sm:text-base leading-relaxed italic">
                  "I've had this dull ache in my lower stomach since yesterday afternoon. It's not terrible, but it feels weird when I bend over, and I feel a bit nauseous."
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <span className="w-2 h-2 rounded-full bg-teal-500" />
                  Natural language • No medical jargon required
                </div>
              </div>

              {/* Right: WHAT ALAAFIA UNDERSTANDS - Floating Levitation Animation */}
              <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-800 relative animate-float-slow hover:[animation-play-state:paused] transition-all duration-300 transform hover:-translate-y-2 cursor-pointer">
                <div className="flex items-center gap-2 text-xs font-bold text-teal-400 uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  What Alaafia Understands
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs sm:text-sm space-y-1">
                    <span className="text-slate-400 text-xs font-medium block">
                      Primary Symptom Identified
                    </span>
                    <span className="font-semibold text-teal-300">
                      Lower Abdominal Pain (Onset: ~24hrs)
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs sm:text-sm space-y-1">
                    <span className="text-slate-400 text-xs font-medium block">
                      Associated Symptoms
                    </span>
                    <span className="font-semibold text-slate-200">
                      Mild Nausea, Pain on exertion
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs sm:text-sm space-y-1">
                    <span className="text-slate-400 text-xs font-medium block">
                      Recommended Action
                    </span>
                    <span className="font-semibold text-emerald-400">
                      Non-urgent clinic visit today or tomorrow.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. SAFETY GRID: Built to guide, not diagnose. */}
        <section id="safety" className="px-4 sm:px-8 py-20 bg-slate-100/60">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Built to guide, not diagnose.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  AI Understands
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Our models are trained on clinical guidelines to accurately
                  interpret your natural speech.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Rules Protect
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Strict safety parameters ensure conservative guidance, always
                  defaulting to higher caution.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
                  <UserCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  People Decide
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  We provide the map, you and your registered healthcare
                  provider make the final decisions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 7. BOTTOM CTA CARD */}
        <section id="consultation" className="px-4 sm:px-8 py-20 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-teal-500/10 via-teal-500/5 to-emerald-500/10 border border-teal-200/80 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-xl relative overflow-hidden">
              <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white flex items-center justify-center mx-auto shadow-md shadow-teal-600/30">
                <Mic className="w-7 h-7" />
              </div>

              <div className="space-y-3 max-w-xl mx-auto">
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
                  Not sure what to do next? <br />
                  Start with a conversation.
                </h2>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  Experience the calm precision of AI-guided healthcare
                  navigation. Your health is worth clarity.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => alert("Starting voice consultation mode...")}
                  className="inline-flex items-center gap-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-8 py-4 rounded-full shadow-lg shadow-teal-600/30 hover:shadow-teal-600/40 transition-all text-base"
                >
                  Start speaking now
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-medium pt-2">
                <Lock className="w-3.5 h-3.5 text-teal-600" />
                Your conversation is secure and private.
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 8. FOOTER */}
      <footer id="about" className="bg-slate-100 border-t border-slate-200 px-4 sm:px-8 py-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          {/* Left Info */}
          <div className="space-y-3 max-w-md">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <div className="w-6 h-6 rounded-md bg-teal-600 flex items-center justify-center text-white text-xs font-bold">
                ❖
              </div>
              <span className="text-lg font-bold text-slate-900">Alaafia</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              © 2026 Alaafia Health. All rights reserved. Providing AI-driven
              healthcare navigation for Nigeria.
            </p>
          </div>

          {/* Right Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-600">
            <a href="#privacy" className="hover:text-teal-600 transition-colors">
              Privacy Policy
            </a>
            <a href="#terms" className="hover:text-teal-600 transition-colors">
              Terms of Service
            </a>
            <a href="#disclaimer" className="hover:text-teal-600 transition-colors">
              Medical Disclaimer
            </a>
            <a href="#support" className="hover:text-teal-600 transition-colors">
              Contact Support
            </a>
          </div>
        </div>
      </footer>

      {/* EMERGENCY MODAL POPUP */}
      {isEmergencyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-red-100 text-center animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-slate-900">
                Medical Emergency Assistance
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                If you or someone nearby is experiencing severe chest pain, loss of consciousness, or difficulty breathing, please contact emergency service immediately.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <a
                href="tel:112"
                className="w-full inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-full shadow-lg shadow-red-600/30 transition-all text-base"
              >
                <Phone className="w-5 h-5" />
                Call Emergency Line (112)
              </a>
              <button
                onClick={() => setIsEmergencyModalOpen(false)}
                className="w-full text-xs font-semibold text-slate-500 hover:text-slate-800 py-2 transition-colors"
              >
                Dismiss & Return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
