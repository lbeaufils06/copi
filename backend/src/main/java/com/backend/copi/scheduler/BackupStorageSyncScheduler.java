package com.backend.copi.scheduler;

import com.backend.copi.service.BackupExecutionService;
import org.springframework.context.annotation.Profile;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.backend.copi.service.BackupStorageService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
@Profile("!test")
public class BackupStorageSyncScheduler {

    private final BackupStorageService backupStorageService;
    private final BackupExecutionService backupExecutionService;

    @Scheduled(fixedRate = 300000)
    public void syncBackups() {

        try {
        	backupStorageService.synchronize();
            backupExecutionService.purgeFailedAndMissingOlderThan7Days();
        } catch (Exception e) {
            log.error("Error during backup consistency check", e);
        } finally {
        	log.info("Start syncBackups");
        }
    }
}