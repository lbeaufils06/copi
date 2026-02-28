package com.backend.copi.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import com.backend.copi.enums.CompressionType;
import com.backend.copi.enums.DatabaseType;
import com.backend.copi.enums.ExecutionMode;
import com.backend.copi.enums.ExecutionStatus;
import com.backend.copi.enums.RetentionPolicy;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "backup_job")
public class BackupJob {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private DatabaseType dbType;

    @Column(nullable = false)
    private String host;

    @Column(nullable = false)
    private Integer port;

    private String dbName;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false)
    private String passwordEncrypted;

    @Column(nullable = false)
    private Boolean enabled = true;
    
    private String cronExpression;
    
    private String cronPurgeExpression;
        
    private LocalDateTime nextExecutionTime;
    
    private LocalDateTime nextPurgeTime;
    
    private Integer retentionCount;
    
    @Enumerated(EnumType.STRING)
    private RetentionPolicy retentionPolicy;
    
    private LocalDateTime lastSuccessTime;
    
    @Column(nullable = false)
    private Integer versionCount = 0;
    
    @Enumerated(EnumType.STRING)
    private ExecutionStatus lastStatus;
    
    private String lastStatusMessage;
    
    @Enumerated(EnumType.STRING)
    private CompressionType compressionType;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExecutionMode executionMode = ExecutionMode.SCHEDULED;
    
    @Column(length = 1000)
    private String dumpOptions;
}
