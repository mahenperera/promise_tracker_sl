import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchTickets, replyToTicket } from "../../api/ticket-api.js";
import {
  updateTicket,
  assignTicket,
  deleteTicket,
  getAdmins,
} from "../../api/admin/ticket-admin-api.js";
import { fetchPoliticians } from "../../api/politicians-api.js";

// const emptyForm = {
//   subject: "",
//   message: "",
//   politicianId: "",
//   priority: "medium",
// };

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

function statusBadge(status) {
  const s = String(status || "").toLowerCase();
  const map = {
    open: "bg-blue-50 text-blue-800 border-blue-200",
    in_progress: "bg-amber-50 text-amber-800 border-amber-200",
    resolved: "bg-emerald-50 text-emerald-800 border-emerald-200",
    closed: "bg-slate-50 text-slate-700 border-slate-200",
  };
  return map[s] || "bg-slate-100 text-slate-700 border-slate-200";
}

function priorityBadge(priority) {
  const p = String(priority || "").toLowerCase();
  const map = {
    low: "bg-slate-50 text-slate-700 border-slate-200",
    medium: "bg-amber-50 text-amber-800 border-amber-200",
    high: "bg-rose-50 text-rose-800 border-rose-200",
  };
  return map[p] || "bg-slate-100 text-slate-700 border-slate-200";
}

