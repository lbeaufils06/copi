import { useEffect, useState } from "react";

function JobModal({ isOpen, onClose, onSaved, jobToEdit }) {
  const isEditMode = !!jobToEdit;
  const [isCustomCron, setIsCustomCron] = useState(false);
  const [isCustomCronPurge, setIsCustomCronPurge] = useState(false);

  const initialForm = {
    name: "",
    dbType: "MYSQL",
    host: "",
    port: "",
    dbName: "",
    username: "",
    passwordEncrypted: "",
    cronExpression: "0 0 * * * *",
    retentionPolicy: "NONE",
    cronPurgeExpression: "",
    retentionCount: 5,
    enabled: true,
    compressionType: "NONE",
  };

  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (isOpen) {
      if (jobToEdit) {
        setForm({
          ...jobToEdit,
          passwordEncrypted: "",
        });
      } else {
        setForm(initialForm);
      }
    }
  }, [isOpen, jobToEdit]);
  

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Voulez-vous vraiment supprimer ce job ?"
    );
    if (!confirmDelete) return;

    try {
      await fetch(`http://localhost:8080/api/jobs/${jobToEdit.id}`, {
        method: "DELETE",
      });

      onSaved();
      onClose();
      setForm(initialForm);
    } catch (error) {
      console.error("Erreur suppression:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = isEditMode
        ? `http://localhost:8080/api/jobs/${jobToEdit.id}`
        : "http://localhost:8080/api/jobs";

      const method = isEditMode ? "PUT" : "POST";

      await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          port: Number(form.port),
          retentionCount:
            form.retentionPolicy === "COUNT"
              ? Number(form.retentionCount)
              : null,

          cronPurgeExpression:
            form.retentionPolicy === "CRON"
              ? form.cronPurgeExpression
              : null,
        }),
      });

      onSaved();
      onClose();
      setForm(initialForm);
    } catch (error) {
      console.error("Erreur API:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-slate-800 text-slate-100 rounded-2xl w-full max-w-lg shadow-2xl border border-slate-700 max-h-[90vh] flex flex-col">

        {/* HEADER */}
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-xl font-semibold tracking-tight">
            {isEditMode ? "Modifier Backup Job" : "Ajouter Backup Job"}
          </h2>
        </div>

        {/* FORM SCROLLABLE */}
        <form
          id="job-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-2"
        >

          {/* Nom */}
          <div className="relative">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              disabled={isEditMode}
              required
              placeholder=" "
              className={`peer w-full bg-slate-900 border border-slate-700 p-3 pt-5 rounded-lg focus:outline-none focus:border-indigo-500 ${isEditMode ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}`}
            />
            <label className="absolute left-3 top-2 text-xs text-slate-400 transition-all 
              peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-500
              peer-focus:top-2 peer-focus:text-xs peer-focus:text-indigo-400">
              Nom du job
            </label>
          </div>

          {/* Type DB */}
          <div className="relative">
            <select
              name="dbType"
              value={form.dbType}
              onChange={handleChange}
              disabled={isEditMode}
              className={`w-full bg-slate-900 border border-slate-700 p-3 pt-5 rounded-lg focus:outline-none focus:border-indigo-500 ${isEditMode ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}`}
            >
              <option value="MYSQL">MySQL</option>
              <option value="POSTGRESQL">PostgreSQL</option>
            </select>
            <label className="absolute left-3 top-2 text-xs text-slate-400">
              Type de base de données
            </label>
          </div>

          {/* Compression */}
          <div className="relative">
            <select
              name="compressionType"
              value={form.compressionType}
              onChange={handleChange}
              disabled={isEditMode}
              className={`w-full bg-slate-900 border border-slate-700 p-3 pt-5 rounded-lg focus:outline-none focus:border-indigo-500 ${isEditMode ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}`}
            >
              <option value="NONE">Aucune</option>
              <option value="GZIP">GZIP (.gz)</option>
              <option value="ZIP">ZIP (.zip)</option>
            </select>

            <label className="absolute left-3 top-2 text-xs text-slate-400">
              Type de compression
            </label>
          </div>

          {/* Host */}
          <div className="relative">
            <input
              name="host"
              value={form.host}
              onChange={handleChange}
              disabled={isEditMode}
              required
              placeholder=" "
              className={`peer w-full bg-slate-900 border border-slate-700 p-3 pt-5 rounded-lg focus:outline-none focus:border-indigo-500 ${isEditMode ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}`}
            />
            <label className="absolute left-3 top-2 text-xs text-slate-400 transition-all 
              peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-500
              peer-focus:top-2 peer-focus:text-xs peer-focus:text-indigo-400">
              Host
            </label>
          </div>

          {/* Port */}
          <div className="relative">
            <input
              type="number"
              name="port"
              value={form.port}
              onChange={handleChange}
              disabled={isEditMode}
              required
              placeholder=" "
              className={`peer w-full bg-slate-900 border border-slate-700 p-3 pt-5 rounded-lg focus:outline-none focus:border-indigo-500 ${isEditMode ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}`}
            />
            <label className="absolute left-3 top-2 text-xs text-slate-400 transition-all 
              peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-500
              peer-focus:top-2 peer-focus:text-xs peer-focus:text-indigo-400">
              Port
            </label>
          </div>

          {/* Database */}
          <div className="relative">
            <input
              name="dbName"
              value={form.dbName}
              onChange={handleChange}
              placeholder=" "
              className="peer w-full bg-slate-900 border border-slate-700 p-3 pt-5 rounded-lg focus:outline-none focus:border-indigo-500"
            />
            <label className="absolute left-3 top-2 text-xs text-slate-400 transition-all 
              peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-500
              peer-focus:top-2 peer-focus:text-xs peer-focus:text-indigo-400">
              Nom de la base
            </label>
          </div>

          {/* Username */}
          <div className="relative">
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              autoComplete="username"
              placeholder=" "
              className="peer w-full bg-slate-900 border border-slate-700 p-3 pt-5 rounded-lg focus:outline-none focus:border-indigo-500"
            />
            <label className="absolute left-3 top-2 text-xs text-slate-400">
              Username
            </label>
          </div>


          {/* Password */}
          <div className="relative">
            <input
              type="password"
              name="passwordEncrypted"
              value={form.passwordEncrypted}
              onChange={handleChange}
              required
              autoComplete="current-password"
              placeholder=" "
              className="peer w-full bg-slate-900 border border-slate-700 p-3 pt-5 rounded-lg focus:outline-none focus:border-indigo-500"
            />
            <label className="absolute left-3 top-2 text-xs text-slate-400">
              Mot de passe
            </label>
          </div>

          {/* PLANIFICATION BACKUP */}
          {isCustomCron && (
            <div className="relative">
              <input
                name="cronExpression"
                value={form.cronExpression}
                onChange={handleChange}
                required
                placeholder=" "
                className="peer w-full bg-slate-900 border border-slate-700 p-3 pt-5 rounded-lg focus:outline-none focus:border-indigo-500"
              />
              <label className="absolute left-3 top-1.5 text-xs text-slate-400 transition-all 
                peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-500
                peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-indigo-400">
                Expression cron personnalisée
              </label>
            </div>
          )}

          <div className="relative">
            <select
              className="w-full bg-slate-900 border border-slate-700 p-3 pt-5 rounded-lg focus:outline-none focus:border-indigo-500"
              value={isCustomCron ? "custom" : form.cronExpression}
              required
              onChange={(e) => {
                const value = e.target.value;

                if (value === "custom") {
                  setIsCustomCron(true);
                  setForm({ ...form, cronExpression: "" });
                } else {
                  setIsCustomCron(false);
                  setForm({ ...form, cronExpression: value });
                }
              }}
            >
              <option value="*/30 * * * * *">30 secondes</option>
              <option value="0 * * * * *">1 minute</option>
              <option value="0 */30 * * * *">30 minutes</option>
              <option value="0 0 * * * *">1 heure</option>
              <option value="0 0 */3 * * *">3 heures</option>
              <option value="0 0 */6 * * *">6 heures</option>
              <option value="0 0 */12 * * *">12 heures</option>
              <option value="0 0 0 * * *">00h</option>
              <option value="0 0 2 * * *">02h</option>
              <option value="0 0 4 * * *">04h</option>
              <option value="0 0 6 * * *">06h</option>
              <option value="0 0 8 * * *">08h</option>
              <option value="0 0 10 * * *">10h</option>
              <option value="0 0 12 * * *">12h</option>
              <option value="0 0 14 * * *">14h</option>
              <option value="0 0 16 * * *">16h</option>
              <option value="0 0 20 * * *">20h</option>
              <option value="0 0 22 * * *">22h</option>
              <option value="custom">Choisir sa cron</option>
            </select>

            <label className="absolute left-3 top-1.5 text-xs text-slate-400">
              Planification du backup
            </label>
          </div>

          {/* Rétention */}
          <div className="relative">
            <select
              name="retentionPolicy"
              value={form.retentionPolicy}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 p-3 pt-5 rounded-lg focus:outline-none focus:border-indigo-500"
            >
              <option value="NONE">Aucune rétention automatique</option>
              <option value="COUNT">Limiter le nombre de sauvegardes</option>
            </select>
            <label className="absolute left-3 top-2 text-xs text-slate-400">
              Mode de rétention
            </label>
          </div>

          {form.retentionPolicy === "COUNT" && (
            <div className="relative">
              <input
                type="number"
                name="retentionCount"
                value={form.retentionCount}
                onChange={handleChange}
                min="1"
                required
                placeholder=" "
                className="peer w-full bg-slate-900 border border-slate-700 p-3 pt-5 rounded-lg focus:outline-none focus:border-indigo-500"
              />
              <label className="absolute left-3 top-2 text-xs text-slate-400 transition-all 
                peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-500
                peer-focus:top-2 peer-focus:text-xs peer-focus:text-indigo-400">
                Nombre de sauvegardes à conserver
              </label>
            </div>
          )}

          {form.retentionPolicy === "CRON" && (
            <>
              {isCustomCronPurge && (
                <div className="relative">
                  <input
                    name="cronPurgeExpression"
                    value={form.cronPurgeExpression}
                    className="peer w-full bg-slate-900 border border-slate-700 p-3 pt-5 rounded-lg focus:outline-none focus:border-indigo-500"
                    onChange={handleChange}
                    required
                  />
                <label className="absolute left-3 top-2 text-xs text-slate-400 transition-all 
                  peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-500
                  peer-focus:top-2 peer-focus:text-xs peer-focus:text-indigo-400">
                  Cron Purge (ex: 0 */10 * * * *)
                </label>
              </div>
              )}

              <div className="relative">
                <select
                  className="w-full bg-slate-900 border border-slate-700 p-3 pt-5 rounded-lg focus:outline-none focus:border-indigo-500"
                  value={isCustomCronPurge ? "customCronPurge" : form.cronPurgeExpression}
                  onChange={(e) => {
                    const value = e.target.value;

                    if (value === "customCronPurge") {
                      setIsCustomCronPurge(true);
                      setForm({ ...form, cronPurgeExpression: "" });
                    } else {
                      setIsCustomCronPurge(false);
                      setForm({ ...form, cronPurgeExpression: value });
                    }
                  }}
                >
                    <option value="">Choisir une fréquence</option>
                    <option value="customCronPurge">Choisir sa cron</option>

                    {/* Minutes */}
                    <option value="0 * * * * *">1 minute</option>
                    <option value="0 */5 * * * *">5 minutes</option>
                    <option value="0 */10 * * * *">10 minutes</option>
                    <option value="0 */30 * * * *">30 minutes</option>
                    <option value="0 */45 * * * *">45 minutes</option>

                    {/* Heures */}
                    <option value="0 0 * * * *">1 heure</option>
                    <option value="0 0 */2 * * *">2 heures</option>
                    <option value="0 0 */3 * * *">3 heures</option>
                    <option value="0 0 */4 * * *">4 heures</option>
                    <option value="0 0 */5 * * *">5 heures</option>
                    <option value="0 0 */6 * * *">6 heures</option>
                    <option value="0 0 */12 * * *">12 heures</option>

                    {/* Jours */}
                    <option value="0 0 0 * * *">1 jour</option>
                    <option value="0 0 0 */2 * *">2 jours</option>
                    <option value="0 0 0 */3 * *">3 jours</option>
                    <option value="0 0 0 */4 * *">4 jours</option>
                    <option value="0 0 0 */5 * *">5 jours</option>
                    <option value="0 0 0 */6 * *">6 jours</option>
                    <option value="0 0 0 */7 * *">7 jours</option>
                </select>
                <label className="absolute left-3 top-2 text-xs text-slate-400">
                  Cron
                </label>
              </div>
            </>
          )}


        </form>

        {/* FOOTER FIXE */}
        <div className="flex justify-between items-center p-6 border-t border-slate-700 bg-slate-800">

          {isEditMode && (
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
            >
              Supprimer
            </button>
          )}

          <div className="flex gap-3 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
            >
              Annuler
            </button>

            <button
              type="submit"
              form="job-form"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition font-medium"
            >
              {isEditMode ? "Mettre à jour" : "Sauvegarder"}
            </button>
          </div>

        </div>

      </div>
    </div>

  );
}

export default JobModal;
