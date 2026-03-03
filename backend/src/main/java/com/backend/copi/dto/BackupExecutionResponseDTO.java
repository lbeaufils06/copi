package com.backend.copi.dto;

import com.backend.copi.entity.BackupJob;
import com.backend.copi.enums.ExecutionStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
public class BackupExecutionResponseDTO {
    private UUID id;
    private BackupJob job;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Long durationInSeconds;
    private ExecutionStatus status;
    private String logMessage;
    private String filePath;
    private String fileName;
}
