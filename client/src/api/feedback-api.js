import { authHeaders } from "../utils/auth-storage.js";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

async function safeJson(res) {
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) return res.json();
    const text = await res.text();
    return { message: text };
}

export async function fetchPromiseFeedback(promiseId) {
    const res = await fetch(`${API_BASE}/feedback/${promiseId}/feedback`, {
        headers: authHeaders(),
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data?.message || `Failed (${res.status})`);
    return data;
}

export async function submitFeedback(promiseId, content) {
    const res = await fetch(`${API_BASE}/feedback/${promiseId}/feedback`, {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ content }),
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data?.message || `Failed (${res.status})`);
    return data;
}

export async function updateFeedback(id, content) {
    const res = await fetch(`${API_BASE}/feedback/${id}`, {
        method: "PUT",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ content }),
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data?.message || `Failed (${res.status})`);
    return data;
}

export async function deleteFeedback(id) {
    const res = await fetch(`${API_BASE}/feedback/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data?.message || `Failed (${res.status})`);
    return data;
}
