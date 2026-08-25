"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTASection from "@/components/CTASection";
import { ShieldCheck, Stethoscope, MapPin, Activity, Clock, Mic } from "lucide-react";

export default function ServicesPage() {
  const servicesList = [
    {
      icon: Mic,
      title: "Voice-First Symptom Intake",
      description:
        "Speak naturally in your native language or English. Alaafia transcribes and understands your symptoms without requiring medical terms.",
    },
    {
      icon: Activity,
      title: "Dynamic Clinical Triage",
      description:
        "Guided follow-up questions evaluate symptom severity, timing, associated red flags, and risk factors instantly.",
    },
    {
      icon: MapPin,
      title: "Nearest Hospital & Care Routing",
      description:
        "Geolocated emergency hospital and clinic matching ensures you know exactly where to go for immediate care.",
    },
    {
      icon: Stethoscope,
      title: "Structured Medical Summary",
      description:
        "Generates clean clinical intake handoff notes for doctors and emergency medical responders to save critical time.",
    },
    {
      icon: ShieldCheck,
      title: "Rule-Based Safety Verification",
      description:
        "Every AI insight is cross-checked against strict medical protocols to prevent misinterpretation of life-threatening signs.",
    },
    {
      icon: Clock,
      title: "24/7 Accessible Navigation",
      description:
        "Instant healthcare guidance available anytime, anywhere on web and mobile devices with minimal bandwidth requirements.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-teal-100 selection:text-teal-900">
      <Navbar activePage="services" />

      <main className="flex-1">
        {/* Header Hero */}
        <section className="px-4 sm:px-8 pt-16 pb-12 bg-linear-to-b from-teal-50/50 to-slate-50 border-b border-teal-100/50">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold uppercase tracking-wider">
              Alaafia Healthcare Services
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              Intelligent Care Navigation for Everyone
            </h1>
            <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              From voice symptom collection to emergency hospital dispatch, discover how Alaafia simplifies your path to medical assistance.
            </p>
          </div>
        </section>

        {/* Services Grid */}
        <section className="px-4 sm:px-8 py-16">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {servicesList.map((service, index) => {
              const Icon = service.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">
                      {service.title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Call to Action */}
        <CTASection
          headline="Ready to check your symptoms?"
          subheadline="Start a confidential consultation right now using your voice or keyboard."
          ctaLabel="Start Consultation"
          ctaHref="/consultation"
        />
      </main>

      <Footer />
    </div>
  );
}
