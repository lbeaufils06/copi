# Copi

Copi is a self-hosted web application to schedule, run, and monitor database backups.

This product is built for people running personal infrastructure (NAS, homelab, mini-PC, VPS, local server) who want reliable database backups without maintaining many manual scripts.

It was also created from a real need on my own server: centralizing and automating backups for multiple database engines through a simple interface.

## Who Copi Is For

- NAS users (Synology, QNAP, Unraid, TrueNAS, etc.)
- Homelab/self-hosted admins
- Freelancers, small teams, or developers hosting their own services
- Anyone who wants a clear UI to manage DB backups

## Features

- Backup job management (create, edit, delete)
- Manual or scheduled runs (cron)
- Execution history
- Dump compression (`NONE`, `GZIP`, `ZIP`)
- Retention policies (`NONE`, `COUNT`, `DAYS`)
- MySQL, MariaDB, PostgreSQL, MongoDB support
- Session-based authentication (`admin` account)

## Tech Stack

- Backend: Java 21, Spring Boot, Spring Security, JPA, SQLite
- Frontend: React, Vite, Tailwind CSS
- Dump tools: `mysqldump`, `mariadb-dump`, `pg_dump`, `pg_dumpall`, `mongodump`

## Project Structure

```text
copi/
|- backend/         # Spring Boot API + business logic + migrations
|- frontend/        # React UI
|- Dockerfile
|- docker-compose.yml
`- .bash/build.sh   # Build frontend -> copy static -> package backend
```

## Prerequisites

### Option 1 - Docker (recommended)

- Docker
- Docker Compose

### Option 2 - Local Development

- Java 21
- Maven 3.9+
- Node.js 20+ and npm
- Dump tools installed locally and available in `PATH`

## Quick Start (Docker)

From the project root:

```bash
docker compose up -d --build
```

Application URL:

- [http://localhost:8092](http://localhost:8092)

Default credentials:

- username: `admin`
- password: `copi` (via `COPI_ADMIN_PASSWORD` in `docker-compose.yml`)

Stop:

```bash
docker compose down
```

## Local Development

### 1) Backend

From `backend/`:

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

On Windows PowerShell:

```powershell
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=dev"
```

Backend runs by default at `http://localhost:8080`.

### 2) Frontend

From `frontend/`:

```bash
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.
Vite proxy forwards `/api` to `http://localhost:8080`.

## Production Build

### Full build via bash script

The `.bash/build.sh` script:

1. Builds frontend (`npm run build`)
2. Copies `frontend/dist` into `backend/src/main/resources/static`
3. Packages backend (`mvn clean package -DskipTests`)

Command:

```bash
bash .bash/build.sh
```

### Manual build

```bash
# frontend
cd frontend
npm install
npm run build

# copy dist/* to backend/src/main/resources/static

# backend
cd ../backend
./mvnw clean package -DskipTests
```

## Configuration (Environment Variables)

Main variables:

- `SPRING_PROFILES_ACTIVE` (`dev` or `prod`)
- `COPI_ADMIN_PASSWORD` (admin password)
- `MASTER_KEY` (internal encryption key)
- `SERVER_PORT` (backend port, default `8080`)
- `SESSION_TIMEOUT` (minutes, default `30`)
- `SPRING_DATASOURCE_URL` (default `jdbc:sqlite:data/copi.db`)
- `APP_BACKUP_DIR` (default `backups`)
- `MYSQLDUMP_PATH`, `MARIADUMP_PATH`, `PGDUMP_PATH`, `PGDUMPALL_PATH`, `MONGODUMP_PATH`

In Docker, these variables are preconfigured in `docker-compose.yml`.

## Main API Endpoints

- `POST /api/login`: login
- `POST /api/logout`: logout
- `GET /api/auth/check`: session check
- `GET /api/session/config`: session timeout config
- `GET /api/jobs`: list jobs
- `POST /api/jobs`: create job
- `PUT /api/jobs/{id}`: update job
- `DELETE /api/jobs/{id}`: delete job
- `POST /api/jobs/{id}/start`: manual run
- `GET /api/executions`: global execution history
- `GET /api/executions/{jobId}`: job execution history

## Persistent Data

- SQLite app metadata:
  - local: `backend/data/copi.db`
  - docker: `copi_data` volume
- Backup files:
  - local: `backend/backups/`
  - docker: `copi_backups` volume

## Production Best Practices

- At minimum, change:
  - `COPI_ADMIN_PASSWORD`
  - `MASTER_KEY`
- Protect network access (VPN, reverse proxy, firewall)
- Regularly test backup restoration
- On NAS setups, mount dedicated persistent storage for backup files
