import { Suspense } from "react";
import AuthFlow from "@/components/AuthFlow";

export const metadata = {
  title: "Create Account — Alaafia AI",
  description: "Create your Alaafia account to start managing your health journey.",
};

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#eef7f6] flex items-center justify-center text-teal-800 font-semibold">Loading Alaafia Sign Up...</div>}>
      <AuthFlow initialMode="signup" />
    </Suspense>
  );
}
