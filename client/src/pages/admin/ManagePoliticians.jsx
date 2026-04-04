// import React, { useEffect, useMemo, useState } from "react";
// import { useAuth } from "../../context/auth-context";
// import {
//   adminCreatePolitician,
//   adminDeactivatePolitician,
//   adminListPoliticians,
//   adminUpdatePolitician,
// } from "../../api/admin/politicians-admin-api";

// function Modal({ open, title, onClose, children }) {
//   if (!open) return null;
//   return (
//     <div className="fixed inset-0 z-50">
//       <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
//       <div className="absolute inset-0 flex items-center justify-center px-4">
//         <div className="w-full max-w-2xl rounded-3xl bg-white border border-slate-200 shadow-xl overflow-hidden">
//           <div className="p-5 flex items-center justify-between border-b border-slate-200">
//             <div className="font-extrabold text-slate-900">{title}</div>
//             <button
//               onClick={onClose}
//               className="h-9 w-9 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700"
//             >
//               ✕
//             </button>
//           </div>
//           <div className="p-5">{children}</div>
//         </div>
//       </div>
//     </div>
//   );
// }

// const emptyForm = {
//   fullName: "",
//   slug: "",
//   party: "",
//   partyLogoUrl: "",
//   district: "",
//   position: "",
//   photoUrl: "",
//   bio: "",
//   socialLinks: {
//     websiteUrl: "",
//     facebookUrl: "",
//     twitterUrl: "",
//     youtubeUrl: "",
//   },
//   isActive: true,
// };

// export default function ManagePoliticians() {
//   const { token } = useAuth();

//   const [items, setItems] = useState([]);
//   const [meta, setMeta] = useState(null);

//   const [search, setSearch] = useState("");
//   const [filter, setFilter] = useState("all"); // all | active | inactive

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const [modalOpen, setModalOpen] = useState(false);
//   const [editing, setEditing] = useState(null); // politician object or null
//   const [form, setForm] = useState(emptyForm);
//   const [saving, setSaving] = useState(false);

//   const isActiveParam = useMemo(() => {
//     if (filter === "active") return true;
//     if (filter === "inactive") return false;
//     return undefined;
//   }, [filter]);

//   const load = async () => {
//     try {
//       setError("");
//       setLoading(true);
//       const res = await adminListPoliticians(token, {
//         search: search.trim(),
//         page: 1,
//         limit: 30,
//         isActive: isActiveParam,
//       });
//       setItems(res.items || []);
//       setMeta(res.meta || null);
//     } catch (e) {
//       setError(e?.message || "Failed to load politicians");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     load();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [filter]);

//   const openCreate = () => {
//     setEditing(null);
//     setForm(emptyForm);
//     setModalOpen(true);
//   };

//   const openEdit = (p) => {
//     setEditing(p);
//     setForm({
//       fullName: p.fullName || "",
//       slug: p.slug || "",
//       party: p.party || "",
//       partyLogoUrl: p.partyLogoUrl || "",
//       district: p.district || "",
//       position: p.position || "",
//       photoUrl: p.photoUrl || "",
//       bio: p.bio || "",
//       socialLinks: {
//         websiteUrl: p.socialLinks?.websiteUrl || "",
//         facebookUrl: p.socialLinks?.facebookUrl || "",
//         twitterUrl: p.socialLinks?.twitterUrl || "",
//         youtubeUrl: p.socialLinks?.youtubeUrl || "",
//       },
//       isActive: typeof p.isActive === "boolean" ? p.isActive : true,
//     });
//     setModalOpen(true);
//   };

//   const save = async () => {
//     try {
//       setSaving(true);
//       setError("");

//       if (editing?._id) {
//         await adminUpdatePolitician(token, editing._id, form);
//       } else {
//         await adminCreatePolitician(token, form);
//       }

