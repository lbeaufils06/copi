# Release Notes Template - v1.0.0

## Copi v1.0.0

First public release of Copi.

## Highlights
- Manage backup jobs from a web UI.
- Run jobs manually or on schedule.
- Track execution history.
- Configure compression and retention.
- Backup support for MySQL, MariaDB, PostgreSQL, and MongoDB.

## Deployment
- Docker and Docker Compose supported.
- SQLite persisted from host path `./backend/config`.
- Backup files persisted in Docker volume `copi_backups`.

## Breaking changes
- None.

## Known limitations
- Ensure dump tools are available in container/local environment.
- Update `COPI_ADMIN_PASSWORD` and `MASTER_KEY` before production use.

## Upgrade notes
1. Pull latest code.
2. Review `.env.example` and your runtime variables.
3. Restart with `docker compose up -d --build`.

## Checks performed before release
- Backend build passes.
- Frontend build passes.
- Docker compose starts successfully.
