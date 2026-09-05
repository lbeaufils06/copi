package com.backend.copi.service.dump;

import com.backend.copi.entity.BackupJob;
import com.backend.copi.enums.DumpOptionsMode;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class DatabaseDumpServiceTest {

    private final DatabaseDumpService service = new DatabaseDumpService() {
        @Override
        public boolean supports(String dbType) {
            return false;
        }

        @Override
        public String executeDump(BackupJob job) {
            return null;
        }
    };

    @Test
    void resolveDumpOptionsUsesDefaultsInDefaultMode() {
        BackupJob job = new BackupJob();
        job.setDumpOptionsMode(DumpOptionsMode.DEFAULT);
        job.setDumpOptions("--custom-option");

        assertEquals(
                List.of("--default-one", "--default-two"),
                service.resolveDumpOptions(job, "--default-one --default-two")
        );
    }

    @Test
    void resolveDumpOptionsUsesJobOptionsInCustomMode() {
        BackupJob job = new BackupJob();
        job.setDumpOptionsMode(DumpOptionsMode.CUSTOM);
        job.setDumpOptions("--custom-one --custom-two=value");

        assertEquals(
                List.of("--custom-one", "--custom-two=value"),
                service.resolveDumpOptions(job, "--default-option")
        );
    }

    @Test
    void resolveDumpOptionsAllowsEmptyCustomOptions() {
        BackupJob job = new BackupJob();
        job.setDumpOptionsMode(DumpOptionsMode.CUSTOM);
        job.setDumpOptions("  ");

        assertEquals(List.of(), service.resolveDumpOptions(job, "--default-option"));
    }

    @Test
    void resolveDumpOptionsUsesDefaultsWhenModeIsMissing() {
        BackupJob job = new BackupJob();
        job.setDumpOptionsMode(null);

        assertEquals(
                List.of("--default-option"),
                service.resolveDumpOptions(job, "--default-option")
        );
    }

    @Test
    void parseDumpOptionsRejectsOutputDestinations() {
        List<String> dangerousOptions = List.of(
                "--file=/tmp/dump",
                "-f/tmp/dump",
                "--result-file=/tmp/dump",
                "-r/tmp/dump",
                "--tab=/tmp/dump",
                "-T/tmp/dump",
                "--out=/tmp/dump",
                "-o/tmp/dump",
                "--archive=/tmp/dump"
        );

        for (String option : dangerousOptions) {
            assertThrows(IllegalArgumentException.class, () -> service.parseDumpOptions(option));
        }
    }

    @Test
    void parseDumpOptionsKeepsCaseSensitiveSafeShortOptions() {
        assertEquals(List.of("-Fc"), service.parseDumpOptions("-Fc"));
    }
}
