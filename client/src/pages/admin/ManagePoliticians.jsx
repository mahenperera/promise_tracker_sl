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

function isValidOptionalUrl(value) {
  const v = String(value || "").trim();
  if (!v) return true;
  try {
    new URL(v);
    return true;
  } catch {
    return false;
  }
}

function normalizeFormData(form) {
  return {
    ...form,
    fullName: String(form.fullName || "").trim(),
    slug: String(form.slug || "").trim(),
    party: String(form.party || "").trim(),
    partyLogoUrl: String(form.partyLogoUrl || "").trim(),
    district: String(form.district || "").trim(),
    position: String(form.position || "").trim(),
    photoUrl: String(form.photoUrl || "").trim(),
    bio: String(form.bio || "").trim(),
    socialLinks: {
      websiteUrl: String(form.socialLinks?.websiteUrl || "").trim(),
      facebookUrl: String(form.socialLinks?.facebookUrl || "").trim(),
      twitterUrl: String(form.socialLinks?.twitterUrl || "").trim(),
      youtubeUrl: String(form.socialLinks?.youtubeUrl || "").trim(),
    },
    isActive: toBool(form.isActive),
  };
}

function buildErrors(form) {
  const errors = {};
  const data = normalizeFormData(form);

  if (!data.fullName) errors.fullName = "Full name is required.";
  if (!data.party) errors.party = "Party is required.";
  if (!data.district) errors.district = "District is required.";
  if (!data.position) errors.position = "Position is required.";

  if (form.slug !== undefined && form.slug !== "" && !data.slug) {
    errors.slug = "Slug cannot be empty if provided.";
  }

  if (!isValidOptionalUrl(data.photoUrl)) {
    errors.photoUrl = "Photo URL must be a valid URL.";
  }

  if (!isValidOptionalUrl(data.partyLogoUrl)) {
    errors.partyLogoUrl = "Party logo URL must be a valid URL.";
  }

  if (!isValidOptionalUrl(data.socialLinks.websiteUrl)) {
    errors.websiteUrl = "Website URL must be a valid URL.";
  }

  if (!isValidOptionalUrl(data.socialLinks.facebookUrl)) {
    errors.facebookUrl = "Facebook URL must be a valid URL.";
  }

  if (!isValidOptionalUrl(data.socialLinks.twitterUrl)) {
    errors.twitterUrl = "X / Twitter URL must be a valid URL.";
  }

  if (!isValidOptionalUrl(data.socialLinks.youtubeUrl)) {
    errors.youtubeUrl = "YouTube URL must be a valid URL.";
  }

  return errors;
}

function safeImage(value) {
  const v = String(value || "").trim();
  return v || "";
}

