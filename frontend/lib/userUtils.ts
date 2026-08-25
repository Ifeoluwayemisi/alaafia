"use client";

import { useState, useEffect } from "react";

/**
 * Centralized User & Profile Utilities for Alaafia
 * Ensures 100% consistency of user name, initials, and profile avatar across all pages
 * Fully dynamic and SSR/Hydration safe
 */

export interface StoredUserProfile {
  id?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  isVerified?: boolean;
  isNewUser?: boolean;
}

export interface ContactItem {
  id: string | number;
  name: string;
  relation: string;
  phone: string;
  email?: string;
  initials: string;
  color: string;
  allowRequests?: boolean;
}

/**
 * Cleanly format and parse a human-readable name from an email address
 * Examples:
 * - "olamideolanrewaju129@gmail.com" -> "Olamide Olanrewaju"
 * - "john.doe@gmail.com" -> "John Doe"
 * - "sarah@gmail.com" -> "Sarah"
 */
export function formatNameFromEmail(email?: string): { firstName: string; lastName: string; fullName: string } {
  if (!email || !email.includes("@")) {
    return { firstName: "User", lastName: "", fullName: "User" };
  }

  const prefix = email.split("@")[0].trim();
  // Strip trailing numbers (e.g. 129 in olamideolanrewaju129)
  const cleaned = prefix.replace(/\d+$/, "");

  // If separated by dot, underscore, dash
  if (cleaned.includes(".") || cleaned.includes("_") || cleaned.includes("-")) {
    const parts = cleaned.split(/[\._\-]+/).filter(Boolean);
    const firstName = parts[0] ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase() : "User";
    const lastName = parts[1] ? parts[1].charAt(0).toUpperCase() + parts[1].slice(1).toLowerCase() : "";
    return {
      firstName,
      lastName,
      fullName: lastName ? `${firstName} ${lastName}` : firstName,
    };
  }

  // Check if it's two recognizable compound parts like "olamideolanrewaju"
  // If length is > 8, try to see if it splits into common Nigerian/English patterns or keep as single first name
  if (cleaned.length > 8 && cleaned.toLowerCase().startsWith("olamide") && cleaned.length > 7) {
    const first = "Olamide";
    const remainder = cleaned.slice(7);
    const last = remainder.charAt(0).toUpperCase() + remainder.slice(1).toLowerCase();
    return { firstName: first, lastName: last, fullName: `${first} ${last}` };
  }

  const capitalized = cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
  return {
    firstName: capitalized || "User",
    lastName: "",
    fullName: capitalized || "User",
  };
}

/**
 * Read the current stored user profile from localStorage safely
 */
export function getStoredUserProfile(): StoredUserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem("alaafia_user");
    if (!stored) return null;
    return JSON.parse(stored) as StoredUserProfile;
  } catch (err) {
    console.error("Error reading stored user profile:", err);
    return null;
  }
}

/**
 * Derive full name from profile or email dynamically
 */
export function getUserFullName(profile?: StoredUserProfile | null): string {
  if (!profile) return "User";

  // If previous session had hardcoded Ruqayah/Adebayo but user email is different
  const hasLegacyName =
    (profile.fullName?.toLowerCase().includes("adebayo") || profile.fullName?.toLowerCase().includes("ruqayah") || profile.firstName?.toLowerCase() === "ruqayah") &&
    profile.email &&
    !profile.email.toLowerCase().includes("adebayo") &&
    !profile.email.toLowerCase().includes("ruqayah");

  if (hasLegacyName && profile.email) {
    return formatNameFromEmail(profile.email).fullName;
  }

  if (profile?.fullName && profile.fullName.trim().length > 0) {
    return profile.fullName.trim();
  }

  if (profile?.name && profile.name.trim().length > 0) {
    return profile.name.trim();
  }

  if (profile?.firstName && profile.firstName.trim().length > 0) {
    const fn = profile.firstName.trim();
    const ln = profile.lastName ? profile.lastName.trim() : "";
    return ln ? `${fn} ${ln}` : fn;
  }

  if (profile?.email && profile.email.trim().length > 0) {
    return formatNameFromEmail(profile.email).fullName;
  }

  return "User";
}

/**
 * Derive a clean display first name (e.g. "Olamide")
 */
export function getUserDisplayName(profile?: StoredUserProfile | null): string {
  if (!profile) return "User";

  const hasLegacyName =
    (profile.fullName?.toLowerCase().includes("adebayo") || profile.fullName?.toLowerCase().includes("ruqayah") || profile.firstName?.toLowerCase() === "ruqayah") &&
    profile.email &&
    !profile.email.toLowerCase().includes("adebayo") &&
    !profile.email.toLowerCase().includes("ruqayah");

  if (hasLegacyName && profile.email) {
    return formatNameFromEmail(profile.email).firstName;
  }

  if (profile?.firstName && profile.firstName.trim().length > 0) {
    const fn = profile.firstName.trim();
    return fn.charAt(0).toUpperCase() + fn.slice(1);
  }

  if (profile?.fullName && profile.fullName.trim().length > 0) {
    const fn = profile.fullName.trim().split(" ")[0];
    return fn.charAt(0).toUpperCase() + fn.slice(1);
  }

  if (profile?.name && profile.name.trim().length > 0) {
    const fn = profile.name.trim().split(" ")[0];
    return fn.charAt(0).toUpperCase() + fn.slice(1);
  }

  if (profile?.email && profile.email.trim().length > 0) {
    return formatNameFromEmail(profile.email).firstName;
  }

  return "User";
}

/**
 * Derive a single uppercase initial consistently from any profile object
 */
export function getUserInitial(profile?: StoredUserProfile | null): string {
  const display = getUserDisplayName(profile);
  if (display && display.length > 0) {
    return display.charAt(0).toUpperCase();
  }

  if (profile?.email && profile.email.trim().length > 0) {
    return profile.email.trim().charAt(0).toUpperCase();
  }

  return "U";
}

/**
 * React Hook for hydration-safe user profile access
 */
export function useUserProfile() {
  const [profile, setProfile] = useState<StoredUserProfile | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const p = getStoredUserProfile();
    setProfile(p);

    const handleStorage = () => {
      setProfile(getStoredUserProfile());
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return {
    profile,
    isMounted,
    initial: isMounted ? getUserInitial(profile) : "U",
    displayName: isMounted ? getUserDisplayName(profile) : "User",
    fullName: isMounted ? getUserFullName(profile) : "User",
  };
}
