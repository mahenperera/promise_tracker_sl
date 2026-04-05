import React, { useEffect, useMemo, useState } from "react";
import {
  adminApprovePetition,
  adminListPetitions,
  adminRejectPetition,
} from "../../api/admin/petition-admin-api.js";

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
    approved: {
      label: "approved",
      cls: "bg-emerald-50 text-emerald-800 border-emerald-200",
    },
    submitted: {
      label: "submitted",
      cls: "bg-amber-50 text-amber-800 border-amber-200",
    },
    rejected: {
      label: "rejected",
      cls: "bg-rose-50 text-rose-800 border-rose-200",
    },
    archived: {
      label: "archived",
      cls: "bg-slate-100 text-slate-700 border-slate-200",
    },
  };

  return (
    map[s] || {
      label: status || "—",
      cls: "bg-slate-100 text-slate-700 border-slate-200",
    }
  );
}

function canModerate(status) {
  return String(status || "").toLowerCase() === "submitted";
}

function isImageUrl(url = "") {
  const u = String(url || "").toLowerCase();

  return (
    u.includes("res.cloudinary.com") ||
    u.endsWith(".png") ||
    u.endsWith(".jpg") ||
    u.endsWith(".jpeg") ||
    u.endsWith(".webp") ||
    u.endsWith(".gif") ||
    u.endsWith(".bmp") ||
    u.endsWith(".svg")
  );
}

function resolveAttachmentUrl(v) {
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
  if (v.startsWith("/")) return v;

  const api = import.meta.env.VITE_API_BASE_URL;
  if (api && api.startsWith("http")) {
    const base = api.replace(/\/api\/?$/, "");
    return `${base}/uploads/${v}`;
  }

  return `/uploads/${v}`;
}

