package com.backend.copi.mapper;

import com.backend.copi.dto.BackupExecutionResponseDTO;
import com.backend.copi.entity.BackupExecution;
import org.springframework.stereotype.Component;

@Component
public class BackupExecutionMapper {

    // toDto: Converts dto into the target data representation.
    public BackupExecutionResponseDTO toDto(BackupExecution execution) {

        if (execution == null) {
            return null;
        }

        BackupExecutionResponseDTO dto =
                new BackupExecutionResponseDTO();

        dto.setId(execution.getId());
        dto.setExecutionTime(execution.getExecutionTime());
        dto.setExecutionMode(execution.getExecutionMode());
        dto.setStartTime(execution.getStartTime());
        dto.setEndTime(execution.getEndTime());
        dto.setDurationInSeconds(execution.getDurationInSeconds());
        dto.setStatus(execution.getStatus());
        dto.setLogMessage(execution.getLogMessage());
        dto.setFileName(execution.getFileName());
        dto.setFilePath(execution.getFilePath());

        return dto;
    }
}