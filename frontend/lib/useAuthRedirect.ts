"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser } from "@/app/services/authService";

export function useAuthRedirect() {
  const router = useRouter();

  useEffect(() => {
    const user = getStoredUser();
    if (!user) {
      router.push("/signin");
    }
  }, [router]);

  return getStoredUser();
}
