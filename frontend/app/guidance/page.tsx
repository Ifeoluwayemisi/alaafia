"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Compass,
  Droplets,
  Heart,
  Activity,
  ShieldAlert,
  Apple,
  Moon,
  Sparkles,
  Search,
  CheckCircle2,
  ChevronRight,
  Bookmark,
  Share2,
  Phone,
  Flame,
  Check,
  Plus,
  AlertTriangle,
  Info,
  Bell,
  Stethoscope,
  Smile,
  Zap,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import { useUserProfile } from "@/lib/userUtils";

interface GuidanceCard {
  id: string;
  category: "habits" | "emergency" | "nutrition" | "chronic" | "sleep";
  categoryLabel: string;
  title: string;
  summary: string;
  keyPoints: string[];
  importance: "Essential" | "Daily Habit" | "Emergency Protocol" | "Prevention";
  badgeColor: string;
  icon: any;
}

const guidanceData: GuidanceCard[] = [
  {
    id: "g-1",
    category: "habits",
    categoryLabel: "Hydration & Metabolism",
    title: "Drink at least 5 to 8 cups of water daily",
    summary:
      "Adequate daily hydration regulates body temperature, prevents kidney stones, lubricates joints, and prevents tension headaches.",
    keyPoints: [
      "Drink 1-2 cups of water immediately upon waking up.",
      "Carry a reusable bottle to sip throughout the day rather than chugging all at once.",
      "Increase intake during hot weather or physical exertion in tropical climates.",
    ],
    importance: "Daily Habit",
    badgeColor: "bg-cyan-50 text-cyan-800 border-cyan-200",
    icon: Droplets,
  },
  {
    id: "g-2",
    category: "nutrition",
    categoryLabel: "Dietary Health",
    title: "Cut down on refined sugars and sweetened drinks",
    summary:
      "Excess refined sugar spikes blood glucose, drives chronic inflammation, and sharply increases risk of Type 2 diabetes and hypertension.",
    keyPoints: [
      "Swap carbonated soda and energy drinks for infused water, unsweetened zobo, or herbal teas.",
      "Check packaged food labels for hidden sugars (sucrose, high-fructose corn syrup, dextrose).",
      "Satisfy sweet cravings with whole fruits like oranges, apples, and watermelon that provide fiber.",
    ],
    importance: "Prevention",
    badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
    icon: Apple,
  },
  {
    id: "g-3",
    category: "emergency",
    categoryLabel: "Emergency First Aid",
    title: "Emergency Stroke Recognition: Remember F.A.S.T.",
    summary:
      "Stroke is a medical emergency where every minute counts. Rapid hospital transit saves brain function.",
    keyPoints: [
      "F - Face Drooping: Ask the person to smile. Does one side of the face droop?",
      "A - Arm Weakness: Ask the person to raise both arms. Does one drift downward?",
      "S - Speech Difficulty: Is their speech slurred, strange, or unable to be understood?",
      "T - Time to Call 112: Call emergency services or rush to the nearest emergency room immediately.",
    ],
    importance: "Emergency Protocol",
    badgeColor: "bg-red-50 text-red-800 border-red-200",
    icon: ShieldAlert,
  },
  {
    id: "g-4",
    category: "emergency",
    categoryLabel: "Emergency First Aid",
    title: "Immediate Burn Management Protocol",
    summary:
      "Correct first-aid in the first 5 minutes significantly reduces tissue damage and scarring.",
    keyPoints: [
      "Cool the burn immediately under cold, gentle running water for 20 full minutes.",
      "NEVER apply butter, palm oil, toothpaste, raw eggs, or ice directly onto burned skin.",
      "Cover loosely with clean, lint-free plastic wrap or sterile bandage and seek medical evaluation.",
    ],
    importance: "Emergency Protocol",
    badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
    icon: Flame,
  },
  {
    id: "g-5",
    category: "sleep",
    categoryLabel: "Rest & Recovery",
    title: "Maintain 7–8 hours of consistent, restorative sleep",
    summary:
      "Sleep is the biological repair mechanism for cardiovascular health, immune defenses, and emotional regulation.",
    keyPoints: [
      "Keep a consistent bedtime and wake-up time, even on weekends.",
      "Avoid bright phone and television screens 45 minutes before sleep.",
      "Keep the bedroom dark, quiet, and well-ventilated.",
    ],
    importance: "Essential",
    badgeColor: "bg-purple-50 text-purple-800 border-purple-200",
    icon: Moon,
  },
  {
    id: "g-6",
    category: "chronic",
    categoryLabel: "Cardiovascular Health",
    title: "Check blood pressure and limit daily salt intake",
    summary:
      "Hypertension is known as the 'silent killer' because it rarely shows early symptoms until severe complications arise.",
    keyPoints: [
      "Check your blood pressure at least once every 3–6 months at any local pharmacy.",
      "Keep sodium intake under 2,000mg (1 teaspoon of salt) per day across all meals.",
      "Engage in at least 30 minutes of moderate aerobic activity (brisk walking, cycling) 5 days a week.",
    ],
    importance: "Prevention",
    badgeColor: "bg-teal-50 text-teal-800 border-teal-200",
    icon: Heart,
  },
];

