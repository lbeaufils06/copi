package com.backend.copi.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.stereotype.Service;

import com.backend.copi.config.AppProperties;
import com.backend.copi.entity.BackupJob;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BackupStorageService {

    private final AppProperties appProperties;

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
}