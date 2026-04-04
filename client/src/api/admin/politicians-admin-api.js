// import { apiFetch } from "../http";

// export function adminListPoliticians(
//   token,
//   { search = "", page = 1, limit = 20, isActive } = {},
// ) {
//   const params = new URLSearchParams();
//   if (search) params.set("search", search);
//   params.set("page", String(page));
//   params.set("limit", String(limit));
//   if (typeof isActive !== "undefined") params.set("isActive", String(isActive));
//   return apiFetch(`/politicians?${params.toString()}`, { token });
// }

// export function adminCreatePolitician(token, body) {
//   return apiFetch("/politicians", { method: "POST", token, body });
// }

// export function adminUpdatePolitician(token, id, body) {
//   return apiFetch(`/politicians/${id}`, { method: "PATCH", token, body });
// }

// export function adminDeactivatePolitician(token, id) {
//   return apiFetch(`/politicians/${id}`, { method: "DELETE", token });
// }

import { getToken } from "../../utils/auth-storage.js";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

async function safeJson(res) {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  const text = await res.text();
  return { message: text };
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ADMIN: list (uses same endpoint but admin can manage from here)
export async function adminListPoliticians({
  search = "",
  page = 1,
  limit = 12,
  isActive,
} = {}) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  params.set("page", String(page));
  params.set("limit", String(limit));
  if (typeof isActive !== "undefined") params.set("isActive", String(isActive));

  const res = await fetch(`${API_BASE}/politicians?${params.toString()}`, {
    headers: { ...authHeaders() },
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.message || "Failed to fetch politicians");
  return data; // { items, meta, message }
}

export async function adminCreatePolitician(payload) {
  const res = await fetch(`${API_BASE}/politicians`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });

  const data = await safeJson(res);
  if (!res.ok)
    throw new Error(
      data?.errors?.[0] || data?.message || "Failed to create politician",
    );
  return data; // { message, data }
}

export async function adminUpdatePolitician(id, payload) {
  const res = await fetch(`${API_BASE}/politicians/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });

  const data = await safeJson(res);
  if (!res.ok)
    throw new Error(
      data?.errors?.[0] || data?.message || "Failed to update politician",
    );
  return data; // { message, data }
}

// soft delete in your backend (isActive=false)
export async function adminDeactivatePolitician(id) {
  const res = await fetch(`${API_BASE}/politicians/${id}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });

  const data = await safeJson(res);
  if (!res.ok)
    throw new Error(data?.message || "Failed to deactivate politician");
  return data; // { message, data }
}
