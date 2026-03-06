import { useEffect, useState, useRef } from "react";
import { useApi } from "../utils/useApi";
import { useLockBodyScroll } from "../hooks/useLockBodyScroll";

function ExecutionModal({ jobId, onClose }) {
  useLockBodyScroll();
  const { apiFetch } = useApi();

  const [executions, setExecutions] = useState([]);
  const [openId, setOpenId] = useState(null);
  const intervalRef = useRef(null);

  const fetchExecutions = async () => {
    try {
      const data = await apiFetch(`/api/executions/${jobId}`);
      setExecutions(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to fetch executions", e);
    }
  };

  useEffect(() => {
    fetchExecutions();

    intervalRef.current = setInterval(fetchExecutions, 1000);

    return () => clearInterval(intervalRef.current);
  }, [jobId]);

  const toggleExecution = (id) => {
    setOpenId(prev => (prev === id ? null : id));
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 w-[620px] max-h-[80vh] rounded-2xl shadow-xl p-6 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-white">
            Executions
          </h2>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto space-y-2 pr-1">

          {executions.length === 0 && (
            <p className="text-gray-400 text-sm">
              Aucune execution
            </p>
          )}

          {executions.map(exec => (
            <ExecutionCard
              key={exec.id}
              exec={exec}
              open={openId === exec.id}
              onToggle={() => toggleExecution(exec.id)}
            />
          ))}

        </div>
      </div>
    </div>
  );
}

function ExecutionCard({ exec, open, onToggle }) {

  const executionTime = exec.executionTime
    ? new Date(exec.executionTime).toLocaleString()
    : "—";

  const startTime = exec.startTime
    ? new Date(exec.startTime).toLocaleString()
    : "—";

  const endTime = exec.endTime
    ? new Date(exec.endTime).toLocaleString()
    : "—";

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden">

      {/* Header minimal */}

      <div
        className="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-700 transition select-none"
        onClick={onToggle}
      >

        <div className="text-sm text-gray-300">
          {executionTime}
        </div>

        <div className="flex items-center gap-3">
          <ModeBadge mode={exec.executionMode} />
          <StatusBadge status={exec.status} />
        </div>

      </div>

      {/* Details */}

      {open && (
        <div className="border-t border-gray-700 p-3 text-xs text-gray-400 space-y-2">

          <div>
            <span className="text-gray-500">Start:</span> {startTime}
          </div>

          <div>
            <span className="text-gray-500">End:</span> {endTime}
          </div>

          {exec.durationInSeconds !== null && (
            <div>
              <span className="text-gray-500">Duration:</span> {exec.durationInSeconds}s
            </div>
          )}

          {exec.fileName && (
            <div>
              <span className="text-gray-500">File:</span> {exec.fileName}
            </div>
          )}

          {exec.filePath && (
            <div className="break-all">
              <span className="text-gray-500">Path:</span> {exec.filePath}
            </div>
          )}

          {exec.logMessage && (
            <div>
              <span className="text-gray-500">Log:</span>
              <pre className="mt-1 whitespace-pre-wrap text-gray-300 bg-gray-900 p-2 rounded">
                {exec.logMessage}
              </pre>
            </div>
          )}

        </div>
      )}

    </div>
  );
}

function StatusBadge({ status }) {

  if (status === "SUCCESS")
    return <span className="text-green-400 text-sm">SUCCESS</span>;

  if (status === "FAILED")
    return <span className="text-red-400 text-sm">FAILED</span>;

  if (status === "RUNNING")
    return (
      <div className="flex items-center gap-2 text-yellow-400 text-sm">
        <div className="w-3 h-3 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        RUNNING
      </div>
    );

  return (
    <span className="text-gray-400 text-sm">
      {status}
    </span>
  );
}

function ModeBadge({ mode }) {

  if (mode === "MANUAL")
    return (
      <span className="text-xs px-2 py-0.5 rounded text-blue-300">
        MANUAL
      </span>
    );

  if (mode === "SCHEDULED")
    return (
      <span className="text-xs px-2 py-0.5 rounded text-purple-300">
        CRON
      </span>
    );

  return null;
}

export default ExecutionModal;