import React from "react";
import { Link } from "react-router-dom";

const FALLBACK_AVATAR = "/placeholders/politician.jpg";

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
    pending: "bg-amber-50 text-amber-800 border-amber-200",
    in_progress: "bg-blue-50 text-blue-800 border-blue-200",
    fulfilled: "bg-emerald-50 text-emerald-800 border-emerald-200",
    broken: "bg-rose-50 text-rose-800 border-rose-200",
  };
  return map[s] || "bg-slate-100 text-slate-700 border-slate-200";
}

export default function PromiseCard({ p }) {
  const title = p?.title || "Untitled promise";
  const politician = p?.politicianId;
  const politicianName = politician?.fullName || "Unknown politician";
  const politicianSlug = politician?.slug;
  const category = p?.category || "";
  const status = p?.status || "pending";
  const promiseDate = p?.promiseDate;
  const description = p?.description || "";

  const snippet = description.replace(/\s+/g, " ").trim().slice(0, 120);

  return (
    <Link
      to={`/politicians/${politicianSlug}/promises/${p.slug}`}
      className="group rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-lg font-extrabold text-slate-900 truncate">
              {title}
            </div>
            <div className="mt-1 text-sm text-slate-600 truncate">
              By:{" "}
              <span className="font-semibold text-slate-800">
                {politicianName}
              </span>
            </div>
            {category ? (
              <div className="mt-1 text-sm text-slate-600 truncate">
                Category: <span className="text-slate-800">{category}</span>
              </div>
            ) : null}
          </div>

          <div className="shrink-0 flex flex-col items-end gap-2">
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusBadge(status)}`}
            >
              {status.replace("_", " ")}
            </span>
          </div>
        </div>

        <div className="mt-3 text-sm text-slate-700 leading-relaxed">
          {snippet
            ? `${snippet}${description.length > 120 ? "…" : ""}`
            : "No description available."}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {promiseDate ? (
              <>
                Promised:{" "}
                <span className="text-slate-700">{fmtDate(promiseDate)}</span>
              </>
            ) : (
              <>
                Created:{" "}
                <span className="text-slate-700">{fmtDate(p?.createdAt)}</span>
              </>
            )}
          </div>

          <div className="text-xs font-bold text-slate-900 group-hover:translate-x-0.5 transition">
            View →
          </div>
        </div>
      </div>
    </Link>
  );
}
