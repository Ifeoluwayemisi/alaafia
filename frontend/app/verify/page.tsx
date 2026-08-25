import { Suspense } from "react";
import AuthFlow from "@/components/AuthFlow";

export const metadata = {
  title: "Verify Account — Alaafia AI",
  description: "Verify your email address to activate your Alaafia account.",
};

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#eef7f6] flex items-center justify-center text-teal-800 font-semibold">Loading Verification...</div>}>
      <AuthFlow initialMode="verify" />
    </Suspense>
  );
}
