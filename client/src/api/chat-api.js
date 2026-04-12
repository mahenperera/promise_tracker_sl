const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

async function safeJson(res) {
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) return res.json();
    const text = await res.text();
    return { message: text };
}

export async function sendChatMessage(message, history) {
    const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history }),
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data?.message || `Failed to chat (${res.status})`);
    return data;
}
