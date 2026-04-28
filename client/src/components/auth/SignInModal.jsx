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

  const [tab, setTab] = useState("signin");
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
      return;
    }

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setError("");
        onClose?.();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

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
        const res = await fetch(`${API_BASE}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: e1, password: p1, role: "citizen" }),
        });

        const data = await safeJson(res);
        if (!res.ok) {
          throw new Error(data?.error || data?.message || "Sign up failed");
        }
      }

      const user = await login(e1, p1);

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
      <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-4">
        <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-200 p-4 sm:p-5">
            <div className="text-base font-extrabold text-slate-900 sm:text-lg">
              {tab === "signin" ? "Sign in" : "Create account"}
            </div>
            <button
              onClick={close}
              className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 hover:bg-slate-50"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="overflow-y-auto p-4 sm:p-5">
            <div className="mb-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setTab("signin");
                }}
                className={`h-10 rounded-xl border px-4 text-sm font-semibold transition ${
                  tab === "signin"
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
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
                className={`h-10 rounded-xl border px-4 text-sm font-semibold transition ${
                  tab === "signup"
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
                }`}
              >
                Sign up
              </button>
            </div>

            {error ? (
              <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">
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
                  className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-slate-200"
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
                  className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>

              <button
                type="submit"
                disabled={busy || authLoading}
                className="h-11 w-full rounded-2xl bg-slate-900 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {tab === "signin" ? "Sign in" : "Create account"}
              </button>

              <div className="text-xs leading-relaxed text-slate-500">
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
