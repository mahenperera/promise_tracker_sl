import React from "react";
import { Link } from "react-router-dom";

const FALLBACK_AVATAR = "/placeholders/politician.jpg";

export default function PartyPoliticianCard({ p }) {
  const avatar = p?.photoUrl?.trim() ? p.photoUrl : FALLBACK_AVATAR;

  return (
    <Link
      to={`/politicians/${p.slug}`}
      className="group flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:shadow-md sm:flex-row sm:items-center sm:justify-between sm:gap-4"
    >
      <div className="flex min-w-0 items-center gap-4">
        <img
          src={avatar}
          alt={p?.fullName || "Politician"}
          className="h-12 w-12 rounded-2xl border border-slate-200 object-cover"
          onError={(e) => {
            e.currentTarget.src = FALLBACK_AVATAR;
          }}
        />

        <div className="min-w-0">
          <div className="truncate font-semibold text-slate-900">
            {p?.fullName || "—"}
          </div>
          <div className="truncate text-sm text-slate-600">
            {p?.position || "—"} • {p?.district || "—"}
          </div>
        </div>
      </div>

      <div className="shrink-0 text-xs font-semibold text-slate-900 transition group-hover:translate-x-0.5">
        View →
      </div>
    </Link>
  );
}
