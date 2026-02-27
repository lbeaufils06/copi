package com.backend.copi.service;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.zip.GZIPOutputStream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.copi.config.AppProperties;
import com.backend.copi.entity.BackupExecution;
import com.backend.copi.entity.BackupJob;
import com.backend.copi.enums.CompressionType;
import com.backend.copi.enums.ExecutionStatus;
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
            running.set(false);
        }
    }
    
    public String compress(String inputFilePath, CompressionType type) throws IOException {
    	
    	if(type == null) return inputFilePath;
	
		return switch (type) {
			case NONE -> inputFilePath;
			case GZIP -> compressGzip(inputFilePath);
			case ZIP -> compressZip(inputFilePath);
		};
	}
    
    private String compressGzip(String inputFilePath) throws IOException {

        Path inputFile = Path.of(inputFilePath);
        Path outputFile = Path.of(inputFilePath + ".gz");

        try (
                InputStream in = Files.newInputStream(inputFile);
                OutputStream out = new GZIPOutputStream(
                        Files.newOutputStream(outputFile))
        ) {
            in.transferTo(out);
        }

        return outputFile.toString();
    }
    
    private String compressZip(String inputFilePath) throws IOException {

        Path inputFile = Path.of(inputFilePath);
        Path outputFile = Path.of(inputFilePath + ".zip");

        try (
                ZipOutputStream zos = new ZipOutputStream(
                        Files.newOutputStream(outputFile));
                InputStream in = Files.newInputStream(inputFile)
        ) {
            ZipEntry entry = new ZipEntry(
                    inputFile.getFileName().toString()
            );

            zos.putNextEntry(entry);
            in.transferTo(zos);
            zos.closeEntry();
        }

        return outputFile.toString();
    }
    
    @Transactional
    public void deleteFailedExecutionsAndFiles() {

        List<BackupExecution> failedExecutions =
        		backupExecutionRepository.findByStatus(ExecutionStatus.FAILED);

        for (BackupExecution exec : failedExecutions) {

            try {
                deleteExecutionFiles(exec);
            } catch (Exception e) {
                log.error("Failed to delete files for execution {}", exec.getId(), e);
            }

            backupExecutionRepository.delete(exec);
        }

        log.info("Deleted {} failed executions", failedExecutions.size());
    }
    
    private void deleteExecutionFiles(BackupExecution exec) throws IOException {

        BackupJob job = exec.getJob();

        Path jobDirectory = resolveJobDirectory(job);

        String timestamp = exec.getStartTime()
                .format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));

        String baseName = job.getName() + "_" + timestamp;

        try (DirectoryStream<Path> stream =
                     Files.newDirectoryStream(jobDirectory, baseName + "*")) {

            for (Path file : stream) {
                Files.deleteIfExists(file);
                log.info("Deleted file {}", file.getFileName());
            }
        }
    }
    
}