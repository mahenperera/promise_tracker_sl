import React from "react";
import NavBar from "./components/layout/NavBar.jsx";
import AppRoutes from "./routes/app-routes.jsx";

export default function App() {
  return (
    <div className="min-h-screen">
      <NavBar />
      <AppRoutes />
    </div>
  );
}
