package com.backend.copi.service;

import com.backend.copi.entity.BackupExecution;
import com.backend.copi.entity.BackupJob;
import com.backend.copi.repository.BackupExecutionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class DumpService {

    private final BackupExecutionRepository executionRepository;

    public void executeJob(BackupJob job) {

        BackupExecution execution = new BackupExecution();
        execution.setJobId(job.getId());
        execution.setStartTime(LocalDateTime.now());
        execution.setStatus("RUNNING");

        execution = executionRepository.save(execution);

        try {
            // Simulation du dump (pour l'instant)
            Thread.sleep(2000);

            execution.setStatus("SUCCESS");
            execution.setLogMessage("Backup simulé avec succès");

        } catch (Exception e) {

            execution.setStatus("FAILED");
            execution.setLogMessage(e.getMessage());
        }

        execution.setEndTime(LocalDateTime.now());
        executionRepository.save(execution);
    }
}
