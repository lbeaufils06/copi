import { useContext, useState } from "react";
import { AuthContext } from "./AuthContext";

export default function Header({ serverTime, formatClock, onAdd }) {
  const { logout } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-slate-950 border border-slate-800 rounded-2xl mb-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/copi.svg" className="w-7 h-7" alt="Logo Copi" />
            <h1 className="text-lg font-semibold tracking-tight">Copi</h1>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {serverTime && (
              <div className="text-xs text-slate-200 font-mono bg-slate-900 px-4 py-2 rounded-lg border border-slate-700">
                {formatClock(serverTime)}
              </div>
            )}

            <button
              onClick={onAdd}
              className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              + Ajouter une DB
            </button>

            <button
              onClick={logout}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-600 px-3 py-2 rounded-lg text-sm transition"
            >
              Deconnexion
            </button>
          </div>

          <button
            className="md:hidden text-slate-200"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Ouvrir le menu"
          >
            ☰
          </button>
        </div>

        {serverTime && (
          <div className="mt-3 md:hidden text-xs text-slate-200 font-mono bg-slate-900 px-3 py-2 rounded-lg border border-slate-700">
            {formatClock(serverTime)}
          </div>
        )}

        {menuOpen && (
          <div className="mt-4 md:hidden flex flex-col gap-3">
            <button
              onClick={() => {
                onAdd();
                setMenuOpen(false);
              }}
              className="w-full bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              + Ajouter une DB
            </button>

            <button
              onClick={logout}
              className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-600 px-4 py-2 rounded-lg text-sm transition"
            >
              Deconnexion
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
