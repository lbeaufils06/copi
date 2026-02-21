package com.backend.copi.service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.copi.config.AppProperties;
import com.backend.copi.entity.BackupExecution;
import com.backend.copi.entity.ExecutionStatus;
import com.backend.copi.repository.BackupExecutionRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class SyncBackupService {

    private final BackupExecutionRepository backupExecutionRepository;
    private final AppProperties appProperties;

    /**
     * Synchronise les BackupExecution avec le filesystem.
     *
     * Règles :
     * - SUCCESS -> MISSING si fichier absent
     * - MISSING -> SUCCESS si fichier réapparaît
     * - Ne touche pas aux autres statuts
     */
    @Transactional
    public void synchronize() {

        Path backupDirectory = Path.of(appProperties.getBackup().getDirectory());

        if (!Files.exists(backupDirectory)) {
            log.warn("Backup directory does not exist: {}", backupDirectory.toAbsolutePath());
            return;
        }

        // On ne vérifie que SUCCESS et MISSING
        List<BackupExecution> executions =
                backupExecutionRepository.findByStatusIn(
                        List.of(ExecutionStatus.SUCCESS, ExecutionStatus.MISSING)
                );

        for (BackupExecution execution : executions) {

            String filePathValue = execution.getFilePath();

            if (filePathValue == null || filePathValue.isBlank()) {
                continue;
            }

            Path filePath = Path.of(filePathValue);

            boolean fileExists = Files.exists(filePath);
            ExecutionStatus currentStatus = execution.getStatus();

            if (currentStatus == ExecutionStatus.SUCCESS && !fileExists) {

                log.warn("File missing for execution id={} path={}",
                        execution.getId(), filePathValue);

                execution.setStatus(ExecutionStatus.MISSING);
            }

            else if (currentStatus == ExecutionStatus.MISSING && fileExists) {

                log.info("File restored for execution id={} path={}",
                        execution.getId(), filePathValue);

                execution.setStatus(ExecutionStatus.SUCCESS);
            }
        }

        log.info("Backup consistency check completed.");
    }
}