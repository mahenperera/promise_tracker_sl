const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

function getToken() {
  return (
    localStorage.getItem("token") || localStorage.getItem("authToken") || ""
  );
}

function getUser() {
  try {
    return (
      JSON.parse(localStorage.getItem("user") || "null") ||
      JSON.parse(localStorage.getItem("authUser") || "null")
    );
  } catch {
    return null;
  }
}

async function authFetch(url, options = {}) {
  const token = getToken();
  const headers = new Headers(options.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);
  headers.set("Content-Type", "application/json");

  const res = await fetch(url, { ...options, headers });
  return res;
}

// PUBLIC: GET /api/petitions?search=&page=&limit=
export async function fetchPublicPetitions({
  search = "",
  page = 1,
  limit = 10,
} = {}) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  params.set("page", String(page));
  params.set("limit", String(limit));

  const res = await fetch(`${API_BASE}/petitions?${params.toString()}`);
  if (!res.ok) throw new Error(`Failed to fetch petitions (${res.status})`);
  return res.json(); // { message, items, meta }
}

// PUBLIC-ish: GET /api/petitions/:id (approved public; else owner/admin)
export async function fetchPetitionById(id) {
  const res = await authFetch(`${API_BASE}/petitions/${id}`);
  if (res.status === 403)
    throw new Error("Forbidden (this petition is not public yet).");
  if (!res.ok) throw new Error(`Failed to fetch petition (${res.status})`);
  return res.json(); // { message, data }
}

// CITIZEN/ADMIN: POST /api/petitions
export async function createPetition(payload) {
  const token = getToken();
  if (!token) throw new Error("Please sign in to create a petition.");

  const res = await authFetch(`${API_BASE}/petitions`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (res.status === 401 || res.status === 403) {
    throw new Error("Not authorized. Please sign in as a citizen/admin.");
  }
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Failed to submit petition (${res.status}): ${txt}`);
  }

  return res.json(); // { message, data }
}

// CITIZEN/ADMIN: GET /api/petitions/mine/list?page=&limit=
export async function fetchMyPetitions({ page = 1, limit = 10 } = {}) {
  const token = getToken();
  if (!token) throw new Error("Please sign in to view your petitions.");

  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));

  const res = await authFetch(
    `${API_BASE}/petitions/mine/list?${params.toString()}`,
  );
  if (res.status === 401 || res.status === 403) {
    throw new Error("Not authorized. Please sign in as a citizen/admin.");
  }
  if (!res.ok) throw new Error(`Failed to fetch my petitions (${res.status})`);
  return res.json(); // { message, items, meta }
}

// CITIZEN/ADMIN: POST /api/petitions/:id/sign
export async function signPetition(id) {
  const token = getToken();
  if (!token) throw new Error("Please sign in to sign this petition.");

  const res = await authFetch(`${API_BASE}/petitions/${id}/sign`, {
    method: "POST",
  });

  if (res.status === 409)
    return { message: "Already signed", alreadySigned: true };
  if (res.status === 400) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message || "Petition is not signable.");
  }
  if (res.status === 401 || res.status === 403) {
    throw new Error("Not authorized to sign. Please sign in as citizen/admin.");
  }
  if (!res.ok) throw new Error(`Failed to sign petition (${res.status})`);

  return res.json(); // { message, signCount }
}

// Optional helper for UI (safe)
export function getStoredUser() {
  return getUser();
}
