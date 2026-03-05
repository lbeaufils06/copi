package com.backend.copi.scheduler;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

import com.backend.copi.scheduler.BackupPurgeScheduler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.backend.copi.entity.BackupJob;
import com.backend.copi.service.BackupExecutionService;
import com.backend.copi.service.BackupJobService;

class BackupPurgeSchedulerTest {

    private BackupJobService jobService;
    private BackupExecutionService executionService;
    private BackupPurgeScheduler scheduler;

    private Clock fixedClock;

    @BeforeEach
    void setup() {

        jobService = mock(BackupJobService.class);
        executionService = mock(BackupExecutionService.class);

        fixedClock = Clock.fixed(
                Instant.parse("2026-02-27T10:00:00Z"),
                ZoneId.of("UTC"));

        scheduler = new BackupPurgeScheduler(
                jobService,
                executionService,
                fixedClock
        );
    }

    @Test
    void checkRetention_shouldDoNothing_ifApplicationNotReady() {

        scheduler.checkRetention();

        verifyNoInteractions(jobService);
        verifyNoInteractions(executionService);
    }

    @Test
    void checkRetention_shouldInitializeNextPurge_ifNull() {

        scheduler.onApplicationReady();

        BackupJob job = new BackupJob();
        job.setId(UUID.randomUUID());
        job.setCronPurgeExpression("0 * * * * *"); // every minute
        job.setNextPurgeTime(null);

        when(jobService.getEnabledJobs()).thenReturn(List.of(job));

        scheduler.checkRetention();

        assertNotNull(job.getNextPurgeTime());
        verify(jobService).updateJobScheduler(eq(job.getId()), eq(job));
        verifyNoInteractions(executionService);
    }

    @Test
    void checkRetention_shouldApplyPurge_whenTimeReached() {

        scheduler.onApplicationReady();

        LocalDateTime now = LocalDateTime.of(2026, 2, 27, 10, 0);

        BackupJob job = new BackupJob();
        job.setId(UUID.randomUUID());
        job.setCronPurgeExpression("0 * * * * *"); // every minute
        job.setNextPurgeTime(now.minusMinutes(1)); // déjà dépassé

        when(jobService.getEnabledJobs()).thenReturn(List.of(job));

        scheduler.checkRetention();

        verify(executionService, times(1))
                .applyPurgeByCron(eq(job), any());

        verify(jobService, atLeastOnce())
                .updateJobScheduler(eq(job.getId()), eq(job));

        assertTrue(job.getNextPurgeTime().isAfter(now.minusMinutes(1)));
    }

    @Test
    void checkRetention_shouldSkip_ifCronBlank() {

        scheduler.onApplicationReady();

        BackupJob job = new BackupJob();
        job.setId(UUID.randomUUID());
        job.setCronPurgeExpression("   "); // blank
        job.setNextPurgeTime(null);

        when(jobService.getEnabledJobs()).thenReturn(List.of(job));

        scheduler.checkRetention();

        verifyNoInteractions(executionService);
        verify(jobService, never()).updateJobScheduler(any(), any());
    }
}