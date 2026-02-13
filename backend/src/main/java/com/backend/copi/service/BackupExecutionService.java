package com.backend.copi.service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.backend.copi.entity.BackupExecution;
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
}
