package com.backend.copi.entity;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDateTime;
import java.util.UUID;

import org.junit.jupiter.api.Test;

import com.backend.copi.enums.ExecutionStatus;

class BackupExecutionTest {

    @Test
    void shouldBuildBackupExecutionWithBuilder() {

        // given
        UUID id = UUID.randomUUID();
        BackupJob job = new BackupJob();
        job.setId(UUID.randomUUID());

        LocalDateTime start = LocalDateTime.of(2025, 1, 1, 10, 0);
        LocalDateTime end = LocalDateTime.of(2025, 1, 1, 10, 5);

        // when
        BackupExecution execution = BackupExecution.builder()
                .id(id)
                .job(job)
                .startTime(start)
                .endTime(end)
                .durationInSeconds(300L)
                .status(ExecutionStatus.SUCCESS)
                .logMessage("Backup completed")
                .filePath("/backups/db.sql")
                .fileName("db.sql")
                .build();

        // then
        assertThat(execution.getId()).isEqualTo(id);
        assertThat(execution.getJob()).isEqualTo(job);
        assertThat(execution.getStartTime()).isEqualTo(start);
        assertThat(execution.getEndTime()).isEqualTo(end);
        assertThat(execution.getDurationInSeconds()).isEqualTo(300L);
        assertThat(execution.getStatus()).isEqualTo(ExecutionStatus.SUCCESS);
        assertThat(execution.getLogMessage()).isEqualTo("Backup completed");
        assertThat(execution.getFilePath()).isEqualTo("/backups/db.sql");
        assertThat(execution.getFileName()).isEqualTo("db.sql");
    }

    @Test
    void shouldSetValuesUsingSetters() {

        BackupExecution execution = new BackupExecution();

        UUID id = UUID.randomUUID();
        execution.setId(id);
        execution.setDurationInSeconds(120L);
        execution.setStatus(ExecutionStatus.FAILED);

        assertThat(execution.getId()).isEqualTo(id);
        assertThat(execution.getDurationInSeconds()).isEqualTo(120L);
        assertThat(execution.getStatus()).isEqualTo(ExecutionStatus.FAILED);
    }
}