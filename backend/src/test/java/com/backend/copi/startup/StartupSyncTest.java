package com.backend.copi.startup;

import static org.mockito.Mockito.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InOrder;

import com.backend.copi.service.BackupJobService;
import com.backend.copi.service.BackupStorageService;

class StartupSyncTest {

    private BackupStorageService backupStorageService;
    private BackupJobService backupJobService;
    private StartupSync startupSync;

    @BeforeEach
    void setup() {
        backupStorageService = mock(BackupStorageService.class);
        backupJobService = mock(BackupJobService.class);

        startupSync = new StartupSync(
                backupStorageService,
                backupJobService
        );
    }

    @Test
    void onStartup_shouldCallServicesInCorrectOrder() {

        startupSync.onStartup();

        InOrder inOrder = inOrder(backupStorageService, backupJobService);

        inOrder.verify(backupStorageService).synchronize();
        inOrder.verify(backupJobService).recoverInterruptedExecutions();
        inOrder.verify(backupStorageService).deleteFailedExecutionFiles();

        verifyNoMoreInteractions(backupStorageService, backupJobService);
    }
}