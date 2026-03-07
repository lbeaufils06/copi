#!/bin/sh
set -eu

umask "${UMASK:-077}"

mkdir -p /config /app/backups

# Best effort hardening for sqlite file permissions.
if [ -f /config/copi.db ]; then
  chmod 600 /config/copi.db || true
fi

exec java -jar /app/app.jar