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
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="flex flex-col gap-4 p-4 sm:flex-row">
        <img
          src={avatar}
          alt={p.fullName}
          className="h-16 w-16 rounded-2xl border border-slate-200 object-cover"
          onError={(e) => {
            e.currentTarget.src = FALLBACK_AVATAR;
          }}
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="truncate font-semibold text-slate-900">
                {p.fullName}
              </div>
              <div className="truncate text-sm text-slate-600">
                {p.position || "—"} • {p.district || "—"}
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <img
                src={partyLogo}
                alt={p.party || "Party"}
                className="h-10 w-10 rounded-lg object-contain"
                onError={(e) => {
                  e.currentTarget.src = FALLBACK_PARTY;
                }}
              />
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="inline-flex w-fit items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
              {p.party || "Independent"}
            </span>

            <span className="text-xs font-semibold text-slate-900 transition group-hover:translate-x-0.5">
              View →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
