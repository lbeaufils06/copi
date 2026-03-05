package com.backend.copi.service.dump;

import java.io.IOException;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

import com.backend.copi.enums.DbNameOptionsMode;
import com.backend.copi.enums.DumpOptionsMode;
import com.backend.copi.service.utils.DefaultService;
import org.springframework.stereotype.Service;

import com.backend.copi.config.AppProperties;
import com.backend.copi.entity.BackupJob;
import com.backend.copi.service.BackupStorageService;
import com.backend.copi.service.utils.CryptoService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class MySqlDumpService extends AbstractDumpService implements DatabaseDumpService {

    private final CryptoService cryptoService;
    private final AppProperties appProperties;
    private final BackupStorageService backupStorageService;
    private final DefaultService defaultService;

    @Override
    public boolean supports(String dbType) {
        return "MYSQL".equalsIgnoreCase(dbType);
    }

    @Override
    public String executeDump(BackupJob job) throws Exception {

        if (!canConnect(job.getHost(), job.getPort(), 2000)) {
            log.error("MySQL connection failed {}:{}", job.getHost(), job.getPort());
            return null;
        }
    	
    	String mysqldumpPath = appProperties.getMysqldump().getPath();

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

        // Options dynamiques
        if(job.getDumpOptionsMode().equals(DumpOptionsMode.CUSTOM) && job.getDumpOptions() != null && !job.getDumpOptions().isBlank()) {
            command.addAll(parseDumpOptions(defaultService.getDefaultOptions(job.getDbType())));
        } else {
            command.addAll(parseDumpOptions(job.getDumpOptions()));
        }

        // 🔹 Base ciblée
        if (job.getDbNameOptionsMode().equals(DbNameOptionsMode.ALL)) {
            command.add("--all-databases");
        } else if(job.getDbName() != null && !job.getDbName().trim().isEmpty()) {
            command.add(job.getDbName());
        }

        ProcessBuilder pb = new ProcessBuilder(command);
        pb.environment().put("MYSQL_PWD", password);

        return runProcess(pb, filePath, "Mysql dump", true);
    }

    private String buildFilePath(BackupJob job) throws IOException {
    	Path jobDirectory = backupStorageService.resolveJobDirectory(job);
        String timestamp = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        return jobDirectory.toString() + "/" + job.getName() + "_" + timestamp + ".sql";
    }

}
