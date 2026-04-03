const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

export async function fetchParties() {
  const res = await fetch(`${API_BASE}/parties`);
  if (!res.ok) throw new Error(`Failed to fetch parties (${res.status})`);
  return res.json(); // { message, items }
}

export async function fetchPartyBySlug(slug) {
  const res = await fetch(`${API_BASE}/parties/${slug}`);
  if (!res.ok) throw new Error(`Failed to fetch party (${res.status})`);
  return res.json(); // { message, data: { party, politicians } }
}
