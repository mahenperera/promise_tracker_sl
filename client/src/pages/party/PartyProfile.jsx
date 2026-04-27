import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PartyPoliticianCard from "../../components/cards/PartyPoliticianCard.jsx";
import { fetchPartyBySlug } from "../../api/parties-api.js";

const FALLBACK_LOGO = "/placeholders/party.png";
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
      <div className="mx-auto max-w-6xl px-4 py-8 text-slate-600 sm:py-10">
        Loading party…
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
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
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
      <Link
        to="/parties"
        className="text-sm text-slate-600 hover:text-slate-900"
      >
        ← Back to parties
      </Link>

      <div className="mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="relative h-36 sm:h-44 md:h-52">
          <img
            src={banner}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            onError={(e) => (e.currentTarget.src = FALLBACK_BANNER)}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 via-slate-900/35 to-transparent" />
        </div>

        <div className="flex flex-col gap-5 p-4 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <img
                src={logo}
                alt={party.name || "Party"}
                className="h-16 w-16 rounded-2xl bg-white object-contain"
                onError={(e) => (e.currentTarget.src = FALLBACK_LOGO)}
              />

              <div className="min-w-0">
                <div className="text-xl font-extrabold text-slate-900 sm:text-2xl">
                  {party.code || party.slug?.toUpperCase() || "—"}
                </div>
                <div className="text-slate-600">{party.name || "—"}</div>
              </div>
            </div>

            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end">
              {party.websiteUrl?.trim() ? (
                <a
                  href={party.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                >
                  Website <span className="text-slate-500">↗</span>
                </a>
              ) : null}

              <span className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700">
                {count} {count === 1 ? "politician" : "politicians"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
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
                <div className="mt-3 text-sm text-slate-600">
                  No politicians.
                </div>
              ) : (
                <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-2">
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
    </div>
  );
}
