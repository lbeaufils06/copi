package com.backend.copi.service.dump;

import java.io.File;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.backend.copi.entity.BackupJob;
import com.backend.copi.service.CryptoService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MySqlDumpService implements DatabaseDumpService {

    private final CryptoService cryptoService;

    @Value("${app.mysqldump.path:mysqldump}")
    private String mysqldumpPath;

    @Override
    public boolean supports(String dbType) {
        return "MYSQL".equalsIgnoreCase(dbType);
    }

    @Override
    public String executeDump(BackupJob job) throws Exception {

        String password = cryptoService.decrypt(job.getPasswordEncrypted());
        String filePath = buildFilePath(job);

        List<String> command = new ArrayList<>();

        command.add(mysqldumpPath);
        command.add("-h");
        command.add(job.getHost());
        command.add("-P");
        command.add(job.getPort().toString());
        command.add("-u");
        command.add(job.getUsername());

        command.add("--single-transaction");
        command.add("--routines");
        command.add("--events");
        command.add("--triggers");
        command.add("--no-tablespaces");
        command.add("--set-gtid-purged=OFF");

        if (job.getDbName() == null || job.getDbName().trim().isEmpty()) {
            command.add("--all-databases");
        } else {
            command.add(job.getDbName());
        }

        File file = new File(filePath);
        file.getParentFile().mkdirs();

        ProcessBuilder pb = new ProcessBuilder(command);
        pb.environment().put("MYSQL_PWD", password);
        pb.redirectOutput(file);
        pb.redirectErrorStream(true);

        Process process = pb.start();

        boolean finished = process.waitFor(15, TimeUnit.MINUTES);

        if (!finished) {
            process.destroyForcibly();
            file.delete();
            throw new RuntimeException("MySQL dump timeout");
        }

        int exitCode = process.exitValue();

        if (exitCode != 0 || !file.exists() || file.length() == 0) {
            file.delete();
            throw new RuntimeException("MySQL dump failed (exitCode=" + exitCode + ")");
        }

        return filePath;
    }

    private String buildFilePath(BackupJob job) {
        String timestamp = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        return "backups/" + job.getName() + "_" + timestamp + ".sql";
    }
}
