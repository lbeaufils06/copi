import { useEffect, useState, useCallback } from "react";
import { useApi } from "../shared/utils";

export function useJobDefaults() {
  const { apiFetch } = useApi();

  const [defaults, setDefaults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    apiFetch("/api/jobs/defaults")
      .then((data) => {
        setDefaults(data);
      })
      .catch((err) => {
        console.error("Erreur chargement defaults:", err);
        setError(err);
      })
      .finally(() => {
        setLoading(false);
      });

  }, []); // ðŸ”¥ PAS de dÃ©pendance

  return {
    defaults,
    loading,
    error,
  };
}
