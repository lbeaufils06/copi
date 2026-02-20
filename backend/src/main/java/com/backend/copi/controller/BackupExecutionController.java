package com.backend.copi.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.copi.entity.BackupExecution;
import com.backend.copi.service.BackupExecutionService;

import lombok.RequiredArgsConstructor;

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
