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
    <div className="min-h-screen bg-gray-100 p-10">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl p-6">
        <h1 className="text-2xl font-bold mb-6">
          Test API Backup Jobs
        </h1>

        <button
          onClick={openAddModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg mb-6"
        >
          Ajouter DB
        </button>

        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="border rounded-xl p-4 bg-gray-50">
              <p><strong>Nom:</strong> {job.name}</p>
              <p><strong>Type:</strong> {job.dbType}</p>
              <p><strong>Db:</strong> {job.host}:{job.port}</p>
              <p><strong>Next:</strong> {job.nextExecutionTime}</p>

              <button
                onClick={() => openEditModal(job)}
                className="mt-3 px-3 py-1 bg-yellow-500 text-white rounded"
              >
                Modifier
              </button>
            </div>
          ))}
        </div>
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
