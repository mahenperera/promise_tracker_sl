import React, { useState } from "react";
import { useAuth } from "../../context/auth-context";

export default function SignInModal({ open, onClose }) {
  const { login, register } = useAuth();

  const [mode, setMode] = useState("login"); // "login" | "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("citizen");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      setLoading(true);

      if (mode === "login") {
        await login({ email, password });
      } else {
        await register({ email, password, role });
      }

      onClose?.();
    } catch (err) {
      setError(err?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-3xl bg-white shadow-xl border border-slate-200 overflow-hidden">
          <div className="p-5 flex items-center justify-between border-b border-slate-200">
            <div className="font-extrabold text-slate-900">
              {mode === "login" ? "Sign in" : "Create account"}
            </div>
            <button
              onClick={onClose}
              className="h-9 w-9 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="p-5">
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setMode("login")}
                className={`h-10 px-4 rounded-xl text-sm font-semibold border ${
                  mode === "login"
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-900 border-slate-200 hover:bg-slate-50"
                }`}
              >
                Sign in
              </button>
              <button
                onClick={() => setMode("register")}
                className={`h-10 px-4 rounded-xl text-sm font-semibold border ${
                  mode === "register"
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-900 border-slate-200 hover:bg-slate-50"
                }`}
              >
                Sign up
              </button>
            </div>

            {error ? (
              <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-rose-900 text-sm">
                {error}
              </div>
            ) : null}

            <form onSubmit={submit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600">
                  Email
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full h-11 rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:ring-2 focus:ring-slate-200"
                  placeholder="you@example.com"
                  type="email"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600">
                  Password
                </label>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full h-11 rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:ring-2 focus:ring-slate-200"
                  placeholder="••••••••"
                  type="password"
                  required
                />
              </div>

              {mode === "register" ? (
                <div>
                  <label className="text-xs font-semibold text-slate-600">
                    Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="mt-1 w-full h-11 rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:ring-2 focus:ring-slate-200 bg-white"
                  >
                    <option value="citizen">Citizen</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              ) : null}

              <button
                disabled={loading}
                className="w-full h-11 rounded-2xl bg-slate-900 text-white font-semibold hover:bg-slate-800 disabled:opacity-60"
              >
                {loading
                  ? "Please wait…"
                  : mode === "login"
                    ? "Sign in"
                    : "Create account"}
              </button>

              <div className="text-xs text-slate-500">
                Admin pages require an <b>admin</b> token.
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
