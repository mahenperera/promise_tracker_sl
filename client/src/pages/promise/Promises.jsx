import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchPromises } from "../../api/promises-api.js";
import { fetchPoliticians } from "../../api/politicians-api.js";
import { fetchParties } from "../../api/parties-api.js";
import PromiseCard from "../../components/cards/PromiseCard.jsx";

export default function Promises() {
  const [searchParams] = useSearchParams();
  const politicianId = searchParams.get("politicianId");

  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);

  const [politicians, setPoliticians] = useState([]);
  const [parties, setParties] = useState([]);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("");
  const [selectedPoliticianId, setSelectedPoliticianId] = useState("all");
  const [selectedPartyId, setSelectedPartyId] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 12;

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Load politicians and parties for filters
  useEffect(() => {
    const loadData = async () => {
      try {
        const [politiciansRes, partiesRes] = await Promise.all([
          fetchPoliticians({ limit: 1000 }),
          fetchParties({ limit: 1000 }),
        ]);
        setPoliticians(politiciansRes.items || []);
        setParties(partiesRes.items || []);
      } catch (e) {
        console.error("Failed to load filter data:", e);
      }
    };
    loadData();
  }, []);

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
      const res = await fetchPromises({
        search: debouncedSearch,
        status: statusFilter || undefined,
        page: nextPage,
        limit,
        politicianId:
          politicianId ||
          (selectedPoliticianId === "all" ? undefined : selectedPoliticianId),
        partyId: selectedPartyId === "all" ? undefined : selectedPartyId,
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
  }, [
    debouncedSearch,
    statusFilter,
    selectedPoliticianId,
    selectedPartyId,
    politicianId,
  ]);

  const onLoadMore = async () => {
    if (!canLoadMore || loadingMore) return;
    const next = page + 1;
    setPage(next);

    try {
      setLoadingMore(true);
      const res = await fetchPromises({
        search: debouncedSearch,
        status: statusFilter || undefined,
        page: next,
        limit,
        politicianId:
          politicianId ||
          (selectedPoliticianId === "all" ? undefined : selectedPoliticianId),
        partyId: selectedPartyId === "all" ? undefined : selectedPartyId,
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
        <h1 className="text-3xl font-extrabold text-slate-900">
          {politicianId ? "Politician's Promises" : "Promises"}
        </h1>
        <p className="text-slate-600">
          {politicianId
            ? "Track promises made by this politician and their fulfillment status."
            : "Track political promises and their fulfillment status."}
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="sm:col-span-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by promise title, description, or category…"
            className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-11 px-4 rounded-2xl border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-slate-200"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="fulfilled">Fulfilled</option>
          <option value="broken">Broken</option>
        </select>

        <select
          value={selectedPoliticianId}
          onChange={(e) => setSelectedPoliticianId(e.target.value)}
          disabled={!!politicianId} // Disable if filtering by URL politicianId
          className="h-11 px-4 rounded-2xl border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-slate-200 disabled:opacity-60"
        >
          <option value="all">All politicians</option>
          {politicians.map((politician) => (
            <option key={politician._id} value={politician._id}>
              {politician.fullName}
            </option>
          ))}
        </select>

        <select
          value={selectedPartyId}
          onChange={(e) => setSelectedPartyId(e.target.value)}
          className="h-11 px-4 rounded-2xl border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-slate-200"
        >
          <option value="all">All parties</option>
          {parties.map((party) => (
            <option key={party._id} value={party.code}>
              {party.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-3">
        <button
          onClick={() => {
            setSearch("");
            setStatusFilter("");
            setSelectedPoliticianId("all");
            setSelectedPartyId("all");
          }}
          className="h-11 px-4 rounded-2xl border border-slate-200 bg-white text-slate-900 text-sm font-semibold hover:bg-slate-50"
        >
          Clear filters
        </button>
      </div>

      {error ? (
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="mt-8 text-slate-600">Loading promises…</div>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((p) => (
              <PromiseCard key={p._id} p={p} />
            ))}
          </div>

          {items.length === 0 && !error ? (
            <div className="mt-8 text-slate-600">No promises found.</div>
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
