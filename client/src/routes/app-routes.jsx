import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Home from "../pages/home/Home.jsx";
import PoliticalNews from "../pages/news/PoliticalNews.jsx";

import Politicians from "../pages/politician/Politicians.jsx";
import PoliticianProfile from "../pages/politician/PoliticianProfile.jsx";
import Parties from "../pages/party/Parties.jsx";
import PartyProfile from "../pages/party/PartyProfile.jsx";
import Petitions from "../pages/petitions/Petitions.jsx";
import PetitionDetails from "../pages/petitions/PetitionDetails.jsx";

// keep petitions as placeholder if teammate hasn't done yet
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

      {/* REAL pages */}
      <Route path="/politicians" element={<Politicians />} />
      <Route path="/politicians/:slug" element={<PoliticianProfile />} />

      <Route path="/parties" element={<Parties />} />
      <Route path="/parties/:slug" element={<PartyProfile />} />

      <Route path="/petitions" element={<Petitions />} />
      <Route path="/petitions/:id" element={<PetitionDetails />} />

      <Route path="/news" element={<PoliticalNews />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
