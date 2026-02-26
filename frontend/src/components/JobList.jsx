import { formatRelativeTime } from "../utils/time";
import { formatFutureTime } from "../utils/time";
import { statusStyle } from "../utils/badge";
import { getReadableCron, getScheduleStyle } from "../utils/time";
import { useNavigate } from "react-router-dom";

function JobList({
  jobs,
  serverOffline,
  startJob,
  openEditModal
}) {
  const navigate = useNavigate();

  return (
    <section className="bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Jobs</h2>
      </div>

      <div className="space-y-4">
        {serverOffline ? (
          <div className="text-red-400 text-sm">
            ⚠ Serveur indisponible
          </div>
        ) : jobs.length === 0 ? (
          <p className="text-slate-400 text-sm">
            Aucun job configuré
          </p>
        ) : (
          jobs.map((job) => (
            <div
              key={job.id}
              className="bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-700 hover:border-indigo-500 transition-all duration-200"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                
                {/* LEFT SIDE */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-semibold">
                      {job.name}
                    </h3>

                    <span className="text-xs bg-slate-700 px-2 py-1 rounded-md">
                      {job.dbType}
                    </span>
                  </div>

                  <div className="text-slate-400 space-y-1">

                    <p>
                      <span className="text-slate-300 font-medium text-sm">
                        Planification :
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-md ${getScheduleStyle(
                          job.cronExpression
                        )}`}
                      >
                        {getReadableCron(job.cronExpression)}
                      </span>
                    </p>

                    <p>
                      <span className="text-slate-300 font-medium">
                        Dernière sauvegarde :
                      </span>{" "}
                      {formatRelativeTime(job.lastSuccessTime)}
                    </p>

                    {job.cronExpression != "" && (
                    <p>
                      <span className="text-slate-300 font-medium">
                        Prochaine exécution :
                      </span>{" "}
                      {formatFutureTime(job.nextExecutionTime)}
                    </p>
                    )}

                    <p>
                      <span className="text-slate-300 font-medium">
                        Host :
                      </span>{" "}
                      {job.host}:{job.port}
                    </p>

                    <span
                      className={`inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full font-medium ${statusStyle(
                        job.lastStatus
                      )}`}
                    >
                      {job.lastStatus === "RUNNING" && (
                        <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
                      )}
                      {job.lastStatus || "NEVER_RUN"}
                    </span>

                  </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="flex items-center gap-4">

                  <span className="bg-emerald-900/40 text-emerald-400 text-sm px-3 py-2 rounded-full">
                    {(job.versionCount ?? 0)}{" "}
                    {(job.versionCount ?? 0) > 1 ? "Versions" : "Version"}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startJob(job.id)}
                      disabled={job.lastStatus === "RUNNING"}
                      className={`px-4 py-2 rounded-lg text-sm transition ${
                        job.lastStatus === "RUNNING"
                          ? "bg-slate-700 cursor-not-allowed"
                          : "bg-indigo-600 hover:bg-indigo-500"
                      }`}
                    >
                      {job.lastStatus === "RUNNING" ? "Running..." : "Start"}
                    </button>

                    <button
                      onClick={() => openEditModal(job)}
                      className="bg-slate-800 hover:bg-slate-700 border border-slate-600 p-2 rounded-lg transition flex items-center justify-center"
                      title="Modifier"
                    >
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

                    <button className="bg-slate-800 hover:bg-slate-700 border border-slate-600 px-3 py-2 rounded-lg text-sm transition">
                      ⋮
                    </button>
                  </div>

                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default JobList;