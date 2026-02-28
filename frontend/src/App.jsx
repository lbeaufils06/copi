import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./components/AuthContext";
import { AppContext } from "./utils/AppContext";
import { useApi } from "./utils/useApi";
import Loader from "./components/Loader";

function App() {
  const { isAuthenticated } = useAuth();

  const [defaults, setDefaults] = useState(null);
  const { apiFetch } = useApi();

  useEffect(() => {
    apiFetch("/api/jobs/defaults")
      .then(setDefaults);
  }, []);

  if (!defaults) {
    return <Loader text="Chargement..." />;
  }

  return (
    <AppContext.Provider 
    value={{
      jobDefaults: defaults.jobDefaults,
      dumpOptions: defaults.dumpOptions,
    }}>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/" replace /> : <Login />
          }
        />

        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />


      </Routes>
    </AppContext.Provider>
  );
}

export default App;