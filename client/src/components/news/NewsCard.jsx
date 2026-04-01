import React from "react";

function fmtDate(v) {
  const t = Date.parse(v);
  if (!t) return "";
  return new Date(t).toLocaleString();
}

export default function NewsCard({ item }) {
  const { title, url, image, source, publishedAt, summary } = item || {};

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        overflow: "hidden",
        background: "#fff",
      }}
    >
      <div style={{ height: 170, background: "#f3f4f6" }}>
        {image ? (
          <img
            src={image}
            alt={title || "news"}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div
            style={{
              height: "100%",
              display: "grid",
              placeItems: "center",
              color: "#6b7280",
            }}
          >
            No image
          </div>
        )}
      </div>

      <div style={{ padding: 14 }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 10,
            fontSize: 12,
            color: "#475569",
          }}
        >
          <span
            style={{
              background: "#f1f5f9",
              padding: "4px 10px",
              borderRadius: 999,
            }}
          >
            {source || "Source"}
          </span>
          {publishedAt ? <span>{fmtDate(publishedAt)}</span> : null}
        </div>

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "#0f172a",
            fontWeight: 800,
            textDecoration: "none",
            lineHeight: 1.3,
          }}
        >
          {title || "Untitled"}
        </a>

        <p style={{ marginTop: 10, color: "#334155", fontSize: 14 }}>
          {summary ? summary : "Open the article to read more."}
        </p>

        <div style={{ marginTop: 14 }}>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              background: "#0f172a",
              color: "white",
              padding: "10px 12px",
              borderRadius: 10,
              fontWeight: 800,
              fontSize: 13,
              textDecoration: "none",
            }}
          >
            Read full article →
          </a>
        </div>
      </div>
    </div>
  );
}
