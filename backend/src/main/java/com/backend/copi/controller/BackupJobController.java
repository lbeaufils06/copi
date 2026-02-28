package com.backend.copi.controller;

import java.io.IOException;
import java.time.Clock;
import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.backend.copi.dto.JobsResponse;
import com.backend.copi.entity.BackupJob;
import com.backend.copi.enums.DatabaseType;
import com.backend.copi.scheduler.SchedulerService;
import com.backend.copi.service.BackupJobService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class BackupJobController {

    private final BackupJobService service;
    private final SchedulerService schedulerService;
    private final Clock clock;

    @GetMapping
    public JobsResponse getJobs() {
        return new JobsResponse(
                LocalDateTime.now(clock),
                service.getAllJobs()
        );
    }
    
    @GetMapping("/{id}")
    public BackupJob getJob(@PathVariable UUID id) {
        return service.getJobById(id);
    }

    @PostMapping
    public BackupJob create(@RequestBody BackupJob job) {
        return service.createJob(job);
    }
    
    @PutMapping("/{id}")
    public BackupJob update(@PathVariable UUID id,
                            @RequestBody BackupJob job) throws IOException {
        return service.updateJob(id, job);
    }
    
    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) throws IOException {
        service.deleteJob(id);
    }
    
    @PostMapping("/{id}/start")
    public ResponseEntity<Void> startJob(@PathVariable UUID id) {
        schedulerService.runManually(id);
        return ResponseEntity.accepted().build();
    }
    
    @GetMapping("/defaults")
    public String getDefaultDumpOptions(@RequestParam DatabaseType type) {
        return service.getDefaultOptions(type);
    }
}
