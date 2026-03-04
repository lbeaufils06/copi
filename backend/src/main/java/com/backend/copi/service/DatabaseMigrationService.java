package com.backend.copi.service;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;

import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Profile("!test")
public class DatabaseMigrationService {

    private final JdbcTemplate jdbcTemplate;

    @PostConstruct
    @Transactional
    public void migrate() {

        createVersionTableIfNotExists();

        int currentVersion = getCurrentVersion();

        if (currentVersion < 1) {
            migrateV1();
            setVersion(1);
            currentVersion = 1;
        }

        if (currentVersion < 2) {
            migrateV2();
            setVersion(2);
        }

        if (currentVersion < 3) {
            migrateV3();
            setVersion(3);
        }

        if (currentVersion < 4) {
            migrateV4();
            setVersion(4);
        }

        if (currentVersion < 5) {
            migrateV5();
            setVersion(5);
        }

        if (currentVersion < 6) {
            migrateV6();
            setVersion(6);
        }

        if (currentVersion < 7) {
            migrateV7();
            setVersion(7);
        }

        if (currentVersion < 9) {
            migrateV9();
            setVersion(9);
        }

        if (currentVersion < 10) {
            migrateV10();
            setVersion(10);
        }

        System.out.println("✅ Database schema version: " + getCurrentVersion());
    }

    /**
     * Crée la table schema_version si elle n'existe pas.
     * Si c'est une base déjà existante, on détecte son état réel.
     */
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

            int detectedVersion = detectExistingSchemaVersion();

            jdbcTemplate.update(
                    "INSERT INTO schema_version (version) VALUES (?)",
                    detectedVersion
            );

