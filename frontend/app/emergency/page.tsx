"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Phone,
  Mic,
  MessageSquare,
  AlertTriangle,
  MapPin,
  ShieldAlert,
  ArrowLeft,
  Volume2,
  Lock,
  ChevronDown,
  ChevronUp,
  Activity,
  Heart,
  Flame,
  UserX,
  AlertCircle,
  Copy,
  Check,
  Navigation,
  Plus,
  Car,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  X,
} from "lucide-react";
import VoiceListeningBox from "@/components/VoiceListeningBox";
import MobileNav from "@/components/MobileNav";
import { HospitalItem } from "@/components/RealMap";
import { api } from "@/lib/api";
import { getStoredUser } from "@/app/services/authService";

// Dynamic import for Leaflet map component (No SSR)
const RealMap = dynamic(() => import("@/components/RealMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[460px] rounded-3xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center gap-2 text-slate-500 font-medium text-xs">
      <div className="w-8 h-8 rounded-full border-2 border-teal-600 border-t-transparent animate-spin" />
      <span>Loading interactive emergency map...</span>
    </div>
  ),
});

export default function EmergencyPage() {
  const router = useRouter();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [viewMode, setViewMode] = useState<"options" | "listening" | "care-map">("options");
  const [spokenText, setSpokenText] = useState("");
  const [cantSpeakOpen, setCantSpeakOpen] = useState(false);
  const [selectedEmergencyType, setSelectedEmergencyType] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState("Lagos, Nigeria");
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: 6.5244, lng: 3.3792 });
  const [copiedLocation, setCopiedLocation] = useState(false);
  const [activeNumber, setActiveNumber] = useState("112");
  const [selectedHospital, setSelectedHospital] = useState<HospitalItem | null>(null);
  const [nearbyHospitals, setNearbyHospitals] = useState<any[]>([]);
  const [isFetchingHospitals, setIsFetchingHospitals] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  // Fetch nearby emergency hospitals from backend
  const fetchNearbyHospitals = async (lat: number, lng: number) => {
    setIsFetchingHospitals(true);
    try {
      const result = await api.get(`/hospitals/nearby?latitude=${lat}&longitude=${lng}&radius=15`);
      setNearbyHospitals(result.data?.hospitals || []);
    } catch (err) {
      setNearbyHospitals([]);
    } finally {
      setIsFetchingHospitals(false);
    }
  };

  useEffect(() => {
    const user = getStoredUser();
    if (!user) {
      router.push("/signin");
      return;
    }

    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setCoords({ lat, lng });
          setUserLocation(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
          fetchNearbyHospitals(lat, lng);
        },
        () => {
          setUserLocation("Lagos, Nigeria");
          fetchNearbyHospitals(6.5244, 3.3792);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      fetchNearbyHospitals(6.5244, 3.3792);
    }
  }, [router]);

  const emergencyNumbers = [
    { label: "112 National Emergency", number: "112", description: "Police, Fire & Ambulance" },
    { label: "767 Lagos State Emergency", number: "767", description: "LASEMA Quick Response" },
    { label: "199 Federal Fire Service", number: "199", description: "Fire & Rescue" },
    { label: "Red Cross Ambulance", number: "+23480073327677", description: "First Aid & Medical Dispatch" },
  ];

  const quickEmergencies = [
    { id: "chest-pain", label: "Chest pain / Heart", icon: Heart, color: "border-red-300 bg-red-50 text-red-700" },
    { id: "unconscious", label: "Unconscious / Fainted", icon: UserX, color: "border-amber-300 bg-amber-50 text-amber-800" },
    { id: "choking", label: "Choking / Can't breathe", icon: Activity, color: "border-rose-300 bg-rose-50 text-rose-800" },
    { id: "bleeding", label: "Severe bleeding / Trauma", icon: AlertTriangle, color: "border-red-300 bg-red-50 text-red-700" },
    { id: "fire", label: "Fire / Burn hazard", icon: Flame, color: "border-orange-300 bg-orange-50 text-orange-800" },
    { id: "danger", label: "Immediate personal danger", icon: ShieldAlert, color: "border-purple-300 bg-purple-50 text-purple-800" },
  ];

  const handleStartSpeaking = async () => {
    setViewMode("listening");
    setSpokenText("");
    setApiError("");
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });
      mediaRecorderRef.current = mr;
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mr.start();
      setIsRecording(true);
    } catch {
      setApiError("Microphone access denied. Please enable it in your browser settings.");
      setViewMode("options");
    }
  };

  const copyLocationToClipboard = () => {
    const locText = `EMERGENCY DISPATCH: I need help at ${userLocation} (${coords ? `Lat: ${coords.lat}, Lng: ${coords.lng}` : ""})`;
    navigator.clipboard.writeText(locText);
    setCopiedLocation(true);
    setTimeout(() => setCopiedLocation(false), 3000);
  };

  const currentHospital = selectedHospital || (nearbyHospitals.length > 0 ? nearbyHospitals[0] : null);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-red-100 selection:text-red-900 relative overflow-hidden">
      {/* Ambient Urgent Glow Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-red-100/50 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* ========================================================================= */}
      {/* 1. TOP HEADER BAR (EXACT FIGMA MATCH)                                     */}
      {/* ========================================================================= */}
      <header className="px-6 sm:px-12 py-5 flex items-center justify-between border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 cursor-pointer group">
            <div className="flex items-center gap-0.5 h-6">
              <span className="w-1 h-3.5 bg-[#006666] rounded-full" />
              <span className="w-1 h-5.5 bg-[#006666] rounded-full" />
              <span className="w-1 h-4 bg-[#006666] rounded-full" />
              <span className="w-1 h-5 bg-[#006666] rounded-full" />
            </div>
            <span className="text-2xl font-extrabold text-[#005c6e] tracking-tight">
              Alaafia
            </span>
          </Link>

          {/* Pulsing Emergency Badge (Matching Figma) */}
          <div className="flex items-center gap-1.5 bg-red-50 border border-red-200/80 px-3 py-1 rounded-full shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
            </span>
            <span className="text-[10px] font-extrabold tracking-wider text-red-600 uppercase">
              EMERGENCY MODE
            </span>
          </div>
        </div>

        {/* Right Action: Quick CALL 112 Button on Header */}
        <a
          href={`tel:${activeNumber}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#b91c1c] hover:bg-[#991b1b] text-white text-xs font-bold transition-all shadow-md active:scale-95"
        >
          <Phone className="w-3.5 h-3.5 text-white" />
          <span>CALL {activeNumber}</span>
        </a>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN VIEW SWITCHER                                                    */}
      {/* ========================================================================= */}
      {viewMode === "care-map" ? (
        /* ======================================================================= */
        /* VIEW C: EMERGENCY CARE NEAR YOU (EXACT FIGMA SCREENSHOT MATCH)          */
        /* ======================================================================= */
        <main className="flex-1 max-w-7xl mx-auto w-full px-5 sm:px-8 py-8 sm:py-10 space-y-8 animate-in fade-in duration-300">
          {/* Top Location Subtitle & Headline */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200/80 px-3.5 py-1.5 rounded-full">
              <MapPin className="w-3.5 h-3.5 text-teal-600" />
              <span>Location found: <strong>{userLocation}</strong></span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Emergency care near you
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm max-w-3xl leading-relaxed">
              We've found emergency-capable care based on your location. Please proceed immediately or call for help if you cannot travel.
            </p>
          </div>

          {/* Grid Layout: Map Column (Left 7 Cols) & Facility Cards (Right 5 Cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: INTERACTIVE MAP WITH USER LOCATION & ROUTE */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-3 border border-slate-200 shadow-xl overflow-hidden min-h-[480px]">
              <RealMap
                selectedHospitalDirections={currentHospital}
              />
            </div>

            {/* RIGHT COLUMN: RECOMMENDED HERO FACILITY & SURROUNDING CARE */}
            <div className="lg:col-span-5 space-y-6">
              {/* RECOMMENDED FACILITY HERO CARD */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-red-200 shadow-xl space-y-5 relative overflow-hidden">
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900">
                      {currentHospital?.name || "Loading nearby hospitals..."}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1 text-xs font-bold text-red-600">
                      <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                      <span>
                        {currentHospital?.emergencyCapable !== false
                          ? "Verified Emergency Department"
                          : currentHospital?.facilityType || "Healthcare Facility"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Distance & Travel Time Pills */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-2xl text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Distance
                    </span>
                    <span className="text-sm font-extrabold text-slate-900 block mt-0.5">
                      {currentHospital?.distanceKm
                        ? `${currentHospital.distanceKm.toFixed(1)} km`
                        : currentHospital?.distance
                        ? `${currentHospital.distance} km`
                        : "Calculating..."}
                    </span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-2xl text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Est. Travel
                    </span>
                    <span className="text-sm font-extrabold text-slate-900 block mt-0.5">
                      {currentHospital?.distanceKm
                        ? `~${Math.round(currentHospital.distanceKm * 3)} min`
                        : "Calculating..."}
                    </span>
                  </div>
                </div>

                {/* Why This Facility Box */}
                <div className="bg-[#f0fdfa] border border-teal-200/80 rounded-2xl p-4 space-y-2.5">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-800 block">
                    WHY THIS FACILITY?
                  </span>
                  <div className="space-y-2 text-xs text-slate-700 font-medium">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>{currentHospital?.emergencyCapable !== false ? "Verified emergency-capable" : "Healthcare facility"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>Nearest available option</span>
                    </div>
                    {currentHospital?.capabilities && (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                        <span>Capabilities: {Array.isArray(currentHospital.capabilities) ? currentHospital.capabilities.join(", ") : currentHospital.capabilities}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Primary Dual Actions */}
                <div className="space-y-3 pt-1">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${currentHospital?.latitude || currentHospital?.lat || coords.lat},${currentHospital?.longitude || currentHospital?.lng || coords.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-[#005c6e] hover:bg-[#004d4d] active:bg-[#003d4a] text-white font-black py-3.5 px-5 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer"
                  >
                    <Car className="w-4 h-4 text-white" />
                    <span>GET DIRECTIONS</span>
                    <span className="text-[10px] font-normal text-teal-100 lowercase">Open in Maps</span>
                  </a>

                  {currentHospital?.phone && (
                    <a
                      href={`tel:${currentHospital.phone}`}
                      className="w-full bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-800 font-bold py-3 px-5 rounded-2xl shadow-2xs transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5 text-slate-600" />
                      <span>CALL FACILITY</span>
                    </a>
                  )}
                </div>
              </div>

              {/* OTHER NEARBY EMERGENCY CARE SECTION */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Other nearby emergency care
                </h4>

                <div className="space-y-3">
                  {isFetchingHospitals ? (
                    <div className="p-4 bg-white rounded-2xl border border-slate-200 text-xs text-slate-500 text-center animate-pulse">
                      Searching emergency facilities near you...
                    </div>
                  ) : nearbyHospitals.length > 1 ? (
                    nearbyHospitals.slice(1, 4).map((h: any, idx: number) => (
                      <div
                        key={h.id || idx}
                        className="p-4 rounded-2xl border border-slate-200/90 hover:border-teal-300 transition-all flex items-center justify-between gap-3 bg-slate-50/50"
                      >
                        <div className="space-y-0.5">
                          <h5 className="text-sm font-bold text-slate-900">{h.name}</h5>
                          <p className="text-xs text-slate-500 font-medium">
                            {h.distanceKm ? `${h.distanceKm.toFixed(1)} km` : ""} • {h.facilityType || "Hospital"}
                          </p>
                        </div>

                        <button
                          onClick={() => setSelectedHospital(h)}
                          className="text-xs font-semibold text-[#006666] hover:bg-teal-50 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                        >
                          View
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-xs text-slate-500 text-center">
                      No other nearby facilities found
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation Back */}
              <button
                onClick={() => setViewMode("options")}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to emergency options</span>
              </button>
            </div>
          </div>
        </main>
      ) : viewMode === "listening" ? (
        /* ======================================================================= */
        /* VIEW B: EMERGENCY LISTENING STATE (EXACT FIGMA SCREENSHOT MATCH)        */
        /* ======================================================================= */
        <main className="flex-1 max-w-3xl mx-auto w-full px-5 sm:px-8 py-8 sm:py-12 space-y-6 flex flex-col justify-center text-center animate-in fade-in duration-300">
          {/* Main Title */}
          <div className="space-y-1.5">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              I'm listening.
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Tell me what is happening. You can speak naturally.
            </p>
          </div>

          {/* Voice Listening States Box (All 4 Figma States) */}
          <VoiceListeningBox
            initialState="active"
            defaultText={spokenText}
            onTranscriptChange={(txt) => setSpokenText(txt)}
            emergencyMode
            emergencyNumber={activeNumber}
          />

          {/* Bottom Dual Action Buttons (Side by Side Matching Figma Screenshot 2) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-xl mx-auto w-full pt-1">
            {/* Left Button: CALL 112 (Solid Red) */}
            <a
              href={`tel:${activeNumber}`}
              className="w-full sm:flex-1 bg-[#b91c1c] hover:bg-[#991b1b] active:bg-[#7f1d1d] text-white font-black py-3.5 px-6 rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-xs sm:text-sm uppercase tracking-wider cursor-pointer group"
            >
              <span className="text-white font-bold text-sm">✱</span>
              <span>CALL {activeNumber}</span>
            </a>

            {/* Right Button: FIND EMERGENCY CARE (Solid Teal -> Opens Care Map Screen) */}
            <button
              onClick={() => {
                fetchNearbyHospitals(coords.lat, coords.lng);
                setViewMode("care-map");
              }}
              className="w-full sm:flex-1 bg-[#005c6e] hover:bg-[#004d4d] active:bg-[#003d4a] text-white font-black py-3.5 px-6 rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-xs sm:text-sm uppercase tracking-wider cursor-pointer"
            >
              <span className="text-white font-bold text-base leading-none">✚</span>
              <span>FIND EMERGENCY CARE</span>
            </button>
          </div>

          {/* Return link to first screen */}
          <div className="pt-1">
            <button
              onClick={() => setViewMode("options")}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to emergency options</span>
            </button>
          </div>
        </main>
      ) : (
        /* ======================================================================= */
        /* VIEW A: INITIAL EMERGENCY SCREEN (CALL 112 HERO + SPEAK TO ALAAFIA)    */
        /* ======================================================================= */
        <main className="flex-1 max-w-2xl mx-auto w-full px-5 sm:px-8 py-10 sm:py-14 space-y-8 flex flex-col justify-center animate-in fade-in duration-300">
          {/* Main Centered Headline */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Are you or someone with <br className="hidden sm:inline" />
              you in immediate danger?
            </h1>
          </div>

          {apiError && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl px-4 py-3 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{apiError}</span>
              <button onClick={() => setApiError("")} className="ml-auto shrink-0 cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* PRIMARY HERO ACTION: CALL 112 (Red Glowing Card Matching Figma) */}
          <div className="space-y-3">
            <a
              href={`tel:${activeNumber}`}
              className="w-full bg-[#b91c1c] hover:bg-[#991b1b] active:bg-[#7f1d1d] text-white p-7 sm:p-9 rounded-3xl shadow-xl shadow-red-900/20 hover:shadow-red-900/30 flex flex-col items-center justify-center space-y-2 transition-all transform hover:-translate-y-1 active:scale-[0.99] cursor-pointer group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl sm:text-3xl font-black tracking-tight uppercase">
                CALL {activeNumber}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-red-100/90 tracking-wide">
                Emergency assistance
              </span>
            </a>

            {/* Quick Line Selector */}
            <div className="flex items-center justify-center gap-2 flex-wrap text-xs">
              {emergencyNumbers.map((item) => (
                <button
                  key={item.number}
                  onClick={() => setActiveNumber(item.number)}
                  className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-semibold ${
                    activeNumber === item.number
                      ? "bg-red-50 text-red-700 border-red-300 font-bold"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* SECONDARY ACTION: SPEAK TO ALAAFIA (White Card with Teal Accent Matching Figma) */}
          <button
            onClick={handleStartSpeaking}
            className="w-full bg-white hover:bg-slate-50 border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex items-center gap-4 cursor-pointer text-left group"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#006666] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <Mic className="w-6 h-6" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-base font-extrabold text-slate-900">
                Speak to Alaafia
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Tell us what is happening
              </p>
            </div>
          </button>

          {/* "I CAN'T SPEAK" TOGGLE (Matching Figma) */}
          <div className="text-center space-y-3">
            <button
              onClick={() => setCantSpeakOpen(!cantSpeakOpen)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200/90 px-4 py-2 rounded-full shadow-2xs transition-all cursor-pointer"
            >
              <span>⌨️ I can't speak</span>
              {cantSpeakOpen ? (
                <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {/* Quick-tap Emergency Categories if user cannot speak */}
            {cantSpeakOpen && (
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-md space-y-4 text-left animate-in fade-in duration-200">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Select your emergency condition:
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Tap to prepare your instant location & dispatch text
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {quickEmergencies.map((item) => {
                    const Icon = item.icon;
                    const isSelected = selectedEmergencyType === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setSelectedEmergencyType(item.id)}
                        className={`p-3 rounded-2xl border flex items-center gap-2.5 text-xs font-bold transition-all text-left cursor-pointer ${
                          isSelected
                            ? "border-red-600 bg-red-50 text-red-800 shadow-2xs"
                            : "border-slate-200 hover:border-red-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <Icon className="w-4 h-4 text-red-600 shrink-0" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>

                {selectedEmergencyType && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-2xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-red-900">Your Emergency Summary Ready:</span>
                      <button
                        onClick={copyLocationToClipboard}
                        className="text-[10px] font-bold text-red-700 bg-white px-2 py-1 rounded-lg border border-red-200 flex items-center gap-1 hover:bg-red-50"
                      >
                        {copiedLocation ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedLocation ? "Copied!" : "Copy for SMS"}</span>
                      </button>
                    </div>
                    <p className="text-slate-700 italic">
                      "URGENT: {quickEmergencies.find((q) => q.id === selectedEmergencyType)?.label}. Location: {userLocation}."
                    </p>
                    <a
                      href={`tel:${activeNumber}`}
                      className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Dial {activeNumber} with this info</span>
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* DIRECT ACTION TO EMERGENCY CARE MAP SCREEN */}
          <button
            onClick={() => {
              fetchNearbyHospitals(coords.lat, coords.lng);
              setViewMode("care-map");
            }}
            className="w-full bg-[#005c6e] hover:bg-[#004d4d] text-white font-bold py-3.5 px-6 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer"
          >
            <MapPin className="w-4 h-4 text-white" />
            <span>FIND EMERGENCY CARE NEAR YOU</span>
          </button>

          {/* BOTTOM WARNING DISCLAIMER BOX (Matching Figma) */}
          <div className="bg-[#fee2e2]/60 border border-red-200/90 rounded-2xl p-4 sm:p-5 flex items-start gap-3 text-xs text-slate-700">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-red-950 font-bold">Important:</strong> If this is life-threatening, call {activeNumber} immediately. Do not wait for Alaafia to assess the situation.
            </p>
          </div>

          {/* Safe Return Navigation */}
          <div className="text-center pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to safe navigation</span>
            </Link>
          </div>
        </main>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 text-xs text-slate-500 py-4 px-6 text-center pb-20 md:pb-4">
        <span>Alaafia Emergency Direct Access • 24/7 Priority Channel</span>
      </footer>

      {/* Mobile Navigation Bar */}
      <MobileNav />
    </div>
  );
}
