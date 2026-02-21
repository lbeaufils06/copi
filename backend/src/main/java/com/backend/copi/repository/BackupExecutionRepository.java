package com.backend.copi.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backend.copi.entity.BackupExecution;
import com.backend.copi.entity.BackupJob;
import com.backend.copi.entity.ExecutionStatus;

public interface BackupExecutionRepository extends JpaRepository<BackupExecution, UUID> {
	
	List<BackupExecution> findByJobIdOrderByStartTimeDesc(UUID jobId);
	
	List<BackupExecution> findAllByOrderByStartTimeDesc();
	
	void deleteByJob(BackupJob job);
	
	List<BackupExecution> findByJobAndStatusOrderByStartTimeDesc(
	        BackupJob job,
	        ExecutionStatus status
	);
	
	List<BackupExecution> findByJobAndStartTimeAfter(
	        BackupJob job,
	        LocalDateTime startTime
	);
	
	long countByJob_IdAndStatus(UUID jobId, ExecutionStatus status);
	
	List<BackupExecution> findByStatusIn(List<ExecutionStatus> statuses);
	
	List<BackupExecution> findByStatus(ExecutionStatus status);


}
