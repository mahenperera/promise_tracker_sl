// client/src/pages/admin/ManagePetitions.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  adminApprovePetition,
  adminListPetitions,
  adminRejectPetition,
} from "../../api/admin/petition-admin-api.js";

function fmtDate(d) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return "—";
  }
}

function StatusBadge({ status }) {
  const s = (status || "").toLowerCase();
  const cls =
    s === "approved"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : s === "rejected"
        ? "bg-rose-50 text-rose-700 border-rose-200"
        : "bg-slate-50 text-slate-700 border-slate-200";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${cls}`}
    >
      {s || "submitted"}
    </span>
  );
}

function Modal({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-3xl rounded-3xl bg-white shadow-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-3">
            <div className="text-lg font-extrabold text-slate-900">{title}</div>
            <button
              onClick={onClose}
              className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm font-semibold hover:bg-slate-50"
            >
              Close
            </button>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function ManagePetitions() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all"); // all | submitted | approved | rejected

  // View modal
  const [openView, setOpenView] = useState(false);
  const [selected, setSelected] = useState(null);

  // Reject modal
  const [openReject, setOpenReject] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return (items || [])
      .filter((p) => {
        if (status === "all") return true;
        return (p.status || "").toLowerCase() === status;
      })
      .filter((p) => {
        if (!q) return true;
        const hay = [
          p.title,
          p.subjectLine,
          p.addressedTo,
          p.body,
          p.evidenceSummary,
          p.petitionerEmail,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
  }, [items, search, status]);

  const onApprove = async (p) => {
    setError("");
    setBusyId(p._id);
    try {
      await adminApprovePetition(p._id);
      setItems((prev) =>
        prev.map((x) => (x._id === p._id ? { ...x, status: "approved" } : x)),
      );
      if (selected?._id === p._id)
        setSelected((s) => ({ ...s, status: "approved" }));
    } catch (e) {
      setError(e?.message || "Approve failed");
    } finally {
      setBusyId("");
    }
  };

  const openRejectModal = (p) => {
    setError("");
    setRejectReason("");
    setSelected(p);
    setOpenReject(true);
  };

  const confirmReject = async () => {
    const reason = rejectReason.trim();
    if (reason.length < 3) {
      setError("Please provide a short rejection reason (min 3 characters).");
      return;
    }

    setError("");
    setBusyId(selected?._id || "");
    try {
      await adminRejectPetition(selected._id, reason);
      setItems((prev) =>
        prev.map((x) =>
          x._id === selected._id
            ? { ...x, status: "rejected", rejectionReason: reason }
            : x,
        ),
      );
      setSelected((s) =>
        s ? { ...s, status: "rejected", rejectionReason: reason } : s,
      );
      setOpenReject(false);
    } catch (e) {
      setError(e?.message || "Reject failed");
    } finally {
      setBusyId("");
    }
  };

  const openViewModal = (p) => {
    setSelected(p);
    setOpenView(true);
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

      <div className="mt-6 flex flex-col md:flex-row md:items-center gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title / subject / addressedTo / body..."
          className="flex-1 h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-slate-200"
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
            setError("");
          }}
          className="h-11 px-4 rounded-2xl border border-slate-200 bg-white text-slate-900 text-sm font-semibold hover:bg-slate-50"
        >
          Clear
        </button>

        <button
          onClick={load}
          className="h-11 px-5 rounded-2xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800"
        >
          Refresh
        </button>
      </div>

      {error ? (
        <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="mt-8 text-slate-600">Loading petitions…</div>
      ) : (
        <div className="mt-6 rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr className="[&>th]:px-5 [&>th]:py-4 [&>th]:text-left [&>th]:font-semibold">
                  <th>Title</th>
                  <th>Addressed to</th>
                  <th>Status</th>
                  <th>Signatures</th>
                  <th>Created</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filtered.map((p) => (
                  <tr key={p._id} className="[&>td]:px-5 [&>td]:py-4 align-top">
                    <td className="font-semibold text-slate-900">
                      <div className="max-w-[340px]">
                        <div className="line-clamp-2">{p.title || "—"}</div>
                        <div className="mt-1 text-xs text-slate-500">
                          id: {p._id}
                        </div>
                      </div>
                    </td>
                    <td className="text-slate-700 max-w-[240px]">
                      <div className="line-clamp-2">{p.addressedTo || "—"}</div>
                    </td>
                    <td>
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="text-slate-800 font-semibold">
                      {typeof p.signCount === "number"
                        ? p.signCount
                        : Array.isArray(p.signedBy)
                          ? p.signedBy.length
                          : 0}
                    </td>
                    <td className="text-slate-700">{fmtDate(p.createdAt)}</td>
                    <td className="text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openViewModal(p)}
                          className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm font-semibold hover:bg-slate-50"
                        >
                          View
                        </button>

                        <button
                          onClick={() => onApprove(p)}
                          disabled={busyId === p._id}
                          className="h-10 px-4 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60"
                        >
                          Approve
                        </button>

                        <button
                          onClick={() => openRejectModal(p)}
                          disabled={busyId === p._id}
                          className="h-10 px-4 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 disabled:opacity-60"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-10 text-center text-slate-500"
                    >
                      No petitions found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-4 text-center text-sm text-slate-500 border-t border-slate-100">
            Showing {filtered.length} of {items.length}
          </div>
        </div>
      )}

      {/* VIEW MODAL (NO RAW JSON) */}
      <Modal
        open={openView}
        title={selected?.title ? selected.title : "Petition"}
        onClose={() => setOpenView(false)}
      >
        {selected ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={selected.status} />
              <span className="text-sm text-slate-600">
                Signatures:{" "}
                <span className="font-semibold text-slate-900">
                  {typeof selected.signCount === "number"
                    ? selected.signCount
                    : Array.isArray(selected.signedBy)
                      ? selected.signedBy.length
                      : 0}
                </span>
              </span>
              <span className="text-sm text-slate-600">
                Created:{" "}
                <span className="font-semibold text-slate-900">
                  {fmtDate(selected.createdAt)}
                </span>
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-800 whitespace-pre-wrap">
              {selected.body || "—"}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-xs font-semibold text-slate-500">
                  Addressed to
                </div>
                <div className="mt-1 font-semibold text-slate-900">
                  {selected.addressedTo || "—"}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-xs font-semibold text-slate-500">
                  Subject
                </div>
                <div className="mt-1 font-semibold text-slate-900">
                  {selected.subjectLine || "—"}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-xs font-semibold text-slate-500">
                  Deadline
                </div>
                <div className="mt-1 font-semibold text-slate-900">
                  {fmtDate(selected.deadline)}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-semibold text-slate-500">
                Evidence summary
              </div>
              <div className="mt-2 text-slate-900">
                {selected.evidenceSummary || "—"}
              </div>
            </div>

            {Array.isArray(selected.attachments) &&
            selected.attachments.length > 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="font-bold text-slate-900">Attachments</div>
                <div className="mt-3 grid grid-cols-1 gap-2">
                  {selected.attachments.map((a, idx) => (
                    <div
                      key={`${a}-${idx}`}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
                    >
                      {a}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {selected.status === "rejected" && selected.rejectionReason ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                <div className="text-xs font-semibold text-rose-700">
                  Rejection reason
                </div>
                <div className="mt-2 text-rose-900 whitespace-pre-wrap">
                  {selected.rejectionReason}
                </div>
              </div>
            ) : null}

            <div className="flex flex-wrap justify-end gap-2 pt-2">
              <button
                onClick={() => onApprove(selected)}
                disabled={busyId === selected._id}
                className="h-10 px-4 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60"
              >
                Approve
              </button>
              <button
                onClick={() => openRejectModal(selected)}
                disabled={busyId === selected._id}
                className="h-10 px-4 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 disabled:opacity-60"
              >
                Reject
              </button>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* REJECT MODAL (REASON REQUIRED) */}
      <Modal
        open={openReject}
        title={`Reject petition`}
        onClose={() => setOpenReject(false)}
      >
        <div className="space-y-3">
          <div className="text-sm text-slate-600">
            Provide a short reason. This is saved as{" "}
            <span className="font-semibold">rejectionReason</span>.
          </div>

          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
            placeholder="Example: Duplicate petition / missing evidence / unclear request…"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-200"
          />

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setOpenReject(false)}
              className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={confirmReject}
              disabled={busyId === (selected?._id || "")}
              className="h-10 px-4 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 disabled:opacity-60"
            >
              Reject
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