export default function ManageTickets() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);

  const [politicians, setPoliticians] = useState([]);

  const [admins, setAdmins] = useState([]);

  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");

  const [status, setStatus] = useState("all");
  const [assigned, setAssigned] = useState("all");
  const [page, setPage] = useState(1);
  //   const limit = 20;

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  //   const [showForm, setShowForm] = useState(false);
  //   const [editing, setEditing] = useState(null);
  //   const [form, setForm] = useState(emptyForm);
  //   const [saving, setSaving] = useState(false);

  const selectedTicketId = searchParams.get("ticket");
  const selectedTicket = items.find(
    (ticket) => ticket._id === selectedTicketId,
  );

  const [replyMessage, setReplyMessage] = useState("");
  const [replying, setReplying] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Load politicians and admins for form dropdowns
  useEffect(() => {
    const loadData = async () => {
      try {
        const [politiciansRes, adminsRes] = await Promise.all([
          fetchPoliticians({ limit: 1000 }),
          getAdmins(),
        ]);
        setPoliticians(politiciansRes.items || []);
        setAdmins(adminsRes.data || []);
        console.log(politicians);
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

      //   const nextPage = reset ? 1 : page;

      const res = await fetchTickets({
        status: status === "all" ? undefined : status,
        assigned: assigned === "all" ? undefined : assigned,
      });

      setMeta(res.meta || null);
      setItems((prev) =>
        reset ? res.data || [] : [...prev, ...(res.data || [])],
      );
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
  }, [debounced, status, assigned]);

  const onLoadMore = async () => {
    if (!canLoadMore || loadingMore) return;
    const next = page + 1;
    setPage(next);

    try {
      setLoadingMore(true);
      const res = await fetchTickets({
        status: status === "all" ? undefined : status,
        assigned: assigned === "all" ? undefined : assigned,
      });
      setMeta(res.meta);
      setItems((prev) => [...prev, ...res.data]);
    } catch (e) {
      setError(e?.message || "Failed to load more");
    } finally {
      setLoadingMore(false);
    }
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      await updateTicket(ticketId, { status: newStatus });
      setItems((prev) =>
        prev.map((item) =>
          item._id === ticketId ? { ...item, status: newStatus } : item,
        ),
      );
    } catch (e) {
      alert("Failed to update status: " + e.message);
    }
  };

  const handlePriorityChange = async (ticketId, newPriority) => {
    try {
      await updateTicket(ticketId, { priority: newPriority });
      setItems((prev) =>
        prev.map((item) =>
          item._id === ticketId ? { ...item, priority: newPriority } : item,
        ),
      );
    } catch (e) {
      alert("Failed to update priority: " + e.message);
    }
  };

  const handleAssign = async (ticketId, assignedTo) => {
    try {
      await assignTicket(ticketId, assignedTo);
      setItems((prev) =>
        prev.map((item) =>
          item._id === ticketId ? { ...item, assignedTo } : item,
        ),
      );
    } catch (e) {
      alert("Failed to assign ticket: " + e.message);
    }
  };

  const handleDelete = async (ticketId) => {
    if (!confirm("Are you sure you want to delete this ticket?")) return;

    try {
      await deleteTicket(ticketId);
      setItems((prev) => prev.filter((item) => item._id !== ticketId));
      if (selectedTicketId === ticketId) {
        setSearchParams({});
      }
    } catch (e) {
      alert("Failed to delete ticket: " + e.message);
    }
  };

  const handleReply = async () => {
    if (!replyMessage.trim() || !selectedTicket) return;

    try {
      setReplying(true);
      await replyToTicket(selectedTicket._id, replyMessage.trim());

      // Update the selected ticket with the new reply
      const updatedTicket = { ...selectedTicket };
      updatedTicket.replies = [
        ...(updatedTicket.replies || []),
        {
          senderId: "admin", // This will be set by the backend
          senderRole: "admin",
          message: replyMessage.trim(),
          createdAt: new Date().toISOString(),
        },
      ];
      updatedTicket.lastRepliedAt = new Date().toISOString();

      // Also update in the items list
      setItems((prev) =>
        prev.map((item) =>
          item._id === selectedTicket._id ? updatedTicket : item,
        ),
      );

      setReplyMessage("");
    } catch (e) {
      alert("Failed to send reply: " + e.message);
    } finally {
      setReplying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              {selectedTicketId ? "Ticket Details" : "Manage Tickets"}
            </h1>
            <p className="text-slate-600">
              {selectedTicketId
                ? "View conversation and manage this ticket"
                : "View and manage support tickets from citizens."}
            </p>
          </div>
          {selectedTicketId && (
            <button
              onClick={() => setSearchParams({})}
              className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm font-semibold hover:bg-slate-50"
            >
              ← Back to tickets
            </button>
          )}
        </div>
      </div>

      {!selectedTicketId ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tickets…"
              className="h-11 px-4 rounded-2xl border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-slate-200"
            />

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-11 px-4 rounded-2xl border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-slate-200"
            >
              <option value="all">All statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>

            <select
              value={assigned}
              onChange={(e) => setAssigned(e.target.value)}
              className="h-11 px-4 rounded-2xl border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-slate-200"
            >
              <option value="all">All assignments</option>
              <option value="me">Assigned to me</option>
              <option value="assigned">Assigned</option>
              <option value="unassigned">Unassigned</option>
            </select>

            <button
              onClick={() => {
                setSearch("");
                setStatus("all");
                setAssigned("all");
              }}
              className="h-11 px-4 rounded-2xl border border-slate-200 bg-white text-slate-900 text-sm font-semibold hover:bg-slate-50"
            >
              Clear filters
            </button>
          </div>

          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="text-slate-600">Loading tickets…</div>
          ) : (
            <>
              <div className="space-y-3">
                {items.map((ticket) => (
                  <div
                    key={ticket._id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 cursor-pointer hover:bg-slate-50 transition"
                    onClick={() => setSearchParams({ ticket: ticket._id })}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-slate-900 truncate">
                            {ticket.subject}
                          </h3>
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium ${statusBadge(
                              ticket.status,
                            )}`}
                          >
                            {ticket.status.replace("_", " ")}
                          </span>
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium ${priorityBadge(
                              ticket.priority,
                            )}`}
                          >
                            {ticket.priority}
                          </span>
                        </div>

                        <p className="text-sm text-slate-600 mb-2 line-clamp-2">
                          {ticket.message}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span>Created: {fmtDate(ticket.createdAt)}</span>
                          <span>By: {ticket.createdBy}</span>
                          {ticket.assignedTo && (
                            <span>Assigned to: {ticket.assignedTo}</span>
                          )}
                          <span>{ticket.replies?.length || 0} replies</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <select
                          value={ticket.status}
                          onClick={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleStatusChange(ticket._id, e.target.value);
                          }}
                          className="text-xs px-2 py-1 rounded border border-slate-200"
                        >
                          <option value="open">Open</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="closed">Closed</option>
                        </select>

                        <select
                          value={ticket.priority}
                          onClick={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            e.stopPropagation();
                            handlePriorityChange(ticket._id, e.target.value);
                          }}
                          className="text-xs px-2 py-1 rounded border border-slate-200"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>

                        <select
                          value={ticket.assignedTo || ""}
                          onClick={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleAssign(ticket._id, e.target.value || null);
                          }}
                          className="text-xs px-2 py-1 rounded border border-slate-200"
                        >
                          <option value="">Unassigned</option>
                          {admins.map((admin) => (
                            <option key={admin.userId} value={admin.userId}>
                              {admin.email}
                            </option>
                          ))}
                        </select>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(ticket._id);
                          }}
                          className="text-xs px-2 py-1 rounded border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {items.length === 0 && !error ? (
                <div className="text-slate-600">No tickets found.</div>
              ) : null}

              <div className="flex items-center justify-center">
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
        </>
      ) : (
        <div className="space-y-6">
          {/* Ticket Header */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-xl font-semibold text-slate-900">
                    {selectedTicket.subject}
                  </h2>
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium ${statusBadge(
                      selectedTicket.status,
                    )}`}
                  >
                    {selectedTicket.status.replace("_", " ")}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium ${priorityBadge(
                      selectedTicket.priority,
                    )}`}
                  >
                    {selectedTicket.priority}
                  </span>
                </div>

                <div className="text-sm text-slate-600 mb-2">
                  {selectedTicket.message}
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span>Created: {fmtDate(selectedTicket.createdAt)}</span>
                  <span>By: {selectedTicket.createdBy}</span>
                  {selectedTicket.politicianId && (
                    <span>
                      Politician: {selectedTicket.politicianId.fullName}
                    </span>
                  )}
                  {selectedTicket.assignedTo && (
                    <span>Assigned to: {selectedTicket.assignedTo}</span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <select
                  value={selectedTicket.status}
                  onChange={(e) =>
                    handleStatusChange(selectedTicket._id, e.target.value)
                  }
                  className="text-xs px-2 py-1 rounded border border-slate-200"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>

                <select
                  value={selectedTicket.priority}
                  onChange={(e) =>
                    handlePriorityChange(selectedTicket._id, e.target.value)
                  }
                  className="text-xs px-2 py-1 rounded border border-slate-200"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>

                <select
                  value={selectedTicket.assignedTo || ""}
                  onChange={(e) =>
                    handleAssign(selectedTicket._id, e.target.value || null)
                  }
                  className="text-xs px-2 py-1 rounded border border-slate-200"
                >
                  <option value="">Unassigned</option>
                  {admins.map((admin) => (
                    <option key={admin.userId} value={admin.userId}>
                      {admin.email}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Conversation */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">
                Conversation
              </h3>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {/* Original message */}
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-600">
                    U
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-slate-900">
                        {selectedTicket.createdBy}
                      </span>
                      <span className="text-xs text-slate-500">
                        {fmtDate(selectedTicket.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700">
                      {selectedTicket.message}
                    </p>
                  </div>
                </div>
              </div>

              {/* Replies */}
              {selectedTicket.replies &&
                selectedTicket.replies.map((reply, index) => (
                  <div key={index} className="p-6 border-b border-slate-100">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                          reply.senderRole === "admin"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {reply.senderRole === "admin" ? "A" : "U"}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-slate-900">
                            {reply.senderRole === "admin"
                              ? "Support Team"
                              : selectedTicket.createdBy}
                          </span>
                          <span className="text-xs text-slate-500">
                            {fmtDate(reply.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700">
                          {reply.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {/* Reply Form */}
            {selectedTicket.status !== "closed" && (
              <div className="p-6 border-t border-slate-200">
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-slate-900">
                    Add Reply
                  </h4>
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-slate-200"
                    placeholder="Type your reply..."
                  />
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setReplyMessage("")}
                      className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm font-medium hover:bg-slate-50"
                    >
                      Clear
                    </button>
                    <button
                      onClick={handleReply}
                      disabled={replying || !replyMessage.trim()}
                      className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-60"
                    >
                      {replying ? "Sending…" : "Send Reply"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
