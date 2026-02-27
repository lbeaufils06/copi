package com.backend.copi.scheduler;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.backend.copi.service.BackupStorageService;

class SchedulerServiceSyncTest {

    private BackupStorageService backupStorageService;
    private SchedulerServiceSync scheduler;

    @BeforeEach
    void setup() {
        backupStorageService = mock(BackupStorageService.class);
        scheduler = new SchedulerServiceSync(backupStorageService);
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