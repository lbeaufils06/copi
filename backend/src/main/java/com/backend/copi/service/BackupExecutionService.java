package com.backend.copi.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Clock;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.backend.copi.dto.BackupExecutionResponseDTO;
import com.backend.copi.mapper.BackupExecutionMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.copi.entity.BackupExecution;
import com.backend.copi.entity.BackupJob;
import com.backend.copi.enums.ExecutionStatus;
import com.backend.copi.repository.BackupExecutionRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class BackupExecutionService {

    private final BackupExecutionMapper backupExecutionMapper;
    private final BackupExecutionRepository repository;
    private final Clock clock;
    
    public List<BackupExecutionResponseDTO> getAllExecutions() {
        return repository.findAllByOrderByStartTimeDesc()
                .stream()
                .map(backupExecutionMapper::toDto)
                .toList();
    }
    
    public List<BackupExecutionResponseDTO> getExecutionsByJob(UUID jobId) {
        return repository
                .findByJobIdOrderByStartTimeDesc(jobId)
                .stream()
                .map(backupExecutionMapper::toDto)
                .toList();
    }

    @Transactional
    public BackupExecution startExecution(BackupExecution execution) {
        execution.setStatus(ExecutionStatus.RUNNING);
        execution.setStartTime(LocalDateTime.now().withNano(0));
        return repository.save(execution);
    }

    @Transactional
    public void markSuccess(BackupExecution execution,
                            String filePath) {

        execution.setEndTime(LocalDateTime.now().withNano(0));
        execution.setStatus(ExecutionStatus.SUCCESS);
        execution.setFilePath(filePath);

        if (filePath != null) {
            execution.setFileName(Paths.get(filePath).getFileName().toString());
        }

        long duration =
                Duration.between(
                        execution.getStartTime(),
                        execution.getEndTime())
                        .toSeconds();

        execution.setDurationInSeconds(duration);

        repository.save(execution);
    }

    @Transactional
    public void markFailed(BackupExecution execution,
                           String errorMessage) {

        execution.setEndTime(LocalDateTime.now().withNano(0));
        execution.setStatus(ExecutionStatus.FAILED);
        execution.setLogMessage(errorMessage);

        long duration =
                Duration.between(
                        execution.getStartTime(),
                        execution.getEndTime())
                        .toSeconds();

        execution.setDurationInSeconds(duration);

        repository.save(execution);
    }
    
    @Transactional
    public void applyRetentionByCount(BackupJob job) {

        Integer retentionCount = job.getRetentionCount();

        if (retentionCount == null || retentionCount <= 0) {
            return;
        }

        List<BackupExecution> executions =
        		repository.findByJobAndStatusOrderByStartTimeDesc(job, ExecutionStatus.SUCCESS);

        if (executions.size() <= retentionCount) {
            return;
        }

        List<BackupExecution> toDelete =
                executions.subList(retentionCount, executions.size());

        for (BackupExecution execution : toDelete) {        

            deleteFileIfExists(execution.getFilePath());

            repository.delete(execution);
        }
    }
    
    private void deleteFileIfExists(String filePath) {

        if (filePath == null || filePath.isBlank()) {
            return;
        }

        try {
            Path path = Paths.get(filePath);
            Files.deleteIfExists(path);
        } catch (IOException e) {
            log.error("Failed to delete backup file {}", filePath, e);
        }
    }
    
    public long getVersionCountByJob(UUID jobId) {
        return repository.countByJob_IdAndStatus(jobId, ExecutionStatus.SUCCESS);
    }
    
    public List<BackupExecution> findByStatus(ExecutionStatus status) {
    	return repository.findByStatus(status);
    }
    
    @Transactional
    public void deleteMissingExecutions() {

        long deleted = repository.deleteByStatus(ExecutionStatus.MISSING);

        log.info("Deleted {} missing executions at startup", deleted);
    }

    @Transactional
    public void purgeByDays(BackupJob job) {

        if (job.getRetentionCount() == null) {
            return;
        }

        LocalDateTime limit = LocalDateTime.now(clock).minusDays(job.getRetentionDays());

        List<BackupExecution> oldExecutions =
                repository.findByJobAndEndTimeBefore(job, limit);

        for (BackupExecution exec : oldExecutions) {
            deleteFileIfExists(exec.getFilePath());
            repository.delete(exec);
        }
    }

    @Transactional
    public void purgeFailedAndMissingOlderThan7Days() {

        LocalDateTime limit = LocalDateTime.now(clock).minusDays(7);

        repository.deleteByStatusInAndStartTimeBefore(
                List.of(ExecutionStatus.FAILED, ExecutionStatus.MISSING),
                limit
        );

        log.info("Purged FAILED and MISSING executions older than {}", limit);
    }
    
}
