import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Home from "../pages/home/Home.jsx";
import PoliticalNews from "../pages/news/PoliticalNews.jsx";

// SAFE placeholders (no imports from empty files)
function ComingSoon({ title }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="text-2xl font-extrabold text-slate-900">{title}</div>
      <div className="mt-2 text-slate-600">Coming soon.</div>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      {/* later you replace these with your real pages */}
      <Route path="/politicians" element={<ComingSoon title="Politicians" />} />
      <Route
        path="/politicians/:slug"
        element={<ComingSoon title="Politician Profile" />}
      />
      <Route path="/petitions" element={<ComingSoon title="Petitions" />} />

      <Route path="/news" element={<PoliticalNews />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
