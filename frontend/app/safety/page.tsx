"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { ShieldCheck, AlertTriangle, Lock, FileCheck, Phone, CheckCircle2, Mic } from "lucide-react";

export default function SafetyPage() {
  const safetyProtocols = [
    {
      title: "Red-Flag Symptom Interception",
      description:
        "Symptoms indicating stroke, acute myocardial infarction, severe respiratory distress, or severe trauma immediately trigger high-priority emergency triage warnings.",
    },
    {
      title: "Deterministic Rule Verification",
      description:
        "AI output is constrained and validated by hard clinical decision rules. Recommendations never bypass established medical guidelines.",
    },
    {
      title: "Zero Self-Diagnosis Assumption",
      description:
        "Alaafia does not provide medical diagnoses. It classifies urgency, suggests care settings (ER, Urgent Care, Clinic), and prepares handoff summaries.",
    },
    {
      title: "Encrypted & Confidential Data",
      description:
        "Voice audio and symptom transcripts are encrypted in transit and at rest to ensure full patient confidentiality.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-teal-100 selection:text-teal-900">
      <Navbar activePage="safety" />

      <main className="flex-1">
        {/* Header Hero */}
        <section className="px-4 sm:px-8 pt-16 pb-12 bg-linear-to-b from-red-50/40 via-teal-50/30 to-slate-50 border-b border-red-100/50">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-red-600" />
              Clinical Safety & Governance
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              Safety Rules That Put Patient Health First
            </h1>
            <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Alaafia combines voice AI intelligence with strict clinical safeguards to ensure rapid, reliable, and safe healthcare routing.
            </p>
          </div>
        </section>

        {/* Safety Grid */}
        <section className="px-4 sm:px-8 py-16">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {safetyProtocols.map((protocol, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm">
                    0{index + 1}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {protocol.title}
                  </h3>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed pl-11">
                  {protocol.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Emergency Callout Box */}
        <section className="px-4 sm:px-8 pb-16">
          <div className="max-w-4xl mx-auto bg-red-50 border border-red-200 rounded-3xl p-6 sm:p-8 space-y-4 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-center sm:justify-start gap-2 text-red-700 font-bold text-sm">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span>Life-Threatening Emergency Notice</span>
              </div>
              <p className="text-slate-700 text-sm leading-relaxed">
                If you suspect a heart attack, severe injury, stroke, or severe breathing distress, do not wait. Access emergency services immediately.
              </p>
            </div>
            <a
              href="tel:112"
              className="shrink-0 bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-6 py-3 rounded-full shadow-md transition-all flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              <span>Call Emergency Line (112)</span>
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
