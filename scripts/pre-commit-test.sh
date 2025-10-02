#!/bin/bash

# * Pre-commit test runner for critical login page verification
# ! This test must pass before any commit is allowed
# ! This script must NOT be modified without special approval

set -e  # Exit on any error

echo ""
echo "🧪 Running pre-commit critical test: verify-login-page..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# * Define the critical test file path
TEST_FILE="cypress/e2e/login-page-tests/verify-login-page.cy.ts"

# * Verify the test file exists
if [ ! -f "$TEST_FILE" ]; then
  echo "❌ ERROR: Critical test file not found: $TEST_FILE"
  echo "🚫 Cannot proceed with commit - test file is missing!"
  exit 1
fi

echo "📋 Test file: $TEST_FILE"
echo "🐳 Running test using Docker (as per CLAUDE.md guidelines)..."
echo ""

# * Run the specific test using Docker
# * This uses the Docker command as outlined in CLAUDE.md
if SPEC="$TEST_FILE" npm run cypress:docker:test:spec; then
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "✅ Pre-commit test PASSED - proceeding with commit"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  exit 0
else
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "❌ Pre-commit test FAILED - commit BLOCKED"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "🚫 The commit has been blocked because the critical login page test failed."
  echo ""
  echo "📋 Next steps:"
  echo "   1. Review the test failure output above"
  echo "   2. Fix the code issues causing the test to fail"
  echo "   3. Run the test manually to verify: SPEC=$TEST_FILE npm run cypress:docker:test:spec"
  echo "   4. Try committing again once the test passes"
  echo ""
  echo "📚 For test debugging help, see:"
  echo "   - claudedocs/CYPRESS-COMPLETE-REFERENCE.md"
  echo "   - claudedocs/TEST-RESULTS-MANAGEMENT.md"
  echo ""
  exit 1
fi
