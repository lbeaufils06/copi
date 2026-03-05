package com.backend.copi.scheduler;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Profile;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.scheduling.support.CronExpression;
import org.springframework.stereotype.Service;

import com.backend.copi.entity.BackupJob;
import com.backend.copi.service.BackupExecutionService;
import com.backend.copi.service.BackupJobService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Profile("!test")
public class BackupPurgeScheduler {

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

            if (job.getCronPurgeExpression() == null || job.getCronPurgeExpression().isBlank()) {
                continue;
            }

            if (job.getNextPurgeTime() == null) {
                initializeRetention(job, now);
                continue;
            }

            if (!job.getNextPurgeTime().isAfter(now)) {

                // 1️⃣ On purge d'abord avec la date actuelle
                LocalDateTime purgeLimit = job.getNextPurgeTime();

                executionService.applyPurgeByCron(job, purgeLimit);

                // 2️⃣ Ensuite seulement on avance la prochaine date
                advanceRetention(job);
            }
        }
    }

    private void initializeRetention(BackupJob job, LocalDateTime now) {

        LocalDateTime next = CronExpression
                .parse(job.getCronPurgeExpression())
                .next(now)
                .withNano(0);

        job.setNextPurgeTime(next);
        jobService.updateJobScheduler(job.getId(), job);
    }

    private void advanceRetention(BackupJob job) {

        LocalDateTime next = CronExpression
                .parse(job.getCronPurgeExpression())
                .next(job.getNextPurgeTime())
                .withNano(0);

        job.setNextPurgeTime(next);
        jobService.updateJobScheduler(job.getId(), job);
    }
}

