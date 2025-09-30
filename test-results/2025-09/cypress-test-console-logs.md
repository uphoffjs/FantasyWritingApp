# Cypress Test Console Logs - verify-login-page.cy.ts

**Test File:** `/Users/jacobuphoff/Desktop/FantasyWritingApp/cypress/e2e/verify-login-page.cy.ts`
**Execution Time:** 2025-09-29
**Test Command:** `npm run cypress:run -- --spec cypress/e2e/verify-login-page.cy.ts`

## Build Warnings and Errors

### Vite Configuration Warnings

```
[WARNING] Duplicate key "minify" in object literal [duplicate-object-key]
    vite.config.js:224:4:
      224 │     minify: true,
          ╵     ~~~~~~

  The original key "minify" is here:
    vite.config.js:146:4:
      146 │     minify: 'terser',
          ╵     ~~~~~~

The CJS build of Vite's Node API is deprecated. See https://vite.dev/guide/troubleshooting.html#vite-cjs-node-api-deprecated for more details.

worker.plugins is now a function that returns an array of plugins. Please update your Vite config accordingly.

build.terserOptions is specified but build.minify is not set to use Terser. Note Vite now defaults to use esbuild for minification. If you still prefer Terser, set build.minify to "terser".
```

### Dependency Resolution Errors

```
Failed to resolve dependency: @react-navigation/stack, present in 'optimizeDeps.include'

Error: The following dependencies are imported but could not be resolved:
  - react-native-document-picker (imported by /Users/jacobuphoff/Desktop/FantasyWritingApp/src/components/ImportExport.tsx)
  - react-native-fs (imported by /Users/jacobuphoff/Desktop/FantasyWritingApp/src/components/ImportExport.tsx)
  - react-native-share (imported by /Users/jacobuphoff/Desktop/FantasyWritingApp/src/components/ImportExport.tsx)
```

### Babel/Transform Errors

```
3:42:35 PM [vite] Pre-transform error: Cannot find package 'react-native-dotenv' imported from /Users/jacobuphoff/Desktop/FantasyWritingApp/babel-virtual-resolve-base.js

✘ [ERROR] Unexpected "typeof"
    node_modules/react-native/index.js:27:7:
      27 │ import typeof * as ReactNativePublicAPI from './index.js.flow';
         ╵        ~~~~~~

3:42:35 PM [vite] error while updating dependencies:
Error: Build failed with 1 error:
node_modules/react-native/index.js:27:7: ERROR: Unexpected "typeof"
```

### Vite Internal Server Error

```
3:42:48 PM [vite] Internal server error: Cannot find package 'react-native-dotenv' imported from /Users/jacobuphoff/Desktop/FantasyWritingApp/babel-virtual-resolve-base.js
  Plugin: vite:react-babel
  File: /Users/jacobuphoff/Desktop/FantasyWritingApp/index.web.entry.js
```

## Cypress Test Execution

### Test Run Information

```
DevTools listening on ws://127.0.0.1:62082/devtools/browser/ae93ad96-5a82-479f-9ab3-d9c72664443f
Opening `/dev/tty` failed (6): Device not configured
```

### Test: Login Page Renders

**Test Description:** should render the login page with all essential elements

**Test Failure:**

```
AssertionError: Timed out retrying after 4050ms: cy.visit() failed trying to load:
http://localhost:3002/

We attempted to make an http request to this URL but the request failed without a response.

We received this error at the network level:
  > Error: connect ECONNREFUSED ::1:3002

Common situations why this would fail:
  - you don't have internet access
  - you forgot to run your web server
  - your web server isn't accessible
  - you have weird network configuration settings on your computer

Because this error occurred during a before each hook we are skipping the remaining tests in the current suite: Login Page Renders
```

### Build Error Capture Debug Info

```
[Build Error Capture] Error from Cypress console:
- Build process failed
- Captured 1 build error for current test
- Build Error #1: Server is likely not running
```

### Test Results Summary

```
┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Tests:        1                                                                                │
│ Passing:      0                                                                                │
│ Failing:      1                                                                                │
│ Pending:      0                                                                                │
│ Skipped:      0                                                                                │
│ Screenshots:  3                                                                                │
│ Video:        false                                                                            │
│ Duration:     1 second                                                                         │
│ Spec Ran:     verify-login-page.cy.ts                                                          │
└────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Screenshots Captured

1. `/cypress/screenshots/verify-login-page.cy.ts/Login Page Renders -- should render the login page with all essential elements (failed).png` (2560x1440)
2. `/cypress/screenshots/verify-login-page.cy.ts/Login Page Renders -- should render the login page with all essential elements (failed) (attempt 2).png` (2560x1440)
3. `/cypress/screenshots/verify-login-page.cy.ts/Login Page Renders -- should render the login page with all essential elements (failed) (attempt 3).png` (2560x1440)

## Root Cause Analysis

The test failed because:

1. **Vite Server Build Errors:** Multiple missing dependencies (`react-native-dotenv`, `react-native-document-picker`, `react-native-fs`, `react-native-share`)
2. **Server Not Running:** The dev server couldn't start properly due to build errors, resulting in `ECONNREFUSED ::1:3002`
3. **Configuration Issues:** Duplicate configuration keys and deprecated Vite API usage

## Additional Test Run Attempts

The test runner attempted to continue with other test files after this failure:

- `auth/authentication.cy.ts` (7 of 23) - Also failed with similar issues
