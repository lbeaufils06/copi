import { useState } from "react";
import { useLockBodyScroll } from "../../../hooks/useLockBodyScroll";
import { executionModeLabel, executionModeStyle, statusLabel, statusStyle } from "../../../utils/badge";
import { formatDateTimeLocale } from "../../../utils/time";
import { useI18n } from "../../../i18n/I18nContext";
import CustomSelect from "../../../components/CustomSelect";
import { useExecutions } from "../hooks/useExecutions";

function ExecutionModal({ jobId, onClose }) {
  useLockBodyScroll();
  const { locale, t } = useI18n();

  const [openId, setOpenId] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const {
    statusFilter,
    setStatusFilter,
    modeFilter,
    setModeFilter,
    periodFilter,
    setPeriodFilter,
    query,
    setQuery,
    downloadError,
    isInitialLoading,
    filteredExecutions,
    statusOptions,
    modeOptions,
    periodOptions,
    downloadExecutionFile,
  } = useExecutions(jobId, t);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn sm:p-4" onClick={onClose}>
      <div
        className="bg-slate-900 w-full h-full max-w-none max-h-none rounded-none border-0 shadow-xl flex flex-col sm:w-[96vw] sm:max-w-4xl sm:max-h-[88vh] sm:rounded-2xl sm:border sm:border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 p-4 sm:p-6 border-b border-slate-700 bg-slate-900 sm:rounded-t-2xl">
          <div className="flex justify-between items-center gap-4">
            <h2 className="text-lg font-semibold text-slate-100">{t("executions.title")}</h2>
            <button onClick={onClose} className="text-slate-300 hover:text-white transition" aria-label={t("common.close")}>X</button>
          </div>

          <div className="mt-4 sm:hidden flex items-center gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("executions.searchPlaceholder")}
              className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400"
            />
            <button
              type="button"
              onClick={() => setShowMobileFilters((prev) => !prev)}
              className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-200"
            >
              {t("executions.filters")}
            </button>
          </div>

          {showMobileFilters && (
            <div className="mt-2 grid grid-cols-1 gap-2 sm:hidden">
              <CustomSelect id="exec-status-filter-mobile" name="statusFilter" value={statusFilter} options={statusOptions} onChange={(e) => setStatusFilter(e.target.value)} size="compact" />
              <CustomSelect id="exec-mode-filter-mobile" name="modeFilter" value={modeFilter} options={modeOptions} onChange={(e) => setModeFilter(e.target.value)} size="compact" />
              <CustomSelect id="exec-period-filter-mobile" name="periodFilter" value={periodFilter} options={periodOptions} onChange={(e) => setPeriodFilter(e.target.value)} size="compact" />
            </div>
          )}

          <div className="mt-4 hidden sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <CustomSelect id="exec-status-filter" name="statusFilter" value={statusFilter} options={statusOptions} onChange={(e) => setStatusFilter(e.target.value)} size="compact" />
            <CustomSelect id="exec-mode-filter" name="modeFilter" value={modeFilter} options={modeOptions} onChange={(e) => setModeFilter(e.target.value)} size="compact" />
            <CustomSelect id="exec-period-filter" name="periodFilter" value={periodFilter} options={periodOptions} onChange={(e) => setPeriodFilter(e.target.value)} size="compact" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("executions.searchPlaceholder")}
              className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400"
            />
          </div>
        </div>

        {downloadError && <div className="px-4 sm:px-6 py-2 text-xs bg-red-900/40 border-b border-red-700/60 text-red-200">{downloadError}</div>}

        <div className="custom-scrollbar overflow-y-auto p-4 sm:p-6 pt-3 space-y-2">
          {isInitialLoading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="w-8 h-8 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
              <p className="mt-3 text-slate-300 text-sm">{t("common.loading")}</p>
            </div>
          ) : filteredExecutions.length === 0 ? (
            <p className="text-slate-300 text-sm">{t("executions.empty")}</p>
          ) : (
            filteredExecutions.map((exec) => (
              <ExecutionRow
                key={exec.id}
                exec={exec}
                open={openId === exec.id}
                onToggle={() => setOpenId((prev) => (prev === exec.id ? null : exec.id))}
                locale={locale}
                t={t}
                onDownload={() => downloadExecutionFile(exec)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function ExecutionRow({ exec, open, onToggle, locale, t, onDownload }) {
  const executionTime = formatDateTimeLocale(exec.executionTime, locale);
  const startTime = formatDateTimeLocale(exec.startTime, locale);
  const endTime = formatDateTimeLocale(exec.endTime, locale);
  const canDownload = exec.status === "SUCCESS";

  return (
    <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="w-full text-left flex items-start justify-between gap-3 p-3 hover:bg-slate-700/60 transition"
      >
        <span className="text-sm text-slate-100">{executionTime}</span>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`inline-flex justify-center text-xs px-2 py-1 rounded-full whitespace-nowrap ${executionModeStyle(exec.executionMode)}`}>
            {executionModeLabel(exec.executionMode, t)}
          </span>
          <span className={`inline-flex justify-center text-xs px-2 py-1 rounded-full whitespace-nowrap ${statusStyle(exec.status)}`}>
            {statusLabel(exec.status, t)}
          </span>
        </div>
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
              <pre className="custom-scrollbar mt-1 whitespace-pre-wrap text-slate-100 bg-slate-950 border border-slate-700 p-2 rounded max-h-48 overflow-auto">
                {exec.logMessage}
              </pre>
            </div>
          )}
          {canDownload && (
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={onDownload}
                className="px-2 py-1 text-xs rounded-md bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                {t("executions.download")}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ExecutionModal;

