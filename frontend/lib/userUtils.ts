"use client";

import { useState, useEffect } from "react";

/**
 * Centralized User & Profile Utilities for Alaafia
 * Ensures 100% consistency of user name, initials, and profile avatar across all pages
 * Fully SSR and Hydration safe
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
 * Derive a single uppercase initial consistently from any profile object or fallback to "R"
 */
export function getUserInitial(profile?: StoredUserProfile | null): string {
  if (profile?.firstName && profile.firstName.trim().length > 0) {
    return profile.firstName.trim().charAt(0).toUpperCase();
  }

  if (profile?.fullName && profile.fullName.trim().length > 0) {
    return profile.fullName.trim().charAt(0).toUpperCase();
  }

  if (profile?.name && profile.name.trim().length > 0) {
    return profile.name.trim().charAt(0).toUpperCase();
  }

  if (profile?.email && profile.email.trim().length > 0) {
    return profile.email.trim().charAt(0).toUpperCase();
  }

  return "R";
}

/**
 * Derive a clean display name (e.g. "Ruqayah" or "Olamide")
 */
export function getUserDisplayName(profile?: StoredUserProfile | null): string {
  if (profile?.firstName && profile.firstName.trim().length > 0) {
    const fn = profile.firstName.trim();
    return fn.charAt(0).toUpperCase() + fn.slice(1);
  }

  if (profile?.fullName && profile.fullName.trim().length > 0) {
    const fn = profile.fullName.trim().split(" ")[0];
    return fn.charAt(0).toUpperCase() + fn.slice(1);
  }

  if (profile?.email && profile.email.trim().length > 0) {
    const prefix = profile.email.split("@")[0];
    return prefix.charAt(0).toUpperCase() + prefix.slice(1);
  }

  return "Ruqayah";
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
    initial: isMounted ? getUserInitial(profile) : "R",
    displayName: isMounted ? getUserDisplayName(profile) : "Ruqayah",
  };
}
