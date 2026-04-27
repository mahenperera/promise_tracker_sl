import React from "react";
import { NavLink, Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth-context";

function Tab({ to, label }) {
  return (
    <NavLink
      to={to}
      end={to === "/admin"}
      className={({ isActive }) =>
        `inline-flex h-10 shrink-0 items-center rounded-xl border px-4 text-sm font-semibold transition ${
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
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <div className="text-lg font-extrabold text-slate-900">
                  Admin Console
                </div>
                <div className="mt-1 break-all text-sm text-slate-600">
                  Logged in as: {user?.email} ({user?.role})
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
                <Link
                  to="/"
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                >
                  ← Back to site
                </Link>
                <button
                  onClick={handleLogout}
                  className="h-10 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Logout
                </button>
              </div>
            </div>

            <div className="-mx-4 overflow-x-auto px-4">
              <div className="flex min-w-max gap-2 pb-1">
                <Tab to="/admin" label="Overview" />
                <Tab to="/admin/politicians" label="Politicians" />
                <Tab to="/admin/parties" label="Parties" />
                <Tab to="/admin/promises" label="Promises" />
                <Tab to="/admin/petitions" label="Petitions" />
                <Tab to="/admin/tickets" label="Tickets" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        <Outlet />
      </div>
    </div>
  );
}
