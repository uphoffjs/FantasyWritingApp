# Test Results Management - FantasyWritingApp

**Guide for managing test results, generating reports, and documenting test failures.**

---

## Table of Contents

1. [File Naming Convention](#file-naming-convention)
2. [Directory Structure](#directory-structure)
3. [Metadata Header](#metadata-header)
4. [Test Failure Documentation](#test-failure-documentation)
5. [Finding Latest Results](#finding-latest-results)
6. [Best Practices](#best-practices)

---

## File Naming Convention

All test result files MUST include timestamps for easy identification:

```
test-results-YYYYMMDD-HHmmss-[type].md
test-results-20250124-143022-component.md   # Component tests
test-results-20250124-143022-e2e.md         # E2E tests
test-results-20250124-143022-unit.md        # Unit tests
test-results-20250124-143022-all.md         # All test types
```

---

## Directory Structure

```
test-results/
├── latest/                                  # Always contains most recent results
│   ├── test-results-latest.md             # Symlink or copy of newest report
│   ├── test-results-latest-component.md   # Latest component test results
│   ├── test-results-latest-e2e.md         # Latest E2E test results
│   └── summary.json                       # Machine-readable summary
├── 2025-01/                                # Monthly archives
│   ├── test-results-20250124-143022-component.md
│   └── test-results-20250124-093015-e2e.md
└── archive/                                # Older results (30+ days)
```

---

## Metadata Header

Every test results file MUST start with:

```markdown
---
timestamp: 2025-01-24T14:30:22Z # ISO 8601 format
type: component # component|e2e|unit|all
runner: cypress # cypress|jest|vitest
status: complete # complete|partial|failed
duration: 3m42s
passed: 45
failed: 3
skipped: 2
coverage: 78%
previous: test-results-20250124-093015-component.md
---
```

---

## Test Failure Documentation

### MANDATORY: When Cypress Tests Fail

**REQUIRED ACTION:** Immediately create a comprehensive test failure analysis report.

### Report Generation Process

1. **Capture Full Test Output**

   ```bash
   npm run cypress:run -- --spec "cypress/e2e/[test-name].cy.ts" > /tmp/cypress-output.log 2>&1
   ```

2. **Generate Timestamp**

   ```bash
   TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
   ```

3. **Create Report File**
   - **Location:** `test-results/[test-name]-test-results-YYYYMMDD-HHMMSS.md`
   - **Format:** Comprehensive markdown with sections below

### Required Report Sections

```markdown
# Cypress Test Results - [test-name].cy.ts

---

**Test File:** `cypress/e2e/[test-name].cy.ts`
**Timestamp:** YYYY-MM-DD HH:MM:SS
**Status:** ❌ FAILED / ⚠️ PARTIAL / ✅ PASSED
**Duration:** [duration]
**Platform:** [platform info]
**Cypress Version:** [version]
**Node Version:** [version]
**Vite Version:** [version]

---

## Executive Summary

[Brief 2-3 sentence summary of failure]

## Error Details

[Complete error messages and stack traces]

## Root Cause Analysis

[Detailed investigation of why tests failed]

## Test Execution Log

[Full command output]

## Recommended Actions

[Specific steps to resolve issues]

## Environment Details

[System configuration and dependencies]

## Test Assertions Status

[Which assertions passed/failed]

## Related Files

[Links to relevant source files]

---

**Report Generated:** [timestamp]
**Report Type:** Failure Analysis / Success Report
**Action Required:** [next steps]
```

### File Naming Convention

```
test-results/[test-name]-test-results-YYYYMMDD-HHMMSS.md

Examples:
test-results/verify-login-page-test-results-20250930-114134.md
test-results/create-element-test-results-20250930-120000.md
test-results/navigation-test-results-20250930-143000.md
```

### Report Categories

**Failure Analysis Report:** When tests fail

- Root cause investigation
- Error categorization (build/runtime/assertion)
- Recommended fixes
- Environment diagnostics

**Success Report:** When tests pass after failures

- What was fixed
- Verification results
- Regression prevention notes

**Partial Success Report:** When some tests pass

- Pass/fail breakdown
- Critical vs non-critical failures
- Priority order for fixes

### Automation Requirements

**After ANY Cypress test run:**

1. ✅ Capture complete output (stdout + stderr)
2. ✅ Generate timestamped report file
3. ✅ Include all required sections
4. ✅ Categorize errors (build/infrastructure/assertion)
5. ✅ Provide actionable recommendations
6. ✅ Link to related source files
7. ✅ Document environment configuration

**Trigger Conditions:**

- Test execution failures
- Build errors preventing test runs
- Infrastructure issues (Cypress startup, server issues)
- Assertion failures in test code
- Performance degradation
- Flaky test detection

### Example Command Integration

```bash
# Run test and auto-generate report on failure
npm run cypress:run -- --spec "cypress/e2e/verify-login-page.cy.ts" || {
  TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
  # Generate comprehensive failure report
  # Save to test-results/verify-login-page-test-results-$TIMESTAMP.md
}
```

### Report Analysis Workflow

1. **Test fails** → Generate report immediately
2. **Review report** → Identify root cause category
3. **Apply fixes** → Based on recommended actions
4. **Re-run test** → Verify resolution
5. **Update report** → Document resolution if successful
6. **Archive report** → Keep for historical tracking

---

## Finding Latest Results

1. **Quick Check**: `test-results/latest/test-results-latest.md`
2. **By Type**: `test-results/latest/test-results-latest-[type].md`
3. **Summary**: `test-results/latest/summary.json` (machine-readable)
4. **Command**: `npm run test:latest`
5. **Git**: `git log -1 --name-only | grep test-results`

### Quick Access Commands

Add these to package.json scripts:

```json
{
  "test:report": "npm run test:component && node scripts/generate-report.js",
  "test:latest": "cat test-results/latest/test-results-latest.md",
  "test:clean": "node scripts/archive-old-results.js",
  "test:compare": "node scripts/compare-results.js"
}
```

### Generate Report Script Example

```javascript
// scripts/generate-report.js
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const filename = `test-results-${timestamp}-${
  process.env.TEST_TYPE || 'all'
}.md`;
// Generate report with metadata header
// Copy to test-results/latest/test-results-latest.md
```

---

## Best Practices

### Retention Policy

- **Latest**: Always kept in `test-results/latest/`
- **30 days**: Keep in monthly folders (`YYYY-MM/`)
- **Archive**: Move to `archive/` after 30 days
- **CI/CD**: Tag with build number: `test-results-YYYYMMDD-HHmmss-build-123.md`

### Comparison Features

```bash
# Compare with previous run
npm run test:compare

# Compare specific dates
npm run test:compare -- --from=20250123 --to=20250124

# Generate trend report
npm run test:trend -- --days=7
```

### Integration with CI/CD

```yaml
# .github/workflows/test.yml example
- name: Run Tests with Timestamp
  run: |
    TIMESTAMP=$(date +%Y%m%d-%H%M%S)
    npm run test:all -- --report=test-results-$TIMESTAMP-all.md
    cp test-results-$TIMESTAMP-all.md test-results/latest/test-results-latest.md
```

### Documentation Standards

1. **Always use ISO 8601** timestamps for consistency
2. **Include metadata headers** for searchability
3. **Maintain latest symlinks** for quick access
4. **Archive old results** to prevent clutter
5. **Use semantic naming** for test types
6. **Generate diffs** for regression detection
7. **Track trends** over time for quality metrics

---

**Version**: 1.0
**Last Updated**: 2025-10-02
**For**: FantasyWritingApp Testing
