import { useEffect, useState } from "react";

function JobModal({ isOpen, onClose, onSaved, jobToEdit }) {
  const isEditMode = !!jobToEdit;
  const [isCustomCron, setIsCustomCron] = useState(false);
  const [isCustomCronRetention, setIsCustomCronRetention] = useState(false);

  const initialForm = {
    name: "",
    dbType: "MYSQL",
    host: "",
    port: "",
    dbName: "",
    username: "",
    passwordEncrypted: "",
    cronExpression: "0 0 * * * *",
    cronRetention: "",
    retentionCount: 5,
    enabled: true,
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
          retentionCount: Number(form.retentionCount),
        }),
      });

      onSaved();
      onClose();
    } catch (error) {
      console.error("Erreur API:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-slate-800 text-slate-100 rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-slate-700">

        <h2 className="text-xl font-semibold mb-6 tracking-tight">
          {isEditMode ? "Modifier Backup Job" : "Ajouter Backup Job"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* INPUT STYLE */}
          <input
            name="name"
            value={form.name}
            placeholder="Nom"
            className="w-full bg-slate-900 border border-slate-700 p-2 rounded-lg focus:outline-none focus:border-indigo-500"
            onChange={handleChange}
            required
          />

          <select
            name="dbType"
            value={form.dbType}
            className="w-full bg-slate-900 border border-slate-700 p-2 rounded-lg focus:outline-none focus:border-indigo-500"
            onChange={handleChange}
          >
            <option value="MYSQL">MYSQL</option>
            <option value="POSTGRESQL">POSTGRESQL</option>
          </select>

          <input
            name="host"
            value={form.host}
            placeholder="Host"
            className="w-full bg-slate-900 border border-slate-700 p-2 rounded-lg focus:outline-none focus:border-indigo-500"
            onChange={handleChange}
            required
          />

          <input
            name="port"
            type="number"
            value={form.port}
            placeholder="Port"
            className="w-full bg-slate-900 border border-slate-700 p-2 rounded-lg focus:outline-none focus:border-indigo-500"
            onChange={handleChange}
            required
          />

          <input
            name="dbName"
            value={form.dbName}
            placeholder="Database Name"
            className="w-full bg-slate-900 border border-slate-700 p-2 rounded-lg focus:outline-none focus:border-indigo-500"
            onChange={handleChange}
          />

          <input
            name="username"
            value={form.username}
            placeholder="Username"
            className="w-full bg-slate-900 border border-slate-700 p-2 rounded-lg focus:outline-none focus:border-indigo-500"
            onChange={handleChange}
            required
          />

          <input
            name="passwordEncrypted"
            type="password"
            value={form.passwordEncrypted}
            placeholder="Password"
            className="w-full bg-slate-900 border border-slate-700 p-2 rounded-lg focus:outline-none focus:border-indigo-500"
            onChange={handleChange}
            required
          />

          {/* CRON */}
          {isCustomCron && (
            <input
              name="cronExpression"
              value={form.cronExpression}
              placeholder="Ex: 0 0 * * * *"
              className="w-full bg-slate-900 border border-slate-700 p-2 rounded-lg focus:outline-none focus:border-indigo-500"
              onChange={handleChange}
              required
            />
          )}

          <select
            className="w-full bg-slate-900 border border-slate-700 p-2 rounded-lg focus:outline-none focus:border-indigo-500"
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
            <option value="">Choisir une fréquence</option>
            <option value="custom">Choisir sa cron</option>

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
          </select>

          {isCustomCronRetention && (
          <input
            name="cronRetention"
            value={form.cronRetention}
            placeholder="Cron Retention (ex: 0 */10 * * * *)"
            className="w-full bg-slate-900 border border-slate-700 p-2 rounded-lg focus:outline-none focus:border-indigo-500"
            onChange={handleChange}
          />
          )}

          <select
            className="w-full bg-slate-900 border border-slate-700 p-2 rounded-lg focus:outline-none focus:border-indigo-500"
            value={isCustomCronRetention ? "customRetention" : form.cronRetention}
            onChange={(e) => {
              const value = e.target.value;

              if (value === "customRetention") {
                setIsCustomCronRetention(true);
                setForm({ ...form, cronRetention: "" });
              } else {
                setIsCustomCronRetention(false);
                setForm({ ...form, cronRetention: value });
              }
            }}
          >
            <option value="">Choisir une fréquence</option>
            <option value="customRetention">Choisir sa cron</option>

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
          </select>

          <input
            name="retentionCount"
            type="number"
            value={form.retentionCount}
            placeholder="Nombre de backups à garder"
            min="1"
            className="w-full bg-slate-900 border border-slate-700 p-2 rounded-lg focus:outline-none focus:border-indigo-500"
            onChange={handleChange}
          />


          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              name="enabled"
              checked={form.enabled}
              onChange={handleChange}
              className="accent-indigo-600"
            />
            Enabled
          </label>

          {/* BUTTONS */}
          <div className="flex justify-between items-center mt-6">

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
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition font-medium"
              >
                {isEditMode ? "Mettre à jour" : "Sauvegarder"}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}

export default JobModal;
