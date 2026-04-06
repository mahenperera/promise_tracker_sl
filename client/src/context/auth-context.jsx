// import React, { createContext, useContext, useMemo, useState } from "react";
// import {
//   clearAuth,
//   getToken,
//   getUser,
//   setAuth,
// } from "../utils/auth-storage.js";

// const AuthContext = createContext(null);

// const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

// async function safeJson(res) {
//   const ct = res.headers.get("content-type") || "";
//   if (ct.includes("application/json")) return res.json();
//   const text = await res.text();
//   return { message: text };
// }

// export function AuthProvider({ children }) {
//   const [token, setToken] = useState(getToken());
//   const [user, setUser] = useState(getUser());
//   const [authLoading, setAuthLoading] = useState(false);

//   const login = async (email, password) => {
//     setAuthLoading(true);
//     try {
//       const res = await fetch(`${API_BASE}/auth/login`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, password }),
//       });

//       const data = await safeJson(res);

//       if (!res.ok) {
//         throw new Error(data?.error || data?.message || "Login failed");
//       }

//       // backend returns: { token, user: { userId, email, role } }
//       setAuth(data.token, data.user);
//       setToken(data.token);
//       setUser(data.user);

//       return data.user;
//     } finally {
//       setAuthLoading(false);
//     }
//   };

//   const logout = () => {
//     clearAuth();
//     setToken("");
//     setUser(null);
//   };

//   const value = useMemo(
//     () => ({
//       token,
//       user,
//       authLoading,
//       isAuthed: Boolean(token),
//       login,
//       logout,
//     }),
//     [token, user, authLoading],
//   );

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// }

// export function useAuth() {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error("useAuth must be used inside <AuthProvider />");
//   return ctx;
// }

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
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

  useEffect(() => {
    const syncFromStorage = () => {
      setToken(getToken());
      setUser(getUser());
    };

    window.addEventListener("storage", syncFromStorage);
    window.addEventListener("auth:expired", logout);

    return () => {
      window.removeEventListener("storage", syncFromStorage);
      window.removeEventListener("auth:expired", logout);
    };
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      authLoading,
      isAuthed: Boolean(token && user),
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
