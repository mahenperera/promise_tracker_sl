import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/auth-context";

export default function Footer() {
  const { user } = useAuth();

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-sm text-slate-500">
            © {new Date().getFullYear()} Promise Tracker SL
          </div>

          {user && (
            <div className="flex items-center gap-4">
              <Link
                to="/tickets"
                className="text-sm text-slate-600 hover:text-slate-900"
              >
                Support Tickets
              </Link>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
