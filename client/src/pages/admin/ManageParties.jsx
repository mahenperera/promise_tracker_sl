import React, { useEffect, useMemo, useState } from "react";
import {
  adminCreateParty,
  adminDeactivateParty,
  adminListParties,
  adminUpdateParty,
} from "../../api/admin/parties-admin-api.js";

const emptyForm = {
  name: "",
  code: "",
  slug: "",
  logoUrl: "",
  websiteUrl: "",
  description: "",
  isActive: true,
};

function slugify(text = "") {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function ManageParties() {
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
  const [mode, setMode] = useState("create");
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
      const res = await adminListParties({
        search: debounced,
        page: nextPage,
        limit,
        isActive: showInactive ? undefined : true,
      });

      setMeta(res.meta);
      setItems((prev) => (reset ? res.items : [...prev, ...res.items]));
    } catch (e) {
      setError(e?.message || "Failed to load parties");
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
      isActive: typeof p?.isActive === "boolean" ? p.isActive : true,
    });
    setOpen(true);
  };

  const save = async () => {
    setBusy(true);
    setError("");
    try {
      const payload = {
        name: form.name,
        code: (form.code || "").toUpperCase(),
        slug: form.slug || slugify(form.code || form.name),
        logoUrl: form.logoUrl,
        websiteUrl: form.websiteUrl,
        description: form.description,
        isActive: Boolean(form.isActive),
      };

      if (mode === "create") {
        await adminCreateParty(payload);
      } else {
        await adminUpdateParty(form._id, payload);
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
      await adminDeactivateParty(id);
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
      const res = await adminListParties({
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
          Manage Parties
        </h1>
        <p className="text-slate-600">
          Create and edit parties used across the site.
        </p>
      </div>

      <div className="mt-6 flex flex-col lg:flex-row lg:items-center gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name / code…"
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
          + Add party
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
                    <th className="px-4 py-3 font-semibold">Code</th>
                    <th className="px-4 py-3 font-semibold">Name</th>
                    <th className="px-4 py-3 font-semibold">Website</th>
                    <th className="px-4 py-3 font-semibold">Active</th>
                    <th className="px-4 py-3 font-semibold text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((p) => (
                    <tr key={p._id} className="border-t border-slate-200">
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {p.code || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">
                          {p.name || "—"}
                        </div>
                        <div className="text-xs text-slate-500">
                          slug: {p.slug}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {p.websiteUrl ? (
                          <a
                            href={p.websiteUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-slate-900 font-semibold hover:underline"
                          >
                            Open ↗
                          </a>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
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
                        colSpan={5}
                        className="px-4 py-10 text-center text-slate-600"
                      >
                        No parties found.
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
                {mode === "create" ? "Add party" : "Edit party"}
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
                ["name", "Name *"],
                ["code", "Code * (e.g., NPP)"],
                ["slug", "Slug (optional)"],
                ["logoUrl", "Logo URL (optional)"],
                ["websiteUrl", "Website URL (optional)"],
              ].map(([k, label]) => (
                <div
                  key={k}
                  className={k === "websiteUrl" ? "md:col-span-2" : ""}
                >
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
                <div className="text-xs font-semibold text-slate-500">
                  Description
                </div>
                <textarea
                  value={form.description || ""}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={4}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>

              <div className="md:col-span-2 flex items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <input
                    type="checkbox"
                    checked={Boolean(form.isActive)}
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

              <div className="md:col-span-2 text-xs text-slate-500">
                Tip: if you leave slug empty, the UI will auto-slugify from
                code/name.
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
