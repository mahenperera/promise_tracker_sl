import React, { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../../context/auth-context";
import SignInModal from "../auth/SignInModal";

function Item({ to, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `text-sm font-semibold transition ${
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
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const closeOnResize = () => {
      if (window.innerWidth >= 1024) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("resize", closeOnResize);
    return () => window.removeEventListener("resize", closeOnResize);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex min-h-16 items-center justify-between gap-3 py-3">
            <Link
              to="/"
              className="truncate pr-2 text-lg font-extrabold text-slate-900 sm:text-xl"
            >
              Promise Tracker SL
            </Link>

            <div className="hidden items-center gap-6 lg:flex">
              <Item to="/politicians" label="Politicians" />
              <Item to="/parties" label="Parties" />
              <Item to="/promises" label="Promises" />
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
                  className="h-10 rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Sign in
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="hidden max-w-[220px] truncate text-sm text-slate-600 xl:block">
                    {user?.email}
                  </div>
                  <button
                    onClick={logout}
                    className="h-10 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 lg:hidden"
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {menuOpen ? (
          <div className="border-t border-slate-200 bg-white lg:hidden">
            <div className="mx-auto max-w-6xl px-4 py-4">
              <div className="flex flex-col gap-4">
                <Item
                  to="/politicians"
                  label="Politicians"
                  onClick={closeMenu}
                />
                <Item to="/parties" label="Parties" onClick={closeMenu} />
                <Item to="/promises" label="Promises" onClick={closeMenu} />
                <Item to="/petitions" label="Petitions" onClick={closeMenu} />
                <Item to="/news" label="News" onClick={closeMenu} />

                {isAuthed && user?.role === "admin" ? (
                  <Link
                    to="/admin"
                    onClick={closeMenu}
                    className="text-sm font-semibold text-slate-900 hover:text-slate-900"
                  >
                    Admin
                  </Link>
                ) : null}

                {!isAuthed ? (
                  <button
                    onClick={() => {
                      closeMenu();
                      setOpen(true);
                    }}
                    className="h-11 rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    Sign in
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="break-all text-sm text-slate-600">
                      {user?.email}
                    </div>
                    <button
                      onClick={() => {
                        closeMenu();
                        logout();
                      }}
                      className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <SignInModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
