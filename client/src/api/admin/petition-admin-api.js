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

export async function adminListPetitions() {
  const res = await fetch(`${API_BASE}/petitions/admin/all`, {
    headers: { ...authHeaders() },
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.message || "Failed to fetch petitions");

  // normalize: support { items } OR { data/items }
  const items = data?.items || data?.data?.items || data?.data || [];
  return { raw: data, items };
}

export async function adminApprovePetition(id) {
  const res = await fetch(`${API_BASE}/petitions/admin/${id}/approve`, {
    method: "PATCH",
    headers: { ...authHeaders() },
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.message || "Approve failed");
  return data;
}

export async function adminRejectPetition(id) {
  const res = await fetch(`${API_BASE}/petitions/admin/${id}/reject`, {
    method: "PATCH",
    headers: { ...authHeaders() },
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.message || "Reject failed");
  return data;
}