            System.out.println("✅ Schema initialized at version " + detectedVersion);
        }
    }

    /**
     * Détection intelligente si la base existe déjà
     */
    private int detectExistingSchemaVersion() {

        boolean backupJobExists = tableExists("backup_job");

        if (!backupJobExists) {
            return 0; // Nouvelle installation
        }

        // Si execution_mode existe déjà → V2
        if (columnExists("backup_job", "execution_mode")) {
            return 2;
        }

        // Sinon on considère que c'est V1
        return 1;
    }

    private int getCurrentVersion() {
        Integer version = jdbcTemplate.queryForObject(
                "SELECT version FROM schema_version LIMIT 1",
                Integer.class
        );
        return version == null ? 0 : version;
    }

    private void setVersion(int version) {
        jdbcTemplate.update("UPDATE schema_version SET version = ?", version);
    }

    private boolean tableExists(String table) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name=?",
                Integer.class,
                table
        );
        return count != null && count > 0;
    }

    private boolean columnExists(String table, String column) {

        String sql = "PRAGMA table_info(" + table + ")";

        return jdbcTemplate.query(sql, rs -> {
            while (rs.next()) {
                if (column.equalsIgnoreCase(rs.getString("name"))) {
                    return true;
                }
            }
            return false;
        });
    }

    /**
     * V1 = création du schéma initial
     */
    private void migrateV1() {

        jdbcTemplate.execute("""
            CREATE TABLE IF NOT EXISTS backup_job (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                db_type TEXT NOT NULL,
                host TEXT NOT NULL,
                port INTEGER NOT NULL,
                db_name TEXT,
                username TEXT NOT NULL,
                password_encrypted TEXT NOT NULL,
                enabled INTEGER NOT NULL DEFAULT 1,
                cron_expression TEXT NOT NULL,
                cron_purge_expression TEXT,
                next_execution_time DATETIME,
                next_purge_time DATETIME,
                retention_count INTEGER,
                retention_policy TEXT,
                last_success_time DATETIME,
                version_count INTEGER NOT NULL DEFAULT 0,
                last_status TEXT,
                last_status_message TEXT,
                compression_type TEXT
            )
        """);

        jdbcTemplate.execute("""
            CREATE TABLE IF NOT EXISTS backup_execution (
                id TEXT PRIMARY KEY,
                job_id TEXT NOT NULL,
                start_time DATETIME,
                end_time DATETIME,
                duration_in_seconds INTEGER,
                status TEXT,
                log_message TEXT,
                file_path TEXT,
                file_name TEXT,
                FOREIGN KEY (job_id)
                    REFERENCES backup_job(id)
                    ON DELETE CASCADE
            )
        """);

        jdbcTemplate.execute("""
            CREATE INDEX IF NOT EXISTS idx_backup_job_enabled
            ON backup_job(enabled)
        """);

        jdbcTemplate.execute("""
            CREATE INDEX IF NOT EXISTS idx_backup_job_next_execution
            ON backup_job(next_execution_time)
        """);

        jdbcTemplate.execute("""
            CREATE INDEX IF NOT EXISTS idx_backup_execution_job
            ON backup_execution(job_id)
        """);

        jdbcTemplate.execute("""
            CREATE INDEX IF NOT EXISTS idx_backup_execution_status
            ON backup_execution(status)
        """);

        System.out.println("✅ Migration V1 applied");
    }

    /**
     * V2 = ajout execution_mode
     */
    private void migrateV2() {

        if (!columnExists("backup_job", "execution_mode")) {
            jdbcTemplate.execute("""
                ALTER TABLE backup_job
                ADD COLUMN execution_mode TEXT NOT NULL DEFAULT 'SCHEDULED'
            """);

            System.out.println("✅ Migration V2 applied (execution_mode added)");
        }
    }

    private void migrateV3() {

        if (!columnExists("backup_job", "execution_mode")) {
            jdbcTemplate.execute("""
                PRAGMA foreign_keys=off;

				BEGIN TRANSACTION;
				
				-- 1️⃣ Renommer l'ancienne table
				ALTER TABLE backup_job RENAME TO backup_job_old;
				
				-- 2️⃣ Recréer la table avec cron_expression NULLABLE
				CREATE TABLE backup_job (
				    id INTEGER PRIMARY KEY,
				    name TEXT NOT NULL,
				    db_type TEXT NOT NULL,
				    host TEXT NOT NULL,
				    port INTEGER NOT NULL,
				    db_name TEXT,
				    username TEXT NOT NULL,
				    password_encrypted TEXT NOT NULL,
				    execution_mode TEXT NOT NULL,
				    cron_expression TEXT, -- ✅ nullable maintenant
				    retention_policy TEXT,
				    cron_purge_expression TEXT,
				    retention_count INTEGER,
				    enabled INTEGER NOT NULL,
				    compression_type TEXT
				);
				
				-- 3️⃣ Copier les données
				INSERT INTO backup_job (
				    id,
				    name,
				    db_type,
				    host,
				    port,
				    db_name,
				    username,
				    password_encrypted,
				    execution_mode,
				    cron_expression,
				    retention_policy,
				    cron_purge_expression,
				    retention_count,
				    enabled,
				    compression_type
				)
				SELECT
				    id,
				    name,
				    db_type,
				    host,
				    port,
				    db_name,
				    username,
				    password_encrypted,
				    execution_mode,
				    cron_expression,
				    retention_policy,
				    cron_purge_expression,
				    retention_count,
				    enabled,
				    compression_type
				FROM backup_job_old;
				
				-- 4️⃣ Supprimer l’ancienne table
				DROP TABLE backup_job_old;
				
				COMMIT;
				
				PRAGMA foreign_keys=on;
            """);

            System.out.println("✅ Migration V3 applied (schema rebuilt)");
        }
    }

    private void migrateV4() {

        if (!columnExists("backup_job", "dump_options")) {

            jdbcTemplate.execute("""
                ALTER TABLE backup_job
                ADD COLUMN dump_options TEXT
            """);

            System.out.println("✅ Migration V4 applied (dump_options added)");
        }
    }

    private void migrateV5() {

        System.out.println("🔄 Applying Migration V5 (remove old CHECK constraint on db_type)");

        jdbcTemplate.execute("""
        PRAGMA foreign_keys=off;

        BEGIN TRANSACTION;

        ALTER TABLE backup_job RENAME TO backup_job_old;

        CREATE TABLE backup_job (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            db_type TEXT NOT NULL,
            host TEXT NOT NULL,
            port INTEGER NOT NULL,
            db_name TEXT,
            username TEXT NOT NULL,
            password_encrypted TEXT NOT NULL,
            execution_mode TEXT NOT NULL,
            cron_expression TEXT,
            retention_policy TEXT,
            cron_purge_expression TEXT,
            retention_count INTEGER,
            enabled INTEGER NOT NULL,
            compression_type TEXT,
            dump_options TEXT
        );

        INSERT INTO backup_job (
            id,
            name,
            db_type,
            host,
            port,
            db_name,
            username,
            password_encrypted,
            execution_mode,
            cron_expression,
            retention_policy,
            cron_purge_expression,
            retention_count,
            enabled,
            compression_type,
            dump_options
        )
        SELECT
            id,
            name,
            db_type,
            host,
            port,
            db_name,
            username,
            password_encrypted,
            execution_mode,
            cron_expression,
            retention_policy,
            cron_purge_expression,
            retention_count,
            enabled,
            compression_type,
            dump_options
        FROM backup_job_old;

        DROP TABLE backup_job_old;

        COMMIT;

        PRAGMA foreign_keys=on;
    """);

        System.out.println("✅ Migration V5 applied (db_type constraint removed)");
    }

    private void migrateV6() {

        System.out.println("🔄 Applying Migration V6 (remove CHECK and normalize db_type)");

        jdbcTemplate.execute("""
        PRAGMA foreign_keys=off;

        BEGIN TRANSACTION;

        ALTER TABLE backup_job RENAME TO backup_job_old;

        CREATE TABLE backup_job (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            db_type TEXT NOT NULL,
            host TEXT NOT NULL,
            port INTEGER NOT NULL,
            db_name TEXT,
            username TEXT NOT NULL,
            password_encrypted TEXT NOT NULL,
            execution_mode TEXT NOT NULL,
            cron_expression TEXT,
            retention_policy TEXT,
            cron_purge_expression TEXT,
            retention_count INTEGER,
            enabled INTEGER NOT NULL,
            compression_type TEXT,
            dump_options TEXT
        );

        INSERT INTO backup_job (
            id,
            name,
            db_type,
            host,
            port,
            db_name,
            username,
            password_encrypted,
            execution_mode,
            cron_expression,
            retention_policy,
            cron_purge_expression,
            retention_count,
            enabled,
            compression_type,
            dump_options
        )
        SELECT
            id,
            name,
            CASE db_type
                WHEN '0' THEN 'MYSQL'
                WHEN '1' THEN 'POSTGRESQL'
                WHEN '2' THEN 'MARIADB'
                ELSE db_type
            END,
            host,
            port,
            db_name,
            username,
            password_encrypted,
            execution_mode,
            cron_expression,
            retention_policy,
            cron_purge_expression,
            retention_count,
            enabled,
            compression_type,
            dump_options
        FROM backup_job_old;

        DROP TABLE backup_job_old;

        COMMIT;

        PRAGMA foreign_keys=on;
    """);

        System.out.println("✅ Migration V6 applied successfully");
    }

    private void migrateV7() {

        System.out.println("🔄 Applying Migration V7 (final db_type cleanup)");

        jdbcTemplate.execute("""
        PRAGMA foreign_keys=off;
        BEGIN TRANSACTION;

        ALTER TABLE backup_job RENAME TO backup_job_old;

        CREATE TABLE backup_job (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            db_type TEXT NOT NULL,
            host TEXT NOT NULL,
            port INTEGER NOT NULL,
            db_name TEXT,
            username TEXT NOT NULL,
            password_encrypted TEXT NOT NULL,
            execution_mode TEXT NOT NULL,
            cron_expression TEXT,
            retention_policy TEXT,
            cron_purge_expression TEXT,
            retention_count INTEGER,
            enabled INTEGER NOT NULL,
            compression_type TEXT,
            dump_options TEXT
        );

        INSERT INTO backup_job (
            id,
            name,
            db_type,
            host,
            port,
            db_name,
            username,
            password_encrypted,
            execution_mode,
            cron_expression,
            retention_policy,
            cron_purge_expression,
            retention_count,
            enabled,
            compression_type,
            dump_options
        )
        SELECT
            id,
            name,
            CASE db_type
                WHEN '0' THEN 'MYSQL'
                WHEN '1' THEN 'POSTGRESQL'
                WHEN '2' THEN 'MARIADB'
                ELSE db_type
            END,
            host,
            port,
            db_name,
            username,
            password_encrypted,
            execution_mode,
            cron_expression,
            retention_policy,
            cron_purge_expression,
            retention_count,
            enabled,
            compression_type,
            dump_options
        FROM backup_job_old;

        DROP TABLE backup_job_old;

        COMMIT;
        PRAGMA foreign_keys=on;
    """);

        System.out.println("✅ Migration V7 applied successfully");
    }

    private void migrateV9() {

        System.out.println("🔄 Applying Migration V8 (add authentication_database nullable)");

        if (!columnExists("backup_job", "authentication_database")) {

            jdbcTemplate.execute("""
            ALTER TABLE backup_job
            ADD COLUMN authentication_database TEXT
        """);

            System.out.println("✅ Migration V8 applied (authentication_database added as nullable)");
        }
    }

    private void migrateV10() {

        System.out.println("🔄 Applying Migration V10 (add dump/db options mode)");

        if (!columnExists("backup_job", "dump_options_mode")) {
            jdbcTemplate.execute("""
            ALTER TABLE backup_job
            ADD COLUMN dump_options_mode TEXT NOT NULL DEFAULT 'DEFAULT'
        """);
        }

        if (!columnExists("backup_job", "db_name_options_mode")) {
            jdbcTemplate.execute("""
            ALTER TABLE backup_job
            ADD COLUMN db_name_options_mode TEXT NOT NULL DEFAULT 'ALL'
        """);
        }

        System.out.println("✅ Migration V10 applied (options mode added)");
    }

}