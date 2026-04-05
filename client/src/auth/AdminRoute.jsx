// client/src/auth/AdminRoute.jsx
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isAdmin } from "../utils/auth-storage.js";

export default function AdminRoute() {
  const loc = useLocation();

  if (!isAdmin()) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  }

  return <Outlet />;
}
