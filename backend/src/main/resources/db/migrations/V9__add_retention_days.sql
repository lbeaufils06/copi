ALTER TABLE backup_job
ADD COLUMN dump_options_mode TEXT;

UPDATE backup_job
SET dump_options_mode = 'DEFAULT'
WHERE dump_options_mode IS NULL;

ALTER TABLE backup_job
ADD COLUMN db_name_options_mode TEXT;

UPDATE backup_job
SET db_name_options_mode = 'ALL'
WHERE db_name_options_mode IS NULL;