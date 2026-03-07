#!/bin/sh
set -eu

umask "${UMASK:-077}"

PUID="${PUID:-99}"
PGID="${PGID:-100}"

mkdir -p /config /app/backups

# Try to align permissions on mounted host paths (Unraid style).
chown -R "${PUID}:${PGID}" /config /app/backups 2>/dev/null || true
chmod -R 700 /config 2>/dev/null || true

# Tighten sqlite file permissions when it exists.
if [ -f /config/copi.db ]; then
  chmod 600 /config/copi.db || true
fi

exec java -jar /app/app.jar