import { useEffect, useState } from "react";
import JobModal from "./components/JobModal";
import { formatRelativeTime } from "./utils/time";
import { formatFutureTime } from "./utils/time";
import { statusStyle } from "./utils/badge";

function App() {
  const [jobs, setJobs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jobToEdit, setJobToEdit] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [serverTime, setServerTime] = useState(null);

  const fetchJobs = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/jobs");
      const data = await response.json();
      setJobs(data);
    } catch (error) {
      console.error("Erreur API:", error);
    }
  };

  const formatClock = (date) => {
    return date.toLocaleString("fr-FR", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const startJob = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/jobs/${id}/start`,
        { method: "POST" }
      );

      if (response.status === 409) {
        setErrorMessage("Ce job est déjà en cours");
        setTimeout(() => setErrorMessage(null), 3000);
        return;
      }

      if (!response.ok) {
        throw new Error("Erreur serveur");
      }

    } catch (error) {
      console.error("Erreur start:", error);
    }
  };

  useEffect(() => {
    const fetchTime = async () => {
      const res = await fetch("http://localhost:8080/api/time");
      const data = await res.json();
      setServerTime(new Date(data));
    };

    fetchTime();
  }, []);

  useEffect(() => {
    if (!serverTime) return;

    const interval = setInterval(() => {
      setServerTime(prev => new Date(prev.getTime() + 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [serverTime]);

  useEffect(() => {
    fetchJobs(); // premier chargement immédiat

    const interval = setInterval(() => {
      fetchJobs();
    }, 1000); // 1000 ms = 1 seconde

    return () => clearInterval(interval); // nettoyage
  }, []);

  const openAddModal = () => {
    setJobToEdit(null);
    setIsModalOpen(true);
  };

  const openEditModal = (job) => {
    setJobToEdit(job);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 gap-4">
          <h1 className="text-xl lg:text-2xl font-semibold tracking-tight">
            Copi
          </h1>

          <button
            onClick={openAddModal}
            className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg transition font-medium"
          >
            Ajouter DB
          </button>
        </div>

        {errorMessage && (
          <div className="mb-4 bg-red-900/40 text-red-400 px-4 py-2 rounded-lg">
            {errorMessage}
          </div>
        )}

        {/* JOB LIST */}
        <section className="bg-slate-800 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">My backups</h2>

            {serverTime &&
              <div className="text-sm text-slate-300 font-mono bg-slate-900/70 backdrop-blur px-4 py-2 rounded-xl border border-slate-700 shadow">
                ⏱ {formatClock(serverTime)}
              </div>
            }
          </div>

          <div className="space-y-4">
            {jobs.length === 0 && (
              <p className="text-slate-400 text-sm">
                Aucun job configuré
              </p>
            )}

            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-slate-900 rounded-2xl p-6 border border-slate-700 hover:border-indigo-500 transition-all duration-200"
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
                        <span className="text-slate-300 font-medium">
                          Dernière sauvegarde :
                        </span>{" "}
                        {formatRelativeTime(job.lastSuccessTime)}
                      </p>

                      <p>
                        <span className="text-slate-300 font-medium">
                          Prochaine exécution :
                        </span>{" "}
                        {formatFutureTime(job.nextExecutionTime)}
                      </p>

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

                    {/* Versions badge */}
                    <span className="bg-emerald-900/40 text-emerald-400 text-sm px-3 py-1 rounded-full">
                      {job.versionCount ?? 0} Versions
                    </span>

                    {/* Actions */}
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
                        className="bg-slate-800 hover:bg-slate-700 border border-slate-600 px-3 py-2 rounded-lg text-sm transition"
                      >
                        ✏
                      </button>

                      <button className="bg-slate-800 hover:bg-slate-700 border border-slate-600 px-3 py-2 rounded-lg text-sm transition">
                        ⋮
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <JobModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={fetchJobs}
        jobToEdit={jobToEdit}
      />
    </div>
  );
}

export default App;
