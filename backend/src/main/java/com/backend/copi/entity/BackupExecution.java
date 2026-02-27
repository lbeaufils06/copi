package com.backend.copi.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import com.backend.copi.enums.ExecutionStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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
    @JsonIgnore
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
