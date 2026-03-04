package com.backend.copi.mapper;

import com.backend.copi.dto.BackupJobRequestDTO;
import com.backend.copi.dto.BackupJobResponseDTO;
import com.backend.copi.entity.BackupJob;
import org.springframework.stereotype.Component;

@Component
public class BackupJobMapper {

    public BackupJobResponseDTO toResponseDto(BackupJob job) {
        if (job == null) {
            return null;
        }

        BackupJobResponseDTO dto = new BackupJobResponseDTO();

        dto.setId(job.getId());
        dto.setName(job.getName());
        dto.setDbType(job.getDbType());
        dto.setHost(job.getHost());
        dto.setPort(job.getPort());
        dto.setDbName(job.getDbName());
        dto.setUsername(job.getUsername());
        dto.setEnabled(job.getEnabled());
        dto.setCronExpression(job.getCronExpression());
        dto.setCronPurgeExpression(job.getCronPurgeExpression());
        dto.setNextExecutionTime(job.getNextExecutionTime());
        dto.setNextPurgeTime(job.getNextPurgeTime());
        dto.setRetentionCount(job.getRetentionCount());
        dto.setRetentionPolicy(job.getRetentionPolicy());
        dto.setLastSuccessTime(job.getLastSuccessTime());
        dto.setVersionCount(job.getVersionCount());
        dto.setLastStatus(job.getLastStatus());
        dto.setLastStatusMessage(job.getLastStatusMessage());
        dto.setCompressionType(job.getCompressionType());
        dto.setExecutionMode(job.getExecutionMode());
        dto.setDumpOptions(job.getDumpOptions());
        dto.setAuthenticationDatabase(job.getAuthenticationDatabase());

        return dto;
    }

    public BackupJob toEntity(BackupJobRequestDTO dto) {
        if (dto == null) {
            return null;
        }

        BackupJob job = new BackupJob();
        job.setName(dto.getName());
        job.setDbType(dto.getDbType());
        job.setHost(dto.getHost());
        job.setPort(dto.getPort());
        job.setPasswordEncrypted(dto.getPasswordEncrypted());
        job.setDbName(dto.getDbName());
        job.setUsername(dto.getUsername());
        job.setCronExpression(dto.getCronExpression());
        job.setRetentionCount(dto.getRetentionCount());
        job.setRetentionPolicy(dto.getRetentionPolicy());
        job.setCompressionType(dto.getCompressionType());
        job.setExecutionMode(dto.getExecutionMode());
        job.setDumpOptions(dto.getDumpOptions());
        job.setAuthenticationDatabase(dto.getAuthenticationDatabase());

        return job;
    }

    public void updateEntityFromDto(BackupJobRequestDTO dto, BackupJob job) {

        if (dto == null || job == null) {
            return;
        }

        if (dto.getName() != null) {
            job.setName(dto.getName());
        }

        if (dto.getDbType() != null) {
            job.setDbType(dto.getDbType());
        }

        if (dto.getHost() != null) {
            job.setHost(dto.getHost());
        }

        if (dto.getPort() != null) {
            job.setPort(dto.getPort());
        }

        if (dto.getDbName() != null) {
            job.setDbName(dto.getDbName());
        }

        if (dto.getUsername() != null) {
            job.setUsername(dto.getUsername());
        }

        if (dto.getCronExpression() != null) {
            job.setCronExpression(dto.getCronExpression());
        }

        if (dto.getRetentionCount() != null) {
            job.setRetentionCount(dto.getRetentionCount());
        }

        if (dto.getRetentionPolicy() != null) {
            job.setRetentionPolicy(dto.getRetentionPolicy());
        }

        if (dto.getCompressionType() != null) {
            job.setCompressionType(dto.getCompressionType());
        }

        if (dto.getExecutionMode() != null) {
            job.setExecutionMode(dto.getExecutionMode());
        }

        if (dto.getDumpOptions() != null) {
            job.setDumpOptions(dto.getDumpOptions());
        }

        if (dto.getAuthenticationDatabase() != null) {
            job.setAuthenticationDatabase(dto.getAuthenticationDatabase());
        }
    }
}
