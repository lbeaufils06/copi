import { useEffect, useState } from "react";
import JobModalWrapper from "../components/JobModalWrapper";
import ExecutionModalWrapper from "../components/ExecutionModalWrapper";
import { useApi } from "../utils/useApi";
import Header from "../components/Header";
import JobList from "../components/JobList";
import { Routes, Route, useNavigate, useParams } from "react-router-dom";
import { syncServerTime, syncServerTimeNow } from "../utils/time";

function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [serverTime, setServerTime] = useState(null);
  const [serverOffline, setServerOffline] = useState(false);
  const { apiFetch } = useApi();
  const navigate = useNavigate();

  const openAddModal = () => {
    navigate("/job/new");
  };

  const openEditModal = (job) => {
    navigate(`/job/${job.id}`);
  };

  const openExecutions = (job) => {
    navigate(`/job/executions/${job.id}`);
  };

  const fetchJobs = async () => {
    try {
      const data = await apiFetch("/api/jobs");

      // 🔥 Synchronisation avec l'heure serveur
      syncServerTime(data.serverTime);

      setJobs(data.jobs ?? []);
      setServerTime(syncServerTimeNow());
      setServerOffline(false);

    } catch (error) {
      console.error("Erreur API:", error);
      setServerOffline(true);
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
      const response = await apiFetch(
        `/api/jobs/${id}/start`,
        { method: "POST" }
      );
      
      if(!response) return;

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

  const handleLogout = async () => {
    try {
      await apiFetch("/api/logout", { method: "POST" });
      window.location.href = "/";
    } catch (error) {
      console.error("Erreur logout:", error);
    }
  };

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

  return (
    <>
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <Header
          serverTime={serverTime}
          formatClock={formatClock}
          onAdd={openAddModal}
        />

        {errorMessage && (
          <div className="mb-4 bg-red-900/40 text-red-400 px-4 py-2 rounded-lg">
            {errorMessage}
          </div>
        )}

        {/* JOB LIST */}
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
      <Route path="job/:id" element={<JobModalWrapper />} />
      <Route path="/job/executions/:id" element={<ExecutionModalWrapper />} />
    </Routes>
    </>
  );
}

export default Dashboard;
