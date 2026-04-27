import React, { useEffect, useMemo, useRef, useState } from "react";
import { fetchPoliticalNews } from "../../api/news-api.js";
import NewsCard from "../../components/news/NewsCard.jsx";
import NewsSkeleton from "../../components/news/NewsSkeleton.jsx";

function useDebounce(value, delay = 450) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export default function PoliticalNews() {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("newest");
  const [limit, setLimit] = useState(12);

  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const debouncedQ = useDebounce(q, 450);
  const abortRef = useRef(null);

  const canLoadMore = limit < 30;

  async function load() {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError("");

    try {
      const data = await fetchPoliticalNews({
        q: debouncedQ,
        limit,
        signal: controller.signal,
      });

      setItems(Array.isArray(data.items) ? data.items : []);
      setMeta(data.meta || null);
    } catch (e) {
      if (e?.name === "AbortError") return;
      setError(e?.message || "Failed to load news.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ, limit]);

  const displayed = useMemo(() => {
    const sorted = [...items].sort((a, b) => {
      const ta = Date.parse(a.publishedAt) || 0;
      const tb = Date.parse(b.publishedAt) || 0;
      return sort === "oldest" ? ta - tb : tb - ta;
    });
    return sorted;
  }, [items, sort]);

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
              News
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Sri Lanka political & governance updates
            </p>
          </div>

          <button
            onClick={load}
            disabled={loading}
            className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60 sm:w-auto"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <div className="relative w-full">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              ⌕
            </span>
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setLimit(12);
              }}
              placeholder="Search: parliament, election, minister..."
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-10 text-sm text-slate-900 outline-none focus:border-slate-400"
            />
            {q ? (
              <button
                onClick={() => {
                  setQ("");
                  setLimit(12);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-sm font-semibold text-slate-500 hover:bg-slate-100"
                title="Clear"
              >
                ✕
              </button>
            ) : null}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none hover:bg-slate-50 sm:w-auto"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>

            <button
              onClick={() => setLimit((x) => Math.min(x + 8, 30))}
              disabled={!canLoadMore || loading}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {canLoadMore ? "Load more" : "Max loaded"}
            </button>
          </div>
        </div>

        {error ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4">
            <div className="font-bold text-red-800">Couldn’t load news</div>
            <div className="mt-1 text-sm text-red-700">{error}</div>
            <button
              onClick={load}
              className="mt-3 rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
            >
              Retry
            </button>
          </div>
        ) : null}

        <div className="mt-6">
          {loading ? (
            <NewsSkeleton count={9} />
          ) : displayed.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {displayed.map((it) => (
                <NewsCard key={it.url} item={it} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-700">
              No news found. Try another search.
            </div>
          )}
        </div>

        {meta?.sources?.length ? (
          <div className="mt-8 text-xs text-slate-500">
            Sources: {meta.sources.join(" • ")}
          </div>
        ) : null}
      </div>
    </div>
  );
}
