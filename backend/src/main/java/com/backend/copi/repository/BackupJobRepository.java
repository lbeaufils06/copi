package com.backend.copi.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backend.copi.entity.BackupJob;
import com.backend.copi.entity.ExecutionStatus;

public interface BackupJobRepository extends JpaRepository<BackupJob, UUID> {
	
	List<BackupJob> findByLastStatus(ExecutionStatus status);
	
}
