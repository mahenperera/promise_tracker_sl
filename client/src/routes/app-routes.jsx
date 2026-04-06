// import React from "react";
// import { Routes, Route, Navigate } from "react-router-dom";

// import Home from "../pages/home/Home.jsx";
// import PoliticalNews from "../pages/news/PoliticalNews.jsx";

// import Politicians from "../pages/politician/Politicians.jsx";
// import PoliticianProfile from "../pages/politician/PoliticianProfile.jsx";
// import Parties from "../pages/party/Parties.jsx";
// import PartyProfile from "../pages/party/PartyProfile.jsx";
// import Petitions from "../pages/petitions/Petitions.jsx";
// import PetitionDetails from "../pages/petitions/PetitionDetails.jsx";

// // keep petitions as placeholder if teammate hasn't done yet
// function ComingSoon({ title }) {
//   return (
//     <div className="mx-auto max-w-6xl px-4 py-10">
//       <div className="text-2xl font-extrabold text-slate-900">{title}</div>
//       <div className="mt-2 text-slate-600">Coming soon.</div>
//     </div>
//   );
// }

// export default function AppRoutes() {
//   return (
//     <Routes>
//       <Route path="/" element={<Home />} />

//       {/* REAL pages */}
//       <Route path="/politicians" element={<Politicians />} />
//       <Route path="/politicians/:slug" element={<PoliticianProfile />} />

//       <Route path="/parties" element={<Parties />} />
//       <Route path="/parties/:slug" element={<PartyProfile />} />

//       <Route path="/petitions" element={<Petitions />} />
//       <Route path="/petitions/:id" element={<PetitionDetails />} />

//       <Route path="/news" element={<PoliticalNews />} />

//       <Route path="*" element={<Navigate to="/" replace />} />
//     </Routes>
//   );
// }

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Layout from "../components/layout/Layout.jsx";
import AdminLayout from "../components/layout/AdminLayout.jsx";
import RequireAdmin from "../auth/RequireAdmin.jsx";

import Home from "../pages/home/Home.jsx";
import PoliticalNews from "../pages/news/PoliticalNews.jsx";

import Politicians from "../pages/politician/Politicians.jsx";
import PoliticianProfile from "../pages/politician/PoliticianProfile.jsx";

import Parties from "../pages/party/Parties.jsx";
import PartyProfile from "../pages/party/PartyProfile.jsx";

import Petitions from "../pages/petitions/Petitions.jsx";
import PetitionDetails from "../pages/petitions/PetitionDetails.jsx";

import Promises from "../pages/promise/Promises.jsx";
import PromiseDetails from "../pages/promise/PromiseDetails.jsx";

import AdminDashboard from "../pages/admin/AdminDashboard.jsx";
import ManagePoliticians from "../pages/admin/ManagePoliticians.jsx";
import ManageParties from "../pages/admin/ManageParties.jsx";
import ManagePetitions from "../pages/admin/ManagePetitions.jsx";
import ManagePromises from "../pages/admin/ManagePromises.jsx";
import Login from "../pages/auth/Login.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      {/* PUBLIC SITE */}
      <Route element={<Layout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />

        <Route path="/politicians" element={<Politicians />} />
        <Route path="/politicians/:slug" element={<PoliticianProfile />} />

        <Route path="/parties" element={<Parties />} />
        <Route path="/parties/:slug" element={<PartyProfile />} />

        <Route path="/petitions" element={<Petitions />} />
        <Route path="/petitions/:id" element={<PetitionDetails />} />

        <Route path="/promises" element={<Promises />} />
        <Route
          path="/politicians/:politicianSlug/promises/:promiseSlug"
          element={<PromiseDetails />}
        />

        <Route path="/news" element={<PoliticalNews />} />
      </Route>

      {/* ADMIN */}
      <Route path="/admin" element={<RequireAdmin />}>
        <Route element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="politicians" element={<ManagePoliticians />} />
          <Route path="parties" element={<ManageParties />} />
          <Route path="petitions" element={<ManagePetitions />} />
          <Route path="promises" element={<ManagePromises />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
