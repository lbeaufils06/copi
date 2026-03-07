import { useEffect, useState } from "react";
import { useApi } from "../../../utils/useApi";
import { useLockBodyScroll } from "../../../hooks/useLockBodyScroll";
import Loader from "../../../components/Loader";
import { useI18n } from "../../../i18n/I18nContext";
import CustomSelect from "../../../components/CustomSelect";
import { sanitizeJobForm, useJobFormOptions } from "../hooks/useJobFormOptions";

function JobModal({ jobId, defaults, onClose }) {
  useLockBodyScroll();

  const jobDefaults = defaults?.jobDefaults ?? {};
  const dumpOptions = defaults?.dumpOptions ?? {};
  const { apiFetch } = useApi();
  const { t, locale } = useI18n();
  const isEditMode = jobId !== "new";
  const [form, setForm] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [userModifiedDumpOptions, setUserModifiedDumpOptions] = useState(false);

  const {
    dbTypeOptions,
    dbSelectionOptions,
    dumpOptionsModeOptions,
    compressionOptions,
    executionModeOptions,
    retentionOptions,
    cronOptions,
  } = useJobFormOptions(locale, t);

  useEffect(() => {
    if (isEditMode && jobId) {
      apiFetch(`/api/jobs/${jobId}`)
        .then((data) => setForm(sanitizeJobForm(data)))
        .catch((err) => console.error("Erreur chargement job:", err));
      return;
    }

    setForm(sanitizeJobForm(jobDefaults));
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
    if (!window.confirm(t("modal.deleteConfirm"))) return;

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

  if (!form) return <Loader text={t("common.loading")} />;

  const inputClass = "w-full bg-slate-900 border border-slate-600 p-3 pt-5 rounded-lg text-slate-100 placeholder:text-slate-400 focus:border-indigo-400";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn sm:p-4" onClick={onClose}>
      <div
        className="bg-slate-800 text-slate-100 w-full h-full max-w-none max-h-none rounded-none border-0 shadow-2xl flex flex-col sm:h-auto sm:max-w-xl sm:max-h-[92vh] sm:rounded-2xl sm:border sm:border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 p-4 sm:p-6 border-b border-slate-700 bg-slate-800 sm:rounded-t-2xl">
          <h2 className="text-xl font-semibold tracking-tight">{isEditMode ? t("modal.editJob") : t("modal.addJob")}</h2>
          <p className="text-sm text-slate-300 mt-1">{t("modal.intro")}</p>
        </div>

        <form id="job-form" onSubmit={handleSubmit} className="custom-scrollbar flex-1 overflow-y-auto p-4 sm:p-6 pb-24 sm:pb-28 space-y-5">
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-200">{t("modal.sectionIdentity")}</h3>

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
                {t("modal.jobName")}
              </label>
            </div>

            <CustomSelect
              id="job-dbType"
              name="dbType"
              value={form.dbType}
              options={dbTypeOptions}
              onChange={handleChange}
              disabled={isEditMode}
              label={t("modal.dbType")}
            />
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-200">{t("modal.sectionConnection")}</h3>

            <div className="relative">
              <input id="job-host" name="host" value={form.host} onChange={handleChange} required placeholder=" " className={inputClass} />
              <label htmlFor="job-host" className="absolute left-3 top-2 text-xs text-slate-300 pointer-events-none">
                {t("modal.host")}
              </label>
            </div>

            <div className="relative">
              <input id="job-number" type="number" name="port" value={form.port} onChange={handleChange} required placeholder=" " className={inputClass} />
              <label htmlFor="job-number" className="absolute left-3 top-2 text-xs text-slate-300 pointer-events-none">
                {t("modal.port")}
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
                {t("modal.username")}
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
                {t("modal.password")}
              </label>

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                onMouseDown={(e) => e.preventDefault()}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-300 hover:text-white transition"
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
                  {t("modal.authDb")}
                </label>
              </div>
            )}
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-200">{t("modal.sectionDatabase")}</h3>

            <CustomSelect
              id="job-dbNameOptionsMode"
              name="dbNameOptionsMode"
              value={form.dbNameOptionsMode}
              options={dbSelectionOptions}
              onChange={handleChange}
              label={t("modal.dbSelection")}
            />

            {form.dbNameOptionsMode === "CUSTOM" && (
              <div className="relative border-l-4 rounded-lg border-l-indigo-500">
                <input id="job-dbName" name="dbName" value={form.dbName} onChange={handleChange} placeholder=" " className={inputClass} />
                <label htmlFor="job-dbName" className="absolute left-3 top-2 text-xs text-slate-300 pointer-events-none">
                  {t("modal.dbName")}
                </label>
              </div>
            )}

            <CustomSelect
              id="job-dumpOptionsMode"
              name="dumpOptionsMode"
              value={form.dumpOptionsMode}
              options={dumpOptionsModeOptions}
              onChange={handleChange}
              label={t("modal.dumpOptionsMode")}
            />

            {form.dumpOptionsMode === "CUSTOM" && (
              <div className="relative border-l-4 rounded-lg border-l-indigo-500">
                <input id="job-dumpOptions" name="dumpOptions" value={form.dumpOptions} onChange={handleChange} placeholder=" " className={inputClass} />
                <label htmlFor="job-dumpOptions" className="absolute left-3 top-2 text-xs text-slate-300 pointer-events-none">
                  {t("modal.advancedOptions")}
                </label>
              </div>
            )}

            <CustomSelect
              id="job-compressionType"
              name="compressionType"
              value={form.compressionType}
              options={compressionOptions}
              onChange={handleChange}
              label={t("modal.compression")}
            />
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-200">{t("modal.sectionSchedule")}</h3>

            <CustomSelect
              id="job-executionMode"
              name="executionMode"
              value={form.executionMode}
              options={executionModeOptions}
              onChange={handleChange}
              label={t("modal.modeExecution")}
            />

            {form.executionMode === "SCHEDULED" && (
              <div className="relative border-l-4 rounded-lg border-l-indigo-500">
                <CustomSelect
                  id="job-cron"
                  name="cronExpression"
                  value={form.cronExpression}
                  options={cronOptions}
                  onChange={(e) => setForm((prev) => ({ ...prev, cronExpression: e.target.value }))}
                  label={t("modal.backupFrequency")}
                />
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
                  {t("modal.customCronExpr")}
                </label>
              </div>
            )}
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-200">{t("modal.sectionRetention")}</h3>

            <CustomSelect
              id="job-retentionPolicy"
              name="retentionPolicy"
              value={form.retentionPolicy}
              options={retentionOptions}
              onChange={handleChange}
              label={t("modal.retentionPolicy")}
            />

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
                  {t("modal.backupCountToKeep")}
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
                  {t("modal.retentionDays")}
                </label>
              </div>
            )}
          </section>
        </form>

        <div className="sticky bottom-0 z-10 p-4 sm:p-6 border-t border-slate-700 bg-slate-800 sm:rounded-b-2xl">
          <div className="flex items-center justify-between gap-3">
            {isEditMode ? (
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-500 rounded-lg transition"
              >
                {t("common.delete")}
              </button>
            ) : (
              <span className="text-xs text-slate-400">{t("modal.createHint")}</span>
            )}

            <div className="flex gap-3 ml-auto">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition">
                {t("common.cancel")}
              </button>
              <button type="submit" form="job-form" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition font-medium">
                {isEditMode ? t("common.update") : t("common.save")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobModal;

