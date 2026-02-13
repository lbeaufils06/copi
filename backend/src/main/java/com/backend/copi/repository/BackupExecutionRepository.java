package com.backend.copi.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backend.copi.entity.BackupExecution;

public interface BackupExecutionRepository extends JpaRepository<BackupExecution, UUID> {
	
	List<BackupExecution> findByJobIdOrderByStartTimeDesc(UUID jobId);
}
