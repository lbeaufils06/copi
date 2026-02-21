package com.backend.copi.scheduler;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.backend.copi.service.SyncBackupService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class SchedulerSyncBackup {

	private final SyncBackupService syncBackupService;

    // Toutes les 5 minutes (300 000 ms)
    @Scheduled(fixedRate = 300000)
    public void syncBackups() {

        log.info("Starting backup consistency check...");

        try {
        	syncBackupService.synchronize();
            log.info("Backup consistency check finished.");
        } catch (Exception e) {
            log.error("Error during backup consistency check", e);
        }
    }
}