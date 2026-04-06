import { clearAuth, getToken } from "../../utils/auth-storage.js";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

async function safeJson(res) {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  const text = await res.text();
  return { message: text };
}

function authHeaders(extra = {}) {
  const token = getToken();
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

function getErrorMessage(data, fallback) {
  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    const first = data.errors[0];
    if (typeof first === "string") return first;
    return first?.message || first?.msg || data?.message || fallback;
  }
  return data?.message || fallback;
}

function handleUnauthorized() {
  clearAuth();
  window.dispatchEvent(new Event("auth:expired"));
}

async function resolveResponse(res, fallback) {
  const data = await safeJson(res);

  if (res.status === 401) {
    handleUnauthorized();
    throw new Error("Session expired. Please sign in again.");
  }

  if (!res.ok) {
    throw new Error(getErrorMessage(data, fallback));
  }

  return data;
}

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
  if (typeof isActive !== "undefined") {
    params.set("isActive", String(isActive));
  }

  const res = await fetch(`${API_BASE}/politicians?${params.toString()}`, {
    headers: authHeaders(),
  });

  const data = await resolveResponse(res, "Failed to fetch politicians");

  return {
    items: data?.items || [],
    meta: data?.meta || null,
    raw: data,
  };
}

export async function adminCreatePolitician(payload) {
  const res = await fetch(`${API_BASE}/politicians`, {
    method: "POST",
    headers: authHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(payload),
  });

  return resolveResponse(res, "Failed to create politician");
}

export async function adminUpdatePolitician(id, payload) {
  const res = await fetch(`${API_BASE}/politicians/${id}`, {
    method: "PATCH",
    headers: authHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(payload),
  });

  return resolveResponse(res, "Failed to update politician");
}

export async function adminDeactivatePolitician(id) {
  const res = await fetch(`${API_BASE}/politicians/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  return resolveResponse(res, "Failed to deactivate politician");
}
