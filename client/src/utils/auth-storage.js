// // client/src/utils/auth-storage.js

// const TOKEN_KEY = "ptsl_token";
// const USER_KEY = "ptsl_user";

// export function setAuth(token, user) {
//   localStorage.setItem(TOKEN_KEY, token);
//   localStorage.setItem(USER_KEY, JSON.stringify(user));
// }

// export function clearAuth() {
//   localStorage.removeItem(TOKEN_KEY);
//   localStorage.removeItem(USER_KEY);
// }

// export function getToken() {
//   return localStorage.getItem(TOKEN_KEY) || "";
// }

// export function getUser() {
//   try {
//     const raw = localStorage.getItem(USER_KEY);
//     return raw ? JSON.parse(raw) : null;
//   } catch {
//     return null;
//   }
// }

// export function isAdmin() {
//   const u = getUser();
//   return Boolean(u && u.role === "admin");
// }

const TOKEN_KEY = "ptsl_token";
const USER_KEY = "ptsl_user";

export function setAuth(token, user) {
  localStorage.setItem(TOKEN_KEY, token || "");
  localStorage.setItem(USER_KEY, JSON.stringify(user || null));
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}

export function getUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isAdmin() {
  const u = getUser();
  return Boolean(u && u.role === "admin");
}

// ✅ THIS is what your petitions-api.js is missing
export function authHeaders(extra = {}) {
  const token = getToken();
  return token ? { ...extra, Authorization: `Bearer ${token}` } : { ...extra };
}
