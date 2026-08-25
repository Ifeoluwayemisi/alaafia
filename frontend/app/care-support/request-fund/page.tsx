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
  Check,
  Plus,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Bell,
  Sparkles,
  Info,
  User,
  Users,
  Send,
  Share2,
  Lock,
  Landmark,
  Phone,
  Mail,
  RefreshCw,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import { useUserProfile } from "@/lib/userUtils";
import { ContactItem } from "@/app/care-support/add-contact/page";

export interface ActiveFundRequest {
  id: string;
  amountRequested: number;
  amountReceived: number;
  reason: string;
  careFacility: string;
  message: string;
  selectedContactIds: (string | number)[];
  recipientNames: string[];
  createdAt: string;
  status: "Pending" | "Partially Funded" | "Completed";
}

export default function RequestFundPage() {
  const router = useRouter();

  // View state: "form" | "success"
  const [viewState, setViewState] = useState<"form" | "success">("form");

  // User & Prerequisites
  const { profile: userProfile, initial: userInitial, displayName } = useUserProfile();
  const [isWemaConnected, setIsWemaConnected] = useState(false);
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // Form inputs
  const [amount, setAmount] = useState(20000);
  const [customAmountStr, setCustomAmountStr] = useState("20000");
  const [selectedContactIds, setSelectedContactIds] = useState<(string | number)[]>([]);
  const [reason, setReason] = useState("Healthcare support");
  const [careFacility, setCareFacility] = useState("General Hospital Lagos");
  const [personalMessage, setPersonalMessage] = useState(
    "I need help covering the remaining cost of my care at General Hospital."
  );
  const [isSending, setIsSending] = useState(false);

  // Active Request in Success / Status view
  const [activeRequest, setActiveRequest] = useState<ActiveFundRequest | null>(null);

  useEffect(() => {
    try {
      // 1. Check Wema Connection
      const storedWema = localStorage.getItem("alaafia_wema_connected");
      if (storedWema === "true") {
        setIsWemaConnected(true);
      }

      // 2. Check Contacts
      const storedContacts = localStorage.getItem("alaafia_trusted_contacts");
      if (storedContacts) {
        const parsed = JSON.parse(storedContacts);
        if (Array.isArray(parsed)) {
          setContacts(parsed);
          // By default, select all active contacts
          setSelectedContactIds(parsed.map((c) => c.id));
        }
      }

      // 3. Check existing active request or query params
      const storedActiveReq = localStorage.getItem("alaafia_active_fund_request");
      if (storedActiveReq) {
        const parsedReq = JSON.parse(storedActiveReq);
        setActiveRequest(parsedReq);

        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get("view") === "status") {
          setViewState("success");
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const handleAmountChange = (val: string) => {
    const numeric = val.replace(/\D/g, "");
    setCustomAmountStr(numeric);
    setAmount(Number(numeric) || 0);
  };

  const handleSelectPreset = (preset: number) => {
    setAmount(preset);
    setCustomAmountStr(String(preset));
  };

  const toggleContact = (contactId: string | number) => {
    setSelectedContactIds((prev) =>
      prev.includes(contactId) ? prev.filter((id) => id !== contactId) : [...prev, contactId]
    );
  };

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isWemaConnected) {
      showToast("Please connect your Wema Bank account first.");
      return;
    }

    if (contacts.length === 0) {
      showToast("Please add at least one trusted contact.");
      return;
    }

    if (amount <= 0) {
      showToast("Please enter a valid request amount.");
      return;
    }

    if (selectedContactIds.length === 0) {
      showToast("Please select at least one contact to receive this request.");
      return;
    }

    setIsSending(true);

    const selectedContacts = contacts.filter((c) => selectedContactIds.includes(c.id));
    const recipientNames = selectedContacts.map((c) => c.name);

    setTimeout(() => {
      const newRequest: ActiveFundRequest = {
        id: `REQ-${Date.now()}`,
        amountRequested: amount,
        amountReceived: 0,
        reason,
        careFacility,
        message: personalMessage,
        selectedContactIds,
        recipientNames,
        createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        status: "Pending",
      };

      try {
        localStorage.setItem("alaafia_active_fund_request", JSON.stringify(newRequest));
        window.dispatchEvent(new Event("storage"));
      } catch (err) {}

      setActiveRequest(newRequest);
      setIsSending(false);
      setViewState("success");
    }, 1200);
  };

  // Simulate friend/family contribution towards the fund goal
  const handleSimulateContribution = (contribAmount: number) => {
    if (!activeRequest) return;
    const newReceived = Math.min(
      activeRequest.amountRequested,
      activeRequest.amountReceived + contribAmount
    );
    const updated: ActiveFundRequest = {
      ...activeRequest,
      amountReceived: newReceived,
      status: newReceived >= activeRequest.amountRequested ? "Completed" : "Partially Funded",
    };

    setActiveRequest(updated);
    localStorage.setItem("alaafia_active_fund_request", JSON.stringify(updated));

    // Also update health balance
    try {
      const currentBal = Number(localStorage.getItem("alaafia_care_balance") || "30000");
      localStorage.setItem("alaafia_care_balance", String(currentBal + contribAmount));
      window.dispatchEvent(new Event("storage"));
    } catch {}

    showToast(`Received ₦${contribAmount.toLocaleString()} contribution from Mum!`);
  };

  const selectedCount = selectedContactIds.length;
  const remainingAmount = activeRequest
    ? Math.max(0, activeRequest.amountRequested - activeRequest.amountReceived)
    : 0;
  const progressPercent = activeRequest && activeRequest.amountRequested > 0
    ? Math.round((activeRequest.amountReceived / activeRequest.amountRequested) * 100)
    : 0;

  return (
    <div className="flex min-h-screen bg-[#f7fcfc] font-sans text-slate-800">
      {/* 1. SIDEBAR NAVIGATION */}
      <Sidebar activeTab="care-support" />

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        {/* HEADER BAR */}
        <header className="h-16 bg-white border-b border-teal-100/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          {/* Breadcrumbs Navigation */}
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium overflow-x-auto whitespace-nowrap py-1">
            <Link href="/care-support" className="text-[#006666] font-semibold hover:underline">
              Care Support
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-500">Ask for help</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-800 font-bold">
              {viewState === "form" ? "Request fund" : "Request status"}
            </span>
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
                  <span className="text-xs font-bold text-slate-800">Support Fund Alerts</span>
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
                    <p className="font-bold">Healthcare Emergency Pool</p>
                    <p className="text-[11px] text-teal-700 mt-0.5">
                      Direct hospital release funds via Wema Bank & trusted family network.
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
        <main className="p-4 sm:p-8 max-w-5xl mx-auto w-full flex-1 flex flex-col justify-center animate-fade-in pb-24 sm:pb-8">
          {/* ========================================================================= */}
          {/* PREREQUISITE CHECK: Wema Connected & Emergency Contacts Required          */}
          {/* ========================================================================= */}
          {(!isWemaConnected || contacts.length === 0) && viewState === "form" ? (
            <div className="max-w-xl mx-auto w-full bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-sm text-center space-y-6 animate-scale-in">
              <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 border border-amber-200 mx-auto flex items-center justify-center shadow-xs">
                <AlertCircle className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Prerequisites Required to Request Funds
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                  To protect patient safety and ensure emergency support reaches your hospital care reserve instantly, please complete the following:
                </p>
              </div>

              <div className="space-y-3 text-left">
                {/* Check 1: Wema Bank */}
                <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${isWemaConnected ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200"}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isWemaConnected ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-500"}`}>
                      {isWemaConnected ? <Check className="w-4 h-4" /> : <Landmark className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">1. Connected Wema / ALAT Account</h4>
                      <p className="text-[11px] text-slate-500">Required to receive and disburse hospital emergency funds.</p>
                    </div>
                  </div>
                  {!isWemaConnected && (
                    <Link
                      href="/care-support/connect-wema"
                      className="px-3 py-1.5 bg-[#007e88] hover:bg-[#006b73] text-white text-xs font-bold rounded-xl shrink-0"
                    >
                      Connect Now →
                    </Link>
                  )}
                </div>

                {/* Check 2: Trusted Emergency Contacts */}
                <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${contacts.length > 0 ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200"}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${contacts.length > 0 ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-500"}`}>
                      {contacts.length > 0 ? <Check className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">2. Add Trusted Contacts</h4>
                      <p className="text-[11px] text-slate-500">At least one contact with phone number & email to receive fund requests.</p>
                    </div>
                  </div>
                  {contacts.length === 0 && (
                    <Link
                      href="/care-support/add-contact"
                      className="px-3 py-1.5 bg-[#007e88] hover:bg-[#006b73] text-white text-xs font-bold rounded-xl shrink-0"
                    >
                      Add Contact →
                    </Link>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/care-support"
                  className="inline-block text-xs font-bold text-slate-600 hover:text-slate-900 hover:underline"
                >
                  ← Return to Care Support
                </Link>
              </div>
            </div>
          ) : viewState === "form" ? (
            /* ======================================================================= */
            /* VIEW 1: REQUEST FUND FORM (Matching Figma Screenshot 1)                 */
            /* ======================================================================= */
            <div className="space-y-6">
              {/* Header with Title & Stepper */}
              <div className="space-y-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                  Request fund
                </h1>

                {/* Progress Stepper */}
                <div className="flex items-center gap-4 text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-[#006666]">
                    <span className="w-5 h-5 rounded-full bg-[#006666] text-white flex items-center justify-center text-[10px]">1</span>
                    Amount & recipients
                  </span>
                  <span className="text-slate-300">———</span>
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px]">2</span>
                    Sent
                  </span>
                </div>
              </div>

              {/* Main 2-Column Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* LEFT COLUMN: Input Form */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Card 1: Amount Needed */}
                  <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800 block">
                        Amount Needed
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-4 font-bold text-slate-500 text-sm">₦</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={customAmountStr}
                          onChange={(e) => handleAmountChange(e.target.value)}
                          placeholder="20,000"
                          className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 font-extrabold text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#007e88]"
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 pt-1">
                        <Info className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span>Suggested amount ₦20,000 based on your estimated care gap.</span>
                      </p>
                    </div>

                    {/* Quick Amount Presets */}
                    <div className="flex items-center gap-2 pt-1 overflow-x-auto">
                      {[10000, 20000, 50000, 100000].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handleSelectPreset(val)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            amount === val
                              ? "bg-teal-50 border border-teal-300 text-[#006666]"
                              : "bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          ₦{val.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Card 2: Trusted Contacts Selection */}
                  <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Trusted Contacts
                      </h3>
                      <Link
                        href="/care-support/add-contact"
                        className="text-xs font-bold text-teal-700 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" /> Add new
                      </Link>
                    </div>

                    <div className="space-y-2.5">
                      {contacts.map((contact) => {
                        const isSelected = selectedContactIds.includes(contact.id);
                        return (
                          <div
                            key={contact.id}
                            onClick={() => toggleContact(contact.id)}
                            className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer select-none ${
                              isSelected
                                ? "bg-[#f0faf9] border-teal-300 shadow-2xs"
                                : "bg-slate-50/70 border-slate-200 hover:bg-slate-100/70"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-[#006666] text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                                {contact.initials}
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-slate-900">{contact.name}</h4>
                                <p className="text-[11px] text-slate-500">
                                  {contact.relation} • Ending in •••• {contact.phone.slice(-4)}
                                </p>
                              </div>
                            </div>

                            <div
                              className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                                isSelected ? "bg-[#007e88] border-[#007e88] text-white" : "border-slate-300 bg-white"
                              }`}
                            >
                              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Card 3: Request Details & Message */}
                  <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Request Details
                    </h3>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600">Reason for request</label>
                        <select
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#007e88] bg-white cursor-pointer"
                        >
                          <option value="Healthcare support">Healthcare support</option>
                          <option value="Emergency hospital admission">Emergency hospital admission</option>
                          <option value="Prescription & Medication deposit">Prescription & Medication deposit</option>
                          <option value="Lab test & Diagnostic imaging">Lab test & Diagnostic imaging</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600">Care Facility</label>
                        <input
                          type="text"
                          value={careFacility}
                          onChange={(e) => setCareFacility(e.target.value)}
                          placeholder="General Hospital Lagos"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#007e88]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600">Personal Message (Optional)</label>
                        <textarea
                          rows={2}
                          value={personalMessage}
                          onChange={(e) => setPersonalMessage(e.target.value)}
                          placeholder="I need help covering the remaining cost of my care at General Hospital."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#007e88]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: "Your Request" Summary Card */}
                <div className="lg:col-span-5 space-y-4 sticky top-20">
                  <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
                    <h3 className="text-base font-bold text-slate-900">Your request</h3>

                    <div className="space-y-3 text-xs border-y border-slate-100 py-4">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Amount</span>
                        <span className="font-extrabold text-slate-900 text-sm">₦{amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Recipients</span>
                        <span className="font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                          {selectedCount} selected
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Reason</span>
                        <span className="font-semibold text-slate-800">{reason}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Care Facility</span>
                        <span className="font-semibold text-slate-800">{careFacility}</span>
                      </div>
                    </div>

                    {/* Actions: Send Request & Cancel */}
                    <div className="space-y-2.5">
                      <button
                        type="button"
                        onClick={handleSendRequest}
                        disabled={isSending || selectedCount === 0}
                        className="w-full py-3.5 px-4 bg-[#007e88] hover:bg-[#006b73] active:scale-98 text-white font-bold rounded-xl text-xs shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isSending ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Sending Notifications...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Send request</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => router.push("/care-support")}
                        className="w-full py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer text-center"
                      >
                        Cancel
                      </button>
                    </div>

                    {/* Privacy Note */}
                    <div className="p-3 bg-teal-50/60 border border-teal-100 rounded-xl">
                      <p className="text-[11px] text-teal-900 leading-relaxed">
                        Your request will be sent privately via SMS and Email to selected contacts only with direct payment link to your hospital safety fund.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ======================================================================= */
            /* VIEW 2: REQUEST SENT SUCCESSFULLY (Matching Figma Screenshot 2)         */
            /* ======================================================================= */
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* LEFT COLUMN: Success Hero & Support Progress */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Top Success Banner */}
                  <div className="bg-white border border-slate-200/90 rounded-3xl p-8 shadow-xs text-center space-y-3 animate-scale-in">
                    <div className="w-14 h-14 rounded-full bg-[#007e88] text-white mx-auto flex items-center justify-center shadow-md">
                      <Check className="w-7 h-7 stroke-[2.5]" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                      Request sent successfully
                    </h2>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                      Your support request has been sent to the people you selected via SMS and email.
                    </p>
                  </div>

                  {/* Support Progress Card */}
                  <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#006666]" />
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Support Progress
                      </h3>
                    </div>

                    {/* Large Amount Tracker */}
                    <div className="p-5 rounded-2xl bg-[#e0f7f6]/60 border border-teal-200/80 space-y-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-slate-900">
                          ₦{activeRequest?.amountReceived.toLocaleString() || "0"}
                        </span>
                        <span className="text-xs text-slate-500 font-semibold">
                          of ₦{activeRequest?.amountRequested.toLocaleString() || "20,000"} requested
                        </span>
                      </div>
                      <div className="h-2.5 bg-white rounded-full overflow-hidden border border-teal-100">
                        <div
                          className="h-full bg-[#007e88] transition-all duration-500 rounded-full"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-teal-800">
                        <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                        {activeRequest?.status === "Completed" ? "Goal Fully Funded! 🎉" : "Waiting for support"}
                      </span>
                    </div>

                    {/* Recipients Status Badges */}
                    <div className="space-y-2.5 pt-1">
                      <span className="text-xs font-bold text-slate-700 block">Recipients</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {(activeRequest?.recipientNames || ["Mum", "Sister"]).map((name, i) => (
                          <div
                            key={i}
                            className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-[10px]">
                                {name.charAt(0)}
                              </div>
                              <span className="font-bold text-slate-800">{name}</span>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-600" /> Request sent
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Simulation contribution button */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => handleSimulateContribution(5000)}
                        className="w-full py-2 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-[#006666] font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" /> Simulate Friend Contribution (+₦5,000)
                      </button>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: Status Breakdown */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
                    <h3 className="text-sm font-bold text-slate-900">Status Breakdown</h3>

                    <div className="space-y-3 text-xs border-y border-slate-100 py-4">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Amount requested</span>
                        <span className="font-bold text-slate-800">
                          ₦{activeRequest?.amountRequested.toLocaleString() || "20,000"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Amount received</span>
                        <span className="font-bold text-emerald-700">
                          ₦{activeRequest?.amountReceived.toLocaleString() || "0"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Remaining</span>
                        <span className="font-extrabold text-slate-900 text-sm">
                          ₦{remainingAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="space-y-2.5">
                      <button
                        type="button"
                        onClick={() => router.push("/care-support")}
                        className="w-full py-3 px-4 bg-[#007e88] hover:bg-[#006b73] active:scale-98 text-white font-bold rounded-xl text-xs shadow-xs transition-all cursor-pointer"
                      >
                        Back to care
                      </button>

                      <button
                        type="button"
                        onClick={() => setViewState("form")}
                        className="w-full py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
                      >
                        View request details
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(window.location.href);
                          showToast("Request link copied to clipboard!");
                        }}
                        className="w-full py-2 text-teal-700 hover:text-teal-800 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer hover:underline"
                      >
                        <Share2 className="w-3.5 h-3.5" /> Share request link
                      </button>
                    </div>

                    {/* Notice */}
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Your healthcare journey can continue while your support request is pending. Deposits automatically update your emergency balance.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION */}
      <MobileNav />
    </div>
  );
}
