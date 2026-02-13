CREATE TABLE backup_job (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    db_type TEXT NOT NULL,
    host TEXT NOT NULL,
    port INTEGER NOT NULL,
    db_name TEXT,
    username TEXT NOT NULL,
    password_encrypted TEXT NOT NULL,
    cron_expression TEXT NOT NULL,
    enabled INTEGER NOT NULL,
    next_execution_time TEXT
);

CREATE TABLE backup_execution (
    id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL,
    start_time TEXT,
    end_time TEXT,
    duration_in_seconds INTEGER,
    status TEXT,
    log_message TEXT,
    file_path TEXT,
    FOREIGN KEY (job_id) REFERENCES backup_job(id)
);
