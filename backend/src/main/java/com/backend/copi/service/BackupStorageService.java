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

    // resolveJobDirectory: Resolves job directory using fallback and validation rules.
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

    // sanitizeRepo: Sanitizes repo to ensure safe and consistent values.
    private String sanitizeRepo(String input) {

        if (input == null || input.isBlank()) {
            throw new IllegalArgumentException("Job name cannot be empty");
        }

        return input.trim()
                .replace("\\", "/")
                .replaceAll("[^a-zA-Z0-9_-]", "_")
                .toLowerCase();
    }
    
    // sanitizeFile: Sanitizes file to ensure safe and consistent values.
    public String sanitizeFile(String input) {

        if (input == null || input.isBlank()) {
            throw new IllegalArgumentException("File name cannot be empty");
        }

        String cleaned = input.trim();

        // Remove all path separators
        cleaned = cleaned.replace("\\", "")
                         .replace("/", "");

        // Replaces unauthorized characters
        cleaned = cleaned.replaceAll("[^a-zA-Z0-9._-]", "_");

        return cleaned.toLowerCase();
    }
    
    // deleteJobRepository: Deletes job repository and cleans up linked resources.
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
            return; // nothing to delete
        }

        // Recursive deletion
        Files.walk(jobPath)
                .sorted((a, b) -> b.compareTo(a)) // supprime fichiers avant dossiers
                .forEach(path -> {
                    try {
                        Files.delete(path);
                    } catch (IOException e) {
                        log.error("Failed to delete path {}", path, e);
                    }
                });
    }

    @Transactional
    // synchronize: Handles synchronize in the current backend workflow.
    public void synchronize() {
    	
    	if (!running.compareAndSet(false, true)) {
            return; // already in progress
        }

    	try {
            //We only check SUCCESS and MISSING
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
	
	            if ((currentStatus == ExecutionStatus.SUCCESS || currentStatus == ExecutionStatus.MISSING) && !fileExists) {
	
	                log.warn("File missing for execution id={} path={}",
	                        execution.getId(), filePathValue);
	
	                execution.setStatus(ExecutionStatus.FAILED);
	            }
	
	            else if (currentStatus == ExecutionStatus.MISSING) {
	
	                log.info("File restored for execution id={} path={}",
	                        execution.getId(), filePathValue);
	
	                execution.setStatus(ExecutionStatus.SUCCESS);
	            }
	        }
    	} finally {
            running.set(false);
        }
    }
    
    // compress: Compresses the related data using the configured compression strategy.
    public String compress(String inputFilePath, CompressionType type) throws IOException {
    	
    	if(type == null) return inputFilePath;
	
		return switch (type) {
			case NONE -> inputFilePath;
			case GZIP -> compressGzip(inputFilePath);
			case ZIP -> compressZip(inputFilePath);
		};

	}
    
    // compressGzip: Compresses gzip using the configured compression strategy.
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
    
    // compressZip: Compresses zip using the configured compression strategy.
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
    // deleteFailedExecutionFiles: Deletes failed execution files and cleans up linked resources.
    public void deleteFailedExecutionFiles() {

        List<BackupExecution> failedExecutions =
                backupExecutionRepository.findByStatus(ExecutionStatus.FAILED);

        int deletedCount = 0;

        for (BackupExecution execution : failedExecutions) {

            try {
                deleteExecutionFiles(execution);
                deletedCount++;

            } catch (Exception e) {
                log.error(
                        "Failed to delete files for execution {}",
                        execution.getId(),
                        e
                );
            }
        }

        log.info("Deleted files for {} failed executions", deletedCount);
    }
    
    // deleteExecutionFiles: Deletes execution files and cleans up linked resources.
    private void deleteExecutionFiles(BackupExecution exec) throws IOException {

        BackupJob job = exec.getJob();

        Path jobDirectory = resolveJobDirectory(job);

        String timestamp = exec.getStartTime()
                .format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));

        String baseName = sanitizeFile(job.getName()) + "_" + timestamp;

        try (DirectoryStream<Path> stream =
                     Files.newDirectoryStream(jobDirectory, baseName + "*")) {

            for (Path file : stream) {
                Files.deleteIfExists(file);
                log.info("Deleted file {}", file.getFileName());
            }
        }
    }
    
}
