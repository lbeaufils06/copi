package com.backend.copi.service;

import com.backend.copi.entity.BackupJob;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.scheduling.support.CronExpression;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SchedulerService {

    private final BackupJobService jobService;
    private final DumpService dumpService;
    private final Clock clock;

    private boolean running = false;

    @Scheduled(fixedRate = 1000)
    public void checkJobs() {

        if (running) {
            return;
        }

        LocalDateTime now = LocalDateTime.now(clock).withNano(0);
        List<BackupJob> jobs = jobService.getEnabledJobs();

        for (BackupJob job : jobs) {

            initializeNextExecutionIfNeeded(job, now);

            if (shouldExecute(job, now)) {
                executeSequentially(job);
                break; // séquentiel
            }
        }
    }

    private void initializeNextExecutionIfNeeded(BackupJob job,
                                                 LocalDateTime now) {

        if (job.getNextExecutionTime() != null) {
            return;
        }

        CronExpression cron =
                CronExpression.parse(job.getCronExpression());

        LocalDateTime next =
                cron.next(now.minusSeconds(1));

        job.setNextExecutionTime(next.withNano(0));
        jobService.updateJobScheduler(job.getId(), job);
    }

    private boolean shouldExecute(BackupJob job,
                                  LocalDateTime now) {

        return job.getNextExecutionTime() != null &&
               !job.getNextExecutionTime().isAfter(now);
    }

    private void executeSequentially(BackupJob job) {

        try {
            running = true;

            LocalDateTime startTime =
                    LocalDateTime.now(clock).withNano(0);
            job.setStartExecutionTime(startTime);

            dumpService.executeJob(job);

            LocalDateTime endTime =
                    LocalDateTime.now(clock).withNano(0);
            job.setEndExecutionTime(endTime);

            // Calcul du prochain créneau
            CronExpression cron =
                    CronExpression.parse(job.getCronExpression());

            LocalDateTime next =
                    cron.next(job.getNextExecutionTime());

            job.setNextExecutionTime(next.withNano(0));

            jobService.updateJobScheduler(job.getId(), job);

        } finally {
            running = false;
        }
    }
}
