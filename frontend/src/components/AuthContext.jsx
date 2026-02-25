import { createContext, useState, useEffect, useRef, useContext } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {

  const [sessionDuration, setSessionDuration] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated && sessionDuration) {
      startSessionTimer();
    }
  }, [isAuthenticated, sessionDuration]);

  useEffect(() => {
    fetch("/api/session/config", {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        setSessionDuration(data)})
    .catch(() => {
      // fallback sécurité 30 min
      setSessionDuration(30 * 60 * 1000);
    });
  }, []);

  // 🔐 Démarre ou redémarre le timer d'inactivité
  const startSessionTimer = () => {
    if (!sessionDuration) return;

    clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      logout();
    }, sessionDuration);
  };

  // 🔑 LOGIN
  const login = async (username, password) => {
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          username,
          password
        })
      });

      if (response.status === 401) {
        throw new Error("Identifiants invalides");
      }

      if (response.status >= 500) {
        throw new Error("Serveur indisponible");
      }

      if (!response.ok) {
        throw new Error("Erreur inconnue");
      }

      setIsAuthenticated(true);

    } catch (error) {

      // ⚠️ Important : erreur réseau (serveur down)
      if (error instanceof TypeError) {
        throw new Error("Serveur indisponible");
      }

      throw error;
    }
  };

  // 🔓 LOGOUT
  const logout = async () => {
    clearTimeout(timeoutRef.current);

    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include"
      });
    } catch (e) {
      // ignore si déjà expiré
    }

    setIsAuthenticated(false);
  };

  // 🔍 Vérifie si session déjà active au chargement
  useEffect(() => {
    fetch("/api/auth/check", {
      credentials: "include"
    })
      .then(res => {
        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      })
      .catch(() => {
        setIsAuthenticated(false);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // 🧠 Gestion activité utilisateur (PAS le polling API)
  useEffect(() => {
    if (!isAuthenticated) return;

    const events = ["click", "keydown", "mousemove", "touchstart"];

    const handleActivity = () => {
      startSessionTimer();
    };

    events.forEach(event =>
      window.addEventListener(event, handleActivity)
    );

    return () => {
      events.forEach(event =>
        window.removeEventListener(event, handleActivity)
      );
      clearTimeout(timeoutRef.current);
    };

  }, [isAuthenticated]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);