#!/bin/bash

# Docker Cypress Test Runner with Automatic Cleanup and Result Reporting
# Usage: SPEC=path/to/test.cy.ts ./scripts/docker-cypress-with-cleanup.sh

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
TEST_NAME=$(basename "${SPEC%.cy.ts}" 2>/dev/null || echo "all-tests")
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
  "spec": "$SPEC",
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
    CYPRESS DOCKER TEST REPORT
═══════════════════════════════════════════════════════════

Test:        $TEST_NAME
Spec:        $SPEC
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
        echo -e "${GREEN}$icon TEST PASSED${NC}"
    else
        echo -e "${RED}$icon TEST FAILED${NC}"
    fi
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    echo "Test:       $TEST_NAME"
    echo "Result:     $RESULT_FILE"
    echo "Summary:    $summary_file"
    echo -e "${BLUE}════════════════════════════════════════${NC}"
}

# Check if SPEC environment variable is set
if [ -z "$SPEC" ]; then
  echo -e "${RED}❌ Error: SPEC environment variable is required${NC}"
  echo ""
  echo "Usage:"
  echo "  SPEC=cypress/e2e/test-name.cy.ts ./scripts/docker-cypress-with-cleanup.sh"
  echo ""
  exit 1
fi

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

echo -e "${BLUE}🐳 Running Cypress test in Docker container...${NC}"
echo "📦 Image: cypress/included:14.5.4"
echo "🌐 Server: http://host.docker.internal:3002"
echo "🎯 Spec: $SPEC"
echo ""

# Load environment variables from .env file
if [ -f .env ]; then
  echo -e "${BLUE}📋 Loading environment variables from .env...${NC}"

  # Use set -a to automatically export all variables
  set -a
  source .env
  set +a

  # Verify critical variables are set
  missing_vars=()

  if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    missing_vars+=("SUPABASE_SERVICE_ROLE_KEY")
  fi

  if [ -z "$VITE_SUPABASE_URL" ]; then
    missing_vars+=("VITE_SUPABASE_URL")
  fi

  # Check if any critical variables are missing
  if [ ${#missing_vars[@]} -gt 0 ]; then
    echo -e "${RED}❌ Error: Missing required environment variables in .env:${NC}"
    for var in "${missing_vars[@]}"; do
      echo "  - $var"
    done
    echo ""
    echo "Please add these variables to your .env file"
    exit 1
  fi

  echo -e "${GREEN}✅ Environment variables loaded successfully${NC}"
  echo ""
else
  echo -e "${YELLOW}⚠️  Warning: .env file not found${NC}"
  echo "Using existing environment variables (if set)"
  echo ""

  # Still validate that critical variables exist
  if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ] || [ -z "$VITE_SUPABASE_URL" ]; then
    echo -e "${RED}❌ Error: Required environment variables not set${NC}"
    echo "Please create a .env file with:"
    echo "  - SUPABASE_SERVICE_ROLE_KEY"
    echo "  - VITE_SUPABASE_URL"
    exit 1
  fi
fi

# Run Cypress in Docker with specific test file
# The cleanup trap will handle Docker cleanup automatically
docker run --rm \
  --add-host host.docker.internal:host-gateway \
  -v "$PWD:/e2e" \
  -w /e2e \
  -e CYPRESS_baseUrl=http://host.docker.internal:3002 \
  -e CYPRESS_VITE_SUPABASE_URL="$VITE_SUPABASE_URL" \
  -e CYPRESS_SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY" \
  -e VITE_SUPABASE_URL="$VITE_SUPABASE_URL" \
  -e SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY" \
  cypress/included:14.5.4 \
  --browser electron --headless --spec "$SPEC"

# Exit code will be captured by trap
