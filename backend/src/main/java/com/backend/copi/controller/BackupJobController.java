package com.backend.copi.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.backend.copi.entity.BackupJob;
import com.backend.copi.service.BackupJobService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class BackupJobController {

    private final BackupJobService service;

    @GetMapping
    public List<BackupJob> getAll() {
        return service.getAllJobs();
    }

    @PostMapping
    public BackupJob create(@RequestBody BackupJob job) {
        return service.createJob(job);
    }
    
    @PutMapping("/{id}")
    public BackupJob update(@PathVariable UUID id,
                            @RequestBody BackupJob job) {
        return service.updateJob(id, job);
    }
    
    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        service.deleteJob(id);
    }
}
