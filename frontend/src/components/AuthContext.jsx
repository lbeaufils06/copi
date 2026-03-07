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
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setSessionDuration(data);
      })
      .catch(() => {
        setSessionDuration(30 * 60 * 1000);
      });
  }, []);

  const startSessionTimer = () => {
    if (!sessionDuration) return;

    clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      logout();
    }, sessionDuration);
  };

  const login = async (username, password) => {
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username,
          password,
        }),
      });

      if (response.status === 401) {
        throw new Error("login.auth_invalid_credentials");
      }

      if (response.status >= 500) {
        throw new Error("login.auth_server_unavailable");
      }

      if (!response.ok) {
        throw new Error("login.auth_unknown_error");
      }

      setIsAuthenticated(true);
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error("login.auth_server_unavailable");
      }

      throw error;
    }
  };

  const logout = async () => {
    clearTimeout(timeoutRef.current);

    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // ignore
    }

    setIsAuthenticated(false);
  };

  useEffect(() => {
    fetch("/api/auth/check", {
      credentials: "include",
    })
      .then((res) => {
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

  useEffect(() => {
    if (!isAuthenticated) return;

    const events = ["click", "keydown", "mousemove", "touchstart"];

    const handleActivity = () => {
      startSessionTimer();
    };

    events.forEach((event) => window.addEventListener(event, handleActivity));

    return () => {
      events.forEach((event) => window.removeEventListener(event, handleActivity));
      clearTimeout(timeoutRef.current);
    };
  }, [isAuthenticated]);

  return <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
