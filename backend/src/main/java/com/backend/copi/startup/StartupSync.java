package com.backend.copi.startup;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import com.backend.copi.service.BackupJobService;
import com.backend.copi.service.BackupStorageService;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class StartupSync {

    private final BackupStorageService backupStorageService;
    private final BackupJobService backupJobService;

    public StartupSync(
            BackupStorageService backupStorageService,
            BackupJobService backupJobService) {
        this.backupStorageService = backupStorageService;
        this.backupJobService = backupJobService;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void onStartup() {
        backupStorageService.synchronize();
        backupJobService.recoverInterruptedExecutions();
        backupStorageService.deleteFailedExecutionFiles();
        log.info("START");
    }
}