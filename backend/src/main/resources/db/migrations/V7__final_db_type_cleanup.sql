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
    execution_mode TEXT NOT NULL,
    cron_expression TEXT,
    retention_policy TEXT,
    cron_purge_expression TEXT,
    retention_count INTEGER,
    enabled INTEGER NOT NULL,
    compression_type TEXT,
    dump_options TEXT
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
    execution_mode,
    cron_expression,
    retention_policy,
    cron_purge_expression,
    retention_count,
    enabled,
    compression_type,
    dump_options
)
SELECT
    id,
    name,
    CASE db_type
        WHEN '0' THEN 'MYSQL'
        WHEN '1' THEN 'POSTGRESQL'
        WHEN '2' THEN 'MARIADB'
        ELSE db_type
    END,
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
    compression_type,
    dump_options
FROM backup_job_old;

DROP TABLE backup_job_old;

COMMIT;
PRAGMA foreign_keys=on;