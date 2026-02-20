import { useEffect, useState } from "react";
import JobModal from "./components/JobModal";

function App() {
  const [jobs, setJobs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jobToEdit, setJobToEdit] = useState(null);

  const fetchJobs = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/jobs");
      const data = await response.json();
      setJobs(data);
    } catch (error) {
      console.error("Erreur API:", error);
    }
  };

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
            Backup-db / Dashboard
          </h1>

          <button
            onClick={openAddModal}
            className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg transition font-medium"
          >
            Ajouter DB
          </button>
        </div>

        {/* JOB LIST */}
        <section className="bg-slate-800 rounded-2xl p-6 shadow-lg">
          <h2 className="text-lg font-semibold mb-6">My backups</h2>

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
                        {job.lastSuccessTime || "—"}
                      </p>

                      <p>
                        <span className="text-slate-300 font-medium">
                          Prochaine exécution :
                        </span>{" "}
                        {job.nextExecutionTime || "—"}
                      </p>

                      <p>
                        <span className="text-slate-300 font-medium">
                          Host :
                        </span>{" "}
                        {job.host}:{job.port}
                      </p>
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
                      <button className="bg-slate-800 hover:bg-slate-700 border border-slate-600 px-4 py-2 rounded-lg text-sm transition">
                        Start
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
