import React, { useEffect, useState } from "react";
import {
  fetchTickets,
  createTicket,
  replyToTicket,
} from "../../api/ticket-api.js";
import { fetchPoliticians } from "../../api/politicians-api.js";

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

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [politicians, setPoliticians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    subject: "",
    message: "",
    politicianId: "",
  });
  const [creating, setCreating] = useState(false);

  const [replyingTo, setReplyingTo] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [replying, setReplying] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [ticketsRes, politiciansRes] = await Promise.all([
        fetchTickets(),
        fetchPoliticians({ limit: 1000 }),
      ]);

      setTickets(ticketsRes.data || []);
      setPoliticians(politiciansRes.items || []);
    } catch (e) {
      setError(e?.message || "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();

    if (!createForm.subject.trim() || !createForm.message.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setCreating(true);
      await createTicket({
        subject: createForm.subject.trim(),
        message: createForm.message.trim(),
        politicianId: createForm.politicianId || undefined,
      });

      setCreateForm({ subject: "", message: "", politicianId: "" });
      setShowCreateForm(false);
      loadData(); // Refresh tickets
    } catch (e) {
      alert("Failed to create ticket: " + e.message);
    } finally {
      setCreating(false);
    }
  };

  const handleReply = async (ticketId) => {
    if (!replyMessage.trim()) {
      alert("Please enter a reply message");
      return;
    }

    try {
      setReplying(true);
      await replyToTicket(ticketId, replyMessage.trim());

      setReplyMessage("");
      setReplyingTo(null);
      loadData(); // Refresh tickets
    } catch (e) {
      alert("Failed to send reply: " + e.message);
    } finally {
      setReplying(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-3xl font-extrabold text-slate-900">
          Support Tickets
        </h1>
        <p className="text-slate-600">
          Create and manage your support tickets. Get help with issues or ask
          questions.
        </p>
      </div>

      <div className="mb-6">
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="h-11 px-5 rounded-2xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800"
        >
          {showCreateForm ? "Cancel" : "Create New Ticket"}
        </button>
      </div>

      {showCreateForm && (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Create New Ticket
          </h2>

          <form onSubmit={handleCreateTicket} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Subject *
              </label>
              <input
                type="text"
                value={createForm.subject}
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    subject: e.target.value,
                  }))
                }
                className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="Brief description of your issue"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Related Politician (optional)
              </label>
              <select
                value={createForm.politicianId}
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    politicianId: e.target.value,
                  }))
                }
                className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-slate-200"
              >
                <option value="">Not related to a specific politician</option>
                {politicians.map((politician) => (
                  <option key={politician._id} value={politician._id}>
                    {politician.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Message *
              </label>
              <textarea
                value={createForm.message}
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    message: e.target.value,
                  }))
                }
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="Describe your issue in detail"
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={creating}
                className="h-11 px-5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-60"
              >
                {creating ? "Creating…" : "Create Ticket"}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="h-11 px-5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-slate-600">Loading tickets…</div>
      ) : (
        <div className="space-y-4">
          {tickets.length === 0 ? (
            <div className="text-slate-600">No tickets found.</div>
          ) : (
            tickets.map((ticket) => (
              <div
                key={ticket._id}
                className="rounded-2xl border border-slate-200 bg-white overflow-hidden"
              >
                <div className="p-6 border-b border-slate-200">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">
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

                      <p className="text-slate-600 mb-2">{ticket.message}</p>

                      <div className="text-sm text-slate-500">
                        Created: {fmtDate(ticket.createdAt)}
                        {ticket.assignedTo &&
                          ` • Assigned to: ${ticket.assignedTo}`}
                      </div>
                    </div>
                  </div>
                </div>

                {ticket.replies && ticket.replies.length > 0 && (
                  <div className="px-6 pb-4 pt-4">
                    <div className="space-y-3">
                      {ticket.replies.map((reply, index) => (
                        <div
                          key={index}
                          className={`rounded-lg p-3 ${
                            reply.senderRole === "admin"
                              ? "bg-blue-50 border border-blue-200"
                              : "bg-slate-50 border border-slate-200"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-slate-500">
                              {reply.senderRole === "admin" ? "Support" : "You"}
                            </span>
                            <span className="text-xs text-slate-400">
                              {fmtDate(reply.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-slate-700">
                            {reply.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {ticket.status !== "closed" && (
                  <div className="px-6 pb-6">
                    {replyingTo === ticket._id ? (
                      <div className="space-y-3">
                        <textarea
                          value={replyMessage}
                          onChange={(e) => setReplyMessage(e.target.value)}
                          rows={3}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-slate-200"
                          placeholder="Type your reply..."
                        />
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleReply(ticket._id)}
                            disabled={replying}
                            className="h-9 px-4 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-60"
                          >
                            {replying ? "Sending…" : "Send Reply"}
                          </button>
                          <button
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyMessage("");
                            }}
                            className="h-9 px-4 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm font-semibold hover:bg-slate-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setReplyingTo(ticket._id)}
                        className="h-9 px-4 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm font-semibold hover:bg-slate-50"
                      >
                        Reply
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
