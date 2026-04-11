// import React from "react";
// import { Link } from "react-router-dom";

// function Card({ title, desc, to }) {
//   return (
//     <Link
//       to={to}
//       className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition"
//     >
//       <div className="text-lg font-extrabold text-slate-900">{title}</div>
//       <div className="mt-1 text-slate-600">{desc}</div>
//       <div className="mt-4 text-sm font-semibold text-slate-900">Open →</div>
//     </Link>
//   );
// }

// export default function AdminDashboard() {
//   return (
//     <div>
//       <div className="text-2xl font-extrabold text-slate-900">Overview</div>
//       <div className="mt-1 text-slate-600">
//         Manage politicians, parties, and petitions in one place.
//       </div>

//       <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
//         <Card
//           title="Politicians"
//           desc="Create, update, activate/deactivate, and maintain public profiles."
//           to="/admin/politicians"
//         />
//         <Card
//           title="Parties"
//           desc="Manage party details, logos, website links, and active status."
//           to="/admin/parties"
//         />
//         <Card
//           title="Petitions"
//           desc="Review and moderate petitions (approve/reject) and monitor signatures."
//           to="/admin/petitions"
//         />
//       </div>
//     </div>
//   );
// }

import React from "react";
import { Link } from "react-router-dom";

function Card({ title, desc, to, cta }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-lg font-extrabold text-slate-900">{title}</div>
      <div className="mt-1 text-sm text-slate-600">{desc}</div>
      <div className="mt-4">
        <Link
          to={to}
          className="inline-flex h-10 items-center rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800"
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
        <h1 className="text-3xl font-extrabold text-slate-900">
          Admin Overview
        </h1>
        <p className="text-slate-600">
          Manage politicians, parties, and petitions. Changes apply to the
          public site.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
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

      <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5">
        <div className="text-sm font-semibold text-slate-900">Quick tips</div>
        <ul className="mt-2 list-disc pl-5 text-sm text-slate-600 space-y-1">
          <li>
            Use image URLs (Cloudinary) for logos/photos to avoid upload UI.
          </li>
        </ul>
      </div>
    </div>
  );
}
