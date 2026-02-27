package com.backend.copi.dto;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.Test;

import com.backend.copi.entity.BackupJob;

class JobsResponseTest {

    @Test
    void shouldCreateJobsResponseAndReturnValues() {

        // given
        LocalDateTime now = LocalDateTime.of(2025, 1, 1, 10, 0);

        BackupJob job = new BackupJob();
        job.setId(UUID.randomUUID());

        List<BackupJob> jobs = List.of(job);

        // when
        JobsResponse response = new JobsResponse(now, jobs);

        // then
        assertThat(response.getServerTime()).isEqualTo(now);
        assertThat(response.getJobs()).hasSize(1);
        assertThat(response.getJobs().get(0).getId()).isEqualTo(job.getId());
    }
}