#!/usr/bin/env bash
set -e

echo "=============================="
echo " Build application"
echo "=============================="

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

FRONTEND_DIR="$ROOT_DIR/../frontend"
BACKEND_DIR="$ROOT_DIR/../backend"
STATIC_DIR="$BACKEND_DIR/src/main/resources/static"

echo "📦 Cleaning old static files..."
rm -rf "$STATIC_DIR"
mkdir -p "$STATIC_DIR"

echo "⚛️ Building frontend..."
cd "$FRONTEND_DIR"
npm install
npm run build

echo "📁 Copy frontend build to Spring Boot..."
cp -R dist/* "$STATIC_DIR"

echo "☕ Building backend..."
cd "$BACKEND_DIR"
mvn clean package -DskipTests

echo "✅ Build finished successfully!"
