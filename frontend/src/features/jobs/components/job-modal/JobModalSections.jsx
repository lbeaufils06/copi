import { CustomSelect } from "../../../../shared/components";

// SectionTitle: Renders a consistent section heading style inside modal form sections.
function SectionTitle({ children }) {
  return <h3 className="text-sm font-semibold text-slate-200">{children}</h3>;
}

// LabeledInput: Renders an input field paired with a consistent inline label.
function LabeledInput({ id, name, value, onChange, label, className, ...props }) {
  return (
    <div className="relative">
      <input id={id} name={name} value={value} onChange={onChange} placeholder=" " className={className} {...props} />
      <label htmlFor={id} className="absolute left-3 top-2 text-xs text-slate-300 pointer-events-none">
        {label}
      </label>
    </div>
  );
}

export function IdentitySection({ form, handleChange, dbTypeOptions, isEditMode, inputClass, t }) {
  return (
    <section className="space-y-3">
      <SectionTitle>{t("modal.sectionIdentity")}</SectionTitle>

      <LabeledInput
        id="job-name"
        name="name"
        value={form.name}
        onChange={handleChange}
        disabled={isEditMode}
        required
        className={`${inputClass} ${isEditMode ? "opacity-60 cursor-not-allowed pointer-events-none" : ""}`}
        label={t("modal.jobName")}
      />

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
  );
}

export function ConnectionSection({
  form,
  handleChange,
  showPassword,
  setShowPassword,
  inputClass,
  t,
}) {
  return (
    <section className="space-y-3">
      <SectionTitle>{t("modal.sectionConnection")}</SectionTitle>

      <LabeledInput id="job-host" name="host" value={form.host} onChange={handleChange} required className={inputClass} label={t("modal.host")} />

      <LabeledInput
        id="job-number"
        type="number"
        name="port"
        value={form.port}
        onChange={handleChange}
        required
        className={inputClass}
        label={t("modal.port")}
      />

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
        <LabeledInput
          id="job-authDb"
          name="authenticationDatabase"
          value={form.authenticationDatabase}
          onChange={handleChange}
          className={inputClass}
          label={t("modal.authDb")}
        />
      )}
    </section>
  );
}

export function DatabaseSection({
  form,
  handleChange,
  setUserModifiedDumpOptions,
  dbSelectionOptions,
  dumpOptionsModeOptions,
  compressionOptions,
  inputClass,
  t,
}) {
  return (
    <section className="space-y-3">
      <SectionTitle>{t("modal.sectionDatabase")}</SectionTitle>

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
          <LabeledInput id="job-dbName" name="dbName" value={form.dbName} onChange={handleChange} className={inputClass} label={t("modal.dbName")} />
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
          <LabeledInput
            id="job-dumpOptions"
            name="dumpOptions"
            value={form.dumpOptions}
            onChange={(e) => {
              setUserModifiedDumpOptions(true);
              handleChange(e);
            }}
            className={inputClass}
            label={t("modal.advancedOptions")}
          />
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
  );
}

export function ScheduleSection({ form, handleChange, setForm, executionModeOptions, cronOptions, inputClass, t }) {
  return (
    <section className="space-y-3">
      <SectionTitle>{t("modal.sectionSchedule")}</SectionTitle>

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
          <LabeledInput
            id="job-cronExpression"
            name="cronExpression"
            value={form.cronExpression}
            onChange={handleChange}
            required
            className={inputClass}
            label={t("modal.customCronExpr")}
          />
        </div>
      )}
    </section>
  );
}

export function RetentionSection({ form, handleChange, retentionOptions, inputClass, t }) {
  return (
    <section className="space-y-3">
      <SectionTitle>{t("modal.sectionRetention")}</SectionTitle>

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
          <LabeledInput
            id="job-numberRetention"
            type="number"
            name="retentionCount"
            value={form.retentionCount}
            onChange={handleChange}
            min="1"
            required
            className={inputClass}
            label={t("modal.backupCountToKeep")}
          />
        </div>
      )}

      {form.retentionPolicy === "DAYS" && (
        <div className="relative border-l-4 rounded-lg border-l-indigo-500">
          <LabeledInput
            id="job-retentionDays"
            type="number"
            name="retentionDays"
            value={form.retentionDays}
            onChange={handleChange}
            min="1"
            required
            className={inputClass}
            label={t("modal.retentionDays")}
          />
        </div>
      )}
    </section>
  );
}
