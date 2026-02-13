package com.backend.copi.repository;

import com.backend.copi.entity.BackupExecution;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface BackupExecutionRepository extends JpaRepository<BackupExecution, UUID> {
}
