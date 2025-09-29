# Cypress E2E Test Results

**Test File**: `cypress/e2e/smoke/basic-functionality.cy.ts`
**Execution Date**: 2025-09-29
**Execution Time**: 11:48:02
**Test Runner**: Cypress 14.5.4
**Browser**: Electron 130 (headless)
**Node Version**: v22.19.0

---

## Test Summary

| Metric          | Value                     |
| --------------- | ------------------------- |
| **Total Tests** | 0                         |
| **Passing**     | 0                         |
| **Failing**     | 1                         |
| **Pending**     | 0                         |
| **Skipped**     | 0                         |
| **Duration**    | 0 seconds                 |
| **Status**      | ❌ **COMPILATION FAILED** |

---

## Error Details

### Webpack Compilation Error

The test failed to execute due to a Babel configuration error during the compilation phase.

**Error Type**: `Module Build Failed`

**Error Location**: `cypress/support/e2e.ts`

**Error Message**:

```
'loose' mode configuration must be the same for:
- @babel/plugin-transform-class-properties
- @babel/plugin-transform-private-methods
- @babel/plugin-transform-private-property-in-object

These plugins are enabled multiple times with different options.
```

### Root Cause

The Babel configuration has conflicting 'loose' mode settings between different plugin configurations. This is likely caused by:

- Multiple Babel configurations being loaded
- Conflicting plugin settings between the main app and Cypress
- NativeWind or other build tools introducing incompatible Babel settings

---

## Test Execution Log

```
================================================================================
  (Run Starting)

  ┌────────────────────────────────────────────────────────────────────────────┐
  │ Cypress:        14.5.4                                                      │
  │ Browser:        Electron 130 (headless)                                     │
  │ Node Version:   v22.19.0 (/usr/local/bin/node)                              │
  │ Specs:          1 found (basic-functionality.cy.ts)                         │
  │ Searched:       cypress/e2e/smoke/basic-functionality.cy.ts                 │
  │ Experiments:    experimentalRunAllSpecs=true,experimentalStudio=true       │
  └────────────────────────────────────────────────────────────────────────────┘

  Running:  basic-functionality.cy.ts                                   (1 of 1)

Oops...we found an error preparing this test file:
  > cypress/support/e2e.ts

The error was:
Error: Webpack Compilation Error
Module build failed (from ./node_modules/babel-loader/lib/index.js):
Error: /Users/jacobuphoff/Desktop/FantasyWritingApp/cypress/support/e2e.ts:
'loose' mode configuration must be the same for @babel/plugin-transform-class-properties,
@babel/plugin-transform-private-methods and @babel/plugin-transform-private-property-in-object
(when they are enabled).

This occurred while Cypress was compiling and bundling your test code.
```

---

## Screenshots

**No screenshots generated** - The test failed during the compilation phase before any test execution.

---

## Environment Details

- **Development Server**: Running on http://localhost:3002 ✅
- **Cypress Mode**: Headless
- **Operating System**: macOS (Darwin)
- **Project Path**: `/Users/jacobuphoff/Desktop/FantasyWritingApp`

---

## Recommended Actions

1. **Fix Babel Configuration Conflict**:

   ```bash
   # Debug Babel configuration
   npx cross-env BABEL_SHOW_CONFIG_FOR=/Users/jacobuphoff/Desktop/FantasyWritingApp/cypress/support/e2e.ts npx cypress run
   ```

2. **Check for Conflicting Configurations**:

   - Review `babel.config.js` for duplicate plugin entries
   - Check if Cypress has its own Babel configuration
   - Ensure NativeWind babel plugin is properly configured

3. **Possible Quick Fix**:
   Add consistent 'loose' mode to all class-related Babel plugins:

   ```javascript
   // In babel.config.js
   plugins: [
     ['@babel/plugin-transform-class-properties', { loose: true }],
     ['@babel/plugin-transform-private-methods', { loose: true }],
     ['@babel/plugin-transform-private-property-in-object', { loose: true }],
   ];
   ```

4. **Alternative Solution**:
   - Clear Cypress cache: `npx cypress cache clear`
   - Reinstall dependencies: `npm ci`
   - Update Cypress webpack preprocessor configuration

---

## Test Specification Content

**File**: `cypress/e2e/smoke/basic-functionality.cy.ts`

This smoke test was intended to verify basic application functionality but could not be executed due to the compilation error.

---

## Conclusion

The test execution failed before reaching the test code due to a Babel configuration conflict. The issue needs to be resolved at the build configuration level before the E2E tests can run successfully.

**Next Steps**:

1. Resolve the Babel 'loose' mode configuration conflict
2. Verify Cypress webpack preprocessor settings
3. Re-run the test after fixing the configuration issue

---

_Generated: 2025-09-29 11:48:02_
_Test Framework: Cypress 14.5.4_
_Report Format: Markdown_
