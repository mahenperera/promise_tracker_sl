// import React, { createContext, useContext, useMemo, useState } from "react";
// import { loginApi, registerApi } from "../api/auth-api";

// const AuthContext = createContext(null);

// export function AuthProvider({ children }) {
//   const [token, setToken] = useState(
//     () => localStorage.getItem("ptsl_token") || "",
//   );
//   const [user, setUser] = useState(() => {
//     const raw = localStorage.getItem("ptsl_user");
//     return raw ? JSON.parse(raw) : null;
//   });

//   const isAuthed = !!token;

//   const login = async ({ email, password }) => {
//     const res = await loginApi({ email, password }); // { token, user }
//     setToken(res.token);
//     setUser(res.user);
//     localStorage.setItem("ptsl_token", res.token);
//     localStorage.setItem("ptsl_user", JSON.stringify(res.user));
//     return res;
//   };

//   const register = async ({ email, password, role }) => {
//     const res = await registerApi({ email, password, role }); // { token, user }
//     setToken(res.token);
//     setUser(res.user);
//     localStorage.setItem("ptsl_token", res.token);
//     localStorage.setItem("ptsl_user", JSON.stringify(res.user));
//     return res;
//   };

//   const logout = () => {
//     setToken("");
//     setUser(null);
//     localStorage.removeItem("ptsl_token");
//     localStorage.removeItem("ptsl_user");
//   };

//   const value = useMemo(
//     () => ({ token, user, isAuthed, login, register, logout }),
//     [token, user, isAuthed],
//   );

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// }

// export function useAuth() {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error("useAuth must be used inside <AuthProvider />");
//   return ctx;
// }

import React, { createContext, useContext, useMemo, useState } from "react";
import {
  clearAuth,
  getToken,
  getUser,
  setAuth,
} from "../utils/auth-storage.js";

const AuthContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

async function safeJson(res) {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  const text = await res.text();
  return { message: text };
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getToken());
  const [user, setUser] = useState(getUser());
  const [authLoading, setAuthLoading] = useState(false);

  const login = async (email, password) => {
    setAuthLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await safeJson(res);

      if (!res.ok) {
        throw new Error(data?.error || data?.message || "Login failed");
      }

      // backend returns: { token, user: { userId, email, role } }
      setAuth(data.token, data.user);
      setToken(data.token);
      setUser(data.user);

      return data.user;
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    clearAuth();
    setToken("");
    setUser(null);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      authLoading,
      isAuthed: Boolean(token),
      login,
      logout,
    }),
    [token, user, authLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider />");
  return ctx;
}
