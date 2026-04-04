// // client/src/pages/auth/Login.jsx
// import React, { useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { loginRequest } from "../../api/auth-api.js";
// import { setAuth } from "../../utils/auth-storage.js";

// export default function Login() {
//   const nav = useNavigate();
//   const loc = useLocation();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const from = loc.state?.from || "/admin";

//   const onSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       setError("");
//       setLoading(true);

//       const data = await loginRequest({ email: email.trim(), password });
//       setAuth({ token: data.token, user: data.user });

//       nav(from, { replace: true });
//     } catch (err) {
//       setError(err?.message || "Login failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-[70vh] flex items-center justify-center px-4 py-10">
//       <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
//         <div className="p-6 border-b border-slate-200">
//           <div className="text-xl font-extrabold text-slate-900">Sign in</div>
//           <div className="mt-1 text-sm text-slate-600">
//             Use your account to access admin tools.
//           </div>
//         </div>

//         <form onSubmit={onSubmit} className="p-6 space-y-4">
//           {error ? (
//             <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-rose-900 text-sm">
//               {error}
//             </div>
//           ) : null}

//           <div>
//             <label className="text-xs font-semibold text-slate-600">
//               Email
//             </label>
//             <input
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-slate-200"
//               placeholder="admin@example.com"
//               autoComplete="email"
//             />
//           </div>

//           <div>
//             <label className="text-xs font-semibold text-slate-600">
//               Password
//             </label>
//             <input
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-slate-200"
//               placeholder="••••••••"
//               type="password"
//               autoComplete="current-password"
//             />
//           </div>

//           <button
//             disabled={loading}
//             className="h-11 w-full rounded-2xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-60"
//           >
//             {loading ? "Signing in…" : "Sign in"}
//           </button>

//           <div className="text-xs text-slate-500">
//             Tip: Admin endpoints require a token with <b>role: admin</b>.
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth-context";

export default function Login() {
  const nav = useNavigate();
  const loc = useLocation();
  const { login, authLoading, user } = useAuth();

  const from = loc.state?.from || (user?.role === "admin" ? "/admin" : "/");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    try {
      const u = await login(email.trim(), password);
      if (u?.role === "admin") nav(from || "/admin", { replace: true });
      else nav("/", { replace: true });
    } catch (e2) {
      setErr(e2?.message || "Login failed");
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="max-w-md mx-auto rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <div className="text-2xl font-extrabold text-slate-900">Sign in</div>
          <div className="mt-1 text-slate-600 text-sm">
            Use your email & password (JWT auth).
          </div>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          {err ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-rose-900 text-sm">
              {err}
            </div>
          ) : null}

          <div>
            <label className="text-xs font-semibold text-slate-600">
              Email
            </label>
            <input
              className="mt-1 w-full h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-slate-200"
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
              className="mt-1 w-full h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-slate-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={authLoading}
            className="w-full h-11 rounded-2xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-60"
          >
            {authLoading ? "Signing in…" : "Sign in"}
          </button>

          <div className="flex items-center justify-between text-sm">
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
