import React from "react";
import { Link } from "react-router-dom";

const FALLBACK_AVATAR = "/placeholders/politician.jpg";
const FALLBACK_PARTY = "/placeholders/party.png";

export default function PoliticianCard({ p }) {
  const avatar = p?.photoUrl?.trim() ? p.photoUrl : FALLBACK_AVATAR;
  const partyLogo = p?.partyLogoUrl?.trim() ? p.partyLogoUrl : FALLBACK_PARTY;

  return (
    <Link
      to={`/politicians/${p.slug}`}
      className="group rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition overflow-hidden"
    >
      <div className="p-4 flex gap-4">
        <img
          src={avatar}
          alt={p.fullName}
          className="h-16 w-16 rounded-2xl object-cover border border-slate-200"
          onError={(e) => {
            e.currentTarget.src = FALLBACK_AVATAR;
          }}
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="font-semibold text-slate-900 truncate">
                {p.fullName}
              </div>
              <div className="text-sm text-slate-600 truncate">
                {p.position || "—"} • {p.district || "—"}
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <img
                src={partyLogo}
                alt={p.party || "Party"}
                className="h-10 w-10 object-contain"
                onError={(e) => {
                  e.currentTarget.src = FALLBACK_PARTY;
                }}
              />
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
              {p.party || "Independent"}
            </span>

            <span className="text-xs font-semibold text-slate-900 group-hover:translate-x-0.5 transition">
              View →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
