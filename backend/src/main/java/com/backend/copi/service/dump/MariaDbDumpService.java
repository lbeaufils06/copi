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
public class MariaDbDumpService implements DatabaseDumpService {

    private final CryptoService cryptoService;
    private final AppProperties appProperties;
    private final BackupStorageService backupStorageService;

    @Override
    public boolean supports(String dbType) {
        return "MARIADB".equalsIgnoreCase(dbType);
    }

    @Override
    public String executeDump(BackupJob job) throws Exception {

        String dumpPath = resolveDumpPath();

        String password = cryptoService.decrypt(job.getPasswordEncrypted());
        String filePath = buildFilePath(job);

        List<String> command = new ArrayList<>();

        command.add(dumpPath);
        command.add("-h");
        command.add(job.getHost());
        command.add("-P");
        command.add(job.getPort().toString());
        command.add("-u");
        command.add(job.getUsername());

        // Options dynamiques venant du job
        command.addAll(parseDumpOptions(job.getDumpOptions()));

        // Base ciblée
        if (job.getDbName() == null || job.getDbName().trim().isEmpty()) {
            command.add("--all-databases");
        } else {
            command.add(job.getDbName());
        }

        File file = new File(filePath);
        file.getParentFile().mkdirs();

        ProcessBuilder pb = new ProcessBuilder(command);
        pb.environment().put("MYSQL_PWD", password); // sécurisé
        pb.redirectOutput(file);
        pb.redirectErrorStream(false);

        Process process = pb.start();

        boolean finished = process.waitFor(15, TimeUnit.MINUTES);

        if (!finished) {
            process.destroyForcibly();
            file.delete();
            throw new RuntimeException("MariaDB dump timeout");
        }

        String stderr = new String(process.getErrorStream().readAllBytes());

        int exitCode = process.waitFor();

        if (exitCode != 0 || !file.exists() || file.length() == 0) {
            file.delete();
            log.error("mariadb-dump command: {}", String.join(" ", command));
            log.error("mariadb-dump stderr: {}", stderr);
            log.error("mariadb-dump exitCode: {}", exitCode);
            throw new RuntimeException("MariaDB dump failed (exitCode=" + exitCode + ")");
        }

        //log.info("MariaDB dump successful for job {}", job.getName());
        return filePath;
    }

    private String resolveDumpPath() {
        if (appProperties.getMariadump() != null &&
                appProperties.getMariadump().getPath() != null &&
                !appProperties.getMariadump().getPath().isBlank()) {
            return appProperties.getMariadump().getPath();
        }

        // fallback universel
        return "mariadb-dump";
    }

    private String buildFilePath(BackupJob job) throws IOException {
        Path jobDirectory = backupStorageService.resolveJobDirectory(job);

        String timestamp = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));

        return jobDirectory.toString() + "/" +
                job.getName() + "_" + timestamp + ".sql";
    }
}