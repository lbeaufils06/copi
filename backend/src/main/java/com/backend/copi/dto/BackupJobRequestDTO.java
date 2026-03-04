package com.backend.copi.dto;

import com.backend.copi.enums.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
public class BackupJobRequestDTO {
    private String name;
    private DatabaseType dbType;
    private String host;
    private Integer port;
    private String dbName;
    private String username;
    private String passwordEncrypted;
    private String cronExpression;
    private Integer retentionCount;
    private RetentionPolicy retentionPolicy;
    private CompressionType compressionType;
    private ExecutionMode executionMode;
    private String dumpOptions;
    private String authenticationDatabase;
    private DumpOptionsMode dumpOptionsMode;
    private DbNameOptionsMode dbNameOptionsMode;
}
