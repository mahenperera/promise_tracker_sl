// import React from "react";
// import { Navigate, Outlet } from "react-router-dom";
// import { useAuth } from "../context/auth-context";

// export default function RequireAdmin() {
//   const { isAuthed, user } = useAuth();

//   if (!isAuthed) return <Navigate to="/" replace />;
//   if (user?.role !== "admin") return <Navigate to="/" replace />;

//   return <Outlet />;
// }

import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/auth-context";

export default function RequireAdmin() {
  const loc = useLocation();
  const { user, authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 text-slate-600">
        Checking access…
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  }

  return <Outlet />;
}
