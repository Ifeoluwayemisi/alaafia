"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Shield,
  ShieldCheck,
  CreditCard,
  Wallet,
  Sliders,
  Check,
  X,
  Lock,
  Landmark,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Bell,
  Sparkles,
  Info,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import { useUserProfile } from "@/lib/userUtils";

export default function ConnectWemaPage() {
  const router = useRouter();

  // Navigation / View States: "intro" | "form" | "success"
  const [viewState, setViewState] = useState<"intro" | "form" | "success">("intro");

  // Form Fields
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [bvnPhone, setBvnPhone] = useState("");
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Details Modal state
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // User Profile
  const { profile: userProfile, initial: userInitial, displayName } = useUserProfile();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    try {
      if (userProfile?.fullName) {
        setAccountName(userProfile.fullName);
      } else if (userProfile?.firstName) {
        setAccountName(`${userProfile.firstName} ${userProfile.lastName || ""}`.trim());
      }

      if (userProfile?.phone) {
        setBvnPhone(userProfile.phone);
      }

      // Check if already connected previously
      const isConnected = localStorage.getItem("alaafia_wema_connected");
      const storedAcct = localStorage.getItem("alaafia_wema_account_number");
      const storedName = localStorage.getItem("alaafia_wema_account_name");

      if (storedAcct) setAccountNumber(storedAcct);
      if (storedName) setAccountName(storedName);

      // If user came to view connected account directly
      const urlParams = new URLSearchParams(window.location.search);
      if (isConnected === "true" && urlParams.get("view") === "status") {
        setViewState("success");
      }
    } catch (e) {
      console.error(e);
    }
  }, [userProfile]);

  // Account number format & name resolve simulation
  const handleAccountNumberChange = (val: string) => {
    const cleaned = val.replace(/\D/g, "").slice(0, 10);
    setAccountNumber(cleaned);
    if (errorMessage) setErrorMessage("");

    if (cleaned.length === 10) {
      // Auto-resolve account name from user profile if available, or keep existing/manual input
      if (!accountName || accountName.trim() === "") {
        if (userProfile?.fullName) {
          setAccountName(userProfile.fullName.toUpperCase());
        } else if (userProfile?.firstName) {
          setAccountName(`${userProfile.firstName} ${userProfile.lastName || ""}`.trim().toUpperCase());
        }
      }
    }
  };

  // Submit and Save Wema Details
  const handleSaveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (accountNumber.length !== 10) {
      setErrorMessage("Please enter a valid 10-digit Wema Bank / ALAT account number.");
      return;
    }

    if (!termsAccepted) {
      setErrorMessage("Please authorize Alaafia to access emergency healthcare funds.");
      return;
    }

    setIsAuthorizing(true);

    setTimeout(() => {
      try {
        localStorage.setItem("alaafia_wema_connected", "true");
        localStorage.setItem("alaafia_wema_account_number", accountNumber);
        localStorage.setItem("alaafia_wema_account_name", accountName);
        localStorage.setItem("alaafia_wema_balance", "30000");
        localStorage.setItem("alaafia_care_balance", "30000");

        // Notify other windows/components
        window.dispatchEvent(new Event("storage"));
      } catch (err) {}

      setIsAuthorizing(false);
      setViewState("success");
    }, 1200);
  };

  return (
    <div className="flex min-h-screen bg-[#f7fcfc] font-sans text-slate-800">
      {/* 1. SIDEBAR */}
      <Sidebar activeTab="care-support" />

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        {/* HEADER BAR */}
        <header className="h-16 bg-white border-b border-teal-100/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          {/* Breadcrumbs Navigation */}
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium overflow-x-auto whitespace-nowrap py-1">
            <Link
              href="/care-support"
              className="text-[#006666] font-semibold hover:underline flex items-center gap-1"
            >
              Care Support
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-800 font-bold">Connect Wema</span>
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
                  <span className="text-xs font-bold text-slate-800">Security & Banking Notice</span>
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
                    <p className="font-bold">Wema Bank & ALAT Integration</p>
                    <p className="text-[11px] text-teal-700 mt-0.5">
                      Direct hospital release funds are secured with 256-bit AES encryption.
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

        {/* MAIN PAGE BODY */}
        <main className="p-4 sm:p-8 max-w-5xl mx-auto w-full flex-1 flex flex-col justify-center animate-fade-in pb-24 sm:pb-8">
          {/* ========================================================================= */}
          {/* VIEW 1: INTRO / CONFIRMATION VIEW (Matching Figma Screenshot 1)          */}
          {/* ========================================================================= */}
          {viewState === "intro" && (
            <div className="space-y-6">
              {/* Page Title & Subtitle */}
              <div className="space-y-1.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                  Connect your Wema account.
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
                  Connect your eligible Wema account to manage your healthcare emergency fund through Alaafia.
                </p>
              </div>

              {/* Two-Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* LEFT CARD: Connect Securely */}
                <div className="lg:col-span-6 bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
                  {/* Top Card & Shield Graphic */}
                  <div className="w-24 h-12 rounded-2xl bg-[#e0f7f6] flex items-center justify-center gap-2 border border-teal-100">
                    <div className="w-7 h-5 rounded-md bg-white border border-teal-200 flex items-center justify-center shadow-2xs">
                      <CreditCard className="w-3.5 h-3.5 text-[#006666]" />
                    </div>
                    <span className="text-xs text-teal-600 font-bold">⇄</span>
                    <div className="w-7 h-5 rounded-md bg-[#006666] flex items-center justify-center shadow-2xs text-white">
                      <Shield className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Card Title */}
                  <h2 className="text-xl font-bold text-slate-900">Connect securely</h2>

                  {/* Feature Bullets */}
                  <div className="space-y-5">
                    {/* Bullet 1: View Balance */}
                    <div className="flex items-start gap-3.5">
                      <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#006666] shrink-0 mt-0.5">
                        <Wallet className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-slate-900">View balance</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Check your emergency fund balance directly within Alaafia.
                        </p>
                      </div>
                    </div>

                    {/* Bullet 2: Use Funds */}
                    <div className="flex items-start gap-3.5">
                      <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#006666] shrink-0 mt-0.5">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-slate-900">Use funds</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Seamlessly pay for approved medical consultations and services.
                        </p>
                      </div>
                    </div>

                    {/* Bullet 3: Manage Connection */}
                    <div className="flex items-start gap-3.5">
                      <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#006666] shrink-0 mt-0.5">
                        <Sliders className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-slate-900">Manage connection</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          You can disconnect your account at any time from your settings.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setViewState("form")}
                      className="w-full sm:flex-1 py-3 px-5 bg-[#007e88] hover:bg-[#006b73] active:scale-98 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>Connect Wema account</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => router.push("/care-support")}
                      className="w-full sm:w-auto py-3 px-6 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer text-center"
                    >
                      Not now
                    </button>
                  </div>
                </div>

                {/* RIGHT COLUMN: Protection & Permissions Info */}
                <div className="lg:col-span-6 space-y-4">
                  {/* Top Box: Your account stays protected */}
                  <div className="bg-[#e0f7f6]/70 border border-teal-200/80 rounded-3xl p-6 shadow-2xs flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-[#006666] text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                        Your account stays protected
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        We use bank-level encryption. Alaafia cannot transfer funds without your explicit authorization per transaction.
                      </p>
                    </div>
                  </div>

                  {/* Bottom Grid: Access & Safety Lists */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Left Box: What will Alaafia access? */}
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-3">
                      <h4 className="text-xs font-bold text-slate-900">
                        What will Alaafia access?
                      </h4>
                      <ul className="space-y-2 text-xs text-slate-600">
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span>Account holder name</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span>Account balance</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span>Healthcare-related transactions</span>
                        </li>
                      </ul>
                    </div>

                    {/* Right Box: What Alaafia will NOT ask you for */}
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-3">
                      <h4 className="text-xs font-bold text-slate-900">
                        What Alaafia will NOT ask you for
                      </h4>
                      <ul className="space-y-2 text-xs text-slate-600">
                        <li className="flex items-center gap-2 text-slate-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                          <span>Your full banking password</span>
                        </li>
                        <li className="flex items-center gap-2 text-slate-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                          <span>Your PIN</span>
                        </li>
                        <li className="flex items-center gap-2 text-slate-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                          <span>Full debit card details</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 2: ACCOUNT DETAILS FORM (Step 2 of Flow)                            */}
          {/* ========================================================================= */}
          {viewState === "form" && (
            <div className="max-w-xl mx-auto w-full bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-scale-in">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[#006666] flex items-center justify-center border border-teal-100 font-bold">
                    <Landmark className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Enter Wema Account Details</h2>
                    <p className="text-xs text-slate-500">
                      Link your Wema Bank or ALAT account for emergency health funds
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setViewState("intro")}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSaveDetails} className="space-y-4">
                {/* Bank Provider */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Bank / Financial Institution</label>
                  <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800">
                    <span className="flex items-center gap-2">
                      <Landmark className="w-4 h-4 text-purple-700" />
                      Wema Bank / ALAT Digital
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      Direct Partner
                    </span>
                  </div>
                </div>

                {/* Account Number (10 digits) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex justify-between">
                    <span>NUBAN Account Number</span>
                    <span className="text-[10px] text-slate-400 font-normal">10 digits</span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={accountNumber}
                    onChange={(e) => handleAccountNumberChange(e.target.value)}
                    placeholder="e.g. 0123456789"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#007e88] font-medium tracking-wide"
                  />
                </div>

                {/* Resolved Account Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>Account Holder Name</span>
                    {accountNumber.length === 10 && (
                      <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="e.g. Enter account holder name"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#007e88] font-medium bg-slate-50/60 text-slate-900"
                  />
                </div>

                {/* Pre-allocated Emergency Fund Value */}
                <div className="p-3.5 rounded-2xl bg-teal-50/80 border border-teal-200/70 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block">
                      Emergency Health Balance
                    </span>
                    <p className="text-xs text-slate-600">Initial standby reserve available</p>
                  </div>
                  <span className="text-sm font-extrabold text-[#006666]">₦30,000</span>
                </div>

                {/* Consent Checkbox */}
                <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 rounded text-[#007e88] focus:ring-[#007e88] cursor-pointer"
                  />
                  <span className="text-xs text-slate-600 leading-relaxed">
                    I authorize Alaafia to verify account status and enable emergency hospital release payments with my explicit confirmation.
                  </span>
                </label>

                {/* Buttons: Save details & Back */}
                <div className="flex items-center gap-3 pt-3">
                  <button
                    type="submit"
                    disabled={isAuthorizing}
                    className="flex-1 py-3 px-4 bg-[#007e88] hover:bg-[#006b73] active:scale-98 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {isAuthorizing ? (
                      <span>Saving & Verifying...</span>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Save details</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewState("intro")}
                    className="py-3 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Back
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 3: CONNECTED SUCCESS VIEW (Matching Figma Screenshot 2)              */}
          {/* ========================================================================= */}
          {viewState === "success" && (
            <div className="max-w-md mx-auto w-full bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-10 shadow-sm text-center space-y-6 animate-scale-in">
              {/* Green Success Checkmark Icon */}
              <div className="w-16 h-16 rounded-full bg-[#007e88] text-white mx-auto flex items-center justify-center shadow-md">
                <Check className="w-8 h-8 stroke-[2.5]" />
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Wema account connected
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                  Your eligible emergency fund can now be displayed in Alaafia.
                </p>
              </div>

              {/* Account Card Summary (Matching Screenshot 2) */}
              <div className="bg-[#f0faf9] border border-teal-100 rounded-2xl p-4 flex items-center justify-between text-left shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-teal-100 flex items-center justify-center text-[#007e88] shrink-0 shadow-2xs">
                    <Landmark className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900">Wema</h4>
                    <span className="text-[11px] font-semibold text-teal-700 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Connected
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-500 font-medium block">
                    Emergency fund
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                    ₦30,000 available
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDetailsModalOpen(true)}
                  className="w-full sm:flex-1 py-3 px-4 bg-white border border-teal-600/60 text-[#007e88] hover:bg-teal-50 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  View connection details
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/care-support")}
                  className="w-full sm:flex-1 py-3 px-4 bg-[#007e88] hover:bg-[#006b73] active:scale-98 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Continue to Care Support
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* CONNECTION DETAILS MODAL */}
      {isDetailsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-200 space-y-5 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-slate-900">Wema Connection Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailsModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-500">Institution:</span>
                  <span className="font-bold text-slate-800">Wema Bank / ALAT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Account Name:</span>
                  <span className="font-bold text-slate-800">{accountName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Account Number:</span>
                  <span className="font-bold text-slate-800">•••• {accountNumber.slice(-4) || "4092"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">Active & Verified</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Emergency Fund Limit:</span>
                  <span className="font-bold text-[#006666]">₦30,000 Available</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Security Encryption:</span>
                  <span className="font-bold text-slate-800">256-bit Bank-grade</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                Alaafia will only initiate emergency hospital deposits with your explicit one-tap authorization or trusted contact consent.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsDetailsModalOpen(false)}
                className="w-full py-2.5 bg-[#007e88] hover:bg-[#006b73] text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE BOTTOM NAVIGATION */}
      <MobileNav />
    </div>
  );
}
