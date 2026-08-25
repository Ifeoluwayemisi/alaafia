"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  RefreshCw,
  User,
  Check,
  Shield,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import EmergencyModal from "@/components/EmergencyModal";
import { authService } from "@/app/services/authService";

export type AuthMode = "signin" | "signup" | "verify";

interface AuthFlowProps {
  initialMode?: AuthMode;
}

export default function AuthFlow({ initialMode = "signin" }: AuthFlowProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<AuthMode>(initialMode);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const qMode = searchParams.get("mode") as AuthMode;
    const qEmail = searchParams.get("email");

    if (qMode && (qMode === "signin" || qMode === "signup" || qMode === "verify")) {
      setMode(qMode);
    }
    if (qEmail) {
      setEmail(qEmail);
    }
  }, [searchParams]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (mode === "verify" && resendTimer > 0) {
      setCanResend(false);
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [mode, resendTimer]);

  const getMaskedEmail = (rawEmail: string) => {
    if (!rawEmail) return "r******@gmail.com";
    const parts = rawEmail.split("@");
    if (parts.length !== 2) return rawEmail;
    const name = parts[0];
    const domain = parts[1];
    if (name.length <= 2) return `${name[0]}*@${domain}`;
    return `${name[0]}${"*".repeat(Math.max(name.length - 2, 4))}${name[name.length - 1]}@${domain}`;
  };

  const switchMode = (newMode: AuthMode) => {
    setErrorMsg("");
    setSuccessMsg("");
    setMode(newMode);
    if (newMode === "verify") {
      setResendTimer(30);
      setCanResend(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!email || !password) {
      setErrorMsg("Please fill in both email and password.");
      return;
    }

    setIsLoading(true);
    try {
      await authService.signin(email, password);
      setSuccessMsg("Signed in successfully! Redirecting to your dashboard...");
      setTimeout(() => router.push("/dashboard"), 1000);
    } catch (err: any) {
      if (err.status === 403 || err.code === "EMAIL_NOT_VERIFIED") {
        setErrorMsg("Please verify your email before signing in.");
        switchMode("verify");
      } else {
        setErrorMsg(err.message || "Failed to sign in. Please check your credentials.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const fullName = `${firstName} ${lastName}`.trim();
    if (!firstName || !lastName || !email || !password) {
      setErrorMsg("Please fill in all fields (First name, Last name, Email, Password).");
      return;
    }

    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }

    setIsLoading(true);
    try {
      await authService.signup({ name: fullName, email, password });
      setSuccessMsg("Account created! Please check your email to verify your account.");
      setTimeout(() => router.push(`/verify?email=${encodeURIComponent(email)}`), 1500);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create account.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim().slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const digitsArr = pastedData.split("");
      const updated = ["", "", "", "", "", ""];
      digitsArr.forEach((digit, i) => {
        if (i < 6) updated[i] = digit;
      });
      setOtpDigits(updated);
      otpInputRefs.current[Math.min(digitsArr.length, 5)]?.focus();
    }
  };

  const handleVerifyCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const token = otpDigits.join("");
    if (token.length !== 6) {
      setErrorMsg("Please enter the complete 6-digit code.");
      return;
    }

    setIsLoading(true);
    try {
      await authService.verify(email, token);
      setSuccessMsg("Email verified! Redirecting to sign in...");
      setTimeout(() => router.push(`/signin?email=${encodeURIComponent(email)}`), 1200);
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend && resendTimer > 0) return;
    setErrorMsg("");
    setSuccessMsg("");
    setIsLoading(true);
    try {
      await authService.resendCode(email);
      setSuccessMsg("Verification email resent. Please check your inbox.");
      setResendTimer(30);
      setCanResend(false);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to resend verification email.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!window.google || !(window.google as any).accounts?.id) {
      setErrorMsg("Google Sign-In is loading. Please try again in a moment.");
      return;
    }

    (window.google as any).accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      callback: async (response: any) => {
        setIsLoading(true);
        setErrorMsg("");
        setSuccessMsg("");
        try {
          await authService.googleLogin(response.credential);
          setSuccessMsg("Signed in with Google! Redirecting...");
          setTimeout(() => router.push("/dashboard"), 1000);
        } catch (err: any) {
          setErrorMsg(err.message || "Google sign-in failed. Please try again.");
        } finally {
          setIsLoading(false);
        }
      },
    });

    (window.google as any).accounts.id.prompt();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#eef7f6] text-slate-900 font-sans selection:bg-teal-100 selection:text-teal-900">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl shadow-teal-900/5 border border-teal-100 overflow-hidden transition-all duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">

            <div className="lg:col-span-6 bg-gradient-to-br from-[#dcfce7]/40 via-[#ccfbf1]/60 to-[#e0f2fe]/50 p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden border-r border-teal-50">

              <div className="space-y-4 z-10">
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-extrabold text-[#006666] tracking-tight">Alaafia</span>
                </div>

                {mode === "signup" && (
                  <div className="space-y-2 pt-2 animate-fadeIn">
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                      Your health story <br />starts here.
                    </h2>
                    <p className="text-sm text-slate-600 leading-relaxed max-w-sm">
                      Create your Alaafia account to keep track of your consultations and get a more connected experience.
                    </p>
                  </div>
                )}

                {mode === "signin" && (
                  <div className="hidden sm:block pt-1" />
                )}

                {mode === "verify" && (
                  <div className="space-y-3 pt-2 animate-fadeIn">
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                      Healthcare starts <br />with understanding.
                    </h2>
                    <div className="inline-flex flex-wrap items-center gap-1.5 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-teal-200/80 shadow-xs text-xs font-semibold text-[#005c6e]">
                      <span>Speak</span>
                      <span className="text-teal-400">→</span>
                      <span>Understand</span>
                      <span className="text-teal-400">→</span>
                      <span>Guide</span>
                      <span className="text-teal-400">→</span>
                      <span>Connect</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="my-6 relative z-10 group">
                <div className="relative w-full h-[280px] sm:h-[320px] rounded-2xl overflow-hidden shadow-lg border-2 border-white/80 transition-all duration-300 group-hover:shadow-teal-500/15">
                  <Image
                    src="/images/auth-hero.jpg"
                    alt="Alaafia Patient Care"
                    fill
                    className="object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-3.5 rounded-xl border border-white/90 shadow-md flex items-start gap-3 transform transition-transform group-hover:translate-y-[-2px]">
                    <div className="w-8 h-8 rounded-full bg-teal-100 text-[#006666] flex items-center justify-center shrink-0 mt-0.5">
                      {mode === "signup" ? <CheckCircle2 className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {mode === "signup" ? "Your information matters." : "Private & secure"}
                      </div>
                      <div className="text-[11px] text-slate-600 leading-snug">
                        {mode === "signup"
                          ? "Your health conversations are handled with care."
                          : mode === "verify"
                          ? "Your data is protected."
                          : "Your health conversations stay protected."}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {mode === "signin" && (
                <div className="space-y-1.5 z-10 animate-fadeIn">
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                    Healthcare starts with understanding.
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Alaafia helps you make sense of what you&apos;re experiencing and find the right next stop.
                  </p>
                </div>
              )}

              {mode === "signup" && (
                <div className="text-xs text-slate-500 font-medium z-10">
                  &copy; 2026 Alaafia Health Inc. All rights reserved.
                </div>
              )}

              {mode === "verify" && (
                <div className="text-xs text-slate-500 font-medium z-10">
                  &copy; 2026 Alaafia Health
                </div>
              )}
            </div>

            <div className="lg:col-span-6 p-8 sm:p-10 flex flex-col justify-between bg-white relative">

              {errorMsg && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="mb-4 p-3 bg-teal-50 border border-teal-200 text-teal-800 text-xs rounded-xl flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-teal-600" />
                  <span>{successMsg}</span>
                </div>
              )}

              {mode === "signin" && (
                <div className="space-y-6 animate-fadeIn">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Welcome back.</h2>
                    <p className="text-sm text-slate-500 mt-1">Sign in to continue with Alaafia.</p>
                  </div>

                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
                      <div className="relative">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email"
                          required
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006666] focus:bg-white transition-all"
                        />
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          required
                          className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006666] focus:bg-white transition-all"
                        />
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3.5 px-4 bg-[#006666] hover:bg-[#004d4d] active:bg-[#003333] text-white font-semibold rounded-xl text-sm shadow-md shadow-teal-900/10 hover:shadow-teal-900/20 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                    >
                      {isLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <span>Sign in</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </form>

                  <div className="relative flex items-center justify-center my-4">
                    <div className="border-t border-slate-200 w-full" />
                    <span className="bg-white px-3 text-xs text-slate-400 uppercase tracking-wider font-semibold absolute">Or</span>
                  </div>

                  {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={isLoading}
                      className="w-full py-3 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-xl text-sm flex items-center justify-center gap-2.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>Continue with Google</span>
                    </button>
                  )}

                  <div className="text-center pt-2 text-xs sm:text-sm text-slate-500">
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => switchMode("signup")}
                      className="text-teal-600 font-semibold hover:underline cursor-pointer"
                    >
                      Create an account
                    </button>
                  </div>
                </div>
              )}

              {mode === "signup" && (
                <div className="space-y-5 animate-fadeIn">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Create your Alaafia account</h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      Join securely to save your health summaries and manage ongoing care.
                    </p>
                  </div>

                  <form onSubmit={handleSignUp} className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">First Name</label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="First Name"
                          required
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006666] focus:bg-white transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name</label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Last Name"
                          required
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006666] focus:bg-white transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                      <div className="relative">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          required
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006666] focus:bg-white transition-all"
                        />
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Create Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          minLength={8}
                          className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006666] focus:bg-white transition-all"
                        />
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <span className="text-[11px] text-teal-700 mt-1 flex items-center gap-1 font-medium">
                        <Check className="w-3 h-3" /> 8+ characters required
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 px-4 bg-[#006666] hover:bg-[#004d4d] active:bg-[#003333] text-white font-semibold rounded-xl text-sm shadow-md shadow-teal-900/10 hover:shadow-teal-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                    >
                      {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Create account</span>}
                    </button>
                  </form>

                  <div className="relative flex items-center justify-center my-3">
                    <div className="border-t border-slate-200 w-full" />
                    <span className="bg-white px-3 text-[11px] text-slate-400 uppercase tracking-wider font-semibold absolute">Or</span>
                  </div>

                  {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={isLoading}
                      className="w-full py-2.5 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-xl text-sm flex items-center justify-center gap-2.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>Continue with Google</span>
                    </button>
                  )}

                  <div className="text-center text-xs text-slate-500 pt-1">
                    Already have an Alaafia account?{" "}
                    <button onClick={() => switchMode("signin")} className="text-teal-600 font-semibold hover:underline">
                      Sign in
                    </button>
                  </div>
                </div>
              )}

              {mode === "verify" && (
                <div className="space-y-6 animate-fadeIn">
                  <button
                    onClick={() => switchMode("signin")}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-teal-700 font-medium transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to sign in</span>
                  </button>

                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Verify your email</h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
                      We&apos;ve sent a 6-digit verification code to{" "}
                      <strong className="text-slate-800 font-semibold">{getMaskedEmail(email)}</strong>.
                    </p>
                  </div>

                  <form onSubmit={handleVerifyCode} className="space-y-5">
                    <div className="flex items-center justify-center gap-2.5 sm:gap-3">
                      {otpDigits.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => { otpInputRefs.current[index] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          onPaste={index === 0 ? handleOtpPaste : undefined}
                          className="w-11 h-12 sm:w-12 sm:h-13 text-center text-lg font-bold bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006666] focus:bg-white transition-all"
                        />
                      ))}
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || otpDigits.join("").length !== 6}
                      className="w-full py-3.5 px-4 bg-[#006666] hover:bg-[#004d4d] active:bg-[#003333] text-white font-semibold rounded-xl text-sm shadow-md shadow-teal-900/10 hover:shadow-teal-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Verify account</span>}
                    </button>
                  </form>

                  <div className="space-y-3">
                    <p className="text-xs text-slate-500 text-center">Didn&apos;t receive the code?</p>
                    <button
                      onClick={handleResendCode}
                      disabled={isLoading || (!canResend && resendTimer > 0)}
                      className="w-full py-3 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-xl text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Resend code</span>}
                    </button>

                    {!canResend && resendTimer > 0 && (
                      <div className="text-center text-xs text-slate-500">
                        <span className="text-slate-400 font-medium">
                          You can resend in 00:{resendTimer < 10 ? `0${resendTimer}` : resendTimer}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-8 pt-4">
                <div className="bg-red-50/80 border border-red-200/90 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-red-900 block">Need urgent help?</span>
                      <span className="text-red-700">You don&apos;t need an account for emergency assistance.</span>
                    </div>
                  </div>
                  <Link
                    href="/emergency"
                    className="text-red-600 hover:text-red-800 font-extrabold hover:underline whitespace-nowrap text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <span>Get emergency help</span>
                    <span>→</span>
                  </Link>
                </div>

                {mode === "verify" && (
                  <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 mt-4">
                    <span>Privacy</span>
                    <span>•</span>
                    <span>Terms</span>
                    <span>•</span>
                    <span>Help</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>

      <EmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
      />
    </div>
  );
}
