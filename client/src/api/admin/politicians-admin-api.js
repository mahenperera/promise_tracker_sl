// import { getToken } from "../../utils/auth-storage.js";

// const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

// async function safeJson(res) {
//   const ct = res.headers.get("content-type") || "";
//   if (ct.includes("application/json")) return res.json();
//   const text = await res.text();
//   return { message: text };
// }

// function authHeaders() {
//   const token = getToken();
//   return token ? { Authorization: `Bearer ${token}` } : {};
// }

// // ADMIN: list (uses same endpoint but admin can manage from here)
// export async function adminListPoliticians({
//   search = "",
//   page = 1,
//   limit = 12,
//   isActive,
// } = {}) {
//   const params = new URLSearchParams();
//   if (search) params.set("search", search);
//   params.set("page", String(page));
//   params.set("limit", String(limit));
//   if (typeof isActive !== "undefined") params.set("isActive", String(isActive));

//   const res = await fetch(`${API_BASE}/politicians?${params.toString()}`, {
//     headers: { ...authHeaders() },
//   });
//   const data = await safeJson(res);
//   if (!res.ok) throw new Error(data?.message || "Failed to fetch politicians");
//   return data; // { items, meta, message }
// }

// export async function adminCreatePolitician(payload) {
//   const res = await fetch(`${API_BASE}/politicians`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       ...authHeaders(),
//     },
//     body: JSON.stringify(payload),
//   });

//   const data = await safeJson(res);
//   if (!res.ok)
//     throw new Error(
//       data?.errors?.[0] || data?.message || "Failed to create politician",
//     );
//   return data; // { message, data }
// }

// export async function adminUpdatePolitician(id, payload) {
//   const res = await fetch(`${API_BASE}/politicians/${id}`, {
//     method: "PATCH",
//     headers: {
//       "Content-Type": "application/json",
//       ...authHeaders(),
//     },
//     body: JSON.stringify(payload),
//   });

//   const data = await safeJson(res);
//   if (!res.ok)
//     throw new Error(
//       data?.errors?.[0] || data?.message || "Failed to update politician",
//     );
//   return data; // { message, data }
// }

// // soft delete in your backend (isActive=false)
// export async function adminDeactivatePolitician(id) {
//   const res = await fetch(`${API_BASE}/politicians/${id}`, {
//     method: "DELETE",
//     headers: { ...authHeaders() },
//   });

//   const data = await safeJson(res);
//   if (!res.ok)
//     throw new Error(data?.message || "Failed to deactivate politician");
//   return data; // { message, data }
// }

import { getToken } from "../../utils/auth-storage.js";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

async function safeJson(res) {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  const text = await res.text();
  return { message: text };
}

function authHeaders(extra = {}) {
  const token = getToken();
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

function getErrorMessage(data, fallback) {
  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    const first = data.errors[0];
    if (typeof first === "string") return first;
    return first?.message || first?.msg || data?.message || fallback;
  }
  return data?.message || fallback;
}

export async function adminListPoliticians({
  search = "",
  page = 1,
  limit = 12,
  isActive,
} = {}) {
  const params = new URLSearchParams();

  if (search) params.set("search", search);
  params.set("page", String(page));
  params.set("limit", String(limit));
  if (typeof isActive !== "undefined") {
    params.set("isActive", String(isActive));
  }

  const res = await fetch(`${API_BASE}/politicians?${params.toString()}`, {
    headers: authHeaders(),
  });

  const data = await safeJson(res);
  if (!res.ok) {
    throw new Error(getErrorMessage(data, "Failed to fetch politicians"));
  }

  return {
    items: data?.items || [],
    meta: data?.meta || null,
    raw: data,
  };
}

export async function adminCreatePolitician(payload) {
  const res = await fetch(`${API_BASE}/politicians`, {
    method: "POST",
    headers: authHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(payload),
  });

  const data = await safeJson(res);
  if (!res.ok) {
    throw new Error(getErrorMessage(data, "Failed to create politician"));
  }

  return data;
}

export async function adminUpdatePolitician(id, payload) {
  const res = await fetch(`${API_BASE}/politicians/${id}`, {
    method: "PATCH",
    headers: authHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(payload),
  });

  const data = await safeJson(res);
  if (!res.ok) {
    throw new Error(getErrorMessage(data, "Failed to update politician"));
  }

  return data;
}

export async function adminDeactivatePolitician(id) {
  const res = await fetch(`${API_BASE}/politicians/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  const data = await safeJson(res);
  if (!res.ok) {
    throw new Error(getErrorMessage(data, "Failed to deactivate politician"));
  }

  return data;
}
