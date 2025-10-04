#!/bin/bash

# Run Cypress tests in Docker container
# Usage: npm run cypress:docker:run
# With auto-server: npm run cypress:docker:test

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
  echo "❌ Error: Docker is not installed"
  echo ""
  echo "Please install Docker Desktop:"
  echo "  macOS: https://docs.docker.com/desktop/install/mac-install/"
  echo "  Linux: https://docs.docker.com/desktop/install/linux-install/"
  echo "  Windows: https://docs.docker.com/desktop/install/windows-install/"
  exit 1
fi

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
  echo "❌ Error: Docker daemon is not running"
  echo ""
  echo "Please start Docker Desktop and try again"
  exit 1
fi

echo "🐳 Running Cypress tests in Docker container..."
echo "📦 Image: cypress/included:14.5.4"
echo "🌐 Server: http://host.docker.internal:3002"
echo ""

# Run Cypress in Docker
# - Use cypress/included:14.5.4 (matches local version)
# - Mount current directory to /e2e in container
# - Set working directory to /e2e
# - Add host.docker.internal mapping (works on macOS, Linux, Windows)
# - Override baseUrl to point to host server
# - Run in headless mode with Electron browser
docker run --rm \
  --add-host host.docker.internal:host-gateway \
  -v "$PWD:/e2e" \
  -w /e2e \
  -e CYPRESS_baseUrl=http://host.docker.internal:3002 \
  cypress/included:14.5.4 \
  --browser electron --headless

# Capture exit code and pass through
exit $?
