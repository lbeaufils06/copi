import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApi } from "../utils/useApi";
import { useLockBodyScroll } from "../hooks/useLockBodyScroll";

function ExecutionModal({ jobId, onClose }) {
  useLockBodyScroll();
  const { apiFetch } = useApi();

  const [executions, setExecutions] = useState([]);
  const intervalRef = useRef(null);

  const fetchExecutions = async () => {
    const data = await apiFetch(`/api/executions/${jobId}`);
    setExecutions(Array.isArray(data) ? data : []);
    };

  useEffect(() => {
    fetchExecutions();

    intervalRef.current = setInterval(() => {
      fetchExecutions();
    }, 1000);

    return () => {
      clearInterval(intervalRef.current);
    };
  }, [jobId]);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fadeIn"
        onClick={onClose}
    >
      <div className="bg-gray-900 w-[600px] max-h-[80vh] rounded-2xl shadow-xl p-6 flex flex-col"
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

        <div className="overflow-y-auto space-y-3">
          {executions.length === 0 && (
            <p className="text-gray-400 text-sm">
              Aucune execution
            </p>
          )}

          {executions.map(exec => (
            <div
              key={exec.id}
              className="flex justify-between items-center bg-gray-800 rounded-xl p-3"
            >
              <div className="text-sm text-gray-300">
                {new Date(exec.startTime).toLocaleString()}
              </div>

              <StatusBadge status={exec.status} />
            </div>
          ))}
        </div>
      </div>
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

  return <span className="text-gray-400 text-sm">{status}</span>;
}

export default ExecutionModal;