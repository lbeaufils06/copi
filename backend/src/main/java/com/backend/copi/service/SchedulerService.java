package com.backend.copi.service;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.scheduling.support.CronExpression;
import org.springframework.stereotype.Service;

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
            Long occurences = countMissedOccurrences(job.getNextExecutionTime(), next, job.getCronExpression());
            job.setNextExecutionTime(next);
            jobService.updateJobScheduler(job.getId(), job);
        	if(occurences > 2) {
        		return false;
        	}
            return true;
        }

        return false;
    }


    private void executeSequentially(BackupJob job) {
    	
    	job.setLastStatus(ExecutionStatus.RUNNING);
    	jobService.updateJobScheduler(job.getId(), job);

        BackupExecution execution =
                BackupExecution.builder()
                        .job(job)
                        .build();

        execution = executionService.startExecution(execution);

        try {
            running = true;

            String filePath = dumpService.executeJob(job);

            executionService.markSuccess(execution, filePath);
            
            job.setVersionCount((job.getVersionCount() != null) ? job.getVersionCount() + 1 : 1); //count version for this job     
            job.setLastStatus(ExecutionStatus.SUCCESS);
            job.setLastSuccessTime(execution.getStartTime()); //update last success time in backupJob
                        
            //apply retention by count of dump
            if (job.getCronPurgeExpression() == null || job.getCronPurgeExpression().isEmpty() ) {
            	executionService.applyRetentionByCount(job);
            }
        } catch (Exception e) {
        	job.setLastStatus(ExecutionStatus.FAILED);
            executionService.markFailed(execution, e.getMessage());
        } finally {
        	jobService.updateJobScheduler(job.getId(), job);
            running = false;
        }
    }
    
    public long countMissedOccurrences(
            LocalDateTime storedNextExecutionTime,
            LocalDateTime next,
            String cronExpression) {

        if (storedNextExecutionTime == null) {
            return 0;
        }

        if (storedNextExecutionTime.isAfter(next)) {
            return 0;
        }

        CronExpression cron = CronExpression.parse(cronExpression);

        long count = 0;
        LocalDateTime occurrence = storedNextExecutionTime;

        while (!occurrence.isAfter(next)) {
            count++;
            occurrence = cron.next(occurrence);

            if (occurrence == null) {
                break; // sécurité si cron invalide
            }
        }

        return count;
    }

}
