package com.backend.copi.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backend.copi.entity.BackupExecution;
import com.backend.copi.entity.BackupJob;

public interface BackupExecutionRepository extends JpaRepository<BackupExecution, UUID> {
	
	List<BackupExecution> findByJobIdOrderByStartTimeDesc(UUID jobId);
	
	List<BackupExecution> findAllByOrderByStartTimeDesc();
	
	void deleteByJob(BackupJob job);
	
	List<BackupExecution> findByJobOrderByStartTimeDesc(BackupJob job);
	
	List<BackupExecution> findByJobAndStartTimeAfter(
	        BackupJob job,
	        LocalDateTime startTime
	);


}
