package com.backend.copi.service;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.scheduling.support.CronExpression;
import org.springframework.stereotype.Service;

import com.backend.copi.entity.BackupJob;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SchedulerServiceRetention {

    private final BackupJobService jobService;
    private final BackupExecutionService executionService;
    private final Clock clock;

    private boolean applicationReady = false;

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        applicationReady = true;
    }

    @Scheduled(fixedRate = 1000)
    public void checkRetention() {

        if (!applicationReady) {
            return;
        }

        LocalDateTime now = LocalDateTime.now(clock).withNano(0);

        List<BackupJob> jobs = jobService.getEnabledJobs();

        for (BackupJob job : jobs) {

            if (job.getCronRetention() == null || job.getCronRetention().isBlank()) {
                continue;
            }

            if (job.getNextRetentionTime() == null) {
                initializeRetention(job, now);
                continue;
            }

            if (!job.getNextRetentionTime().isAfter(now)) {

                // 1️⃣ On purge d'abord avec la date actuelle
                LocalDateTime purgeLimit = job.getNextRetentionTime();

                executionService.applyPurgeByCron(job, purgeLimit);

                // 2️⃣ Ensuite seulement on avance la prochaine date
                advanceRetention(job);
            }
        }
    }

    private void initializeRetention(BackupJob job, LocalDateTime now) {

        LocalDateTime next = CronExpression
                .parse(job.getCronRetention())
                .next(now)
                .withNano(0);

        job.setNextRetentionTime(next);
        jobService.updateJobScheduler(job.getId(), job);
    }

    private void advanceRetention(BackupJob job) {

        LocalDateTime next = CronExpression
                .parse(job.getCronRetention())
                .next(job.getNextRetentionTime())
                .withNano(0);

        job.setNextRetentionTime(next);
        jobService.updateJobScheduler(job.getId(), job);
    }
}

