#!/bin/bash

# Enhanced cleanup script with graceful shutdown and port verification
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PORTS_TO_CLEAN=(3002 3003)
MAX_WAIT=30  # Maximum seconds to wait for port release

echo -e "${YELLOW}🧹 Starting enhanced cleanup...${NC}"

# Function: Gracefully kill processes on a port
graceful_kill_port() {
    local port=$1
    local pids=$(lsof -ti :$port 2>/dev/null || true)

    if [ -z "$pids" ]; then
        echo -e "${GREEN}✓ Port $port is already free${NC}"
        return 0
    fi

    echo "Processes on port $port: $pids"

    # Try SIGTERM first (graceful shutdown)
    echo "Sending SIGTERM to processes on port $port..."
    echo "$pids" | xargs kill -15 2>/dev/null || true

    # Wait up to 5 seconds for graceful shutdown
    for i in {1..5}; do
        sleep 1
        local remaining=$(lsof -ti :$port 2>/dev/null || true)
        if [ -z "$remaining" ]; then
            echo -e "${GREEN}✓ Port $port released gracefully${NC}"
            return 0
        fi
    done

    # If still running, use SIGKILL
    local remaining=$(lsof -ti :$port 2>/dev/null || true)
    if [ -n "$remaining" ]; then
        echo -e "${YELLOW}⚠️  Forcing kill on port $port...${NC}"
        echo "$remaining" | xargs kill -9 2>/dev/null || true
        sleep 2
    fi

    echo -e "${GREEN}✓ Port $port cleanup complete${NC}"
}

# Function: Kill processes by name
kill_by_name() {
    local process_name=$1

    if pkill -15 -f "$process_name" 2>/dev/null; then
        echo "Sent SIGTERM to $process_name processes"
        sleep 2
    fi

    # Force kill if still running
    if pkill -9 -f "$process_name" 2>/dev/null; then
        echo "Forced kill of remaining $process_name processes"
        sleep 1
    fi
}

# Function: Verify port is actually free
verify_port_free() {
    local port=$1
    local max_attempts=$MAX_WAIT

    echo "Verifying port $port is free..."

    for i in $(seq 1 $max_attempts); do
        if ! lsof -ti :$port >/dev/null 2>&1; then
            echo -e "${GREEN}✓ Port $port verified free${NC}"
            return 0
        fi

        if [ $i -eq $max_attempts ]; then
            echo -e "${RED}✗ Port $port still in use after ${max_attempts}s${NC}"
            return 1
        fi

        sleep 1
    done
}

# Main cleanup sequence
echo ""
echo "1️⃣ Cleaning up ports..."
for port in "${PORTS_TO_CLEAN[@]}"; do
    graceful_kill_port $port
done

echo ""
echo "2️⃣ Cleaning up process by name..."
kill_by_name "webpack"
kill_by_name "react-scripts"
kill_by_name "Google Chrome.*cypress"

echo ""
echo "3️⃣ Verifying all ports are free..."
all_ports_free=true
for port in "${PORTS_TO_CLEAN[@]}"; do
    if ! verify_port_free $port; then
        all_ports_free=false
    fi
done

if [ "$all_ports_free" = true ]; then
    echo ""
    echo -e "${GREEN}✅ Enhanced cleanup complete - all ports verified free${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}❌ Cleanup incomplete - some ports still in use${NC}"
    echo "Consider increasing MAX_WAIT or investigating persistent processes"
    exit 1
fi
