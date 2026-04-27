import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/auth-context";

export default function Footer() {
  const { user } = useAuth();

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex flex-col gap-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <div className="text-sm text-slate-500">
            © {new Date().getFullYear()} Promise Tracker SL
          </div>

          {user && (
            <div className="flex items-center justify-center gap-4 sm:justify-end">
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
