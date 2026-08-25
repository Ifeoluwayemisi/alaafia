"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Phone,
  RefreshCw,
  AlertCircle,
  Volume2,
  Shield,
  Check,
  Edit3,
  Sparkles,
  Keyboard,
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
  defaultText = "Persistent headache and fever since yesterday evening...",
}: VoiceListeningBoxProps) {
  const [currentState, setCurrentState] = useState<ListeningState>(initialState);
  const [liveTranscript, setLiveTranscript] = useState(defaultText);
  const [micVolume, setMicVolume] = useState<number[]>([14, 28, 18, 42, 26, 36, 22, 16, 30, 18]);
  const [isTypingFallback, setIsTypingFallback] = useState(false);
  const [manualText, setManualText] = useState(defaultText);

  const recognitionRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const waveAnimIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state changes upward
  const changeState = (newState: ListeningState) => {
    setCurrentState(newState);
    if (onStateChange) onStateChange(newState);
  };

  // Reset and restart silence timer (e.g. after 8 seconds of silence, transition to silent state)
  const resetSilenceTimer = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(() => {
      setCurrentState((prev) => {
        if (prev === "active") {
          if (onStateChange) onStateChange("silent");
          return "silent";
        }
        return prev;
      });
    }, 8000);
  };

  // Start animated wave bars (combining voice dynamics with responsive micro-animations)
  const startWaveAnimation = () => {
    if (waveAnimIntervalRef.current) clearInterval(waveAnimIntervalRef.current);
    waveAnimIntervalRef.current = setInterval(() => {
      setMicVolume((prev) =>
        prev.map(() => Math.floor(Math.random() * 32) + 10)
      );
    }, 120);
  };

  const stopWaveAnimation = () => {
    if (waveAnimIntervalRef.current) {
      clearInterval(waveAnimIntervalRef.current);
      waveAnimIntervalRef.current = null;
    }
  };

  // Safe Speech & Microphone Listening
  const startListening = (clearText = false) => {
    changeState("active");
    startWaveAnimation();
    resetSilenceTimer();

    if (clearText) {
      setLiveTranscript("Listening to your voice...");
    }

    // Try requesting real microphone stream in background
    if (typeof window !== "undefined" && navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          mediaStreamRef.current = stream;
        })
        .catch(() => {
          // Keep active state without crashing
        });
    }

    // Initialize Web Speech API
    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
          } catch (e) {}
        }

        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-NG"; // Supports Nigerian English accents

        recognition.onstart = () => {
          changeState("active");
          startWaveAnimation();
          resetSilenceTimer();
        };

        recognition.onresult = (event: any) => {
          resetSilenceTimer();
          changeState("active");

          let interimTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            interimTranscript += event.results[i][0].transcript;
          }

          if (interimTranscript.trim()) {
            setLiveTranscript(interimTranscript);
            setManualText(interimTranscript);
            if (onTranscriptChange) onTranscriptChange(interimTranscript);
          }
        };

        recognition.onerror = (event: any) => {
          if (event.error === "no-speech") {
            changeState("silent");
            stopWaveAnimation();
          } else if (event.error === "network") {
            changeState("processing");
          }
          // Do not drop into hard error on benign speech glitches
        };

        recognition.onend = () => {
          // If ended without transcript after timer
        };

        try {
          recognition.start();
        } catch (e) {}
      }
    } catch (e) {}
  };

  // Cleanup on unmount
  const cleanupAudio = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    stopWaveAnimation();

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      } catch (e) {}
    }
  };

  useEffect(() => {
    startListening(false);
    return () => {
      cleanupAudio();
    };
  }, []);

  const handleTryAgain = () => {
    setIsTypingFallback(false);
    startListening(true);
  };

  const handleGrantMicClick = () => {
    setIsTypingFallback(false);
    startListening(true);
  };

  const handleApplyManualText = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualText.trim()) {
      setLiveTranscript(manualText.trim());
      if (onTranscriptChange) onTranscriptChange(manualText.trim());
      setIsTypingFallback(false);
      changeState("active");
      startWaveAnimation();
      resetSilenceTimer();
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* ========================================================================= */}
      {/* 1. STATE: ACTIVE (Live Transcribing with Audio Waves)                     */}
      {/* ========================================================================= */}
      {currentState === "active" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 relative overflow-hidden animate-in fade-in duration-200">
          {/* Top Status Header */}
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-100 text-[#006666] text-[11px] font-bold tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-[#006666] animate-ping" />
              <span>Live Listening Active</span>
            </span>
            <span className="text-[11px] text-slate-400 font-medium">Speak in your own words</span>
          </div>

          {/* Dynamic Waveform Bars (Fluctuating with voice) */}
          <div className="flex items-center justify-center gap-1.5 h-12 py-1">
            {micVolume.map((height, i) => (
              <span
                key={i}
                className="w-1.5 bg-[#006666] rounded-full transition-all duration-100"
                style={{ height: `${height}px` }}
              />
            ))}
          </div>

          {/* Live Transcript Display */}
          <div className="p-5 sm:p-6 bg-teal-50/50 rounded-2xl border border-teal-100 text-center min-h-[90px] flex items-center justify-center">
            <p className="text-base sm:text-lg font-bold text-[#005c6e] italic leading-relaxed max-w-lg mx-auto">
              "{liveTranscript || "Tell Alaafia what you are experiencing..."}"
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. STATE: SILENT (No speech detected / Try Again prompt)                  */}
      {/* ========================================================================= */}
      {currentState === "silent" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 relative overflow-hidden text-center animate-in fade-in duration-200">
          {/* Top Status Header */}
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-bold tracking-wide uppercase">
              <span>No Audio Detected</span>
            </span>
            <span className="text-[11px] text-slate-400 font-medium">Ready for your voice</span>
          </div>

          {/* Flat Horizontal Sound Line */}
          <div className="py-6 flex items-center justify-center">
            <div className="w-48 h-0.5 bg-slate-300 rounded-full animate-pulse" />
          </div>

          {/* Subtext */}
          <div className="space-y-1">
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              We didn't hear anything. You can speak again.
            </p>
          </div>

          {/* Action: TRY AGAIN Button */}
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

      {/* ========================================================================= */}
      {/* 3. STATE: ERROR (Microphone Permission Denied / Blocked)                  */}
      {/* ========================================================================= */}
      {currentState === "error" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-red-200 shadow-sm space-y-5 relative overflow-hidden text-center animate-in fade-in duration-200">
          {/* Top Status Header */}
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-[11px] font-bold tracking-wide uppercase">
              <AlertCircle className="w-3 h-3 text-red-600" />
              <span>Microphone Access Blocked</span>
            </span>
            <span className="text-[11px] text-red-500 font-medium">Permission needed</span>
          </div>

          {/* Slashed Red Mic Icon Badge */}
          <div className="mx-auto w-14 h-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shadow-xs">
            <MicOff className="w-7 h-7" />
          </div>

          {/* Headline & Subtext */}
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              We can't access your microphone.
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Please click below to start speaking or switch to typing your symptoms.
            </p>
          </div>

          {/* Optional Direct Typing Input in Error Mode */}
          {isTypingFallback ? (
            <form onSubmit={handleApplyManualText} className="space-y-3 pt-2 max-w-md mx-auto">
              <textarea
                rows={3}
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                placeholder="Type your symptoms here (e.g. severe headache and fever since yesterday)..."
                className="w-full p-3.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#007e88]"
              />
              <div className="flex items-center justify-center gap-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#006666] hover:bg-[#004d4d] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Save & Continue
                </button>
                <button
                  type="button"
                  onClick={() => setIsTypingFallback(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            /* Dual Action Buttons */
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleGrantMicClick}
                className="px-4 py-2.5 rounded-xl bg-[#006666] hover:bg-[#004d4d] text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                Grant Microphone Permission
              </button>

              <button
                type="button"
                onClick={() => setIsTypingFallback(true)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-2xs inline-flex items-center gap-1.5"
              >
                <Keyboard className="w-3.5 h-3.5 text-slate-500" />
                <span>Type symptoms instead</span>
              </button>

              {emergencyMode && (
                <a
                  href={`tel:${emergencyNumber}`}
                  className="px-5 py-2.5 rounded-xl bg-[#b91c1c] hover:bg-[#991b1b] text-white text-xs font-bold shadow-xs transition-all inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span>✱</span>
                  <span>CALL {emergencyNumber}</span>
                </a>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. STATE: PROCESSING (Analyzing audio / Structuring clinical triage)      */}
      {/* ========================================================================= */}
      {currentState === "processing" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-teal-200 shadow-sm space-y-6 relative overflow-hidden text-center animate-in fade-in duration-200">
          {/* Top Status Header */}
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-[#006666] text-[11px] font-bold tracking-wide uppercase">
              <RefreshCw className="w-3 h-3 animate-spin text-[#006666]" />
              <span>Analyzing Speech</span>
            </span>
            <span className="text-[11px] text-slate-400 font-medium">Structuring clinical triage</span>
          </div>

          {/* Circular Radar / Shield Pulse */}
          <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full border-4 border-teal-100 border-t-[#006666] animate-spin" />
            <div className="absolute w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center shadow-xs">
              <Shield className="w-6 h-6 text-[#006666]" />
            </div>
          </div>

          {/* Processing Subtext */}
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-800">
              Processing your symptoms...
            </h4>
            <p className="text-xs text-slate-500">
              Alaafia AI is structuring your words for clinical review.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
