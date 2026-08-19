"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Home,
  Mic,
  History,
  Bell,
  Compass,
  Plus,
  User,
  Settings,
  AlertCircle,
  ChevronRight,
  Sparkles,
  Info,
  CalendarCheck,
  Phone,
  FileText,
  Clock,
  BriefcaseMedical,
  CheckCircle2,
  X,
  Activity,
} from "lucide-react";

export default function DashboardPage() {
  // Toggle between Existing User view (with history) and New User view (empty states)
  const [isNewUser, setIsNewUser] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

  // Existing user consultation history data
  const recentConsultations = [
    {
      id: 1,
      title: "Chest pain",
      time: "Today",
      outcome: "Clinic recommended",
      outcomeColor: "bg-teal-50 text-teal-700 border-teal-200",
      icon: BriefcaseMedical,
    },
    {
      id: 2,
      title: "Headache",
      time: "Oct 12",
      outcome: "Self-care",
      outcomeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: Activity,
    },
    {
      id: 3,
      title: "Stomach discomfort",
      time: "Sep 28",
      outcome: "Pharmacy Visit",
      outcomeColor: "bg-sky-50 text-sky-700 border-sky-200",
      icon: FileText,
    },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* 1. LEFT SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between p-5 hidden md:flex shrink-0 sticky top-0 h-screen">
        <div className="space-y-8">
          {/* Logo & Category */}
          <div className="space-y-1">
            <Link href="/" className="flex items-center gap-2 cursor-pointer">
              <span className="text-2xl font-bold text-[#0e7490] tracking-tight">
                Alaafia
              </span>
            </Link>
            <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase block">
              HEALTHCARE NAVIGATOR
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <Link
              href="/dashboard"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold bg-teal-50 text-[#0e7490] border border-teal-100 shadow-xs transition-all"
            >
              <Home className="w-4 h-4 text-[#0e7490]" />
              <span>Home</span>
            </Link>
            <Link
              href="/consultation"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all"
            >
              <Mic className="w-4 h-4 text-slate-400" />
              <span>Consultation</span>
            </Link>
            <Link
              href="/how-it-works"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all"
            >
              <History className="w-4 h-4 text-slate-400" />
              <span>History</span>
            </Link>
            <a
              href="#"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all"
            >
              <Bell className="w-4 h-4 text-slate-400" />
              <span>Follow-ups</span>
            </a>
            <Link
              href="/about"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all"
            >
              <Compass className="w-4 h-4 text-slate-400" />
              <span>Guidance</span>
            </Link>
          </nav>
        </div>

        {/* Sidebar Bottom Actions */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <Link
            href="/consultation"
            className="w-full flex items-center justify-center gap-2 bg-[#0d9488] hover:bg-[#0f766e] text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Consultation</span>
          </Link>

          <div className="space-y-1">
            <button className="w-full flex items-center gap-3 px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg">
              <User className="w-4 h-4 text-slate-400" />
              <span>Profile</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg">
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Settings</span>
            </button>
            <button
              onClick={() => setIsEmergencyModalOpen(true)}
              className="w-full flex items-center gap-3 px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span>Emergency help</span>
            </button>
          </div>
        </div>
      </aside>

      {/* 2. MAIN DASHBOARD CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-slate-900">Home</h1>
            {/* View Switcher Toggle for Demo/Testing */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-medium border border-slate-200">
              <button
                onClick={() => setIsNewUser(false)}
                className={`px-3 py-1 rounded-md transition-all ${
                  !isNewUser
                    ? "bg-white text-[#0e7490] font-bold shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Existing User View
              </button>
              <button
                onClick={() => setIsNewUser(true)}
                className={`px-3 py-1 rounded-md transition-all ${
                  isNewUser
                    ? "bg-white text-[#0e7490] font-bold shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                New User View
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all relative">
              <Bell className="w-5 h-5" />
              <span className="w-2 h-2 rounded-full bg-teal-500 absolute top-2 right-2" />
            </button>
            <div className="w-9 h-9 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-sm shadow-xs cursor-pointer">
              R
            </div>
          </div>
        </header>

        {/* Main Dashboard Grid */}
        <main className="p-6 sm:p-8 space-y-8 max-w-6xl mx-auto w-full">
          {/* Greeting Header */}
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Good afternoon, Ruqayah.
            </h2>
            <p className="text-slate-500 text-sm">
              How can Alaafia help you today?
            </p>
          </div>

          {/* Grid Layout: Left Column (Hero & Consultations) vs Right Column (Guidance, Follow-ups, Emergency) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Top Left Hero Card */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6 relative overflow-hidden animate-float-slow">
                <div className="space-y-2">
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                    Not sure what to do next?
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed max-w-md">
                    Tell Alaafia what's happening in your own words, and we'll guide you to the right care.
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Link
                    href="/#consultation"
                    className="inline-flex items-center gap-2.5 bg-[#0d9488] hover:bg-[#0f766e] text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    <Mic className="w-4 h-4" />
                    Start a consultation
                  </Link>

                  <div className="w-9 h-9 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                  </div>
                </div>
              </div>

              {/* Bottom Left Recent Consultations Card */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900">
                  Recent Consultations
                </h3>

                {!isNewUser ? (
                  /* EXISTING USER VIEW (WITH HISTORY) */
                  <div className="space-y-3">
                    {recentConsultations.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/80 hover:bg-teal-50/40 border border-slate-200/60 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                            <item.icon className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                              {item.title}
                            </h4>
                            <span className="text-xs text-slate-500">
                              {item.time} • <span className="font-medium text-teal-700">{item.outcome}</span>
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    ))}

                    <div className="pt-2 text-center">
                      <button className="text-xs font-semibold text-teal-600 hover:text-teal-700 hover:underline inline-flex items-center gap-1">
                        View all history <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* NEW USER VIEW (EMPTY STATE) */
                  <div className="py-12 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center border border-slate-200">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-800">
                        No consultations yet
                      </h4>
                      <p className="text-xs text-slate-500">
                        Start your first consultation to see your history here
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Top Right: LATEST GUIDANCE */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4 relative">
                <div className="flex items-center justify-between pb-1">
                  <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                    LATEST GUIDANCE
                  </h3>
                  <Info className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-600" />
                </div>

                {!isNewUser ? (
                  /* EXISTING USER VIEW */
                  <div className="space-y-4 pt-1">
                    <div className="space-y-1">
                      <span className="text-xs text-slate-400 font-medium">
                        Today • 4:32 PM
                      </span>
                      <h4 className="text-lg font-bold text-slate-900">
                        Chest pain
                      </h4>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold border border-teal-200/60">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                      Clinic assessment recommended
                    </div>

                    <div className="pt-2">
                      <button className="w-full py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer">
                        View consultation
                      </button>
                    </div>
                  </div>
                ) : (
                  /* NEW USER VIEW (EMPTY STATE) */
                  <div className="py-8 text-center space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-300 mx-auto flex items-center justify-center border border-slate-150">
                      <FileText className="w-5 h-5" />
                    </div>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                      Your latest guidance will appear here after a consultation
                    </p>
                  </div>
                )}
              </div>

              {/* Middle Right: FOLLOW-UPS */}
              <div className="bg-sky-50/60 rounded-2xl p-6 border border-sky-100/80 shadow-xs text-center space-y-2">
                <div className="w-9 h-9 rounded-xl bg-white text-sky-600 mx-auto flex items-center justify-center border border-sky-100 shadow-2xs">
                  <CalendarCheck className="w-4.5 h-4.5" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">
                  No follow-ups right now
                </h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  You're all caught up. We'll notify you if anything changes.
                </p>
              </div>

              {/* Bottom Right: EMERGENCY ALERT CARD */}
              <div className="bg-[#fee2e2]/70 rounded-2xl p-6 border border-red-200/80 shadow-xs space-y-4">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-red-950">
                      Think this may be an emergency?
                    </h4>
                    <p className="text-xs text-red-800/90 leading-relaxed">
                      Do not wait. Access emergency protocols immediately.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsEmergencyModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 bg-[#b91c1c] hover:bg-[#991b1b] text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Get emergency help
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* FOOTER FOR CONSISTENCY */}
        <footer className="bg-white text-slate-500 text-xs py-6 border-t border-slate-200 px-6 mt-auto">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <span>© 2026 Alaafia Health</span>
            <div className="flex gap-6 text-slate-600">
              <a href="#" className="hover:text-teal-600 transition-colors">Help</a>
              <Link href="/about" className="hover:text-teal-600 transition-colors">Safety</Link>
              <a href="#" className="hover:text-teal-600 transition-colors">Privacy</a>
              <a href="#" className="hover:text-teal-600 transition-colors">Terms</a>
            </div>
          </div>
        </footer>
      </div>

      {/* EMERGENCY MODAL POPUP */}
      {isEmergencyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-red-100 shadow-2xl space-y-6 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setIsEmergencyModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold">
              <Phone className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900">
                Medical Emergency Assistance
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                If you are experiencing life-threatening symptoms (chest pain, unconsciousness, severe bleeding), call national emergency services immediately.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-center space-y-1">
              <span className="text-xs font-semibold text-red-600 uppercase tracking-widest block">
                NATIONAL EMERGENCY TOLL-FREE
              </span>
              <a
                href="tel:112"
                className="text-3xl font-extrabold text-red-700 block tracking-tight hover:underline"
              >
                112
              </a>
            </div>

            <button
              onClick={() => setIsEmergencyModalOpen(false)}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
