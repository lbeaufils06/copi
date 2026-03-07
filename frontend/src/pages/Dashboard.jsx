import { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import JobModalWrapper from "../components/JobModalWrapper";
import ExecutionModalWrapper from "../components/ExecutionModalWrapper";
import { useApi } from "../utils/useApi";
import Header from "../components/Header";
import JobList from "../components/JobList";
import { syncServerTime, syncServerTimeNow } from "../utils/time";
import { useJobDefaults } from "../hooks/useJobDefaults";
import Loader from "../components/Loader";

function Dashboard() {
  const { defaults, loading, error } = useJobDefaults();
  const [jobs, setJobs] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [serverTime, setServerTime] = useState(null);
  const [serverOffline, setServerOffline] = useState(false);
  const { apiFetch } = useApi();
  const navigate = useNavigate();

  const openAddModal = () => navigate("/job/new");
  const openEditModal = (job) => navigate(`/job/${job.id}`);
  const openExecutions = (job) => navigate(`/job/executions/${job.id}`);

  const fetchJobs = async () => {
    try {
      const data = await apiFetch("/api/jobs");

      syncServerTime(data.serverTime);
      setJobs(data.jobs ?? []);
      setServerTime(syncServerTimeNow());
      setServerOffline(false);
    } catch (fetchError) {
      console.error("Erreur API:", fetchError);
      setServerOffline(true);
    }
  };

  const formatClock = (date) => {
    const day = date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const time = date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    return `${day} a ${time}`;
  };

  const startJob = async (id) => {
    try {
      setJobs((prev) => prev.map((job) => (job.id === id ? { ...job, lastStatus: "RUNNING" } : job)));

      const requestPromise = apiFetch(`/api/jobs/${id}/start`, { method: "POST" });
      const delayPromise = new Promise((resolve) => setTimeout(resolve, 2000));
      const response = await requestPromise;

      await delayPromise;

      if (!response) return;

      if (response.status === 409) {
        setErrorMessage("Ce job est deja en cours");
        setTimeout(() => setErrorMessage(null), 3000);
        return;
      }

      if (!response.ok) {
        throw new Error("Erreur serveur");
      }

      await fetchJobs();
    } catch (startError) {
      console.error("Erreur lancement:", startError);
    }
  };

  useEffect(() => {
    if (!serverTime) return;

    const interval = setInterval(() => {
      setServerTime((prev) => new Date(prev.getTime() + 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [serverTime]);

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <Loader text="Chargement..." />;
  if (error) return <div className="text-red-300 p-4">Erreur lors du chargement</div>;

  return (
    <>
      <div className="min-h-screen bg-slate-900 text-slate-100 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <Header serverTime={serverTime} formatClock={formatClock} onAdd={openAddModal} />

          {errorMessage && <div className="mb-4 bg-red-900/40 text-red-200 px-4 py-2 rounded-lg border border-red-700">{errorMessage}</div>}

          <JobList
            jobs={jobs}
            serverOffline={serverOffline}
            startJob={startJob}
            openEditModal={openEditModal}
            openExecutions={openExecutions}
          />
        </div>
      </div>

      <Routes>
        <Route path="job/:id" element={<JobModalWrapper defaults={defaults} />} />
        <Route path="/job/executions/:id" element={<ExecutionModalWrapper />} />
      </Routes>
    </>
  );
}

export default Dashboard;
