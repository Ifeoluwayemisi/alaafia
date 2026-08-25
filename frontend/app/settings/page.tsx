"use client";

import React, { useState, useEffect } from "react";
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
  ShieldCheck,
  ChevronRight,
  Download,
  Trash2,
  Lock,
  Phone,
  HelpCircle,
  X,
  Check,
  Globe,
  Edit3,
  LogOut,
  Sparkles,
  Shield,
  MapPin,
  Camera,
  ArrowLeft,
} from "lucide-react";
import EmergencyModal from "@/components/EmergencyModal";
import LogoutModal from "@/components/LogoutModal";
import DeleteAccountModal from "@/components/DeleteAccountModal";
import MobileNav from "@/components/MobileNav";
import Sidebar from "@/components/Sidebar";
import { useUserProfile, getStoredUserProfile, StoredUserProfile, formatNameFromEmail } from "@/lib/userUtils";

export default function SettingsPage() {
  const { profile: storedProfile, initial: userInitial, displayName, fullName: derivedFullName } = useUserProfile();
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<"settings" | "edit-profile">("settings");
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // Profile Form States
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+234 801 234 5678");
  const [location, setLocation] = useState("Lagos, Nigeria");

  // Edit Mode States
  const [editFullName, setEditFullName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editLocation, setEditLocation] = useState("");

  // Preferences
  const [consultationReminders, setConsultationReminders] = useState(true);
  const [followUpReminders, setFollowUpReminders] = useState(true);
  const [emergencyAlerts, setEmergencyAlerts] = useState(true);

  // Consultation Preferences
  const [preferredLanguage, setPreferredLanguage] = useState("English");
  const [voiceInput, setVoiceInput] = useState(true);
  const [liveTransliteration, setLiveTransliteration] = useState(false);

  useEffect(() => {
    try {
      const profile = getStoredUserProfile();
      if (profile) {
        setUserProfile(profile);
        let name = profile.fullName;
        if (!name || (name.includes("Adebayo") && !profile.email?.toLowerCase().includes("adebayo"))) {
          name = formatNameFromEmail(profile.email).fullName;
        }
        const finalName = name || derivedFullName || "User";
        const em = profile.email || "";
        const ph = profile.phone || "+234 801 234 5678";
        const loc = profile.location || "Lagos, Nigeria";

        setFullName(finalName);
        setEmail(em);
        setPhone(ph);
        setLocation(loc);

        setEditFullName(finalName);
        setEditEmail(em);
        setEditPhone(ph);
        setEditLocation(loc);
      } else if (derivedFullName) {
        setFullName(derivedFullName);
        setEditFullName(derivedFullName);
      }
    } catch (e) {}
  }, [derivedFullName]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleStartEditProfile = () => {
    setEditFullName(fullName);
    setEditEmail(email);
    setEditPhone(phone);
    setEditLocation(location);
    setViewMode("edit-profile");
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFullName(editFullName);
      setEmail(editEmail);
      setPhone(editPhone);
      setLocation(editLocation);

      const updatedUser: StoredUserProfile = {
        ...userProfile,
        firstName: editFullName.split(" ")[0] || editFullName,
        lastName: editFullName.split(" ").slice(1).join(" ") || "",
        fullName: editFullName,
        email: editEmail,
        phone: editPhone,
        location: editLocation,
      };
      localStorage.setItem("alaafia_user", JSON.stringify(updatedUser));
      setUserProfile(updatedUser);
      setViewMode("settings");
      showToast("Profile details updated successfully!");

      // Dispatch event to sync all other components
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("storage"));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadData = () => {
    const data = {
      profile: {
        fullName,
        email,
        phone,
        location,
        preferredLanguage,
      },
      preferences: {
        consultationReminders,
        followUpReminders,
        emergencyAlerts,
        voiceInput,
        liveTransliteration,
      },
      consultations: JSON.parse(
        localStorage.getItem("alaafia_saved_consultations") || "[]"
      ),
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Alaafia_Health_Data_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Health data archive downloaded!");
  };

  const handleDeleteAccount = () => {
    try {
      localStorage.removeItem("alaafia_user");
      localStorage.removeItem("alaafia_saved_consultations");
      localStorage.removeItem("alaafia_is_new_user");
      sessionStorage.clear();
      window.location.href = "/";
    } catch (e) {
      window.location.href = "/";
    }
  };

  const handleSignOutAll = () => {
    try {
      localStorage.removeItem("alaafia_user");
      localStorage.removeItem("alaafia_is_new_user");
      sessionStorage.clear();
      window.location.href = "/";
    } catch (e) {
      window.location.href = "/";
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-teal-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. LEFT SIDEBAR NAVIGATION (CONSISTENT ACROSS ALL PAGES) */}
      <Sidebar activeTab="settings" />

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* ========================================================================= */}
        {/* VIEW 1: EDIT PROFILE SCREEN (FIGMA EXACT DESIGN MATCH)                     */}
        {/* ========================================================================= */}
        {viewMode === "edit-profile" ? (
          <main className="p-6 sm:p-10 space-y-6 max-w-4xl mx-auto w-full flex-1 animate-in fade-in duration-200">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <button
                onClick={() => setViewMode("settings")}
                className="hover:text-slate-900 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>← Settings</span>
              </button>
              <span className="text-slate-300">/</span>
              <span className="text-[#006666] font-bold">Edit Profile</span>
            </div>

            {/* Page Title */}
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Edit Profile
            </h2>

            {/* Main Form Card Container */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm max-w-2xl space-y-6">
              {/* Profile Avatar & Subtitle */}
              <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-teal-700 via-[#006666] to-teal-500 text-white font-bold text-2xl flex items-center justify-center shadow-md border-2 border-white">
                    {userInitial}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#006666] text-white flex items-center justify-center shadow-xs border-2 border-white cursor-pointer hover:bg-teal-700 transition-colors">
                    <Camera className="w-3 h-3" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {editFullName || fullName}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Update your photo and personal details here.
                  </p>
                </div>
              </div>

              {/* 2x2 Form Input Grid */}
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Field 1: Full Name */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 block">Full Name</label>
                    <input
                      type="text"
                      value={editFullName}
                      onChange={(e) => setEditFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#006666] focus:border-transparent font-medium text-slate-900 shadow-2xs"
                      required
                    />
                  </div>

                  {/* Field 2: Email Address */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 block">Email Address</label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#006666] focus:border-transparent font-medium text-slate-900 shadow-2xs"
                      required
                    />
                  </div>

                  {/* Field 3: Phone Number */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 block">Phone Number</label>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="+234 801 234 5678"
                      className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#006666] focus:border-transparent font-medium text-slate-900 shadow-2xs"
                    />
                  </div>

                  {/* Field 4: Location */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 block">Location</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                      <input
                        type="text"
                        value={editLocation}
                        onChange={(e) => setEditLocation(e.target.value)}
                        placeholder="Lagos, Nigeria"
                        className="w-full pl-9 pr-3 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#006666] focus:border-transparent font-medium text-slate-900 shadow-2xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom Form Actions (Cancel & Save changes) */}
                <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setViewMode("settings")}
                    className="px-5 py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white text-slate-700 text-xs font-bold transition-all hover:bg-slate-50 cursor-pointer shadow-2xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#006666] hover:bg-[#004d4d] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                  >
                    Save changes
                  </button>
                </div>
              </form>
            </div>
          </main>
        ) : (
          /* ========================================================================= */
          /* VIEW 2: MAIN SETTINGS DASHBOARD (FIGMA EXACT DESIGN MATCH)                */
          /* ========================================================================= */
          <>
            {/* Top Header */}
            <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
              <div className="space-y-0.5">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Settings
                </h1>
                <p className="text-xs text-slate-500 font-medium hidden sm:block">
                  Manage your account, privacy and Alaafia preferences.
                </p>
              </div>

              <div className="flex items-center gap-4">
                <button className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all relative">
                  <Bell className="w-5 h-5" />
                </button>
                <div
                  suppressHydrationWarning
                  title={fullName}
                  className="w-9 h-9 rounded-full bg-[#006666] text-white font-bold flex items-center justify-center text-sm shadow-xs cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <span suppressHydrationWarning>{userInitial}</span>
                </div>
              </div>
            </header>

            {/* Main Settings Grid */}
            <main className="p-4 sm:p-8 space-y-6 max-w-5xl mx-auto w-full flex-1 animate-in fade-in duration-200 pb-24 sm:pb-8">
              {/* Top Profile Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div suppressHydrationWarning className="w-16 h-16 rounded-full bg-gradient-to-tr from-teal-700 via-[#006666] to-teal-500 text-white font-bold text-2xl flex items-center justify-center shadow-md border-2 border-white shrink-0">
                    <span suppressHydrationWarning>{userInitial}</span>
                  </div>
                  <div className="space-y-1">
                    <h3 suppressHydrationWarning className="text-lg sm:text-xl font-extrabold text-slate-900">
                      {fullName}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {email}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleStartEditProfile}
                  className="self-start sm:self-auto px-5 py-2 rounded-full border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                >
                  Edit profile
                </button>
              </div>

              {/* 2x2 Grid of Settings Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Card 1: Personal Information */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-slate-900">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-[#006666]" />
                      <h4 className="text-sm font-bold">Personal Information</h4>
                    </div>
                    <button
                      onClick={handleStartEditProfile}
                      className="text-[11px] font-bold text-[#006666] hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>

                  <div className="space-y-3.5 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-500 font-medium">Full Name</span>
                      <span className="font-semibold text-slate-900">{fullName}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-500 font-medium">Email Address</span>
                      <span className="font-semibold text-slate-900">{email}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-500 font-medium">Phone Number</span>
                      <span className="font-semibold text-slate-900">{phone}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-500 font-medium">Location</span>
                      <span className="font-semibold text-slate-900">{location}</span>
                    </div>
                  </div>
                </div>

                {/* Card 2: Notifications */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-900">
                    <Bell className="w-4 h-4 text-[#006666]" />
                    <h4 className="text-sm font-bold">Notifications</h4>
                  </div>

                  <div className="space-y-3.5 text-xs">
                    {/* Consultation reminders */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-slate-800">Consultation reminders</span>
                      <button
                        type="button"
                        onClick={() => {
                          setConsultationReminders(!consultationReminders);
                          showToast(`Consultation reminders ${!consultationReminders ? "enabled" : "disabled"}`);
                        }}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                          consultationReminders ? "bg-[#006666]" : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                            consultationReminders ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Follow-up reminders */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-slate-800">Follow-up reminders</span>
                      <button
                        type="button"
                        onClick={() => {
                          setFollowUpReminders(!followUpReminders);
                          showToast(`Follow-up reminders ${!followUpReminders ? "enabled" : "disabled"}`);
                        }}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                          followUpReminders ? "bg-[#006666]" : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                            followUpReminders ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Emergency alerts */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-medium text-slate-800 flex items-center gap-1.5">
                          <span>Emergency alerts</span>
                          <Lock className="w-3 h-3 text-slate-400" />
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Always on for your safety
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEmergencyAlerts(!emergencyAlerts)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                          emergencyAlerts ? "bg-red-500" : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                            emergencyAlerts ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card 3: Consultation Preferences */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-900">
                    <Mic className="w-4 h-4 text-[#006666]" />
                    <h4 className="text-sm font-bold">Consultation Preferences</h4>
                  </div>

                  <div className="space-y-3.5 text-xs">
                    {/* Preferred language */}
                    <div
                      onClick={() => setIsLanguageModalOpen(true)}
                      className="flex items-center justify-between gap-2 cursor-pointer hover:bg-slate-50 p-1.5 -mx-1.5 rounded-xl transition-colors"
                    >
                      <span className="font-medium text-slate-800">Preferred language</span>
                      <span className="font-bold text-[#006666] flex items-center gap-1">
                        <span>{preferredLanguage}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>

                    {/* Voice input */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-slate-800">Voice input</span>
                      <button
                        type="button"
                        onClick={() => {
                          setVoiceInput(!voiceInput);
                          showToast(`Voice input ${!voiceInput ? "enabled" : "disabled"}`);
                        }}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                          voiceInput ? "bg-[#006666]" : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                            voiceInput ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Live transliteration */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-slate-800">Live transliteration</span>
                      <button
                        type="button"
                        onClick={() => {
                          setLiveTransliteration(!liveTransliteration);
                          showToast(`Live transliteration ${!liveTransliteration ? "enabled" : "disabled"}`);
                        }}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                          liveTransliteration ? "bg-[#006666]" : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                            liveTransliteration ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card 4: Privacy & Data */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-900">
                    <ShieldCheck className="w-4 h-4 text-[#006666]" />
                    <h4 className="text-sm font-bold">Privacy & Data</h4>
                  </div>

                  <div className="space-y-3.5 text-xs">
                    {/* Manage data */}
                    <div
                      onClick={handleDownloadData}
                      className="flex items-center justify-between gap-2 cursor-pointer hover:bg-slate-50 p-1.5 -mx-1.5 rounded-xl transition-colors"
                    >
                      <span className="font-medium text-slate-800">Manage data</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>

                    {/* Download my data */}
                    <div
                      onClick={handleDownloadData}
                      className="flex items-center justify-between gap-2 cursor-pointer hover:bg-slate-50 p-1.5 -mx-1.5 rounded-xl transition-colors"
                    >
                      <span className="font-medium text-slate-800">Download my data</span>
                      <Download className="w-3.5 h-3.5 text-slate-500" />
                    </div>

                    {/* Delete account */}
                    <div
                      onClick={() => setIsDeleteModalOpen(true)}
                      className="flex items-center justify-between gap-2 cursor-pointer hover:bg-red-50 p-1.5 -mx-1.5 rounded-xl transition-colors text-red-600"
                    >
                      <span className="font-bold">Delete account</span>
                      <Trash2 className="w-3.5 h-3.5 text-red-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Center Action: Sign out of all devices */}
              <div className="text-center pt-4 pb-2">
                <button
                  onClick={() => setIsLogoutModalOpen(true)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  Sign out of all devices
                </button>
              </div>
            </main>
          </>
        )}

        {/* Footer */}
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

      {/* 3. LOG OUT CONFIRMATION MODAL (FIGMA MATCH) */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
      />

      {/* 4. PREFERRED LANGUAGE SELECTOR MODAL */}
      {isLanguageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-slate-900">Preferred Language</h3>
              <button
                onClick={() => setIsLanguageModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {["English", "Yoruba", "Hausa", "Igbo", "Nigerian Pidgin"].map((lang) => (
                <div
                  key={lang}
                  onClick={() => {
                    setPreferredLanguage(lang);
                    setIsLanguageModalOpen(false);
                    showToast(`Language set to ${lang}`);
                  }}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    preferredLanguage === lang
                      ? "border-[#006666] bg-teal-50 text-[#006666] font-bold"
                      : "border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <span>{lang}</span>
                  {preferredLanguage === lang && <Check className="w-4 h-4 text-[#006666]" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. DELETE ACCOUNT CONFIRMATION MODAL (FIGMA MATCH) */}
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />

      {/* Emergency Modal */}
      <EmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
      />

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
}
