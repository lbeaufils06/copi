package com.backend.copi.scheduler;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

import java.io.File;
import java.time.Clock;
import java.time.Instant;
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
import com.backend.copi.service.dump.DumpService;

class BackupJobSchedulerTest {

    private BackupJobService jobService;
    private DumpService dumpService;
    private BackupExecutionService executionService;
    private BackupStorageService backupStorageService;
    private BackupJobScheduler backupJobScheduler;

    @BeforeEach
    void setup() {

        jobService = mock(BackupJobService.class);
        dumpService = mock(DumpService.class);
        executionService = mock(BackupExecutionService.class);
        backupStorageService = mock(BackupStorageService.class);

        Clock fixedClock = Clock.fixed(
                Instant.parse("2026-02-27T10:00:00Z"),
                ZoneId.of("UTC"));

        backupJobScheduler = new BackupJobScheduler(
                jobService,
                dumpService,
                executionService,
                backupStorageService,
                fixedClock
        );
    }

    @Test
    void runManually_shouldExecuteJobSuccessfully() throws Exception {

        UUID jobId = UUID.randomUUID();

        BackupJob job = new BackupJob();
        job.setId(jobId);
        job.setName("test-job");
        job.setExecutionMode(ExecutionMode.MANUAL);

        BackupExecution execution = BackupExecution.builder().build();

        File tempFile = File.createTempFile("dump", ".sql");

        when(jobService.getEntityById(jobId)).thenReturn(job);
        when(executionService.startExecution(any())).thenReturn(execution);
        when(dumpService.executeJob(job)).thenReturn(tempFile.getAbsolutePath());
        when(backupStorageService.compress(any(), any())).thenReturn(tempFile.getAbsolutePath());

        backupJobScheduler.runManually(jobId);

        verify(dumpService).executeJob(job);
        verify(executionService).markSuccess(any(), any());
    }

    @Test
    void runManually_shouldFailWhenDumpReturnsNull() throws Exception {

        UUID jobId = UUID.randomUUID();

        BackupJob job = new BackupJob();
        job.setId(jobId);
        job.setExecutionMode(ExecutionMode.MANUAL);

        BackupExecution execution = BackupExecution.builder().build();

        when(jobService.getEntityById(jobId)).thenReturn(job);
        when(executionService.startExecution(any())).thenReturn(execution);
        when(dumpService.executeJob(job)).thenReturn(null);

        backupJobScheduler.runManually(jobId);

        verify(executionService).markFailed(any(), any());
    }

    @Test
    void runManually_shouldPreventConcurrentExecution() throws Exception {

        UUID jobId = UUID.randomUUID();

        BackupJob job = new BackupJob();
        job.setId(jobId);
        job.setExecutionMode(ExecutionMode.MANUAL);

        when(jobService.getEntityById(jobId)).thenReturn(job);

        when(dumpService.executeJob(any())).thenAnswer(invocation -> {
            Thread.sleep(200);
            return null;
        });

        Thread t1 = new Thread(() -> backupJobScheduler.runManually(jobId));
        t1.start();

        Thread.sleep(50);

        assertThrows(
                IllegalStateException.class,
                () -> backupJobScheduler.runManually(jobId)
        );
    }
}