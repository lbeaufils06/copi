package com.backend.copi.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.copi.config.AppProperties;
import com.backend.copi.entity.BackupExecution;
import com.backend.copi.entity.BackupJob;
import com.backend.copi.entity.ExecutionStatus;
import com.backend.copi.repository.BackupExecutionRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class BackupStorageService {

	private final BackupExecutionRepository backupExecutionRepository;
    private final AppProperties appProperties;
    private final AtomicBoolean running = new AtomicBoolean(false);

    public Path resolveJobDirectory(BackupJob job) throws IOException {

        Path basePath = Paths.get(appProperties.getBackup().getDirectory())
                .toAbsolutePath()
                .normalize();

        Files.createDirectories(basePath);

        String safeDirectory = sanitizeRepo(job.getName());

        Path jobPath = basePath.resolve(safeDirectory)
                .normalize();

        if (!jobPath.startsWith(basePath)) {
            throw new IllegalArgumentException("Invalid directory path");
        }

        Files.createDirectories(jobPath);

        return jobPath;
    }

    private String sanitizeRepo(String input) {

        if (input == null || input.isBlank()) {
            throw new IllegalArgumentException("Job name cannot be empty");
        }

        return input.trim()
                .replace("\\", "/")
                .replaceAll("[^a-zA-Z0-9_-]", "_")
                .toLowerCase();
    }
    
    public String sanitizeFile(String input) {

        if (input == null || input.isBlank()) {
            throw new IllegalArgumentException("File name cannot be empty");
        }

        String cleaned = input.trim();

        // Supprime tout séparateur de chemin
        cleaned = cleaned.replace("\\", "")
                         .replace("/", "");

        // Remplace caractères non autorisés
        cleaned = cleaned.replaceAll("[^a-zA-Z0-9._-]", "_");

        return cleaned.toLowerCase();
    }
    
    public void deleteJobRepository(BackupJob job) throws IOException {

        Path basePath = Paths.get(appProperties.getBackup().getDirectory())
                .toAbsolutePath()
                .normalize();

        String safeDirectory = sanitizeRepo(job.getName());

        Path jobPath = basePath.resolve(safeDirectory)
                .normalize();

        if (!jobPath.startsWith(basePath)) {
            throw new IllegalArgumentException("Invalid directory path");
        }

        if (!Files.exists(jobPath)) {
            return; // rien à supprimer
        }

        // Suppression récursive
        Files.walk(jobPath)
                .sorted((a, b) -> b.compareTo(a)) // supprime fichiers avant dossiers
                .forEach(path -> {
                    try {
                        Files.delete(path);
                    } catch (IOException e) {
                        throw new RuntimeException("Failed to delete: " + path, e);
                    }
                });
    }
    
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
    	
    	if (!running.compareAndSet(false, true)) {
            return; // déjà en cours
        }

    	try {
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
    	} finally {
    		log.info("Sync files and db...");
            running.set(false);
        }
    }
}