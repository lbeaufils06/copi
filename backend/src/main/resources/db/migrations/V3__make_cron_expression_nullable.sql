PRAGMA foreign_keys=off;

BEGIN TRANSACTION;

-- 1️⃣ Renommer l'ancienne table
ALTER TABLE backup_job RENAME TO backup_job_old;

-- 2️⃣ Recréer la table avec cron_expression NULLABLE
CREATE TABLE backup_job (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    db_type TEXT NOT NULL,
    host TEXT NOT NULL,
    port INTEGER NOT NULL,
    db_name TEXT,
    username TEXT NOT NULL,
    password_encrypted TEXT NOT NULL,
    execution_mode TEXT NOT NULL,
    cron_expression TEXT, -- ✅ nullable maintenant
    retention_policy TEXT,
    cron_purge_expression TEXT,
    retention_count INTEGER,
    enabled INTEGER NOT NULL,
    compression_type TEXT
);

-- 3️⃣ Copier les données
INSERT INTO backup_job (
    id,
    name,
    db_type,
    host,
    port,
    db_name,
    username,
    password_encrypted,
    execution_mode,
    cron_expression,
    retention_policy,
    cron_purge_expression,
    retention_count,
    enabled,
    compression_type
)
SELECT
    id,
    name,
    db_type,
    host,
    port,
    db_name,
    username,
    password_encrypted,
    execution_mode,
    cron_expression,
    retention_policy,
    cron_purge_expression,
    retention_count,
    enabled,
    compression_type
FROM backup_job_old;

-- 4️⃣ Supprimer l’ancienne table
DROP TABLE backup_job_old;

COMMIT;

PRAGMA foreign_keys=on;