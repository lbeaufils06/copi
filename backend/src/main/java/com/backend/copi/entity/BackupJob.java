package com.backend.copi.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
    private String dbType;

    @Column(nullable = false)
    private String host;

    @Column(nullable = false)
    private Integer port;

    @Column(nullable = false)
    private String dbName;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false)
    private String passwordEncrypted;

    @Column(nullable = false)
    private Boolean enabled = true;
    
    @Column(nullable = false)
    private String cronExpression;
    
    private LocalDateTime startExecutionTime;
    
    private LocalDateTime endExecutionTime;
    
    private LocalDateTime nextExecutionTime;
}
