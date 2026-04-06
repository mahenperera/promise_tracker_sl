const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";
// Recommended: VITE_API_BASE_URL=http://localhost:5000/api

export async function fetchPoliticians({
  search = "",
  page = 1,
  limit = 12,
} = {}) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  params.set("page", String(page));
  params.set("limit", String(limit));
  params.set("isActive", "true");

  const res = await fetch(`${API_BASE}/politicians?${params.toString()}`);
  if (!res.ok) throw new Error(`Failed to fetch politicians (${res.status})`);
  return res.json(); // { message, items, meta }
}

export async function fetchPoliticianBySlug(slug) {
  const res = await fetch(`${API_BASE}/politicians/slug/${slug}`);
  if (!res.ok) throw new Error(`Failed to fetch politician (${res.status})`);
  return res.json(); // { message, data }
}
