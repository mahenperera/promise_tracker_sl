import { authHeaders } from "../utils/auth-storage.js";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

async function safeJson(res) {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  const text = await res.text();
  return { message: text };
}

export async function fetchPromises({
  search = "",
  page = 1,
  limit = 12,
  politicianId,
  partyId,
  status,
  isActive = true,
} = {}) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  params.set("page", String(page));
  params.set("limit", String(limit));
  if (politicianId) params.set("politicianId", politicianId);
  if (partyId) params.set("partyId", partyId);
  if (status) params.set("status", status);
  params.set("isActive", String(isActive));

  const res = await fetch(`${API_BASE}/promises?${params.toString()}`);
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.message || `Failed (${res.status})`);
  return data;
}

export async function fetchPromiseById(id) {
  const res = await fetch(`${API_BASE}/promises/${id}`);
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.message || `Failed (${res.status})`);
  return data;
}

export async function fetchPromiseBySlug(politicianSlug, slug) {
  const res = await fetch(
    `${API_BASE}/promises/slug/${politicianSlug}/${slug}`,
  );
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.message || `Failed (${res.status})`);
  return data;
}

export async function createPromise(payload) {
  const res = await fetch(`${API_BASE}/promises`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.message || `Failed (${res.status})`);
  return data;
}

export async function updatePromise(id, payload) {
  const res = await fetch(`${API_BASE}/promises/${id}`, {
    method: "PATCH",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.message || `Failed (${res.status})`);
  return data;
}

export async function deletePromise(id) {
  const res = await fetch(`${API_BASE}/promises/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.message || `Failed (${res.status})`);
  return data;
}
