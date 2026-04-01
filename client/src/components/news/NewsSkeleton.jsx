import React from "react";

function Skel() {
  const box = (h, w = "100%") => ({
    height: h,
    width: w,
    borderRadius: 10,
    background: "#e5e7eb",
  });

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        overflow: "hidden",
        background: "#fff",
      }}
    >
      <div style={{ ...box(160), borderRadius: 0 }} />
      <div style={{ padding: 14 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <div style={box(18, 120)} />
          <div style={box(18, 160)} />
        </div>
        <div style={box(18)} />
        <div style={{ height: 8 }} />
        <div style={box(18, "85%")} />
        <div style={{ height: 10 }} />
        <div style={box(14)} />
        <div style={{ height: 8 }} />
        <div style={box(14, "70%")} />
        <div style={{ height: 14 }} />
        <div style={box(36, 140)} />
      </div>
    </div>
  );
}

export default function NewsSkeleton({ count = 9 }) {
  return (
    <div
      style={{
        display: "grid",
        gap: 16,
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Skel key={i} />
      ))}
    </div>
  );
}