function PreviewCard({ title, url, fallbackText }) {
  const [broken, setBroken] = useState(false);

  if (!url) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="text-xs font-semibold text-slate-500">{title}</div>
        <div className="mt-2 text-sm text-slate-500">{fallbackText}</div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-3">
        <div className="text-xs font-semibold text-slate-500">{title}</div>
      </div>

      <div className="flex h-40 items-center justify-center bg-slate-100">
        {!broken ? (
          <img
            src={url}
            alt={title}
            className="h-full w-full object-contain"
            onError={() => setBroken(true)}
          />
        ) : (
          <div className="px-4 text-center text-sm text-slate-500">
            Preview unavailable
          </div>
        )}
      </div>

      <div className="px-4 py-3">
        <div className="truncate text-xs text-slate-500">{url}</div>
      </div>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder = "",
  error = "",
  required = false,
}) {
  return (
    <div>
      <div className="text-xs font-semibold text-slate-500">
        {label} {required ? <span className="text-rose-500">*</span> : null}
      </div>
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`mt-2 h-11 w-full rounded-2xl border bg-white px-4 text-sm outline-none focus:ring-2 ${
          error
            ? "border-rose-300 focus:ring-rose-100"
            : "border-slate-200 focus:ring-slate-200"
        }`}
      />
      {error ? <div className="mt-2 text-xs text-rose-600">{error}</div> : null}
    </div>
  );
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
  const [pageError, setPageError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("create");
  const [form, setForm] = useState(emptyForm);
  const [modalError, setModalError] = useState("");
  const [touched, setTouched] = useState({});
  const [saving, setSaving] = useState(false);
  const [deactivatingId, setDeactivatingId] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    if (!open) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e) => {
      if (e.key === "Escape" && !saving) {
        closeModal();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, saving]);

  const errors = useMemo(() => buildErrors(form), [form]);

  const canLoadMore = useMemo(() => {
    if (!meta) return false;
    return meta.page < meta.totalPages;
  }, [meta]);

  const load = async ({ reset } = { reset: false }) => {
    setPageError("");

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
      setPageError(e?.message || "Failed to load politicians");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    load({ reset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced, showInactive]);

  const resetModalState = () => {
    setModalError("");
    setTouched({});
  };

  const openCreate = () => {
    setMode("create");
    setForm(emptyForm);
    resetModalState();
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
    resetModalState();
    setOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setOpen(false);
    setForm(emptyForm);
    resetModalState();
  };

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const setSocialField = (key, value) => {
    setForm((prev) => ({
      ...prev,
      socialLinks: {
        ...(prev.socialLinks || {}),
        [key]: value,
      },
    }));
  };

  const touch = (key) => {
    setTouched((prev) => ({ ...prev, [key]: true }));
  };

  const showFieldError = (key) => touched[key] && errors[key];

  const save = async () => {
    const nextTouched = {
      fullName: true,
      slug: true,
      party: true,
      district: true,
      position: true,
      photoUrl: true,
      partyLogoUrl: true,
      websiteUrl: true,
      facebookUrl: true,
      twitterUrl: true,
      youtubeUrl: true,
    };

    setTouched(nextTouched);
    setModalError("");
    setSuccessMessage("");

    if (Object.keys(errors).length > 0) {
      setModalError("Please fix the highlighted fields before saving.");
      return;
    }

    const payload = normalizeFormData(form);

    try {
      setSaving(true);

      if (mode === "create") {
        await adminCreatePolitician(payload);
        setSuccessMessage("Politician created successfully.");
      } else {
        await adminUpdatePolitician(form._id, payload);
        setSuccessMessage("Politician updated successfully.");
      }

      setOpen(false);
      setForm(emptyForm);
      resetModalState();
      await load({ reset: true });
    } catch (e) {
      setModalError(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const deactivate = async (id) => {
    if (!id) return;

    try {
      setDeactivatingId(id);
      setPageError("");
      setSuccessMessage("");

      await adminDeactivatePolitician(id);
      setSuccessMessage("Politician deactivated successfully.");
      await load({ reset: true });
    } catch (e) {
      setPageError(e?.message || "Deactivate failed");
    } finally {
      setDeactivatingId("");
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
      setPageError(e?.message || "Failed to load more");
    } finally {
      setLoadingMore(false);
    }
  };

  const photoPreview = safeImage(form.photoUrl);
  const logoPreview = safeImage(form.partyLogoUrl);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
          Manage Politicians
        </h1>
        <p className="text-slate-600">
          Create, edit, and deactivate politician profiles.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 xl:flex-row xl:items-center">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name / party / district…"
          className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-slate-200 xl:flex-1"
        />

        <div className="flex flex-col gap-3 sm:flex-row xl:items-center">
          <label className="flex h-11 w-full items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 sm:w-auto">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
            />
            Show inactive too
          </label>

          <button
            onClick={openCreate}
            className="h-11 w-full rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800 sm:w-auto"
          >
            + Add politician
          </button>
        </div>
      </div>

      {successMessage ? (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
          {successMessage}
        </div>
      ) : null}

      {pageError ? (
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900">
          {pageError}
        </div>
      ) : null}

      {loading ? (
        <div className="mt-8 text-slate-600">Loading…</div>
      ) : (
        <>
          <div className="mt-8 space-y-3 md:hidden">
            {items.map((p) => (
              <div
                key={p._id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="font-semibold text-slate-900">{p.fullName}</div>
                <div className="mt-1 text-xs text-slate-500">
                  slug: {p.slug}
                </div>
                <div className="mt-3 space-y-1 text-sm text-slate-600">
                  <div>Party: {p.party || "—"}</div>
                  <div>Position: {p.position || "—"}</div>
                  <div>District: {p.district || "—"}</div>
                  <div>Active: {p.isActive ? "Yes" : "No"}</div>
                </div>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <button
                    onClick={() => openEdit(p)}
                    className="h-10 rounded-xl border border-slate-200 bg-white px-3 font-semibold text-slate-900 hover:bg-slate-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deactivate(p._id)}
                    disabled={deactivatingId === p._id}
                    className="h-10 rounded-xl bg-rose-600 px-3 font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
                  >
                    {deactivatingId === p._id ? "Deactivating…" : "Deactivate"}
                  </button>
                </div>
              </div>
            ))}

            {items.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-10 text-center text-slate-600">
                No politicians found.
              </div>
            ) : null}
          </div>

          <div className="mt-8 hidden overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50">
                  <tr className="text-left text-slate-600">
                    <th className="px-4 py-3 font-semibold">Name</th>
                    <th className="px-4 py-3 font-semibold">Party</th>
                    <th className="px-4 py-3 font-semibold">Position</th>
                    <th className="px-4 py-3 font-semibold">District</th>
                    <th className="px-4 py-3 font-semibold">Active</th>
                    <th className="px-4 py-3 text-right font-semibold">
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
                            className="h-9 rounded-xl border border-slate-200 bg-white px-3 font-semibold text-slate-900 hover:bg-slate-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deactivate(p._id)}
                            disabled={deactivatingId === p._id}
                            className="h-9 rounded-xl bg-rose-600 px-3 font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
                          >
                            {deactivatingId === p._id
                              ? "Deactivating…"
                              : "Deactivate"}
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
                className="h-11 rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-3 sm:p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-[30px] bg-white shadow-2xl">
            <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
              <div>
                <div className="text-lg font-extrabold text-slate-900">
                  {mode === "create" ? "Add politician" : "Edit politician"}
                </div>
                <div className="mt-1 text-sm text-slate-600">
                  Fill the profile details clearly and use valid public URLs for
                  images and social links.
                </div>
              </div>

              <button
                onClick={closeModal}
                disabled={saving}
                className="h-10 rounded-xl border border-slate-200 bg-white px-4 font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-60"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
              {modalError ? (
                <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900">
                  {modalError}
                </div>
              ) : null}

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                      <TextField
                        label="Full name"
                        required
                        value={form.fullName}
                        onChange={(e) => setField("fullName", e.target.value)}
                        error={showFieldError("fullName")}
                      />
                    </div>

                    <TextField
                      label="Slug"
                      value={form.slug}
                      onChange={(e) => setField("slug", e.target.value)}
                      error={showFieldError("slug")}
                      placeholder="optional custom slug"
                    />

                    <TextField
                      label="Party"
                      required
                      value={form.party}
                      onChange={(e) => setField("party", e.target.value)}
                      error={showFieldError("party")}
                    />

                    <TextField
                      label="District"
                      required
                      value={form.district}
                      onChange={(e) => setField("district", e.target.value)}
                      error={showFieldError("district")}
                    />

                    <TextField
                      label="Position"
                      required
                      value={form.position}
                      onChange={(e) => setField("position", e.target.value)}
                      error={showFieldError("position")}
                    />

                    <div className="lg:col-span-2">
                      <TextField
                        label="Party logo URL"
                        value={form.partyLogoUrl}
                        onChange={(e) =>
                          setField("partyLogoUrl", e.target.value)
                        }
                        error={showFieldError("partyLogoUrl")}
                        placeholder="https://..."
                      />
                    </div>

                    <TextField
                      label="Photo URL"
                      value={form.photoUrl}
                      onChange={(e) => setField("photoUrl", e.target.value)}
                      error={showFieldError("photoUrl")}
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-slate-500">
                      Bio
                    </div>
                    <textarea
                      value={form.bio || ""}
                      onChange={(e) => setField("bio", e.target.value)}
                      rows={7}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-200"
                    />
                  </div>

                  <div>
                    <div className="text-sm font-extrabold text-slate-900">
                      Social links
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                      <TextField
                        label="Website URL"
                        value={form.socialLinks?.websiteUrl || ""}
                        onChange={(e) =>
                          setSocialField("websiteUrl", e.target.value)
                        }
                        error={showFieldError("websiteUrl")}
                        placeholder="https://example.com"
                      />

                      <TextField
                        label="Facebook URL"
                        value={form.socialLinks?.facebookUrl || ""}
                        onChange={(e) =>
                          setSocialField("facebookUrl", e.target.value)
                        }
                        error={showFieldError("facebookUrl")}
                        placeholder="https://facebook.com/..."
                      />

                      <TextField
                        label="X / Twitter URL"
                        value={form.socialLinks?.twitterUrl || ""}
                        onChange={(e) =>
                          setSocialField("twitterUrl", e.target.value)
                        }
                        error={showFieldError("twitterUrl")}
                        placeholder="https://x.com/..."
                      />

                      <TextField
                        label="YouTube URL"
                        value={form.socialLinks?.youtubeUrl || ""}
                        onChange={(e) =>
                          setSocialField("youtubeUrl", e.target.value)
                        }
                        error={showFieldError("youtubeUrl")}
                        placeholder="https://youtube.com/..."
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <PreviewCard
                    title="Photo preview"
                    url={photoPreview}
                    fallbackText="Add a valid photo URL to preview the politician image."
                  />

                  <PreviewCard
                    title="Party logo preview"
                    url={logoPreview}
                    fallbackText="Add a valid party logo URL to preview it here."
                  />

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <label className="flex items-center gap-3 text-sm font-semibold text-slate-900">
                      <input
                        type="checkbox"
                        checked={toBool(form.isActive)}
                        onChange={(e) => setField("isActive", e.target.checked)}
                      />
                      Active
                    </label>
                    <div className="mt-2 text-xs leading-relaxed text-slate-500">
                      Deactivated politicians stay in the database but are
                      hidden from the public list unless you explicitly include
                      inactive records.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 bg-white px-4 py-4 sm:px-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                <button
                  onClick={closeModal}
                  disabled={saving}
                  className="h-11 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  onClick={save}
                  disabled={saving}
                  className="h-11 rounded-2xl bg-slate-900 px-6 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
