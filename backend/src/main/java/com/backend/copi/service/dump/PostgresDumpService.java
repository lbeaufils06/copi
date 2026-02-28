package com.backend.copi.service.dump;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.TimeUnit;

import org.springframework.stereotype.Service;

import com.backend.copi.config.AppProperties;
import com.backend.copi.entity.BackupJob;
import com.backend.copi.service.BackupStorageService;
import com.backend.copi.service.CryptoService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PostgresDumpService implements DatabaseDumpService {

    private final CryptoService cryptoService;
    private final AppProperties appProperties;
    private final BackupStorageService backupStorageService;

    @Override
    public boolean supports(String dbType) {
        return "POSTGRESQL".equalsIgnoreCase(dbType);
    }

    @Override
    public String executeDump(BackupJob job) throws Exception {
    	
    	String pgDumpAllPath = appProperties.getPgdumpall().getPath();
    	String pgDumpPath = appProperties.getPgdump().getPath();

        String password =
                cryptoService.decrypt(job.getPasswordEncrypted());

        String filePath = buildFilePath(job);

        boolean dumpAll =
                job.getDbName() == null ||
                job.getDbName().trim().isEmpty();

        List<String> command = new ArrayList<>();

        if (dumpAll) {

            command.add(pgDumpAllPath);
            command.add("-h");
            command.add(job.getHost());
            command.add("-p");
            command.add(job.getPort().toString());
            command.add("-U");
            command.add(job.getUsername());
            command.add("-f");
            command.add(filePath);

        } else {

            command.add(pgDumpPath);
            command.add("-h");
            command.add(job.getHost());
            command.add("-p");
            command.add(job.getPort().toString());
            command.add("-U");
            command.add(job.getUsername());
            command.add("-F");
            command.add("c");
            command.add("-f");
            command.add(filePath);

            // 🔹 Injection des dumpOptions ici
            if (job.getDumpOptions() != null &&
                    !job.getDumpOptions().isBlank()) {

                command.addAll(
                        Arrays.asList(
                                job.getDumpOptions().trim().split("\\s+")
                        )
                );
            }

            command.add(job.getDbName());
        }

        ProcessBuilder pb = new ProcessBuilder(command);

        pb.environment().put("PGPASSWORD", password);

        Process process = pb.start();

        boolean finished =
                process.waitFor(5, TimeUnit.MINUTES);

        if (!finished) {
            process.destroy();
            throw new RuntimeException("Postgresql dump timeout");
        }

        int exitCode = process.exitValue();

        if (exitCode != 0) {
            String error = readStream(process);
            throw new RuntimeException(
                    "Postgresql dump failed: " + error);
        }

        return filePath;
    }

    private String buildFilePath(BackupJob job) throws IOException {
    	
    	Path jobDirectory = backupStorageService.resolveJobDirectory(job);

        String timestamp =
                LocalDateTime.now()
                        .format(DateTimeFormatter
                                .ofPattern("yyyyMMdd_HHmmss"));

        return jobDirectory.toString() + 
        		"/"
                + job.getName()
                + "_"
                + timestamp
                + ".dump";
    }

    private String readStream(Process process) throws Exception {

        BufferedReader reader =
                new BufferedReader(
                        new InputStreamReader(
                                process.getErrorStream()));

        StringBuilder sb = new StringBuilder();
        String line;

        while ((line = reader.readLine()) != null) {
            sb.append(line).append("\n");
        }

        return sb.toString();
    }
}
