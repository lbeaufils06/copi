package com.backend.copi.service.utils;

import com.backend.copi.entity.BackupJob;
import com.backend.copi.enums.CompressionType;
import com.backend.copi.enums.DatabaseType;
import com.backend.copi.enums.ExecutionMode;
import com.backend.copi.enums.RetentionPolicy;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class DefaultService {

    private static final Map<DatabaseType, String> DEFAULT_DUMP_OPTIONS = Map.of(
            DatabaseType.MYSQL, "--single-transaction --quick --routines --triggers --events --add-drop-table",
            DatabaseType.MARIADB, "--single-transaction --quick --routines --triggers --events --add-drop-table",
            DatabaseType.POSTGRESQL, "--clean --if-exists --no-owner",
            DatabaseType.MONGODB, ""
    );

    private static final String DEFAULT_CRON = "0 0 * * * *";
    private static final int DEFAULT_RETENTION = 5;

    public BackupJob getDefaults() {
        BackupJob job = new BackupJob();

        job.setDbType(DatabaseType.MARIADB);
        job.setCronExpression(DEFAULT_CRON);
        job.setExecutionMode(ExecutionMode.SCHEDULED);
        job.setRetentionPolicy(RetentionPolicy.NONE);
        job.setRetentionCount(DEFAULT_RETENTION);
        job.setEnabled(true);
        job.setCompressionType(CompressionType.NONE);
        job.setAuthenticationDatabase("admin");

        return job;
    }

    public String getDefaultOptions(DatabaseType type) {
        return DEFAULT_DUMP_OPTIONS.getOrDefault(type, "");
    }

    public Map<DatabaseType, String> getAllDefaultDumpOptions() {
        return DEFAULT_DUMP_OPTIONS;
    }
}