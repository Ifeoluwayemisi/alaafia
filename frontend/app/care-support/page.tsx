"use client";

import { useState, useEffect } from "react";
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
  X,
  Sparkles,
  CreditCard,
  UserPlus,
  Sliders,
  CheckCircle2,
  Trash2,
  Link2,
  Unlink,
} from "lucide-react";
import EmergencyModal from "@/components/EmergencyModal";
import MobileNav from "@/components/MobileNav";
import Sidebar from "@/components/Sidebar";

export interface ContactItem {
  id: string | number;
  name: string;
  relation: string;
  phone: string;
  initials: string;
  color: string;
}

export default function CareSupportPage() {
  const [userInitial, setUserInitial] = useState("R");
  const [balance, setBalance] = useState(30000);
  const [goal, setGoal] = useState(50000);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isContactsModalOpen, setIsContactsModalOpen] = useState(false);
  const [isWemaModalOpen, setIsWemaModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // Wema Bank Connection State
  const [isWemaConnected, setIsWemaConnected] = useState(false);
  const [wemaAccountNumber, setWemaAccountNumber] = useState("");
  const [wemaAccountName, setWemaAccountName] = useState("Ruqayah Adebayo");
  const [wemaBvnPhone, setWemaBvnPhone] = useState("");
  const [isConnectingWema, setIsConnectingWema] = useState(false);

  // Top up amount
  const [selectedTopUp, setSelectedTopUp] = useState(5000);
  const [customAmount, setCustomAmount] = useState("");

  // Trusted Contacts
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [newContactName, setNewContactName] = useState("");
  const [newContactRelation, setNewContactRelation] = useState("Sister");
  const [newContactPhone, setNewContactPhone] = useState("");

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("alaafia_user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser?.firstName) {
          setUserInitial(parsedUser.firstName.charAt(0).toUpperCase());
          setWemaAccountName(`${parsedUser.firstName} ${parsedUser.lastName || "Adebayo"}`);
        }
      }
      const storedBalance = localStorage.getItem("alaafia_care_balance");
      if (storedBalance) setBalance(Number(storedBalance));

      const storedWema = localStorage.getItem("alaafia_wema_connected");
      if (storedWema === "true") {
        setIsWemaConnected(true);
        const storedAcct = localStorage.getItem("alaafia_wema_account_number");
        if (storedAcct) setWemaAccountNumber(storedAcct);
      }

      const storedContacts = localStorage.getItem("alaafia_trusted_contacts");
      if (storedContacts) {
        const parsed = JSON.parse(storedContacts);
        if (Array.isArray(parsed)) setContacts(parsed);
      }
    } catch {}
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const handleDeposit = () => {
    const amount = customAmount ? Number(customAmount) : selectedTopUp;
    if (!amount || isNaN(amount) || amount <= 0) {
      showToast("Please enter a valid amount.");
      return;
    }
    const newBal = balance + amount;
    setBalance(newBal);
    localStorage.setItem("alaafia_care_balance", String(newBal));
    setIsTopUpModalOpen(false);
    setCustomAmount("");
    showToast(`Successfully added ₦${amount.toLocaleString()} to your Care Support Fund!`);
  };

  const handleConnectWema = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wemaAccountNumber || wemaAccountNumber.length < 10) {
      showToast("Please enter a valid 10-digit Wema Bank account number.");
      return;
    }
    setIsConnectingWema(true);
    setTimeout(() => {
      setIsConnectingWema(false);
      setIsWemaConnected(true);
      localStorage.setItem("alaafia_wema_connected", "true");
      localStorage.setItem("alaafia_wema_account_number", wemaAccountNumber);
      setIsWemaModalOpen(false);
      showToast("Wema Bank account connected successfully!");
    }, 1000);
  };

  const handleDisconnectWema = () => {
    setIsWemaConnected(false);
    localStorage.removeItem("alaafia_wema_connected");
    localStorage.removeItem("alaafia_wema_account_number");
    showToast("Wema Bank account disconnected.");
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (contacts.length >= 4) {
      showToast("Maximum of 4 trusted emergency contacts allowed.");
      return;
    }
    if (!newContactName.trim() || !newContactPhone.trim()) {
      showToast("Please provide both contact name and phone number.");
      return;
    }
    const initials = newContactName.trim().split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2);
    const colors = ["bg-teal-100 text-teal-800 border-teal-200", "bg-cyan-100 text-cyan-800 border-cyan-200", "bg-emerald-100 text-emerald-800 border-emerald-200", "bg-sky-100 text-sky-800 border-sky-200"];
    const color = colors[contacts.length % colors.length];
    const newContact: ContactItem = { id: Date.now(), name: newContactName.trim(), relation: newContactRelation || "Emergency Contact", phone: newContactPhone.trim(), initials: initials || "C", color };
    const updated = [...contacts, newContact];
    setContacts(updated);
    localStorage.setItem("alaafia_trusted_contacts", JSON.stringify(updated));
    setNewContactName("");
    setNewContactPhone("");
    setNewContactRelation("Sister");
    setIsContactsModalOpen(false);
    showToast(`Added ${newContact.name} to trusted contacts.`);
  };

  const handleRemoveContact = (id: string | number) => {
    const updated = contacts.filter((c) => c.id !== id);
    setContacts(updated);
    localStorage.setItem("alaafia_trusted_contacts", JSON.stringify(updated));
    showToast("Contact removed.");
  };

  const percentage = Math.min(Math.round((balance / goal) * 100), 100);

  return (
    <div className="min-h-screen flex bg-[#f8f7f2] text-slate-900 font-sans selection:bg-teal-100 selection:text-teal-900">
      <Sidebar activeTab="care-support" />
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <h1 className="text-xl font-bold text-slate-900">Care Support & Health Fund</h1>
          <div className="flex items-center gap-4 relative">
            <button type="button" onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} aria-label="Notifications" className="relative p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            </button>
            {isNotificationsOpen && (
              <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 animate-scale-in">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-800">Care Support Alerts</span>
                  <button type="button" onClick={() => setIsNotificationsOpen(false)} className="text-[10px] text-teal-600 font-bold hover:underline cursor-pointer">Close</button>
                </div>
                <div className="py-2 space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-teal-50 text-teal-900">
                    <p className="font-bold">{isWemaConnected ? "Wema Bank ALAT Connected" : "Wema Bank Not Connected"}</p>
                    <p className="text-[11px] text-teal-700 mt-0.5">{isWemaConnected ? "Automated emergency care funding is live." : "Connect your Wema Bank account to activate instant care funding."}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 text-slate-700">
                    <p className="font-bold">Fund Goal Progress</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">You have reached {percentage}% of your ₦{goal.toLocaleString()} target.</p>
                  </div>
                </div>
              </div>
            )}
            <Link href="/settings" title="View Profile Settings" className="w-9 h-9 rounded-full bg-amber-400 text-slate-900 font-bold flex items-center justify-center text-sm shadow-xs hover:ring-2 hover:ring-amber-500 transition-all">{userInitial}</Link>
          </div>
        </header>
        {toastMsg && (
          <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl text-xs font-semibold flex items-center gap-2 animate-slide-up">
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
            <span>{toastMsg}</span>
          </div>
        )}
        <main className="p-5 sm:p-8 max-w-6xl mx-auto w-full space-y-8 animate-fade-in">
          <section className="space-y-1">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Care Support Safety Net</h2>
            <p className="text-xs sm:text-sm text-slate-500">Prepare for unexpected healthcare expenses, save systematically, and access emergency hospital release funds.</p>
          </section>
          <section className="relative overflow-hidden rounded-2xl bg-linear-to-r from-[#c9edf1] to-[#b6e8ee] border border-cyan-200/80 px-6 py-6 sm:px-8 sm:py-7 flex items-center justify-between gap-6 shadow-xs">
            <div className="space-y-2.5 max-w-xl">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-teal-900 bg-white/70 px-2.5 py-1 rounded-full uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-teal-700" /> Wema ALAT Health Safety Pool
              </span>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">Be prepared for unexpected medical emergencies</h3>
              <p className="text-xs leading-relaxed text-slate-700 max-w-md">Start building your dedicated healthcare safety net. Small weekly contributions prevent upfront deposit delays at private and emergency hospitals.</p>
              <button type="button" onClick={() => setIsTopUpModalOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-[#007e88] hover:bg-[#006b73] active:scale-95 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-all cursor-pointer">
                Top up your emergency fund <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="hidden sm:flex shrink-0 w-24 h-24 rounded-full border-4 border-white/80 items-center justify-center bg-cyan-100/50 shadow-inner">
              <ShieldCheck className="w-12 h-12 text-[#078696]" />
            </div>
          </section>
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div id="balance" className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500"><WalletCards className="w-4 h-4 text-slate-400" /> Dedicated Health Balance</span>
                  <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">₦{balance.toLocaleString()}</p>
                </div>
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Fund Active</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                  <span>{percentage}% of goal reached</span>
                  <span>Target Goal: ₦{goal.toLocaleString()}</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-[#008b98] transition-all duration-500" style={{ width: `${percentage}%` }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button type="button" onClick={() => setIsTopUpModalOpen(true)} className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#007e88] hover:bg-[#006b73] active:scale-95 py-3 text-xs font-bold text-white shadow-xs transition-all cursor-pointer">
                  <Plus className="w-4 h-4" /> Add to fund
                </button>
                <button type="button" onClick={() => setIsManageModalOpen(true)} className="rounded-xl border border-[#008b98] py-3 text-xs font-bold text-[#007e88] hover:bg-cyan-50 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" /> Manage Settings
                </button>
              </div>
            </div>
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-700"><Landmark className="w-4 h-4" /></div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Wema Bank ALAT</span>
                      <span className="text-[10px] text-slate-500">{isWemaConnected ? `Account: •••• ${wemaAccountNumber.slice(-4) || "4092"}` : "No bank account connected"}</span>
                    </div>
                  </div>
                  {isWemaConnected ? <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1"><Check className="w-3 h-3" /> Secure</span> : <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">Not Linked</span>}
                </div>
                {isWemaConnected ? (
                  <div className="space-y-3 pt-1 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium"><Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> <span>Connected successfully • Auto-deposit authorized</span></div>
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-[11px] text-slate-500">{wemaAccountName}</span>
                      <button type="button" onClick={handleDisconnectWema} className="text-[11px] font-bold text-red-600 hover:text-red-700 hover:underline cursor-pointer flex items-center gap-1"><Unlink className="w-3 h-3" /> Disconnect</button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 pt-1 border-t border-slate-100">
                    <p className="text-xs text-slate-600 leading-relaxed">Connect your Wema Bank / ALAT account to enable automatic emergency funding and instant hospital deposits.</p>
                    <button type="button" onClick={() => setIsWemaModalOpen(true)} className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-[#007e88] hover:bg-[#006b73] active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"><Link2 className="w-3.5 h-3.5" /> <span>Connect your Wema Bank</span></button>
                  </div>
                )}
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900">Trusted Contacts</span>
                    <span className="text-[11px] font-semibold text-slate-400">({contacts.length}/4)</span>
                  </div>
                  {contacts.length < 4 && (
                    <Link
                      href="/care-support/add-contact"
                      className="text-xs font-bold text-cyan-700 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> <span>{contacts.length === 0 ? "Add Contact" : "Add More"}</span>
                    </Link>
                  )}
                </div>
                {contacts.length === 0 ? (
                  <div className="py-6 px-3 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2.5">
                    <div className="w-9 h-9 rounded-full bg-cyan-50 text-cyan-700 mx-auto flex items-center justify-center">
                      <UsersRound className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-800">No emergency contacts added</p>
                      <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                        Add trusted family members or doctors who should be alerted during severe medical situations.
                      </p>
                    </div>
                    <Link
                      href="/care-support/add-contact"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-teal-300 text-teal-800 text-xs font-bold hover:bg-teal-50 shadow-2xs transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-teal-600" /> <span>Add emergency contact</span>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {contacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-teal-50/40 border border-slate-150 transition-colors group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-xs font-bold border ${contact.color}`}
                          >
                            {contact.initials}
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <strong className="block text-xs font-bold text-slate-900 truncate">
                                {contact.name}
                              </strong>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-teal-100 text-teal-800 border border-teal-200">
                                {contact.relation}
                              </span>
                            </div>
                            <small className="block text-[11px] text-slate-500 truncate mt-0.5">
                              {contact.phone}
                            </small>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveContact(contact.id)}
                          title="Remove contact"
                          className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-white transition-colors cursor-pointer"
                          aria-label={`Remove ${contact.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    {contacts.length < 4 ? (
                      <div className="pt-1.5 text-center">
                        <Link
                          href="/care-support/add-contact"
                          className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-teal-50/60 hover:bg-teal-100/60 text-teal-800 text-xs font-bold border border-teal-200/60 transition-all cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 text-teal-600" /> Add more contacts ({4 - contacts.length} remaining)
                        </Link>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-teal-50/70 border border-teal-100 text-center text-xs font-bold text-teal-800 flex items-center justify-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-teal-600" /> Maximum 4 emergency contacts reached
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>
          <section className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Care Support Pillars</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: LockKeyhole, title: "Save steadily", text: "Add small amounts to your dedicated health wallet over time to build financial resilience." },
                { icon: Building2, title: "Instant admission", text: "Pay for medications, ambulance transfer, or clinic admissions with zero delays." },
                { icon: UsersRound, title: "Trusted circle support", text: "Alert designated family members to approve pooled emergency hospital deposits." },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-2xl bg-[#d7f3f5] p-5 space-y-3 border border-teal-200/50">
                    <div className="w-8 h-8 rounded-xl bg-white text-cyan-700 flex items-center justify-center shadow-2xs"><Icon className="w-4 h-4" /></div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">0{index + 1}. {item.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-600">{item.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
          <section className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div>
              <h3 className="text-base font-bold text-slate-900">Need urgent clinical triage?</h3>
              <p className="text-xs text-slate-500 mt-1">Connect with AI symptom triage or trigger national emergency dispatch.</p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Link href="/consultation" className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl border border-cyan-600 px-4 py-2.5 text-xs font-bold text-cyan-700 hover:bg-cyan-50 transition-colors"><MessageCircle className="w-3.5 h-3.5" /> Start consultation</Link>
              <button type="button" onClick={() => setIsEmergencyOpen(true)} className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-red-700 transition-colors cursor-pointer"><Phone className="w-3.5 h-3.5" /> Emergency SOS</button>
            </div>
          </section>
        </main>
      </div>
      {isTopUpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-5 animate-scale-in">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center"><CreditCard className="w-5 h-5" /></div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Top Up Care Fund</h3>
                  <p className="text-xs text-slate-500">{isWemaConnected ? "Direct debit from connected Wema Bank account" : "Deposit funds into your emergency care reserve"}</p>
                </div>
              </div>
              <button type="button" onClick={() => setIsTopUpModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {[2000, 5000, 10000, 20000].map((amt) => (
                <button key={amt} type="button" onClick={() => { setSelectedTopUp(amt); setCustomAmount(""); }} className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer ${selectedTopUp === amt && !customAmount ? "bg-teal-600 text-white border-teal-600 shadow-xs" : "bg-slate-50 border-slate-200 text-slate-700 hover:border-teal-400"}`}>₦{amt.toLocaleString()}</button>
              ))}
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Or enter custom amount (₦)</label>
              <input type="number" placeholder="e.g. 15000" value={customAmount} onChange={(e) => setCustomAmount(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={handleDeposit} className="flex-1 py-3 px-4 bg-[#007e88] hover:bg-[#006b73] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer">Confirm Deposit</button>
              <button type="button" onClick={() => setIsTopUpModalOpen(false)} className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer">Cancel</button>
            </div>
          </div>
        </div>
      )}
      {isWemaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-5 animate-scale-in">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center"><Landmark className="w-5 h-5" /></div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Connect Wema Bank</h3>
                  <p className="text-xs text-slate-500">Link your Wema / ALAT account securely</p>
                </div>
              </div>
              <button type="button" onClick={() => setIsWemaModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleConnectWema} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Account Name</label>
                <input type="text" value={wemaAccountName} onChange={(e) => setWemaAccountName(e.target.value)} placeholder="Ruqayah Adebayo" required className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">10-Digit Wema Account Number</label>
                <input type="text" maxLength={10} placeholder="0123456789" value={wemaAccountNumber} onChange={(e) => setWemaAccountNumber(e.target.value.replace(/\D/g, ""))} required className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 tracking-wider font-mono" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Phone Number linked to ALAT</label>
                <input type="tel" placeholder="+234 801 234 5678" value={wemaBvnPhone} onChange={(e) => setWemaBvnPhone(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div className="p-3 rounded-xl bg-teal-50 border border-teal-100 text-[11px] text-teal-800 space-y-1">
                <div className="flex items-center gap-1.5 font-bold"><ShieldCheck className="w-3.5 h-3.5 text-teal-700" /> <span>Verified Financial Bridge</span></div>
                <p className="text-teal-700/90 leading-relaxed">Authorizes automated emergency hospital deposit transfers in clinical critical triage situations.</p>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={isConnectingWema} className="flex-1 py-3 px-4 bg-[#007e88] hover:bg-[#006b73] text-white font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2">{isConnectingWema ? <span>Verifying Account...</span> : <><Link2 className="w-4 h-4" /> <span>Verify & Connect Account</span></>}</button>
                <button type="button" onClick={() => setIsWemaModalOpen(false)} className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isManageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-5 animate-scale-in">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center"><Sliders className="w-5 h-5" /></div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Manage Fund Goal</h3>
                  <p className="text-xs text-slate-500">Update your target healthcare reserve</p>
                </div>
              </div>
              <button type="button" onClick={() => setIsManageModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Target Savings Goal (₦)</label>
                <input type="number" value={goal} onChange={(e) => setGoal(Number(e.target.value) || 10000)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold" />
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-2">
                <div className="flex items-center justify-between font-semibold text-slate-800">
                  <span>Auto-deposit frequency</span>
                  <span className="text-teal-700">Weekly (₦2,500)</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">Automatic deductions from Wema ALAT will pause when your target is reached.</p>
              </div>
            </div>
            <div className="pt-2">
              <button type="button" onClick={() => { setIsManageModalOpen(false); showToast("Savings target updated successfully!"); }} className="w-full py-3 px-4 bg-[#007e88] hover:bg-[#006b73] text-white text-xs font-bold rounded-xl transition-all cursor-pointer">Save Changes</button>
            </div>
          </div>
        </div>
      )}
      {isContactsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-5 animate-scale-in">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center"><UserPlus className="w-5 h-5" /></div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Add Emergency Contact</h3>
                  <p className="text-xs text-slate-500">Contact {contacts.length + 1} of 4 maximum</p>
                </div>
              </div>
              <button type="button" onClick={() => setIsContactsModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddContact} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Contact Name</label>
                <input type="text" placeholder="e.g. Oluwaseun Adebayo" value={newContactName} onChange={(e) => setNewContactName(e.target.value)} required className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Relationship</label>
                <select value={newContactRelation} onChange={(e) => setNewContactRelation(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                  <option value="Mother">Mother</option>
                  <option value="Father">Father</option>
                  <option value="Sister">Sister</option>
                  <option value="Brother">Brother</option>
                  <option value="Husband / Wife">Husband / Wife</option>
                  <option value="Doctor / Caregiver">Doctor / Caregiver</option>
                  <option value="Primary Emergency">Primary Emergency Contact</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                <input type="tel" placeholder="+234 801 234 5678" value={newContactPhone} onChange={(e) => setNewContactPhone(e.target.value)} required className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 py-3 px-4 bg-[#007e88] hover:bg-[#006b73] text-white font-bold rounded-xl transition-all shadow-xs cursor-pointer">Save Emergency Contact</button>
                <button type="button" onClick={() => setIsContactsModalOpen(false)} className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer">Close</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <MobileNav />
      <EmergencyModal isOpen={isEmergencyOpen} onClose={() => setIsEmergencyOpen(false)} />
    </div>
  );
}