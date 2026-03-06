ALTER TABLE backup_execution ADD COLUMN cron_execution DATETIME;
CREATE INDEX idx_backup_execution_cron ON backup_execution(cron_execution);