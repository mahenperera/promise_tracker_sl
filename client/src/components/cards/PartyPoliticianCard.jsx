import React from "react";
import { Link } from "react-router-dom";

const FALLBACK_AVATAR = "/placeholders/politician.jpg";

export default function PartyPoliticianCard({ p }) {
  const avatar = p?.photoUrl?.trim() ? p.photoUrl : FALLBACK_AVATAR;

  return (
    <Link
      to={`/politicians/${p.slug}`}
      className="group rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm hover:shadow-md transition flex items-center justify-between gap-4"
    >
      <div className="flex items-center gap-4 min-w-0">
        <img
          src={avatar}
          alt={p?.fullName || "Politician"}
          className="h-12 w-12 rounded-2xl object-cover border border-slate-200"
          onError={(e) => {
            e.currentTarget.src = FALLBACK_AVATAR;
          }}
        />

        <div className="min-w-0">
          <div className="font-semibold text-slate-900 truncate">
            {p?.fullName || "—"}
          </div>
          <div className="text-sm text-slate-600 truncate">
            {p?.position || "—"} • {p?.district || "—"}
          </div>
        </div>
      </div>

      <div className="shrink-0 text-xs font-semibold text-slate-900 group-hover:translate-x-0.5 transition">
        View →
      </div>
    </Link>
  );
}
