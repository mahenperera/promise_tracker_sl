// client/src/pages/home/Home.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const onSearch = (e) => {
    e.preventDefault();
    const query = q.trim();

    // for now redirect to politicians list page (later you can implement query param filtering)
    if (!query) return navigate("/politicians");
    navigate(`/politicians?search=${encodeURIComponent(query)}`);
  };

  return (
    <main className="bg-[#f5f7fb]">
      {/* FULL-WIDTH HERO (NO FRAME) */}
      <section className="relative w-full overflow-hidden bg-slate-950">
        {/* Background image full-bleed */}
        <div className="absolute inset-0">
          <img
            src="/parliament.jpg"
            alt="Parliament"
            className="h-full w-full object-cover object-center"
          />
          {/* Dark overlay for readability (NOT blur) */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-black/10" />
        </div>

        {/* Content centered, image stays full width */}
        <div className="relative mx-auto flex min-h-[520px] max-w-6xl items-center px-4 py-14 md:min-h-[560px] md:py-20">
          <div className="grid w-full items-center gap-10 md:grid-cols-2">
            {/* LEFT */}
            <div className="max-w-xl text-white">
              <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
                Find your representative
              </h1>

              <p className="mt-3 text-base leading-6 text-white/85 md:text-lg">
                Search politicians by name, party, or district and view their
                public profile.
              </p>

              {/* Search bar (smaller + clean) */}
              <form
                onSubmit={onSearch}
                className="mt-6 flex w-full max-w-lg items-center gap-2"
              >
                <div className="flex h-11 flex-1 items-center gap-2 rounded-xl bg-white/10 px-4 ring-1 ring-white/20 backdrop-blur-sm">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="opacity-70"
                  >
                    <path
                      d="M10.5 19a8.5 8.5 0 1 1 0-17 8.5 8.5 0 0 1 0 17Z"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M20 20l-3.5-3.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>

                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="MP name / Party / District"
                    className="w-full bg-transparent text-sm text-white placeholder:text-white/55 outline-none md:text-base"
                  />
                </div>

                <button
                  type="submit"
                  className="h-11 shrink-0 rounded-xl bg-white px-5 text-sm font-semibold text-slate-900 hover:bg-white/90"
                >
                  Search
                </button>
              </form>
            </div>

            {/* RIGHT INFO BOX (keep, but not huge) */}
            <div className="md:justify-self-end">
              <div className="w-full max-w-md rounded-2xl border border-white/15 bg-white/10 p-6 text-white shadow-xl backdrop-blur-md">
                <h2 className="text-xl font-bold md:text-2xl">
                  What does this platform do?
                </h2>
                <p className="mt-2 text-sm leading-6 text-white/85 md:text-base">
                  Track politicians, monitor promises, and support civic action
                  through petitions and evidence-based updates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* IMPORTANT: No extra section below (so no huge empty space) */}
    </main>
  );
}
