import React from "react";
import { Link } from "react-router-dom";

function Card({ title, desc, to, cta }) {
  return (
    <div className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-lg font-extrabold text-slate-900">{title}</div>
      <div className="mt-1 text-sm text-slate-600">{desc}</div>
      <div className="mt-4">
        <Link
          to={to}
          className="inline-flex h-10 w-full items-center justify-center rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800 sm:w-auto"
        >
          {cta} →
        </Link>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
          Admin Overview
        </h1>
        <p className="text-slate-600">
          Manage politicians, parties, and petitions. Changes apply to the
          public site.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card
          title="Politicians"
          desc="Create and edit politician profiles, socials, and deactivate profiles."
          to="/admin/politicians"
          cta="Manage"
        />
        <Card
          title="Parties"
          desc="Create/edit parties (code, name, logo URL, website, description)."
          to="/admin/parties"
          cta="Manage"
        />
        <Card
          title="Promises"
          desc="Create and manage political promises, update fulfillment status."
          to="/admin/promises"
          cta="Manage"
        />
        <Card
          title="Petitions"
          desc="Review petitions and approve/reject. Keep the public list clean and verified."
          to="/admin/petitions"
          cta="Review"
        />
      </div>

      <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="text-sm font-semibold text-slate-900">Quick tips</div>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
          <li>
            Use image URLs (Cloudinary) for logos/photos to avoid upload UI.
          </li>
        </ul>
      </div>
    </div>
  );
}
