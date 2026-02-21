package com.backend.copi.service.dump;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.backend.copi.config.AppProperties;
import com.backend.copi.entity.BackupJob;
import com.backend.copi.service.CryptoService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PostgresDumpService implements DatabaseDumpService {

    private final CryptoService cryptoService;
    private final AppProperties appProperties;

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

        ProcessBuilder pb;

        if (dumpAll) {

            pb = new ProcessBuilder(
                    pgDumpAllPath,
                    "-h", job.getHost(),
                    "-p", job.getPort().toString(),
                    "-U", job.getUsername(),
                    "-f", filePath
            );

        } else {

            pb = new ProcessBuilder(
                    pgDumpPath,
                    "-h", job.getHost(),
                    "-p", job.getPort().toString(),
                    "-U", job.getUsername(),
                    "-F", "c",              // format custom
                    "-f", filePath,
                    job.getDbName()
            );
        }

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

    private String buildFilePath(BackupJob job) {
    	
    	String backupPath = appProperties.getBackup().getDirectory();

        String timestamp =
                LocalDateTime.now()
                        .format(DateTimeFormatter
                                .ofPattern("yyyyMMdd_HHmmss"));

        return backupPath + 
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