//       setModalOpen(false);
//       await load();
//     } catch (e) {
//       setError(e?.message || "Save failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const deactivate = async (id) => {
//     if (!confirm("Deactivate this politician?")) return;
//     try {
//       setError("");
//       await adminDeactivatePolitician(token, id);
//       await load();
//     } catch (e) {
//       setError(e?.message || "Deactivate failed");
//     }
//   };

//   const activate = async (id) => {
//     try {
//       setError("");
//       await adminUpdatePolitician(token, id, { isActive: true });
//       await load();
//     } catch (e) {
//       setError(e?.message || "Activate failed");
//     }
//   };

//   return (
//     <div>
//       <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
//         <div>
//           <div className="text-2xl font-extrabold text-slate-900">
//             Manage Politicians
//           </div>
//           <div className="text-slate-600">
//             Create, edit, activate/deactivate politician public profiles.
//           </div>
//         </div>

//         <button
//           onClick={openCreate}
//           className="h-11 px-5 rounded-2xl bg-slate-900 text-white font-semibold hover:bg-slate-800"
//         >
//           + Add politician
//         </button>
//       </div>

//       <div className="mt-5 flex flex-col md:flex-row gap-3">
//         <input
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           placeholder="Search name / party / district…"
//           className="h-11 flex-1 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-slate-200"
//         />
//         <button
//           onClick={load}
//           className="h-11 px-4 rounded-2xl border border-slate-200 bg-white text-slate-900 text-sm font-semibold hover:bg-slate-50"
//         >
//           Search
//         </button>

//         <select
//           value={filter}
//           onChange={(e) => setFilter(e.target.value)}
//           className="h-11 px-4 rounded-2xl border border-slate-200 bg-white text-sm"
//         >
//           <option value="all">All</option>
//           <option value="active">Active only</option>
//           <option value="inactive">Inactive only</option>
//         </select>
//       </div>

//       {error ? (
//         <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900">
//           {error}
//         </div>
//       ) : null}

//       <div className="mt-6 rounded-3xl border border-slate-200 bg-white overflow-hidden">
//         <div className="p-4 border-b border-slate-200 font-bold text-slate-900">
//           Politicians {meta ? `(${meta.total})` : ""}
//         </div>

//         {loading ? (
//           <div className="p-4 text-slate-600">Loading…</div>
//         ) : items.length === 0 ? (
//           <div className="p-4 text-slate-600">No records.</div>
//         ) : (
//           <div className="divide-y divide-slate-200">
//             {items.map((p) => (
//               <div
//                 key={p._id}
//                 className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3"
//               >
//                 <div className="min-w-0">
//                   <div className="font-semibold text-slate-900 truncate">
//                     {p.fullName}{" "}
//                     <span className="text-slate-400 font-normal">
//                       ({p.slug})
//                     </span>
//                   </div>
//                   <div className="text-sm text-slate-600 truncate">
//                     {p.position || "—"} • {p.party || "—"} • {p.district || "—"}
//                   </div>
//                   <div className="mt-2">
//                     <span
//                       className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold border ${
//                         p.isActive
//                           ? "bg-emerald-50 text-emerald-700 border-emerald-200"
//                           : "bg-slate-100 text-slate-700 border-slate-200"
//                       }`}
//                     >
//                       {p.isActive ? "Active" : "Inactive"}
//                     </span>
//                   </div>
//                 </div>

//                 <div className="flex items-center gap-2">
//                   <button
//                     onClick={() => openEdit(p)}
//                     className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm font-semibold hover:bg-slate-50"
//                   >
//                     Edit
//                   </button>

//                   {p.isActive ? (
//                     <button
//                       onClick={() => deactivate(p._id)}
//                       className="h-10 px-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-900 text-sm font-semibold hover:bg-rose-100"
//                     >
//                       Deactivate
//                     </button>
//                   ) : (
//                     <button
//                       onClick={() => activate(p._id)}
//                       className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm font-semibold hover:bg-slate-50"
//                     >
//                       Activate
//                     </button>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       <Modal
//         open={modalOpen}
//         title={editing ? "Edit politician" : "Add politician"}
//         onClose={() => setModalOpen(false)}
//       >
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//           <Field
//             label="Full name"
//             value={form.fullName}
//             onChange={(v) => setForm((s) => ({ ...s, fullName: v }))}
//           />
//           <Field
//             label="Slug (optional)"
//             value={form.slug}
//             onChange={(v) => setForm((s) => ({ ...s, slug: v }))}
//           />

