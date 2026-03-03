package com.backend.copi.scheduler;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Clock;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
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
    private final Clock clock;
    private final BackupStorageService backupStorageService;

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
            
            boolean shouldRun = false;

            if(job.getCronExpression() != null) {
            	shouldRun = initializeNextExecutionIfNeeded(job);
            }

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
        
        if(job.getExecutionMode().equals(ExecutionMode.MANUAL)) {
        	return isGoodForDump(job, null, false);
        }

        LocalDateTime now = LocalDateTime.now(clock).withNano(0);
        

        LocalDateTime nextTentative = CronExpression
                .parse(job.getCronExpression())
                .next(now)
                .withNano(0);        
        LocalDateTime nextExecutionTime = job.getNextExecutionTime();
        
        if(nextExecutionTime == null) {
        	return isGoodForDump(job, nextTentative, false);
        }
        
        if (!Objects.equals(job.getNextExecutionTime(), nextTentative)) {
            Long occurrences = countMissedOccurrences(nextExecutionTime, nextTentative, job.getCronExpression());                      
            if(occurrences == 0 && !now.isBefore(nextExecutionTime)) {
                return isGoodForDump(job, nextTentative, true);
            }           
            return isGoodForDump(job, nextTentative, false);
        }

        return false;
    }
    
    private boolean isGoodForDump(BackupJob job, LocalDateTime nextTentative, boolean result) {
    	job.setNextExecutionTime(nextTentative);
        jobService.updateJobScheduler(job.getId(), job);
    	return result;
    }

    private void executeSequentially(BackupJob job) {
    	    	
    	LocalDateTime now = LocalDateTime.now(clock).withNano(0);
        log.info("Dump => name=" + job.getName() + ", now=" + now + ", nextExecutionTime=" + job.getNextExecutionTime());

        job.setLastStatus(ExecutionStatus.RUNNING);
        job.setLastStatusMessage("");
        jobService.updateJobScheduler(job.getId(), job);

        BackupExecution execution = BackupExecution.builder()
                .job(job)
                .build();

        execution = executionService.startExecution(execution);

        try {

            String filePath = dumpService.executeJob(job);
                
            String finalPath = compressFilePath(filePath, job.getCompressionType());

            if (job.getCompressionType() != null && job.getCompressionType() != CompressionType.NONE) {
                Files.delete(Path.of(filePath));
            }
            
            executionService.markSuccess(execution, finalPath);

            job.setLastStatus(ExecutionStatus.SUCCESS);
            job.setLastStatusMessage(execution.getLogMessage());
            job.setLastSuccessTime(execution.getEndTime());
                      
            if (job.getCronPurgeExpression() == null
                    || job.getCronPurgeExpression().isEmpty()) {

                executionService.applyRetentionByCount(job);
            }

        } catch (Exception e) {
            job.setLastStatus(ExecutionStatus.FAILED);
            String messageError = e.getMessage();
            job.setLastStatusMessage(messageError);
            log.error("Dump ERROR => ", e);
            executionService.markFailed(execution, e.getMessage());

        } finally {
        	backupStorageService.synchronize();
            jobService.updateJobScheduler(job.getId(), job);
        }
    }

    public void runManually(UUID jobId) {

        BackupJob job = jobService.getEntityById(jobId);

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

        if (storedNextExecutionTime == null || !storedNextExecutionTime.isBefore(next)) {
            return 0;
        }

        CronExpression cron = CronExpression.parse(cronExpression);

        long count = 0;
        LocalDateTime occurrence = cron.next(storedNextExecutionTime);

        while (occurrence != null && occurrence.isBefore(next)) {
            count++;
            occurrence = cron.next(occurrence);
        }

        return count;
    }
    
    private String compressFilePath(String inputFilePath,
	            CompressionType type) throws IOException {
	
    	return backupStorageService.compress(inputFilePath, type);
	}
}