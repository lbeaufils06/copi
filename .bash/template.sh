#!/usr/bin/env bash
set -e

SRC_DIR=".docker/templates"
DEST_DIR="/boot/config/plugins/dockerMan/templates-user"

echo "======================================"
echo " Installing Docker templates (my-*)"
echo "======================================"

# Vérifications
if [ ! -d "$SRC_DIR" ]; then
  echo "❌ Source directory not found: $SRC_DIR"
  exit 1
fi

if [ ! -d "$DEST_DIR" ]; then
  echo "❌ Destination directory not found: $DEST_DIR"
  exit 1
fi

echo "📁 Source      : $SRC_DIR"
echo "📁 Destination : $DEST_DIR"

# Copie
for file in "$SRC_DIR"/my-*; do
  if [ -e "$file" ]; then
    echo "➡️  Copying $(basename "$file")"
    cp -f "$file" "$DEST_DIR/"
  fi
done

echo "✅ Templates installed successfully"
