package com.backend.copi.service.dump;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

import com.backend.copi.enums.DbNameOptionsMode;
import com.backend.copi.enums.DumpOptionsMode;
import com.backend.copi.service.utils.DefaultService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import com.backend.copi.config.AppProperties;
import com.backend.copi.entity.BackupJob;
import com.backend.copi.service.BackupStorageService;
import com.backend.copi.service.utils.CryptoService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Slf4j
public class PostgresDumpService extends AbstractDumpService implements DatabaseDumpService {

    private final CryptoService cryptoService;
    private final AppProperties appProperties;
    private final BackupStorageService backupStorageService;
    private final DefaultService defaultService;

    @Override
    // supports: Handles supports in the current backend workflow.
    public boolean supports(String dbType) {
        return "POSTGRESQL".equalsIgnoreCase(dbType);
    }

    @Override
    // executeDump: Executes dump and coordinates the full processing pipeline.
    public String executeDump(BackupJob job) throws Exception {

        if (!canConnect(job.getHost(), job.getPort(), 2000)) {
            log.error("Postgresql connection failed {}:{}", job.getHost(), job.getPort());
            return null;
        }
    	
    	String pgDumpAllPath = appProperties.getPgdumpall().getPath();
    	String pgDumpPath = appProperties.getPgdump().getPath();

        String password =
                cryptoService.decrypt(job.getPasswordEncrypted());

        String filePath = buildFilePath(job);

        boolean dumpAll = (job.getDbName() == null || job.getDbName().trim().isEmpty()) && job.getDbNameOptionsMode().equals(DbNameOptionsMode.ALL);

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
            command.add(job.getDbName());
        }

        // Dynamic options
        if(job.getDumpOptionsMode().equals(DumpOptionsMode.CUSTOM) && job.getDumpOptions() != null && !job.getDumpOptions().isBlank()) {
            command.addAll(parseDumpOptions(defaultService.getDefaultOptions(job.getDbType())));
        } else {
            command.addAll(parseDumpOptions(job.getDumpOptions()));
        }

        ProcessBuilder pb = new ProcessBuilder(command);
        pb.environment().put("PGPASSWORD", password);
        pb.environment().put("PGCONNECT_TIMEOUT", "5");
        return runProcess(pb, filePath, "Postgresql dump", false);
    }

    // buildFilePath: Builds file path from source fields and computed values.
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

    // readStream: Handles read stream in the current backend workflow.
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
