import { createContext, useState, useEffect, useRef } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {

  const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

  const [credentials, setCredentials] = useState(() =>
    sessionStorage.getItem("auth")
  );

  const timeoutRef = useRef(null);

  // 🔐 Démarre / redémarre le timer
  const startSessionTimer = () => {
    clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      logout();
    }, SESSION_DURATION);
  };

  // 🔄 Login
  const login = async (username, password) => {
    const basicAuth = "Basic " + btoa(`${username}:${password}`);

    const response = await fetch("/api/auth/check", {
      headers: { Authorization: basicAuth }
    });

    if (!response.ok) {
      throw new Error("Identifiants invalides");
    }

    setCredentials(basicAuth);
    sessionStorage.setItem("auth", basicAuth);
    startSessionTimer();
  };

  // 🔓 Logout centralisé
  const logout = () => {
    clearTimeout(timeoutRef.current);
    setCredentials(null);
    sessionStorage.removeItem("auth");
  };

  // 🧠 Timeout basé sur activité utilisateur (pas polling)
  useEffect(() => {
    if (!credentials) return;

    const events = ["click", "keydown"];

    const handleActivity = () => {
      startSessionTimer();
    };

    events.forEach(event =>
      window.addEventListener(event, handleActivity)
    );

    startSessionTimer(); // démarrage initial

    return () => {
      events.forEach(event =>
        window.removeEventListener(event, handleActivity)
      );
      clearTimeout(timeoutRef.current);
    };

  }, [credentials]);

  return (
    <AuthContext.Provider
      value={{
        credentials,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}