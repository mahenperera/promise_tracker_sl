const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

// List parties
export async function fetchParties({ search = "", page = 1, limit = 12 } = {}) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  params.set("page", String(page));
  params.set("limit", String(limit));
  params.set("isActive", "true");

  const res = await fetch(`${API_BASE}/parties?${params.toString()}`);
  if (!res.ok) throw new Error(`Failed to fetch parties (${res.status})`);
  return res.json();
}

// Party profile by slug
export async function fetchPartyBySlug(slug) {
  const res = await fetch(`${API_BASE}/parties/${slug}`);
  if (!res.ok) throw new Error(`Failed to fetch party (${res.status})`);
  return res.json();
}

// Party politicians by slug
export async function fetchPartyPoliticians(
  slug,
  { page = 1, limit = 12 } = {},
) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  params.set("isActive", "true");

  const res = await fetch(
    `${API_BASE}/parties/${slug}/politicians?${params.toString()}`,
  );
  if (!res.ok)
    throw new Error(`Failed to fetch party politicians (${res.status})`);
  return res.json();
}
