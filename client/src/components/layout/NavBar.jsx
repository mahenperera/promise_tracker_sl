// import React from "react";
// import { NavLink, useNavigate } from "react-router-dom";
// import {
//   SignedIn,
//   SignedOut,
//   SignInButton,
//   SignOutButton,
// } from "@clerk/clerk-react";

// export default function NavBar() {
//   const navigate = useNavigate();

//   const linkClass = ({ isActive }) =>
//     `text-sm font-medium transition ${
//       isActive ? "text-slate-900" : "text-slate-600 hover:text-slate-900"
//     }`;

//   return (
//     <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-200">
//       <div className="mx-auto max-w-6xl px-4 h-16 flex items-center gap-6">
//         {/* Logo (PT icon REMOVED) */}
//         <button
//           onClick={() => navigate("/")}
//           className="flex items-center gap-2"
//         >
//           <div className="font-bold text-slate-900">Promise Tracker SL</div>
//         </button>

//         {/* Center nav */}
//         <nav className="ml-auto flex items-center gap-8">
//           <NavLink to="/politicians" className={linkClass}>
//             Politicians
//           </NavLink>
//           <NavLink to="/parties" className={linkClass}>
//             Parties
//           </NavLink>
//           <NavLink to="/petitions" className={linkClass}>
//             Petitions
//           </NavLink>
//           <NavLink to="/news" className={linkClass}>
//             News
//           </NavLink>

//           {/* later teammates */}
//           {/*
//           <NavLink to="/ratings" className={linkClass}>Ratings</NavLink>
//           <NavLink to="/tickets" className={linkClass}>Tickets</NavLink>
//           */}
//         </nav>

//         {/* Right actions (NO search bar/button here) */}
//         <div className="flex items-center gap-2">
//           <SignedOut>
//             <SignInButton mode="modal">
//               <button className="h-10 px-4 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800">
//                 Sign in
//               </button>
//             </SignInButton>
//           </SignedOut>

//           <SignedIn>
//             <SignOutButton>
//               <button className="h-10 px-4 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-semibold hover:bg-slate-50">
//                 Logout
//               </button>
//             </SignOutButton>
//           </SignedIn>
//         </div>
//       </div>
//     </header>
//   );
// }

import React, { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../../context/auth-context";
import SignInModal from "../auth/SignInModal";

function Item({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `text-sm font-semibold ${
          isActive ? "text-slate-900" : "text-slate-600 hover:text-slate-900"
        }`
      }
    >
      {label}
    </NavLink>
  );
}

export default function NavBar() {
  const { isAuthed, user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
          <Link to="/" className="font-extrabold text-slate-900">
            Promise Tracker SL
          </Link>

          <div className="flex items-center gap-6">
            <Item to="/politicians" label="Politicians" />
            <Item to="/parties" label="Parties" />
            <Item to="/petitions" label="Petitions" />
            <Item to="/news" label="News" />

            {isAuthed && user?.role === "admin" ? (
              <Link
                to="/admin"
                className="text-sm font-semibold text-slate-900 hover:text-slate-900"
              >
                Admin
              </Link>
            ) : null}

            {!isAuthed ? (
              <button
                onClick={() => setOpen(true)}
                className="h-10 px-4 rounded-2xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800"
              >
                Sign in
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <div className="hidden sm:block text-sm text-slate-600">
                  {user?.email}
                </div>
                <button
                  onClick={logout}
                  className="h-10 px-4 rounded-2xl border border-slate-200 bg-white text-slate-900 text-sm font-semibold hover:bg-slate-50"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <SignInModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
