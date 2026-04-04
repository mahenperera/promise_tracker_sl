// import React from "react";

// export default function ManagePetitions() {
//   return (
//     <div>
//       <div className="text-2xl font-extrabold text-slate-900">
//         Manage Petitions
//       </div>
//       <div className="mt-1 text-slate-600">
//         Paste <b>server/src/routes/petition-routes.js</b> +{" "}
//         <b>server/src/controllers/petition-controller.js</b> and I’ll wire: list
//         (all statuses), approve/reject, delete, and signature counts.
//       </div>

//       <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 text-slate-700">
//         UI is ready to be built the same quality as your public petition pages —
//         we just need the exact backend fields/endpoints for moderation.
//       </div>
//     </div>
//   );
// }

// client/src/pages/admin/ManagePetitions.jsx
// import React, { useEffect, useMemo, useState } from "react";
// import {
//   adminApprovePetition,
//   adminFetchPetitions,
//   adminRejectPetition,
// } from "../../api/petitions-api.js";

// function fmtDate(d) {
//   try {
//     const dt = new Date(d);
//     if (Number.isNaN(dt.getTime())) return "—";
//     return dt.toLocaleDateString(undefined, {
//       year: "numeric",
//       month: "short",
//       day: "2-digit",
//     });
//   } catch {
//     return "—";
//   }
// }

// function getSigCount(p) {
//   return (
//     p?.signatureCount ??
//     p?.signCount ??
//     p?.signaturesCount ??
//     p?.signatures ??
//     0
//   );
// }

// function StatusBadge({ status }) {
//   const s = (status || "").toLowerCase();
//   const map = {
//     approved: "border-emerald-200 bg-emerald-50 text-emerald-900",
//     rejected: "border-rose-200 bg-rose-50 text-rose-900",
//     submitted: "border-amber-200 bg-amber-50 text-amber-900",
//     pending: "border-amber-200 bg-amber-50 text-amber-900",
//   };
//   const cls = map[s] || "border-slate-200 bg-slate-50 text-slate-700";
//   return (
//     <span
//       className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${cls}`}
//     >
//       {s || "—"}
//     </span>
//   );
// }

// function Modal({ open, title, children, onClose }) {
//   if (!open) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
//       <div className="absolute inset-0 bg-black/35" onClick={onClose} />
//       <div className="relative w-full max-w-2xl rounded-3xl border border-slate-200 bg-white shadow-lg overflow-hidden">
//         <div className="p-5 border-b border-slate-200 flex items-center justify-between gap-3">
//           <div className="font-extrabold text-slate-900 truncate">{title}</div>
//           <button
//             onClick={onClose}
//             className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold hover:bg-slate-50"
//           >
//             Close
//           </button>
//         </div>
//         <div className="p-5">{children}</div>
//       </div>
//     </div>
//   );
// }

// export default function ManagePetitions() {
//   const [items, setItems] = useState([]);
//   const [meta, setMeta] = useState(null);

//   const [status, setStatus] = useState("");
//   const [search, setSearch] = useState("");
//   const [debounced, setDebounced] = useState("");

//   const [page, setPage] = useState(1);
//   const limit = 10;

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   // preview + reject
//   const [previewOpen, setPreviewOpen] = useState(false);
//   const [preview, setPreview] = useState(null);

//   const [rejectOpen, setRejectOpen] = useState(false);
//   const [rejectId, setRejectId] = useState("");
//   const [rejectReason, setRejectReason] = useState("");

//   const [actionLoading, setActionLoading] = useState(false);

//   useEffect(() => {
//     const t = setTimeout(() => setDebounced(search.trim()), 350);
//     return () => clearTimeout(t);
//   }, [search]);

//   const canPrev = useMemo(() => (meta ? meta.page > 1 : false), [meta]);
//   const canNext = useMemo(
//     () => (meta ? meta.page < meta.totalPages : false),
//     [meta],
//   );

//   const load = async ({ resetPage } = { resetPage: false }) => {
//     try {
//       setError("");
//       setLoading(true);

