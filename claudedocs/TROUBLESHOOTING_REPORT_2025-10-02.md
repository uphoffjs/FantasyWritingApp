# Troubleshooting Report: Test Failure Investigation

**Date**: 2025-10-02
**Test**: `cypress/e2e/login-page-tests/verify-login-page.cy.ts`
**Initial Status**: ❌ FAILED
**Final Status**: ✅ PASSED

---

## 🔍 Problem Summary

The E2E test `verify-login-page.cy.ts` was failing after commit `806adda` ("Fix errors in commands"). The test would fail during the `beforeEach` hook before any test assertions could run.

---

## 📊 Root Cause Analysis

### Issue #1: Cypress API Misuse in Custom Commands

**File**: `cypress/support/commands/debug/build-error-capture.ts`
**Commit**: `806adda9a860e2b7cd315d6e349e2b669dbe34c7`

**Problem**:
The `comprehensiveDebugWithBuildCapture()` custom command was calling `cy.on()` and `cy.task()` in invalid contexts:

1. **`cy.on('uncaught:exception')` inside custom command** (line 35)

   - Cypress does not allow `cy.on()` to be called inside custom commands
   - Event handlers must be registered at the test file or hook level

2. **`cy.task()` calls inside callbacks** (lines 42, 94, 121, 126, 146, 162, 175)

   - Cannot call `cy.task()` inside intercept callbacks or event handlers
   - Violates Cypress command chaining rules

3. **`cy.on('window:before:load')` inside custom command** (line 133)
   - Same issue as #1 - must be at test level

**Error Manifestation**:
Test would fail during `beforeEach` hook with 0ms duration, preventing any test execution.

### Issue #2: Missing Import After Cleanup

**File**: `cypress/support/commands/auth/session.ts`

**Problem**:
After the Cypress support directory cleanup (commit `395150b`), the file `component-wrapper.tsx` was deleted. However, `session.ts` still imported from it:

```typescript
import { initializeStoresForTest } from '../../component-wrapper';
```

**Error Message**:

```
Module not found: Error: Can't resolve '../../component-wrapper'
in '/e2e/cypress/support/commands/auth'
```

**Additional Context**:
The `session.ts` file was entirely for component testing:

- Used `cy.mount()` for mounting components
- Provided `cy.mountWithSession()`, `cy.loginWithSession()`, etc.
- Only relevant for component tests, not E2E tests

---

## 🔧 Solutions Applied

### Solution #1: Fix Cypress API Usage

**Commit**: `2a1c350` - "fix(cypress): remove cy.on() and cy.task() from custom command callbacks"

**Changes Made**:

1. **Removed `cy.on('uncaught:exception')` call**

   ```typescript
   // BEFORE (INVALID):
   Cypress.Commands.add('comprehensiveDebugWithBuildCapture', () => {
     cy.on('uncaught:exception', (err, runnable) => {
       // ...
     });
   });

   // AFTER (FIXED):
   Cypress.Commands.add('comprehensiveDebugWithBuildCapture', () => {
     // No cy.on() calls - use window-level handlers instead
     cy.task('log', '[BUILD CAPTURE] Initializing error capture...');
   });
   ```

2. **Replaced `cy.on('window:before:load')` with `cy.window().then()`**

   ```typescript
   // BEFORE (INVALID):
   cy.on('window:before:load', win => {
     // Setup handlers
   });

   // AFTER (FIXED):
   cy.window({ log: false }).then(win => {
     // Setup handlers
   });
   ```

3. **Removed `cy.task()` calls inside callbacks**

   ```typescript
   // BEFORE (INVALID):
   cy.intercept('**/*', req => {
     req.continue(res => {
       cy.task('log', '[BUILD ERROR] Error detected'); // ❌
     });
   });

   // AFTER (FIXED):
   cy.intercept('**/*', req => {
     req.continue(res => {
       // Note: Cannot call cy.task() inside callbacks
       errors.push(error); // Store for later logging
     });
   });
   ```

4. **Added explanatory comments**
   ```typescript
   // NOTE: cy.on() cannot be called inside custom commands, so we set up
   // window-level handlers instead
   ```

### Solution #2: Remove Component Testing Session File

**Commit**: `ece7159` - "fix(cypress): remove component testing session.ts file"

**Changes Made**:

1. **Deleted `cypress/support/commands/auth/session.ts`**

   - File was entirely for component testing
   - Contained only `cy.mount()` and component-specific commands
   - Imported from deleted `component-wrapper.tsx`

2. **Updated `cypress/support/commands/auth/index.ts`**

   ```typescript
   // BEFORE:
   import './auth';
   import './session';
   import './mock-auth';
   export * from './auth';
   export * from './session';

   // AFTER:
   import './auth';
   import './mock-auth';
   export * from './auth';
   ```

