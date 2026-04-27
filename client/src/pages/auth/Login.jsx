import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth-context";

export default function Login() {
  const nav = useNavigate();
  const loc = useLocation();
  const { login, authLoading } = useAuth();

  const from = loc.state?.from || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    try {
      const u = await login(email.trim(), password);
      if (u?.role === "admin") {
        nav("/admin", { replace: true });
      } else {
        const safeFrom = from.startsWith("/admin") ? "/" : from;
        nav(safeFrom, { replace: true });
      }
    } catch (e2) {
      setErr(e2?.message || "Login failed");
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
      <div className="mx-auto w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5 sm:p-6">
          <div className="text-2xl font-extrabold text-slate-900">Sign in</div>
          <div className="mt-1 text-sm text-slate-600">
            Use your email & password (JWT auth).
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 p-5 sm:p-6">
          {err ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">
              {err}
            </div>
          ) : null}

          <div>
            <label className="text-xs font-semibold text-slate-600">
              Email
            </label>
            <input
              className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-slate-200"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600">
              Password
            </label>
            <input
              type="password"
              className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-slate-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={authLoading}
            className="h-11 w-full rounded-2xl bg-slate-900 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {authLoading ? "Signing in…" : "Sign in"}
          </button>

          <div className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
            <Link to="/" className="text-slate-600 hover:text-slate-900">
              ← Back to site
            </Link>
            <Link to="/admin" className="text-slate-600 hover:text-slate-900">
              Go Admin →
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
