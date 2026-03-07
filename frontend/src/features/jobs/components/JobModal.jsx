import { useEffect, useState } from "react";
import { useApi } from "../../../shared/utils";
import { useLockBodyScroll } from "../../../hooks/useLockBodyScroll";
import { Loader } from "../../../shared/components";
import { useI18n } from "../../../i18n/I18nContext";
import { sanitizeJobForm, useJobFormOptions } from "../hooks/useJobFormOptions";
import {
  ConnectionSection,
  DatabaseSection,
  IdentitySection,
  RetentionSection,
  ScheduleSection,
} from "./job-modal/JobModalSections";

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
  const [isSaving, setIsSaving] = useState(false);

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
    if (isSaving) return;
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
    if (isSaving) return;

    setIsSaving(true);

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
      setIsSaving(false);
    }
  };

  if (!form) return <Loader text={t("common.loading")} />;

  const inputClass = "w-full bg-slate-900 border border-slate-600 p-3 pt-5 rounded-lg text-slate-100 placeholder:text-slate-400 focus:border-indigo-400";

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn sm:p-4"
      onClick={() => !isSaving && onClose()}
    >
      <div
        className="bg-slate-800 text-slate-100 w-full h-full max-w-none max-h-none rounded-none border-0 shadow-2xl flex flex-col sm:h-auto sm:max-w-xl sm:max-h-[92vh] sm:rounded-2xl sm:border sm:border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 p-4 sm:p-6 border-b border-slate-700 bg-slate-800 sm:rounded-t-2xl">
          <h2 className="text-xl font-semibold tracking-tight">{isEditMode ? t("modal.editJob") : t("modal.addJob")}</h2>
          <p className="text-sm text-slate-300 mt-1">{t("modal.intro")}</p>
        </div>

        <form
          id="job-form"
          onSubmit={handleSubmit}
          className={`custom-scrollbar flex-1 overflow-y-auto p-4 sm:p-6 pb-24 sm:pb-28 space-y-5 ${isSaving ? "pointer-events-none opacity-80" : ""}`}
        >
          <IdentitySection form={form} handleChange={handleChange} dbTypeOptions={dbTypeOptions} isEditMode={isEditMode} inputClass={inputClass} t={t} />

          <ConnectionSection
            form={form}
            handleChange={handleChange}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            inputClass={inputClass}
            t={t}
          />

          <DatabaseSection
            form={form}
            handleChange={handleChange}
            setUserModifiedDumpOptions={setUserModifiedDumpOptions}
            dbSelectionOptions={dbSelectionOptions}
            dumpOptionsModeOptions={dumpOptionsModeOptions}
            compressionOptions={compressionOptions}
            inputClass={inputClass}
            t={t}
          />

          <ScheduleSection
            form={form}
            handleChange={handleChange}
            setForm={setForm}
            executionModeOptions={executionModeOptions}
            cronOptions={cronOptions}
            inputClass={inputClass}
            t={t}
          />

          <RetentionSection form={form} handleChange={handleChange} retentionOptions={retentionOptions} inputClass={inputClass} t={t} />
        </form>

        <div className="sticky bottom-0 z-10 p-4 sm:p-6 border-t border-slate-700 bg-slate-800 sm:rounded-b-2xl">
          <div className="flex items-center justify-between gap-3">
            {isEditMode ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSaving}
                className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-500 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {t("common.delete")}
              </button>
            ) : (
              <span className="text-xs text-slate-400">{t("modal.createHint")}</span>
            )}

            <div className="flex gap-3 ml-auto">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {t("common.cancel")}
              </button>
              <button
                type="submit"
                form="job-form"
                disabled={isSaving}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition font-medium disabled:opacity-80 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                {isSaving && <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" aria-hidden="true" />}
                {isSaving ? t("common.loading") : isEditMode ? t("common.update") : t("common.save")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobModal;