//       const nextPage = resetPage ? 1 : page;

//       const res = await adminFetchPetitions({
//         search: debounced,
//         status,
//         page: nextPage,
//         limit,
//       });

//       setItems(res.items || []);
//       setMeta(res.meta || null);

//       if (resetPage) setPage(1);
//     } catch (e) {
//       setError(e?.message || "Failed to load petitions");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     load({ resetPage: true });
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [debounced, status]);

//   useEffect(() => {
//     load({ resetPage: false });
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [page]);

//   const openPreview = (p) => {
//     setPreview(p);
//     setPreviewOpen(true);
//   };

//   const applyUpdated = (updated) => {
//     if (!updated?._id) return;
//     setItems((prev) => prev.map((x) => (x._id === updated._id ? updated : x)));
//     if (preview?._id === updated._id) setPreview(updated);
//   };

//   const onApprove = async (id) => {
//     try {
//       setActionLoading(true);
//       const res = await adminApprovePetition(id);
//       applyUpdated(res.data || res);
//     } catch (e) {
//       alert(e?.message || "Approve failed");
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   const onRejectOpen = (id) => {
//     setRejectId(id);
//     setRejectReason("");
//     setRejectOpen(true);
//   };

//   const onRejectConfirm = async () => {
//     if (!rejectId) return;
//     if (!rejectReason.trim()) {
//       alert("Rejection reason is required.");
//       return;
//     }

//     try {
//       setActionLoading(true);
//       const res = await adminRejectPetition(rejectId, rejectReason.trim());
//       applyUpdated(res.data || res);
//       setRejectOpen(false);
//       setRejectId("");
//       setRejectReason("");
//     } catch (e) {
//       alert(e?.message || "Reject failed");
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   return (
//     <div className="mx-auto max-w-6xl px-4 py-10">
//       <div className="flex items-start justify-between gap-4">
//         <div>
//           <h1 className="text-3xl font-extrabold text-slate-900">
//             Manage petitions
//           </h1>
//           <p className="mt-1 text-slate-600">
//             Review submissions and approve/reject with clear reasons.
//           </p>
//         </div>

//         <a
//           href="/"
//           className="h-11 px-4 rounded-2xl border border-slate-200 bg-white text-slate-900 text-sm font-semibold hover:bg-slate-50"
//         >
//           View site ↗
//         </a>
//       </div>

//       {/* Controls */}
//       <div className="mt-6 grid gap-3 md:grid-cols-3">
//         <div className="md:col-span-2">
//           <input
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             placeholder="Search (title / addressedTo / body)…"
//             className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-slate-200"
//           />
//         </div>

//         <select
//           value={status}
//           onChange={(e) => setStatus(e.target.value)}
//           className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-slate-200"
//         >
//           <option value="">All statuses</option>
//           <option value="submitted">Submitted</option>
//           <option value="approved">Approved</option>
//           <option value="rejected">Rejected</option>
//         </select>
//       </div>

//       {error ? (
//         <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900">
//           {error}
//         </div>
//       ) : null}

//       {/* Table */}
//       <div className="mt-6 rounded-3xl border border-slate-200 bg-white overflow-hidden">
//         <div className="p-4 border-b border-slate-200 flex items-center justify-between">
//           <div className="text-sm font-semibold text-slate-900">
//             {meta ? `Showing ${items.length} of ${meta.total}` : "Petitions"}
//           </div>

//           <button
//             onClick={() => {
//               setSearch("");
//               setStatus("");
//             }}
//             className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold hover:bg-slate-50"
//           >
//             Clear filters
//           </button>
//         </div>

//         {loading ? (
//           <div className="p-4 text-slate-600">Loading petitions…</div>
//         ) : items.length === 0 ? (
//           <div className="p-4 text-slate-600">No petitions found.</div>
//         ) : (
//           <div className="divide-y divide-slate-200">
//             {items.map((p) => {
//               const title = p?.title || "—";
//               const addressedTo = p?.addressedTo || p?.to || "—";
//               const subject = p?.subject || "—";
//               const statusVal = p?.status || "—";
//               const sigCount = getSigCount(p);

//               return (
//                 <div key={p._id} className="p-4 flex gap-4">
//                   <div className="min-w-0 flex-1">
//                     <div className="flex items-start justify-between gap-3">
//                       <div className="min-w-0">
//                         <div className="font-extrabold text-slate-900 truncate">
//                           {title}
//                         </div>
//                         <div className="mt-1 text-sm text-slate-700">
//                           <span className="text-slate-500">Addressed to:</span>{" "}
//                           <b>{addressedTo}</b>
//                         </div>
//                         <div className="mt-0.5 text-sm text-slate-600">
//                           <span className="text-slate-500">Subject:</span>{" "}
//                           {subject}
//                         </div>
//                       </div>

//                       <div className="shrink-0 flex flex-col items-end gap-2">
//                         <StatusBadge status={statusVal} />
//                         <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
//                           {sigCount} signatures
//                         </span>
//                       </div>
//                     </div>

//                     <div className="mt-3 text-xs text-slate-500">
//                       Created: {fmtDate(p?.createdAt)}
//                     </div>

//                     <div className="mt-3 flex flex-wrap gap-2">
//                       <button
//                         onClick={() => openPreview(p)}
//                         className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold hover:bg-slate-50"
//                       >
//                         Preview
//                       </button>

//                       <a
//                         href={`/petitions/${p._id}`}
//                         className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold hover:bg-slate-50"
//                       >
//                         Open public ↗
//                       </a>

//                       <div className="flex-1" />

//                       <button
//                         disabled={
//                           actionLoading ||
//                           String(statusVal).toLowerCase() === "approved"
//                         }
//                         onClick={() => onApprove(p._id)}
//                         className="h-9 px-3 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-60"
//                       >
//                         Approve
//                       </button>

//                       <button
//                         disabled={
//                           actionLoading ||
//                           String(statusVal).toLowerCase() === "rejected"
//                         }
//                         onClick={() => onRejectOpen(p._id)}
//                         className="h-9 px-3 rounded-xl border border-rose-200 bg-rose-50 text-sm font-semibold text-rose-900 hover:bg-rose-100 disabled:opacity-60"
//                       >
//                         Reject
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}

//         {/* Pagination */}
//         {meta ? (
//           <div className="p-4 border-t border-slate-200 flex items-center justify-between">
//             <div className="text-sm text-slate-600">
//               Page <b>{meta.page}</b> of <b>{meta.totalPages}</b>
//             </div>

//             <div className="flex gap-2">
//               <button
//                 disabled={!canPrev}
//                 onClick={() => setPage((p) => Math.max(p - 1, 1))}
//                 className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold hover:bg-slate-50 disabled:opacity-60"
//               >
//                 Prev
//               </button>
//               <button
//                 disabled={!canNext}
//                 onClick={() => setPage((p) => p + 1)}
//                 className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold hover:bg-slate-50 disabled:opacity-60"
//               >
//                 Next
//               </button>
//             </div>
//           </div>
//         ) : null}
//       </div>

//       {/* Preview modal */}
//       <Modal
//         open={previewOpen}
//         title={preview?.title || "Petition preview"}
//         onClose={() => setPreviewOpen(false)}
//       >
//         {!preview ? null : (
//           <div className="space-y-4">
//             <div className="flex items-center justify-between gap-3">
//               <StatusBadge status={preview.status} />
//               <div className="text-sm font-semibold text-slate-900">
//                 {getSigCount(preview)} signatures
//               </div>
//             </div>

//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//               <div className="rounded-2xl border border-slate-200 p-3">
//                 <div className="text-xs font-semibold text-slate-500">
//                   Addressed to
//                 </div>
//                 <div className="mt-1 text-slate-900 font-semibold">
//                   {preview.addressedTo || "—"}
//                 </div>
//               </div>
//               <div className="rounded-2xl border border-slate-200 p-3">
//                 <div className="text-xs font-semibold text-slate-500">
//                   Created
//                 </div>
//                 <div className="mt-1 text-slate-900 font-semibold">
//                   {fmtDate(preview.createdAt)}
//                 </div>
//               </div>
//             </div>

//             <div className="rounded-2xl border border-slate-200 p-3">
//               <div className="text-xs font-semibold text-slate-500">
//                 Subject
//               </div>
//               <div className="mt-1 text-slate-900 font-semibold">
//                 {preview.subject || "—"}
//               </div>
//             </div>

//             <div className="rounded-2xl border border-slate-200 p-3">
//               <div className="text-xs font-semibold text-slate-500">Body</div>
//               <div className="mt-2 text-slate-800 whitespace-pre-wrap">
//                 {preview.body || preview.details || "—"}
//               </div>
//             </div>

//             <div className="flex flex-wrap gap-2 pt-1">
//               <button
//                 disabled={
//                   actionLoading ||
//                   String(preview.status).toLowerCase() === "approved"
//                 }
//                 onClick={() => onApprove(preview._id)}
//                 className="h-10 px-4 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-60"
//               >
//                 Approve
//               </button>

//               <button
//                 disabled={
//                   actionLoading ||
//                   String(preview.status).toLowerCase() === "rejected"
//                 }
//                 onClick={() => onRejectOpen(preview._id)}
//                 className="h-10 px-4 rounded-xl border border-rose-200 bg-rose-50 text-sm font-semibold text-rose-900 hover:bg-rose-100 disabled:opacity-60"
//               >
//                 Reject
//               </button>

//               <div className="flex-1" />

//               <a
//                 href={`/petitions/${preview._id}`}
//                 className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm font-semibold hover:bg-slate-50"
//               >
//                 Open public ↗
//               </a>
//             </div>
//           </div>
//         )}
//       </Modal>

//       {/* Reject modal */}
//       <Modal
//         open={rejectOpen}
//         title="Reject petition"
//         onClose={() => setRejectOpen(false)}
//       >
//         <div className="space-y-3">
//           <div className="text-sm text-slate-600">
//             Write a clear reason (this will be saved for audit/admin reference).
//           </div>

//           <textarea
//             value={rejectReason}
//             onChange={(e) => setRejectReason(e.target.value)}
//             rows={5}
//             className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-slate-200"
//             placeholder="Reason for rejection…"
//           />

//           <div className="flex gap-2 justify-end">
//             <button
//               onClick={() => setRejectOpen(false)}
//               className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-sm font-semibold hover:bg-slate-50"
//             >
//               Cancel
//             </button>
//             <button
//               disabled={actionLoading}
//               onClick={onRejectConfirm}
//               className="h-10 px-4 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-60"
//             >
//               Confirm reject
//             </button>
//           </div>
//         </div>
//       </Modal>
//     </div>
//   );
// }

import React, { useEffect, useMemo, useState } from "react";
import {
  adminApprovePetition,
  adminListPetitions,
  adminRejectPetition,
} from "../../api/admin/petition-admin-api.js";

function StatusChip({ status }) {
  const s = String(status || "").toLowerCase();
  const cls =
    s === "approved"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : s === "rejected"
        ? "border-rose-200 bg-rose-50 text-rose-800"
        : "border-slate-200 bg-slate-50 text-slate-700";

  const label = status || "pending";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${cls}`}
    >
      {label}
    </span>
  );
}

function prettyDate(v) {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export default function ManagePetitions() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (items || []).filter((p) => {
      const st = String(p?.status || "").toLowerCase();
      const matchStatus = status === "all" ? true : st === status;
      if (!matchStatus) return false;

      if (!q) return true;
      const hay = [
        p?.title,
        p?.subject,
        p?.addressedTo,
        p?.body,
        p?.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return hay.includes(q);
    });
  }, [items, search, status]);

  const load = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await adminListPetitions();
      setItems(res.items || []);
    } catch (e) {
      setError(e?.message || "Failed to load petitions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const doApprove = async (id) => {
    setBusyId(id);
    setError("");
    try {
      await adminApprovePetition(id);
      await load();
    } catch (e) {
      setError(e?.message || "Approve failed");
    } finally {
      setBusyId("");
    }
  };

  const doReject = async (id) => {
    setBusyId(id);
    setError("");
    try {
      await adminRejectPetition(id);
      await load();
    } catch (e) {
      setError(e?.message || "Reject failed");
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-slate-900">
          Manage Petitions
        </h1>
        <p className="text-slate-600">
          Review submitted petitions. Approve to publish, reject to block.
        </p>
      </div>

      <div className="mt-6 flex flex-col lg:flex-row lg:items-center gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title / subject / addressedTo / body…"
          className="w-full lg:flex-1 h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-slate-200"
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <button
          onClick={() => {
            setSearch("");
            setStatus("all");
          }}
          className="h-11 px-4 rounded-2xl border border-slate-200 bg-white text-slate-900 text-sm font-semibold hover:bg-slate-50"
        >
          Clear
        </button>

        <button
          onClick={load}
          className="h-11 px-4 rounded-2xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800"
        >
          Refresh
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
        <div className="mt-8 rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left text-slate-600">
                  <th className="px-4 py-3 font-semibold">Title</th>
                  <th className="px-4 py-3 font-semibold">Addressed to</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Signatures</th>
                  <th className="px-4 py-3 font-semibold">Created</th>
                  <th className="px-4 py-3 font-semibold text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const id = p?._id || p?.id;
                  const sig =
                    p?.signatureCount ??
                    p?.signaturesCount ??
                    p?.signatures ??
                    0;

                  return (
                    <tr key={id} className="border-t border-slate-200">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">
                          {p?.title || "—"}
                        </div>
                        <div className="text-slate-500 line-clamp-1">
                          {p?.subject ? `Subject: ${p.subject}` : ""}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {p?.addressedTo || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <StatusChip status={p?.status} />
                      </td>
                      <td className="px-4 py-3 text-slate-700">{sig}</td>
                      <td className="px-4 py-3 text-slate-700">
                        {prettyDate(p?.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setSelected(p)}
                            className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-900 font-semibold hover:bg-slate-50"
                          >
                            View
                          </button>

                          <button
                            onClick={() => doApprove(id)}
                            disabled={busyId === id}
                            className="h-9 px-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-60"
                          >
                            Approve
                          </button>

                          <button
                            onClick={() => doReject(id)}
                            disabled={busyId === id}
                            className="h-9 px-3 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-700 disabled:opacity-60"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filtered.length === 0 ? (
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
      )}

      {/* Simple details modal */}
      {selected ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-3xl rounded-3xl bg-white shadow-xl overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-extrabold text-slate-900">
                  {selected?.title || "Petition"}
                </div>
                <div className="mt-1">
                  <StatusChip status={selected?.status} />
                </div>
              </div>

              <button
                onClick={() => setSelected(null)}
                className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-slate-900 font-semibold hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 whitespace-pre-wrap">
                {selected?.body || selected?.description || "—"}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="text-xs font-semibold text-slate-500">
                    Addressed to
                  </div>
                  <div className="mt-1 font-semibold text-slate-900">
                    {selected?.addressedTo || "—"}
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="text-xs font-semibold text-slate-500">
                    Subject
                  </div>
                  <div className="mt-1 font-semibold text-slate-900">
                    {selected?.subject || "—"}
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="text-xs font-semibold text-slate-500">
                    Created
                  </div>
                  <div className="mt-1 font-semibold text-slate-900">
                    {prettyDate(selected?.createdAt)}
                  </div>
                </div>
              </div>

              <details className="rounded-2xl border border-slate-200 p-4">
                <summary className="cursor-pointer text-sm font-semibold text-slate-900">
                  Raw JSON
                </summary>
                <pre className="mt-3 text-xs overflow-auto bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  {JSON.stringify(selected, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
