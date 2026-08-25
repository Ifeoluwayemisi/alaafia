const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export interface ApiError {
  success: false;
  error: { code: string; message: string; details: any[] };
}

export interface ApiSuccess<T = any> {
  success: true;
  data: T;
  message?: string;
}

type ApiResponse<T = any> = ApiSuccess<T> | ApiError;

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("alaafia_token");
}

export function setToken(token: string) {
  localStorage.setItem("alaafia_token", token);
}

export function clearToken() {
  localStorage.removeItem("alaafia_token");
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

async function request<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (
    options.body &&
    typeof options.body === "string" &&
    !headers["Content-Type"]
  ) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const json: ApiResponse<T> = await res.json();

  if (!json.success) {
    const err = json as ApiError;
    const error = new Error(err.error?.message || "Request failed") as any;
    error.code = err.error?.code;
    error.status = res.status;
    error.details = err.error?.details;
    throw error;
  }

  return (json as ApiSuccess<T>).data;
}

export const api = {
  get: <T = any>(path: string) => request<T>(path),

  post: <T = any>(path: string, body?: any) =>
    request<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T = any>(path: string, body?: any) =>
    request<T>(path, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T = any>(path: string) =>
    request<T>(path, { method: "DELETE" }),

  upload: async <T = any>(path: string, formData: FormData) => {
    const token = getToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers,
      body: formData,
    });

    const json: ApiResponse<T> = await res.json();

    if (!json.success) {
      const err = json as ApiError;
      const error = new Error(err.error?.message || "Upload failed") as any;
      error.code = err.error?.code;
      error.status = res.status;
      error.details = err.error?.details;
      throw error;
    }

    return (json as ApiSuccess<T>).data;
  },
};
