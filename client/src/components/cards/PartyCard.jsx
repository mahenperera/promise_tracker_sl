// import React from "react";
// import { Link } from "react-router-dom";

// const FALLBACK_PARTY = "/placeholders/party.png";

// export default function PartyCard({ party }) {
//   const logo = party.logoUrl?.trim() ? party.logoUrl.trim() : FALLBACK_PARTY;

//   return (
//     <Link
//       to={`/parties/${party.slug}`}
//       className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition"
//     >
//       <div className="flex items-start gap-3">
//         <div className="shrink-0 flex items-center gap-2">
//           <img
//             src={logo}
//             alt={party.name}
//             className="h-10 w-10 rounded-lg object-contain"
//             onError={(e) => {
//               e.currentTarget.src = FALLBACK_PARTY;
//             }}
//           />
//         </div>

//         <div className="min-w-0 flex-1">
//           <div className="font-semibold text-slate-900 truncate">
//             {party.name}
//           </div>
//           <div className="text-sm text-slate-600">
//             {party.count} politician(s)
//           </div>

//           {party.sample?.length > 0 && (
//             <div className="mt-2 text-xs text-slate-500 line-clamp-2">
//               {party.sample.join(" • ")}
//             </div>
//           )}
//         </div>

//         <div className="text-xs font-semibold text-slate-900">View →</div>
//       </div>
//     </Link>
//   );
// }

import React from "react";
import { Link } from "react-router-dom";

const FALLBACK_PARTY = "/placeholders/party.png";

export default function PartyCard({ party }) {
  const logo = party?.partyLogoUrl?.trim()
    ? party.partyLogoUrl
    : FALLBACK_PARTY;

  return (
    <Link
      to={`/parties/${party.slug}`}
      className="group rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition overflow-hidden"
    >
      <div className="p-4 flex items-center gap-4">
        <img
          src={logo}
          alt={party.name}
          className="h-12 w-12 rounded-lg object-contain"
          onError={(e) => (e.currentTarget.src = FALLBACK_PARTY)}
        />

        <div className="min-w-0 flex-1">
          <div className="font-semibold text-slate-900 truncate">
            {party.name}
          </div>
          <div className="text-sm text-slate-600">
            {party.count} politician(s)
          </div>
        </div>

        <span className="text-xs font-semibold text-slate-900 group-hover:translate-x-0.5 transition">
          View →
        </span>
      </div>
    </Link>
  );
}
