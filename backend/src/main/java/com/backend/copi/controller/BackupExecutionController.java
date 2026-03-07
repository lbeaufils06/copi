package com.backend.copi.controller;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.UUID;

import com.backend.copi.dto.BackupExecutionResponseDTO;
import com.backend.copi.entity.BackupExecution;
import com.backend.copi.exception.ResourceNotFoundException;
import com.backend.copi.service.BackupExecutionService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/executions")
@RequiredArgsConstructor
public class BackupExecutionController {

    private final BackupExecutionService executionService;

    @GetMapping("/{jobId}")
    // getByJob: Returns execution history filtered by job id.
    public List<BackupExecutionResponseDTO> getByJob(@PathVariable UUID jobId) {
        return executionService.getExecutionsByJob(jobId);
    }

    @GetMapping
    // getAll: Returns global execution history ordered by start time.
    public List<BackupExecutionResponseDTO> getAll() {
        return executionService.getAllExecutions();
    }

    @GetMapping({"/{executionId}/download", "/download/{executionId}"})
    // downloadExecutionFile: Streams the backup file for a successful execution as an attachment.
    public ResponseEntity<Resource> downloadExecutionFile(@PathVariable UUID executionId) throws IOException {
        BackupExecution execution = executionService.getExecutionById(executionId);

        String filePath = execution.getFilePath();
        if (filePath == null || filePath.isBlank()) {
            throw new ResourceNotFoundException("No backup file linked to this execution");
        }

        Path path = Path.of(filePath).normalize();
        if (!Files.exists(path) || !Files.isRegularFile(path)) {
            throw new ResourceNotFoundException("Backup file not found on disk");
        }

        Resource resource = new UrlResource(path.toUri());
        String fileName = execution.getFileName() != null && !execution.getFileName().isBlank()
                ? execution.getFileName()
                : path.getFileName().toString();

        String contentType = Files.probeContentType(path);
        if (contentType == null || contentType.isBlank()) {
            contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
        }

        ContentDisposition disposition = ContentDisposition.attachment()
                .filename(fileName, StandardCharsets.UTF_8)
                .build();

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .body(resource);
    }
}
