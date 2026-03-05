package com.backend.copi.service.dump;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.nio.file.Path;
import java.util.UUID;

import com.backend.copi.service.utils.DefaultService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.backend.copi.config.AppProperties;
import com.backend.copi.entity.BackupJob;
import com.backend.copi.service.BackupStorageService;
import com.backend.copi.service.utils.CryptoService;

class MySqlDumpServiceTest {

    private CryptoService cryptoService;
    private AppProperties appProperties;
    private BackupStorageService backupStorageService;
    private MySqlDumpService service;
    private DefaultService defaultService;

    @BeforeEach
    void setup() {

        cryptoService = mock(CryptoService.class);
        appProperties = mock(AppProperties.class);
        backupStorageService = mock(BackupStorageService.class);
        defaultService = mock(DefaultService.class);

        // Mock nested properties
        AppProperties.Mysqldump mysqldump = mock(AppProperties.Mysqldump.class);
        when(appProperties.getMysqldump()).thenReturn(mysqldump);
        when(mysqldump.getPath()).thenReturn("invalid-mysqldump-path");

        service = new MySqlDumpService(
                cryptoService,
                appProperties,
                backupStorageService,
                defaultService
        );
    }

    @Test
    void supports_shouldReturnTrueForMysql() {
        assertTrue(service.supports("MYSQL"));
        assertTrue(service.supports("mysql"));
        assertFalse(service.supports("POSTGRES"));
    }

    @Test
    void executeDump_shouldThrowException_whenProcessFails() throws Exception {

        BackupJob job = new BackupJob();
        job.setId(UUID.randomUUID());
        job.setName("test");
        job.setHost("localhost");
        job.setPort(3306);
        job.setUsername("root");
        job.setPasswordEncrypted("encrypted");
        job.setDbName("db");

        when(cryptoService.decrypt("encrypted")).thenReturn("password");
        when(backupStorageService.resolveJobDirectory(job))
                .thenReturn(Path.of(System.getProperty("java.io.tmpdir")));

        assertDoesNotThrow(() -> service.executeDump(job));
    }
}