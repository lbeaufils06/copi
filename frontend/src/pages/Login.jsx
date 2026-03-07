import { useState, useContext } from "react";
import { AuthContext } from "../components/AuthContext";
import { useI18n } from "../i18n/I18nContext";

export default function LoginPage() {
  const { login } = useContext(AuthContext);
  const { t } = useI18n();

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // handleSubmit: Submits job creation or update payload and closes modal on success.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login("admin", password);
    } catch (err) {
      setError(t(err.message) || t("common.defaultError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-sm bg-slate-800 border border-slate-700 shadow-xl rounded-2xl p-8">
        <div className="flex items-center justify-center gap-3">
          <h2 className="text-2xl font-bold text-center text-slate-100 mb-6">{t("login.title")}</h2>

          <img src="/copi.svg" alt="Copi logo" className="w-8 h-8 object-contain mb-6" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            autoComplete="username"
            className="login-input w-full px-4 py-2 border border-slate-600 rounded-lg bg-slate-900 text-slate-400 cursor-not-allowed"
            value="admin"
            disabled
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder={t("login.passwordPlaceholder")}
              autoComplete="current-password"
              className="login-input w-full px-4 py-2 pr-10 border border-slate-600 rounded-lg bg-slate-900 text-slate-100 placeholder:text-slate-400 focus:border-indigo-400"
              value={password}
              autoFocus
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              onMouseDown={(e) => e.preventDefault()}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-white"
              aria-label={showPassword ? t("modal.hidePassword") : t("modal.showPassword")}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9.27-3.11-11-7 1.02-2.29 2.74-4.18 4.86-5.4M9.88 9.88A3 3 0 0114.12 14.12M6.1 6.1l11.8 11.8"
                  />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm7.07 0C20.93 16.06 16.94 19 12 19S3.07 16.06 1.93 12C3.07 7.94 7.06 5 12 5s8.93 2.94 10.07 7z"
                  />
                </svg>
              )}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? t("login.submitting") : t("login.submit")}
          </button>
        </form>

        {error && <div className="mt-4 text-sm text-red-400 text-center">{error}</div>}
      </div>
    </div>
  );
}
