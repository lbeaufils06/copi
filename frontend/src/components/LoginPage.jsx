import { useState, useContext } from "react";
import { AuthContext } from "./AuthContext";

export default function LoginPage() {
  const { login } = useContext(AuthContext);

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login("admin", password);
    } catch (err) {
      setError("Identifiants invalides");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-sm bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8">

        <div className="flex items-center justify-center gap-3">
            <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">
            Connexion Copi
            </h2>

            <img
                src="/copi.svg"
                alt="Copi logo : https://www.svgrepo.com/svg/506975/db-network-2"
                className="w-8 h-8 object-contain mb-6"
            />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="text"
            autoComplete="username"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-200 text-gray-500"
            value="admin"
            disabled
            />

          <input
            type="password"
            placeholder="Mot de passe"
            autoComplete="current-password"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        {error && (
          <div className="mt-4 text-sm text-red-600 text-center">
            {error}
          </div>
        )}

      </div>
    </div>
  );
}