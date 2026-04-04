// const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

// function getToken() {
//   return (
//     localStorage.getItem("token") || localStorage.getItem("authToken") || ""
//   );
// }

// function getUser() {
//   try {
//     return (
//       JSON.parse(localStorage.getItem("user") || "null") ||
//       JSON.parse(localStorage.getItem("authUser") || "null")
//     );
//   } catch {
//     return null;
//   }
// }

// async function authFetch(url, options = {}) {
//   const token = getToken();
//   const headers = new Headers(options.headers || {});
//   if (token) headers.set("Authorization", `Bearer ${token}`);
//   headers.set("Content-Type", "application/json");

//   const res = await fetch(url, { ...options, headers });
//   return res;
// }

// // PUBLIC: GET /api/petitions?search=&page=&limit=
// export async function fetchPublicPetitions({
//   search = "",
//   page = 1,
//   limit = 10,
// } = {}) {
//   const params = new URLSearchParams();
//   if (search) params.set("search", search);
//   params.set("page", String(page));
//   params.set("limit", String(limit));

//   const res = await fetch(`${API_BASE}/petitions?${params.toString()}`);
//   if (!res.ok) throw new Error(`Failed to fetch petitions (${res.status})`);
//   return res.json(); // { message, items, meta }
// }

// // PUBLIC-ish: GET /api/petitions/:id (approved public; else owner/admin)
// export async function fetchPetitionById(id) {
//   const res = await authFetch(`${API_BASE}/petitions/${id}`);
//   if (res.status === 403)
//     throw new Error("Forbidden (this petition is not public yet).");
//   if (!res.ok) throw new Error(`Failed to fetch petition (${res.status})`);
//   return res.json(); // { message, data }
// }

// // CITIZEN/ADMIN: POST /api/petitions
// export async function createPetition(payload) {
//   const token = getToken();
//   if (!token) throw new Error("Please sign in to create a petition.");

//   const res = await authFetch(`${API_BASE}/petitions`, {
//     method: "POST",
//     body: JSON.stringify(payload),
//   });

//   if (res.status === 401 || res.status === 403) {
//     throw new Error("Not authorized. Please sign in as a citizen/admin.");
//   }
//   if (!res.ok) {
//     const txt = await res.text();
//     throw new Error(`Failed to submit petition (${res.status}): ${txt}`);
//   }

//   return res.json(); // { message, data }
// }

// // CITIZEN/ADMIN: GET /api/petitions/mine/list?page=&limit=
// export async function fetchMyPetitions({ page = 1, limit = 10 } = {}) {
//   const token = getToken();
//   if (!token) throw new Error("Please sign in to view your petitions.");

//   const params = new URLSearchParams();
//   params.set("page", String(page));
//   params.set("limit", String(limit));

//   const res = await authFetch(
//     `${API_BASE}/petitions/mine/list?${params.toString()}`,
//   );
//   if (res.status === 401 || res.status === 403) {
//     throw new Error("Not authorized. Please sign in as a citizen/admin.");
//   }
//   if (!res.ok) throw new Error(`Failed to fetch my petitions (${res.status})`);
//   return res.json(); // { message, items, meta }
// }

// // CITIZEN/ADMIN: POST /api/petitions/:id/sign
// export async function signPetition(id) {
//   const token = getToken();
//   if (!token) throw new Error("Please sign in to sign this petition.");

//   const res = await authFetch(`${API_BASE}/petitions/${id}/sign`, {
//     method: "POST",
//   });

//   if (res.status === 409)
//     return { message: "Already signed", alreadySigned: true };
//   if (res.status === 400) {
//     const data = await res.json().catch(() => ({}));
//     throw new Error(data?.message || "Petition is not signable.");
//   }
//   if (res.status === 401 || res.status === 403) {
//     throw new Error("Not authorized to sign. Please sign in as citizen/admin.");
//   }
//   if (!res.ok) throw new Error(`Failed to sign petition (${res.status})`);

//   return res.json(); // { message, signCount }
// }

// // Optional helper for UI (safe)
// export function getStoredUser() {
//   return getUser();
// }

// client/src/api/petitions-api.js
// import { authHeaders } from "../utils/auth-storage.js";

// const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

// // PUBLIC: GET /api/petitions
// export async function fetchPublicPetitions({
//   search = "",
//   page = 1,
//   limit = 10,
// } = {}) {
//   const params = new URLSearchParams();
//   if (search) params.set("search", search);
//   params.set("page", String(page));
//   params.set("limit", String(limit));

//   const res = await fetch(`${API_BASE}/petitions?${params.toString()}`);
//   const data = await res.json().catch(() => ({}));
//   if (!res.ok) throw new Error(data?.message || `Failed (${res.status})`);
//   return data; // { message, items, meta }
// }

// // PUBLIC-ish: GET /api/petitions/:id (optional auth)
// export async function fetchPetitionById(id) {
//   const res = await fetch(`${API_BASE}/petitions/${id}`, {
//     headers: authHeaders(),
//   });
//   const data = await res.json().catch(() => ({}));
//   if (!res.ok)
//     throw new Error(data?.message || data?.error || `Failed (${res.status})`);
//   return data; // { message, data }
// }

