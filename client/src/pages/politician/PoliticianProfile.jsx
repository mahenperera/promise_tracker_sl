// import React from "react";
// import { useParams } from "react-router-dom";

// export default function PoliticianProfile() {
//   const { slug } = useParams();

//   return (
//     <div className="min-h-screen bg-slate-100">
//       <div className="mx-auto max-w-6xl px-4 py-10">
//         <h1 className="text-3xl font-extrabold text-slate-900">
//           Politician Profile
//         </h1>
//         <p className="mt-2 text-slate-600">
//           Coming soon. Profile slug:{" "}
//           <span className="font-semibold">{slug}</span>
//         </p>
//       </div>
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchPoliticianBySlug } from "../../api/politicians-api";

const FALLBACK_AVATAR =
  "https://ui-avatars.com/api/?background=0f172a&color=fff&name=MP&size=256";

function Field({ label, value }) {
  if (!value) return null;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-xs font-semibold text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function SocialLink({ label, url }) {
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 hover:bg-slate-50"
    >
      {label} ↗
    </a>
  );
}

export default function PoliticianProfile() {
  const { slug } = useParams();
  const nav = useNavigate();

  const [p, setP] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setErr("");

    (async () => {
      try {
        const res = await fetchPoliticianBySlug(slug);
        if (!alive) return;
        setP(res.data);
      } catch (e) {
        if (!alive) return;
        setErr("Politician not found (or server error).");
        setP(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="h-8 w-56 rounded bg-slate-100 animate-pulse" />
        <div className="mt-4 h-44 rounded-3xl bg-slate-100 animate-pulse" />
      </div>
    );
  }

  if (err) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <button
          onClick={() => nav("/politicians")}
          className="text-sm font-semibold text-slate-700 hover:text-slate-900"
        >
          ← Back
        </button>
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {err}
        </div>
      </div>
    );
  }

  const avatar = p?.photoUrl?.trim() ? p.photoUrl : FALLBACK_AVATAR;
  const social = p?.socialLinks || {};

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <button
        onClick={() => nav("/politicians")}
        className="text-sm font-semibold text-slate-700 hover:text-slate-900"
      >
        ← Back to politicians
      </button>

      {/* Hero */}
      <div className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="relative h-44 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900" />
        <div className="relative -mt-14 px-6 pb-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex items-end gap-4">
              <div className="h-28 w-28 overflow-hidden rounded-2xl border-4 border-white bg-slate-100 shadow">
                <img
                  src={avatar}
                  alt={p.fullName}
                  className="h-full w-full object-cover"
                  onError={(e) => (e.currentTarget.src = FALLBACK_AVATAR)}
                />
              </div>

              <div>
                <div className="text-2xl font-extrabold text-slate-900">
                  {p.fullName}
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  {(p.position || "Politician") +
                    (p.party ? ` • ${p.party}` : "") +
                    (p.district ? ` • ${p.district}` : "")}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <SocialLink label="Website" url={social.websiteUrl} />
              <SocialLink label="Facebook" url={social.facebookUrl} />
              <SocialLink label="X" url={social.twitterUrl} />
              <SocialLink label="YouTube" url={social.youtubeUrl} />
            </div>
          </div>

          {/* Bio */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs font-semibold text-slate-500">Bio</div>
            <p className="mt-2 text-sm text-slate-700">
              {p.bio?.trim() ? p.bio : "No bio added yet."}
            </p>
          </div>

          {/* Details */}
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <Field label="Party" value={p.party} />
            <Field label="District" value={p.district} />
            <Field label="Position" value={p.position} />
          </div>

          {/* Later sections (teammates / future) */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="text-sm font-extrabold text-slate-900">
              Promises
            </div>
            <p className="mt-1 text-sm text-slate-600">
              Coming soon — this section will list promises linked to this
              politician.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
