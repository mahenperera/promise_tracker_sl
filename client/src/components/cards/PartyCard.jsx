import React from "react";
import { Link } from "react-router-dom";

const FALLBACK_PARTY = "/placeholders/party.png";

export default function PartyCard({ party }) {
  const logo = party?.partyLogoUrl?.trim()
    ? party.partyLogoUrl
    : FALLBACK_PARTY;

  return (
    <Link
      to={`/parties/${party.slug}`}
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="flex items-center gap-4 p-4">
        <img
          src={logo}
          alt={party.name}
          className="h-12 w-12 rounded-lg object-contain"
          onError={(e) => (e.currentTarget.src = FALLBACK_PARTY)}
        />

        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold text-slate-900">
            {party.name}
          </div>
          <div className="text-sm text-slate-600">
            {party.count} politician(s)
          </div>
        </div>

        <span className="shrink-0 text-xs font-semibold text-slate-900 transition group-hover:translate-x-0.5">
          View →
        </span>
      </div>
    </Link>
  );
}
