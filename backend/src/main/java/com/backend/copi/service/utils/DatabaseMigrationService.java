package com.backend.copi.service.utils;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;

import org.springframework.context.annotation.Profile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Comparator;

@Service
@RequiredArgsConstructor
@Profile("!test")
public class DatabaseMigrationService {

    private final JdbcTemplate jdbcTemplate;

    @PostConstruct
    @Transactional
    public void migrate() throws Exception {

        createVersionTableIfNotExists();

        int currentVersion = getCurrentVersion();

        Resource[] resources =
                new PathMatchingResourcePatternResolver()
                        .getResources("classpath:db/migrations/V*.sql");

        Arrays.sort(resources, Comparator.comparing(
                r -> extractVersion(r.getFilename())
        ));

        for (Resource resource : resources) {

            String filename = resource.getFilename();
            int version = extractVersion(filename);

            if (version > currentVersion) {

                System.out.println("🔄 Applying migration " + filename);

                String sql = new String(
                        resource.getInputStream().readAllBytes(),
                        StandardCharsets.UTF_8
                );

                for (String statement : sql.split(";")) {
                    if (!statement.trim().isEmpty()) {
                        jdbcTemplate.execute(statement);
                    }
                }

                setVersion(version);

                System.out.println("✅ Migration V" + version + " applied");
            }
        }

        System.out.println("✅ Database schema version: " + getCurrentVersion());
    }

    private void createVersionTableIfNotExists() {

        jdbcTemplate.execute("""
            CREATE TABLE IF NOT EXISTS schema_version (
                version INTEGER NOT NULL
            )
        """);

        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM schema_version",
                Integer.class
        );

        if (count == null || count == 0) {

            jdbcTemplate.update(
                    "INSERT INTO schema_version (version) VALUES (0)"
            );
        }
    }

    private int getCurrentVersion() {

        Integer version = jdbcTemplate.query(
                "SELECT version FROM schema_version LIMIT 1",
                rs -> rs.next() ? rs.getInt(1) : 0
        );

        return version == null ? 0 : version;
    }

    private void setVersion(int version) {

        jdbcTemplate.update(
                "UPDATE schema_version SET version = ?",
                version
        );
    }

    private int extractVersion(String filename) {

        // V12__remove_columns.sql -> 12
        String versionPart = filename.split("__")[0].substring(1);

        return Integer.parseInt(versionPart);
    }
}