3. **Result**: Clean E2E-only auth commands without component testing dependencies

---

## ✅ Verification

### Test Results

**Command**:

```bash
export SPEC=cypress/e2e/login-page-tests/verify-login-page.cy.ts && \
npm run cypress:docker:test:spec
```

**Output**:

```
Login Page Renders
  ✓ should render the login page with all essential elements (2265ms)

1 passing (2s)

Tests:        1
Passing:      1
Failing:      0
Duration:     2 seconds
```

### Debug Output Verification

The fixed debug commands now work correctly:

```
[BUILD CAPTURE] Initializing error capture...
[BUILD CAPTURE] Error capture initialized
[2025-10-02T16:41:02.839Z] Test started: should render the login page...
Browser: Mozilla/5.0...
Viewport: 1280x720
URL: about:blank
```

---

## 📚 Lessons Learned

### 1. Cypress API Limitations

**Key Rules**:

- ✅ **DO**: Call `cy.on()` at test file or hook level
- ❌ **DON'T**: Call `cy.on()` inside custom commands
- ✅ **DO**: Use `cy.window().then()` for window access in custom commands
- ❌ **DON'T**: Call `cy.task()` inside callbacks (intercepts, event handlers)

**Reference**: [Cypress Documentation - cy.on()](https://docs.cypress.io/api/events/catalog-of-events)

### 2. Cleanup Impact Analysis

**Key Practices**:

- ✅ Always check for imports before deleting files
- ✅ Use grep to find all references: `grep -r "deleted-file" .`
- ✅ Test after cleanup to catch webpack compilation errors
- ✅ Remove related files (like `session.ts`) that depend on deleted files

### 3. Commit Investigation Strategy

**Effective Approach**:

1. Check commit changes: `git show <commit> --stat`
2. Read the failing test to understand requirements
3. Trace imports and dependencies
4. Fix root cause, not symptoms
5. Verify with actual test execution

---

## 🔗 Related Commits

| Commit    | Description                      | Impact                        |
| --------- | -------------------------------- | ----------------------------- |
| `806adda` | Fix errors in commands           | Introduced cy.on() misuse     |
| `395150b` | Remove component testing files   | Deleted component-wrapper.tsx |
| `2a1c350` | Fix cy.on() and cy.task() issues | **Fixed Issue #1**            |
| `ece7159` | Remove session.ts                | **Fixed Issue #2**            |

---

## 📋 Files Modified

### Issue #1 Fix

- ✏️ `cypress/support/commands/debug/build-error-capture.ts`
  - Removed `cy.on('uncaught:exception')` call
  - Replaced `cy.on('window:before:load')` with `cy.window().then()`
  - Removed 6 `cy.task()` calls from callbacks
  - Added explanatory comments

### Issue #2 Fix

- 🗑️ `cypress/support/commands/auth/session.ts` (deleted)

  - 359 lines removed
  - Component testing commands eliminated

- ✏️ `cypress/support/commands/auth/index.ts`
  - Removed session.ts import and export
  - Updated comments to reflect E2E-only focus

---

## 🎯 Prevention Strategies

### For Future Cleanups

1. **Pre-Cleanup Audit**

   ```bash
   # Find all references to files being deleted
   grep -r "component-wrapper" cypress/support
   grep -r "session" cypress/support/commands
   ```

2. **Dependency Analysis**

   - Check imports in all related directories
   - Look for TypeScript exports/imports
   - Review index files that aggregate modules

3. **Post-Cleanup Validation**
   - Run lint: `npm run lint`
   - Run at least one test: `npm run cypress:run:spec`
   - Check webpack compilation errors

### For Cypress Custom Commands

1. **Event Handler Rules**

   - Register `cy.on()` in test files or hooks
   - Use `beforeEach()` for per-test setup
   - Use `before()` for suite-wide setup

2. **Command Execution Context**

   - Avoid `cy.task()` in callbacks
   - Use `cy.window().then()` instead of `cy.on('window:before:load')`
   - Store data for later logging instead of logging immediately

3. **Documentation**
   - Add comments explaining Cypress API limitations
   - Document why certain patterns are used
   - Link to Cypress docs for complex patterns

---

## ✨ Conclusion

**Root Causes**:

1. Cypress API misuse with `cy.on()` and `cy.task()` in custom commands
2. Incomplete cleanup leaving orphaned imports to deleted files

**Solutions**:

1. Fixed Cypress API usage patterns in `build-error-capture.ts`
2. Removed component testing `session.ts` file

**Result**: ✅ Test now passes successfully (1/1 passing, 2s duration)

**Status**: **RESOLVED**

---

**Report Generated**: 2025-10-02
**Investigation Tool**: Claude Code /sc:troubleshoot
**Test Execution**: Docker Cypress (macOS Sequoia compatible)
