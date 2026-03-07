import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { Loader } from "../shared/components";

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Loader text="VÃ©rification de la session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