// // CITIZEN: POST /api/petitions/:id/sign
// export async function signPetition(id) {
//   const res = await fetch(`${API_BASE}/petitions/${id}/sign`, {
//     method: "POST",
//     headers: authHeaders({ "Content-Type": "application/json" }),
//   });
//   const data = await res.json().catch(() => ({}));
//   if (!res.ok) throw new Error(data?.message || `Failed (${res.status})`);
//   return data; // { message, signCount }
// }

// // ADMIN: GET /api/petitions/admin/all
// export async function adminFetchPetitions({
//   status = "",
//   search = "",
//   page = 1,
//   limit = 10,
// } = {}) {
//   const params = new URLSearchParams();
//   if (status) params.set("status", status);
//   if (search) params.set("search", search);
//   params.set("page", String(page));
//   params.set("limit", String(limit));

//   const res = await fetch(
//     `${API_BASE}/petitions/admin/all?${params.toString()}`,
//     {
//       headers: authHeaders(),
//     },
//   );
//   const data = await res.json().catch(() => ({}));
//   if (!res.ok) throw new Error(data?.message || `Failed (${res.status})`);
//   return data; // { message, items, meta }
// }

// // ADMIN: PATCH /api/petitions/admin/:id/approve
// export async function adminApprovePetition(id) {
//   const res = await fetch(`${API_BASE}/petitions/admin/${id}/approve`, {
//     method: "PATCH",
//     headers: authHeaders({ "Content-Type": "application/json" }),
//   });
//   const data = await res.json().catch(() => ({}));
//   if (!res.ok) throw new Error(data?.message || `Failed (${res.status})`);
//   return data; // { message, data }
// }

// // ADMIN: PATCH /api/petitions/admin/:id/reject  body: { rejectionReason }
// export async function adminRejectPetition(id, rejectionReason) {
//   const res = await fetch(`${API_BASE}/petitions/admin/${id}/reject`, {
//     method: "PATCH",
//     headers: authHeaders({ "Content-Type": "application/json" }),
//     body: JSON.stringify({ rejectionReason }),
//   });
//   const data = await res.json().catch(() => ({}));
//   if (!res.ok) throw new Error(data?.message || `Failed (${res.status})`);
//   return data; // { message, data }
// }

// client/src/api/petitions-api.js
// import { authHeaders } from "../utils/auth-storage.js";

// const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

// // ✅ ADMIN: list all petitions
// export async function adminFetchPetitions({
//   search = "",
//   status = "",
//   page = 1,
//   limit = 10,
// } = {}) {
//   const params = new URLSearchParams();
//   if (search) params.set("search", search);
//   if (status) params.set("status", status);
//   params.set("page", String(page));
//   params.set("limit", String(limit));

//   const res = await fetch(
//     `${API_BASE}/petitions/admin/all?${params.toString()}`,
//     {
//       headers: authHeaders(),
//     },
//   );

//   const data = await res.json().catch(() => ({}));
//   if (!res.ok) throw new Error(data?.message || `Failed (${res.status})`);
//   return data; // expected: { message, items, meta }
// }

// // ✅ ADMIN: approve
// export async function adminApprovePetition(id) {
//   const res = await fetch(`${API_BASE}/petitions/admin/${id}/approve`, {
//     method: "PATCH",
//     headers: authHeaders({ "Content-Type": "application/json" }),
//   });

//   const data = await res.json().catch(() => ({}));
//   if (!res.ok) throw new Error(data?.message || `Failed (${res.status})`);
//   return data; // expected: { message, data }
// }

// // ✅ ADMIN: reject (expects { rejectionReason })
// export async function adminRejectPetition(id, rejectionReason) {
//   const res = await fetch(`${API_BASE}/petitions/admin/${id}/reject`, {
//     method: "PATCH",
//     headers: authHeaders({ "Content-Type": "application/json" }),
//     body: JSON.stringify({ rejectionReason }),
//   });

//   const data = await res.json().catch(() => ({}));
//   if (!res.ok) throw new Error(data?.message || `Failed (${res.status})`);
//   return data; // expected: { message, data }
// }

// client/src/api/petitions-api.js
// import { authHeaders } from "../utils/auth-storage.js";

// const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

// async function safeJson(res) {
//   const ct = res.headers.get("content-type") || "";
//   if (ct.includes("application/json")) return res.json();
//   const text = await res.text();
//   return { message: text };
// }

// /** PUBLIC: GET /api/petitions (approved only) */
// export async function fetchPublicPetitions({
//   search = "",
//   page = 1,
//   limit = 12,
// } = {}) {
//   const params = new URLSearchParams();
//   if (search) params.set("search", search);
//   params.set("page", String(page));
//   params.set("limit", String(limit));

//   const res = await fetch(`${API_BASE}/petitions?${params.toString()}`);
//   const data = await safeJson(res);
//   if (!res.ok) throw new Error(data?.message || `Failed (${res.status})`);
//   return data; // { message, items, meta }
// }

