"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Stethoscope,
  History,
  Calendar,
  Compass,
  Shield,
  Plus,
  User,
  Settings,
  AlertCircle,
  LogOut,
} from "lucide-react";
import LogoutModal from "@/components/LogoutModal";

interface SidebarProps {
  activeTab?: "home" | "consultation" | "history" | "care-support" | "followups" | "guidance" | "profile" | "settings";
}

export default function Sidebar({ activeTab }: SidebarProps) {
  const pathname = usePathname();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userInitial, setUserInitial] = useState("R");
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("alaafia_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        setUserProfile(parsed);
        if (parsed.firstName) {
          setUserInitial(parsed.firstName.charAt(0).toUpperCase());
        }
      }
    } catch (e) {}
  }, []);

  // Determine current active route if activeTab prop is not provided
  const currentTab =
    activeTab ||
    (pathname === "/dashboard"
      ? "home"
      : pathname === "/consultation"
      ? "consultation"
      : pathname === "/history"
      ? "history"
      : pathname === "/care-support"
      ? "care-support"
      : pathname === "/settings"
      ? "settings"
      : pathname === "/about"
      ? "guidance"
      : "home");

  const navLinks = [
    { id: "home", label: "Home", href: "/dashboard", icon: Home },
    { id: "consultation", label: "Consultation", href: "/consultation", icon: Stethoscope },
    { id: "history", label: "History", href: "/history", icon: History },
    { id: "care-support", label: "Care Support", href: "/care-support", icon: Shield },
    { id: "followups", label: "Follow-ups", href: "/history", icon: Calendar },
    { id: "guidance", label: "Guidance", href: "/about", icon: Compass },
  ];

  return (
    <>
      <aside className="w-64 bg-[#f2faf9] border-r border-teal-100/80 flex flex-col justify-between p-6 hidden md:flex shrink-0 sticky top-0 h-screen overflow-y-auto selection:bg-teal-100">
        <div className="space-y-7">
          {/* 1. BRAND HEADER (Matching Screenshot) */}
          <div className="space-y-1">
            <Link href="/" className="inline-block cursor-pointer">
              <span className="text-2xl font-extrabold text-[#005c6e] tracking-tight block">
                Alaafia
              </span>
            </Link>
            <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase block">
              HEALTHCARE NAVIGATOR
            </span>
          </div>

          {/* 2. MAIN NAVIGATION LINKS */}
          <nav className="space-y-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`relative w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-[#e0f7f6] text-[#005c6e] font-bold shadow-2xs"
                      : "text-slate-600 hover:bg-[#e4f5f4] hover:text-slate-900 font-medium"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? "text-[#005c6e]" : "text-slate-400"
                    }`}
                  />
                  <span>{item.label}</span>
                  {/* Right Edge Active Accent Bar */}
                  {isActive && (
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#006666] rounded-l-full" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* 3. BOTTOM SECTION & CTAs */}
        <div className="space-y-4 pt-4 border-t border-teal-100/80 mt-auto">
          {/* + New Consultation Button (Matching Screenshot) */}
          <Link
            href="/consultation"
            className="w-full flex items-center justify-center gap-2 bg-[#00796b] hover:bg-[#005c6e] active:bg-[#004d4d] text-white font-bold text-xs py-3 px-4 rounded-xl shadow-xs hover:shadow-md transition-all text-center cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Consultation</span>
          </Link>

          {/* Bottom Action Links (Profile, Settings, Emergency Help) */}
          <div className="space-y-0.5">
            {/* Profile with dynamic user initial */}
            <Link
              href="/settings"
              className={`relative w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                currentTab === "profile"
                  ? "bg-[#e0f7f6] text-[#005c6e] font-bold"
                  : "text-slate-600 hover:bg-[#e4f5f4] hover:text-slate-900"
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-[#ea580c] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                {userInitial}
              </div>
              <span>Profile</span>
            </Link>

            {/* Settings */}
            <Link
              href="/settings"
              className={`relative w-full flex items-center gap-3.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                currentTab === "settings"
                  ? "bg-[#e0f7f6] text-[#005c6e] font-bold"
                  : "text-slate-600 hover:bg-[#e4f5f4] hover:text-slate-900"
              }`}
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Settings</span>
            </Link>

            {/* Emergency Help */}
            <Link
              href="/emergency"
              className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700 transition-all cursor-pointer"
            >
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>Emergency help</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
      />
    </>
  );
}
