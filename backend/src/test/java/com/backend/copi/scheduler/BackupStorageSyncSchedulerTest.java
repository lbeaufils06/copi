package com.backend.copi.scheduler;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.backend.copi.scheduler.BackupStorageSyncScheduler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.backend.copi.service.BackupStorageService;

class BackupStorageSyncSchedulerTest {

    private BackupStorageService backupStorageService;
    private BackupStorageSyncScheduler scheduler;

    @BeforeEach
    void setup() {
        backupStorageService = mock(BackupStorageService.class);
        scheduler = new BackupStorageSyncScheduler(backupStorageService);
    }

    @Test
    void syncBackups_shouldCallSynchronize() {

        scheduler.syncBackups();

        verify(backupStorageService, times(1)).synchronize();
    }

    @Test
    void syncBackups_shouldNotThrow_whenSynchronizeFails() {

        doThrow(new RuntimeException("failure"))
                .when(backupStorageService)
                .synchronize();

        assertDoesNotThrow(() -> scheduler.syncBackups());

        verify(backupStorageService, times(1)).synchronize();
    }
}