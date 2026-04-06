import React from "react";

function formatDate(v) {
  const t = Date.parse(v);
  if (!t) return "";
  return new Date(t).toLocaleString();
}

function shortText(s, max) {
  const text = (s || "").toString().replace(/\s+/g, " ").trim();
  if (!text) return "";
  return text.length > max ? text.slice(0, max - 1) + "…" : text;
}

export default function NewsCard({ item }) {
  const { title, url, image, source, publishedAt, summary } = item || {};
  const t = shortText(title, 95) || "Untitled";
  const desc = shortText(summary, 190) || "Open the article to read more.";

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-300 bg-slate-50 shadow-md transition hover:-translate-y-0.5 hover:shadow-xl">
      {/* Image */}
      <a href={url} target="_blank" rel="noopener noreferrer" className="block">
        <div className="aspect-video w-full bg-slate-200">
          {image ? (
            <img
              src={image}
              alt={t}
              className="h-full w-full object-cover"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-slate-600">
              No image
            </div>
          )}
        </div>
      </a>

      {/* Body (tinted surface so it’s not pure white) */}
      <div className="flex flex-1 flex-col bg-slate-50/70 p-4">
        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-slate-600">
          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 font-semibold">
            {source || "Source"}
          </span>
          {publishedAt ? (
            <span className="text-slate-500">{formatDate(publishedAt)}</span>
          ) : null}
        </div>

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-base font-extrabold leading-snug text-slate-900 hover:underline"
          title={title}
        >
          {t}
        </a>

        <p className="mt-2 text-sm leading-relaxed text-slate-700">{desc}</p>

        {/* Button pinned */}
        <div className="mt-auto pt-4">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Read full article →
          </a>
        </div>
      </div>
    </article>
  );
}
