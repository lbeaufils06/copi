# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project follows Semantic Versioning.

## [Unreleased]

## [1.0.0] - 2026-03-08
### Added
- Initial public release of Copi.
- Web UI to manage backup jobs.
- Manual and scheduled backup execution.
- Execution history view.
- Compression support (`NONE`, `GZIP`, `ZIP`).
- Retention policies (`NONE`, `COUNT`, `DAYS`).
- Support for MySQL, MariaDB, PostgreSQL, and MongoDB backups.
- Session-based authentication for admin access.
- Docker deployment with persistent SQLite data and backup storage.

### Security
- Configurable admin password (`COPI_ADMIN_PASSWORD`).
- Configurable application secret (`MASTER_KEY`).
