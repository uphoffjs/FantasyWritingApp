#!/bin/bash

# Script to run Cypress tests 10 times with persistent server (no restarts)
# This approach eliminates port conflicts and improves performance
# Usage: ./scripts/run-test-10x-persistent-server.sh path/to/test.cy.ts

set -e

SPEC_FILE="${1:-cypress/e2e/authentication/_smoke-test.cy.ts}"
ITERATIONS=10
RESULTS_DIR="claudedocs/test-results/flakiness-$(date +%Y%m%d-%H%M%S)"

# Create results directory
mkdir -p "$RESULTS_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Initialize tracking arrays
declare -a exit_codes
declare -a pass_counts
declare -a fail_counts
declare -a durations

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Flakiness Test Runner (Persistent Server)${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "Test: ${YELLOW}${SPEC_FILE}${NC}"
echo -e "Iterations: ${YELLOW}${ITERATIONS}${NC}"
echo -e "Results: ${YELLOW}${RESULTS_DIR}${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Cleanup function
cleanup() {
    echo ""
    echo -e "${YELLOW}🧹 Cleaning up server...${NC}"
    if [ -n "$SERVER_PID" ]; then
        echo "Stopping webpack server (PID: $SERVER_PID)..."
        kill $SERVER_PID 2>/dev/null || true
        wait $SERVER_PID 2>/dev/null || true
    fi

    # Enhanced cleanup
    bash scripts/enhanced-cleanup.sh || true

    echo -e "${GREEN}✅ Cleanup complete${NC}"
}

# Set trap to cleanup on exit
trap cleanup EXIT INT TERM

# Initial cleanup
echo -e "${YELLOW}🧹 Running initial cleanup...${NC}"
npm run pre-test:cleanup

# Start webpack dev server ONCE
echo ""
echo -e "${BLUE}🚀 Starting webpack dev server (persistent)...${NC}"
npm run web > "$RESULTS_DIR/server.log" 2>&1 &
SERVER_PID=$!

echo -e "Server PID: ${YELLOW}$SERVER_PID${NC}"
echo -e "Server logs: ${YELLOW}$RESULTS_DIR/server.log${NC}"

# Wait for server to be ready using wait-on
echo ""
echo -e "${YELLOW}⏳ Waiting for server to be ready...${NC}"
npx wait-on http://localhost:3002 -t 60000 || {
    echo -e "${RED}❌ Server failed to start within 60 seconds${NC}"
    echo -e "${RED}Check server logs: $RESULTS_DIR/server.log${NC}"
    exit 1
}

echo -e "${GREEN}✅ Server ready on port 3002${NC}"
echo ""

# Run tests 10 times WITHOUT restarting server
for i in $(seq 1 $ITERATIONS); do
    echo -e "${BLUE}[Iteration $i/$ITERATIONS]${NC} Running test..."

    # Capture start time
    start_time=$(date +%s)

    # Run the test and capture output
    ITERATION_LOG="${RESULTS_DIR}/iteration-${i}.log"

    if SPEC="$SPEC_FILE" bash scripts/docker-cypress-with-cleanup.sh > "$ITERATION_LOG" 2>&1; then
        exit_code=0
        status="${GREEN}PASS${NC}"
    else
        exit_code=$?
        status="${RED}FAIL${NC}"
    fi

    # Capture end time
    end_time=$(date +%s)
    duration=$((end_time - start_time))

    # Extract test results from log (BSD grep compatible)
    pass_count=$(grep -o '[0-9]* passing' "$ITERATION_LOG" | grep -o '[0-9]*' | head -1 || echo "0")
    fail_count=$(grep -o '[0-9]* failing' "$ITERATION_LOG" | grep -o '[0-9]*' | head -1 || echo "0")

    # Store results
    exit_codes+=($exit_code)
    pass_counts+=($pass_count)
    fail_counts+=($fail_count)
    durations+=($duration)

    # Display iteration result
    echo -e "${BLUE}[Iteration $i/$ITERATIONS]${NC} Status: $status | Pass: $pass_count | Fail: $fail_count | Duration: ${duration}s"

    # Brief pause between tests (server stays running)
    if [ $i -lt $ITERATIONS ]; then
        echo "Brief pause (3s) before next iteration..."
        sleep 3
    fi
done

# Generate summary report
SUMMARY_FILE="${RESULTS_DIR}/summary.md"

echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}Generating Summary Report${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Calculate statistics
total_runs=$ITERATIONS
successful_runs=$(echo "${exit_codes[@]}" | tr ' ' '\n' | grep -c "^0$" || echo "0")
failed_runs=$((total_runs - successful_runs))

# Calculate total test time
total_time=0
for dur in "${durations[@]}"; do
    total_time=$((total_time + dur))
done

# Calculate average time per iteration
avg_time=$((total_time / ITERATIONS))

# Create summary report
cat > "$SUMMARY_FILE" << EOF
# Flakiness Test Report (Persistent Server)

**Test File:** \`${SPEC_FILE}\`
**Date:** $(date '+%Y-%m-%d %H:%M:%S')
**Total Iterations:** ${total_runs}
**Server Mode:** Persistent (no restarts)

## Summary

| Metric | Value |
|--------|-------|
| Total Runs | ${total_runs} |
| Successful Runs | ${successful_runs} |
| Failed Runs | ${failed_runs} |
| Success Rate | $(awk "BEGIN {printf \"%.1f%%\", (${successful_runs}/${total_runs})*100}")  |
| Total Time | ${total_time}s |
| Average Time/Iteration | ${avg_time}s |

## Performance Comparison

**Phase 1 (Restart per iteration):**
- Average: ~52s per iteration (server startup overhead)
- Total for 10 iterations: ~520s

**Phase 2 (Persistent server):**
- Average: ${avg_time}s per iteration
- Total for 10 iterations: ${total_time}s
- **Time Saved:** $((520 - total_time))s (~$(awk "BEGIN {printf \"%.1f%%\", ((520-${total_time})/520)*100}") faster)

## Detailed Results

| Iteration | Status | Pass | Fail | Duration | Exit Code |
|-----------|--------|------|------|----------|-----------|
EOF

# Add iteration details
for i in $(seq 0 $((ITERATIONS - 1))); do
    iter=$((i + 1))
    exit_code=${exit_codes[$i]}
    pass=${pass_counts[$i]}
    fail=${fail_counts[$i]}
    dur=${durations[$i]}

    if [ "$exit_code" -eq 0 ]; then
        status="✅ PASS"
    else
        status="❌ FAIL"
    fi

    echo "| $iter | $status | $pass | $fail | ${dur}s | $exit_code |" >> "$SUMMARY_FILE"
done

# Add flakiness analysis
cat >> "$SUMMARY_FILE" << EOF

## Flakiness Analysis

EOF

if [ $successful_runs -eq $total_runs ]; then
    cat >> "$SUMMARY_FILE" << EOF
✅ **No Flakiness Detected**

All ${total_runs} iterations passed successfully with persistent server. The test infrastructure is stable.

**Key Benefits of Persistent Server:**
- No port conflicts (server never restarted)
- Faster execution (no startup overhead)
- More realistic testing (production servers stay up)
EOF
elif [ $successful_runs -eq 0 ]; then
    cat >> "$SUMMARY_FILE" << EOF
❌ **Consistent Failures**

All ${total_runs} iterations failed. This indicates a test infrastructure or implementation issue, not flakiness.

**Recommended Actions:**
1. Review test implementation and dependencies
2. Check test data setup and cleanup
3. Verify environment configuration
4. Examine failure logs in iteration-*.log files
EOF
else
    cat >> "$SUMMARY_FILE" << EOF
⚠️ **Flakiness Detected**

${failed_runs} out of ${total_runs} iterations failed ($(awk "BEGIN {printf \"%.1f%%\", (${failed_runs}/${total_runs})*100}") failure rate).

**Recommended Actions:**
1. Review timing dependencies and waits
2. Check for race conditions
3. Examine network request handling
4. Verify test isolation and cleanup
5. Compare passing vs failing iteration logs
EOF
fi

# Add failure patterns if applicable
if [ $failed_runs -gt 0 ]; then
    cat >> "$SUMMARY_FILE" << EOF

## Common Failure Patterns

EOF

    # Extract common error messages
    echo "Analyzing failure logs for patterns..." >> "$SUMMARY_FILE"
    echo '```' >> "$SUMMARY_FILE"
    for i in $(seq 1 $ITERATIONS); do
        if [ "${exit_codes[$((i-1))]}" -ne 0 ]; then
            echo "=== Iteration $i ===" >> "$SUMMARY_FILE"
            grep -A 2 "failing" "${RESULTS_DIR}/iteration-${i}.log" | head -10 >> "$SUMMARY_FILE" || true
        fi
    done
    echo '```' >> "$SUMMARY_FILE"
fi

# Add log file locations
cat >> "$SUMMARY_FILE" << EOF

## Detailed Logs

Individual iteration logs and server log available in:
\`${RESULTS_DIR}/\`

- iteration-1.log through iteration-${ITERATIONS}.log
- server.log (webpack dev server output)
EOF

# Display summary to console
echo -e "${GREEN}Summary Report Generated:${NC} $SUMMARY_FILE\n"
cat "$SUMMARY_FILE"

# Exit with appropriate code
if [ $successful_runs -eq $total_runs ]; then
    echo -e "\n${GREEN}✅ All tests passed!${NC}"
    exit 0
elif [ $successful_runs -eq 0 ]; then
    echo -e "\n${RED}❌ All tests failed consistently.${NC}"
    exit 1
else
    echo -e "\n${YELLOW}⚠️  Flakiness detected.${NC}"
    exit 2
fi
