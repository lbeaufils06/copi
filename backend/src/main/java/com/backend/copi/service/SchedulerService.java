package com.backend.copi.service;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.scheduling.support.CronExpression;
import org.springframework.stereotype.Service;

import com.backend.copi.entity.BackupExecution;
import com.backend.copi.entity.BackupJob;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SchedulerService {

    private final BackupJobService jobService;
    private final DumpService dumpService;
    private final BackupExecutionService executionService;
    private final Clock clock;

    private boolean running = false;
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
        if (running) {
            return;
        }

        List<BackupJob> jobs = jobService.getEnabledJobs();

        for (BackupJob job : jobs) {
        	
        	boolean isGood = initializeNextExecutionIfNeeded(job);

            if (isGood) {
                executeSequentially(job);
                break; // séquentiel
            }
        }
    }

    private boolean initializeNextExecutionIfNeeded(BackupJob job) {

        LocalDateTime now = LocalDateTime.now(clock).withNano(0);

        LocalDateTime next = CronExpression
                .parse(job.getCronExpression())
                .next(now)
                .withNano(0);

        if (!Objects.equals(job.getNextExecutionTime(), next)) {
            job.setNextExecutionTime(next);
            jobService.updateJobScheduler(job.getId(), job);
            return true;
        }

        return false;
    }


    private void executeSequentially(BackupJob job) {

        BackupExecution execution =
                BackupExecution.builder()
                        .job(job)
                        .build();

        execution = executionService.startExecution(execution);

        try {
            running = true;

            String filePath = dumpService.executeJob(job);

            executionService.markSuccess(execution, filePath);

        } catch (Exception e) {

            executionService.markFailed(execution, e.getMessage());

        } finally {

            running = false;
        }
    }
}
