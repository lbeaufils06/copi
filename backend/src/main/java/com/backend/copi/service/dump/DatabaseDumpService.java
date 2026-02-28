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

        List<String> parsed = Arrays.asList(options.trim().split("\\s+"));

        for (String opt : parsed) {

            if (!opt.startsWith("-")) {
                throw new IllegalArgumentException(
                        "Invalid dump option format: " + opt
                );
            }

            if (opt.contains(";") ||
                    opt.contains("&&") ||
                    opt.contains("|")) {

                throw new IllegalArgumentException(
                        "Potentially dangerous dump option: " + opt
                );
            }
        }

        return parsed;
    }
}
