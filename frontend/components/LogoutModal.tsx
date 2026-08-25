"use client";

import React from "react";
import { LogOut } from "lucide-react";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
}

export default function LogoutModal({ isOpen, onClose, onConfirm }: LogoutModalProps) {
  if (!isOpen) return null;

  const handleLogout = () => {
    try {
      localStorage.removeItem("alaafia_user");
      localStorage.removeItem("alaafia_is_new_user");
      localStorage.removeItem("alaafia_token");
      sessionStorage.clear();
      if (onConfirm) {
        onConfirm();
      } else {
        window.location.href = "/";
      }
    } catch (e) {
      window.location.href = "/";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full border border-slate-200 shadow-2xl space-y-4 text-left">
        {/* Top Icon Badge */}
        <div className="w-10 h-10 rounded-2xl bg-[#e6f4f1] text-[#006666] flex items-center justify-center shadow-xs">
          <LogOut className="w-5 h-5 stroke-[2.2]" />
        </div>

        {/* Title & Description (Left-aligned matching Figma) */}
        <div className="space-y-1">
          <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
            Log out of Alaafia?
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            You'll need to sign in again to access your consultation history.
          </p>
        </div>

        {/* Right-aligned Action Buttons (Matching Figma) */}
        <div className="flex items-center justify-end gap-2.5 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 hover:border-slate-400 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl bg-[#006666] hover:bg-[#004d4d] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
