package com.backend.copi.service.dump;

import com.backend.copi.entity.BackupJob;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DumpService {

    private final List<DatabaseDumpService> strategies;

    // executeJob: Executes job and coordinates the full processing pipeline.
    public String executeJob(BackupJob job) throws Exception {

        return strategies.stream()
                .filter(strategy ->
                        strategy.supports(job.getDbType().name()))
                .findFirst()
                .orElseThrow(() ->
                        new RuntimeException("Unsupported DB type"))
                .executeDump(job);
    }
}
