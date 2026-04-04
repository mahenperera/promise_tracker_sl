// import { apiFetch } from "../http";

// export function adminListParties(
//   token,
//   { search = "", page = 1, limit = 20, isActive } = {},
// ) {
//   const params = new URLSearchParams();
//   if (search) params.set("search", search);
//   params.set("page", String(page));
//   params.set("limit", String(limit));
//   if (typeof isActive !== "undefined") params.set("isActive", String(isActive));
//   return apiFetch(`/parties?${params.toString()}`, { token });
// }

// export function adminCreateParty(token, body) {
//   return apiFetch("/parties", { method: "POST", token, body });
// }

// export function adminUpdateParty(token, id, body) {
//   return apiFetch(`/parties/${id}`, { method: "PATCH", token, body });
// }

// export function adminDeactivateParty(token, id) {
//   return apiFetch(`/parties/${id}`, { method: "DELETE", token });
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

export async function adminListParties({
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

  const res = await fetch(`${API_BASE}/parties?${params.toString()}`, {
    headers: { ...authHeaders() },
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.message || "Failed to fetch parties");
  return data; // { items, meta, message }
}

export async function adminCreateParty(payload) {
  const res = await fetch(`${API_BASE}/parties`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });

  const data = await safeJson(res);
  if (!res.ok)
    throw new Error(
      data?.errors?.[0] || data?.message || "Create party failed",
    );
  return data; // { message, data }
}

export async function adminUpdateParty(id, payload) {
  const res = await fetch(`${API_BASE}/parties/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });

  const data = await safeJson(res);
  if (!res.ok)
    throw new Error(
      data?.errors?.[0] || data?.message || "Update party failed",
    );
  return data; // { message, data }
}

export async function adminDeactivateParty(id) {
  const res = await fetch(`${API_BASE}/parties/${id}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });

  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.message || "Deactivate party failed");
  return data; // { message, data }
}
