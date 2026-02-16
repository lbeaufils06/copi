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
    fetchJobs();
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
          <h2 className="text-lg font-semibold mb-4">Backup Jobs</h2>

          <div className="space-y-4">
            {jobs.length === 0 && (
              <p className="text-slate-400 text-sm">Aucun job configuré</p>
            )}

            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-slate-900 rounded-xl p-4 border border-slate-700 hover:border-indigo-500 transition"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">

                  <div>
                    <p className="text-xs uppercase text-slate-400">Nom</p>
                    <p className="font-semibold">{job.name}</p>
                  </div>

                  <div>
                    <p className="text-xs uppercase text-slate-400">Type</p>
                    <p className="font-semibold">{job.dbType}</p>
                  </div>

                  <div>
                    <p className="text-xs uppercase text-slate-400">Host</p>
                    <p className="font-semibold">
                      {job.host}:{job.port}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase text-slate-400">Next Run</p>
                    <p className="font-semibold">
                      {job.nextExecutionTime || "-"}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    onClick={() => openEditModal(job)}
                    className="bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded-lg text-sm transition"
                  >
                    Modifier
                  </button>
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
