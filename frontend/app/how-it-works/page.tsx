"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Mic,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  FileText,
  Clock,
  Sparkles,
  Lock,
  ChevronRight,
  HeartPulse,
  BriefcaseMedical,
} from "lucide-react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function HowItWorksPage() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: "speak",
      number: "01",
      title: "Speak in Your Own Words",
      badge: "NATURAL LANGUAGE ENGINE",
      description:
        "No complex medical terminology needed. Describe how you feel using everyday language or native dialects (English, Pidgin, Yoruba, Hausa, Igbo).",
      details: [
        "Voice-first speech recognition tuned for local accents",
        "Supports unstructured symptom descriptions and emotional context",
        "Real-time audio visualizer confirms active listening",
      ],
      interactivePreview: {
        quote: '"My head is spinning and I feel sharp pain on the left side of my chest since morning."',
        tag: "Audio input processed in real-time",
      },
    },
    {
      id: "structure",
      number: "02",
      title: "Intelligent Clinical Structuring",
      badge: "AI TRANSLATION LAYER",
      description:
        "Alaafia's AI engine analyzes speech patterns and translates subjective complaints into structured clinical observations without making diagnostic assertions.",
      details: [
        "Extracts onset duration, pain character, and anatomical locations",
        "Identifies accompanying secondary symptoms and risk markers",
        "Prepares standardized summary format for emergency responders",
      ],
      interactivePreview: {
        structured: [
          { label: "Primary Complaint", value: "Acute Chest Pain (Left-sided)" },
          { label: "Associated Symptom", value: "Vertigo / Dizziness" },
          { label: "Duration / Onset", value: "Morning (~4-6 hours ago)" },
        ],
      },
    },
    {
      id: "triage",
      number: "03",
      title: "Deterministic Safety Triage",
      badge: "SAFETY RULES ENGINE",
      description:
        "AI processes language, but hardcoded deterministic safety rules assign triage severity. Red flag rules instantly trigger emergency escalation.",
      details: [
        "CRITICAL: Immediate life safety emergency escalation (Red Alert)",
        "HIGH: Urgent care required at nearest equipped facility",
        "MEDIUM / LOW: Scheduled clinical consultation or guided self-care",
      ],
      interactivePreview: {
        severity: "HIGH / CRITICAL",
        reasoning: "Red Flag Rule triggered: Left chest pain with acute onset",
        action: "Escalate to direct facility route & emergency handoff",
      },
    },
    {
      id: "route",
      number: "04",
      title: "Smart Facility Routing & Handoff",
      badge: "GEOSPATIAL NAVIGATION",
      description:
        "Alaafia locates nearest verified medical facilities capable of treating your exact condition and generates an instant digital triage handoff summary.",
      details: [
        "Filters facilities by emergency capabilities (Oxygen, ICU, Trauma)",
        "Generates one-click digital summary for triage nurses and doctors",
        "Integrates emergency financial support bridge for rapid admission",
      ],
      interactivePreview: {
        facility: "St. Nicholas Emergency Hospital (1.8 km)",
        readiness: "ICU & Cardiac Trauma Center Active",
      },
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* 1. NAVBAR */}
      <Navbar activePage="how-it-works" />

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
              TRANSPARENT TRIAGE ARCHITECTURE
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.15]">
              How Alaafia guides you from{" "}
              <span className="text-teal-600">symptoms to safe care.</span>
            </h1>

            <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
              AI understands natural human speech; deterministic medical safety rules protect your life. Explore the step-by-step engine behind our healthcare navigation.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/consultation"
                className="inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-medium px-7 py-3.5 rounded-full shadow-lg shadow-teal-600/25 transition-all text-base"
              >
                <Mic className="w-5 h-5" />
                Start a consultation
              </Link>
            </div>
          </div>
        </section>

        {/* 3. CORE ARCHITECTURE WORKFLOW (INTERACTIVE STEP SWITCHER) */}
        <section className="px-4 sm:px-8 py-20 bg-slate-100/70 border-t border-slate-200/80">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">
                THE 4-STAGE TRIAGE ENGINE
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                Designed for speed, clarity, and safety.
              </h2>
            </div>

            {/* Step Navigation Tabs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-4xl mx-auto">
              {steps.map((step, idx) => (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(idx)}
                  className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
                    activeStep === idx
                      ? "bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/20 scale-[1.02]"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-teal-50/50 hover:border-teal-200"
                  }`}
                >
                  <span className={`text-xs font-bold uppercase tracking-wider block ${activeStep === idx ? "text-teal-200" : "text-teal-600"}`}>
                    STAGE {step.number}
                  </span>
                  <span className="text-sm font-bold block mt-1">
                    {step.title}
                  </span>
                </button>
              ))}
            </div>

            {/* Active Step Feature Box */}
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-float-slow">
              {/* Left Column Description */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold tracking-wider uppercase">
                  {steps[activeStep].badge}
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  {steps[activeStep].title}
                </h3>

                <p className="text-slate-600 leading-relaxed text-base sm:text-lg">
                  {steps[activeStep].description}
                </p>

                <ul className="space-y-3 pt-2">
                  {steps[activeStep].details.map((detail, dIdx) => (
                    <li key={dIdx} className="flex items-start gap-3 text-sm text-slate-700 font-medium">
                      <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right Column Interactive Preview Card */}
              <div className="lg:col-span-5">
                <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-2xl border border-slate-800 space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs font-bold text-teal-400 uppercase tracking-widest flex items-center gap-2">
                      <Activity className="w-4 h-4 text-teal-400" />
                      Live Simulation Stage {steps[activeStep].number}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
                  </div>

                  {steps[activeStep].interactivePreview.quote && (
                    <div className="p-4 rounded-xl bg-slate-800/90 border border-slate-700 text-sm italic font-medium leading-relaxed text-slate-200">
                      {steps[activeStep].interactivePreview.quote}
                    </div>
                  )}

                  {steps[activeStep].interactivePreview.structured && (
                    <div className="space-y-2.5">
                      {steps[activeStep].interactivePreview.structured.map((item, i) => (
                        <div key={i} className="p-3 rounded-lg bg-slate-800 border border-slate-700/80 text-xs">
                          <span className="text-slate-400 block font-medium">{item.label}</span>
                          <span className="font-bold text-teal-300 text-sm">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {steps[activeStep].interactivePreview.severity && (
                    <div className="p-4 rounded-xl bg-red-950/80 border border-red-800/80 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-red-300 font-bold text-sm">
                        <span>Severity Level</span>
                        <span className="px-2 py-0.5 rounded bg-red-600 text-white">{steps[activeStep].interactivePreview.severity}</span>
                      </div>
                      <p className="text-red-200">{steps[activeStep].interactivePreview.reasoning}</p>
                    </div>
                  )}

                  {steps[activeStep].interactivePreview.facility && (
                    <div className="p-4 rounded-xl bg-teal-950/80 border border-teal-800 space-y-2 text-xs">
                      <span className="text-teal-300 font-bold text-sm block">Matched Facility</span>
                      <p className="text-teal-100 font-semibold">{steps[activeStep].interactivePreview.facility}</p>
                      <span className="text-slate-400 block">{steps[activeStep].interactivePreview.readiness}</span>
                    </div>
                  )}

                  <div className="pt-2 text-xs text-slate-400 flex items-center justify-between">
                    <span>Deterministic rule validation</span>
                    <span className="text-teal-400 font-bold">100% Safe</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. SAFETY GUARANTEE GRID */}
        <section className="px-4 sm:px-8 py-20 bg-white">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">
                CLINICAL GOVERNANCE
              </span>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                Built to guide, never to replace doctors.
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Alaafia maintains strict boundaries to ensure user safety and clinical ethics.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4 hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">No Medical Diagnosis</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Alaafia never states "You have pneumonia" or "You have malaria". It evaluates urgency level and directs you to appropriate human clinicians.
                </p>
              </div>

              <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4 hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Red Flag Escalation</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  If severe symptoms (unconsciousness, uncontrolled bleeding, severe chest pressure) are detected, AI step-by-step questioning is bypassed for immediate emergency access.
                </p>
              </div>

              <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4 hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Privacy & Consent</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Your audio and transcribed symptom records are encrypted and transmitted only with your consent when generating a digital triage handoff summary.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. CALL TO ACTION */}
        <section className="px-4 sm:px-8 py-16 bg-[#0f766e] text-white relative overflow-hidden">
          <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Ready to start your health conversation?
            </h2>
            <p className="text-teal-100 text-base max-w-xl mx-auto">
              Get immediate, clear, non-judgmental guidance on your symptoms right now.
            </p>
            <div className="pt-2">
              <Link
                href="/consultation"
                className="inline-flex items-center gap-2 bg-white text-[#0f766e] hover:bg-teal-50 font-bold px-8 py-3.5 rounded-full shadow-lg transition-all text-base"
              >
                <Mic className="w-5 h-5 text-[#0f766e]" />
                Start speaking now
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
