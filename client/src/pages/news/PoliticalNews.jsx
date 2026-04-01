import React, { useEffect, useMemo, useRef, useState } from "react";
import { fetchPoliticalNews } from "../../api/news-api";
import NewsCard from "../../components/news/NewsCard";
import NewsSkeleton from "../../components/news/NewsSkeleton";

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
      setError(e?.message || "Failed to load news");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ, limit]);

  return (
    <div style={{ maxWidth: 1150, margin: "0 auto", padding: 16 }}>
      <div style={{ marginBottom: 14 }}>
        <h2
          style={{ margin: 0, fontSize: 26, fontWeight: 900, color: "#0f172a" }}
        >
          Sri Lanka Political News
        </h2>
        <p style={{ margin: "6px 0 0", color: "#475569" }}>
          Latest political / governance news (RSS + og:image preview)
        </p>
      </div>

      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setLimit(12); // reset when searching
          }}
          placeholder="Search (parliament, election, minister...)"
          style={{
            flex: "1 1 320px",
            padding: "12px 14px",
            borderRadius: 12,
            border: "1px solid #cbd5e1",
            outline: "none",
          }}
        />

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => {
              setQ("");
              setLimit(12);
            }}
            style={{
              padding: "12px 14px",
              borderRadius: 12,
              border: "1px solid #cbd5e1",
              background: "white",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Clear
          </button>

          <button
            onClick={load}
            style={{
              padding: "12px 14px",
              borderRadius: 12,
              border: "1px solid #0f172a",
              background: "#0f172a",
              color: "white",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            Refresh
          </button>
        </div>
      </div>

      {error ? (
        <div
          style={{
            border: "1px solid #fecaca",
            background: "#fef2f2",
            padding: 14,
            borderRadius: 12,
          }}
        >
          <div style={{ fontWeight: 900, color: "#991b1b" }}>
            Couldn’t load news
          </div>
          <div style={{ marginTop: 6, color: "#b91c1c" }}>{error}</div>
          <button
            onClick={load}
            style={{
              marginTop: 10,
              padding: "10px 12px",
              borderRadius: 10,
              border: "none",
              background: "#b91c1c",
              color: "white",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      ) : null}

      {loading ? (
        <NewsSkeleton count={9} />
      ) : items.length ? (
        <div
          style={{
            display: "grid",
            gap: 16,
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          }}
        >
          {items.map((it) => (
            <NewsCard key={it.url} item={it} />
          ))}
        </div>
      ) : (
        <div
          style={{
            border: "1px solid #e5e7eb",
            padding: 16,
            borderRadius: 12,
            background: "white",
          }}
        >
          No news found. Try another search.
        </div>
      )}

      <div
        style={{
          marginTop: 18,
          display: "grid",
          gap: 8,
          justifyItems: "center",
        }}
      >
        {meta?.sources?.length ? (
          <div style={{ fontSize: 12, color: "#64748b", textAlign: "center" }}>
            Sources: {meta.sources.join(" • ")}
          </div>
        ) : null}

        <button
          disabled={!canLoadMore || loading}
          onClick={() => setLimit((x) => Math.min(x + 8, 30))}
          style={{
            padding: "12px 16px",
            borderRadius: 12,
            border: "none",
            fontWeight: 900,
            cursor: !canLoadMore || loading ? "not-allowed" : "pointer",
            background: !canLoadMore || loading ? "#e2e8f0" : "#0f172a",
            color: !canLoadMore || loading ? "#64748b" : "white",
          }}
        >
          {canLoadMore ? "Load more" : "Reached limit"}
        </button>
      </div>
    </div>
  );
}
