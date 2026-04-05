// import { apiFetch } from "./http";

// export function loginApi({ email, password }) {
//   return apiFetch("/auth/login", { method: "POST", body: { email, password } });
// }

// export function registerApi({ email, password, role }) {
//   return apiFetch("/auth/register", {
//     method: "POST",
//     body: { email, password, role },
//   });
// }

// client/src/api/auth-api.js
const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

export async function loginRequest({ email, password }) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || data?.message || "Login failed");

  // backend returns: { token, user: { userId, email, role } }
  return data;
}
