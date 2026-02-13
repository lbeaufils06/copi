package com.backend.copi.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Getter
@Setter
@Table(name = "backup_execution")
public class BackupExecution {

    @Id
    @GeneratedValue
    private UUID id;

    private UUID jobId;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private String status; // SUCCESS / FAILED

    @Column(length = 2000)
    private String logMessage;
}
