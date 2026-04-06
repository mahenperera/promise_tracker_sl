import { clearAuth, getToken } from "./auth-storage.js";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

async function safeJson(res) {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  const text = await res.text();
  return { message: text };
}

export function authHeaders(extra = {}) {
  const token = getToken();
  return token ? { ...extra, Authorization: `Bearer ${token}` } : { ...extra };
}

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, options);
  const data = await safeJson(res);

  if (res.status === 401) {
    clearAuth();
    window.dispatchEvent(new Event("auth:expired"));
    throw new Error("Session expired. Please sign in again.");
  }

  if (!res.ok) {
    throw new Error(
      data?.error ||
        data?.message ||
        (Array.isArray(data?.errors) ? data.errors[0] : null) ||
        `Failed (${res.status})`,
    );
  }

  return data;
}
