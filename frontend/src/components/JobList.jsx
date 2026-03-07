import { formatRelativeTime, formatFutureTime, getReadableCron, getScheduleStyle } from "../utils/time";
import { statusStyle, statusLabel } from "../utils/badge";
import { useI18n } from "../i18n/I18nContext";

function JobList({ jobs, serverOffline, startJob, openEditModal, openExecutions }) {
  const { locale, t } = useI18n();

  return (
    <section className="bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-lg border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">{t("jobs.title")}</h2>
      </div>

      <div className="space-y-4">
        {serverOffline ? (
          <div className="text-red-300 text-sm">{t("jobs.serverOffline")}</div>
        ) : jobs.length === 0 ? (
          <p className="text-slate-300 text-sm">{t("jobs.noJobs")}</p>
        ) : (
          jobs.map((job) => {
            const isRunning = job.lastStatus === "RUNNING";
            const versionLabel = (job.versionCount ?? 0) > 1 ? t("jobs.version_other") : t("jobs.version_one");

            return (
              <div
                key={job.id}
                className="bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-700 hover:border-indigo-500 transition-all duration-200"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-semibold">{job.name}</h3>
                      <span className="text-xs bg-slate-700 text-slate-100 px-2 py-1 rounded-md border border-slate-600">
                        {job.dbType}
                      </span>
                    </div>

                    <div className="text-slate-200 space-y-1.5">
                      <p>
                        <span className="text-slate-100 font-medium text-sm">{t("jobs.schedule")}: </span>
                        <span className={`text-xs px-2 py-1 rounded-md ${getScheduleStyle(job.cronExpression, locale)}`}>
                          {getReadableCron(job.cronExpression, locale)}
                        </span>
                      </p>

                      <p>
                        <span className="text-slate-100 font-medium">{t("jobs.lastBackup")}: </span>
                        {formatRelativeTime(job.lastSuccessTime, isRunning, locale)}
                      </p>

                      {job.cronExpression !== "" && (
                        <p>
                          <span className="text-slate-100 font-medium">{t("jobs.nextExecution")}: </span>
                          {formatFutureTime(job.nextExecutionTime, isRunning, locale)}
                        </p>
                      )}

                      <p>
                        <span className="text-slate-100 font-medium">{t("jobs.host")}: </span>
                        {job.host}:{job.port}
                      </p>

                      <span
                        className={`inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full font-medium ${statusStyle(job.lastStatus)}`}
                      >
                        {isRunning && (
                          <span className="w-2 h-2 rounded-full bg-current animate-pulse" aria-hidden="true" />
                        )}
                        <span>{statusLabel(job.lastStatus, t)}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="bg-emerald-900/40 text-emerald-300 text-sm px-3 py-2 rounded-full border border-emerald-700/60">
                      {job.versionCount ?? 0} {versionLabel}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startJob(job.id)}
                        disabled={isRunning}
                        className={`px-4 py-2 rounded-lg text-sm transition ${
                          isRunning ? "bg-slate-700 text-slate-300 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-500"
                        }`}
                        aria-label={isRunning ? t("jobs.status_running") : t("jobs.start")}
                      >
                        {isRunning ? t("jobs.running") : t("jobs.start")}
                      </button>

                      <button
                        onClick={() => openEditModal(job)}
                        className="icon-tooltip bg-slate-800 hover:bg-slate-700 border border-slate-600 p-2 rounded-lg transition flex items-center justify-center"
                        aria-label={t("jobs.edit")}
                      >
                        <span className="icon-tooltip-text">{t("jobs.edit")}</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.8}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M16.862 3.487a2.25 2.25 0 113.182 3.182L7.5 19.213l-4.5 1.125 1.125-4.5L16.862 3.487z"
                          />
                        </svg>
                      </button>

                      <button
                        onClick={() => openExecutions(job)}
                        className="icon-tooltip bg-slate-800 hover:bg-slate-700 border border-slate-600 p-2 rounded-lg transition flex items-center justify-center"
                        aria-label={t("jobs.history")}
                      >
                        <span className="icon-tooltip-text">{t("jobs.history")}</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-5 h-5 text-slate-200"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 3v5h5M3.05 13A9 9 0 106 5.3L3 8m9 4V7m0 5l4 2"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

export default JobList;
