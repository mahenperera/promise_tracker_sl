import React from "react";
import { useParams } from "react-router-dom";

export default function PoliticianProfile() {
  const { slug } = useParams();

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-3xl font-extrabold text-slate-900">
          Politician Profile
        </h1>
        <p className="mt-2 text-slate-600">
          Coming soon. Profile slug:{" "}
          <span className="font-semibold">{slug}</span>
        </p>
      </div>
    </div>
  );
}
