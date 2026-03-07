import { formatRelativeTime, formatFutureTime, getReadableCron, getScheduleStyle } from "../utils/time";
import { statusStyle, statusLabel } from "../utils/badge";

function JobList({ jobs, serverOffline, startJob, openEditModal, openExecutions }) {
  return (
    <section className="bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-lg border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Jobs de sauvegarde</h2>
      </div>

      <div className="space-y-4">
        {serverOffline ? (
          <div className="text-red-300 text-sm">Serveur indisponible</div>
        ) : jobs.length === 0 ? (
          <p className="text-slate-300 text-sm">Aucun job configure</p>
        ) : (
          jobs.map((job) => {
            const isRunning = job.lastStatus === "RUNNING";

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
                        <span className="text-slate-100 font-medium text-sm">Planification: </span>
                        <span className={`text-xs px-2 py-1 rounded-md ${getScheduleStyle(job.cronExpression)}`}>
                          {getReadableCron(job.cronExpression)}
                        </span>
                      </p>

                      <p>
                        <span className="text-slate-100 font-medium">Derniere sauvegarde: </span>
                        {formatRelativeTime(job.lastSuccessTime, isRunning)}
                      </p>

                      {job.cronExpression !== "" && (
                        <p>
                          <span className="text-slate-100 font-medium">Prochaine execution: </span>
                          {formatFutureTime(job.nextExecutionTime, isRunning)}
                        </p>
                      )}

                      <p>
                        <span className="text-slate-100 font-medium">Hote: </span>
                        {job.host}:{job.port}
                      </p>

                      <span
                        className={`inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full font-medium ${statusStyle(job.lastStatus)}`}
                      >
                        {isRunning && (
                          <span className="w-2 h-2 rounded-full bg-current animate-pulse" aria-hidden="true" />
                        )}
                        <span>{statusLabel(job.lastStatus)}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="bg-emerald-900/40 text-emerald-300 text-sm px-3 py-2 rounded-full border border-emerald-700/60">
                      {job.versionCount ?? 0} {(job.versionCount ?? 0) > 1 ? "Versions" : "Version"}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startJob(job.id)}
                        disabled={isRunning}
                        className={`px-4 py-2 rounded-lg text-sm transition ${
                          isRunning ? "bg-slate-700 text-slate-300 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-500"
                        }`}
                        aria-label={isRunning ? "Execution en cours" : "Demarrer le job"}
                      >
                        {isRunning ? "En cours..." : "Demarrer"}
                      </button>

                      <button
                        onClick={() => openEditModal(job)}
                        className="icon-tooltip bg-slate-800 hover:bg-slate-700 border border-slate-600 p-2 rounded-lg transition flex items-center justify-center"
                        aria-label="Modifier le job"
                      >
                        <span className="icon-tooltip-text">Modifier</span>
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
                        aria-label="Voir l historique d execution"
                      >
                        <span className="icon-tooltip-text">Historique</span>
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
