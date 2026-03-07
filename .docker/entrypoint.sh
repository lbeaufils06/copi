#!/bin/sh
set -eu

umask "${UMASK:-077}"

PUID="${PUID:-99}"
PGID="${PGID:-100}"

mkdir -p /config /app/backups

# Keep config private.
chown -R "${PUID}:${PGID}" /config 2>/dev/null || true
chmod -R 700 /config 2>/dev/null || true

# Keep backups writable from outside.
chown -R "${PUID}:${PGID}" /app/backups 2>/dev/null || true
chmod -R 777 /app/backups 2>/dev/null || true

# Tighten sqlite file permissions when it exists.
if [ -f /config/copi.db ]; then
  chmod 600 /config/copi.db || true
fi

exec java -jar /app/app.jar