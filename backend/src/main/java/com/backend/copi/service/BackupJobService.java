package com.backend.copi.service;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.backend.copi.dto.BackupJobRequestDTO;
import com.backend.copi.dto.BackupJobResponseDTO;
import com.backend.copi.enums.*;
import com.backend.copi.exception.ResourceNotFoundException;
import com.backend.copi.mapper.BackupJobMapper;
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

    private final BackupJobMapper backupJobMapper;
    private final BackupJobRepository repository;
    private final BackupExecutionRepository repositoryExecution;
    private final CryptoService cryptoService;
    private final BackupExecutionService executionService;
    private final BackupStorageService backupStorageService;

    public List<BackupJobResponseDTO> getAllJobs() {

        return repository.findAll()
                .stream()
                .map(job -> {
                    job.setVersionCount((int) executionService.getVersionCountByJob(job.getId()));
                    return backupJobMapper.toResponseDto(job);
                })
                .toList();
    }

    public BackupJobResponseDTO createJob(BackupJobRequestDTO dto) {
        BackupJob job = backupJobMapper.toEntity(dto);
        if (dto.getPasswordEncrypted() != null && !dto.getPasswordEncrypted().isBlank()) {
            job.setPasswordEncrypted(cryptoService.encrypt(dto.getPasswordEncrypted()));
        }
    	job.setName(backupStorageService.sanitizeFile(dto.getName()));
        BackupJob saved = repository.save(job);
        return backupJobMapper.toResponseDto(saved);
    }

    public BackupJobResponseDTO updateJob(UUID id, BackupJobRequestDTO dto) throws IOException {
        BackupJob job = repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Job not found"));
        backupJobMapper.updateEntityFromDto(dto, job);
        if (dto.getPasswordEncrypted() != null && !dto.getPasswordEncrypted().isBlank()) {
            job.setPasswordEncrypted(cryptoService.encrypt(dto.getPasswordEncrypted()));
        }
        BackupJob saved = repository.save(job);
        return backupJobMapper.toResponseDto(saved);
    }

    @Transactional
    public BackupJob updateJobScheduler(UUID id, BackupJob updatedJob) {

        BackupJob existing = repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Job not found"));

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
    	BackupJob existing = repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Job not found"));
    	backupStorageService.deleteJobRepository(existing);
    	repositoryExecution.deleteByJob(existing);
        repository.delete(existing);
    }

    public BackupJobResponseDTO getJobById(UUID id) {
        BackupJob job =  repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Job not found"));
        return backupJobMapper.toResponseDto(job);
    }

    public BackupJob getEntityById(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found"));
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
                DatabaseType.MYSQL,"--single-transaction --quick --routines --triggers --events --add-drop-table",
                DatabaseType.MARIADB, "--single-transaction --quick --routines --triggers --events --add-drop-table",
                DatabaseType.POSTGRESQL,"--clean --if-exists --no-owner --format=plain",
                DatabaseType.MONGODB,""
        );
    }

    public BackupJob getDefaults() {
        BackupJob job = new BackupJob();
        job.setDbType(DatabaseType.MARIADB);
        job.setCronExpression("0 0 * * * *");
        job.setExecutionMode(ExecutionMode.SCHEDULED);
        job.setRetentionPolicy(RetentionPolicy.NONE);
        job.setRetentionCount(5);
        job.setEnabled(true);
        job.setCompressionType(CompressionType.NONE);
        job.setAuthenticationDatabase("admin");
        return job;
    }

}
