"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Mic,
  MicOff,
  Phone,
  RefreshCw,
  AlertCircle,
  Volume2,
  VolumeX,
  Shield,
  Check,
  ChevronRight,
} from "lucide-react";

export type ListeningState = "active" | "silent" | "error" | "processing";

interface VoiceListeningBoxProps {
  initialState?: ListeningState;
  onTranscriptChange?: (text: string) => void;
  onStateChange?: (state: ListeningState) => void;
  onFinish?: (text: string) => void;
  emergencyMode?: boolean;
  emergencyNumber?: string;
  defaultText?: string;
}

export default function VoiceListeningBox({
  initialState = "active",
  onTranscriptChange,
  onStateChange,
  onFinish,
  emergencyMode = false,
  emergencyNumber = "112",
  defaultText = "I'm experiencing severe chest pain and shortness of breath...",
}: VoiceListeningBoxProps) {
  const [currentState, setCurrentState] = useState<ListeningState>(initialState);
  const [liveTranscript, setLiveTranscript] = useState(defaultText);
  const [micPermission, setMicPermission] = useState<"prompt" | "granted" | "denied">("prompt");
  const [speechTimer, setSpeechTimer] = useState<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);

  // Sync state changes upward
  const changeState = (newState: ListeningState) => {
    setCurrentState(newState);
    if (onStateChange) onStateChange(newState);
  };

  // Web Speech API / Real Microphone Integration
  const startRealListening = async () => {
    try {
      // Check browser microphone permissions
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          setMicPermission("granted");
          // Stop stream tracks after permission check so speech recognition can use it
          stream.getTracks().forEach((track) => track.stop());
        } catch (err: any) {
          if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
            setMicPermission("denied");
            changeState("error");
            return;
          }
        }
      }

      // Check SpeechRecognition support
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-NG"; // Supports Nigerian English / English

        recognition.onstart = () => {
          changeState("active");
        };

        recognition.onresult = (event: any) => {
          let interimTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            interimTranscript += event.results[i][0].transcript;
          }
          if (interimTranscript.trim()) {
            setLiveTranscript(interimTranscript);
            if (onTranscriptChange) onTranscriptChange(interimTranscript);
          }
        };

        recognition.onerror = (event: any) => {
          if (event.error === "not-allowed" || event.error === "service-not-allowed") {
            changeState("error");
          } else if (event.error === "no-speech") {
            changeState("silent");
          } else if (event.error === "network") {
            changeState("processing");
          }
        };

        recognition.onend = () => {
          // If ended without speech
          if (!liveTranscript) {
            changeState("silent");
          }
        };

        recognition.start();
      } else {
        // Fallback for browsers without speech recognition: active simulated typing stream
        changeState("active");
      }
    } catch (e) {
      changeState("active");
    }
  };

  useEffect(() => {
    if (initialState === "active") {
      startRealListening();
    }
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  const handleTryAgain = () => {
    setLiveTranscript("");
    changeState("active");
    startRealListening();
  };

  const handleRequestMicAccess = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicPermission("granted");
        handleTryAgain();
      } else {
        handleTryAgain();
      }
    } catch (e) {
      changeState("error");
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* State Switcher Tabs (For easy manual testing of all 4 states) */}
      <div className="flex items-center justify-center gap-1.5 flex-wrap text-[11px] bg-slate-100 p-1 rounded-xl max-w-md mx-auto">
        <button
          type="button"
          onClick={() => {
            changeState("active");
            if (!liveTranscript) setLiveTranscript(defaultText);
          }}
          className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
            currentState === "active"
              ? "bg-white text-[#006666] shadow-xs"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          ● Active
        </button>
        <button
          type="button"
          onClick={() => changeState("silent")}
          className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
            currentState === "silent"
              ? "bg-white text-slate-800 shadow-xs"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          ● Silent
        </button>
        <button
          type="button"
          onClick={() => changeState("error")}
          className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
            currentState === "error"
              ? "bg-white text-red-600 shadow-xs"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          ● Error (No Mic)
        </button>
        <button
          type="button"
          onClick={() => changeState("processing")}
          className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
            currentState === "processing"
              ? "bg-white text-teal-600 shadow-xs"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          ● Processing
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 4 FIGMA STATE VARIANTS                                                    */}
      {/* ========================================================================= */}

      {/* ------------------------------------------------------------------------- */}
      {/* 1. STATE: ACTIVE (Live Transcribing with Audio Waves)                     */}
      {/* ------------------------------------------------------------------------- */}
      {currentState === "active" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 relative overflow-hidden animate-in fade-in duration-200">
          {/* Top Pill Badge */}
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-100 text-[#006666] text-[11px] font-bold tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-[#006666] animate-ping" />
              <span>State: Active</span>
            </span>
            <span className="text-[11px] text-slate-400 font-medium">Live audio feed</span>
          </div>

          {/* Animated Dynamic Waveform Bars */}
          <div className="flex items-center justify-center gap-1.5 h-12 py-1">
            <span className="w-1 bg-[#006666] rounded-full animate-bounce [animation-delay:-0.3s] h-4" />
            <span className="w-1 bg-[#006666] rounded-full animate-bounce [animation-delay:-0.15s] h-8" />
            <span className="w-1 bg-[#006666] rounded-full animate-bounce [animation-delay:-0.4s] h-5" />
            <span className="w-1 bg-[#006666] rounded-full animate-bounce [animation-delay:-0.2s] h-11" />
            <span className="w-1 bg-[#006666] rounded-full animate-bounce [animation-delay:-0.35s] h-7" />
            <span className="w-1 bg-[#006666] rounded-full animate-bounce [animation-delay:-0.1s] h-10" />
            <span className="w-1 bg-[#006666] rounded-full animate-bounce [animation-delay:-0.25s] h-8" />
            <span className="w-1 bg-[#006666] rounded-full animate-bounce [animation-delay:-0.45s] h-5" />
            <span className="w-1 bg-[#006666] rounded-full animate-bounce [animation-delay:-0.18s] h-9" />
            <span className="w-1 bg-[#006666] rounded-full animate-bounce [animation-delay:-0.3s] h-4" />
          </div>

          {/* Live Transcript Quote (Matching Figma) */}
          <div className="p-5 sm:p-6 bg-teal-50/50 rounded-2xl border border-teal-100 text-center min-h-[90px] flex items-center justify-center">
            <p className="text-base sm:text-lg font-bold text-[#005c6e] italic leading-relaxed max-w-lg mx-auto">
              "{liveTranscript || defaultText}"
            </p>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* 2. STATE: SILENT (No speech heard / Try Again button)                     */}
      {/* ------------------------------------------------------------------------- */}
      {currentState === "silent" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 relative overflow-hidden text-center animate-in fade-in duration-200">
          {/* Top Pill Badge */}
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-bold tracking-wide uppercase">
              <span>State: Silent</span>
            </span>
            <span className="text-[11px] text-slate-400 font-medium">No audio detected</span>
          </div>

          {/* Flat Horizontal Sound Line (Matching Figma) */}
          <div className="py-6 flex items-center justify-center">
            <div className="w-48 h-0.5 bg-slate-300 rounded-full" />
          </div>

          {/* Subtext */}
          <div className="space-y-1">
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              We didn't hear anything. You can speak again.
            </p>
          </div>

          {/* Action: TRY AGAIN Button (Matching Figma) */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleTryAgain}
              className="px-6 py-2.5 rounded-xl border border-slate-300 hover:border-teal-600 bg-white hover:bg-teal-50 text-slate-800 hover:text-[#006666] text-xs font-extrabold uppercase tracking-wider transition-all shadow-2xs cursor-pointer inline-flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>TRY AGAIN</span>
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* 3. STATE: ERROR (Microphone Permission Denied / Blocked)                  */}
      {/* ------------------------------------------------------------------------- */}
      {currentState === "error" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-red-200 shadow-sm space-y-5 relative overflow-hidden text-center animate-in fade-in duration-200">
          {/* Top Pill Badge */}
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-[11px] font-bold tracking-wide uppercase">
              <AlertCircle className="w-3 h-3 text-red-600" />
              <span>State: Error</span>
            </span>
            <span className="text-[11px] text-red-500 font-medium">Access blocked</span>
          </div>

          {/* Slashed Red Mic Icon Badge (Matching Figma) */}
          <div className="mx-auto w-14 h-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shadow-xs">
            <MicOff className="w-7 h-7" />
          </div>

          {/* Headline & Subtext (Matching Figma) */}
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              We can't access your microphone.
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Please enable permissions in your browser settings or proceed to manual input.
            </p>
          </div>

          {/* Dual Action Buttons (Enable microphone + CALL 112 Matching Figma) */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleRequestMicAccess}
              className="px-4 py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
            >
              Enable microphone
            </button>

            <a
              href={`tel:${emergencyNumber}`}
              className="px-5 py-2.5 rounded-xl bg-[#b91c1c] hover:bg-[#991b1b] text-white text-xs font-bold shadow-xs transition-all inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>✱</span>
              <span>CALL {emergencyNumber}</span>
            </a>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* 4. STATE: PROCESSING (Slow connection / Analyzing audio)                  */}
      {/* ------------------------------------------------------------------------- */}
      {currentState === "processing" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-teal-200 shadow-sm space-y-6 relative overflow-hidden text-center animate-in fade-in duration-200">
          {/* Top Pill Badge */}
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-[#006666] text-[11px] font-bold tracking-wide uppercase">
              <RefreshCw className="w-3 h-3 animate-spin text-[#006666]" />
              <span>State: Processing</span>
            </span>
            <span className="text-[11px] text-slate-400 font-medium">Structuring triage</span>
          </div>

          {/* Circular Radar / Shield Pulse (Matching Figma) */}
          <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
            {/* Spinning Radar Track */}
            <div className="w-20 h-20 rounded-full border-4 border-teal-100 border-t-[#006666] animate-spin" />
            <div className="absolute w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center shadow-xs">
              <Shield className="w-6 h-6 text-[#006666]" />
            </div>
          </div>

          {/* Processing Subtext */}
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-800">
              Processing your speech...
            </h4>
            <p className="text-xs text-slate-500">
              Adapting to network speed and analyzing clinical context.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
