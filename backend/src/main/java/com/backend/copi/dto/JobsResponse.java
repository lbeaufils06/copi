package com.backend.copi.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.backend.copi.entity.BackupJob;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class JobsResponse {

    private LocalDateTime serverTime;
    private List<BackupJob> jobs;
}