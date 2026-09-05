package com.backend.copi.service.dump;

import com.backend.copi.entity.BackupJob;
import com.backend.copi.enums.DumpOptionsMode;

import java.util.Arrays;
import java.util.List;
import java.util.Locale;

public interface DatabaseDumpService {

    boolean supports(String dbType);

    String executeDump(BackupJob job) throws Exception;

    default List<String> resolveDumpOptions(BackupJob job, String defaultOptions) {
        String options = job.getDumpOptionsMode() == DumpOptionsMode.CUSTOM
                ? job.getDumpOptions()
                : defaultOptions;

        return parseDumpOptions(options);
    }

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

            if (changesOutputDestination(opt)) {
                throw new IllegalArgumentException(
                        "Dump options cannot change the output destination: " + opt
                );
            }
        }

        return parsed;
    }

    private boolean changesOutputDestination(String option) {
        String longOption = option.toLowerCase(Locale.ROOT);

        return matchesLongOption(longOption, "--file")
                || matchesLongOption(longOption, "--result-file")
                || matchesLongOption(longOption, "--tab")
                || matchesLongOption(longOption, "--out")
                || matchesLongOption(longOption, "--archive")
                || matchesLongOption(longOption, "--logpath")
                || matchesShortOption(option, "-f")
                || matchesShortOption(option, "-r")
                || matchesShortOption(option, "-T")
                || matchesShortOption(option, "-o");
    }

    private boolean matchesLongOption(String option, String forbiddenOption) {
        return option.equals(forbiddenOption) || option.startsWith(forbiddenOption + "=");
    }

    private boolean matchesShortOption(String option, String forbiddenOption) {
        return option.equals(forbiddenOption)
                || option.startsWith(forbiddenOption + "=")
                || (option.startsWith(forbiddenOption) && option.length() > forbiddenOption.length());
    }
}
