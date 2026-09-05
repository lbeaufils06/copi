#!/bin/sh
set -eu

umask "${UMASK:-077}"

PUID="${PUID:-99}"
PGID="${PGID:-100}"
BACKUP_DIR="${APP_BACKUP_DIR:-/app/backups}"

case "${PUID}" in
  ''|*[!0-9]*) echo "PUID must be a numeric user id" >&2; exit 1 ;;
esac

case "${PGID}" in
  ''|*[!0-9]*) echo "PGID must be a numeric group id" >&2; exit 1 ;;
esac

mkdir -p /config "${BACKUP_DIR}"

# Keep config private.
chown -R "${PUID}:${PGID}" /config 2>/dev/null || true
chmod -R 700 /config 2>/dev/null || true

# Keep backups private and writable by the configured uid/gid.
chown -R "${PUID}:${PGID}" "${BACKUP_DIR}" 2>/dev/null || true
chmod -R 700 "${BACKUP_DIR}" 2>/dev/null || true

# Tighten sqlite file permissions when it exists.
if [ -f /config/copi.db ]; then
  chmod 600 /config/copi.db || true
fi

exec gosu "${PUID}:${PGID}" java -jar /app/app.jar
