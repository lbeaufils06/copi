import { useEffect, useState } from "react";

function JobModal({ isOpen, onClose, onSaved, jobToEdit }) {
  const isEditMode = !!jobToEdit;
  const [isCustomCron, setIsCustomCron] = useState(false);

  const initialForm = {
    name: "",
    dbType: "MYSQL",
    host: "",
    port: "",
    dbName: "",
    username: "",
    passwordEncrypted: "",
    cronExpression: "0 0 * * * *",
    enabled: true,
  };

  const [form, setForm] = useState(initialForm);

  // 🔥 Pré-remplissage si édition
  useEffect(() => {
    if (isOpen) {
      if (jobToEdit) {
        setForm({
          ...jobToEdit,
          passwordEncrypted: "", // jamais pré-rempli
        });
      } else {
        setForm(initialForm); // 🔥 reset complet
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
    // 🔥 Double confirmation
    const confirm1 = window.confirm("Voulez-vous vraiment supprimer ce job ?");
    if (!confirm1) return;

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
        }),
      });

      onSaved();
      onClose();
    } catch (error) {
      console.error("Erreur API:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl">
        <h2 className="text-xl font-bold mb-4">
          {isEditMode ? "Modifier Backup Job" : "Ajouter Backup Job"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input name="name" value={form.name}
            placeholder="Nom"
            className="w-full border p-2 rounded"
            onChange={handleChange} required />

          <select name="dbType"
            value={form.dbType}
            className="w-full border p-2 rounded"
            onChange={handleChange}>
            <option value="MYSQL">MYSQL</option>
            <option value="POSTGRESQL">POSTGRESQL</option>
          </select>

          <input name="host" value={form.host}
            placeholder="Host"
            className="w-full border p-2 rounded"
            onChange={handleChange} required />

          <input name="port" value={form.port}
            type="number"
            placeholder="Port"
            className="w-full border p-2 rounded"
            onChange={handleChange} required />

          <input name="dbName" value={form.dbName}
            placeholder="Database Name"
            className="w-full border p-2 rounded"
            onChange={handleChange} />

          <input name="username" value={form.username}
            placeholder="Username"
            className="w-full border p-2 rounded"
            onChange={handleChange} required />

          <input name="passwordEncrypted"
            value={form.passwordEncrypted}
            placeholder="Password"
            type="password"
            className="w-full border p-2 rounded"
            onChange={handleChange} required />

          {isCustomCron && (
            <input
              name="cronExpression"
              value={form.cronExpression}
              placeholder="Ex: 0 0 * * * *"
              className="w-full border p-2 rounded mt-3"
              onChange={handleChange}
              required
            />
          )}


          <select
            className="w-full border p-2 rounded"
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


          <label className="flex items-center gap-2">
            <input type="checkbox"
              name="enabled"
              checked={form.enabled}
              onChange={handleChange} />
            Enabled
          </label>

          <div className="flex justify-between items-center mt-4">

            {/* Bouton Supprimer visible uniquement en édition */}
            {isEditMode && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Supprimer
              </button>
            )}

            <div className="flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Annuler
              </button>

              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
