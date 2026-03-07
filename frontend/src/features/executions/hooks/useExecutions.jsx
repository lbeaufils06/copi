import { useEffect, useMemo, useRef, useState } from "react";
import { useApi } from "../../../shared/utils";
import { downloadExecutionFile } from "../lib/executionDownload";

export function useExecutions(jobId, t) {
  const { apiFetch } = useApi();

  const [executions, setExecutions] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [modeFilter, setModeFilter] = useState("ALL");
  const [periodFilter, setPeriodFilter] = useState("7D");
  const [query, setQuery] = useState("");
  const [downloadError, setDownloadError] = useState(null);
  const [downloadingExecutionId, setDownloadingExecutionId] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const intervalRef = useRef(null);

  const statusOptions = useMemo(
    () => [
      { value: "ALL", label: t("executions.allStatuses") },
      { value: "SUCCESS", label: t("jobs.status_success") },
      { value: "FAILED", label: t("jobs.status_failed") },
      { value: "RUNNING", label: t("jobs.status_running") },
    ],
    [t]
  );

  const modeOptions = useMemo(
    () => [
      { value: "ALL", label: t("executions.allModes") },
      { value: "SCHEDULED", label: t("executions.mode_cron") },
      { value: "MANUAL", label: t("executions.mode_manual") },
    ],
    [t]
  );

  const periodOptions = useMemo(
    () => [
      { value: "24H", label: t("executions.period24h") },
      { value: "7D", label: t("executions.period7d") },
      { value: "30D", label: t("executions.period30d") },
      { value: "ALL", label: t("executions.allPeriods") },
    ],
    [t]
  );

  // fetchExecutions: Fetches execution records for the current job and updates UI state.
  const fetchExecutions = async ({ silent = false } = {}) => {
    if (!silent) setIsInitialLoading(true);

    try {
      const data = await apiFetch(`/api/executions/${jobId}`);
      setExecutions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch executions", error);
    } finally {
      if (!silent) setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchExecutions({ silent: false });
    intervalRef.current = setInterval(() => fetchExecutions({ silent: true }), 3000);

    return () => clearInterval(intervalRef.current);
  }, [jobId]);

  const filteredExecutions = useMemo(() => {
    const now = Date.now();
    const periodMap = {
      "24H": 24 * 60 * 60 * 1000,
      "7D": 7 * 24 * 60 * 60 * 1000,
      "30D": 30 * 24 * 60 * 60 * 1000,
      ALL: null,
    };

    return executions.filter((exec) => {
      const statusOk = statusFilter === "ALL" || exec.status === statusFilter;
      const modeOk = modeFilter === "ALL" || exec.executionMode === modeFilter;

      const periodMs = periodMap[periodFilter];
      const executionDate = exec.executionTime ? new Date(exec.executionTime).getTime() : null;
      const periodOk = !periodMs || !executionDate || now - executionDate <= periodMs;

      const text = `${exec.fileName ?? ""} ${exec.filePath ?? ""} ${exec.logMessage ?? ""}`.toLowerCase();
      const queryOk = query.trim() === "" || text.includes(query.trim().toLowerCase());

      return statusOk && modeOk && periodOk && queryOk;
    });
  }, [executions, statusFilter, modeFilter, periodFilter, query]);

  // handleDownloadExecutionFile: Downloads the selected execution artifact and exposes download errors.
  const handleDownloadExecutionFile = async (exec) => {
    if (!exec?.id || downloadingExecutionId) return;

    setDownloadError(null);
    setDownloadingExecutionId(exec.id);

    try {
      const ok = await downloadExecutionFile(exec);
      if (!ok) {
        setDownloadError(t("executions.downloadError"));
        window.setTimeout(() => setDownloadError(null), 3000);
      }
    } finally {
      setDownloadingExecutionId(null);
    }
  };

  return {
    statusFilter,
    setStatusFilter,
    modeFilter,
    setModeFilter,
    periodFilter,
    setPeriodFilter,
    query,
    setQuery,
    downloadError,
    downloadingExecutionId,
    isInitialLoading,
    filteredExecutions,
    statusOptions,
    modeOptions,
    periodOptions,
    downloadExecutionFile: handleDownloadExecutionFile,
  };
}
