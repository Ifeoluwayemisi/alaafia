import { Suspense } from "react";
import AuthFlow from "@/components/AuthFlow";

export const metadata = {
  title: "Authentication — Alaafia AI",
  description: "Sign in or create your Alaafia account.",
};

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#eef7f6] flex items-center justify-center text-teal-800 font-semibold">Loading...</div>}>
      <AuthFlow initialMode="signin" />
    </Suspense>
  );
}