export default function ManagePetitions() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);

  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [status, setStatus] = useState("all");

  const [page, setPage] = useState(1);
  const limit = 12;

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [viewOpen, setViewOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectId, setRejectId] = useState("");
  const [rejectTitle, setRejectTitle] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState("");

  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

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

      const res = await adminListPetitions({
        search: debounced,
        status,
        page: nextPage,
        limit,
      });

      setMeta(res.meta || null);
      setItems((prev) =>
        reset ? res.items || [] : [...prev, ...(res.items || [])],
      );

      if (viewOpen && selected?._id) {
        const freshSelected =
          (res.items || []).find((item) => item._id === selected._id) || null;
        setSelected(freshSelected);
      }
    } catch (e) {
      setError(e?.message || "Failed to load petitions");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    load({ reset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced, status]);

  const onLoadMore = async () => {
    if (!canLoadMore || loadingMore) return;

    const next = page + 1;
    setPage(next);

    try {
      setLoadingMore(true);

      const res = await adminListPetitions({
        search: debounced,
        status,
        page: next,
        limit,
      });

      setMeta(res.meta || null);
      setItems((prev) => [...prev, ...(res.items || [])]);
    } catch (e) {
      setError(e?.message || "Failed to load more");
    } finally {
      setLoadingMore(false);
    }
  };

  const refresh = () => {
    setSuccessMessage("");
    load({ reset: true });
  };

  const openView = (p) => {
    setSelected(p);
    setViewOpen(true);
  };

  const closeView = () => {
    setViewOpen(false);
    setSelected(null);
  };

  const openReject = (p) => {
    setRejectId(p?._id || "");
    setRejectTitle(p?.title || "Reject petition");
    setRejectReason("");
    setRejectError("");
    setRejectOpen(true);
  };

  const closeReject = () => {
    if (busy) return;
    setRejectOpen(false);
    setRejectId("");
    setRejectTitle("");
    setRejectReason("");
    setRejectError("");
  };

  const approve = async (petition) => {
    const id = typeof petition === "string" ? petition : petition?._id;
    const item = typeof petition === "object" ? petition : null;

    if (!id) return;

    const currentStatus = item?.status || selected?.status;
    if (!canModerate(currentStatus)) return;

    setBusy(true);
    setError("");
    setSuccessMessage("");

    try {
      await adminApprovePetition(id);
      setSuccessMessage("Petition approved successfully.");
      closeReject();
      closeView();
      await load({ reset: true });
    } catch (e) {
      setError(e?.message || "Approve failed");
    } finally {
      setBusy(false);
    }
  };

  const doReject = async () => {
    if (!rejectId) return;

    const reason = rejectReason.trim();

    if (!reason) {
      setRejectError("Rejection reason is required.");
      return;
    }

    setBusy(true);
    setError("");
    setRejectError("");
    setSuccessMessage("");

    try {
      await adminRejectPetition(rejectId, {
        rejectionReason: reason,
      });

      setSuccessMessage("Petition rejected successfully.");
      closeReject();
      closeView();
      await load({ reset: true });
    } catch (e) {
      setRejectError(e?.message || "Reject failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-slate-900">
          Manage Petitions
        </h1>
        <p className="text-slate-600">
          Review submitted petitions. Approve to publish, or reject with a
          reason.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title / subject / addressedTo / body…"
          className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-slate-200 lg:flex-1"
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900"
        >
          <option value="all">All</option>
          <option value="submitted">Submitted</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <button
          onClick={() => {
            setSearch("");
            setStatus("all");
            setSuccessMessage("");
            setError("");
          }}
          className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 hover:bg-slate-50"
        >
          Clear
        </button>

        <button
          onClick={refresh}
          className="h-11 rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Refresh
        </button>
      </div>

      {successMessage ? (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
          {successMessage}
        </div>
      ) : null}

      {error ? (
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="mt-8 text-slate-600">Loading…</div>
      ) : (
        <>
          <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50">
                  <tr className="text-left text-slate-600">
                    <th className="px-4 py-3 font-semibold">Title</th>
                    <th className="px-4 py-3 font-semibold">Addressed to</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Signatures</th>
                    <th className="px-4 py-3 font-semibold">Created</th>
                    <th className="px-4 py-3 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((p) => {
                    const st = statusMeta(p.status);
                    const signatures =
                      typeof p.signCount === "number"
                        ? p.signCount
                        : typeof p.signatureCount === "number"
                          ? p.signatureCount
                          : 0;

                    return (
                      <tr key={p._id} className="border-t border-slate-200">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900">
                            {p.title || "—"}
                          </div>
                          <div className="max-w-[420px] truncate text-xs text-slate-500">
                            {p.subjectLine ? `Subject: ${p.subjectLine}` : "—"}
                          </div>
                          {String(p.status).toLowerCase() === "rejected" &&
                          p.rejectionReason ? (
                            <div className="mt-1 max-w-[420px] truncate text-xs text-rose-600">
                              Reason: {p.rejectionReason}
                            </div>
                          ) : null}
                        </td>

                        <td className="px-4 py-3">{p.addressedTo || "—"}</td>

                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${st.cls}`}
                          >
                            {st.label}
                          </span>
                        </td>

                        <td className="px-4 py-3">{signatures}</td>

                        <td className="px-4 py-3">{fmtDate(p.createdAt)}</td>

                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openView(p)}
                              className="h-9 rounded-xl border border-slate-200 bg-white px-3 font-semibold text-slate-900 hover:bg-slate-50"
                            >
                              View
                            </button>

                            {canModerate(p.status) ? (
                              <>
                                <button
                                  onClick={() => approve(p)}
                                  disabled={busy}
                                  className="h-9 rounded-xl bg-emerald-600 px-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => openReject(p)}
                                  disabled={busy}
                                  className="h-9 rounded-xl bg-rose-600 px-3 font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
                                >
                                  Reject
                                </button>
                              </>
                            ) : (
                              <span className="inline-flex h-9 items-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-600">
                                Reviewed
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {items.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-10 text-center text-slate-600"
                      >
                        No petitions found.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center">
            {canLoadMore ? (
              <button
                onClick={onLoadMore}
                disabled={loadingMore}
                className="h-11 rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
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

      {viewOpen && selected ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="flex max-h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-xl">
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 p-5">
              <div className="min-w-0">
                <div className="truncate text-lg font-extrabold text-slate-900">
                  {selected.title || "Petition"}
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${
                      statusMeta(selected.status).cls
                    }`}
                  >
                    {statusMeta(selected.status).label}
                  </span>

                  <span className="text-xs text-slate-500">
                    Created {fmtDate(selected.createdAt)}
                  </span>

                  {selected.deadline ? (
                    <span className="text-xs text-slate-500">
                      • Deadline {fmtDate(selected.deadline)}
                    </span>
                  ) : null}
                </div>
              </div>

              <button
                onClick={closeView}
                className="h-10 rounded-xl border border-slate-200 bg-white px-4 font-semibold text-slate-900 hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            <div className="overflow-y-auto p-5">
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-xs font-bold text-slate-700">Body</div>
                    <div className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-800">
                      {selected.body || "—"}
                    </div>
                  </div>

                  {selected.evidenceSummary ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="text-xs font-bold text-slate-700">
                        Evidence summary
                      </div>
                      <div className="mt-2 whitespace-pre-line text-sm text-slate-800">
                        {selected.evidenceSummary}
                      </div>
                    </div>
                  ) : null}

                  {String(selected.status).toLowerCase() === "rejected" &&
                  selected.rejectionReason ? (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                      <div className="text-xs font-bold text-rose-700">
                        Rejection reason
                      </div>
                      <div className="mt-2 whitespace-pre-line text-sm text-rose-900">
                        {selected.rejectionReason}
                      </div>
                    </div>
                  ) : null}

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="text-sm font-extrabold text-slate-900">
                      Attachments
                    </div>

                    {Array.isArray(selected.attachments) &&
                    selected.attachments.length ? (
                      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {selected.attachments.map((a, idx) => {
                          const url = resolveAttachmentUrl(a);
                          const img = isImageUrl(url);

                          return (
                            <a
                              key={`${a}-${idx}`}
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white hover:bg-slate-50"
                            >
                              {img ? (
                                <div className="aspect-video overflow-hidden bg-slate-100">
                                  <img
                                    src={url}
                                    alt={`attachment-${idx + 1}`}
                                    className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                                    onError={(e) => {
                                      e.currentTarget.style.display = "none";
                                    }}
                                  />
                                </div>
                              ) : (
                                <div className="p-4 text-sm text-slate-900">
                                  Open attachment {idx + 1} ↗
                                </div>
                              )}

                              <div className="p-3">
                                <div className="text-xs font-semibold text-slate-700">
                                  Attachment {idx + 1}
                                </div>
                                <div className="mt-1 truncate text-xs text-slate-500">
                                  {a}
                                </div>
                              </div>
                            </a>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="mt-2 text-sm text-slate-600">—</div>
                    )}

                    <div className="mt-2 text-xs text-slate-500">
                      If attachments are stored as filenames, make sure your
                      backend serves them under <b>/uploads</b>.
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="text-xs font-semibold text-slate-500">
                      Addressed to
                    </div>
                    <div className="mt-1 font-bold text-slate-900">
                      {selected.addressedTo || "—"}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="text-xs font-semibold text-slate-500">
                      Subject
                    </div>
                    <div className="mt-1 font-bold text-slate-900">
                      {selected.subjectLine || "—"}
                    </div>
                  </div>

                  {selected.petitionerEmail ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="text-xs font-semibold text-slate-500">
                        Petitioner email
                      </div>
                      <div className="mt-1 break-all font-bold text-slate-900">
                        {selected.petitionerEmail}
                      </div>
                    </div>
                  ) : null}

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="text-xs font-semibold text-slate-500">
                      Signatures
                    </div>
                    <div className="mt-1 text-2xl font-extrabold text-slate-900">
                      {typeof selected.signCount === "number"
                        ? selected.signCount
                        : typeof selected.signatureCount === "number"
                          ? selected.signatureCount
                          : 0}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="text-sm font-extrabold text-slate-900">
                      Admin actions
                    </div>

                    {canModerate(selected.status) ? (
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <button
                          onClick={() => approve(selected)}
                          disabled={busy}
                          className="h-10 rounded-xl bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => openReject(selected)}
                          disabled={busy}
                          className="h-10 rounded-xl bg-rose-600 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                        This petition has already been reviewed.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {rejectOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-xl">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 p-5">
              <div className="min-w-0">
                <div className="truncate text-lg font-extrabold text-slate-900">
                  Reject petition
                </div>
                <div className="mt-1 truncate text-sm text-slate-600">
                  {rejectTitle}
                </div>
              </div>

              <button
                onClick={closeReject}
                className="h-10 rounded-xl border border-slate-200 bg-white px-4 font-semibold text-slate-900 hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            <div className="p-5">
              <div className="text-xs font-semibold text-slate-500">
                Rejection reason <span className="text-rose-600">*</span>
              </div>

              <textarea
                value={rejectReason}
                onChange={(e) => {
                  setRejectReason(e.target.value);
                  if (rejectError) setRejectError("");
                }}
                rows={4}
                placeholder="Explain clearly why this petition is rejected…"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-200"
              />

              <div className="mt-2 flex items-center justify-between">
                <div className="text-xs text-rose-600">{rejectError || ""}</div>
                <div className="text-xs text-slate-400">
                  {rejectReason.length} characters
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  onClick={closeReject}
                  disabled={busy}
                  className="h-10 rounded-xl border border-slate-200 bg-white px-4 font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  onClick={doReject}
                  disabled={busy}
                  className="h-10 rounded-xl bg-rose-600 px-4 font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
                >
                  {busy ? "Rejecting…" : "Reject"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
