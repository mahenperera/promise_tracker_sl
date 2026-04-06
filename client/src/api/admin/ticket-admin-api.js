import { authHeaders } from "../../utils/auth-storage.js";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

async function safeJson(res) {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  const text = await res.text();
  return { message: text };
}

export async function getAdmins() {
  const res = await fetch(`${API_BASE}/auth/admins`, {
    method: "GET",
    headers: authHeaders(),
  });

  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err.message || "Failed to fetch admins");
  }

  return safeJson(res);
}

export async function updateTicket(id, data) {
  const res = await fetch(`${API_BASE}/tickets/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err.message || "Failed to update ticket");
  }

  return safeJson(res);
}

export async function assignTicket(id, assignedTo) {
  const res = await fetch(`${API_BASE}/tickets/${id}/assign`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({ assignedTo }),
  });

  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err.message || "Failed to assign ticket");
  }

  return safeJson(res);
}

export async function deleteTicket(id) {
  const res = await fetch(`${API_BASE}/tickets/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err.message || "Failed to delete ticket");
  }

  return safeJson(res);
}
