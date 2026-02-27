package com.backend.copi.entity;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDateTime;
import java.util.UUID;

import org.junit.jupiter.api.Test;

import com.backend.copi.enums.CompressionType;
import com.backend.copi.enums.DatabaseType;
import com.backend.copi.enums.ExecutionMode;
import com.backend.copi.enums.ExecutionStatus;
import com.backend.copi.enums.RetentionPolicy;

class BackupJobTest {

    @Test
    void shouldSetAndGetAllFieldsCorrectly() {

        BackupJob job = new BackupJob();

        UUID id = UUID.randomUUID();
        LocalDateTime now = LocalDateTime.of(2025, 1, 1, 10, 0);

        job.setId(id);
        job.setName("Daily Backup");
        job.setDbType(DatabaseType.POSTGRESQL);
        job.setHost("localhost");
        job.setPort(5432);
        job.setDbName("testdb");
        job.setUsername("admin");
        job.setPasswordEncrypted("encrypted-pass");
        job.setEnabled(false);
        job.setCronExpression("0 0 * * * *");
        job.setCronPurgeExpression("0 0 0 * * *");
        job.setNextExecutionTime(now);
        job.setNextPurgeTime(now.plusDays(1));
        job.setRetentionCount(10);
        job.setRetentionPolicy(RetentionPolicy.COUNT);
        job.setLastSuccessTime(now);
        job.setVersionCount(5);
        job.setLastStatus(ExecutionStatus.SUCCESS);
        job.setLastStatusMessage("All good");
        job.setCompressionType(CompressionType.ZIP);
        job.setExecutionMode(ExecutionMode.MANUAL);

        assertThat(job.getId()).isEqualTo(id);
        assertThat(job.getName()).isEqualTo("Daily Backup");
        assertThat(job.getDbType()).isEqualTo(DatabaseType.POSTGRESQL);
        assertThat(job.getHost()).isEqualTo("localhost");
        assertThat(job.getPort()).isEqualTo(5432);
        assertThat(job.getDbName()).isEqualTo("testdb");
        assertThat(job.getUsername()).isEqualTo("admin");
        assertThat(job.getPasswordEncrypted()).isEqualTo("encrypted-pass");
        assertThat(job.getEnabled()).isFalse();
        assertThat(job.getCronExpression()).isEqualTo("0 0 * * * *");
        assertThat(job.getCronPurgeExpression()).isEqualTo("0 0 0 * * *");
        assertThat(job.getNextExecutionTime()).isEqualTo(now);
        assertThat(job.getNextPurgeTime()).isEqualTo(now.plusDays(1));
        assertThat(job.getRetentionCount()).isEqualTo(10);
        assertThat(job.getRetentionPolicy()).isEqualTo(RetentionPolicy.COUNT);
        assertThat(job.getLastSuccessTime()).isEqualTo(now);
        assertThat(job.getVersionCount()).isEqualTo(5);
        assertThat(job.getLastStatus()).isEqualTo(ExecutionStatus.SUCCESS);
        assertThat(job.getLastStatusMessage()).isEqualTo("All good");
        assertThat(job.getCompressionType()).isEqualTo(CompressionType.ZIP);
        assertThat(job.getExecutionMode()).isEqualTo(ExecutionMode.MANUAL);
    }

    @Test
    void shouldHaveDefaultValues() {

        BackupJob job = new BackupJob();

        assertThat(job.getEnabled()).isTrue();
        assertThat(job.getVersionCount()).isEqualTo(0);
        assertThat(job.getExecutionMode()).isEqualTo(ExecutionMode.SCHEDULED);
    }
}