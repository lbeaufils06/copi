package com.backend.copi.controller;

import java.io.IOException;
import java.time.Clock;
import java.time.LocalDateTime;
import java.util.UUID;

import com.backend.copi.dto.BackupJobRequestDTO;
import com.backend.copi.dto.BackupJobResponseDTO;
import com.backend.copi.dto.DefaultsResponse;
import com.backend.copi.service.utils.DefaultService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.copi.dto.JobsResponse;
import com.backend.copi.scheduler.BackupJobScheduler;
import com.backend.copi.service.BackupJobService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class BackupJobController {

    private final BackupJobService service;
    private final BackupJobScheduler backupJobScheduler;
    private final Clock clock;
    private final DefaultService defaultService;

    @GetMapping
    public JobsResponse getJobs() {
        return new JobsResponse(LocalDateTime.now(clock), service.getAllJobs());
    }
    
    @GetMapping("/{id}")
    public BackupJobResponseDTO getJob(@PathVariable UUID id) {
        return service.getJobById(id);
    }

    @PostMapping
    public BackupJobResponseDTO create(@RequestBody BackupJobRequestDTO dto) {
        return service.createJob(dto);
    }
    
    @PutMapping("/{id}")
    public BackupJobResponseDTO update(@PathVariable UUID id, @RequestBody BackupJobRequestDTO dto) throws IOException {
        return service.updateJob(id, dto);
    }
    
    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) throws IOException {
        service.deleteJob(id);
    }
    
    @PostMapping("/{id}/start")
    public ResponseEntity<Void> startJob(@PathVariable UUID id) {
        backupJobScheduler.runManually(id);
        return ResponseEntity.accepted().build();
    }

    @GetMapping("/defaults")
    public DefaultsResponse getDefaults() {
        return new DefaultsResponse(defaultService.getDefaults(), defaultService.getAllDefaultDumpOptions());
    }
}
