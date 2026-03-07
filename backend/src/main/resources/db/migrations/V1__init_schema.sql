CREATE TABLE IF NOT EXISTS backup_job (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    db_type TEXT NOT NULL,
    host TEXT NOT NULL,
    port INTEGER NOT NULL,
    db_name TEXT,
    username TEXT NOT NULL,
    password_encrypted TEXT NOT NULL,
    enabled INTEGER NOT NULL DEFAULT 1,
    cron_expression TEXT NOT NULL,
    cron_purge_expression TEXT,
    next_execution_time DATETIME,
    next_purge_time DATETIME,
    retention_count INTEGER,
    retention_policy TEXT,
    last_success_time DATETIME,
    version_count INTEGER NOT NULL DEFAULT 0,
    last_status TEXT,
    last_status_message TEXT,
    compression_type TEXT
)

CREATE TABLE IF NOT EXISTS backup_execution (
    id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL,
    start_time DATETIME,
    end_time DATETIME,
    duration_in_seconds INTEGER,
    status TEXT,
    log_message TEXT,
    file_path TEXT,
    file_name TEXT,
    FOREIGN KEY (job_id)
        REFERENCES backup_job(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_backup_job_enabled
ON backup_job(enabled);

CREATE INDEX IF NOT EXISTS idx_backup_job_next_execution
ON backup_job(next_execution_time);

CREATE INDEX IF NOT EXISTS idx_backup_execution_job
ON backup_execution(job_id);

CREATE INDEX IF NOT EXISTS idx_backup_execution_status
ON backup_execution(status);