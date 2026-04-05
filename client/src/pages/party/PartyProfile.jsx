import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PartyPoliticianCard from "../../components/cards/PartyPoliticianCard.jsx";
import { fetchPartyBySlug } from "../../api/parties-api.js";

const FALLBACK_LOGO = "/placeholders/party.png";
// const FALLBACK_BANNER = "/placeholders/banner.png";
const FALLBACK_BANNER = "/public/party-banner.png";

export default function PartyProfile() {
  const { slug } = useParams();

  const [party, setParty] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        setError("");
        setLoading(true);

        const res = await fetchPartyBySlug(slug);

        const partyObj = res?.data?.party || null;
        const politicians = res?.data?.politicians || [];

        setParty(partyObj);
        setItems(politicians);
      } catch (e) {
        setError(e?.message || "Failed to load party");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 text-slate-600">
        Loading party…
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900">
          {error}
        </div>
      </div>
    );
  }

  if (!party) return null;

  const logo = party?.logoUrl?.trim() ? party.logoUrl : FALLBACK_LOGO;
  const banner = party?.bannerUrl?.trim() ? party.bannerUrl : FALLBACK_BANNER;
  const count = items.length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link
        to="/parties"
        className="text-sm text-slate-600 hover:text-slate-900"
      >
        ← Back to parties
      </Link>

      <div className="mt-4 rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        {/* Banner */}
        <div className="relative h-40 sm:h-52">
          <img
            src={banner}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            onError={(e) => (e.currentTarget.src = FALLBACK_BANNER)}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 via-slate-900/35 to-transparent" />
        </div>

        {/* Header */}
        <div className="p-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
          <div className="flex items-start gap-4">
            <img
              src={logo}
              alt={party.name || "Party"}
              className="h-16 w-16 rounded-2xl object-contain bg-white"
              onError={(e) => (e.currentTarget.src = FALLBACK_LOGO)}
            />

            <div className="min-w-0">
              <div className="text-2xl font-extrabold text-slate-900">
                {party.code || party.slug?.toUpperCase() || "—"}
              </div>
              <div className="text-slate-600">{party.name || "—"}</div>
            </div>
          </div>

          {/* Actions (right side) */}
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            {party.websiteUrl?.trim() ? (
              <a
                href={party.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm font-semibold hover:bg-slate-50 inline-flex items-center gap-2"
              >
                Website <span className="text-slate-500">↗</span>
              </a>
            ) : null}

            <span className="h-10 px-4 inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm font-semibold">
              {items.length} {items.length === 1 ? "politician" : "politicians"}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="px-6 pb-6 grid grid-cols-1 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="text-xs font-semibold text-slate-500">
              Description
            </div>
            <div className="mt-2 text-slate-800">
              {party.description?.trim() ? party.description : "—"}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="font-bold text-slate-900">Politicians</div>

            {items.length === 0 ? (
              <div className="mt-3 text-slate-600 text-sm">No politicians.</div>
            ) : (
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((p) => (
                  <PartyPoliticianCard key={p._id} p={p} />
                ))}
              </div>
            )}

            <div className="mt-4 text-sm text-slate-500">
              Showing {items.length} of {items.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
