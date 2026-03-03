package com.backend.copi.dto;

import com.backend.copi.enums.*;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
public class BackupJobResponseDTO {
    private UUID id;
    private String name;
    private DatabaseType dbType;
    private String host;
    private Integer port;
    private String dbName;
    private String username;
    private Boolean enabled;
    private String cronExpression;
    private String cronPurgeExpression;
    private LocalDateTime nextExecutionTime;
    private LocalDateTime nextPurgeTime;
    private Integer retentionCount;
    private RetentionPolicy retentionPolicy;
    private LocalDateTime lastSuccessTime;
    private Integer versionCount;
    private ExecutionStatus lastStatus;
    private String lastStatusMessage;
    private CompressionType compressionType;
    private ExecutionMode executionMode;
    private String dumpOptions;
    private String authenticationDatabase;
}
