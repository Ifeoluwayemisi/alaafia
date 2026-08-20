import { Suspense } from "react";
import AuthFlow from "@/components/AuthFlow";

export const metadata = {
  title: "Sign In — Alaafia AI",
  description: "Sign in to your Alaafia account to view your health summaries and saved consultations.",
};

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#eef7f6] flex items-center justify-center text-teal-800 font-semibold">Loading Alaafia Sign In...</div>}>
      <AuthFlow initialMode="signin" />
    </Suspense>
  );
}
