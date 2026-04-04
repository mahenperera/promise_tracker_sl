import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchPetitionById, signPetition } from "../../api/petitions-api.js";
import { useAuth } from "../../context/auth-context.jsx";

const FALLBACK_BANNER = "/placeholders/banner.png"; // use your existing placeholder

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
      label: "Approved",
      cls: "bg-emerald-50 text-emerald-800 border-emerald-200",
    },
    submitted: {
      label: "Submitted",
      cls: "bg-amber-50 text-amber-800 border-amber-200",
    },
    rejected: {
      label: "Rejected",
      cls: "bg-rose-50 text-rose-800 border-rose-200",
    },
    archived: {
      label: "Archived",
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

export default function PetitionDetails() {
  const { id } = useParams();

  const [petition, setPetition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);
  const [signMsg, setSignMsg] = useState("");

  const { user } = useAuth();
  const userId = user?.userId || "";

  useEffect(() => {
    const run = async () => {
      try {
        setErr("");
        setLoading(true);

        const res = await fetchPetitionById(id);
        const data = res.data;

        setPetition(data);

        // signedBy is returned only when logged-in (approved + token) on backend.
        const alreadySigned =
          Array.isArray(data?.signedBy) && userId
            ? data.signedBy.includes(userId)
            : false;

        setSigned(alreadySigned);
      } catch (e) {
        setErr(e?.message || "Failed to load petition");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [id, userId]);

  const onSign = async () => {
    if (!petition) return;

    try {
      setSignMsg("");
      setSigning(true);

      const res = await signPetition(petition._id);

      if (res?.alreadySigned) {
        setSigned(true);
        setSignMsg("You have already signed this petition.");
        return;
      }

      // update UI count
      setPetition((prev) =>
        prev
          ? {
              ...prev,
              signCount:
                typeof res.signCount === "number"
                  ? res.signCount
                  : prev.signCount,
            }
          : prev,
      );
      setSigned(true);
      setSignMsg(
        "Signed successfully. Thank you for supporting this petition.",
      );
    } catch (e) {
      setSignMsg(e?.message || "Failed to sign petition");
    } finally {
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 text-slate-600">
        Loading petition…
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

  if (!petition) return null;

  const status = statusMeta(petition.status);

  const banner = "/placeholders/banner.png"; // keep simple (no bannerUrl in petition schema)

  const signCount =
    typeof petition.signCount === "number" ? petition.signCount : 0;

  const canSign = petition.status === "approved" && petition.isActive;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link
        to="/petitions"
        className="text-sm text-slate-600 hover:text-slate-900"
      >
        ← Back to petitions
      </Link>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* LEFT: details */}
        <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          {/* banner */}
          <div className="relative h-40 sm:h-52">
            <img
              src={banner}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              onError={(e) => (e.currentTarget.src = FALLBACK_BANNER)}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 via-slate-900/35 to-transparent" />
          </div>

          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                  {petition.title}
                </h1>

                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${status.cls}`}
                  >
                    {status.label}
                  </span>

                  <span className="text-slate-600">
                    Addressed to:{" "}
                    <span className="font-semibold text-slate-800">
                      {petition.addressedTo}
                    </span>
                  </span>
                </div>

                {petition.subjectLine ? (
                  <div className="mt-2 text-sm text-slate-600">
                    Subject:{" "}
                    <span className="text-slate-800">
                      {petition.subjectLine}
                    </span>
                  </div>
                ) : null}
              </div>

              <div className="shrink-0 text-right">
                <div className="text-xs text-slate-500">Signatures</div>
                <div className="text-2xl font-extrabold text-slate-900">
                  {signCount}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  Created {fmtDate(petition.createdAt)}
                  {petition.deadline ? (
                    <> • Deadline {fmtDate(petition.deadline)}</>
                  ) : null}
                </div>
              </div>
            </div>

            {/* evidence summary */}
            {petition.evidenceSummary ? (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-bold text-slate-700">
                  Evidence summary
                </div>
                <div className="mt-2 text-sm text-slate-800 whitespace-pre-line">
                  {petition.evidenceSummary}
                </div>
              </div>
            ) : null}

            {/* body */}
            <div className="mt-6">
              <div className="text-sm font-extrabold text-slate-900">
                Petition details
              </div>
              <div className="mt-2 text-sm text-slate-800 whitespace-pre-line leading-relaxed">
                {petition.body}
              </div>
            </div>

            {/* attachments */}
            {Array.isArray(petition.attachments) &&
            petition.attachments.length ? (
              <div className="mt-6">
                <div className="text-sm font-extrabold text-slate-900">
                  Attachments
                </div>
                <div className="mt-2 grid gap-2">
                  {petition.attachments.map((url, idx) => (
                    <a
                      key={`${url}-${idx}`}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 hover:bg-slate-50"
                    >
                      Open attachment {idx + 1} ↗
                      <div className="mt-1 text-xs text-slate-500 truncate">
                        {url}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* RIGHT: sign panel */}
        <div className="lg:sticky lg:top-24 h-fit rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="text-lg font-extrabold text-slate-900">
              Sign this petition
            </div>
            <div className="mt-2 text-sm text-slate-600">
              Your signature supports this petition and increases its
              visibility.
            </div>

            {!canSign ? (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900 text-sm">
                This petition is not signable yet (only <b>approved</b>{" "}
                petitions can be signed).
              </div>
            ) : null}

            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              By signing, you confirm this petition is truthful to the best of
              your knowledge.
            </div>

            {signMsg ? (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-900">
                {signMsg}
              </div>
            ) : null}

            <button
              onClick={onSign}
              disabled={!canSign || signing || signed}
              className="mt-4 w-full h-11 rounded-2xl bg-slate-900 text-white text-sm font-extrabold hover:bg-slate-800 disabled:opacity-60"
            >
              {signed ? "Signed" : signing ? "Signing…" : "Sign petition"}
            </button>

            <div className="mt-3 text-xs text-slate-500">
              Tip: If you’re not signed in, the server will reject signing.
            </div>

            <div className="mt-5 flex items-center justify-between">
              <div className="text-xs text-slate-500">Share</div>
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(window.location.href);
                    setSignMsg("Link copied to clipboard.");
                  } catch {
                    setSignMsg("Copy failed. Please copy the URL manually.");
                  }
                }}
                className="text-xs font-bold text-slate-900 hover:text-slate-700"
              >
                Copy link
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
