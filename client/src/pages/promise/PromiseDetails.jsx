import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchPromiseBySlug } from "../../api/promises-api.js";
import RatingWidget from "../../components/promise/RatingWidget.jsx";
import FeedbackSection from "../../components/promise/FeedbackSection.jsx";

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

export default function PromiseDetails() {
  const { politicianSlug, promiseSlug } = useParams();

  const [promise, setPromise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        setErr("");
        setLoading(true);

        const res = await fetchPromiseBySlug(politicianSlug, promiseSlug);
        setPromise(res.data);
      } catch (e) {
        setErr(e?.message || "Failed to load promise");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [politicianSlug, promiseSlug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 text-slate-600">
        Loading promise…
      </div>
    );
  }

  if (err) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900">
          {err}
        </div>
      </div>
    );
  }

  if (!promise) return null;

  const politician = promise.politicianId;
  const politicianName = politician?.fullName || "Unknown politician";
  const politicianSlugLink = politician?.slug;
  const status = promise.status || "pending";
  const promiseDate = promise.promiseDate;
  const createdAt = promise.createdAt;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link
        to="/promises"
        className="text-sm text-slate-600 hover:text-slate-900"
      >
        ← Back to promises
      </Link>

      <div className="mt-4 rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="text-2xl font-extrabold text-slate-900 mb-2">
                {promise.title || "Untitled promise"}
              </div>
              <div className="text-sm text-slate-600 mb-3">
                By{" "}
                <Link
                  to={`/politicians/${politicianSlugLink}`}
                  className="font-semibold text-slate-800 hover:text-slate-900"
                >
                  {politicianName}
                </Link>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${statusBadge(status)}`}
                >
                  {status.replace("_", " ")}
                </span>
                {promise.category && (
                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-700">
                    {promise.category}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="text-sm font-semibold text-slate-500 mb-2">
              Description
            </div>
            <div className="text-slate-800 leading-relaxed">
              {promise.description || "No description provided."}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {promiseDate && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-sm font-semibold text-slate-500">
                  Promise Date
                </div>
                <div className="mt-1 text-slate-900 font-medium">
                  {fmtDate(promiseDate)}
                </div>
              </div>
            )}
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-sm font-semibold text-slate-500">
                Created
              </div>
              <div className="mt-1 text-slate-900 font-medium">
                {fmtDate(createdAt)}
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="text-sm font-semibold text-slate-500 mb-2">
              Current Status
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-semibold ${statusBadge(status)}`}
              >
                {status.replace("_", " ").toUpperCase()}
              </span>
              <div className="text-sm text-slate-600">
                {status === "fulfilled"
                  ? "This promise has been successfully fulfilled."
                  : status === "broken"
                    ? "This promise has been broken."
                    : status === "in_progress"
                      ? "This promise is currently being worked on."
                      : "This promise is pending fulfillment."}
              </div>
            </div>
          </div>

          <RatingWidget promiseId={promise._id || promise.id} />
          <FeedbackSection promiseId={promise._id || promise.id} />
        </div>
      </div>
    </div>
  );
}
