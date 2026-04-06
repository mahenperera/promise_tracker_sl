// // client/src/utils/auth-storage.js
// const KEY = "ptsl_auth";

// export function getAuth() {
//   try {
//     const raw = localStorage.getItem(KEY);
//     return raw ? JSON.parse(raw) : null;
//   } catch {
//     return null;
//   }
// }

// export function getToken() {
//   return getAuth()?.token || "";
// }

// export function getUser() {
//   return getAuth()?.user || null;
// }

// export function isAuthed() {
//   return !!getToken();
// }

// export function isAdmin() {
//   const u = getUser();
//   return !!u && u.role === "admin" && !!getToken();
// }

// export function setAuth({ token, user }) {
//   localStorage.setItem(KEY, JSON.stringify({ token, user }));
// }

// export function clearAuth() {
//   localStorage.removeItem(KEY);
// }

// export function authHeaders(extra = {}) {
//   const token = getToken();
//   return token ? { ...extra, Authorization: `Bearer ${token}` } : { ...extra };
// }

const TOKEN_KEY = "pt_token";
const USER_KEY = "pt_user";

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

export function setAuth(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthed() {
  return Boolean(getToken());
}

export function isAdmin() {
  return getUser()?.role === "admin";
}
