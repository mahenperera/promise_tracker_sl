const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function fetchPoliticalNews({ q = "", limit = 12, signal } = {}) {
  const params = new URLSearchParams();
  if (q && q.trim()) params.set("q", q.trim());
  params.set("limit", String(limit));

  const res = await fetch(
    `${API_BASE}/api/news/political?${params.toString()}`,
    {
      method: "GET",
      signal,
    },
  );

  if (!res.ok) throw new Error(`News request failed (${res.status})`);
  return res.json(); // { message, items, meta }
}
