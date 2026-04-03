import React, { useEffect, useMemo, useState } from "react";
import PetitionCard from "../../components/cards/PetitionCard.jsx";
import { fetchPublicPetitions } from "../../api/petitions-api.js";

export default function Petitions() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [page, setPage] = useState(1);
  const limit = 10;

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
      const res = await fetchPublicPetitions({
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
      const res = await fetchPublicPetitions({
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
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-slate-900">Petitions</h1>
        <p className="text-slate-600">
          Browse verified public petitions and sign to support change.
        </p>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search petitions (title / subject / body)…"
            className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <button
          onClick={() => setSearch("")}
          className="h-11 px-4 rounded-2xl border border-slate-200 bg-white text-slate-900 text-sm font-semibold hover:bg-slate-50"
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
        <div className="mt-8 text-slate-600">Loading petitions…</div>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-1 gap-4">
            {items.map((p) => (
              <PetitionCard key={p._id} p={p} />
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
                className="h-11 px-5 rounded-2xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-60"
              >
                {loadingMore ? "Loading…" : "Load more"}
              </button>
            ) : meta ? (
              <div className="text-sm text-slate-500">
                Showing {items.length} of {meta.total}
              </div>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
