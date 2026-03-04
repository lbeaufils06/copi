package com.backend.copi.service.dump;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

import org.springframework.stereotype.Service;

import com.backend.copi.config.AppProperties;
import com.backend.copi.entity.BackupJob;
import com.backend.copi.service.BackupStorageService;
import com.backend.copi.service.CryptoService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class MongoDbDumpService extends AbstractDumpService implements DatabaseDumpService {

    private final CryptoService cryptoService;
    private final AppProperties appProperties;
    private final BackupStorageService backupStorageService;

    @Override
    public boolean supports(String dbType) {
        return "MONGODB".equalsIgnoreCase(dbType);
    }

    @Override
    public String executeDump(BackupJob job) throws Exception {

        if (!canConnect(job.getHost(), job.getPort(), 1000)) {
            log.error("MongoDB connection failed {}:{}", job.getHost(), job.getPort());
            return null;
        }

        String mongodumpPath = appProperties.getMongodump().getPath();

        String password = cryptoService.decrypt(job.getPasswordEncrypted());
        String filePath = buildFilePath(job);

        List<String> command = new ArrayList<>();

        command.add(mongodumpPath);
        command.add("--host");
        command.add(job.getHost());
        command.add("--port");
        command.add(job.getPort().toString());
        command.add("--username");
        command.add(job.getUsername());
        command.add("--password");
        command.add(password);
        command.add("--authenticationDatabase");
        command.add(
                job.getAuthenticationDatabase() != null
                        ? job.getAuthenticationDatabase()
                        : "admin"
        );

        // 🔹 Options custom éventuelles
        command.addAll(parseDumpOptions(job.getDumpOptions()));

        // 🔹 Base ciblée
        if (job.getDbName() != null && !job.getDbName().trim().isEmpty()) {
            command.add("--db");
            command.add(job.getDbName());
        }

        // 🔹 Archive unique + compression
        command.add("--archive=" + filePath);

        ProcessBuilder pb = new ProcessBuilder(command);

        return runProcess(pb, filePath, "MongoDB dump", false);
    }

    private String buildFilePath(BackupJob job) throws IOException {
        Path jobDirectory = backupStorageService.resolveJobDirectory(job);

        String timestamp = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));

        return jobDirectory.toString() + "/"
                + job.getName() + "_"
                + timestamp
                + ".archive";
    }
}