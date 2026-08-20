"use client";

import React, { useState } from "react";
import Link from "next/link";
import EmergencyModal from "./EmergencyModal";
import { Menu, X } from "lucide-react";

interface NavbarProps {
  activePage?: "home" | "how-it-works" | "services" | "safety" | "about" | "consultation" | "dashboard";
}

export default function Navbar({ activePage }: NavbarProps) {
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "How it works", href: "/how-it-works", id: "how-it-works" },
    { name: "Services", href: "/services", id: "services" },
    { name: "Safety", href: "/safety", id: "safety" },
    { name: "About", href: "/about", id: "about" },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#e0f7fa]/60 backdrop-blur-md border-b border-teal-100/60 px-4 sm:px-8 py-3.5 transition-all">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 cursor-pointer group">
            <div className="flex items-center gap-0.5 h-6">
              <span className="w-1 h-3.5 bg-[#006666] rounded-full transition-all group-hover:h-4" />
              <span className="w-1 h-5.5 bg-[#006666] rounded-full transition-all group-hover:h-6" />
              <span className="w-1 h-4 bg-[#006666] rounded-full transition-all group-hover:h-5" />
              <span className="w-1 h-5 bg-[#006666] rounded-full transition-all group-hover:h-5.5" />
            </div>
            <span className="text-2xl font-extrabold text-[#005c6e] tracking-tight">
              Alaafia
            </span>
          </Link>

          {/* Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8 text-sm">
            {navLinks.map((link) => {
              const isActive = activePage === link.id;
              return (
                <Link
                  key={link.id}
                  href={link.href}
                  className={`relative py-1 transition-all font-medium ${
                    isActive
                      ? "text-[#005c6e] font-semibold"
                      : "text-slate-600 hover:text-[#005c6e]"
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-[#006666] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Action Buttons (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/signin"
              className="text-sm font-semibold text-slate-600 hover:text-[#005c6e] transition-colors"
            >
              Sign In
            </Link>

            <Link
              href="/emergency"
              className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-full transition-all shadow-xs hover:shadow cursor-pointer"
            >
              <span className="text-white font-black text-sm leading-none">✱</span>
              <span>Emergency Access</span>
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center gap-3">
            <Link
              href="/emergency"
              className="inline-flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-full"
            >
              <span className="text-white font-bold">✱</span>
              <span>Emergency</span>
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden pt-4 pb-3 border-t border-teal-100/80 mt-3 space-y-3 px-2">
            <nav className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.id}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    activePage === link.id
                      ? "bg-teal-50 text-[#005c6e] font-semibold"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <Link
                href="/signin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg"
              >
                Sign In
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Emergency Modal */}
      <EmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
      />
    </>
  );
}
