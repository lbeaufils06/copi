import { useContext } from "react";
import { AuthContext } from "./components/AuthContext";
import LoginPage from "./components/LoginPage";
import MainApp from "./components/MainApp";

export default function App() {
  const { credentials } = useContext(AuthContext);

  if (!credentials) {
    return <LoginPage />;
  }

  return <MainApp />;
}