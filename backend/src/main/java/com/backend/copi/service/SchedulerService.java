package com.backend.copi.service;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.scheduling.support.CronExpression;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.copi.entity.BackupExecution;
import com.backend.copi.entity.BackupJob;
import com.backend.copi.entity.ExecutionStatus;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SchedulerService {

    private final BackupJobService jobService;
    private final DumpService dumpService;
    private final BackupExecutionService executionService;
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

        for (BackupJob job : jobs) {

            if (runningJobs.contains(job.getId())) {
                continue; // job déjà en cours
            }

            boolean shouldRun = initializeNextExecutionIfNeeded(job);

            if (shouldRun) {
                executeWithLock(job);
                break; // séquentiel
            }
        }
    }

    private void executeWithLock(BackupJob job) {

        if (!runningJobs.add(job.getId())) {
            return; // déjà en cours
        }

        try {
            executeSequentially(job);
        } finally {
            runningJobs.remove(job.getId());
        }
    }

    private boolean initializeNextExecutionIfNeeded(BackupJob job) {

        LocalDateTime now = LocalDateTime.now(clock).withNano(0);

        LocalDateTime next = CronExpression
                .parse(job.getCronExpression())
                .next(now)
                .withNano(0);

        if (!Objects.equals(job.getNextExecutionTime(), next)) {

            Long occurrences = countMissedOccurrences(
                    job.getNextExecutionTime(),
                    next,
                    job.getCronExpression()
            );

            job.setNextExecutionTime(next);
            jobService.updateJobScheduler(job.getId(), job);

            return occurrences <= 2;
        }

        return false;
    }

    private void executeSequentially(BackupJob job) {

        job.setLastStatus(ExecutionStatus.RUNNING);
        jobService.updateJobScheduler(job.getId(), job);

        BackupExecution execution = BackupExecution.builder()
                .job(job)
                .build();

        execution = executionService.startExecution(execution);

        try {

            String filePath = dumpService.executeJob(job);

            executionService.markSuccess(execution, filePath);

            job.setLastStatus(ExecutionStatus.SUCCESS);
            job.setLastSuccessTime(execution.getStartTime());

            if (job.getCronPurgeExpression() == null
                    || job.getCronPurgeExpression().isEmpty()) {

                executionService.applyRetentionByCount(job);
            }

        } catch (Exception e) {

            job.setLastStatus(ExecutionStatus.FAILED);
            executionService.markFailed(execution, e.getMessage());

        } finally {

            jobService.updateJobScheduler(job.getId(), job);
        }
    }

    public void runManually(UUID jobId) {

        BackupJob job = jobService.getJobById(jobId);

        if (!runningJobs.add(jobId)) {
            throw new IllegalStateException("Job already running");
        }

        try {
            executeSequentially(job);
        } finally {
            runningJobs.remove(jobId);
        }
    }

    public long countMissedOccurrences(
            LocalDateTime storedNextExecutionTime,
            LocalDateTime next,
            String cronExpression) {

        if (storedNextExecutionTime == null || storedNextExecutionTime.isAfter(next)) {
            return 0;
        }

        CronExpression cron = CronExpression.parse(cronExpression);

        long count = 0;
        LocalDateTime occurrence = storedNextExecutionTime;

        while (!occurrence.isAfter(next)) {
            count++;
            occurrence = cron.next(occurrence);
            if (occurrence == null) break;
        }

        return count;
    }
}