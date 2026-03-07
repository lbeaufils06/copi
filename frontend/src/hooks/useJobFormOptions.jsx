import { useMemo } from "react";

export function useJobFormOptions(locale, t) {
  const dbTypeOptions = useMemo(
    () => [
      { value: "MARIADB", label: "MariaDB" },
      { value: "MONGODB", label: "MongoDB" },
      { value: "MYSQL", label: "MySQL" },
      { value: "POSTGRESQL", label: "PostgreSQL" },
    ],
    []
  );

  const dbSelectionOptions = useMemo(
    () => [
      { value: "ALL", label: t("modal.allDbs") },
      { value: "CUSTOM", label: t("modal.customDbs") },
    ],
    [t]
  );

  const dumpOptionsModeOptions = useMemo(
    () => [
      { value: "DEFAULT", label: t("modal.defaultOptions") },
      { value: "CUSTOM", label: t("modal.customOptions") },
    ],
    [t]
  );

  const compressionOptions = useMemo(
    () => [
      { value: "NONE", label: t("modal.noCompression") },
      { value: "GZIP", label: "GZIP (.gz)" },
      { value: "ZIP", label: "ZIP (.zip)" },
    ],
    [t]
  );

  const executionModeOptions = useMemo(
    () => [
      { value: "SCHEDULED", label: t("modal.cron") },
      { value: "SCHEDULED_CUSTOM", label: t("modal.customCron") },
      { value: "MANUAL", label: t("modal.manual") },
    ],
    [t]
  );

  const retentionOptions = useMemo(
    () => [
      { value: "NONE", label: t("modal.noAutoDelete") },
      { value: "COUNT", label: t("modal.limitBackupCount") },
      { value: "DAYS", label: t("modal.deleteAfterDays") },
    ],
    [t]
  );

  const cronOptions = useMemo(
    () => [
      { value: "*/30 * * * * *", label: locale === "fr" ? "Toutes les 30 secondes" : "Every 30 seconds" },
      { value: "0 * * * * *", label: locale === "fr" ? "Toutes les minutes" : "Every minute" },
      { value: "0 */30 * * * *", label: locale === "fr" ? "Toutes les 30 minutes" : "Every 30 minutes" },
      { value: "0 0 * * * *", label: locale === "fr" ? "Toutes les heures" : "Every hour" },
      { value: "0 0 */3 * * *", label: locale === "fr" ? "Toutes les 3 heures" : "Every 3 hours" },
      { value: "0 0 */6 * * *", label: locale === "fr" ? "Toutes les 6 heures" : "Every 6 hours" },
      { value: "0 0 */12 * * *", label: locale === "fr" ? "Toutes les 12 heures" : "Every 12 hours" },
      ...Array.from({ length: 24 }).map((_, hour) => ({
        value: `0 0 ${hour} * * *`,
        label: locale === "fr" ? `Tous les jours a ${String(hour).padStart(2, "0")}h` : `Every day at ${String(hour).padStart(2, "0")}:00`,
      })),
    ],
    [locale]
  );

  return {
    dbTypeOptions,
    dbSelectionOptions,
    dumpOptionsModeOptions,
    compressionOptions,
    executionModeOptions,
    retentionOptions,
    cronOptions,
  };
}

export function sanitizeJobForm(data) {
  return {
    ...data,
    name: data.name ?? "",
    dbType: data.dbType ?? "POSTGRESQL",
    host: data.host ?? "",
    port: data.port ?? "",
    dbName: data.dbName ?? "",
    username: data.username ?? "",
    passwordEncrypted: "",
    authenticationDatabase: data.authenticationDatabase ?? "",
    cronExpression: data.cronExpression ?? "0 0 * * * *",
    executionMode: data.executionMode ?? "SCHEDULED",
    retentionPolicy: data.retentionPolicy ?? "NONE",
    cronPurgeExpression: data.cronPurgeExpression ?? "",
    retentionCount: data.retentionCount ?? 0,
    retentionDays: data.retentionDays ?? 1,
    compressionType: data.compressionType ?? "GZIP",
    dumpOptions: data.dumpOptions ?? "",
    dumpOptionsMode: data.dumpOptionsMode ?? "DEFAULT",
    dbNameOptionsMode: data.dbNameOptionsMode ?? "ALL",
  };
}