//           <Field
//             label="Party"
//             value={form.party}
//             onChange={(v) => setForm((s) => ({ ...s, party: v }))}
//           />
//           <Field
//             label="Party logo URL"
//             value={form.partyLogoUrl}
//             onChange={(v) => setForm((s) => ({ ...s, partyLogoUrl: v }))}
//           />

//           <Field
//             label="District"
//             value={form.district}
//             onChange={(v) => setForm((s) => ({ ...s, district: v }))}
//           />
//           <Field
//             label="Position"
//             value={form.position}
//             onChange={(v) => setForm((s) => ({ ...s, position: v }))}
//           />

//           <Field
//             label="Photo URL"
//             value={form.photoUrl}
//             onChange={(v) => setForm((s) => ({ ...s, photoUrl: v }))}
//           />
//           <Field
//             label="Bio"
//             value={form.bio}
//             onChange={(v) => setForm((s) => ({ ...s, bio: v }))}
//           />

//           <Field
//             label="Website"
//             value={form.socialLinks.websiteUrl}
//             onChange={(v) =>
//               setForm((s) => ({
//                 ...s,
//                 socialLinks: { ...s.socialLinks, websiteUrl: v },
//               }))
//             }
//           />
//           <Field
//             label="Facebook"
//             value={form.socialLinks.facebookUrl}
//             onChange={(v) =>
//               setForm((s) => ({
//                 ...s,
//                 socialLinks: { ...s.socialLinks, facebookUrl: v },
//               }))
//             }
//           />
//           <Field
//             label="X / Twitter"
//             value={form.socialLinks.twitterUrl}
//             onChange={(v) =>
//               setForm((s) => ({
//                 ...s,
//                 socialLinks: { ...s.socialLinks, twitterUrl: v },
//               }))
//             }
//           />
//           <Field
//             label="YouTube"
//             value={form.socialLinks.youtubeUrl}
//             onChange={(v) =>
//               setForm((s) => ({
//                 ...s,
//                 socialLinks: { ...s.socialLinks, youtubeUrl: v },
//               }))
//             }
//           />
//         </div>

//         <div className="mt-4 flex items-center justify-between">
//           <label className="flex items-center gap-2 text-sm text-slate-700">
//             <input
//               type="checkbox"
//               checked={!!form.isActive}
//               onChange={(e) =>
//                 setForm((s) => ({ ...s, isActive: e.target.checked }))
//               }
//             />
//             Active
//           </label>

//           <div className="flex gap-2">
//             <button
//               onClick={() => setModalOpen(false)}
//               className="h-11 px-5 rounded-2xl border border-slate-200 bg-white text-slate-900 font-semibold hover:bg-slate-50"
//             >
//               Cancel
//             </button>
//             <button
//               disabled={saving}
//               onClick={save}
//               className="h-11 px-5 rounded-2xl bg-slate-900 text-white font-semibold hover:bg-slate-800 disabled:opacity-60"
//             >
//               {saving ? "Saving…" : "Save"}
//             </button>
//           </div>
//         </div>
//       </Modal>
//     </div>
//   );
// }

// function Field({ label, value, onChange }) {
//   return (
//     <div>
//       <div className="text-xs font-semibold text-slate-600">{label}</div>
//       <input
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         className="mt-1 w-full h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-slate-200"
//       />
//     </div>
//   );
// }

import React, { useEffect, useMemo, useState } from "react";
import {
  adminCreatePolitician,
  adminDeactivatePolitician,
  adminListPoliticians,
  adminUpdatePolitician,
} from "../../api/admin/politicians-admin-api.js";

