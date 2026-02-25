import { useContext, useState } from "react";
import { AuthContext } from "./AuthContext";

export default function Header({ serverTime, formatClock, onAdd }) {
  const { logout } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-slate-950 border-b border-slate-800 rounded-2xl mb-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">

        {/* TOP ROW */}
        <div className="flex items-center justify-between">

          {/* LEFT */}
          <div className="flex items-center gap-3">
            <img src="/copi.svg" className="w-7 h-7" />
            <h1 className="text-lg font-semibold tracking-tight">
              Copi
            </h1>
          </div>

          {/* DESKTOP ACTIONS */}
          <div className="hidden md:flex items-center gap-4">

            {serverTime && (
              <div className="text-xs text-slate-400 font-mono bg-slate-900 px-4 py-2 rounded-lg border border-slate-800">
                {formatClock(serverTime)}
              </div>
            )}

            <button
              onClick={onAdd}
              className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              + Ajouter DB
            </button>

            <button
              onClick={logout}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-2 rounded-lg text-sm transition"
            >
              Logout
            </button>
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            className="md:hidden text-slate-300"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>
        </div>

        {/* MOBILE CLOCK */}
        {serverTime && (
          <div className="mt-3 md:hidden text-xs text-slate-400 font-mono bg-slate-900 px-3 py-2 rounded-lg border border-slate-800">
            {formatClock(serverTime)}
          </div>
        )}

        {/* MOBILE MENU */}
        {menuOpen && (
          <div className="mt-4 md:hidden flex flex-col gap-3">

            <button
              onClick={() => {
                onAdd();
                setMenuOpen(false);
              }}
              className="w-full bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              + Ajouter DB
            </button>

            <button
              onClick={logout}
              className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2 rounded-lg text-sm transition"
            >
              Logout
            </button>
          </div>
        )}

      </div>
    </header>
  );
}