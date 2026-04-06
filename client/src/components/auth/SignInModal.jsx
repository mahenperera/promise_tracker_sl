import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/auth-context";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

async function safeJson(res) {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  const text = await res.text();
  return { message: text };
}

export default function SignInModal({ open, onClose }) {
  const { login, authLoading } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  const from = useMemo(() => loc.state?.from || "/", [loc.state]);

  const [tab, setTab] = useState("signin"); // "signin" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setError("");
      setBusy(false);
      setTab("signin");
      setEmail("");
      setPassword("");
    }
  }, [open]);

  if (!open) return null;

  const close = () => {
    setError("");
    onClose?.();
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const e1 = email.trim();
    const p1 = password;

    if (!e1 || !p1) {
      setError("Missing fields");
      return;
    }

    try {
      setBusy(true);

      if (tab === "signup") {
        // ✅ Always create CITIZEN accounts from UI
        const res = await fetch(`${API_BASE}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: e1, password: p1, role: "citizen" }),
        });

        const data = await safeJson(res);
        if (!res.ok)
          throw new Error(data?.error || data?.message || "Sign up failed");
      }

      const user = await login(e1, p1);

      // If admin, go admin. Otherwise go back where user tried to go (or home).
      close();
      if (user?.role === "admin") nav("/admin");
      else nav(from);
    } catch (err) {
      setError(err?.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-slate-900/40" onClick={close} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-3xl bg-white shadow-xl border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div className="text-lg font-extrabold text-slate-900">
              {tab === "signin" ? "Sign in" : "Create account"}
            </div>
            <button
              onClick={close}
              className="h-10 w-10 rounded-xl border border-slate-200 hover:bg-slate-50 grid place-items-center"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="p-5">
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setTab("signin");
                }}
                className={`h-10 px-4 rounded-xl text-sm font-semibold border transition ${
                  tab === "signin"
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-900 border-slate-200 hover:bg-slate-50"
                }`}
              >
                Sign in
              </button>

              <button
                type="button"
                onClick={() => {
                  setError("");
                  setTab("signup");
                }}
                className={`h-10 px-4 rounded-xl text-sm font-semibold border transition ${
                  tab === "signup"
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

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Email
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="mt-2 w-full h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Password
                </label>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  autoComplete={
                    tab === "signin" ? "current-password" : "new-password"
                  }
                  placeholder="••••••••"
                  className="mt-2 w-full h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>

              <button
                type="submit"
                disabled={busy || authLoading}
                className="w-full h-11 rounded-2xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-60"
              >
                {tab === "signin" ? "Sign in" : "Create account"}
              </button>

              <div className="text-xs text-slate-500">
                {tab === "signup"
                  ? "New accounts are created as citizens. Admin accounts are added manually."
                  : "Admin pages require an admin account."}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
