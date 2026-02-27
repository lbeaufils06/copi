package com.backend.copi.scheduler;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.backend.copi.service.BackupStorageService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class SchedulerServiceSync {

    private final BackupStorageService backupStorageService;

    @Scheduled(fixedRate = 300000)
    public void syncBackups() {

        try {
        	backupStorageService.synchronize();        	
        } catch (Exception e) {
            log.error("Error during backup consistency check", e);
        } finally {
        	log.info("Start syncBackups");
        }
    }
}