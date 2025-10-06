#!/bin/bash

# Flakiness Testing Script for Smoke Tests
# Runs tests multiple times and collects metrics

SPEC_FILE="cypress/e2e/authentication/_smoke-test.cy.ts"
ITERATIONS=${1:-100}
RESULTS_DIR="cypress/results/flakiness-test"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RESULTS_FILE="$RESULTS_DIR/flakiness_report_${TIMESTAMP}.txt"

# Create results directory
mkdir -p "$RESULTS_DIR"

# Initialize counters
TOTAL_RUNS=0
SUCCESSFUL_RUNS=0
FAILED_RUNS=0
TOTAL_TESTS=0
TOTAL_PASSED=0
TOTAL_FAILED=0

# Results arrays
declare -a RUN_RESULTS
declare -a RUN_TIMES

echo "🔬 FLAKINESS TEST - Authentication Smoke Tests"
echo "================================================"
echo "Spec: $SPEC_FILE"
echo "Iterations: $ITERATIONS"
echo "Started: $(date)"
echo ""
echo "Progress:"

# Run tests multiple times
for i in $(seq 1 $ITERATIONS); do
    # Show progress
    if [ $((i % 10)) -eq 0 ]; then
        echo -n "[$i/$ITERATIONS] "
    elif [ $((i % 5)) -eq 0 ]; then
        echo -n "."
    fi

    # Run the test and capture output
    OUTPUT=$(SPEC=$SPEC_FILE npm run cypress:docker:test:spec 2>&1)
    EXIT_CODE=$?

    # Extract metrics from output
    PASSING=$(echo "$OUTPUT" | grep -oP '\d+(?= passing)' | tail -1)
    FAILING=$(echo "$OUTPUT" | grep -oP '\d+(?= failing)' | tail -1)
    DURATION=$(echo "$OUTPUT" | grep -oP 'Duration:\s+\K[^│]+' | tr -d ' ')

    # Default values if grep fails
    PASSING=${PASSING:-0}
    FAILING=${FAILING:-0}
    DURATION=${DURATION:-"unknown"}

    # Update counters
    TOTAL_RUNS=$((TOTAL_RUNS + 1))
    TOTAL_TESTS=$((TOTAL_TESTS + PASSING + FAILING))
    TOTAL_PASSED=$((TOTAL_PASSED + PASSING))
    TOTAL_FAILED=$((TOTAL_FAILED + FAILING))

    # Track results
    if [ $EXIT_CODE -eq 0 ] && [ $FAILING -eq 0 ]; then
        SUCCESSFUL_RUNS=$((SUCCESSFUL_RUNS + 1))
        RUN_RESULTS+=("PASS")
    else
        FAILED_RUNS=$((FAILED_RUNS + 1))
        RUN_RESULTS+=("FAIL")

        # Log failure details
        echo "" >> "$RESULTS_DIR/failures_${TIMESTAMP}.log"
        echo "=== RUN #$i FAILED ===" >> "$RESULTS_DIR/failures_${TIMESTAMP}.log"
        echo "$OUTPUT" >> "$RESULTS_DIR/failures_${TIMESTAMP}.log"
    fi

    RUN_TIMES+=("$DURATION")
done

echo ""
echo ""
echo "================================================"
echo "FLAKINESS TEST COMPLETE"
echo "================================================"
echo ""

# Calculate statistics
SUCCESS_RATE=$(awk "BEGIN {printf \"%.2f\", ($SUCCESSFUL_RUNS / $TOTAL_RUNS) * 100}")
FAILURE_RATE=$(awk "BEGIN {printf \"%.2f\", ($FAILED_RUNS / $TOTAL_RUNS) * 100}")
FLAKINESS_SCORE=$(awk "BEGIN {printf \"%.2f\", ($TOTAL_FAILED / $TOTAL_TESTS) * 100}")

# Generate report
cat > "$RESULTS_FILE" << EOF
🔬 FLAKINESS TEST REPORT
========================
Spec: $SPEC_FILE
Date: $(date)
Duration: $ITERATIONS iterations

📊 RUN STATISTICS
-----------------
Total Runs:        $TOTAL_RUNS
Successful Runs:   $SUCCESSFUL_RUNS ($SUCCESS_RATE%)
Failed Runs:       $FAILED_RUNS ($FAILURE_RATE%)

📈 TEST STATISTICS
------------------
Total Tests:       $TOTAL_TESTS
Tests Passed:      $TOTAL_PASSED
Tests Failed:      $TOTAL_FAILED
Flakiness Score:   $FLAKINESS_SCORE%

🎯 RELIABILITY ASSESSMENT
-------------------------
EOF

# Add assessment
if [ "$FAILURE_RATE" == "0.00" ]; then
    echo "✅ EXCELLENT - Zero failures detected" >> "$RESULTS_FILE"
    echo "   Test suite is rock-solid and production-ready" >> "$RESULTS_FILE"
elif (( $(echo "$FAILURE_RATE < 1.0" | bc -l) )); then
    echo "✅ GOOD - Very low failure rate (<1%)" >> "$RESULTS_FILE"
    echo "   Test suite is reliable with minimal flakiness" >> "$RESULTS_FILE"
elif (( $(echo "$FAILURE_RATE < 5.0" | bc -l) )); then
    echo "⚠️  MODERATE - Some flakiness detected (1-5%)" >> "$RESULTS_FILE"
    echo "   Review failure logs for patterns" >> "$RESULTS_FILE"
else
    echo "❌ POOR - Significant flakiness (>5%)" >> "$RESULTS_FILE"
    echo "   Test suite needs stabilization" >> "$RESULTS_FILE"
fi

echo "" >> "$RESULTS_FILE"
echo "📁 ARTIFACTS" >> "$RESULTS_FILE"
echo "------------" >> "$RESULTS_FILE"
echo "Report:   $RESULTS_FILE" >> "$RESULTS_FILE"

if [ $FAILED_RUNS -gt 0 ]; then
    echo "Failures: $RESULTS_DIR/failures_${TIMESTAMP}.log" >> "$RESULTS_FILE"
fi

# Display report
cat "$RESULTS_FILE"

# Return exit code based on flakiness
if [ "$FAILURE_RATE" == "0.00" ]; then
    exit 0
elif (( $(echo "$FAILURE_RATE < 5.0" | bc -l) )); then
    exit 1
else
    exit 2
fi
