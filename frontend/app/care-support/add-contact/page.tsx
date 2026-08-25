"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Info,
  Lock,
  CheckCircle2,
  AlertCircle,
  Bell,
  Check,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import EmergencyModal from "@/components/EmergencyModal";
import { useUserProfile } from "@/lib/userUtils";

export interface ContactItem {
  id: string | number;
  name: string;
  relation: string;
  phone: string;
  email?: string;
  initials: string;
  color: string;
  allowRequests?: boolean;
}

export default function AddContactPage() {
  const router = useRouter();

  // Form state
  const [fullName, setFullName] = useState("");
  const [countryCode, setCountryCode] = useState("+234");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [relationship, setRelationship] = useState("");
  const [allowRequests, setAllowRequests] = useState(true);

  // User & Contact data
  const { profile: userProfile, initial: userInitial, displayName } = useUserProfile();
  const [existingContacts, setExistingContacts] = useState<ContactItem[]>([]);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    try {
      const storedContacts = localStorage.getItem("alaafia_trusted_contacts");
      if (storedContacts) {
        const parsed = JSON.parse(storedContacts);
        if (Array.isArray(parsed)) {
          setExistingContacts(parsed);
        }
      }
    } catch {}
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (existingContacts.length >= 4) {
      setErrorMsg("Maximum limit reached: You can only have up to 4 trusted emergency contacts.");
      return;
    }

    if (!fullName.trim()) {
      setErrorMsg("Please enter the contact's full name.");
      return;
    }

    if (!phoneNumber.trim()) {
      setErrorMsg("Please enter a valid phone number.");
      return;
    }

    if (!relationship || relationship === "") {
      setErrorMsg("Please select a relationship.");
      return;
    }

    setIsSubmitting(true);

    const initials = fullName
      .trim()
      .split(" ")
      .map((p) => p[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    const colors = [
      "bg-teal-100 text-teal-800 border-teal-200",
      "bg-cyan-100 text-cyan-800 border-cyan-200",
      "bg-emerald-100 text-emerald-800 border-emerald-200",
      "bg-sky-100 text-sky-800 border-sky-200",
    ];
    const color = colors[existingContacts.length % colors.length];

    const formattedPhone = `${countryCode} ${phoneNumber.trim().replace(/^0+/, "")}`;

    const newContact: ContactItem = {
      id: Date.now(),
      name: fullName.trim(),
      relation: relationship,
      phone: formattedPhone,
      email: emailAddress.trim() || undefined,
      initials: initials || "C",
      color,
      allowRequests,
    };

    const updated = [...existingContacts, newContact];
    localStorage.setItem("alaafia_trusted_contacts", JSON.stringify(updated));

    showToast(`Added ${newContact.name} (${newContact.relation}) to your trusted contacts.`);

    setTimeout(() => {
      router.push("/care-support");
    }, 800);
  };

  return (
    <div className="min-h-screen flex bg-[#f8f7f2] text-slate-900 font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* Sidebar Navigation */}
      <Sidebar activeTab="care-support" />

      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Care Support & Health Fund</h1>
          </div>
          <div className="flex items-center gap-4 relative">
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
                  <span className="text-xs font-bold text-slate-800">Care Support Alerts</span>
                  <button
                    type="button"
                    onClick={() => setIsNotificationsOpen(false)}
                    className="text-[10px] text-teal-600 font-bold hover:underline cursor-pointer"
                  >
                    Close
                  </button>
                </div>
                <div className="py-2 space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-teal-50 text-teal-900">
                    <p className="font-bold">Trusted Contacts</p>
                    <p className="text-[11px] text-teal-700 mt-0.5">
                      {existingContacts.length} of 4 emergency contacts configured.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Link
              href="/settings"
              suppressHydrationWarning
              title={`Logged in as ${displayName} — View Profile Settings`}
              className="w-9 h-9 rounded-full bg-[#006666] text-white font-bold flex items-center justify-center text-sm shadow-xs hover:ring-2 hover:ring-teal-400 transition-all cursor-pointer"
            >
              <span suppressHydrationWarning>{userInitial}</span>
            </Link>
          </div>
        </header>

        {/* Toast alert */}
        {toastMsg && (
          <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl text-xs font-semibold flex items-center gap-2 animate-slide-up">
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Main Content Area */}
        <main className="p-4 sm:p-8 lg:p-10 max-w-6xl mx-auto w-full space-y-6 animate-fade-in pb-24 sm:pb-8">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-slate-500">
            <Link
              href="/care-support"
              className="hover:text-teal-700 transition-colors font-medium hover:underline"
            >
              Care Support
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link
              href="/care-support"
              className="hover:text-teal-700 transition-colors font-medium hover:underline"
            >
              Trusted Contacts
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-slate-900">Add contact</span>
          </nav>

          {/* Heading */}
          <div className="space-y-1.5">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Add a trusted contact
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
              Choose someone you trust to contact or ask for support when you need help with healthcare costs.
            </p>
          </div>

          {/* Max 4 Limit Alert if reached */}
          {existingContacts.length >= 4 && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-900">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold">Maximum Limit Reached (4 / 4 Contacts)</p>
                <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                  You already have 4 trusted contacts. To add a new person, please remove an existing contact first from the Care Support dashboard.
                </p>
                <Link
                  href="/care-support"
                  className="inline-block mt-2 text-xs font-bold text-amber-800 hover:underline"
                >
                  ← Return to Care Support
                </Link>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-2.5 text-red-700 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Main 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
            {/* Left Card: Form */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <form onSubmit={handleSaveContact} className="space-y-5">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Adebayo Johnson"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={existingContacts.length >= 4}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007e88] focus:border-transparent transition-all disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Phone Number (for SMS & Emergency Alerts)
                  </label>
                  <div className="flex rounded-xl border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-[#007e88] focus-within:border-transparent transition-all">
                    <div className="bg-slate-50 border-r border-slate-200 px-3.5 flex items-center text-xs font-bold text-slate-700 select-none">
                      {countryCode}
                    </div>
                    <input
                      type="tel"
                      placeholder="801 234 5678"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      disabled={existingContacts.length >= 4}
                      required
                      className="w-full px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>Email Address (for Support Notifications)</span>
                    <span className="text-[10px] text-slate-400 font-normal">Optional</span>
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. contact@gmail.com"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    disabled={existingContacts.length >= 4}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007e88] focus:border-transparent transition-all disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Relationship */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Relationship
                  </label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    disabled={existingContacts.length >= 4}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#007e88] focus:border-transparent transition-all disabled:bg-slate-100 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <option value="" disabled>
                      Select relationship
                    </option>
                    <option value="Mom">Mom</option>
                    <option value="Dad">Dad</option>
                    <option value="Sister">Sister</option>
                    <option value="Brother">Brother</option>
                    <option value="Husband">Husband</option>
                    <option value="Wife">Wife</option>
                    <option value="Son">Son</option>
                    <option value="Daughter">Daughter</option>
                    <option value="Close Friend">Close Friend</option>
                    <option value="Doctor / Caregiver">Doctor / Caregiver</option>
                    <option value="Guardian">Guardian</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Checkbox Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#e6f7f8] border border-cyan-200/80 space-y-2">
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={allowRequests}
                      onChange={(e) => setAllowRequests(e.target.checked)}
                      disabled={existingContacts.length >= 4}
                      className="mt-1 w-4 h-4 rounded text-[#007e88] focus:ring-[#007e88] border-slate-300 cursor-pointer"
                    />
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-900 block leading-snug">
                        Allow Alaafia to send care-support requests to this contact on my behalf.
                      </span>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        We will only contact them when you explicitly create a support request or in medical emergencies if set as an emergency contact.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <Link
                    href="/care-support"
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all text-center cursor-pointer"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={existingContacts.length >= 4 || isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-[#007e88] hover:bg-[#006b73] active:scale-95 text-white text-xs font-bold shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? "Saving contact..." : "Save contact"}
                  </button>
                </div>
              </form>
            </div>

            {/* Right Card: Why add trusted contacts? */}
            <div className="lg:col-span-5 bg-[#e7f7f8] border border-cyan-200/70 rounded-3xl p-6 sm:p-7 space-y-6 shadow-xs">
              {/* Header */}
              <div className="flex items-center gap-2 text-teal-900">
                <Info className="w-5 h-5 text-[#007e88] shrink-0" />
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                  Why add trusted contacts?
                </h3>
              </div>

              {/* Numbered Items */}
              <div className="space-y-5">
                {/* Step 1 */}
                <div className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-full bg-cyan-200 text-teal-900 font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    1
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-extrabold text-slate-900">
                      Choose someone you trust
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Select family members or close friends who are willing to support your healthcare journey.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-full bg-cyan-200 text-teal-900 font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    2
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-extrabold text-slate-900">
                      Set up their details
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Provide accurate contact information so we can reach them securely when requested.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-3.5">
                  <div className="w-6 h-6 rounded-full bg-cyan-200 text-teal-900 font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    3
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-extrabold text-slate-900">
                      Request support when needed
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Easily send secure links to your trusted contacts when you need assistance with bills or care coordination.
                    </p>
                  </div>
                </div>
              </div>

              {/* Security Privacy Notice */}
              <div className="pt-4 border-t border-cyan-200/60 flex items-start gap-2.5 text-slate-600">
                <Lock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed text-slate-600">
                  Your contacts' information is stored securely and never shared with third parties without your explicit consent.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>

      <MobileNav />
      <EmergencyModal isOpen={isEmergencyOpen} onClose={() => setIsEmergencyOpen(false)} />
    </div>
  );
}
