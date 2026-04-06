import React from "react";
import { NavLink, Outlet, Link } from "react-router-dom";
import { useAuth } from "../../context/auth-context";

function Tab({ to, label }) {
  return (
    <NavLink
      to={to}
      end={to === "/admin"}
      className={({ isActive }) =>
        `h-10 px-4 rounded-xl text-sm font-semibold border transition ${
          isActive
            ? "bg-slate-900 text-white border-slate-900"
            : "bg-white text-slate-900 border-slate-200 hover:bg-slate-50"
        }`
      }
    >
      {label}
    </NavLink>
  );
}

export default function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-lg font-extrabold text-slate-900">
                Admin Console
              </div>
              <div className="text-sm text-slate-600">
                Logged in as: {user?.email} ({user?.role})
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/"
                className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm font-semibold hover:bg-slate-50"
              >
                ← Back to site
              </Link>
              <button
                onClick={logout}
                className="h-10 px-4 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800"
              >
                Logout
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Tab to="/admin" label="Overview" />
            <Tab to="/admin/politicians" label="Politicians" />
            <Tab to="/admin/parties" label="Parties" />
            <Tab to="/admin/promises" label="Promises" />
            <Tab to="/admin/petitions" label="Petitions" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </div>
    </div>
  );
}
