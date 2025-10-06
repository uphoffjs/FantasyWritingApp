#!/bin/bash

# Docker Cypress Test Runner (All Tests) with Automatic Cleanup and Result Reporting
# Usage: ./scripts/docker-cypress-all-with-cleanup.sh

set -e  # Exit on error, but we'll handle cleanup in trap

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Results directory
RESULTS_DIR="cypress/results"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
TEST_NAME="all-tests"
RESULT_FILE="${RESULTS_DIR}/${TEST_NAME}_${TIMESTAMP}.json"

# Create results directory if it doesn't exist
mkdir -p "$RESULTS_DIR"

# Cleanup function that always runs
cleanup() {
    local exit_code=$?

    echo ""
    echo -e "${BLUE}🧹 Cleaning up Docker resources...${NC}"

    # Stop any running Cypress containers
    if docker ps -q --filter "ancestor=cypress/included:14.5.4" | grep -q .; then
        echo "Stopping Cypress containers..."
        docker ps -q --filter "ancestor=cypress/included:14.5.4" | xargs docker stop 2>/dev/null || true
    fi

    # Remove stopped Cypress containers
    if docker ps -aq --filter "ancestor=cypress/included:14.5.4" | grep -q .; then
        echo "Removing Cypress containers..."
        docker ps -aq --filter "ancestor=cypress/included:14.5.4" | xargs docker rm 2>/dev/null || true
    fi

    # Remove dangling images (optional - uncomment if desired)
    # docker image prune -f 2>/dev/null || true

    echo -e "${GREEN}✅ Docker cleanup complete${NC}"

    # Generate result file
    generate_result_file "$exit_code"

    exit $exit_code
}

# Set trap to ensure cleanup runs on exit
trap cleanup EXIT INT TERM

# Generate pass/fail result file
generate_result_file() {
    local test_exit_code=$1
    local status="FAILED"
    local icon="❌"

    if [ $test_exit_code -eq 0 ]; then
        status="PASSED"
        icon="✅"
    fi

    # Create JSON result file
    cat > "$RESULT_FILE" << EOF
{
  "testName": "$TEST_NAME",
  "spec": "all",
  "timestamp": "$TIMESTAMP",
  "status": "$status",
  "exitCode": $test_exit_code,
  "docker": {
    "image": "cypress/included:14.5.4",
    "cleaned": true
  }
}
EOF

    # Create human-readable summary
    local summary_file="${RESULTS_DIR}/${TEST_NAME}_${TIMESTAMP}.txt"
    cat > "$summary_file" << EOF
═══════════════════════════════════════════════════════════
    CYPRESS DOCKER TEST REPORT (ALL TESTS)
═══════════════════════════════════════════════════════════

Test:        All Cypress Tests
Status:      $icon $status
Exit Code:   $test_exit_code
Timestamp:   $TIMESTAMP
Docker:      Cleaned ✓

Result File: $RESULT_FILE
═══════════════════════════════════════════════════════════
EOF

    # Display summary
    echo ""
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    if [ $test_exit_code -eq 0 ]; then
        echo -e "${GREEN}$icon ALL TESTS PASSED${NC}"
    else
        echo -e "${RED}$icon TESTS FAILED${NC}"
    fi
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    echo "Test Suite: All Cypress Tests"
    echo "Result:     $RESULT_FILE"
    echo "Summary:    $summary_file"
    echo -e "${BLUE}════════════════════════════════════════${NC}"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
  echo -e "${RED}❌ Error: Docker is not installed${NC}"
  echo ""
  echo "Please install Docker Desktop:"
  echo "  macOS: https://docs.docker.com/desktop/install/mac-install/"
  exit 1
fi

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
  echo -e "${RED}❌ Error: Docker daemon is not running${NC}"
  echo ""
  echo "Please start Docker Desktop and try again"
  exit 1
fi

echo -e "${BLUE}🐳 Running all Cypress tests in Docker container...${NC}"
echo "📦 Image: cypress/included:14.5.4"
echo "🌐 Server: http://host.docker.internal:3002"
echo ""

# Run Cypress in Docker
# The cleanup trap will handle Docker cleanup automatically
docker run --rm \
  --add-host host.docker.internal:host-gateway \
  -v "$PWD:/e2e" \
  -w /e2e \
  -e CYPRESS_baseUrl=http://host.docker.internal:3002 \
  cypress/included:14.5.4 \
  --browser electron --headless

# Exit code will be captured by trap
