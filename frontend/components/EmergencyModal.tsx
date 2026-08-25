"use client";

import React from "react";
import { AlertTriangle, Phone, X } from "lucide-react";

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EmergencyModal({ isOpen, onClose }: EmergencyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-red-100 text-center animate-in fade-in zoom-in-95 duration-200 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold uppercase tracking-wider">
            Emergency Access
          </div>
          <h3 className="text-2xl font-bold text-slate-900">
            Medical Emergency Assistance
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            If you or someone nearby is experiencing severe chest pain, loss of consciousness, uncontrolled bleeding, or severe difficulty breathing, please seek immediate emergency care.
          </p>
        </div>

        <div className="space-y-2.5 pt-2">
          <a
            href="tel:112"
            className="w-full inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-red-600/30 transition-all text-sm"
          >
            <Phone className="w-4 h-4" />
            <span>Call Emergency Line (112)</span>
          </a>
          <a
            href="/emergency"
            className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white font-bold py-3 rounded-2xl transition-all text-xs"
          >
            <span>Open Full Emergency Mode</span>
            <span>→</span>
          </a>
          <button
            onClick={onClose}
            className="w-full text-xs font-semibold text-slate-500 hover:text-slate-800 py-1.5 transition-colors cursor-pointer"
          >
            Dismiss & Return
          </button>
        </div>
      </div>
    </div>
  );
}
