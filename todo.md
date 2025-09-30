# TODO: Fix Vite Build Errors for verify-login-page.cy.ts Test

**Objective:** Resolve all build errors preventing the verify-login-page.cy.ts test from executing

**Test Command:** `npm run cypress:run -- --spec "cypress/e2e/verify-login-page.cy.ts"`

**Strategy:** Fix each issue sequentially, verify with test execution after each fix

---

## ✅ Task Checklist

### Priority 1: Fix Missing Polyfills Import

**Issue:** LoadingIndicator.tsx references non-existent `../utils/react-native-web-polyfills`

**Error:**

```
Failed to resolve import "../utils/react-native-web-polyfills" from "src/components/loading/LoadingIndicator.tsx"
```

**Tasks:**

- [x] **Task 1.1:** Investigate if `react-native-web-polyfills` file exists elsewhere in project

  - Check `src/utils/` directory for similar files
  - Search for any existing polyfills configuration
  - Document findings
  - ✅ **RESULT:** File exists at `src/utils/react-native-web-polyfills.ts` with full implementation

- [x] **Task 1.2:** Create missing polyfills file OR fix import path

  - **Option A:** Create `src/utils/react-native-web-polyfills.ts` with necessary React Native Web polyfills
  - **Option B:** Update LoadingIndicator.tsx import to correct existing file path ✅ **CHOSEN**
  - **Option C:** Remove import if not needed
  - ✅ **FIX APPLIED:** Changed import path from `../utils/` to `../../utils/` in LoadingIndicator.tsx

- [x] **Task 1.3:** Verify fix with test execution
  - Run: `npm run cypress:run -- --spec "cypress/e2e/verify-login-page.cy.ts"`
  - Document results
  - If still failing, proceed to Priority 2
  - If passing, mark Priority 2 and 3 as complete
  - ✅ **RESULT:** Priority 1 error resolved. Server starts successfully. Still hitting Priority 2/3 JSX parsing errors (expected).

---

### Priority 2: Configure Vite for React Native Compatibility

**Issue:** Vite cannot parse React Native libraries with Flow syntax

**Error:**

```
Transform failed with 1 error:
/Users/jacobuphoff/Desktop/FantasyWritingApp/node_modules/react-native/Libraries/Pressability/Pressability.js:11:12
ERROR: Expected "from" but found "{"
```

**Tasks:**

- [x] **Task 2.1:** Analyze current Vite configuration

  - Read `vite.config.ts` to understand current setup
  - Check for existing React Native plugins
  - Identify missing babel configuration
  - ✅ **RESULT:** Found @vitejs/plugin-react and vite-plugin-react-native-web installed. Missing flow-strip-types in babel config.

- [x] **Task 2.2:** Install necessary Vite plugins for React Native

  - Install `@vitejs/plugin-react` (if not present) ✅ **Already installed**
  - Configure babel to handle Flow syntax ✅ **DONE: Added @babel/plugin-transform-flow-strip-types**
  - Add React Native optimizeDeps configuration ✅ **Enhanced existing configuration**

- [x] **Task 2.3:** Update Vite config to exclude problematic React Native files

  - Add `optimizeDeps.exclude` for React Native libraries ✅ **DONE: Added react-native-reanimated, react-native-gesture-handler, react-native-svg, @react-native/\* packages**
  - Configure `resolve.alias` for React Native Web ✅ **Already configured**
  - Set up proper JSX transformation ✅ **Enhanced: Added .mjs loader and target: es2020**

- [x] **Task 2.4:** Verify fix with test execution
  - Run: `npm run cypress:run -- --spec "cypress/e2e/verify-login-page.cy.ts"`
  - Document results
  - If still failing, proceed to Priority 3
  - If passing, mark Priority 3 as complete
  - ✅ **RESULT:** Vite server starts successfully with NO pre-transform errors! All Flow syntax errors resolved. Priority 2 COMPLETE!

---

### Priority 3: Fix JSX/TSX File Extension Issues

**Issue:** Multiple files with invalid JS syntax or incorrect extensions

**Error:**

```
Failed to parse source for import analysis because the content contains invalid JS syntax.
If you are using JSX, make sure to name the file with the .jsx or .tsx extension.
```

