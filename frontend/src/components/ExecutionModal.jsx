import { useEffect, useMemo, useRef, useState } from "react";
import { useApi } from "../utils/useApi";
import { useLockBodyScroll } from "../hooks/useLockBodyScroll";
import { executionModeLabel, executionModeStyle, statusLabel, statusStyle } from "../utils/badge";
import { formatDateTimeFr } from "../utils/time";

function ExecutionModal({ jobId, onClose }) {
  useLockBodyScroll();
  const { apiFetch } = useApi();

  const [executions, setExecutions] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [modeFilter, setModeFilter] = useState("ALL");
  const [periodFilter, setPeriodFilter] = useState("7D");
  const [query, setQuery] = useState("");
  const intervalRef = useRef(null);

  const fetchExecutions = async () => {
    try {
      const data = await apiFetch(`/api/executions/${jobId}`);
      setExecutions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch executions", error);
    }
  };

  useEffect(() => {
    fetchExecutions();
    intervalRef.current = setInterval(fetchExecutions, 3000);

    return () => clearInterval(intervalRef.current);
  }, [jobId]);

  const filteredExecutions = useMemo(() => {
    const now = Date.now();
    const periodMap = {
      "24H": 24 * 60 * 60 * 1000,
      "7D": 7 * 24 * 60 * 60 * 1000,
      "30D": 30 * 24 * 60 * 60 * 1000,
      ALL: null,
    };

    return executions.filter((exec) => {
      const statusOk = statusFilter === "ALL" || exec.status === statusFilter;
      const modeOk = modeFilter === "ALL" || exec.executionMode === modeFilter;

      const periodMs = periodMap[periodFilter];
      const executionDate = exec.executionTime ? new Date(exec.executionTime).getTime() : null;
      const periodOk = !periodMs || !executionDate || now - executionDate <= periodMs;

      const text = `${exec.fileName ?? ""} ${exec.filePath ?? ""} ${exec.logMessage ?? ""}`.toLowerCase();
      const queryOk = query.trim() === "" || text.includes(query.trim().toLowerCase());

      return statusOk && modeOk && periodOk && queryOk;
    });
  }, [executions, statusFilter, modeFilter, periodFilter, query]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn" onClick={onClose}>
      <div
        className="bg-slate-900 w-[95vw] max-w-4xl max-h-[88vh] rounded-2xl shadow-xl border border-slate-700 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 p-4 sm:p-6 border-b border-slate-700 bg-slate-900 rounded-t-2xl">
          <div className="flex justify-between items-center gap-4">
            <h2 className="text-lg font-semibold text-slate-100">Executions</h2>
            <button onClick={onClose} className="text-slate-300 hover:text-white transition" aria-label="Fermer la modale">
              ✕
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100"
            >
              <option value="ALL">Tous statuts</option>
              <option value="SUCCESS">Succes</option>
              <option value="FAILED">Echec</option>
              <option value="RUNNING">En cours</option>
            </select>

            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100"
            >
              <option value="ALL">Tous modes</option>
              <option value="SCHEDULED">Cron</option>
              <option value="MANUAL">Manuel</option>
            </select>

            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100"
            >
              <option value="24H">Dernieres 24h</option>
              <option value="7D">Derniers 7 jours</option>
              <option value="30D">Derniers 30 jours</option>
              <option value="ALL">Toutes periodes</option>
            </select>

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher fichier/log"
              className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="px-4 sm:px-6 py-3 text-xs text-slate-300 border-b border-slate-700 grid grid-cols-[2fr,1fr,1fr,auto] gap-3">
          <span>Date</span>
          <span>Mode</span>
          <span>Statut</span>
          <span>Details</span>
        </div>

        <div className="overflow-y-auto p-4 sm:p-6 pt-3 space-y-2">
          {filteredExecutions.length === 0 && <p className="text-slate-300 text-sm">Aucune execution trouvee</p>}

          {filteredExecutions.map((exec) => (
            <ExecutionRow
              key={exec.id}
              exec={exec}
              open={openId === exec.id}
              onToggle={() => setOpenId((prev) => (prev === exec.id ? null : exec.id))}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ExecutionRow({ exec, open, onToggle }) {
  const executionTime = formatDateTimeFr(exec.executionTime);
  const startTime = formatDateTimeFr(exec.startTime);
  const endTime = formatDateTimeFr(exec.endTime);

  return (
    <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
      <button
        type="button"
        className="w-full text-left grid grid-cols-[2fr,1fr,1fr,auto] gap-3 items-center p-3 hover:bg-slate-700/60 transition"
        onClick={onToggle}
        aria-expanded={open}
      >
        <span className="text-sm text-slate-100">{executionTime}</span>
        <span className={`inline-flex justify-center text-xs px-2 py-1 rounded-full ${executionModeStyle(exec.executionMode)}`}>
          {executionModeLabel(exec.executionMode)}
        </span>
        <span className={`inline-flex justify-center text-xs px-2 py-1 rounded-full ${statusStyle(exec.status)}`}>
          {statusLabel(exec.status)}
        </span>
        <span className="text-slate-300 text-xs">{open ? "Masquer" : "Voir"}</span>
      </button>

      {open && (
        <div className="border-t border-slate-700 p-3 text-xs text-slate-200 space-y-2">
          <div>
            <span className="text-slate-400">Debut: </span>
            {startTime}
          </div>
          <div>
            <span className="text-slate-400">Fin: </span>
            {endTime}
          </div>
          {exec.durationInSeconds !== null && (
            <div>
              <span className="text-slate-400">Duree: </span>
              {exec.durationInSeconds}s
            </div>
          )}
          {exec.fileName && (
            <div>
              <span className="text-slate-400">Fichier: </span>
              {exec.fileName}
            </div>
          )}
          {exec.filePath && (
            <div className="break-all">
              <span className="text-slate-400">Chemin: </span>
              {exec.filePath}
            </div>
          )}
          {exec.logMessage && (
            <div>
              <span className="text-slate-400">Log:</span>
              <pre className="mt-1 whitespace-pre-wrap text-slate-100 bg-slate-950 border border-slate-700 p-2 rounded">
                {exec.logMessage}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ExecutionModal;
