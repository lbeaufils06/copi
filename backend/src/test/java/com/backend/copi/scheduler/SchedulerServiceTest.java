package com.backend.copi.scheduler;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.backend.copi.entity.BackupExecution;
import com.backend.copi.entity.BackupJob;
import com.backend.copi.enums.ExecutionMode;
import com.backend.copi.service.BackupExecutionService;
import com.backend.copi.service.BackupJobService;
import com.backend.copi.service.BackupStorageService;
import com.backend.copi.service.DumpService;

class SchedulerServiceTest {

    private BackupJobService jobService;
    private DumpService dumpService;
    private BackupExecutionService executionService;
    private BackupStorageService backupStorageService;
    private SchedulerService schedulerService;

    @BeforeEach
    void setup() {

        jobService = mock(BackupJobService.class);
        dumpService = mock(DumpService.class);
        executionService = mock(BackupExecutionService.class);
        backupStorageService = mock(BackupStorageService.class);

        Clock fixedClock = Clock.fixed(
                Instant.parse("2026-02-27T10:00:00Z"),
                ZoneId.of("UTC"));

        schedulerService = new SchedulerService(
                jobService,
                dumpService,
                executionService,
                fixedClock,
                backupStorageService
        );
    }

    @Test
    void countMissedOccurrences_shouldReturnZeroWhenNoGap() {

        LocalDateTime stored = LocalDateTime.of(2026, 2, 27, 10, 0);
        LocalDateTime next = LocalDateTime.of(2026, 2, 27, 10, 1);

        long result = schedulerService.countMissedOccurrences(
                stored,
                next,
                "0 * * * * *" // every minute
        );

        assertEquals(0, result);
    }

    @Test
    void countMissedOccurrences_shouldCountMissedRuns() {

        LocalDateTime stored = LocalDateTime.of(2026, 2, 27, 10, 0);
        LocalDateTime next = LocalDateTime.of(2026, 2, 27, 10, 5);

        long result = schedulerService.countMissedOccurrences(
                stored,
                next,
                "0 * * * * *" // every minute
        );

        assertEquals(4, result);
    }

    @Test
    void runManually_shouldExecuteJobSuccessfully() throws Exception {

        UUID jobId = UUID.randomUUID();

        BackupJob job = new BackupJob();
        job.setId(jobId);
        job.setName("test-job");
        job.setExecutionMode(ExecutionMode.MANUAL);

        BackupExecution mockExecution = BackupExecution.builder().build();

        when(jobService.getEntityById(jobId)).thenReturn(job);
        when(executionService.startExecution(any())).thenReturn(mockExecution);
        when(dumpService.executeJob(job)).thenReturn("/tmp/file.sql");
        when(backupStorageService.compress(any(), any())).thenReturn("/tmp/file.sql");
        doNothing().when(executionService).markSuccess(any(), any());

        schedulerService.runManually(jobId);

        verify(dumpService, times(1)).executeJob(job);
        verify(executionService, times(1)).markSuccess(any(), any());
        verify(jobService, atLeastOnce()).updateJobScheduler(eq(jobId), any());
    }
}