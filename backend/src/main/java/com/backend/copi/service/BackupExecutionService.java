package com.backend.copi.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.copi.entity.BackupExecution;
import com.backend.copi.entity.BackupJob;
import com.backend.copi.entity.ExecutionStatus;
import com.backend.copi.repository.BackupExecutionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BackupExecutionService {

    private final BackupExecutionRepository repository;
    
    public List<BackupExecution> getAllExecutions() {
        return repository.findAllByOrderByStartTimeDesc();
    }
    
    public List<BackupExecution> getExecutionsByJob(UUID jobId) {
        return repository.findByJobIdOrderByStartTimeDesc(jobId);
    }

    public BackupExecution startExecution(BackupExecution execution) {
        execution.setStatus(ExecutionStatus.RUNNING);
        execution.setStartTime(LocalDateTime.now().withNano(0));
        return repository.save(execution);
    }

    public void markSuccess(BackupExecution execution,
                            String filePath) {

        execution.setEndTime(LocalDateTime.now().withNano(0));
        execution.setStatus(ExecutionStatus.SUCCESS);
        execution.setFilePath(filePath);

        long duration =
                Duration.between(
                        execution.getStartTime(),
                        execution.getEndTime())
                        .toSeconds();

        execution.setDurationInSeconds(duration);

        repository.save(execution);
    }

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
    public void applyRetention(BackupJob job) {

        Integer retentionCount = job.getRetentionCount();

        if (retentionCount == null || retentionCount <= 0) {
            return;
        }

        List<BackupExecution> executions =
        		repository.findByJobOrderByStartTimeDesc(job);

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
            System.err.println("Erreur suppression fichier : " + filePath);
        }
    }


}
