"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Building2,
  Check,
  Landmark,
  LockKeyhole,
  MessageCircle,
  Phone,
  Plus,
  ShieldCheck,
  UsersRound,
  WalletCards,
} from "lucide-react";
import EmergencyModal from "@/components/EmergencyModal";
import MobileNav from "@/components/MobileNav";
import Sidebar from "@/components/Sidebar";

export default function CareSupportPage() {
  const [userInitial] = useState(() => {
    if (typeof window === "undefined") return "M";

    try {
      const storedUser = localStorage.getItem("alaafia_user");
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;
      return parsedUser?.firstName ? parsedUser.firstName.charAt(0).toUpperCase() : "M";
    } catch {
      return "M";
    }
  });
  const [balance, setBalance] = useState(30000);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#f8f7f2] text-slate-900 font-sans selection:bg-teal-100 selection:text-teal-900">
      <Sidebar activeTab="care-support" />

      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <h1 className="text-xl font-bold text-slate-900">Care Support</h1>
          <div className="flex items-center gap-4">
            <button
              type="button"
              aria-label="Notifications"
              className="relative p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-teal-500" />
            </button>
            <div className="w-9 h-9 rounded-full bg-amber-400 text-slate-900 font-bold flex items-center justify-center text-sm">
              {userInitial}
            </div>
          </div>
        </header>

        <main className="p-5 sm:p-8 max-w-6xl mx-auto w-full space-y-8">
          <section className="space-y-1">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Care Support</h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Prepare for unexpected healthcare expenses and get support when you need it.
            </p>
          </section>

          <section className="relative overflow-hidden rounded-xl bg-[#c9edf1] border border-cyan-100 px-5 py-5 sm:px-7 sm:py-6 flex items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">Be prepared for unexpected care</h3>
              <p className="text-[11px] sm:text-xs leading-relaxed text-slate-600 max-w-md">
                Start building your healthcare safety net today. Small contributions can cover major emergencies tomorrow.
              </p>
              <Link
                href="#balance"
                className="inline-flex items-center gap-2 rounded-md bg-[#007e88] px-3 py-2 text-xs font-bold text-white hover:bg-[#006b73] transition-colors"
              >
                Build your emergency fund <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="hidden sm:flex shrink-0 w-20 h-20 rounded-full border-2 border-white/90 items-center justify-center bg-cyan-100/40">
              <ShieldCheck className="w-9 h-9 text-[#078696]" />
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div id="balance" className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-sm space-y-5">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                    <WalletCards className="w-3 h-3 text-slate-400" /> Available Balance
                  </span>
                  <p className="text-2xl sm:text-3xl font-extrabold tracking-tight">₦{balance.toLocaleString()}</p>
                </div>
                <span className="rounded-full bg-emerald-50 border border-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-700">Fund Active</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500">
                  <span>60% to goal</span>
                  <span>Goal: ₦50,000</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full w-[60%] rounded-full bg-[#008b98]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setBalance((current) => current + 5000)}
                  className="inline-flex items-center justify-center gap-1 rounded-md bg-[#007e88] py-2.5 text-xs font-bold text-white hover:bg-[#006b73] transition-colors"
                >
                  <Plus className="w-3 h-3" /> Add to fund
                </button>
                <button type="button" className="rounded-md border border-[#008b98] py-2.5 text-xs font-bold text-[#007e88] hover:bg-cyan-50 transition-colors">
                  Manage
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-cyan-50 flex items-center justify-center"><Landmark className="w-4 h-4 text-cyan-700" /></div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-xs">R</div>
                      <span className="text-[10px] font-bold text-slate-600">Wema Bank</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-cyan-700">Secure</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-500"><Check className="w-3 h-3 text-emerald-600" /> Connected successfully</div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Trusted Contacts</span>
                  <UsersRound className="w-3.5 h-3.5 text-cyan-600" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[{ label: "Mum", sub: "Primary Emergency", color: "bg-cyan-100 text-cyan-700" }, { label: "Sister", sub: "Backup Contact", color: "bg-slate-200 text-slate-600" }, { label: "Brother", sub: "Family Pool", color: "bg-cyan-100 text-cyan-700" }].map((contact) => (
                    <div key={contact.label} className="flex items-center gap-1.5 min-w-0">
                      <span className={`w-5 h-5 shrink-0 rounded-full flex items-center justify-center text-[9px] font-bold ${contact.color}`}>{contact.label.charAt(0)}</span>
                      <span className="min-w-0"><strong className="block truncate text-[10px] text-slate-700">{contact.label}</strong><small className="block truncate text-[8px] text-slate-400">{contact.sub}</small></span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900">How Care Support Works</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { icon: LockKeyhole, title: "Save steadily", text: "Add small amounts to your dedicated health wallet over time." },
                { icon: Building2, title: "Use for care", text: "Instantly pay for consultations, medication, or procedures from your fund." },
                { icon: UsersRound, title: "Ask for support", text: "Request help from trusted contacts directly through the app." },
              ].map((item, index) => {
                const Icon = item.icon;
                return <div key={item.title} className="rounded-lg bg-[#d7f3f5] p-4 min-h-[112px] space-y-3"><Icon className="w-4 h-4 text-cyan-700" /><div><p className="text-[10px] font-bold text-slate-800">{index + 1}. {item.title}</p><p className="mt-1 text-[9px] leading-relaxed text-slate-600">{item.text}</p></div></div>;
              })}
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Need care now?</h3>
              <p className="text-xs text-slate-500 mt-1">Connect with a professional or access emergency services immediately.</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Link href="/consultation" className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-md border border-cyan-600 px-3 py-2.5 text-[10px] font-bold text-cyan-700 hover:bg-cyan-50 transition-colors"><MessageCircle className="w-3 h-3" /> Start consultation</Link>
              <button type="button" onClick={() => setIsEmergencyOpen(true)} className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-md bg-red-600 px-3 py-2.5 text-[10px] font-bold text-white hover:bg-red-700 transition-colors"><Phone className="w-3 h-3" /> Emergency help</button>
            </div>
          </section>
        </main>
      </div>

      <MobileNav />
      <EmergencyModal isOpen={isEmergencyOpen} onClose={() => setIsEmergencyOpen(false)} />
    </div>
  );
}