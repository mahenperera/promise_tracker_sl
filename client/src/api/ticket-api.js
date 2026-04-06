import { authHeaders } from "../utils/auth-storage.js";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

async function safeJson(res) {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  const text = await res.text();
  return { message: text };
}

export async function createTicket(data) {
  const res = await fetch(`${API_BASE}/tickets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err.message || "Failed to create ticket");
  }

  return safeJson(res);
}

export async function fetchTickets({ status, assigned } = {}) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (assigned) params.set("assigned", assigned);

  const res = await fetch(`${API_BASE}/tickets?${params.toString()}`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err.message || "Failed to fetch tickets");
  }

  return safeJson(res);
}

export async function fetchTicketById(id) {
  const res = await fetch(`${API_BASE}/tickets/${id}`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err.message || "Failed to fetch ticket");
  }

  return safeJson(res);
}

export async function replyToTicket(id, message) {
  const res = await fetch(`${API_BASE}/tickets/${id}/reply`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({ message }),
  });

  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err.message || "Failed to reply to ticket");
  }

  return safeJson(res);
}
