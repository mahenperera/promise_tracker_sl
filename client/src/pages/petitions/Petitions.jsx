import React, { useEffect, useMemo, useState } from "react";
import PetitionCard from "../../components/cards/PetitionCard.jsx";
import {
  createPetition,
  fetchPublicPetitions,
} from "../../api/petitions-api.js";

const initialForm = {
  title: "",
  addressedTo: "",
  subjectLine: "",
  issueDescription: "",
  requestedAction: "",
  evidenceSummary: "",
  deadline: "",
  declarationAccepted: false,
  attachments: [""],
};

function isValidUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function AttachmentPreview({ url, onRemove }) {
  const [broken, setBroken] = useState(false);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="aspect-[4/3] bg-slate-100">
        {!broken ? (
          <img
            src={url}
            alt="Attachment preview"
            className="h-full w-full object-cover"
            onError={() => setBroken(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm text-slate-500">
            Preview unavailable
          </div>
        )}
      </div>

      <div className="border-t border-slate-200 p-3">
        <div className="line-clamp-2 break-all text-xs text-slate-500">
          {url}
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="mt-3 inline-flex h-9 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-3 text-sm font-semibold text-rose-700 hover:bg-rose-100"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

function CreatePetitionModal({
  open,
  onClose,
  form,
  setForm,
  onSubmit,
  submitting,
  submitError,
}) {
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e) => {
      if (e.key === "Escape" && !submitting) onClose();
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose, submitting]);

  useEffect(() => {
    if (open) setTouched({});
  }, [open]);

  if (!open) return null;

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const setAttachmentAt = (index, value) => {
    setForm((prev) => {
      const next = [...prev.attachments];
      next[index] = value;
      return { ...prev, attachments: next };
    });
  };

  const addAttachmentField = () => {
    setForm((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ""],
    }));
  };

  const removeAttachmentField = (index) => {
    setForm((prev) => {
      const next = prev.attachments.filter((_, i) => i !== index);
      return {
        ...prev,
        attachments: next.length ? next : [""],
      };
    });
  };

  const cleanAttachmentUrls = form.attachments
    .map((item) => item.trim())
    .filter(Boolean);

  const invalidAttachmentUrls = cleanAttachmentUrls.filter(
    (url) => !isValidUrl(url),
  );

  const errors = {
    title: !form.title.trim()
      ? "Petition title is required."
      : form.title.trim().length < 8
        ? "Please write a more descriptive title."
        : "",
    addressedTo: !form.addressedTo.trim()
      ? "Please say who this petition is addressed to."
      : "",
    issueDescription: !form.issueDescription.trim()
      ? "Please describe the issue clearly."
      : form.issueDescription.trim().length < 30
        ? "Please give a little more detail about the issue."
        : "",
    requestedAction: !form.requestedAction.trim()
      ? "Please explain what action should be taken."
      : form.requestedAction.trim().length < 12
        ? "Requested action is too short."
        : "",
    deadline: "",
    declarationAccepted: !form.declarationAccepted
      ? "You must confirm the declaration before submitting."
      : "",
    attachments:
      invalidAttachmentUrls.length > 0
        ? "One or more attachment URLs are invalid."
        : "",
  };

  if (form.deadline) {
    const picked = new Date(form.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (picked < today) {
      errors.deadline = "Deadline cannot be in the past.";
    }
  }

  const showError = (field) => touched[field] && errors[field];

  const markTouched = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !submitting) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-[2px]"
      onMouseDown={handleOverlayClick}
    >
      <div className="w-full max-w-5xl overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-2xl">
        <div className="border-b border-slate-200 bg-white px-6 py-5 sm:px-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                Citizen petition form
              </div>
              <h2 className="mt-3 text-2xl font-extrabold text-slate-900 sm:text-3xl">
                Create a petition
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
                Write a clear, respectful petition for real public action. You
                can also add Cloudinary image URLs as supporting evidence.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-60"
            >
              ×
            </button>
          </div>
        </div>

        <div className="max-h-[78vh] overflow-y-auto px-6 py-6 sm:px-7">
          <div className="mb-6 rounded-2xl border border-sky-200 bg-sky-50 p-4">
            <div className="text-sm font-bold text-sky-900">
              Tips for a strong petition
            </div>
            <div className="mt-2 text-sm leading-relaxed text-sky-800">
              Be specific about the problem, explain why it matters, and clearly
              state what action should be taken. Evidence links can help admin
              review your petition faster.
            </div>
          </div>

          {submitError ? (
            <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
              {submitError}
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800">
                  Petition title *
                </label>
                <input
                  value={form.title}
                  onChange={(e) => setField("title", e.target.value)}
                  onBlur={() => markTouched("title")}
                  maxLength={120}
                  placeholder="e.g. Improve garbage collection in Wellawatte"
                  className={`h-12 w-full rounded-2xl border bg-white px-4 text-sm outline-none focus:ring-2 ${
                    showError("title")
                      ? "border-rose-300 focus:ring-rose-100"
                      : "border-slate-200 focus:ring-slate-200"
                  }`}
                />
                <div className="mt-2 flex items-center justify-between">
                  <div className="text-xs text-rose-600">
                    {showError("title") || ""}
                  </div>
                  <div className="text-xs text-slate-400">
                    {form.title.length}/120
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800">
                  Addressed to *
                </label>
                <input
                  value={form.addressedTo}
                  onChange={(e) => setField("addressedTo", e.target.value)}
                  onBlur={() => markTouched("addressedTo")}
                  maxLength={120}
                  placeholder="e.g. Colombo Municipal Council"
                  className={`h-12 w-full rounded-2xl border bg-white px-4 text-sm outline-none focus:ring-2 ${
                    showError("addressedTo")
                      ? "border-rose-300 focus:ring-rose-100"
                      : "border-slate-200 focus:ring-slate-200"
                  }`}
                />
                <div className="mt-2 text-xs text-rose-600">
                  {showError("addressedTo") || ""}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-[1fr_220px]">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800">
                  Subject line
                </label>
                <input
                  value={form.subjectLine}
                  onChange={(e) => setField("subjectLine", e.target.value)}
                  maxLength={120}
                  placeholder="e.g. Irregular waste collection"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-slate-200"
                />
                <div className="mt-2 text-xs text-slate-500">
                  Optional short topic for the petition.
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800">
                  Deadline
                </label>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => setField("deadline", e.target.value)}
                  onBlur={() => markTouched("deadline")}
                  className={`h-12 w-full rounded-2xl border bg-white px-4 text-sm outline-none focus:ring-2 ${
                    showError("deadline")
                      ? "border-rose-300 focus:ring-rose-100"
                      : "border-slate-200 focus:ring-slate-200"
                  }`}
                />
                <div className="mt-2 text-xs text-rose-600">
                  {showError("deadline") || ""}
                </div>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">
                Describe the issue *
              </label>
              <textarea
                rows={6}
                value={form.issueDescription}
                onChange={(e) => setField("issueDescription", e.target.value)}
                onBlur={() => markTouched("issueDescription")}
                maxLength={1200}
                placeholder="Explain what is happening, where it is happening, who is affected, and why this issue matters."
                className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm leading-relaxed outline-none resize-none focus:ring-2 ${
                  showError("issueDescription")
                    ? "border-rose-300 focus:ring-rose-100"
                    : "border-slate-200 focus:ring-slate-200"
                }`}
              />
              <div className="mt-2 flex items-center justify-between">
                <div className="text-xs text-rose-600">
                  {showError("issueDescription") || ""}
                </div>
                <div className="text-xs text-slate-400">
                  {form.issueDescription.length}/1200
                </div>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">
                Requested action *
              </label>
              <textarea
                rows={4}
                value={form.requestedAction}
                onChange={(e) => setField("requestedAction", e.target.value)}
                onBlur={() => markTouched("requestedAction")}
                maxLength={700}
                placeholder="Clearly say what you want the authority or institution to do."
                className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm leading-relaxed outline-none resize-none focus:ring-2 ${
                  showError("requestedAction")
                    ? "border-rose-300 focus:ring-rose-100"
                    : "border-slate-200 focus:ring-slate-200"
                }`}
              />
              <div className="mt-2 flex items-center justify-between">
                <div className="text-xs text-rose-600">
                  {showError("requestedAction") || ""}
                </div>
                <div className="text-xs text-slate-400">
                  {form.requestedAction.length}/700
                </div>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">
                Evidence summary
              </label>
              <textarea
                rows={3}
                value={form.evidenceSummary}
                onChange={(e) => setField("evidenceSummary", e.target.value)}
                maxLength={500}
                placeholder="Optional: mention observations, reports, incidents, or other supporting details."
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-relaxed outline-none resize-none focus:ring-2 focus:ring-slate-200"
              />
              <div className="mt-2 text-xs text-slate-500">
                Optional, but helpful for admin review.
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 sm:p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-sm font-bold text-slate-900">
                    Supporting image URLs
                  </div>
                  <div className="mt-1 text-sm text-slate-600">
                    Paste direct Cloudinary image URLs here. These will be saved
                    in the petition as attachments.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={addAttachmentField}
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                >
                  + Add image URL
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {form.attachments.map((item, index) => (
                  <div key={index} className="flex flex-col gap-3 sm:flex-row">
                    <input
                      value={item}
                      onChange={(e) => setAttachmentAt(index, e.target.value)}
                      onBlur={() => markTouched("attachments")}
                      placeholder="https://res.cloudinary.com/your-cloud/image/upload/..."
                      className="h-12 flex-1 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeAttachmentField(index)}
                      className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-2 text-xs text-rose-600">
                {showError("attachments") || ""}
              </div>

              {cleanAttachmentUrls.length > 0 ? (
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {cleanAttachmentUrls
                    .filter((url) => isValidUrl(url))
                    .map((url, index) => (
                      <AttachmentPreview
                        key={`${url}-${index}`}
                        url={url}
                        onRemove={() => {
                          const firstIndex = form.attachments.findIndex(
                            (item) => item.trim() === url,
                          );
                          if (firstIndex !== -1)
                            removeAttachmentField(firstIndex);
                        }}
                      />
                    ))}
                </div>
              ) : null}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={form.declarationAccepted}
                  onChange={(e) =>
                    setField("declarationAccepted", e.target.checked)
                  }
                  onBlur={() => markTouched("declarationAccepted")}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-300"
                />
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    I confirm that this petition is respectful, truthful, and
                    submitted in good faith.
                  </div>
                  <div className="mt-1 text-sm text-slate-600">
                    I understand that false, abusive, or misleading petitions
                    may be rejected during admin review.
                  </div>
                  <div className="mt-2 text-xs text-rose-600">
                    {showError("declarationAccepted") || ""}
                  </div>
                </div>
              </label>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="h-11 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="h-11 rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit petition"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function Petitions() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [page, setPage] = useState(1);
  const limit = 10;

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const canLoadMore = useMemo(() => {
    if (!meta) return false;
    return meta.page < meta.totalPages;
  }, [meta]);

  const load = async ({ reset } = { reset: false }) => {
    try {
      setError("");
      if (reset) {
        setLoading(true);
        setPage(1);
      } else {
        setLoadingMore(true);
      }

      const nextPage = reset ? 1 : page;
      const res = await fetchPublicPetitions({
        search: debouncedSearch,
        page: nextPage,
        limit,
      });

      setMeta(res.meta);
      if (reset) setItems(res.items);
      else setItems((prev) => [...prev, ...res.items]);
    } catch (e) {
      setError(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    load({ reset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const onLoadMore = async () => {
    if (!canLoadMore || loadingMore) return;

    const next = page + 1;
    setPage(next);

    try {
      setLoadingMore(true);
      const res = await fetchPublicPetitions({
        search: debouncedSearch,
        page: next,
        limit,
      });
      setMeta(res.meta);
      setItems((prev) => [...prev, ...res.items]);
    } catch (e) {
      setError(e?.message || "Failed to load more");
    } finally {
      setLoadingMore(false);
    }
  };

  const openCreateModal = () => {
    setSubmitError("");
    setSuccessMessage("");
    setForm(initialForm);
    setIsCreateOpen(true);
  };

  const closeCreateModal = () => {
    if (submitting) return;
    setIsCreateOpen(false);
  };

  const handleSubmitPetition = async (e) => {
    e.preventDefault();

    const trimmedTitle = form.title.trim();
    const trimmedAddressedTo = form.addressedTo.trim();
    const trimmedIssue = form.issueDescription.trim();
    const trimmedAction = form.requestedAction.trim();
    const cleanedAttachments = form.attachments
      .map((item) => item.trim())
      .filter(Boolean);

    if (
      !trimmedTitle ||
      !trimmedAddressedTo ||
      !trimmedIssue ||
      !trimmedAction ||
      !form.declarationAccepted
    ) {
      setSubmitError(
        "Please complete all required petition details before submitting.",
      );
      return;
    }

    if (trimmedTitle.length < 8) {
      setSubmitError("Please write a more descriptive petition title.");
      return;
    }

    if (trimmedIssue.length < 30) {
      setSubmitError("Please explain the issue with a little more detail.");
      return;
    }

    if (trimmedAction.length < 12) {
      setSubmitError("Please explain the requested action more clearly.");
      return;
    }

    if (form.deadline) {
      const picked = new Date(form.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (picked < today) {
        setSubmitError("Deadline cannot be in the past.");
        return;
      }
    }

    const hasInvalidAttachment = cleanedAttachments.some(
      (url) => !isValidUrl(url),
    );

    if (hasInvalidAttachment) {
      setSubmitError("Please enter only valid attachment URLs.");
      return;
    }

    const body = `Issue:\n${trimmedIssue}\n\nRequested action:\n${trimmedAction}`;

    const payload = {
      title: trimmedTitle,
      addressedTo: trimmedAddressedTo,
      subjectLine: form.subjectLine.trim(),
      body,
      evidenceSummary: form.evidenceSummary.trim(),
      deadline: form.deadline || null,
      declarationAccepted: true,
      attachments: cleanedAttachments,
    };

    try {
      setSubmitting(true);
      setSubmitError("");

      await createPetition(payload);

      setIsCreateOpen(false);
      setForm(initialForm);
      setSuccessMessage(
        "Your petition has been submitted successfully and is now waiting for admin review.",
      );
    } catch (e) {
      setSubmitError(
        e?.message || "Failed to submit petition. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold text-slate-900">Petitions</h1>
          <p className="text-slate-600">
            Browse verified public petitions and sign to support change.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search petitions (title / subject / body)…"
              className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <button
            onClick={openCreateModal}
            className="h-11 px-5 rounded-2xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800"
          >
            Create petition
          </button>

          <button
            onClick={() => setSearch("")}
            className="h-11 px-4 rounded-2xl border border-slate-200 bg-white text-slate-900 text-sm font-semibold hover:bg-slate-50"
          >
            Clear
          </button>
        </div>

        {successMessage ? (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
            {successMessage}
          </div>
        ) : null}

        {error ? (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="mt-8 text-slate-600">Loading petitions…</div>
        ) : (
          <>
            <div className="mt-8 grid grid-cols-1 gap-4">
              {items.map((p) => (
                <PetitionCard key={p._id} p={p} />
              ))}
            </div>

            {items.length === 0 && !error ? (
              <div className="mt-8 text-slate-600">No results found.</div>
            ) : null}

            <div className="mt-8 flex items-center justify-center">
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
      </div>

      <CreatePetitionModal
        open={isCreateOpen}
        onClose={closeCreateModal}
        form={form}
        setForm={setForm}
        onSubmit={handleSubmitPetition}
        submitting={submitting}
        submitError={submitError}
      />
    </>
  );
}
