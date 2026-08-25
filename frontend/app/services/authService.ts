/**
 * Authentication Service (Supabase Auth)
 */

import { createClient } from "@/lib/supabase/client";

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isVerified: boolean;
  isNewUser: boolean;
}

export const authService = {
  /**
   * Register a new user
   */
  async signup(data: { firstName: string; lastName: string; email: string; password: string }) {
    const supabase = createClient();

    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    // If email confirmation is enabled, Supabase returns user but no session
    if (authData.user && !authData.session) {
      return {
        success: true,
        message: "Account created! Please check your email to verify your account.",
        email: data.email,
      };
    }

    // If email confirmation is disabled, user is auto signed in
    if (authData.session && authData.user) {
      localStorage.setItem("alaafia_user", JSON.stringify({
        id: authData.user.id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        isVerified: true,
        isNewUser: true,
      }));
      localStorage.setItem("alaafia_is_new_user", "true");
    }

    return {
      success: true,
      message: "Account created successfully!",
      email: data.email,
    };
  },

  /**
   * Verify email with 6-digit OTP code via Supabase Auth.
   * Signs the user out immediately after verification so they
   * must go through the signin step (SIGNUP → VERIFY → SIGN IN → DASHBOARD).
   */
  async verify(email: string, token: string) {
    const supabase = createClient();

    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "signup",
    });

    if (error) {
      throw new Error(error.message);
    }

    // Sign out so the user does not bypass the signin step.
    // verifyOtp may create a session; we intentionally discard it.
    await supabase.auth.signOut();

    return { success: true, message: "Email verified successfully!" };
  },

  /**
   * Sign in existing user via Supabase Auth
   */
  async signin(email: string, password: string) {
    const supabase = createClient();

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Email not confirmed — direct user to verify page
      if (error.message === "Email not confirmed") {
        throw {
          requiresVerification: true,
          message: "Please verify your email before signing in.",
          email,
        };
      }
      // Invalid credentials
      if (error.message === "Invalid login credentials") {
        throw new Error("Invalid email or password. Please try again.");
      }
      throw new Error(error.message);
    }

    // Successful login — Supabase session is now stored automatically
    const userObj: UserProfile = {
      id: authData.user.id,
      firstName: authData.user.user_metadata?.firstName || "",
      lastName: authData.user.user_metadata?.lastName || "",
      email: authData.user.email || email,
      isVerified: true,
      isNewUser: false,
    };

    localStorage.setItem("alaafia_user", JSON.stringify(userObj));
    localStorage.setItem("alaafia_is_new_user", "false");

    return {
      success: true,
      message: "Welcome back!",
      user: userObj,
    };
  },

  /**
   * Resend verification email via Supabase Auth
   */
  async resendCode(email: string) {
    const supabase = createClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email,
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      message: "Verification email resent. Please check your inbox.",
    };
  },
};