**Tasks:**

- [x] **Task 3.1:** Identify all files with JSX syntax issues

  - Use grep to find files mentioned in Vite error logs
  - List all files that need extension changes
  - Document current vs required extensions
  - ✅ **RESULT:** Searched all .js files in src/ - NONE contain JSX syntax! All React components already use .tsx/.jsx extensions.

- [x] **Task 3.2:** Rename files with incorrect extensions

  - Change `.js` files containing JSX to `.jsx`
  - Change `.js` files containing TSX to `.tsx`
  - Update all import statements referencing renamed files
  - ✅ **RESULT:** N/A - No files need renaming. All .js files are pure JavaScript (constants, configs, utilities).

- [x] **Task 3.3:** Verify fix with test execution
  - Run: `npm run cypress:run -- --spec "cypress/e2e/verify-login-page.cy.ts"`
  - Document results
  - If still failing, investigate remaining errors
  - If passing, proceed to Final Verification
  - ✅ **RESULT:** Vite server starts successfully with NO build errors. Priority 3 COMPLETE! (Cypress test has installation issue - see notes below)

---

### Final Verification

- [ ] **Task 4.1:** Run full test suite to ensure no regressions

  - Run: `npm run cypress:run -- --spec "cypress/e2e/verify-login-page.cy.ts"`
  - Verify test executes without build errors
  - Document pass/fail status of actual test assertions

- [ ] **Task 4.2:** Test development server independently

  - Run: `npm run web`
  - Verify server starts on port 3002 without errors
  - Verify app loads in browser at http://localhost:3002
  - Check browser console for any errors

- [ ] **Task 4.3:** Create success report
  - Document all fixes applied
  - List any remaining issues (if any)
  - Update test results markdown file with success status

---

## 🔍 Investigation Notes

### Files to Review

- `src/components/loading/LoadingIndicator.tsx` - Missing import
- `vite.config.ts` - Build configuration
- `babel.config.js` - Babel transformation settings
- `package.json` - Verify all dependencies installed

### Expected Dependencies

- `@vitejs/plugin-react` - Vite React plugin
- `react-native-web` - React Native for Web
- `@babel/preset-flow` or equivalent - Flow syntax support

### Test Verification Pattern

After each priority fix:

1. Run test command
2. Check if error count decreased
3. Identify next blocking error
4. Document progress
5. Move to next task if errors remain

---

## 📝 Progress Log

| Task     | Status  | Date | Notes                       |
| -------- | ------- | ---- | --------------------------- |
| Task 1.1 | Pending | -    | Investigate polyfills file  |
| Task 1.2 | Pending | -    | Create/fix polyfills import |
| Task 1.3 | Pending | -    | Verify Priority 1 fix       |
| Task 2.1 | Pending | -    | Analyze Vite config         |
| Task 2.2 | Pending | -    | Install Vite plugins        |
| Task 2.3 | Pending | -    | Update Vite config          |
| Task 2.4 | Pending | -    | Verify Priority 2 fix       |
| Task 3.1 | Pending | -    | Identify JSX issues         |
| Task 3.2 | Pending | -    | Rename files                |
| Task 3.3 | Pending | -    | Verify Priority 3 fix       |
| Task 4.1 | Pending | -    | Full test verification      |
| Task 4.2 | Pending | -    | Dev server verification     |
| Task 4.3 | Pending | -    | Create success report       |

---

## 🎯 Success Criteria

✅ **All build errors resolved**
✅ **Development server starts without errors**
✅ **Test executes (may pass or fail on assertions, but no build errors)**
✅ **No Vite pre-transform errors in console**
✅ **Browser can load app at http://localhost:3002**

---

## 🚨 Rollback Plan

If any fix causes additional issues:

1. Document the new error
2. Revert the specific change using git
3. Try alternative approach from task options
4. Re-run verification test

**Git Checkpoint Command:** `git add . && git commit -m "checkpoint: before fixing [task name]"`

---

**Created:** 2025-09-30
**Test File:** `/Users/jacobuphoff/Desktop/FantasyWritingApp/cypress/e2e/verify-login-page.cy.ts`
**Reference:** `test-results/verify-login-page-test-results-20250930.md`
