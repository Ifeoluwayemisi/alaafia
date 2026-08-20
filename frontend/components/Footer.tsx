"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShieldCheck, Phone, Heart } from "lucide-react";
import EmergencyModal from "./EmergencyModal";

export default function Footer() {
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

  return (
    <>
      <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 px-4 sm:px-8 pt-16 pb-12">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Top Row: Brand & Quick Emergency Banner */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Brand Information */}
            <div className="lg:col-span-5 space-y-4">
              <Link href="/" className="flex items-center gap-2.5 cursor-pointer">
                <div className="flex items-center gap-0.5 h-6">
                  <span className="w-1 h-3.5 bg-teal-400 rounded-full" />
                  <span className="w-1 h-5.5 bg-teal-400 rounded-full" />
                  <span className="w-1 h-4 bg-teal-400 rounded-full" />
                  <span className="w-1 h-5 bg-teal-400 rounded-full" />
                </div>
                <span className="text-2xl font-extrabold text-white tracking-tight">
                  Alaafia
                </span>
              </Link>

              <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                Alaafia AI turns complex, uncertain symptoms into clear next steps and safe healthcare routing. Built for fast, reliable, voice-first triage.
              </p>

              <div className="inline-flex items-center gap-2 text-xs text-teal-400 bg-teal-950/60 border border-teal-800/60 px-3 py-1.5 rounded-full font-medium">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                <span>Verified Clinical Safety Rules Active</span>
              </div>
            </div>

            {/* Quick Navigation Links */}
            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8 text-xs sm:text-sm">
              <div className="space-y-3">
                <h4 className="font-semibold text-white uppercase text-xs tracking-wider">
                  Platform
                </h4>
                <ul className="space-y-2 text-slate-400">
                  <li>
                    <Link href="/" className="hover:text-teal-400 transition-colors">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link href="/how-it-works" className="hover:text-teal-400 transition-colors">
                      How It Works
                    </Link>
                  </li>
                  <li>
                    <Link href="/about" className="hover:text-teal-400 transition-colors">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/consultation" className="hover:text-teal-400 transition-colors">
                      Start Consultation
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-white uppercase text-xs tracking-wider">
                  Resources
                </h4>
                <ul className="space-y-2 text-slate-400">
                  <li>
                    <Link href="/about" className="hover:text-teal-400 transition-colors">
                      About Alaafia
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard" className="hover:text-teal-400 transition-colors">
                      Patient Portal
                    </Link>
                  </li>
                  <li>
                    <Link href="/emergency" className="hover:text-teal-400 transition-colors">
                      Emergency Numbers
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="space-y-3 col-span-2 sm:col-span-1">
                <h4 className="font-semibold text-white uppercase text-xs tracking-wider">
                  Emergency Care
                </h4>
                <p className="text-xs text-slate-400">
                  Experiencing life-threatening symptoms? Contact national emergency dispatch:
                </p>
                <Link
                  href="/emergency"
                  className="w-full inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2.5 px-3 rounded-xl transition-all shadow-xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Emergency (112)</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Row: Disclaimer & Copyright */}
          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>
              © 2026 Alaafia AI. All rights reserved. Medical triage assistant.
            </p>
            <div className="flex items-center gap-6">
              <span className="hover:text-slate-400 transition-colors cursor-pointer">Privacy Policy</span>
              <span className="hover:text-slate-400 transition-colors cursor-pointer">Terms of Service</span>
              <span className="hover:text-slate-400 transition-colors cursor-pointer">Medical Disclaimer</span>
            </div>
          </div>
        </div>
      </footer>

      <EmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
      />
    </>
  );
}
