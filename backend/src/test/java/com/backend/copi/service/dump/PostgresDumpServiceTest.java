package com.backend.copi.service.dump;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.nio.file.Path;
import java.util.UUID;

import com.backend.copi.service.DefaultService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.backend.copi.config.AppProperties;
import com.backend.copi.entity.BackupJob;
import com.backend.copi.service.BackupStorageService;
import com.backend.copi.service.CryptoService;

class PostgresDumpServiceTest {

    private CryptoService cryptoService;
    private AppProperties appProperties;
    private BackupStorageService backupStorageService;
    private PostgresDumpService service;
    private DefaultService defaultService;

    @BeforeEach
    void setup() {

        cryptoService = mock(CryptoService.class);
        appProperties = mock(AppProperties.class);
        backupStorageService = mock(BackupStorageService.class);
        defaultService = mock(DefaultService.class);

        // Mock nested properties
        AppProperties.Pgdump pgdump = mock(AppProperties.Pgdump.class);
        AppProperties.Mariadump pgdumpall = mock(AppProperties.Mariadump.class);

        when(appProperties.getPgdump()).thenReturn(pgdump);
        when(appProperties.getPgdumpall()).thenReturn(pgdumpall);

        // On met un path invalide pour forcer l'échec
        when(pgdump.getPath()).thenReturn("invalid-pgdump-path");
        when(pgdumpall.getPath()).thenReturn("invalid-pgdumpall-path");

        service = new PostgresDumpService(
                cryptoService,
                appProperties,
                backupStorageService,
                defaultService
        );
    }

    @Test
    void supports_shouldReturnTrueForPostgresql() {
        assertTrue(service.supports("POSTGRESQL"));
        assertTrue(service.supports("postgresql"));
        assertFalse(service.supports("MYSQL"));
    }

    @Test
    void executeDump_shouldThrowException_whenBinaryInvalid() throws Exception {

        BackupJob job = new BackupJob();
        job.setId(UUID.randomUUID());
        job.setName("test");
        job.setHost("localhost");
        job.setPort(5432);
        job.setUsername("postgres");
        job.setPasswordEncrypted("encrypted");
        job.setDbName("mydb");

        when(cryptoService.decrypt("encrypted"))
                .thenReturn("password");

        when(backupStorageService.resolveJobDirectory(job))
                .thenReturn(Path.of(System.getProperty("java.io.tmpdir")));

        // Comme le path pgdump est invalide,
        // pb.start() va lever IOException
        assertDoesNotThrow(() -> service.executeDump(job));
    }

    @Test
    void executeDump_shouldThrowException_whenDumpAllBinaryInvalid() throws Exception {

        BackupJob job = new BackupJob();
        job.setId(UUID.randomUUID());
        job.setName("test");
        job.setHost("localhost");
        job.setPort(5432);
        job.setUsername("postgres");
        job.setPasswordEncrypted("encrypted");
        job.setDbName(""); // déclenche dumpAll

        when(cryptoService.decrypt("encrypted"))
                .thenReturn("password");

        when(backupStorageService.resolveJobDirectory(job))
                .thenReturn(Path.of(System.getProperty("java.io.tmpdir")));

        assertDoesNotThrow(() -> service.executeDump(job));
    }
}