const emptyForm = {
  fullName: "",
  slug: "",
  party: "",
  partyLogoUrl: "",
  district: "",
  position: "",
  photoUrl: "",
  bio: "",
  socialLinks: {
    websiteUrl: "",
    facebookUrl: "",
    twitterUrl: "",
    youtubeUrl: "",
  },
  isActive: true,
};

function toBool(v) {
  return v === true || v === "true";
}

export default function ManagePoliticians() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);

  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [showInactive, setShowInactive] = useState(false);

  const [page, setPage] = useState(1);
  const limit = 12;

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("create"); // create | edit
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const canLoadMore = useMemo(() => {
    if (!meta) return false;
    return meta.page < meta.totalPages;
  }, [meta]);

  const load = async ({ reset } = { reset: false }) => {
    setError("");
    try {
      if (reset) {
        setLoading(true);
        setPage(1);
      } else {
        setLoadingMore(true);
      }

      const nextPage = reset ? 1 : page;

      const res = await adminListPoliticians({
        search: debounced,
        page: nextPage,
        limit,
        isActive: showInactive ? undefined : true,
      });

      setMeta(res.meta);
      setItems((prev) => (reset ? res.items : [...prev, ...res.items]));
    } catch (e) {
      setError(e?.message || "Failed to load politicians");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    load({ reset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced, showInactive]);

  const openCreate = () => {
    setMode("create");
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (p) => {
    setMode("edit");
    setForm({
      ...emptyForm,
      ...p,
      socialLinks: {
        ...emptyForm.socialLinks,
        ...(p?.socialLinks || {}),
      },
      isActive: typeof p?.isActive === "boolean" ? p.isActive : true,
    });
    setOpen(true);
  };

  const save = async () => {
    setBusy(true);
    setError("");
    try {
      const payload = {
        fullName: form.fullName,
        slug: form.slug,
        party: form.party,
        partyLogoUrl: form.partyLogoUrl,
        district: form.district,
        position: form.position,
        photoUrl: form.photoUrl,
        bio: form.bio,
        socialLinks: form.socialLinks,
        isActive: toBool(form.isActive),
      };

      if (mode === "create") {
        await adminCreatePolitician(payload);
      } else {
        await adminUpdatePolitician(form._id, payload);
      }

      setOpen(false);
      await load({ reset: true });
    } catch (e) {
      setError(e?.message || "Save failed");
    } finally {
      setBusy(false);
    }
  };

  const deactivate = async (id) => {
    if (!id) return;
    setBusy(true);
    setError("");
    try {
      await adminDeactivatePolitician(id);
      await load({ reset: true });
    } catch (e) {
      setError(e?.message || "Deactivate failed");
    } finally {
      setBusy(false);
    }
  };

  const onLoadMore = async () => {
    if (!canLoadMore || loadingMore) return;
    const next = page + 1;
    setPage(next);
    try {
      setLoadingMore(true);
      const res = await adminListPoliticians({
        search: debounced,
        page: next,
        limit,
        isActive: showInactive ? undefined : true,
      });
      setMeta(res.meta);
      setItems((prev) => [...prev, ...res.items]);
    } catch (e) {
      setError(e?.message || "Failed to load more");
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-slate-900">
          Manage Politicians
        </h1>
        <p className="text-slate-600">
          Create, edit, and deactivate politician profiles.
        </p>
      </div>

      <div className="mt-6 flex flex-col lg:flex-row lg:items-center gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name / party / district…"
          className="w-full lg:flex-1 h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-slate-200"
        />

        <label className="h-11 px-4 rounded-2xl border border-slate-200 bg-white flex items-center gap-2 text-sm font-semibold text-slate-900">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
          />
          Show inactive too
        </label>

        <button
          onClick={openCreate}
          className="h-11 px-4 rounded-2xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800"
        >
          + Add politician
        </button>
      </div>

      {error ? (
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="mt-8 text-slate-600">Loading…</div>
      ) : (
        <>
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50">
                  <tr className="text-left text-slate-600">
                    <th className="px-4 py-3 font-semibold">Name</th>
                    <th className="px-4 py-3 font-semibold">Party</th>
                    <th className="px-4 py-3 font-semibold">Position</th>
                    <th className="px-4 py-3 font-semibold">District</th>
                    <th className="px-4 py-3 font-semibold">Active</th>
                    <th className="px-4 py-3 font-semibold text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((p) => (
                    <tr key={p._id} className="border-t border-slate-200">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">
                          {p.fullName}
                        </div>
                        <div className="text-xs text-slate-500">
                          slug: {p.slug}
                        </div>
                      </td>
                      <td className="px-4 py-3">{p.party || "—"}</td>
                      <td className="px-4 py-3">{p.position || "—"}</td>
                      <td className="px-4 py-3">{p.district || "—"}</td>
                      <td className="px-4 py-3">{p.isActive ? "Yes" : "No"}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEdit(p)}
                            className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-900 font-semibold hover:bg-slate-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deactivate(p._id)}
                            disabled={busy}
                            className="h-9 px-3 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-700 disabled:opacity-60"
                          >
                            Deactivate
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {items.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-10 text-center text-slate-600"
                      >
                        No politicians found.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center">
            {canLoadMore ? (
              <button
                onClick={onLoadMore}
                disabled={loadingMore}
                className="h-11 px-5 rounded-2xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-60"
              >
                {loadingMore ? "Loading…" : "Load more"}
              </button>
            ) : meta ? (
              <div className="text-sm text-slate-500">
                Showing {items.length} of {meta.total}
              </div>
            ) : null}
          </div>
        </>
      )}

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-3xl rounded-3xl bg-white shadow-xl overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div className="text-lg font-extrabold text-slate-900">
                {mode === "create" ? "Add politician" : "Edit politician"}
              </div>
              <button
                onClick={() => setOpen(false)}
                className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-slate-900 font-semibold hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                ["fullName", "Full name *"],
                ["slug", "Slug (optional)"],
                ["party", "Party *"],
                ["partyLogoUrl", "Party logo URL (optional)"],
                ["district", "District *"],
                ["position", "Position *"],
                ["photoUrl", "Photo URL (optional)"],
              ].map(([k, label]) => (
                <div key={k}>
                  <div className="text-xs font-semibold text-slate-500">
                    {label}
                  </div>
                  <input
                    value={form[k] || ""}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, [k]: e.target.value }))
                    }
                    className="mt-2 w-full h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-slate-200"
                  />
                </div>
              ))}

              <div className="md:col-span-2">
                <div className="text-xs font-semibold text-slate-500">Bio</div>
                <textarea
                  value={form.bio || ""}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  rows={4}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>

              <div className="md:col-span-2">
                <div className="text-sm font-extrabold text-slate-900">
                  Social links (optional)
                </div>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    ["websiteUrl", "Website URL"],
                    ["facebookUrl", "Facebook URL"],
                    ["twitterUrl", "X / Twitter URL"],
                    ["youtubeUrl", "YouTube URL"],
                  ].map(([k, label]) => (
                    <div key={k}>
                      <div className="text-xs font-semibold text-slate-500">
                        {label}
                      </div>
                      <input
                        value={form.socialLinks?.[k] || ""}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            socialLinks: {
                              ...(prev.socialLinks || {}),
                              [k]: e.target.value,
                            },
                          }))
                        }
                        className="mt-2 w-full h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-slate-200"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2 flex items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <input
                    type="checkbox"
                    checked={toBool(form.isActive)}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        isActive: e.target.checked,
                      }))
                    }
                  />
                  Active
                </label>

                <button
                  onClick={save}
                  disabled={busy}
                  className="h-11 px-5 rounded-2xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-60"
                >
                  {busy ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
