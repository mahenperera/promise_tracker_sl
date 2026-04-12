import { authHeaders } from "../utils/auth-storage.js";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

async function safeJson(res) {
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) return res.json();
    const text = await res.text();
    return { message: text };
}

export async function fetchPromiseRatings(promiseId) {
    const res = await fetch(`${API_BASE}/ratings/promise/${promiseId}`);
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data?.message || `Failed (${res.status})`);
    return data;
}

export async function fetchAverageRating(promiseId) {
    const res = await fetch(`${API_BASE}/ratings/promise/${promiseId}/average`);
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data?.message || `Failed (${res.status})`);
    return data;
}

export async function createRating({ promiseId, clerkUserId, rating }) {
    const res = await fetch(`${API_BASE}/ratings`, {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ promiseId, clerkUserId, rating }),
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data?.message || `Failed (${res.status})`);
    return data;
}

export async function updateRating({ id, clerkUserId, rating }) {
    const res = await fetch(`${API_BASE}/ratings/${id}`, {
        method: "PUT",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ clerkUserId, rating }),
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data?.message || `Failed (${res.status})`);
    return data;
}

export async function deleteRating({ id, clerkUserId }) {
    const res = await fetch(`${API_BASE}/ratings/${id}`, {
        method: "DELETE",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ clerkUserId }),
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data?.message || `Failed (${res.status})`);
    return data;
}
