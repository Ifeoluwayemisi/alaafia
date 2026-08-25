import { api, setToken, clearToken } from "@/lib/api";

export interface User {
  id: string | number;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  role: string;
  emailVerified: boolean;
  isNewUser?: boolean;
}

export interface AuthResult {
  user: User;
  token?: string;
}

const STORAGE_KEY = "alaafia_user";
const TOKEN_KEY = "alaafia_token";

function persistAuth(user: User, token: string) {
  if (typeof window === "undefined") return;

  const names = (user.name || "").trim().split(" ");
  const firstName = user.firstName || names[0] || "Olamide";
  const lastName = user.lastName || names.slice(1).join(" ") || "Olanrewaju";

  const enrichedUser = {
    ...user,
    firstName,
    lastName,
    fullName: user.name || `${firstName} ${lastName}`,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(enrichedUser));
  localStorage.setItem("alaafia_is_new_user", user.isNewUser ? "true" : "false");
  setToken(token || "demo-session-token");

  // Trigger cross-component storage event for instant UI update
  window.dispatchEvent(new Event("storage"));
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function logout() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem("alaafia_is_new_user");
  clearToken();
  window.dispatchEvent(new Event("storage"));
}

export const authService = {
  async signup(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<{ delivery: string; expiresAt: string }> {
    try {
      const result = await api.post<{
        user: User;
        verification: { expiresAt: string; delivery: string };
      }>("/auth/register", data);

      persistAuth(result.user, "");
      return {
        delivery: result.verification?.delivery || "email",
        expiresAt: result.verification?.expiresAt || new Date().toISOString(),
      };
    } catch (err: any) {
      if (err.isNetworkError || err.code === "NETWORK_ERROR") {
        // Fallback local session for seamless onboarding
        const names = data.name.trim().split(" ");
        const fallbackUser: User = {
          id: `local-${Date.now()}`,
          name: data.name,
          firstName: names[0] || "User",
          lastName: names.slice(1).join(" ") || "",
          email: data.email,
          phone: data.phone || "+234 801 234 5678",
          role: "PATIENT",
          emailVerified: true,
          isNewUser: true,
        };
        persistAuth(fallbackUser, "demo-local-jwt");
        return {
          delivery: "email",
          expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        };
      }
      throw err;
    }
  },

  async verify(email: string, code: string): Promise<void> {
    try {
      await api.post("/auth/verify-email", { email, code });
    } catch (err: any) {
      if (err.isNetworkError || err.code === "NETWORK_ERROR") {
        const stored = getStoredUser();
        if (stored) {
          stored.emailVerified = true;
          persistAuth(stored, "demo-local-jwt");
        }
        return;
      }
      throw err;
    }
  },

  async resendCode(email: string): Promise<{ delivery: string }> {
    try {
      const result = await api.post<{ delivery: string }>(
        "/auth/resend-verification",
        { email }
      );
      return { delivery: result.delivery };
    } catch (err: any) {
      if (err.isNetworkError || err.code === "NETWORK_ERROR") {
        return { delivery: "email" };
      }
      throw err;
    }
  },

  async signin(email: string, password: string): Promise<AuthResult> {
    try {
      const result = await api.post<{ user: User; token: string }>(
        "/auth/login",
        { email, password }
      );
      persistAuth(result.user, result.token);
      return result;
    } catch (err: any) {
      if (err.isNetworkError || err.code === "NETWORK_ERROR") {
        // Fallback login when backend is not actively running
        const rawName = email.split("@")[0].replace(/[^a-zA-Z]/g, " ").trim();
        const formattedFirst = rawName
          ? rawName.split(" ")[0].charAt(0).toUpperCase() + rawName.split(" ")[0].slice(1)
          : "Ruqayah";
        const formattedLast = rawName.split(" ")[1]
          ? rawName.split(" ")[1].charAt(0).toUpperCase() + rawName.split(" ")[1].slice(1)
          : "Adebayo";

        const fallbackUser: User = {
          id: `patient-${Date.now()}`,
          name: `${formattedFirst} ${formattedLast}`,
          firstName: formattedFirst,
          lastName: formattedLast,
          email: email,
          phone: "+234 801 234 5678",
          role: "PATIENT",
          emailVerified: true,
          isNewUser: false,
        };
        persistAuth(fallbackUser, "demo-token-authenticated");
        return { user: fallbackUser, token: "demo-token-authenticated" };
      }
      throw err;
    }
  },

  async quickDemoLogin(preset?: { name: string; email: string }): Promise<AuthResult> {
    const demoUser: User = {
      id: "demo-patient-001",
      name: preset?.name || "Olamide Olanrewaju",
      firstName: preset?.name?.split(" ")[0] || "Olamide",
      lastName: preset?.name?.split(" ")[1] || "Olanrewaju",
      email: preset?.email || "olamideolanrewaju129@gmail.com",
      phone: "+234 801 234 5678",
      role: "PATIENT",
      emailVerified: true,
      isNewUser: false,
    };
    persistAuth(demoUser, "demo-token-active");
    return { user: demoUser, token: "demo-token-active" };
  },

  async googleLogin(idToken: string): Promise<AuthResult> {
    try {
      const result = await api.post<{ user: User; token: string }>(
        "/auth/google",
        { idToken }
      );
      persistAuth(result.user, result.token);
      return result;
    } catch (err: any) {
      if (err.isNetworkError || err.code === "NETWORK_ERROR") {
        const demoUser: User = {
          id: "google-demo-user",
          name: "Olamide Olanrewaju",
          firstName: "Olamide",
          lastName: "Olanrewaju",
          email: "olamideolanrewaju129@gmail.com",
          role: "PATIENT",
          emailVerified: true,
          isNewUser: false,
        };
        persistAuth(demoUser, "demo-google-token");
        return { user: demoUser, token: "demo-google-token" };
      }
      throw err;
    }
  },
};
