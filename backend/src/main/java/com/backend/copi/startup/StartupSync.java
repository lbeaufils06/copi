package com.backend.copi.startup;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import com.backend.copi.service.BackupStorageService;

@Component
public class StartupSync {

    private final BackupStorageService backupStorageService;

    public StartupSync(BackupStorageService backupStorageService) {
        this.backupStorageService = backupStorageService;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void onStartup() {
        backupStorageService.synchronize();
    }
}