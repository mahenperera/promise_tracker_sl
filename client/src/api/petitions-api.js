// client/src/api/petitions-api.js
import { authHeaders } from "../utils/auth-storage.js";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

async function safeJson(res) {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  const text = await res.text();
  return { message: text };
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
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.message || `Failed (${res.status})`);
  return data;
}

// ✅ PUBLIC-ish: GET /api/petitions/:id (token if available)
export async function fetchPetitionById(id) {
  const res = await fetch(`${API_BASE}/petitions/${id}`, {
    headers: authHeaders(),
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.message || `Failed (${res.status})`);
  return data;
}

// ✅ CITIZEN/ADMIN: POST /api/petitions
export async function createPetition(payload) {
  const res = await fetch(`${API_BASE}/petitions`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.message || `Failed (${res.status})`);
  return data;
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
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.message || `Failed (${res.status})`);
  return data;
}

// ✅ CITIZEN/ADMIN: POST /api/petitions/:id/sign
export async function signPetition(id) {
  const res = await fetch(`${API_BASE}/petitions/${id}/sign`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({}),
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.message || `Failed (${res.status})`);
  return data;
}
