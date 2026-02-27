package com.backend.copi.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.Comparator;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import com.backend.copi.entity.BackupExecution;
import com.backend.copi.entity.BackupJob;
import com.backend.copi.enums.DatabaseType;
import com.backend.copi.enums.ExecutionMode;
import com.backend.copi.enums.ExecutionStatus;

import jakarta.transaction.Transactional;

@DataJpaTest
@ActiveProfiles("test")
@Transactional
class BackupExecutionRepositoryTest {

    @Autowired
    private BackupExecutionRepository executionRepository;

    @Autowired
    private BackupJobRepository jobRepository;

    private BackupJob job;

    private final LocalDateTime BASE_TIME =
            LocalDateTime.of(2025, 1, 1, 10, 0);

    @BeforeEach
    void setup() {

        // Nettoyage complet pour éviter accumulation SQLite
        executionRepository.deleteAll();
        jobRepository.deleteAll();

        job = new BackupJob();
        job.setName("Test Job");
        job.setDbType(DatabaseType.POSTGRESQL);
        job.setHost("localhost");
        job.setPort(5432);
        job.setDbName("testdb");
        job.setUsername("user");
        job.setPasswordEncrypted("encrypted-pass");
        job.setEnabled(true);
        job.setVersionCount(0);
        job.setExecutionMode(ExecutionMode.SCHEDULED);

        // Obligatoire car NOT NULL en SQLite
        job.setCronExpression("0 0 * * * ?");

        job = jobRepository.save(job);
    }

    @Test
    void shouldFindExecutionsOrderedByStartTimeDesc() {

        BackupExecution older = new BackupExecution();
        older.setJob(job);
        older.setStartTime(BASE_TIME.minusHours(1));
        older.setStatus(ExecutionStatus.SUCCESS);

        BackupExecution newer = new BackupExecution();
        newer.setJob(job);
        newer.setStartTime(BASE_TIME);
        newer.setStatus(ExecutionStatus.SUCCESS);

        executionRepository.save(older);
        executionRepository.save(newer);

        var results =
                executionRepository.findByJobIdOrderByStartTimeDesc(job.getId());

        assertThat(results).hasSize(2);
        assertThat(results.get(0).getStartTime())
                .isEqualTo(BASE_TIME);
        assertThat(results.get(1).getStartTime())
                .isEqualTo(BASE_TIME.minusHours(1));
    }

    @Test
    void shouldCountByJobIdAndStatus() {

        BackupExecution execution = new BackupExecution();
        execution.setJob(job);
        execution.setStartTime(BASE_TIME);
        execution.setStatus(ExecutionStatus.FAILED);

        executionRepository.save(execution);

        long count = executionRepository
                .countByJob_IdAndStatus(job.getId(), ExecutionStatus.FAILED);

        assertThat(count).isEqualTo(1);
    }

    @Test
    void shouldFindByStatus() {

        BackupExecution execution = new BackupExecution();
        execution.setJob(job);
        execution.setStartTime(BASE_TIME);
        execution.setStatus(ExecutionStatus.SUCCESS);

        executionRepository.save(execution);

        var results =
                executionRepository.findByStatus(ExecutionStatus.SUCCESS);

        assertThat(results)
                .hasSize(1)
                .allMatch(e -> e.getStatus() == ExecutionStatus.SUCCESS);
    }

    @Test
    void shouldDeleteByStatus() {

        BackupExecution execution = new BackupExecution();
        execution.setJob(job);
        execution.setStartTime(BASE_TIME);
        execution.setStatus(ExecutionStatus.FAILED);

        executionRepository.save(execution);

        long deleted =
                executionRepository.deleteByStatus(ExecutionStatus.FAILED);

        assertThat(deleted).isEqualTo(1);
        assertThat(executionRepository.findAll()).isEmpty();
    }
    
    @AfterEach
    void cleanBackupFolder() throws IOException {

        Path backupPath = Path.of("backups", "test_job");

        if (Files.exists(backupPath)) {
            Files.walk(backupPath)
                    .sorted(Comparator.reverseOrder())
                    .map(Path::toFile)
                    .forEach(file -> file.delete());
        }
    }
}