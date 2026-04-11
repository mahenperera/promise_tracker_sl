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

export async function adminListPromises({
  search = "",
  status = "all",
  politicianId,
  partyId,
  page = 1,
  limit = 12,
} = {}) {
  const params = new URLSearchParams();

  if (search) params.set("search", search);
  if (status && status !== "all") params.set("status", status);
  if (politicianId) params.set("politicianId", politicianId);
  if (partyId) params.set("partyId", partyId);
  params.set("page", String(page));
  params.set("limit", String(limit));

  const res = await fetch(
    `${API_BASE}/promises/admin/all?${params.toString()}`,
    {
      headers: { ...authHeaders() },
    },
  );

  const data = await safeJson(res);
  if (!res.ok)
    throw new Error(getErrorMessage(data, "Failed to fetch promises"));
  return data;
}

export async function adminUpdatePromiseStatus(id, status) {
  const res = await fetch(`${API_BASE}/promises/admin/${id}/status`, {
    method: "PATCH",
    headers: {
      ...authHeaders({ "Content-Type": "application/json" }),
    },
    body: JSON.stringify({ status }),
  });

  const data = await safeJson(res);
  if (!res.ok)
    throw new Error(getErrorMessage(data, "Failed to update promise status"));
  return data;
}

export async function adminDeletePromise(id) {
  const res = await fetch(`${API_BASE}/promises/${id}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });

  const data = await safeJson(res);
  if (!res.ok)
    throw new Error(getErrorMessage(data, "Failed to delete promise"));
  return data;
}