// /** PUBLIC-ish: GET /api/petitions/:id (optional auth) */
// export async function fetchPetitionById(id) {
//   const res = await fetch(`${API_BASE}/petitions/${id}`, {
//     headers: authHeaders(),
//   });
//   const data = await safeJson(res);
//   if (!res.ok) throw new Error(data?.message || `Failed (${res.status})`);
//   return data; // { message, data }
// }

// /** CITIZEN/ADMIN: POST /api/petitions */
// export async function createPetition(payload) {
//   const res = await fetch(`${API_BASE}/petitions`, {
//     method: "POST",
//     headers: authHeaders({ "Content-Type": "application/json" }),
//     body: JSON.stringify(payload),
//   });
//   const data = await safeJson(res);
//   if (!res.ok)
//     throw new Error(data?.message || data?.error || `Failed (${res.status})`);
//   return data;
// }

// /** CITIZEN/ADMIN: GET /api/petitions/mine/list */
// export async function fetchMyPetitions({ page = 1, limit = 12 } = {}) {
//   const params = new URLSearchParams();
//   params.set("page", String(page));
//   params.set("limit", String(limit));

//   const res = await fetch(
//     `${API_BASE}/petitions/mine/list?${params.toString()}`,
//     {
//       headers: authHeaders(),
//     },
//   );
//   const data = await safeJson(res);
//   if (!res.ok) throw new Error(data?.message || `Failed (${res.status})`);
//   return data;
// }

// /** CITIZEN/ADMIN: POST /api/petitions/:id/sign */
// export async function signPetition(id) {
//   const res = await fetch(`${API_BASE}/petitions/${id}/sign`, {
//     method: "POST",
//     headers: authHeaders(),
//   });
//   const data = await safeJson(res);
//   if (!res.ok) throw new Error(data?.message || `Failed (${res.status})`);
//   return data;
// }

// client/src/api/petitions-api.js
import { authHeaders, getUser } from "../utils/auth-storage.js";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

async function safeJson(res) {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  const text = await res.text();
  return { message: text };
}

// ✅ PUBLIC: list approved petitions
export async function fetchPublicPetitions({
  search = "",
  page = 1,
  limit = 12,
} = {}) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  params.set("page", String(page));
  params.set("limit", String(limit));

  const res = await fetch(`${API_BASE}/petitions?${params.toString()}`);
  const data = await safeJson(res);
  if (!res.ok)
    throw new Error(
      data?.message || `Failed to fetch petitions (${res.status})`,
    );
  return data; // { items, meta, message } (based on your backend style)
}

// ✅ PUBLIC-ish by id (approved public, else owner/admin if token sent)
export async function fetchPetitionById(id) {
  const res = await fetch(`${API_BASE}/petitions/${id}`, {
    headers: authHeaders(),
  });
  const data = await safeJson(res);
  if (!res.ok)
    throw new Error(
      data?.message || `Failed to fetch petition (${res.status})`,
    );
  return data; // { data, message }
}

// ✅ CITIZEN/ADMIN: create petition
export async function createPetition(payload) {
  const res = await fetch(`${API_BASE}/petitions`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  const data = await safeJson(res);
  if (!res.ok)
    throw new Error(
      data?.error || data?.message || `Create failed (${res.status})`,
    );
  return data;
}

// ✅ CITIZEN/ADMIN: list my petitions
export async function fetchMyPetitions({ page = 1, limit = 12 } = {}) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));

  const res = await fetch(
    `${API_BASE}/petitions/mine/list?${params.toString()}`,
    {
      headers: authHeaders(),
    },
  );
  const data = await safeJson(res);
  if (!res.ok)
    throw new Error(
      data?.message || `Failed to fetch my petitions (${res.status})`,
    );
  return data;
}

// ✅ CITIZEN/ADMIN: sign petition
export async function signPetition(id) {
  const res = await fetch(`${API_BASE}/petitions/${id}/sign`, {
    method: "POST",
    headers: authHeaders(),
  });
  const data = await safeJson(res);
  if (!res.ok)
    throw new Error(
      data?.error || data?.message || `Sign failed (${res.status})`,
    );
  return data;
}

/** ---------------- ADMIN ---------------- **/

export async function fetchAdminPetitions() {
  const res = await fetch(`${API_BASE}/petitions/admin/all`, {
    headers: authHeaders(),
  });
  const data = await safeJson(res);
  if (!res.ok)
    throw new Error(
      data?.message || `Failed to fetch admin petitions (${res.status})`,
    );
  return data;
}

export async function approvePetition(id) {
  const res = await fetch(`${API_BASE}/petitions/admin/${id}/approve`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  const data = await safeJson(res);
  if (!res.ok)
    throw new Error(data?.message || `Approve failed (${res.status})`);
  return data;
}

export async function rejectPetition(id) {
  const res = await fetch(`${API_BASE}/petitions/admin/${id}/reject`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  const data = await safeJson(res);
  if (!res.ok)
    throw new Error(data?.message || `Reject failed (${res.status})`);
  return data;
}

// ✅ to stop your current error: PetitionDetails.jsx is importing this name from petitions-api
export function getStoredUser() {
  return getUser();
}
