package com.backend.copi.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDateTime;

import javax.sql.DataSource;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.test.context.ActiveProfiles;

import com.backend.copi.entity.BackupJob;
import com.backend.copi.enums.DatabaseType;
import com.backend.copi.enums.ExecutionMode;
import com.backend.copi.enums.ExecutionStatus;

@DataJpaTest
@EntityScan(basePackages = "com.backend.copi.entity")
@EnableJpaRepositories(basePackages = "com.backend.copi.repository")
@ActiveProfiles("test")
class BackupJobRepositoryTest {

    @Autowired
    private BackupJobRepository jobRepository;

    @BeforeEach
    void cleanDatabase() {
        jobRepository.deleteAll();
    }

    private BackupJob createJob(String name, ExecutionStatus status) {

        BackupJob job = new BackupJob();
        job.setName(name);
        job.setDbType(DatabaseType.POSTGRESQL);
        job.setHost("localhost");
        job.setPort(5432);
        job.setDbName("testdb");
        job.setUsername("user");
        job.setPasswordEncrypted("encrypted");
        job.setEnabled(true);
        job.setVersionCount(0);
        job.setExecutionMode(ExecutionMode.SCHEDULED);
        job.setCronExpression("0 0 * * * *");
        job.setLastStatus(status);
        job.setLastSuccessTime(LocalDateTime.now());

        return jobRepository.save(job);
    }

    @Test
    void shouldFindJobsByLastStatus() {

        createJob("job1", ExecutionStatus.SUCCESS);
        createJob("job2", ExecutionStatus.FAILED);
        createJob("job3", ExecutionStatus.SUCCESS);

        var results = jobRepository.findByLastStatus(ExecutionStatus.SUCCESS);

        assertThat(results)
                .hasSize(2)
                .allMatch(job -> job.getLastStatus() == ExecutionStatus.SUCCESS);
    }
}