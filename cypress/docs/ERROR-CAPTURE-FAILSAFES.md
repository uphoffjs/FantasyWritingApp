# Cypress Error Capture Failsafes

**Created**: 2025-10-04
**Status**: ✅ Implemented and Tested

## 🎯 Purpose

This document describes the comprehensive error capture system implemented to catch and display runtime errors during Cypress tests. This prevents situations where tests fail with vague messages like "element not found" when the real issue is a runtime error like `transparent is not defined`.

## 🔴 What Gets Captured

### 1. Uncaught Exceptions

- **What**: Runtime errors that crash React components
- **Example**: `ReferenceError: transparent is not defined`
- **Behavior**: Logs detailed error info to terminal AND fails the test
- **Output Format**:
  ```
  === 🔴 UNCAUGHT EXCEPTION ===
  Message: transparent is not defined
  Stack: [full stack trace]
  Test: should render the login page
  Time: 2025-10-04T16:40:52.701Z
  =============================
  ```

### 2. Unhandled Promise Rejections

- **What**: Promises that reject without catch handlers
- **Example**: API calls that fail silently
- **Behavior**: Logs to terminal (doesn't fail test)
- **Output Format**:
  ```
  === 🔴 UNHANDLED PROMISE REJECTION ===
  Error: API call failed
  Stack: [full stack trace]
  Time: 2025-10-04T16:40:52.701Z
  ======================================
  ```

### 3. Browser Console Errors

- **What**: console.error() calls from your React app
- **Example**: React warnings, PropType errors, etc.
- **Behavior**: Logs to terminal in real-time
- **Output Format**:
  ```
  🔴 BROWSER CONSOLE ERROR: Warning: Failed prop type...
  ```

### 4. Browser Console Warnings

- **What**: console.warn() calls from your React app
- **Example**: Deprecation warnings
- **Behavior**: Logs to terminal in real-time
- **Output Format**:
  ```
  ⚠️  BROWSER CONSOLE WARN: Deprecated API usage...
  ```

## 📁 Implementation Files

### 1. `cypress/support/e2e.ts`

Contains the error capture hooks:

- `Cypress.on('uncaught:exception')` - Catches runtime errors
- `Cypress.on('unhandled:rejection')` - Catches promise rejections
- `beforeEach()` - Overrides console.error and console.warn

### 2. `cypress.config.ts`

Contains the error logging task:

- `logError` task - Centralized error logging to terminal
- `LOG_ERRORS: true` - Environment variable to enable logging

## 🚀 Usage

### Automatic Capture (Always On)

All error capture is automatic. Just run your tests normally:

```bash
# E2E tests
npm run cypress:docker:test:spec

# Component tests
npm run test:component
```

### Manual Error Logging

You can also manually log errors in your tests:

```javascript
it('should handle errors', () => {
  cy.window().then(win => {
    // Access captured errors
    const errors = win.cypressErrors || [];
    console.log('Captured errors:', errors);
  });
});
```

### Disable Error Logging (If Needed)

Set `LOG_ERRORS: false` in `cypress.config.ts`:

```typescript
env: {
  LOG_ERRORS: false, // Disable comprehensive error logging
}
```

## ⚙️ Configuration

### Ignored Errors

Some harmless errors are ignored to prevent false failures:

```typescript
// In cypress/support/e2e.ts
if (err.message.includes('ResizeObserver loop limit exceeded')) {
  return false; // Don't fail test
}
```

Add more ignored errors if needed:

```typescript
const ignoredErrors = [
  'ResizeObserver loop limit exceeded',
  'Some other harmless error',
];

if (ignoredErrors.some(ignored => err.message.includes(ignored))) {
  return false;
}
```

### Error Persistence (Optional)

To save errors to a file, uncomment this section in `cypress.config.ts`:

```typescript
logError(errorInfo) {
  // ... existing code ...

  // Uncomment these lines:
  const fs = require('fs');
  const path = require('path');
  const logPath = path.join(__dirname, 'cypress-errors.log');
  fs.appendFileSync(logPath, JSON.stringify(errorInfo) + '\n');

  return null;
}
```

## 🐛 Debugging Example

### Before Failsafes (Hard to Debug)

```
AssertionError: Timed out retrying after 4000ms:
Expected to find element: `[data-cy="email-input"]`, but never found it.
```

❌ No clue what the real problem is!

### After Failsafes (Clear Error)

```
=== 🔴 UNCAUGHT EXCEPTION ===
Message: transparent is not defined
Stack: at LoadingIndicator.tsx:412:23
Test: should render the login page
Time: 2025-10-04T16:40:52.701Z
=============================
```

✅ Instantly know the problem and where it is!

## 📊 Error Types Summary

| Error Type         | Fails Test? | Logged to Terminal? | When Useful                         |
| ------------------ | ----------- | ------------------- | ----------------------------------- |
| Uncaught Exception | ✅ Yes      | ✅ Yes              | Runtime errors, undefined variables |
| Promise Rejection  | ❌ No       | ✅ Yes              | API failures, async errors          |
| Console Error      | ❌ No       | ✅ Yes              | React warnings, PropType errors     |
| Console Warn       | ❌ No       | ✅ Yes              | Deprecation warnings                |

## 🔧 Troubleshooting

### Error Not Showing in Terminal

1. Check `LOG_ERRORS` is `true` in `cypress.config.ts`
2. Verify `cypress/support/e2e.ts` has the error handlers
3. Make sure you're running the latest version of the test

### Too Many Errors

1. Add specific errors to ignore list (see Configuration section)
2. Filter errors by type in the `logError` task
3. Temporarily disable with `LOG_ERRORS: false`

### Error Log File Growing Too Large

If you enabled error persistence:

```bash
# Clear the log file
rm cypress-errors.log

# Or implement log rotation in the logError task
```

## ✅ Testing the Failsafes

To verify the failsafes are working:

1. Temporarily introduce an error (e.g., remove quotes from a color value)
2. Run the test
3. Verify you see the detailed error in terminal output
4. Fix the error
5. Test passes ✅

## 📚 Related Documentation

- [Cypress Error Handling](https://docs.cypress.io/guides/references/error-messages)
- [Cypress Events API](https://docs.cypress.io/api/events/catalog-of-events)
- [QUICK-TEST-REFERENCE.md](./QUICK-TEST-REFERENCE.md) - Test writing guide

---

**Version**: 1.0
**Last Updated**: 2025-10-04
