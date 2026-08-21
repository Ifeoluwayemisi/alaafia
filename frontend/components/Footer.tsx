"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShieldCheck, Phone } from "lucide-react";
import EmergencyModal from "./EmergencyModal";

export default function Footer() {
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

  return (
    <>
      {/* Light Mint/Cyan Figma Footer Background */}
      <footer className="bg-[#d5ede9] text-[#1f4e4e] border-t border-teal-200/80 px-4 sm:px-8 pt-16 pb-12">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Top Row: Brand & Quick Emergency Banner */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Brand Information */}
            <div className="lg:col-span-5 space-y-4">
              <Link href="/" className="flex items-center gap-2.5 cursor-pointer">
                <div className="flex items-center gap-0.5 h-6">
                  <span className="w-1 h-3.5 bg-[#006666] rounded-full" />
                  <span className="w-1 h-5.5 bg-[#006666] rounded-full" />
                  <span className="w-1 h-4 bg-[#006666] rounded-full" />
                  <span className="w-1 h-5 bg-[#006666] rounded-full" />
                </div>
                <span className="text-2xl font-extrabold text-[#005c6e] tracking-tight">
                  Alaafia
                </span>
              </Link>

              <p className="text-[#2c5e5e] text-sm leading-relaxed max-w-sm font-medium">
                Alaafia AI turns complex, uncertain symptoms into clear next steps and safe healthcare routing. Built for fast, reliable, voice-first triage.
              </p>

              <div className="inline-flex items-center gap-2 text-xs text-[#004d4d] bg-white/80 border border-teal-300/80 px-3 py-1.5 rounded-full font-bold shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-[#006666]" />
                <span>Verified Clinical Safety Rules Active</span>
              </div>
            </div>

            {/* Quick Navigation Links */}
            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8 text-xs sm:text-sm">
              <div className="space-y-3">
                <h4 className="font-extrabold text-[#004d4d] uppercase text-xs tracking-wider">
                  Platform
                </h4>
                <ul className="space-y-2 text-[#2c5e5e] font-medium">
                  <li>
                    <Link href="/" className="hover:text-[#005c6e] hover:underline transition-colors">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link href="/how-it-works" className="hover:text-[#005c6e] hover:underline transition-colors">
                      How It Works
                    </Link>
                  </li>
                  <li>
                    <Link href="/about" className="hover:text-[#005c6e] hover:underline transition-colors">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/consultation" className="hover:text-[#005c6e] hover:underline transition-colors">
                      Start Consultation
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-extrabold text-[#004d4d] uppercase text-xs tracking-wider">
                  Resources
                </h4>
                <ul className="space-y-2 text-[#2c5e5e] font-medium">
                  <li>
                    <Link href="/about" className="hover:text-[#005c6e] hover:underline transition-colors">
                      About Alaafia
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard" className="hover:text-[#005c6e] hover:underline transition-colors">
                      Patient Portal
                    </Link>
                  </li>
                  <li>
                    <Link href="/emergency" className="hover:text-[#005c6e] hover:underline transition-colors">
                      Emergency Numbers
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="space-y-3 col-span-2 sm:col-span-1">
                <h4 className="font-extrabold text-[#004d4d] uppercase text-xs tracking-wider">
                  Emergency Care
                </h4>
                <p className="text-xs text-[#2c5e5e] font-medium">
                  Experiencing life-threatening symptoms? Contact national emergency dispatch:
                </p>
                <Link
                  href="/emergency"
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#b91c1c] hover:bg-[#991b1b] text-white text-xs font-extrabold py-2.5 px-3 rounded-xl transition-all shadow-md active:scale-95"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Emergency (112)</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Row: Disclaimer & Copyright */}
          <div className="pt-8 border-t border-teal-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#386b6b] font-medium">
            <p>
              © 2026 Alaafia AI. All rights reserved. Medical triage assistant.
            </p>
            <div className="flex items-center gap-6">
              <span className="hover:text-[#004d4d] transition-colors cursor-pointer hover:underline">Privacy Policy</span>
              <span className="hover:text-[#004d4d] transition-colors cursor-pointer hover:underline">Terms of Service</span>
              <span className="hover:text-[#004d4d] transition-colors cursor-pointer hover:underline">Medical Disclaimer</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Emergency Modal Popup */}
      <EmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
      />
    </>
  );
}