export default function GuidancePage() {
  const { profile: userProfile, initial: userInitial, displayName } = useUserProfile();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>("g-1");
  const [toastMsg, setToastMsg] = useState("");
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Interactive Water Glass Tracker (Goal: 8 glasses)
  const [waterCups, setWaterCups] = useState(3);

  // Daily Habits Checklist State
  const [completedHabits, setCompletedHabits] = useState<{ [key: string]: boolean }>({
    h1: true,
    h2: false,
    h3: true,
    h4: false,
  });

  useEffect(() => {
    try {
      const storedBookmarks = localStorage.getItem("alaafia_guidance_bookmarks");
      if (storedBookmarks) {
        setBookmarkedIds(JSON.parse(storedBookmarks));
      }

      const storedWater = localStorage.getItem("alaafia_water_cups");
      if (storedWater) {
        setWaterCups(Number(storedWater));
      }
    } catch {}
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const toggleBookmark = (id: string) => {
    let updated: string[];
    if (bookmarkedIds.includes(id)) {
      updated = bookmarkedIds.filter((b) => b !== id);
      showToast("Guidance removed from bookmarks.");
    } else {
      updated = [...bookmarkedIds, id];
      showToast("Guidance saved to bookmarks.");
    }
    setBookmarkedIds(updated);
    localStorage.setItem("alaafia_guidance_bookmarks", JSON.stringify(updated));
  };

  const handleWaterClick = (cupIndex: number) => {
    const newCount = cupIndex + 1 === waterCups ? cupIndex : cupIndex + 1;
    setWaterCups(newCount);
    localStorage.setItem("alaafia_water_cups", String(newCount));
    if (newCount === 8) {
      showToast("🎉 Excellent! You reached your 8-cup daily water goal!");
    }
  };

  const toggleHabit = (key: string) => {
    setCompletedHabits((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const filteredData = guidanceData.filter((item) => {
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === "" ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.keyPoints.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const habitsCompletedCount = Object.values(completedHabits).filter(Boolean).length;
  const habitPercentage = Math.round((habitsCompletedCount / 4) * 100);

  return (
    <div className="flex min-h-screen bg-[#f7fcfc] font-sans text-slate-800">
      {/* 1. SIDEBAR NAVIGATION */}
      <Sidebar activeTab="guidance" />

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        {/* HEADER BAR */}
        <header className="h-16 bg-white border-b border-teal-100/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          {/* Breadcrumbs Navigation */}
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="text-[#006666] font-semibold flex items-center gap-1">
              <Compass className="w-3.5 h-3.5" /> Guidance Hub
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-800 font-bold">Health Advice & First Aid</span>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3 sm:gap-4 relative">
            <button
              type="button"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              aria-label="Notifications"
              className="relative p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 animate-scale-in">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-800">Health Guidance Updates</span>
                  <button
                    type="button"
                    onClick={() => setIsNotificationsOpen(false)}
                    className="text-[10px] text-teal-600 font-bold hover:underline cursor-pointer"
                  >
                    Close
                  </button>
                </div>
                <div className="py-2 text-xs text-slate-600 space-y-2">
                  <div className="p-2.5 rounded-xl bg-teal-50 text-teal-900">
                    <p className="font-bold">Daily Wellness Goal Active</p>
                    <p className="text-[11px] text-teal-700 mt-0.5">
                      You are {waterCups}/8 cups towards your daily hydration goal.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Consistent User Profile Avatar */}
            <Link
              href="/settings"
              suppressHydrationWarning
              title={`Logged in as ${displayName} — Open Settings`}
              className="w-9 h-9 rounded-full bg-[#006666] text-white font-bold flex items-center justify-center text-sm shadow-xs hover:ring-2 hover:ring-teal-400 transition-all cursor-pointer"
            >
              <span suppressHydrationWarning>{userInitial}</span>
            </Link>
          </div>
        </header>

        {/* TOAST MESSAGE */}
        {toastMsg && (
          <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl text-xs font-semibold flex items-center gap-2 animate-slide-up">
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* MAIN BODY */}
        <main className="p-4 sm:p-8 max-w-6xl mx-auto w-full space-y-8 animate-fade-in pb-24 sm:pb-8">
          {/* Top Hero Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#005c6e] to-[#007e88] text-white p-6 sm:p-8 shadow-md">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 max-w-2xl space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-bold uppercase tracking-wider text-teal-100">
                <Sparkles className="w-3.5 h-3.5 text-teal-200" /> Clinical Wellness & Safety
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Daily Health Guidance & Emergency Tips
              </h1>
              <p className="text-teal-50 text-xs sm:text-sm leading-relaxed">
                Evidence-backed daily preventive habits, nutritional guardrails, and essential emergency first-aid protocols to keep you and your family safe.
              </p>
            </div>
          </div>

          {/* 2-Column Section: Interactive Daily Trackers & Tip of the Day */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT: Interactive Hydration & Habit Check (7 Cols) */}
            <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Daily Hydration Tracker</h3>
                    <p className="text-[11px] text-slate-500">Tap glasses to track your water intake</p>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-[#006666] bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100">
                  {waterCups} / 8 Cups ({(waterCups * 0.3).toFixed(1)}L)
                </span>
              </div>

              {/* 8 Interactive Water Cup Buttons */}
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
                {[0, 1, 2, 3, 4, 5, 6, 7].map((idx) => {
                  const isFilled = idx < waterCups;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleWaterClick(idx)}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer ${
                        isFilled
                          ? "bg-cyan-500 text-white border-cyan-600 shadow-xs scale-102"
                          : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-cyan-50/50"
                      }`}
                    >
                      <Droplets className={`w-5 h-5 ${isFilled ? "fill-white text-white" : ""}`} />
                      <span className="text-[10px] font-bold mt-1">#{idx + 1}</span>
                    </button>
                  );
                })}
              </div>

              {/* Daily Wellness Checklist */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Daily Health Habits Progress</span>
                  <span className="text-[#006666]">{habitPercentage}% Completed</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#007e88] transition-all duration-500 rounded-full"
                    style={{ width: `${habitPercentage}%` }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {[
                    { key: "h1", text: "Drank 5+ cups of clean water" },
                    { key: "h2", text: "Avoided sugary snacks & sodas" },
                    { key: "h3", text: "15 min physical movement" },
                    { key: "h4", text: "7+ hours of quality sleep" },
                  ].map((habit) => (
                    <button
                      key={habit.key}
                      type="button"
                      onClick={() => toggleHabit(habit.key)}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left text-xs font-medium transition-all cursor-pointer ${
                        completedHabits[habit.key]
                          ? "bg-teal-50/80 border-teal-200 text-teal-900 font-bold"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                          completedHabits[habit.key]
                            ? "bg-[#006666] border-[#006666] text-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {completedHabits[habit.key] && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span>{habit.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT: Quick SOS / Voice Consultation Card (5 Cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Emergency Protocol Direct CTA */}
              <div className="bg-[#fee2e2]/70 border border-red-200/80 rounded-3xl p-6 shadow-2xs space-y-3">
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="w-5 h-5 text-red-600" />
                  <h3 className="text-sm font-bold text-red-950">Immediate Life-Threatening Emergency?</h3>
                </div>
                <p className="text-xs text-red-800 leading-relaxed">
                  Do not wait for reading guides. Connect directly to national emergency lines (112 / 767) or open full emergency triage.
                </p>
                <Link
                  href="/emergency"
                  className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 active:scale-98 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Open Emergency Mode (112)</span>
                </Link>
              </div>

              {/* Speak with AI Doctor Card */}
              <div className="bg-[#e0f7f6]/80 border border-teal-200/80 rounded-3xl p-6 shadow-2xs space-y-3">
                <div className="flex items-center gap-2.5">
                  <Stethoscope className="w-5 h-5 text-[#006666]" />
                  <h3 className="text-sm font-bold text-slate-900">Have specific health symptoms?</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Speak in your dialect to get real-time symptom understanding and safe hospital routing.
                </p>
                <Link
                  href="/consultation"
                  className="w-full py-2.5 px-4 bg-[#007e88] hover:bg-[#006b73] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <span>Start Voice Consultation</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Filter Tabs & Search Bar */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto w-full pb-1">
                {[
                  { id: "all", label: "All Guidelines" },
                  { id: "habits", label: "💧 Daily Habits" },
                  { id: "nutrition", label: "🥗 Nutrition" },
                  { id: "emergency", label: "🚨 First Aid" },
                  { id: "chronic", label: "❤️ Heart & BP" },
                  { id: "sleep", label: "🌙 Rest & Sleep" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSelectedCategory(tab.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      selectedCategory === tab.id
                        ? "bg-[#006666] text-white shadow-xs"
                        : "bg-white hover:bg-slate-100 text-slate-600 border border-slate-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-72 shrink-0">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search advice, water, burns..."
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#007e88]"
                />
              </div>
            </div>

            {/* Guidance Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredData.map((card) => {
                const Icon = card.icon;
                const isBookmarked = bookmarkedIds.includes(card.id);
                const isExpanded = expandedId === card.id;

                return (
                  <div
                    key={card.id}
                    className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-4 hover:shadow-sm transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Card Top Meta */}
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${card.badgeColor}`}>
                          {card.categoryLabel}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => toggleBookmark(card.id)}
                            title={isBookmarked ? "Remove Bookmark" : "Save Bookmark"}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              isBookmarked
                                ? "bg-teal-50 border-teal-200 text-[#006666]"
                                : "border-slate-200 text-slate-400 hover:text-slate-700"
                            }`}
                          >
                            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? "fill-[#006666]" : ""}`} />
                          </button>
                        </div>
                      </div>

                      {/* Title & Summary */}
                      <div className="space-y-1.5">
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700 shrink-0 mt-0.5">
                            <Icon className="w-4 h-4 text-[#006666]" />
                          </div>
                          <h3 className="text-base font-bold text-slate-900 leading-snug">
                            {card.title}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed pl-10.5">
                          {card.summary}
                        </p>
                      </div>

                      {/* Action Key Points List */}
                      <div className="bg-slate-50/80 rounded-2xl p-4 space-y-2 border border-slate-100/80">
                        <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                          Key Clinical Recommendations
                        </span>
                        <ul className="space-y-1.5 text-xs text-slate-700">
                          {card.keyPoints.map((pt, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <Check className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                              <span>{pt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
                      <span className="text-[11px] font-semibold text-slate-500">
                        Priority: <strong className="text-slate-800">{card.importance}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => showToast(`Sharing tip: "${card.title}"`)}
                        className="text-[11px] font-bold text-teal-700 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Share2 className="w-3 h-3" /> Share Tip
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION */}
      <MobileNav />
    </div>
  );
}
