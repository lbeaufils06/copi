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
import com.backend.copi.service.DumpService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@Profile("!test")
public class SchedulerService {

    private final BackupJobService jobService;
    private final DumpService dumpService;
    private final BackupExecutionService executionService;
    private final BackupStorageService backupStorageService;
    private final Clock clock;

    private final Set<UUID> runningJobs = ConcurrentHashMap.newKeySet();

    private boolean applicationReady = false;

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        applicationReady = true;
    }

    @Scheduled(fixedRate = 1000)
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
            executeWithLock(job);
        }
    }

    private boolean isJobEligible(BackupJob job) {

        if (job.getExecutionMode() == ExecutionMode.MANUAL) {
            return false;
        }

        if (job.getCronExpression() == null) {
            return false;
        }

        LocalDateTime now = LocalDateTime.now(clock).withNano(0);
        CronExpression cron = CronExpression.parse(job.getCronExpression());

        LocalDateTime storedNext = job.getNextExecutionTime();

        if (storedNext == null) {

            LocalDateTime next = cron.next(now).withNano(0);
            updateNextExecution(job, next);
            return false;
        }

        if (!now.isBefore(storedNext)) {

            LocalDateTime next = cron.next(now).withNano(0);
            updateNextExecution(job, next);
            return true;
        }

        return false;
    }

    private void updateNextExecution(BackupJob job, LocalDateTime next) {
        job.setNextExecutionTime(next);
        jobService.updateJobScheduler(job.getId(), job);
    }

    private void executeWithLock(BackupJob job) {

        if (!runningJobs.add(job.getId())) {
            log.debug("Job already running: {}", job.getName());
            return;
        }

        try {
            executeSequentially(job);
        } finally {
            runningJobs.remove(job.getId());
        }
    }

    private void executeSequentially(BackupJob job) {

        LocalDateTime now = LocalDateTime.now(clock).withNano(0);

        log.info("Starting dump job={} now={} nextExecution={}",
                job.getName(),
                now,
                job.getNextExecutionTime());

        job.setLastStatus(ExecutionStatus.RUNNING);
        job.setLastStatusMessage("");
        jobService.updateJobScheduler(job.getId(), job);

        BackupExecution execution = BackupExecution.builder()
                .job(job)
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

            if (job.getCronPurgeExpression() == null || job.getCronPurgeExpression().isEmpty()) {
                executionService.applyRetentionByCount(job);
            }

        } catch (Exception e) {

            log.error("Dump error for job {}", job.getName(), e);

            markFailure(job, execution, e.getMessage());

        } finally {

            backupStorageService.synchronize();
            jobService.updateJobScheduler(job.getId(), job);
        }
    }

    private void markFailure(BackupJob job, BackupExecution execution, String message) {

        job.setLastStatus(ExecutionStatus.FAILED);
        job.setLastStatusMessage(message);

        executionService.markFailed(execution, message);
    }

    private String compressFile(String inputFilePath, CompressionType type) throws IOException {
        return backupStorageService.compress(inputFilePath, type);
    }

    public void runManually(UUID jobId) {

        BackupJob job = jobService.getEntityById(jobId);

        log.info("Manual execution requested for job {}", job.getName());

        if (!runningJobs.add(jobId)) {
            throw new IllegalStateException("Job already running");
        }

        try {
            executeSequentially(job);
        } finally {
            runningJobs.remove(jobId);
        }
    }
}