import React, { useEffect, useMemo, useState } from "react";
import {
  adminListPromises,
  adminUpdatePromiseStatus,
  adminDeletePromise,
} from "../../api/admin/promises-admin-api.js";
import { createPromise, updatePromise } from "../../api/promises-api.js";
import { fetchPoliticians } from "../../api/politicians-api.js";
import { fetchParties } from "../../api/parties-api.js";

const emptyForm = {
  politicianId: "",
  title: "",
  slug: "",
  description: "",
  category: "",
  status: "pending",
  promiseDate: "",
  isActive: true,
};

function slugify(text = "") {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function fmtDate(d) {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(dt);
}

function statusMeta(status) {
  const s = String(status || "").toLowerCase();

  const map = {
    pending: {
      label: "Pending",
      cls: "bg-amber-50 text-amber-800 border-amber-200",
    },
    in_progress: {
      label: "In Progress",
      cls: "bg-blue-50 text-blue-800 border-blue-200",
    },
    fulfilled: {
      label: "Fulfilled",
      cls: "bg-emerald-50 text-emerald-800 border-emerald-200",
    },
    broken: {
      label: "Broken",
      cls: "bg-rose-50 text-rose-800 border-rose-200",
    },
  };

  return (
    map[s] || {
      label: status || "—",
      cls: "bg-slate-100 text-slate-700 border-slate-200",
    }
  );
}

export default function ManagePromises() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);

  const [politicians, setPoliticians] = useState([]);
  const [parties, setParties] = useState([]);

  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [status, setStatus] = useState("all");
  const [politicianId, setPoliticianId] = useState("all");
  const [partyId, setPartyId] = useState("all");

  const [page, setPage] = useState(1);
  const limit = 12;

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("create"); // create | edit
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Load politicians and parties for filters and form dropdown
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
        console.error("Failed to load data:", e);
      }
    };
    loadData();
  }, []);

  const canLoadMore = useMemo(() => {
    if (!meta) return false;
    return meta.page < meta.totalPages;
  }, [meta]);

  const load = async ({ reset } = { reset: false }) => {
    setError("");

    try {
      if (reset) {
        setLoading(true);
        setPage(1);
      } else {
        setLoadingMore(true);
      }

      const nextPage = reset ? 1 : page;

      const res = await adminListPromises({
        search: debounced,
        status: status === "all" ? undefined : status,
        politicianId: politicianId === "all" ? undefined : politicianId,
        partyId: partyId === "all" ? undefined : partyId,
        page: nextPage,
        limit,
      });

      setMeta(res.meta || null);
      setItems((prev) =>
        reset ? res.items || [] : [...prev, ...(res.items || [])],
      );
    } catch (e) {
      setError(e?.message || "Failed to load promises");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    load({ reset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced, status, politicianId, partyId]);

  const onLoadMore = async () => {
    if (!canLoadMore || loadingMore) return;
    const next = page + 1;
    setPage(next);
    await load();
  };

  const updateStatus = async (id, newStatus) => {
    if (busy) return;

    try {
      setBusy(true);
      setError("");
      setSuccessMessage("");

      await adminUpdatePromiseStatus(id, newStatus);

      setSuccessMessage("Promise status updated successfully");

      // Update local state
      setItems((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, status: newStatus } : item,
        ),
      );

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (e) {
      setError(e?.message || "Failed to update status");
    } finally {
      setBusy(false);
    }
  };

  const deletePromise = async (id) => {
    if (busy || !confirm("Are you sure you want to delete this promise?"))
      return;

    try {
      setBusy(true);
      setError("");
      setSuccessMessage("");

      await adminDeletePromise(id);

      setSuccessMessage("Promise deleted successfully");

      // Remove from local state
      setItems((prev) => prev.filter((item) => item._id !== id));

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (e) {
      setError(e?.message || "Failed to delete promise");
    } finally {
      setBusy(false);
    }
  };

  const openCreate = () => {
    setMode("create");
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (promise) => {
    setMode("edit");
    setForm({
      ...emptyForm,
      ...promise,
      politicianId: promise.politicianId?._id || promise.politicianId || "",
      promiseDate: promise.promiseDate
        ? new Date(promise.promiseDate).toISOString().split("T")[0]
        : "",
      isActive:
        typeof promise?.isActive === "boolean" ? promise.isActive : true,
    });
    setOpen(true);
  };

  const save = async () => {
    setBusy(true);
    setError("");
    try {
      const payload = {
        politicianId: form.politicianId,
        title: form.title,
        slug: form.slug || slugify(form.title),
        description: form.description,
        category: form.category,
        status: form.status,
        promiseDate: form.promiseDate ? new Date(form.promiseDate) : null,
        isActive: Boolean(form.isActive),
      };

      if (mode === "create") {
        await createPromise(payload);
      } else {
        await updatePromise(form._id, payload);
      }

      setOpen(false);
      await load({ reset: true });
      setSuccessMessage(
        `${mode === "create" ? "Created" : "Updated"} promise successfully`,
      );
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (e) {
      setError(e?.message || "Save failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Manage Promises</h1>
        <button
          onClick={openCreate}
          className="h-11 px-4 rounded-2xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800"
        >
          + Add Promise
        </button>
      </div>

      {successMessage && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-900">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="sm:col-span-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search promises..."
            className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-slate-200"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="fulfilled">Fulfilled</option>
          <option value="broken">Broken</option>
        </select>

        <select
          value={politicianId}
          onChange={(e) => setPoliticianId(e.target.value)}
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-slate-200"
        >
          <option value="all">All Politicians</option>
          {politicians.map((politician) => (
            <option key={politician._id} value={politician._id}>
              {politician.fullName}
            </option>
          ))}
        </select>

        <select
          value={partyId}
          onChange={(e) => setPartyId(e.target.value)}
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-slate-200"
        >
          <option value="all">All Parties</option>
          {parties.map((party) => (
            <option key={party._id} value={party.code}>
              {party.name}
            </option>
          ))}
        </select>
      </div>

      {/* Clear Filters */}
      <div className="mb-6">
        <button
          onClick={() => {
            setSearch("");
            setStatus("all");
            setPoliticianId("all");
            setPartyId("all");
          }}
          className="h-10 px-4 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm font-semibold hover:bg-slate-50"
        >
          Clear Filters
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-8 text-slate-600">
          Loading promises...
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-8 text-slate-600">
          No promises found.
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {items.map((item) => {
              const politician = item.politicianId;
              const statusInfo = statusMeta(item.status);

              return (
                <div
                  key={item._id}
                  className="rounded-lg border border-slate-200 bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-slate-900 mb-1">
                        {item.title}
                      </div>
                      <div className="text-sm text-slate-600 mb-2">
                        By {politician?.fullName || "Unknown"} •{" "}
                        {item.category || "No category"}
                      </div>
                      <div className="text-sm text-slate-500">
                        Created: {fmtDate(item.createdAt)}
                        {item.promiseDate && (
                          <> • Promised: {fmtDate(item.promiseDate)}</>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusInfo.cls}`}
                      >
                        {statusInfo.label}
                      </span>

                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(item)}
                          disabled={busy}
                          className="rounded border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                        >
                          Edit
                        </button>

                        <select
                          value={item.status}
                          onChange={(e) =>
                            updateStatus(item._id, e.target.value)
                          }
                          disabled={busy}
                          className="rounded border border-slate-200 bg-white px-2 py-1 text-xs outline-none"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="fulfilled">Fulfilled</option>
                          <option value="broken">Broken</option>
                        </select>

                        <button
                          onClick={() => deletePromise(item._id)}
                          disabled={busy}
                          className="rounded border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-60"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {canLoadMore && (
            <div className="mt-6 text-center">
              <button
                onClick={onLoadMore}
                disabled={loadingMore}
                className="h-10 px-4 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-60"
              >
                {loadingMore ? "Loading…" : "Load more"}
              </button>
            </div>
          )}

          {meta && (
            <div className="mt-4 text-center text-sm text-slate-500">
              Showing {items.length} of {meta.total}
            </div>
          )}
        </>
      )}

      {/* Modal Form */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-4xl rounded-3xl bg-white shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div className="text-lg font-extrabold text-slate-900">
                {mode === "create" ? "Add Promise" : "Edit Promise"}
              </div>
              <button
                onClick={() => setOpen(false)}
                className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-slate-900 font-semibold hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Politician Selection */}
              <div className="md:col-span-2">
                <div className="text-xs font-semibold text-slate-500">
                  Politician *
                </div>
                <select
                  value={form.politicianId}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      politicianId: e.target.value,
                    }))
                  }
                  className="mt-2 w-full h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-slate-200"
                >
                  <option value="">Select a politician...</option>
                  {politicians.map((politician) => (
                    <option key={politician._id} value={politician._id}>
                      {politician.fullName} (
                      {politician.position || "Politician"})
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div className="md:col-span-2">
                <div className="text-xs font-semibold text-slate-500">
                  Title *
                </div>
                <input
                  value={form.title}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="mt-2 w-full h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>

              {/* Slug */}
              <div>
                <div className="text-xs font-semibold text-slate-500">
                  Slug (optional - auto-generated from title)
                </div>
                <input
                  value={form.slug}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, slug: e.target.value }))
                  }
                  className="mt-2 w-full h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>

              {/* Category */}
              <div>
                <div className="text-xs font-semibold text-slate-500">
                  Category
                </div>
                <input
                  value={form.category}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, category: e.target.value }))
                  }
                  placeholder="e.g., Education, Healthcare"
                  className="mt-2 w-full h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>

              {/* Status */}
              <div>
                <div className="text-xs font-semibold text-slate-500">
                  Status
                </div>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, status: e.target.value }))
                  }
                  className="mt-2 w-full h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-slate-200"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="fulfilled">Fulfilled</option>
                  <option value="broken">Broken</option>
                </select>
              </div>

              {/* Promise Date */}
              <div>
                <div className="text-xs font-semibold text-slate-500">
                  Promise Date
                </div>
                <input
                  type="date"
                  value={form.promiseDate}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      promiseDate: e.target.value,
                    }))
                  }
                  className="mt-2 w-full h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <div className="text-xs font-semibold text-slate-500">
                  Description
                </div>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={4}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>

              {/* Active checkbox and Save button */}
              <div className="md:col-span-2 flex items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <input
                    type="checkbox"
                    checked={Boolean(form.isActive)}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        isActive: e.target.checked,
                      }))
                    }
                  />
                  Active
                </label>

                <button
                  onClick={save}
                  disabled={busy || !form.politicianId || !form.title}
                  className="h-11 px-5 rounded-2xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-60"
                >
                  {busy ? "Saving…" : "Save Promise"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
