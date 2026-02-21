package com.backend.copi.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackupExecution {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private BackupJob job;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private Long durationInSeconds;

    @Enumerated(EnumType.STRING)
    private ExecutionStatus status;

    @Column(length = 4000)
    private String logMessage;

    private String filePath;
    
    private String fileName;
}
