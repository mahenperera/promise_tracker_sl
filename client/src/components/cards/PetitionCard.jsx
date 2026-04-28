import React from "react";
import { Link } from "react-router-dom";

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
    approved: "bg-emerald-50 text-emerald-800 border-emerald-200",
    submitted: "bg-amber-50 text-amber-800 border-amber-200",
    rejected: "bg-rose-50 text-rose-800 border-rose-200",
    archived: "bg-slate-100 text-slate-700 border-slate-200",
  };
  return map[s] || "bg-slate-100 text-slate-700 border-slate-200";
}

export default function PetitionCard({ p }) {
  const title = p?.title || "Untitled petition";
  const addressedTo = p?.addressedTo || "—";
  const subjectLine = p?.subjectLine || "";
  const signCount = typeof p?.signCount === "number" ? p.signCount : 0;

  const snippet = (p?.body || "").replace(/\s+/g, " ").trim().slice(0, 140);

  return (
    <Link
      to={`/petitions/${p._id}`}
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="truncate text-base font-extrabold text-slate-900 sm:text-lg">
              {title}
            </div>
            <div className="mt-1 truncate text-sm text-slate-600">
              Addressed to:{" "}
              <span className="font-semibold text-slate-800">
                {addressedTo}
              </span>
            </div>
            {subjectLine ? (
              <div className="mt-1 truncate text-sm text-slate-600">
                Subject: <span className="text-slate-800">{subjectLine}</span>
              </div>
            ) : null}
          </div>

          <div className="flex flex-row flex-wrap items-center gap-2 sm:shrink-0 sm:flex-col sm:items-end">
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusBadge(
                p?.status,
              )}`}
            >
              {String(p?.status || "—")}
            </span>

            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
              {signCount} signatures
            </span>
          </div>
        </div>

        <div className="mt-3 text-sm leading-relaxed text-slate-700">
          {snippet
            ? `${snippet}${(p?.body || "").length > 140 ? "…" : ""}`
            : "—"}
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-slate-500">
            Created:{" "}
            <span className="text-slate-700">{fmtDate(p?.createdAt)}</span>
            {p?.deadline ? (
              <>
                {" "}
                • Deadline:{" "}
                <span className="text-slate-700">{fmtDate(p.deadline)}</span>
              </>
            ) : null}
          </div>

          <div className="text-xs font-bold text-slate-900 transition group-hover:translate-x-0.5">
            View →
          </div>
        </div>
      </div>
    </Link>
  );
}
