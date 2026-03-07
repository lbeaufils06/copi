import { useEffect, useMemo, useRef, useState } from "react";
import { useApi } from "../utils/useApi";
import { useLockBodyScroll } from "../hooks/useLockBodyScroll";
import { executionModeLabel, executionModeStyle, statusLabel, statusStyle } from "../utils/badge";
import { formatDateTimeLocale } from "../utils/time";
import { useI18n } from "../i18n/I18nContext";

function ExecutionModal({ jobId, onClose }) {
  useLockBodyScroll();
  const { apiFetch } = useApi();
  const { locale, t } = useI18n();

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
            <h2 className="text-lg font-semibold text-slate-100">{t("executions.title")}</h2>
            <button onClick={onClose} className="text-slate-300 hover:text-white transition" aria-label={t("common.close")}>
              ✕
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100"
            >
              <option value="ALL">{t("executions.allStatuses")}</option>
              <option value="SUCCESS">{t("jobs.status_success")}</option>
              <option value="FAILED">{t("jobs.status_failed")}</option>
              <option value="RUNNING">{t("jobs.status_running")}</option>
            </select>

            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100"
            >
              <option value="ALL">{t("executions.allModes")}</option>
              <option value="SCHEDULED">{t("executions.mode_cron")}</option>
              <option value="MANUAL">{t("executions.mode_manual")}</option>
            </select>

            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100"
            >
              <option value="24H">{t("executions.period24h")}</option>
              <option value="7D">{t("executions.period7d")}</option>
              <option value="30D">{t("executions.period30d")}</option>
              <option value="ALL">{t("executions.allPeriods")}</option>
            </select>

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("executions.searchPlaceholder")}
              className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="px-4 sm:px-6 py-3 text-xs text-slate-300 border-b border-slate-700 grid grid-cols-[2fr,1fr,1fr,auto] gap-3">
          <span>{t("executions.colDate")}</span>
          <span>{t("executions.colMode")}</span>
          <span>{t("executions.colStatus")}</span>
          <span>{t("executions.colDetails")}</span>
        </div>

        <div className="overflow-y-auto p-4 sm:p-6 pt-3 space-y-2">
          {filteredExecutions.length === 0 && <p className="text-slate-300 text-sm">{t("executions.empty")}</p>}

          {filteredExecutions.map((exec) => (
            <ExecutionRow
              key={exec.id}
              exec={exec}
              open={openId === exec.id}
              onToggle={() => setOpenId((prev) => (prev === exec.id ? null : exec.id))}
              locale={locale}
              t={t}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ExecutionRow({ exec, open, onToggle, locale, t }) {
  const executionTime = formatDateTimeLocale(exec.executionTime, locale);
  const startTime = formatDateTimeLocale(exec.startTime, locale);
  const endTime = formatDateTimeLocale(exec.endTime, locale);

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
          {executionModeLabel(exec.executionMode, t)}
        </span>
        <span className={`inline-flex justify-center text-xs px-2 py-1 rounded-full ${statusStyle(exec.status)}`}>
          {statusLabel(exec.status, t)}
        </span>
        <span className="text-slate-300 text-xs">{open ? t("executions.hide") : t("executions.show")}</span>
      </button>

      {open && (
        <div className="border-t border-slate-700 p-3 text-xs text-slate-200 space-y-2">
          <div>
            <span className="text-slate-400">{t("executions.start")}: </span>
            {startTime}
          </div>
          <div>
            <span className="text-slate-400">{t("executions.end")}: </span>
            {endTime}
          </div>
          {exec.durationInSeconds !== null && (
            <div>
              <span className="text-slate-400">{t("executions.duration")}: </span>
              {exec.durationInSeconds}s
            </div>
          )}
          {exec.fileName && (
            <div>
              <span className="text-slate-400">{t("executions.file")}: </span>
              {exec.fileName}
            </div>
          )}
          {exec.filePath && (
            <div className="break-all">
              <span className="text-slate-400">{t("executions.path")}: </span>
              {exec.filePath}
            </div>
          )}
          {exec.logMessage && (
            <div>
              <span className="text-slate-400">{t("executions.log")}:</span>
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
