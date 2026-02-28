package com.backend.copi.service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.backend.copi.enums.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.copi.entity.BackupExecution;
import com.backend.copi.entity.BackupJob;
import com.backend.copi.repository.BackupExecutionRepository;
import com.backend.copi.repository.BackupJobRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class BackupJobService {

    private final BackupJobRepository repository;
    private final BackupExecutionRepository repositoryExecution;
    private final CryptoService cryptoService;
    private final BackupExecutionService executionService;
    private final BackupStorageService backupStorageService;

    public List<BackupJob> getAllJobs() {
    	List<BackupJob> backupJobs = repository.findAll();
    	List<BackupJob> backupJobsUpdate = new ArrayList<BackupJob>();
    	for(BackupJob job : backupJobs) {
    		job.setVersionCount((int) executionService.getVersionCountByJob(job.getId()));
    		backupJobsUpdate.add(job);
    	}
    	
        return backupJobsUpdate;
    }

    public BackupJob createJob(BackupJob job) {
    	job.setPasswordEncrypted(cryptoService.encrypt(job.getPasswordEncrypted()));
    	job.setName(backupStorageService.sanitizeFile(job.getName()));
    	job.setCompressionType(job.getCompressionType());
        return repository.save(job);
    }

    public BackupJob updateJob(UUID id, BackupJob updatedJob) throws IOException {

        BackupJob existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        
        existing.setDbType(updatedJob.getDbType());
        existing.setHost(updatedJob.getHost());
        existing.setPort(updatedJob.getPort());
        existing.setDbName(updatedJob.getDbName());
        existing.setUsername(updatedJob.getUsername());
        if (updatedJob.getPasswordEncrypted() != null && !updatedJob.getPasswordEncrypted().isBlank()) {
        	existing.setPasswordEncrypted(cryptoService.encrypt(updatedJob.getPasswordEncrypted()));
        }
        if(existing.getCronPurgeExpression() != null && updatedJob.getCronPurgeExpression() != null && existing.getCronPurgeExpression().equals(updatedJob.getCronPurgeExpression())) {
        	existing.setNextPurgeTime(updatedJob.getNextPurgeTime());
        } else {
        	existing.setNextPurgeTime(null);
        }
        existing.setCronExpression(updatedJob.getCronExpression());
        existing.setCronPurgeExpression(updatedJob.getCronPurgeExpression());
        existing.setEnabled(updatedJob.getEnabled());
        existing.setNextExecutionTime(updatedJob.getNextExecutionTime());
        existing.setRetentionCount(updatedJob.getRetentionCount());
        existing.setRetentionPolicy(updatedJob.getRetentionPolicy());
        existing.setExecutionMode(updatedJob.getExecutionMode());
        return repository.save(existing);
    }
    
    @Transactional
    public BackupJob updateJobScheduler(UUID id, BackupJob updatedJob) {

        BackupJob existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        existing.setNextExecutionTime(updatedJob.getNextExecutionTime());
        if(existing.getCronPurgeExpression() != null && updatedJob.getCronPurgeExpression() != null && existing.getCronPurgeExpression().equals(updatedJob.getCronPurgeExpression())) {
        	existing.setNextPurgeTime(updatedJob.getNextPurgeTime());
        } else {
        	existing.setNextPurgeTime(null);
        }
        existing.setLastSuccessTime(updatedJob.getLastSuccessTime());
        existing.setVersionCount(updatedJob.getVersionCount());
        existing.setLastStatus(updatedJob.getLastStatus());
        existing.setLastStatusMessage(updatedJob.getLastStatusMessage());

        return repository.save(existing);
    }

    @Transactional
    public void markFailed(BackupJob job,
                           String errorMessage) {

        job.setLastStatus(ExecutionStatus.FAILED);
        job.setLastStatusMessage(errorMessage);

        repository.save(job);
    }

    public List<BackupJob> getEnabledJobs() {
        return repository.findAll()
                .stream()
                .filter(job -> Boolean.TRUE.equals(job.getEnabled()))
                .toList();
    }
    
    @Transactional
    public void deleteJob(UUID id) throws IOException {
    	BackupJob existing = repository.findById(id).orElseThrow(() -> new RuntimeException("Job not found"));
    	backupStorageService.deleteJobRepository(existing);
    	repositoryExecution.deleteByJob(existing);
        repository.delete(existing);
    }

    public BackupJob getJobById(UUID id) {

        BackupJob existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        return existing;
    }
    
    @Transactional
    public void recoverInterruptedExecutions() {
    	
        List<BackupExecution> runningExecutions = repositoryExecution.findByStatus(ExecutionStatus.RUNNING);
        for (BackupExecution exec : runningExecutions) {
            executionService.markFailed(exec, "Interrupted due to container shutdown");
        }
        
        List<BackupJob> runningJobs = repository.findByLastStatus(ExecutionStatus.RUNNING);
        for (BackupJob job : runningJobs) {
        	markFailed(job, "Interrupted due to container shutdown");
        }

        log.info("Recovered {} interrupted executions", runningExecutions.size());
    }

    public Map<DatabaseType, String> getAllDefaultDumpOptions() {
        return Map.of(
                DatabaseType.MYSQL,"--single-transaction --quick --routines --triggers --events --add-drop-table --set-gtid-purged=OFF --column-statistics=0",
                DatabaseType.POSTGRESQL,"--clean --if-exists --no-owner --format=plain"
        );
    }

    public BackupJob getDefaults() {
        BackupJob job = new BackupJob();
        job.setDbType(DatabaseType.MYSQL);
        job.setCronExpression("0 0 * * * *");
        job.setExecutionMode(ExecutionMode.SCHEDULED);
        job.setRetentionPolicy(RetentionPolicy.NONE);
        job.setRetentionCount(5);
        job.setEnabled(true);
        job.setCompressionType(CompressionType.NONE);
        return job;
    }

}
