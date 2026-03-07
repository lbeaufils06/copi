PRAGMA foreign_keys=off;

BEGIN TRANSACTION;

ALTER TABLE backup_job RENAME TO backup_job_old;

CREATE TABLE backup_job (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    db_type TEXT NOT NULL,
    host TEXT NOT NULL,
    port INTEGER NOT NULL,
    db_name TEXT,
    username TEXT NOT NULL,
    password_encrypted TEXT NOT NULL,
    enabled INTEGER NOT NULL DEFAULT 1,
    cron_expression TEXT,
    next_execution_time DATETIME,
    retention_count INTEGER,
    retention_days INTEGER,
    retention_policy TEXT,
    last_success_time DATETIME,
    version_count INTEGER NOT NULL DEFAULT 0,
    last_status TEXT,
    last_status_message TEXT,
    compression_type TEXT,
    execution_mode TEXT NOT NULL,
    dump_options TEXT,
    authentication_database TEXT,
    dump_options_mode TEXT NOT NULL DEFAULT 'DEFAULT',
    db_name_options_mode TEXT NOT NULL DEFAULT 'ALL'
);

INSERT INTO backup_job (
    id,
    name,
    db_type,
    host,
    port,
    db_name,
    username,
    password_encrypted,
    enabled,
    cron_expression,
    next_execution_time,
    retention_count,
    retention_policy,
    last_success_time,
    version_count,
    last_status,
    last_status_message,
    compression_type,
    execution_mode,
    dump_options,
    authentication_database,
    dump_options_mode,
    db_name_options_mode
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
    enabled,
    cron_expression,
    next_execution_time,
    retention_count,
    retention_policy,
    last_success_time,
    version_count,
    last_status,
    last_status_message,
    compression_type,
    execution_mode,
    dump_options,
    authentication_database,
    dump_options_mode,
    db_name_options_mode
FROM backup_job_old;

DROP TABLE backup_job_old;

COMMIT;

PRAGMA foreign_keys=on;