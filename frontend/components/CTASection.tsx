"use client";

import React from "react";
import Link from "next/link";
import { Mic, ArrowRight, Lock, ShieldCheck, Sparkles } from "lucide-react";

interface CTASectionProps {
  headline?: string;
  subheadline?: string;
  ctaLabel?: string;
  ctaHref?: string;
  showLock?: boolean;
}

export default function CTASection({
  headline = "Ready to check your symptoms?",
  subheadline = "Start a confidential consultation right now using your voice or keyboard.",
  ctaLabel = "Start Consultation",
  ctaHref = "/consultation",
  showLock = true,
}: CTASectionProps) {
  return (
    <section className="relative px-4 sm:px-8 py-24 overflow-hidden">
      {/* === LIGHT MESH GRADIENT BACKGROUND === */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#e8faf7] via-[#d4f0ec] to-[#c8ebe5] -z-10" />

      {/* === ANIMATED FLOATING ORBS === */}
      {/* Large soft orb – top-right */}
      <div
        className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-teal-300/30 blur-3xl -z-10"
        style={{ animation: "floatOrb1 8s ease-in-out infinite" }}
      />
      {/* Large soft orb – bottom-left */}
      <div
        className="absolute -bottom-12 -left-12 w-64 h-64 rounded-full bg-emerald-300/20 blur-3xl -z-10"
        style={{ animation: "floatOrb2 10s ease-in-out infinite" }}
      />
      {/* Mid orb – center */}
      <div
        className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full bg-cyan-300/15 blur-2xl -z-10"
        style={{ animation: "floatOrb3 12s ease-in-out infinite" }}
      />

      {/* === FLOATING DOT PARTICLES === */}
      <div
        className="absolute top-12 left-[15%] w-2.5 h-2.5 rounded-full bg-teal-500/50 -z-10"
        style={{ animation: "floatDot1 6s ease-in-out infinite" }}
      />
      <div
        className="absolute top-1/3 right-[10%] w-2 h-2 rounded-full bg-emerald-500/40 -z-10"
        style={{ animation: "floatDot2 8s ease-in-out infinite" }}
      />
      <div
        className="absolute bottom-10 left-1/4 w-3 h-3 rounded-full bg-teal-400/35 -z-10"
        style={{ animation: "floatDot3 9s ease-in-out infinite" }}
      />
      <div
        className="absolute top-16 right-1/4 w-2 h-2 rounded-full bg-cyan-400/45 -z-10"
        style={{ animation: "floatDot1 7s ease-in-out infinite reverse" }}
      />
      <div
        className="absolute bottom-1/3 right-[20%] w-2.5 h-2.5 rounded-full bg-teal-600/30 -z-10"
        style={{ animation: "floatDot2 11s ease-in-out infinite" }}
      />

      {/* === ANIMATED SPARKLE RINGS === */}
      <div
        className="absolute top-8 left-[8%] w-10 h-10 rounded-full border border-teal-300/60 -z-10"
        style={{ animation: "pulseFade 4s ease-in-out infinite" }}
      />
      <div
        className="absolute bottom-8 right-[12%] w-14 h-14 rounded-full border border-emerald-300/50 -z-10"
        style={{ animation: "pulseFade 6s ease-in-out infinite 1s" }}
      />
      <div
        className="absolute top-1/2 left-[5%] w-6 h-6 rounded-full border border-cyan-400/40 -z-10"
        style={{ animation: "pulseFade 5s ease-in-out infinite 2s" }}
      />

      {/* === THIN GRID MESH OVERLAY === */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(#006666 1px, transparent 1px), linear-gradient(90deg, #006666 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* === MAIN CTA CARD === */}
      <div className="max-w-4xl mx-auto">
        <div className="relative bg-white/60 backdrop-blur-xl border border-teal-200/80 rounded-[2.5rem] p-10 sm:p-16 text-center space-y-7 shadow-2xl shadow-teal-500/10 overflow-hidden">
          {/* Inner card glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-teal-50/30 to-white/80 rounded-[2.5rem] -z-10" />

          {/* Animated Mic Badge */}
          <div className="relative flex items-center justify-center mx-auto w-fit">
            {/* Outer pulsing ring */}
            <div
              className="absolute w-24 h-24 rounded-full bg-teal-400/15"
              style={{ animation: "scaleRing 3s ease-in-out infinite" }}
            />
            {/* Inner pulsing ring */}
            <div
              className="absolute w-20 h-20 rounded-full bg-teal-400/20"
              style={{ animation: "scaleRing 3s ease-in-out infinite 0.5s" }}
            />
            {/* Core mic button */}
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00796b] to-[#005c6e] text-white flex items-center justify-center shadow-lg shadow-teal-700/30">
              <Mic className="w-7 h-7 text-white" />
            </div>
          </div>

          {/* Headline */}
          <div className="space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#004d4d] leading-tight">
              {headline}
            </h2>
            <p className="text-[#2c5e5e] text-sm sm:text-base leading-relaxed font-medium">
              {subheadline}
            </p>
          </div>

          {/* CTA Button with shimmer */}
          <div className="pt-2 relative inline-block mx-auto">
            <Link
              href={ctaHref}
              className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-[#00796b] to-[#005c6e] hover:from-[#005c6e] hover:to-[#004d4d] text-white font-extrabold px-10 py-4 rounded-full shadow-lg shadow-teal-700/30 hover:shadow-teal-700/50 transition-all text-sm sm:text-base overflow-hidden"
            >
              {/* Shimmer sweep */}
              <span
                className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 pointer-events-none"
              />
              <Mic className="w-5 h-5 text-teal-200 group-hover:scale-110 transition-transform" />
              <span>{ctaLabel}</span>
              <ArrowRight className="w-4 h-4 text-teal-200 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Trust Badges Row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 text-xs text-[#386b6b] font-semibold flex-wrap">
            {showLock && (
              <div className="flex items-center gap-1.5 bg-white/80 border border-teal-200/80 px-3 py-1.5 rounded-full shadow-2xs">
                <Lock className="w-3.5 h-3.5 text-teal-600" />
                <span>Your conversation is secure and private.</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 bg-white/80 border border-teal-200/80 px-3 py-1.5 rounded-full shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>Verified Clinical Safety Active</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/80 border border-teal-200/80 px-3 py-1.5 rounded-full shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>AI-powered triage</span>
            </div>
          </div>
        </div>
      </div>

      {/* === KEYFRAME ANIMATIONS === */}
      <style jsx>{`
        @keyframes floatOrb1 {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-24px) scale(1.05); }
        }
        @keyframes floatOrb2 {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(20px) scale(0.96); }
        }
        @keyframes floatOrb3 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(16px, -12px) scale(1.04); }
          66% { transform: translate(-10px, 10px) scale(0.97); }
        }
        @keyframes floatDot1 {
          0%, 100% { transform: translateY(0px); opacity: 0.7; }
          50% { transform: translateY(-14px); opacity: 1; }
        }
        @keyframes floatDot2 {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.6; }
          50% { transform: translateY(10px) translateX(-8px); opacity: 1; }
        }
        @keyframes floatDot3 {
          0%, 100% { transform: translateY(0px) translateX(0px) scale(1); opacity: 0.5; }
          50% { transform: translateY(-10px) translateX(6px) scale(1.2); opacity: 0.9; }
        }
        @keyframes pulseFade {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.4); opacity: 0; }
        }
        @keyframes scaleRing {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.2); opacity: 0.3; }
        }
      `}</style>
    </section>
  );
}
