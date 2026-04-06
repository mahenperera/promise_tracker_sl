import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/auth-context";

export default function RequireAuth() {
  const loc = useLocation();
  const { user, authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 text-slate-600">
        Checking access…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: loc }} replace />;
  }

  return <Outlet />;
}
