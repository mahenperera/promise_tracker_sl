// import React, { useEffect, useMemo, useState } from "react";
// import { Link, useParams } from "react-router-dom";
// import PoliticianCard from "../../components/cards/PoliticianCard.jsx";
// import { fetchPoliticians } from "../../api/politicians-api.js";

// const FALLBACK_PARTY = "/placeholders/party.png";

// const slugify = (text = "") =>
//   text
//     .toString()
//     .trim()
//     .toLowerCase()
//     .replace(/&/g, "and")
//     .replace(/[^a-z0-9]+/g, "-")
//     .replace(/-+/g, "-")
//     .replace(/(^-|-$)/g, "");

// async function fetchAllPoliticians() {
//   const limit = 50;
//   const first = await fetchPoliticians({ page: 1, limit });
//   const items = [...(first.items || [])];

//   const totalPages = first?.meta?.totalPages || 1;
//   for (let page = 2; page <= totalPages; page++) {
//     const next = await fetchPoliticians({ page, limit });
//     items.push(...(next.items || []));
//   }
//   return items;
// }

// export default function PartyProfile() {
//   const { partySlug } = useParams();

//   const [loading, setLoading] = useState(true);
//   const [err, setErr] = useState("");
//   const [politicians, setPoliticians] = useState([]);

//   useEffect(() => {
//     let alive = true;
//     (async () => {
//       try {
//         setLoading(true);
//         setErr("");
//         const all = await fetchAllPoliticians();
//         if (!alive) return;
//         setPoliticians(all);
//       } catch (e) {
//         if (!alive) return;
//         setErr(e?.message || "Failed to load party");
//       } finally {
//         if (!alive) return;
//         setLoading(false);
//       }
//     })();
//     return () => {
//       alive = false;
//     };
//   }, [partySlug]);

//   const partyData = useMemo(() => {
//     const list = politicians.filter((p) => {
//       const name = (p.party || "Independent").trim() || "Independent";
//       return slugify(name) === partySlug;
//     });

//     if (list.length === 0) return null;

//     const partyName = (list[0].party || "Independent").trim() || "Independent";
//     const logoUrl =
//       list.find((p) => p.partyLogoUrl && p.partyLogoUrl.trim())?.partyLogoUrl ||
//       "";

//     return {
//       name: partyName,
//       logoUrl: logoUrl.trim(),
//       politicians: list,
//     };
//   }, [politicians, partySlug]);

//   return (
//     <div className="mx-auto max-w-6xl px-4 py-8">
//       <Link
//         to="/parties"
//         className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900"
//       >
//         ← Back to parties
//       </Link>

//       {loading && (
//         <div className="mt-6 text-sm text-slate-600">Loading party…</div>
//       )}

//       {!loading && err && (
//         <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
//           {err}
//         </div>
//       )}

//       {!loading && !err && !partyData && (
//         <div className="mt-6 rounded-2xl border border-slate-200 bg-white px-4 py-6">
//           <div className="text-lg font-bold text-slate-900">
//             Party not found
//           </div>
//           <div className="mt-1 text-sm text-slate-600">
//             No politicians matched this party.
//           </div>
//         </div>
//       )}

//       {!loading && !err && partyData && (
//         <>
//           {/* Party header */}
//           <div className="mt-6 rounded-3xl border border-slate-200 bg-white overflow-hidden">
//             <div className="h-28 bg-gradient-to-br from-slate-900 to-slate-700" />
//             <div className="px-6 pb-6 -mt-10 flex items-end justify-between gap-4">
//               <div className="flex items-end gap-4">
//                 <div className="h-20 w-20 rounded-2xl bg-white border border-slate-200 shadow-sm grid place-items-center overflow-hidden">
//                   <img
//                     src={partyData.logoUrl || FALLBACK_PARTY}
//                     alt={partyData.name}
//                     className="h-14 w-14 object-contain"
//                     onError={(e) => {
//                       e.currentTarget.src = FALLBACK_PARTY;
//                     }}
//                   />
//                 </div>

//                 <div>
//                   <div className="text-2xl font-extrabold text-slate-900">
//                     {partyData.name}
//                   </div>
//                   <div className="mt-1 text-sm text-slate-600">
//                     {partyData.politicians.length} politician(s)
//                   </div>
//                 </div>
//               </div>

//               <Link
//                 to="/politicians"
//                 className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-sm font-semibold hover:bg-slate-50"
//               >
//                 View all politicians
//               </Link>
//             </div>
//           </div>

//           {/* Politicians list */}
//           <div className="mt-6">
//             <div className="text-sm font-semibold text-slate-900">
//               Politicians in {partyData.name}
//             </div>

//             <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
//               {partyData.politicians.map((p) => (
//                 <PoliticianCard key={p._id || p.slug} p={p} />
//               ))}
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PoliticianCard from "../../components/cards/PoliticianCard.jsx";
import { fetchPartyBySlug } from "../../api/parties-api.js";

const FALLBACK_PARTY = "/placeholders/party.png";

export default function PartyProfile() {
  const { slug } = useParams();
  const [party, setParty] = useState(null);
  const [politicians, setPoliticians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setError("");
        setLoading(true);
        const res = await fetchPartyBySlug(slug);
        setParty(res.data.party);
        setPoliticians(res.data.politicians || []);
      } catch (e) {
        setError(e?.message || "Failed to load party");
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  const logo = party?.partyLogoUrl?.trim()
    ? party.partyLogoUrl
    : FALLBACK_PARTY;

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 text-slate-600">
        Loading…
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link
        to="/parties"
        className="text-sm text-slate-600 hover:text-slate-900"
      >
        ← Back to parties
      </Link>

      {/* Banner (shared idea with politician profile) */}
      <div className="mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div
          className="h-40 w-full"
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(15,23,42,.85), rgba(15,23,42,.35)), url(/parliament.jpg)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        <div className="p-6 flex items-center gap-4">
          <img
            src={logo}
            alt={party?.name}
            className="h-16 w-16 rounded-lg object-contain"
            onError={(e) => (e.currentTarget.src = FALLBACK_PARTY)}
          />
          <div>
            <div className="text-2xl font-extrabold text-slate-900">
              {party?.name}
            </div>
            <div className="text-slate-600">{party?.count} politician(s)</div>
          </div>
        </div>

        <div className="px-6 pb-6">
          <div className="text-lg font-bold text-slate-900 mb-3">
            Politicians
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {politicians.map((p) => (
              <PoliticianCard key={p._id} p={p} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
