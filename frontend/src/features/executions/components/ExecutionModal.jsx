import { useState } from "react";
import { useLockBodyScroll } from "../../../hooks/useLockBodyScroll";
import { useI18n } from "../../../i18n/I18nContext";
import { useExecutions } from "../hooks/useExecutions";
import ExecutionFilters from "./ExecutionFilters";
import ExecutionRow from "./ExecutionRow";

// ExecutionModal: Displays execution history with filtering, loading states, and expandable rows.
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
    downloadingExecutionId,
    isInitialLoading,
    filteredExecutions,
    statusOptions,
    modeOptions,
    periodOptions,
    downloadExecutionFile,
  } = useExecutions(jobId, t);

  // handleBackdropMouseDown: Closes the modal only when mouse press starts on the backdrop.
  const handleBackdropMouseDown = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn sm:p-4" onMouseDown={handleBackdropMouseDown}>
      <div
        className="bg-slate-900 w-full h-full max-w-none max-h-none rounded-none border-0 shadow-xl flex flex-col sm:w-[96vw] sm:max-w-4xl sm:max-h-[88vh] sm:rounded-2xl sm:border sm:border-slate-700"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 p-4 sm:p-6 border-b border-slate-700 bg-slate-900 sm:rounded-t-2xl">
          <div className="flex justify-between items-center gap-4">
            <h2 className="text-lg font-semibold text-slate-100">{t("executions.title")}</h2>
            <button onClick={onClose} className="text-slate-300 hover:text-white transition" aria-label={t("common.close")}>X</button>
          </div>

          <ExecutionFilters
            query={query}
            setQuery={setQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            modeFilter={modeFilter}
            setModeFilter={setModeFilter}
            periodFilter={periodFilter}
            setPeriodFilter={setPeriodFilter}
            statusOptions={statusOptions}
            modeOptions={modeOptions}
            periodOptions={periodOptions}
            showMobileFilters={showMobileFilters}
            setShowMobileFilters={setShowMobileFilters}
            t={t}
          />
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
                isDownloading={downloadingExecutionId === exec.id}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ExecutionModal;
