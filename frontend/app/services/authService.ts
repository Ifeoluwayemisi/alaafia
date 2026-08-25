import { api, setToken, clearToken } from "@/lib/api";

export interface User {
  id: string | number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  emailVerified: boolean;
}

export interface AuthResult {
  user: User;
  token?: string;
}

const STORAGE_KEY = "alaafia_user";
const TOKEN_KEY = "alaafia_token";

function persistAuth(user: User, token: string) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  setToken(token);
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
  localStorage.removeItem(STORAGE_KEY);
  clearToken();
}

export const authService = {
  async signup(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<{ delivery: string; expiresAt: string }> {
    const result = await api.post<{
      user: User;
      verification: { expiresAt: string; delivery: string };
    }>("/auth/register", data);

    persistAuth(result.user, "");
    return {
      delivery: result.verification.delivery,
      expiresAt: result.verification.expiresAt,
    };
  },

  async verify(email: string, code: string): Promise<void> {
    await api.post("/auth/verify-email", { email, code });
  },

  async resendCode(email: string): Promise<{ delivery: string }> {
    const result = await api.post<{ delivery: string }>(
      "/auth/resend-verification",
      { email }
    );
    return { delivery: result.delivery };
  },

  async signin(email: string, password: string): Promise<AuthResult> {
    const result = await api.post<{ user: User; token: string }>(
      "/auth/login",
      { email, password }
    );
    persistAuth(result.user, result.token);
    return result;
  },

  async googleLogin(idToken: string): Promise<AuthResult> {
    const result = await api.post<{ user: User; token: string }>(
      "/auth/google",
      { idToken }
    );
    persistAuth(result.user, result.token);
    return result;
  },
};
