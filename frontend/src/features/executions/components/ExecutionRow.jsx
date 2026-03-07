import { executionModeLabel, executionModeStyle, formatDateTimeLocale, statusLabel, statusStyle } from "../../../shared/utils";

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

export default ExecutionRow;
