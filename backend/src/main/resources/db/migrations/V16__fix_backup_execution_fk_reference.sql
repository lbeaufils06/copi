PRAGMA foreign_keys=off;

BEGIN TRANSACTION;

ALTER TABLE backup_execution RENAME TO backup_execution_old;

CREATE TABLE backup_execution (
    id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL,
    start_time DATETIME,
    end_time DATETIME,
    duration_in_seconds INTEGER,
    status TEXT,
    log_message TEXT,
    file_path TEXT,
    file_name TEXT,
    execution_time DATETIME,
    execution_mode TEXT NOT NULL,
    FOREIGN KEY (job_id)
        REFERENCES backup_job(id)
        ON DELETE CASCADE
);

INSERT INTO backup_execution (
    id,
    job_id,
    start_time,
    end_time,
    duration_in_seconds,
    status,
    log_message,
    file_path,
    file_name,
    execution_time,
    execution_mode
)
SELECT
    id,
    job_id,
    start_time,
    end_time,
    duration_in_seconds,
    status,
    log_message,
    file_path,
    file_name,
    execution_time,
    COALESCE(execution_mode, 'SCHEDULED')
FROM backup_execution_old;

DROP TABLE backup_execution_old;

CREATE INDEX IF NOT EXISTS idx_backup_execution_job
ON backup_execution(job_id);

CREATE INDEX IF NOT EXISTS idx_backup_execution_status
ON backup_execution(status);

CREATE INDEX IF NOT EXISTS idx_backup_execution_time
ON backup_execution(execution_time);

COMMIT;

PRAGMA foreign_keys=on;
