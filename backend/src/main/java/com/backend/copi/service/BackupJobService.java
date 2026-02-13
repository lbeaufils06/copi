package com.backend.copi.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.backend.copi.entity.BackupJob;
import com.backend.copi.repository.BackupJobRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BackupJobService {

    private final BackupJobRepository repository;
    private final CryptoService cryptoService;

    public List<BackupJob> getAllJobs() {
        return repository.findAll();
    }

    public BackupJob createJob(BackupJob job) {
    	job.setPasswordEncrypted(cryptoService.encrypt(job.getPasswordEncrypted()));
        return repository.save(job);
    }

    public BackupJob updateJob(UUID id, BackupJob updatedJob) {

        BackupJob existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        existing.setName(updatedJob.getName());
        existing.setDbType(updatedJob.getDbType());
        existing.setHost(updatedJob.getHost());
        existing.setPort(updatedJob.getPort());
        existing.setDbName(updatedJob.getDbName());
        existing.setUsername(updatedJob.getUsername());
        if (updatedJob.getPasswordEncrypted() != null && !updatedJob.getPasswordEncrypted().isBlank()) {
        	existing.setPasswordEncrypted(cryptoService.encrypt(updatedJob.getPasswordEncrypted()));
        }
        existing.setCronExpression(updatedJob.getCronExpression());
        existing.setEnabled(updatedJob.getEnabled());
        existing.setNextExecutionTime(updatedJob.getNextExecutionTime());

        return repository.save(existing);
    }
    
    public BackupJob updateJobScheduler(UUID id, BackupJob updatedJob) {

        BackupJob existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        existing.setNextExecutionTime(updatedJob.getNextExecutionTime());

        return repository.save(existing);
    }

    public List<BackupJob> getEnabledJobs() {
        return repository.findAll()
                .stream()
                .filter(job -> Boolean.TRUE.equals(job.getEnabled()))
                .toList();
    }
    
    public void deleteJob(UUID id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Job not found");
        }
        repository.deleteById(id);
    }
    

}
