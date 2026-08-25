"use client";

import React from "react";
import Link from "next/link";
import {
  Mic,
  HeartPulse,
  ShieldCheck,
  Zap,
  Users,
  Compass,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Sparkles,
  Building2,
  CreditCard,
  ArrowRight,
} from "lucide-react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* 1. NAVBAR */}
      <Navbar activePage="about" />

      <main className="flex-1">
        {/* 2. HERO SECTION */}
        <section className="relative px-4 sm:px-8 pt-16 pb-20 overflow-hidden bg-dot-pattern">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-teal-200/30 rounded-full blur-3xl -z-10" />

          {/* Floating animated particles */}
          <div className="absolute top-10 left-12 w-5 h-5 rounded-full bg-teal-400/40 blur-xs animate-particle-1 -z-10" />
          <div className="absolute top-1/3 right-16 w-7 h-7 rounded-full bg-teal-500/30 blur-xs animate-particle-2 -z-10" />
          <div className="absolute bottom-10 left-1/3 w-6 h-6 rounded-full bg-emerald-400/35 blur-xs animate-particle-3 -z-10" />

          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/70 text-teal-700 text-xs font-bold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              OUR MISSION & PURPOSE
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.15]">
              Closing the gap between <br className="hidden sm:inline" />
              <span className="text-teal-600">"Something is wrong"</span> and{" "}
              <span className="text-[#0e7490]">"I know what to do."</span>
            </h1>

            <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
              Alaafia is a voice-first healthcare navigation platform designed to eliminate panic during medical uncertainty, direct patients to safe care, and bridge emergency financial friction.
            </p>
          </div>
        </section>

        {/* 3. THE PROBLEM WE ARE SOLVING */}
        <section className="px-4 sm:px-8 py-20 bg-white">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">
                THE HEALTHCARE GAP
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
                When sudden symptoms strike, seconds matter—yet confusion reigns.
              </h2>
              <p className="text-slate-600 leading-relaxed text-base">
                When a family member suddenly develops severe chest pain, breathing difficulty, or high fever, most people don't know medical jargon. They panic, search online for scary diagnoses, or delay going to the hospital because they aren't sure where to go or whether the facility can handle their emergency.
              </p>
              <p className="text-slate-600 leading-relaxed text-base">
                Alaafia changes that entire experience. You simply speak in your everyday voice or local language. Alaafia listens, structures your symptoms, checks deterministic medical safety rules, and guides you to appropriate, verified care in seconds.
              </p>
            </div>

            {/* Right Card */}
            <div className="lg:col-span-6">
              <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-2xl border border-slate-800 space-y-6 animate-float-slow">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
                    <HeartPulse className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white">The Alaafia Promise</h3>
                    <span className="text-xs text-teal-400 font-medium">Guiding, protecting & connecting</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3 text-sm text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                    <span><strong>Not a diagnostic chatbot:</strong> We don't replace doctors or give disease diagnoses. We categorize urgency and guide action.</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                    <span><strong>AI understands; rules protect:</strong> Natural language processing handles conversational understanding while hardcoded medical rules assign severity tiers.</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                    <span><strong>Financial Bridge Prototype:</strong> Proposed integration blueprint with Wema ALAT Emergency Care Fund to ensure emergency care is never delayed by upfront funds.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. CORE PILLARS */}
        <section className="px-4 sm:px-8 py-20 bg-slate-100/70 border-t border-slate-200/80">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">
                SYSTEM PILLARS
              </span>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                Built on four core innovation pillars.
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 hover:shadow-md transition-all space-y-4">
                <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                  <Mic className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Voice-First AI</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Speech recognition designed to process natural language, accents, and local dialects effortlessly.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 hover:shadow-md transition-all space-y-4">
                <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Deterministic Safety</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Strict medical triage guardrails ensure severe red flags trigger immediate emergency escalation.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 hover:shadow-md transition-all space-y-4">
                <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Facility Match & Handoff</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Geospatial facility matching combined with instant digital triage summaries for ER personnel.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 hover:shadow-md transition-all space-y-4">
                <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                  <CreditCard className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Financial Bridge</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Proposed integration blueprint with Wema ALAT Emergency Care Fund for emergency liquidity.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. CALL TO ACTION */}
        <section className="px-4 sm:px-8 py-16 bg-[#0f766e] text-white relative overflow-hidden">
          <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Start navigating your health with Alaafia.
            </h2>
            <p className="text-teal-100 text-base max-w-xl mx-auto">
              No medical terms required. Describe what's happening in your own words.
            </p>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-white text-[#0f766e] hover:bg-teal-50 font-bold px-8 py-3.5 rounded-full shadow-lg transition-all text-base"
              >
                <Mic className="w-5 h-5 text-[#0f766e]" />
                Go to Home & Start Speaking
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 6. FOOTER */}
      <Footer />
    </div>
  );
}
