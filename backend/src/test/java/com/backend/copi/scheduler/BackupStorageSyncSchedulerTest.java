package com.backend.copi.scheduler;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.backend.copi.service.BackupExecutionService;
import com.backend.copi.service.BackupStorageService;

class BackupStorageSyncSchedulerTest {

    private BackupStorageService backupStorageService;
    private BackupExecutionService backupExecutionService;
    private BackupStorageSyncScheduler scheduler;

    @BeforeEach
    void setup() {
        backupStorageService = mock(BackupStorageService.class);
        backupExecutionService = mock(BackupExecutionService.class);

        scheduler = new BackupStorageSyncScheduler(
                backupStorageService,
                backupExecutionService
        );
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