package com.backend.copi.service.dump;

import com.backend.copi.entity.BackupJob;

import java.util.Arrays;
import java.util.List;

public interface DatabaseDumpService {

    boolean supports(String dbType);

    String executeDump(BackupJob job) throws Exception;

    default List<String> parseDumpOptions(String options) {
        if (options == null || options.isBlank()) {
            return List.of();
        }
        return Arrays.asList(options.trim().split("\\s+"));
    }
}
