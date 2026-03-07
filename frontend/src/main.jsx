import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./components/AuthContext";
import { BrowserRouter } from "react-router-dom";
import { I18nProvider } from "./i18n/I18nContext";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <I18nProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </I18nProvider>
  </BrowserRouter>
);
