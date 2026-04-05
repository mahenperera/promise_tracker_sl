import { getToken } from "../../utils/auth-storage.js";

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
    return first?.msg || first?.message || data?.message || fallback;
  }
  return data?.message || fallback;
}

export async function adminListPetitions({
  search = "",
  status = "all",
  page = 1,
  limit = 12,
} = {}) {
  const params = new URLSearchParams();

  if (search) params.set("search", search);
  if (status && status !== "all") params.set("status", status);
  params.set("page", String(page));
  params.set("limit", String(limit));

  const res = await fetch(
    `${API_BASE}/petitions/admin/all?${params.toString()}`,
    {
      headers: { ...authHeaders() },
    },
  );

  const data = await safeJson(res);
  if (!res.ok)
    throw new Error(getErrorMessage(data, "Failed to fetch petitions"));

  const items = data?.items || data?.data?.items || data?.data || [];
  const meta = data?.meta || data?.data?.meta || null;

  return { raw: data, items, meta };
}

export async function adminApprovePetition(id) {
  const res = await fetch(`${API_BASE}/petitions/admin/${id}/approve`, {
    method: "PATCH",
    headers: { ...authHeaders() },
  });

  const data = await safeJson(res);
  if (!res.ok) throw new Error(getErrorMessage(data, "Approve failed"));
  return data;
}

export async function adminRejectPetition(id, payload) {
  const res = await fetch(`${API_BASE}/petitions/admin/${id}/reject`, {
    method: "PATCH",
    headers: authHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(payload),
  });

  const data = await safeJson(res);
  if (!res.ok) throw new Error(getErrorMessage(data, "Reject failed"));
  return data;
}
