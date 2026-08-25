"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Mic, History, Settings, AlertTriangle } from "lucide-react";

export default function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Home", icon: Home },
    { href: "/consultation", label: "Consult", icon: Mic },
    { href: "/history", label: "History", icon: History },
    { href: "/settings", label: "Settings", icon: Settings },
    { href: "/emergency", label: "SOS", icon: AlertTriangle, isEmergency: true },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg py-1.5 px-2 flex items-center justify-around">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        if (item.isEmergency) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-2xl bg-red-600 text-white font-extrabold text-[10px] shadow-xs active:scale-95 transition-all"
            >
              <Icon className="w-4 h-4 text-white" />
              <span>{item.label}</span>
            </Link>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[10px] font-bold transition-all ${
              isActive
                ? "text-[#006666] bg-teal-50"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? "text-[#006666]" : "text-slate-400"}`} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
