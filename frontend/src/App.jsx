import { useContext } from "react";
import { AuthContext } from "./components/AuthContext";
import LoginPage from "./components/LoginPage";
import MainApp from "./components/MainApp";

export default function App() {
  const { isAuthenticated, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return null; // ou spinner
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <MainApp />;
}