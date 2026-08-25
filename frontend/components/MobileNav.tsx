"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Mic,
  History,
  Shield,
  Compass,
  AlertTriangle,
} from "lucide-react";

export default function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Home", icon: Home },
    { href: "/consultation", label: "Consult", icon: Mic },
    { href: "/care-support", label: "Care Fund", icon: Shield },
    { href: "/guidance", label: "Guidance", icon: Compass },
    { href: "/history", label: "History", icon: History },
    { href: "/emergency", label: "SOS", icon: AlertTriangle, isEmergency: true },
  ];

  return (
    <nav
      aria-label="Mobile Navigation Bar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-teal-100/80 shadow-2xl py-1.5 px-2 flex items-center justify-around pb-[max(env(safe-area-inset-bottom),0.5rem)] select-none"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);

        if (item.isEmergency) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-2xl bg-[#dc2626] active:bg-[#b91c1c] text-white font-black text-[9px] shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <Icon className="w-4 h-4 text-white animate-pulse" />
              <span>{item.label}</span>
            </Link>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-0.5 px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all active:scale-95 ${
              isActive
                ? "text-[#006666] bg-teal-50/80 shadow-2xs font-extrabold"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Icon
              className={`w-4 h-4 transition-transform ${
                isActive ? "text-[#006666] scale-110" : "text-slate-400"
              }`}
            />
            <span className="tracking-tight">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
