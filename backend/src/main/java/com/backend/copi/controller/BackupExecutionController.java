package com.backend.copi.controller;

import com.backend.copi.entity.BackupExecution;
import com.backend.copi.service.BackupExecutionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/executions")
@RequiredArgsConstructor
public class BackupExecutionController {

    private final BackupExecutionService executionService;

    @GetMapping("/{jobId}")
    public List<BackupExecution> getByJob(
            @PathVariable UUID jobId) {

        return executionService.getExecutionsByJob(jobId);
    }
    
    @GetMapping
    public List<BackupExecution> getAll() {
        return executionService.getAllExecutions();
    }
}
