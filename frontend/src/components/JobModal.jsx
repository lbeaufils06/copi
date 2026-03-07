import { useEffect, useState } from "react";
import { useApi } from "../utils/useApi";
import { useLockBodyScroll } from "../hooks/useLockBodyScroll";
import Loader from "./Loader";

function JobModal({ jobId, defaults, onClose }) {
  useLockBodyScroll();

  const jobDefaults = defaults?.jobDefaults ?? {};
  const dumpOptions = defaults?.dumpOptions ?? {};
  const { apiFetch } = useApi();
  const isEditMode = jobId !== "new";
  const [form, setForm] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [userModifiedDumpOptions, setUserModifiedDumpOptions] = useState(false);

  const sanitizeForm = (data) => ({
    ...data,
    name: data.name ?? "",
    dbType: data.dbType ?? "",
    host: data.host ?? "",
    port: data.port ?? "",
    dbName: data.dbName ?? "",
    username: data.username ?? "",
    passwordEncrypted: "",
    authenticationDatabase: data.authenticationDatabase ?? "",
    cronExpression: data.cronExpression ?? "",
    executionMode: data.executionMode ?? "",
    retentionPolicy: data.retentionPolicy ?? "",
    cronPurgeExpression: data.cronPurgeExpression ?? "",
    retentionCount: data.retentionCount ?? 0,
    retentionDays: data.retentionDays ?? 1,
    compressionType: data.compressionType ?? "",
    dumpOptions: data.dumpOptions ?? "",
    dumpOptionsMode: data.dumpOptionsMode ?? "",
    dbNameOptionsMode: data.dbNameOptionsMode ?? "",
  });

  useEffect(() => {
    if (isEditMode && jobId) {
      apiFetch(`/api/jobs/${jobId}`)
        .then((data) => setForm(sanitizeForm(data)))
        .catch((err) => console.error("Erreur chargement job:", err));
      return;
    }

    setForm(sanitizeForm(jobDefaults));
  }, [jobId, isEditMode, jobDefaults]);

  useEffect(() => {
    if (!form || isEditMode || !dumpOptions || userModifiedDumpOptions) return;

    const defaultOptionsForDb = dumpOptions[form.dbType];
    if (defaultOptionsForDb !== undefined) {
      setForm((prev) => ({ ...prev, dumpOptions: defaultOptionsForDb }));
    }
  }, [form?.dbType, dumpOptions, isEditMode, userModifiedDumpOptions]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "executionMode") {
      setForm((prev) => ({
        ...prev,
        executionMode: value,
        cronExpression: value === "MANUAL" ? "" : prev.cronExpression || "0 0 * * * *",
      }));
      return;
    }

    if (name === "dumpOptions") {
      setUserModifiedDumpOptions(true);
    }

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleDelete = async () => {
    if (!window.confirm("Supprimer ce job ?")) return;

    try {
      await apiFetch(`/api/jobs/${jobId}`, { method: "DELETE" });
      onClose();
    } catch (error) {
      console.error("Erreur suppression:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = isEditMode ? `/api/jobs/${jobId}` : "/api/jobs";
      const method = isEditMode ? "PUT" : "POST";

      await apiFetch(url, {
        method,
        body: JSON.stringify({
          ...form,
          port: Number(form.port),
          retentionCount: form.retentionPolicy === "COUNT" ? Number(form.retentionCount) : null,
          retentionDays: form.retentionPolicy === "DAYS" ? Number(form.retentionDays) : null,
          cronPurgeExpression: form.retentionPolicy === "CRON" ? form.cronPurgeExpression : null,
        }),
      });

      onClose();
    } catch (error) {
      console.error("Erreur API:", error);
    }
  };

  if (!form) return <Loader text="Chargement..." />;

  const inputClass = "w-full bg-slate-900 border border-slate-600 p-3 pt-5 rounded-lg text-slate-100 placeholder:text-slate-400 focus:border-indigo-400";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn" onClick={onClose}>
      <div
        className="bg-slate-800 text-slate-100 rounded-2xl w-full max-w-xl shadow-2xl border border-slate-700 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 p-4 sm:p-6 border-b border-slate-700 bg-slate-800 rounded-t-2xl">
          <h2 className="text-xl font-semibold tracking-tight">{isEditMode ? "Modifier le job de backup" : "Ajouter un job de backup"}</h2>
          <p className="text-sm text-slate-300 mt-1">Renseignez les informations par section pour reduire les erreurs.</p>
        </div>

        <form id="job-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-200">Identification</h3>

            <div className="relative">
              <input
                id="job-name"
                name="name"
                value={form.name}
                onChange={handleChange}
                disabled={isEditMode}
                required
                placeholder=" "
                className={`${inputClass} ${isEditMode ? "opacity-60 cursor-not-allowed pointer-events-none" : ""}`}
              />
              <label htmlFor="job-name" className="absolute left-3 top-2 text-xs text-slate-300 pointer-events-none">
                Nom du job
              </label>
            </div>

            <div className="relative">
              <select
                id="job-dbType"
                name="dbType"
                value={form.dbType}
                onChange={handleChange}
                disabled={isEditMode}
                className={`${inputClass} ${isEditMode ? "opacity-60 cursor-not-allowed pointer-events-none" : ""}`}
              >
                <option value="MARIADB">MariaDB</option>
                <option value="MONGODB">MongoDB</option>
                <option value="MYSQL">MySQL</option>
                <option value="POSTGRESQL">PostgreSQL</option>
              </select>
              <label htmlFor="job-dbType" className="absolute left-3 top-2 text-xs text-slate-300 pointer-events-none">
                Type de base de donnees
              </label>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-200">Connexion</h3>

            <div className="relative">
              <input id="job-host" name="host" value={form.host} onChange={handleChange} required placeholder=" " className={inputClass} />
              <label htmlFor="job-host" className="absolute left-3 top-2 text-xs text-slate-300 pointer-events-none">
                Hote
              </label>
            </div>

            <div className="relative">
              <input id="job-number" type="number" name="port" value={form.port} onChange={handleChange} required placeholder=" " className={inputClass} />
              <label htmlFor="job-number" className="absolute left-3 top-2 text-xs text-slate-300 pointer-events-none">
                Port
              </label>
            </div>

            <div className="relative">
              <input
                id="job-username"
                name="username"
                value={form.username}
                onChange={handleChange}
                required
                autoComplete="off"
                placeholder=" "
                className={inputClass}
              />
              <label htmlFor="job-username" className="absolute left-3 top-2 text-xs text-slate-300">
                Nom utilisateur
              </label>
            </div>

            <div className="relative">
              <input
                id="job-password"
                type={showPassword ? "text" : "password"}
                name="passwordEncrypted"
                value={form.passwordEncrypted}
                onChange={handleChange}
                required
                autoComplete="new-password"
                placeholder=" "
                className={`${inputClass} pr-10`}
              />
              <label htmlFor="job-password" className="absolute left-3 top-2 text-xs text-slate-300">
                Mot de passe
              </label>

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                onMouseDown={(e) => e.preventDefault()}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-white transition"
              >
                <span className="icon-tooltip-text">{showPassword ? "Masquer" : "Afficher"}</span>
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

            {form.dbType === "MONGODB" && (
              <div className="relative">
                <input
                  id="job-authDb"
                  name="authenticationDatabase"
                  value={form.authenticationDatabase}
                  onChange={handleChange}
                  placeholder=" "
                  className={inputClass}
                />
                <label htmlFor="job-authDb" className="absolute left-3 top-2 text-xs text-slate-300 pointer-events-none">
                  Base d authentification
                </label>
              </div>
            )}
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-200">Base de donnees</h3>

            <div className="relative">
              <select id="job-dbNameOptionsMode" name="dbNameOptionsMode" value={form.dbNameOptionsMode} onChange={handleChange} className={inputClass}>
                <option value="ALL">Toutes</option>
                <option value="CUSTOM">Personnalisee</option>
              </select>
              <label htmlFor="job-dbNameOptionsMode" className="absolute left-3 top-2 text-xs text-slate-300 pointer-events-none">
                Selection des bases
              </label>
            </div>

            {form.dbNameOptionsMode === "CUSTOM" && (
              <div className="relative border-l-4 rounded-lg border-l-indigo-500">
                <input id="job-dbName" name="dbName" value={form.dbName} onChange={handleChange} placeholder=" " className={inputClass} />
                <label htmlFor="job-dbName" className="absolute left-3 top-2 text-xs text-slate-300 pointer-events-none">
                  Nom de la base
                </label>
              </div>
            )}

            <div className="relative">
              <select id="job-dumpOptionsMode" name="dumpOptionsMode" value={form.dumpOptionsMode} onChange={handleChange} className={inputClass}>
                <option value="DEFAULT">Par defaut</option>
                <option value="CUSTOM">Personnalise</option>
              </select>
              <label htmlFor="job-dumpOptionsMode" className="absolute left-3 top-2 text-xs text-slate-300 pointer-events-none">
                Options de dump
              </label>
            </div>

            {form.dumpOptionsMode === "CUSTOM" && (
              <div className="relative border-l-4 rounded-lg border-l-indigo-500">
                <input id="job-dumpOptions" name="dumpOptions" value={form.dumpOptions} onChange={handleChange} placeholder=" " className={inputClass} />
                <label htmlFor="job-dumpOptions" className="absolute left-3 top-2 text-xs text-slate-300 pointer-events-none">
                  Options avancees
                </label>
              </div>
            )}

            <div className="relative">
              <select id="job-compressionType" name="compressionType" value={form.compressionType} onChange={handleChange} className={inputClass}>
                <option value="NONE">Aucune</option>
                <option value="GZIP">GZIP (.gz)</option>
                <option value="ZIP">ZIP (.zip)</option>
              </select>
              <label htmlFor="job-compressionType" className="absolute left-3 top-2 text-xs text-slate-300 pointer-events-none">
                Compression
              </label>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-200">Planification</h3>

            <div className="relative">
              <select id="job-executionMode" name="executionMode" value={form.executionMode} onChange={handleChange} className={inputClass}>
                <option value="SCHEDULED">Cron</option>
                <option value="SCHEDULED_CUSTOM">Cron personnalise</option>
                <option value="MANUAL">Manuel</option>
              </select>
              <label htmlFor="job-executionMode" className="absolute left-3 top-2 text-xs text-slate-300 pointer-events-none">
                Mode d execution
              </label>
            </div>

            {form.executionMode === "SCHEDULED" && (
              <div className="relative border-l-4 rounded-lg border-l-indigo-500">
                <select
                  id="job-cron"
                  className={inputClass}
                  value={form.cronExpression}
                  required
                  onChange={(e) => setForm({ ...form, cronExpression: e.target.value })}
                >
                  <option value="*/30 * * * * *">Toutes les 30 secondes</option>
                  <option value="0 * * * * *">Toutes les minutes</option>
                  <option value="0 */30 * * * *">Toutes les 30 minutes</option>
                  <option value="0 0 * * * *">Toutes les heures</option>
                  <option value="0 0 */3 * * *">Toutes les 3 heures</option>
                  <option value="0 0 */6 * * *">Toutes les 6 heures</option>
                  <option value="0 0 */12 * * *">Toutes les 12 heures</option>
                  <option value="0 0 0 * * *">Tous les jours a 00h</option>
                  <option value="0 0 1 * * *">Tous les jours a 01h</option>
                  <option value="0 0 2 * * *">Tous les jours a 02h</option>
                  <option value="0 0 3 * * *">Tous les jours a 03h</option>
                  <option value="0 0 4 * * *">Tous les jours a 04h</option>
                  <option value="0 0 5 * * *">Tous les jours a 05h</option>
                  <option value="0 0 6 * * *">Tous les jours a 06h</option>
                  <option value="0 0 7 * * *">Tous les jours a 07h</option>
                  <option value="0 0 8 * * *">Tous les jours a 08h</option>
                  <option value="0 0 9 * * *">Tous les jours a 09h</option>
                  <option value="0 0 10 * * *">Tous les jours a 10h</option>
                  <option value="0 0 11 * * *">Tous les jours a 11h</option>
                  <option value="0 0 12 * * *">Tous les jours a 12h</option>
                  <option value="0 0 13 * * *">Tous les jours a 13h</option>
                  <option value="0 0 14 * * *">Tous les jours a 14h</option>
                  <option value="0 0 15 * * *">Tous les jours a 15h</option>
                  <option value="0 0 16 * * *">Tous les jours a 16h</option>
                  <option value="0 0 17 * * *">Tous les jours a 17h</option>
                  <option value="0 0 18 * * *">Tous les jours a 18h</option>
                  <option value="0 0 19 * * *">Tous les jours a 19h</option>
                  <option value="0 0 20 * * *">Tous les jours a 20h</option>
                  <option value="0 0 21 * * *">Tous les jours a 21h</option>
                  <option value="0 0 22 * * *">Tous les jours a 22h</option>
                  <option value="0 0 23 * * *">Tous les jours a 23h</option>
                </select>
                <label htmlFor="job-cron" className="absolute left-3 top-2 text-xs text-slate-300 pointer-events-none">
                  Frequence de backup
                </label>
              </div>
            )}

            {form.executionMode === "SCHEDULED_CUSTOM" && (
              <div className="relative border-l-4 rounded-lg border-l-indigo-500">
                <input
                  id="job-cronExpression"
                  name="cronExpression"
                  value={form.cronExpression}
                  onChange={handleChange}
                  required
                  placeholder=" "
                  className={inputClass}
                />
                <label htmlFor="job-cronExpression" className="absolute left-3 top-2 text-xs text-slate-300 pointer-events-none">
                  Expression cron personnalisee
                </label>
              </div>
            )}
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-200">Retention</h3>

            <div className="relative">
              <select id="job-retentionPolicy" name="retentionPolicy" value={form.retentionPolicy} onChange={handleChange} className={inputClass}>
                <option value="NONE">Aucune suppression automatique</option>
                <option value="COUNT">Limiter le nombre de sauvegardes</option>
                <option value="DAYS">Supprimer apres un nombre de jours</option>
              </select>
              <label htmlFor="job-retentionPolicy" className="absolute left-3 top-2 text-xs text-slate-300 pointer-events-none">
                Politique de retention
              </label>
            </div>

            {form.retentionPolicy === "COUNT" && (
              <div className="relative border-l-4 rounded-lg border-l-indigo-500">
                <input
                  id="job-numberRetention"
                  type="number"
                  name="retentionCount"
                  value={form.retentionCount}
                  onChange={handleChange}
                  min="1"
                  required
                  placeholder=" "
                  className={inputClass}
                />
                <label htmlFor="job-numberRetention" className="absolute left-3 top-2 text-xs text-slate-300 pointer-events-none">
                  Nombre de sauvegardes a conserver
                </label>
              </div>
            )}

            {form.retentionPolicy === "DAYS" && (
              <div className="relative border-l-4 rounded-lg border-l-indigo-500">
                <input
                  id="job-retentionDays"
                  type="number"
                  name="retentionDays"
                  value={form.retentionDays}
                  onChange={handleChange}
                  min="1"
                  required
                  placeholder=" "
                  className={inputClass}
                />
                <label htmlFor="job-retentionDays" className="absolute left-3 top-2 text-xs text-slate-300 pointer-events-none">
                  Nombre de jours a conserver
                </label>
              </div>
            )}
          </section>
        </form>

        <div className="sticky bottom-0 z-10 p-4 sm:p-6 border-t border-slate-700 bg-slate-800 rounded-b-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {isEditMode ? (
              <div className="flex items-center gap-3 bg-red-950/30 border border-red-800/60 rounded-lg px-3 py-2">
                <span className="text-xs text-red-300">Zone dangereuse</span>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-500 rounded-lg transition"
                >
                  Supprimer
                </button>
              </div>
            ) : (
              <span className="text-xs text-slate-400">Le job sera cree apres validation.</span>
            )}

            <div className="flex gap-3 ml-auto">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition">
                Annuler
              </button>
              <button type="submit" form="job-form" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition font-medium">
                {isEditMode ? "Mettre a jour" : "Sauvegarder"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobModal;
