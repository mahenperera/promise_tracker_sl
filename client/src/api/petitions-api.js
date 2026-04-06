// client/src/api/petitions-api.js
import { clearAuth, getToken } from "../utils/auth-storage.js";

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

function handleUnauthorized() {
  clearAuth();
  window.dispatchEvent(new Event("auth:expired"));
}

async function resolveResponse(res, fallback, { logoutOn401 = false } = {}) {
  const data = await safeJson(res);

  if (res.status === 401) {
    if (logoutOn401) {
      handleUnauthorized();
      throw new Error("Session expired. Please sign in again.");
    }
    throw new Error(data?.message || fallback || `Failed (${res.status})`);
  }

  if (!res.ok) {
    throw new Error(data?.message || fallback || `Failed (${res.status})`);
  }

  return data;
}

// ✅ PUBLIC: GET /api/petitions
export async function fetchPublicPetitions({
  search = "",
  page = 1,
  limit = 12,
} = {}) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  params.set("page", String(page));
  params.set("limit", String(limit));

  const res = await fetch(`${API_BASE}/petitions?${params.toString()}`);
  return resolveResponse(res, "Failed to fetch petitions");
}

// ✅ PUBLIC-ish: GET /api/petitions/:id
export async function fetchPetitionById(id) {
  const res = await fetch(`${API_BASE}/petitions/${id}`, {
    headers: authHeaders(),
  });
  return resolveResponse(res, "Failed to fetch petition");
}

// ✅ CITIZEN/ADMIN: POST /api/petitions
export async function createPetition(payload) {
  const res = await fetch(`${API_BASE}/petitions`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });

  return resolveResponse(res, "Failed to create petition", {
    logoutOn401: true,
  });
}

// ✅ CITIZEN/ADMIN: GET /api/petitions/mine/list
export async function fetchMyPetitions({ page = 1, limit = 12 } = {}) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));

  const res = await fetch(
    `${API_BASE}/petitions/mine/list?${params.toString()}`,
    {
      headers: authHeaders(),
    },
  );

  return resolveResponse(res, "Failed to fetch your petitions", {
    logoutOn401: true,
  });
}

// ✅ CITIZEN/ADMIN: POST /api/petitions/:id/sign
export async function signPetition(id) {
  const res = await fetch(`${API_BASE}/petitions/${id}/sign`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({}),
  });

  return resolveResponse(res, "Failed to sign petition", {
    logoutOn401: true,
  });
}
