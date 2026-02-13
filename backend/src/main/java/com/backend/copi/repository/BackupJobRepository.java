package com.backend.copi.repository;

import com.backend.copi.entity.BackupJob;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface BackupJobRepository extends JpaRepository<BackupJob, UUID> {
}
