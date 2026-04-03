// import React, { useEffect, useMemo, useState } from "react";
// import PartyCard from "../../components/cards/PartyCard.jsx";
// import { fetchPoliticians } from "../../api/politicians-api.js";

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
//   // server enforces max 50 limit (your backend safeLimit)
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

// export default function Parties() {
//   const [q, setQ] = useState("");
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
//         setErr(e?.message || "Failed to load parties");
//       } finally {
//         if (!alive) return;
//         setLoading(false);
//       }
//     })();
//     return () => {
//       alive = false;
//     };
//   }, []);

//   const parties = useMemo(() => {
//     const map = new Map();

//     for (const p of politicians) {
//       const nameRaw = (p.party || "").trim();
//       const name = nameRaw ? nameRaw : "Independent";
//       const key = name.toLowerCase();

//       if (!map.has(key)) {
//         map.set(key, {
//           name,
//           slug: slugify(name),
//           count: 0,
//           logoUrl: "",
//           sample: [],
//         });
//       }

//       const entry = map.get(key);
//       entry.count += 1;

//       // pick first available partyLogoUrl from any politician in that party
//       if (!entry.logoUrl && p.partyLogoUrl && p.partyLogoUrl.trim()) {
//         entry.logoUrl = p.partyLogoUrl.trim();
//       }

//       if (entry.sample.length < 3) {
//         entry.sample.push(p.fullName);
//       }
//     }

//     let arr = Array.from(map.values()).sort((a, b) =>
//       a.name.localeCompare(b.name),
//     );

//     const term = q.trim().toLowerCase();
//     if (term) {
//       arr = arr.filter((x) => x.name.toLowerCase().includes(term));
//     }

//     return arr;
//   }, [politicians, q]);

//   return (
//     <div className="mx-auto max-w-6xl px-4 py-10">
//       <div className="text-3xl font-extrabold text-slate-900">Parties</div>
//       <div className="mt-2 text-slate-600">
//         Browse political parties and view their politicians.
//       </div>

//       <div className="mt-6 flex items-center gap-3">
//         <input
//           value={q}
//           onChange={(e) => setQ(e.target.value)}
//           placeholder="Search party name..."
//           className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-slate-200"
//         />
//         <button
//           onClick={() => setQ("")}
//           className="h-12 px-5 rounded-2xl border border-slate-200 bg-white text-sm font-semibold hover:bg-slate-50"
//         >
//           Clear
//         </button>
//       </div>

//       {loading && (
//         <div className="mt-6 text-sm text-slate-600">Loading parties…</div>
//       )}

//       {!loading && err && (
//         <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
//           {err}
//         </div>
//       )}

//       {!loading && !err && (
//         <>
//           <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
//             {parties.map((party) => (
//               <PartyCard key={party.slug} party={party} />
//             ))}
//           </div>

//           <div className="mt-8 text-center text-sm text-slate-500">
//             Showing {parties.length} parties
//           </div>
//         </>
//       )}
//     </div>
//   );
// }

import React, { useEffect, useMemo, useState } from "react";
import PartyCard from "../../components/cards/PartyCard.jsx";
import { fetchParties } from "../../api/parties-api.js";

export default function Parties() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setError("");
        setLoading(true);
        const res = await fetchParties();
        setItems(res.items || []);
      } catch (e) {
        setError(e?.message || "Failed to load parties");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return items;
    return items.filter((p) => p.name.toLowerCase().includes(s));
  }, [items, search]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-slate-900">Parties</h1>
        <p className="text-slate-600">
          Browse parties and view their politicians.
        </p>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search party name…"
            className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <button
          onClick={() => setSearch("")}
          className="h-11 px-4 rounded-2xl border border-slate-200 bg-white text-slate-900 text-sm font-semibold hover:bg-slate-50"
        >
          Clear
        </button>
      </div>

      {error ? (
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="mt-8 text-slate-600">Loading parties…</div>
      ) : (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((p) => (
            <PartyCard key={p.slug} party={p} />
          ))}
          {filtered.length === 0 ? (
            <div className="text-slate-600">No parties found.</div>
          ) : null}
        </div>
      )}
    </div>
  );
}
