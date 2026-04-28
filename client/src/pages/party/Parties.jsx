import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchParties } from "../../api/parties-api.js";

const FALLBACK_LOGO = "/placeholders/party.png";

function PartyCard({ p }) {
  const logo = p?.logoUrl?.trim() ? p.logoUrl : FALLBACK_LOGO;

  return (
    <Link
      to={`/parties/${p.slug}`}
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="flex items-center gap-4 p-4">
        <img
          src={logo}
          alt={p.name || "Party"}
          className="h-14 w-14 rounded-2xl object-contain"
          onError={(e) => (e.currentTarget.src = FALLBACK_LOGO)}
        />

        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold text-slate-900">
            {p.code || p.name}
          </div>
          <div className="truncate text-sm text-slate-600">{p.name || "—"}</div>
        </div>

        <span className="shrink-0 text-xs font-semibold text-slate-900 transition group-hover:translate-x-0.5">
          View →
        </span>
      </div>
    </Link>
  );
}

export default function Parties() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [page, setPage] = useState(1);
  const limit = 12;

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const canLoadMore = useMemo(() => {
    if (!meta) return false;
    return meta.page < meta.totalPages;
  }, [meta]);

  const load = async ({ reset } = { reset: false }) => {
    try {
      setError("");
      if (reset) {
        setLoading(true);
        setPage(1);
      } else {
        setLoadingMore(true);
      }

      const nextPage = reset ? 1 : page;
      const res = await fetchParties({
        search: debouncedSearch,
        page: nextPage,
        limit,
      });

      setMeta(res.meta);
      if (reset) setItems(res.items);
      else setItems((prev) => [...prev, ...res.items]);
    } catch (e) {
      setError(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    load({ reset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const onLoadMore = async () => {
    if (!canLoadMore || loadingMore) return;
    const next = page + 1;
    setPage(next);

    try {
      setLoadingMore(true);
      const res = await fetchParties({
        search: debouncedSearch,
        page: next,
        limit,
      });
      setMeta(res.meta);
      setItems((prev) => [...prev, ...res.items]);
    } catch (e) {
      setError(e?.message || "Failed to load more");
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
          Parties
        </h1>
        <p className="text-slate-600">
          Browse political parties and their public profiles.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by party name / code…"
            className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <button
          onClick={() => setSearch("")}
          className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 hover:bg-slate-50 sm:w-auto"
        >
          Clear
        </button>
      </div>

      {error ? (
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="mt-8 text-slate-600">Loading parties…</div>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            {items.map((p) => (
              <PartyCard key={p._id} p={p} />
            ))}
          </div>

          {items.length === 0 && !error ? (
            <div className="mt-8 text-slate-600">No results found.</div>
          ) : null}

          <div className="mt-8 flex items-center justify-center">
            {canLoadMore ? (
              <button
                onClick={onLoadMore}
                disabled={loadingMore}
                className="h-11 rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {loadingMore ? "Loading…" : "Load more"}
              </button>
            ) : meta ? (
              <div className="text-center text-sm text-slate-500">
                Showing {items.length} of {meta.total}
              </div>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
