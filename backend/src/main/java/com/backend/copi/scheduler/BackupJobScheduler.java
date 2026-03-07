package com.backend.copi.scheduler;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Clock;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import com.backend.copi.enums.RetentionPolicy;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Profile;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.scheduling.support.CronExpression;
import org.springframework.stereotype.Service;

import com.backend.copi.entity.BackupExecution;
import com.backend.copi.entity.BackupJob;
import com.backend.copi.enums.CompressionType;
import com.backend.copi.enums.ExecutionMode;
import com.backend.copi.enums.ExecutionStatus;
import com.backend.copi.service.BackupExecutionService;
import com.backend.copi.service.BackupJobService;
import com.backend.copi.service.BackupStorageService;
import com.backend.copi.service.dump.DumpService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@Profile("!test")
public class BackupJobScheduler {

    private final BackupJobService jobService;
    private final DumpService dumpService;
    private final BackupExecutionService executionService;
    private final BackupStorageService backupStorageService;
    private final Clock clock;

    private final Set<UUID> runningJobs = ConcurrentHashMap.newKeySet();

    private boolean applicationReady = false;

    @EventListener(ApplicationReadyEvent.class)
    // onApplicationReady: Handles the application ready lifecycle event and updates runtime flags.
    public void onApplicationReady() {
        applicationReady = true;
    }

    @Scheduled(fixedRate = 1000)
    // checkJobs: Checks jobs and triggers follow-up actions when needed.
    public void checkJobs() {

        if (!applicationReady) {
            return;
        }

        List<BackupJob> jobs = jobService.getEnabledJobs();
        List<BackupJob> eligibleJobs = new ArrayList<>();

        for (BackupJob job : jobs) {

            if (runningJobs.contains(job.getId())) {
                continue;
            }

            if (isJobEligible(job)) {
                eligibleJobs.add(job);
            }
        }

        for (BackupJob job : eligibleJobs) {
            executeWithLock(ExecutionMode.SCHEDULED, job, job.getExecutionTime());
        }
    }

    // isJobEligible: Determines whether job eligible satisfies eligibility conditions.
    private boolean isJobEligible(BackupJob job) {

        if (job.getExecutionMode() == ExecutionMode.MANUAL) {
            return false;
        }

        if (job.getCronExpression() == null) {
            return false;
        }

        LocalDateTime now = LocalDateTime.now(clock).withNano(0);
        LocalDateTime storedNext = job.getNextExecutionTime();

        if (storedNext == null) {
            updateNextExecution(job, now, null);
            return false;
        }

        if (!now.isBefore(storedNext)) {
            updateNextExecution(job, now, storedNext);
            return true;
        }

        return false;
    }

    // updateNextExecution: Updates next execution with validated incoming values.
    private void updateNextExecution(BackupJob job, LocalDateTime now, LocalDateTime storedNext) {
        CronExpression cron = CronExpression.parse(job.getCronExpression());
        LocalDateTime next = cron.next(now).withNano(0);
        if (storedNext != null) {
            job.setExecutionTime(storedNext);
        }
        job.setNextExecutionTime(next);
        jobService.updateJobScheduler(job.getId(), job);
    }

    // executeWithLock: Executes with lock and coordinates the full processing pipeline.
    private void executeWithLock(ExecutionMode executionMode, BackupJob job, LocalDateTime executionTime) {

        if (!runningJobs.add(job.getId())) {
            log.debug("Job already running: {}", job.getName());
            return;
        }

        try {
            executeSequentially(executionMode, job, executionTime);
        } finally {
            runningJobs.remove(job.getId());
        }
    }

    // executeSequentially: Executes sequentially and coordinates the full processing pipeline.
    private void executeSequentially(ExecutionMode executionMode, BackupJob job, LocalDateTime executionTime) {

        log.info("Starting dump job={} now={} nextExecution={}",
                job.getName(),
                executionTime,
                job.getNextExecutionTime());

        job.setLastStatus(ExecutionStatus.RUNNING);
        job.setLastStatusMessage("");
        jobService.updateJobScheduler(job.getId(), job);

        BackupExecution execution = BackupExecution.builder()
                .job(job)
                .executionTime(executionTime)
                .executionMode(executionMode)
                .build();

        execution = executionService.startExecution(execution);

        try {

            String filePath = dumpService.executeJob(job);

            if (filePath == null) {
                markFailure(job, execution, "Dump failed");
                return;
            }

            String finalPath = compressFile(filePath, job.getCompressionType());

            if (CompressionType.NONE != job.getCompressionType()) {
                Files.delete(Path.of(filePath));
            }

            executionService.markSuccess(execution, finalPath);

            job.setLastStatus(ExecutionStatus.SUCCESS);
            job.setLastStatusMessage(execution.getLogMessage());
            job.setLastSuccessTime(execution.getEndTime());

            if (job.getRetentionPolicy().equals(RetentionPolicy.COUNT)) {
                executionService.applyRetentionByCount(job);
            }

            if (job.getRetentionPolicy().equals(RetentionPolicy.DAYS)) {
                executionService.purgeByDays(job);
            }

        } catch (Exception e) {

            log.error("Dump error for job {}", job.getName(), e);

            markFailure(job, execution, e.getMessage());

        } finally {

            backupStorageService.synchronize();
            jobService.updateJobScheduler(job.getId(), job);
        }
    }

    // markFailure: Marks failure with the appropriate execution status.
    private void markFailure(BackupJob job, BackupExecution execution, String message) {

        job.setLastStatus(ExecutionStatus.FAILED);
        job.setLastStatusMessage(message);

        executionService.markFailed(execution, message);
    }

    // compressFile: Compresses file using the configured compression strategy.
    private String compressFile(String inputFilePath, CompressionType type) throws IOException {
        return backupStorageService.compress(inputFilePath, type);
    }

    // runManually: Runs manually using the scheduler execution flow.
    public void runManually(UUID jobId) {

        LocalDateTime now = LocalDateTime.now(clock).withNano(0);

        BackupJob job = jobService.getEntityById(jobId);

        log.info("Manual execution requested for job {}", job.getName());

        if (!runningJobs.add(jobId)) {
            throw new IllegalStateException("Job already running");
        }

        try {
            executeSequentially(ExecutionMode.MANUAL, job, now);
        } finally {
            runningJobs.remove(jobId);
        }
    }
}