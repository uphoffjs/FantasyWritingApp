# Cypress Refactoring TODO

**Created:** October 1, 2025
**Source:** [cypress/REFACTORING-ANALYSIS.md](cypress/REFACTORING-ANALYSIS.md)
**Status:** 65% Complete (15/23 tasks) - Phase 2: 100% ✅

---

## 🔴 Phase 1: Critical Fixes (P0 - Must Complete First)

### Broken Imports & References

- [x] **Fix authentication.cy.ts imports**
  - File: `cypress/e2e/auth/authentication.cy.ts`
  - Remove: `import { setupAuth, clearAuth } from '../../support/test-helpers'`
  - Replace `setupAuth()` calls with `cy.apiLogin()`
  - Replace `clearAuth()` calls with `cy.cleanMockAuth()`
  - Verify test runs successfully

- [x] **Fix command-verification.cy.ts**
  - File: `cypress/e2e/integration/command-verification.cy.ts`
  - Line 85: Replace `clearAuth()` with `cy.cleanMockAuth()`
  - Update all `setupAuth()` references to `cy.apiLogin()`
  - Remove broken `test-helpers` imports
  - Verify all assertions pass

- [x] **Fix story-crud.cy.ts factory imports**
  - File: `cypress/e2e/stories/story-crud.cy.ts`
  - Line 4: Fix import to `import { storyFactory } from '../../fixtures/factories/story.factory'`
  - Line 15: Replace `StoryFactory.reset()` with `storyFactory.reset()`
  - Line 31: Replace `StoryFactory.create()` with `storyFactory.create()`
  - Update all StoryFactory references throughout file
  - Verify test runs successfully

### Verification

- [x] **Run all tests to verify critical fixes**
  - Command: `npm run cypress:run`
  - Ensure all 3 fixed files pass
  - Document any remaining failures

---

## 🟡 Phase 2: High Priority Refactoring (P1)

### Function Expression Modernization

- [x] **Auto-fix function expressions with ESLint**
  - Command: `npx eslint --fix cypress/e2e/**/*.cy.{ts,js}`
  - Files affected:
    - `cypress/e2e/sync/sync-services.cy.ts`
    - `cypress/e2e/performance/performance-monitoring-example.cy.ts`
    - `cypress/e2e/responsive/viewport-testing-example.cy.ts`
    - `cypress/e2e/search/search-filter-flows.cy.js`
    - `cypress/e2e/login-navigation.cy.ts`
    - `cypress/e2e/stories/story-scene-management.cy.js`
  - Verify: `npm run lint` passes

### Selector Pattern Updates

- [x] **Update scene-editor.cy.ts selectors**
  - File: `cypress/e2e/scenes/scene-editor.cy.ts`
  - Find all `cy.contains()` calls
  - Add `data-cy` attributes to source components
  - Replace with `cy.get('[data-cy="..."]')`
  - Document new selectors in component files

- [x] **Update character-full-workflow.cy.ts selectors**
  - File: `cypress/e2e/characters/character-full-workflow.cy.ts`
  - Find all `cy.contains()` calls
  - Add `data-cy` attributes to source components
  - Replace with `cy.get('[data-cy="..."]')`
  - Update selector reference documentation

### Factory Consolidation

- [x] **Delete old monolithic factories file**
  - Remove: `cypress/fixtures/factories.ts`
  - Verify no imports reference this file
  - Run tests to ensure no breakage

- [x] **Convert elementFactory.js to TypeScript**
  - Rename: `cypress/fixtures/factories/elementFactory.js` → `element.factory.ts`
  - Add TypeScript types
  - Update imports in test files
  - Verify factory works correctly

- [x] **Convert userFactory.js to TypeScript**
  - Rename: `cypress/fixtures/factories/userFactory.js` → `user.factory.ts`
  - Add TypeScript types
  - Update imports in test files
  - Verify factory works correctly

- [x] **Delete duplicate projectFactory.js**
  - Verify `project.factory.ts` exists and works
  - Remove: `cypress/fixtures/factories/projectFactory.js`
  - Update any remaining imports to use `project.factory.ts`
  - Run tests to verify

- [x] **Standardize factory naming**
  - Ensure all factories follow `*.factory.ts` pattern
  - Update `cypress/fixtures/factories/index.ts` to export all factories
  - Document factory usage in README

### Deprecated Command Migration

- [x] **Mark deprecated commands in utility/setup.ts**
  - Add JSDoc `@deprecated` tags:
    - `cy.clearLocalStorage()` → Use `cy.cleanMockAuth()`
    - `cy.setupTestEnvironment()` → Use `cy.mockSupabaseAuth()` + `cy.mockSupabaseDatabase()`
  - Add migration guide comments
  - Create deprecation warnings in command implementations

- [x] **Update command-verification.cy.ts to use new commands**
  - File: `cypress/e2e/integration/command-verification.cy.ts`
  - Lines 16, 26, 58, 140: Replace `cy.clearLocalStorage()` with `cy.cleanMockAuth()`
  - Replace `cy.setupTestEnvironment()` with proper mock commands
  - Verify test passes with new commands

---

## 🟢 Phase 3: Medium Priority Improvements (P2)

### Test Organization

- [ ] **Reorganize test directory structure**
  - Move `cypress/e2e/login-page/verify-login-page.cy.ts` → `cypress/e2e/auth/`
  - Rename `cypress/e2e/integration/` → `cypress/e2e/core/`
  - Rename `cypress/e2e/user-journeys/` → `cypress/e2e/flows/`
  - Move `cypress/e2e/examples/` → `cypress/e2e/docs/examples/`
  - Update imports in affected files
  - Update documentation

- [ ] **Update test categorization**
  - Remove `smoke/` directory (use tags instead)
  - Add `@smoke` tags to basic-functionality.cy.ts
  - Document tagging strategy in CLAUDE.md
  - Update CI/CD to use tags

### TypeScript Migration

- [ ] **Convert user-registration.cy.js to TypeScript**
  - Rename: `cypress/e2e/auth/user-registration.cy.js` → `user-registration.cy.ts`
  - Add type annotations
  - Fix any type errors
  - Verify test passes

- [ ] **Convert character-creation.cy.js to TypeScript**
  - Rename: `cypress/e2e/elements/character-creation.cy.js` → `character-creation.cy.ts`
  - Add type annotations
  - Fix any type errors
  - Verify test passes

- [ ] **Convert search-filter-flows.cy.js to TypeScript**
  - Rename: `cypress/e2e/search/search-filter-flows.cy.js` → `search-filter-flows.cy.ts`
  - Add type annotations
  - Fix any type errors
  - Verify test passes

- [ ] **Convert story-scene-management.cy.js to TypeScript**
  - Rename: `cypress/e2e/stories/story-scene-management.cy.js` → `story-scene-management.cy.ts`
  - Add type annotations
  - Fix any type errors
  - Verify test passes

- [ ] **Convert wait-helpers.js to TypeScript**
  - Rename: `cypress/support/commands/wait/wait-helpers.js` → `wait-helpers.ts`
  - Add type annotations for all commands
  - Update TypeScript declarations in index.d.ts
  - Verify all tests using wait helpers still pass

### Cleanup Duplicates

- [ ] **Remove duplicate utility.ts file**
  - Verify `cypress/support/commands/utility/utility.ts` exists
  - Verify `cypress/support/commands/utility/index.ts` imports it
  - Delete: `cypress/support/commands/utility.ts` (root level)
  - Update main index.ts if needed
  - Run lint to verify

---

## 📚 Documentation Updates

- [ ] **Create migration guide for deprecated commands**
  - File: `cypress/docs/COMMAND-MIGRATION-GUIDE.md`
  - Document old → new command mappings
  - Include code examples
  - Add to main documentation index

- [ ] **Update CLAUDE.md with new standards**
  - Add factory usage patterns
  - Document new test organization
  - Update selector best practices
  - Add TypeScript requirements

- [ ] **Update command README**
  - File: `cypress/support/commands/README.md`
  - Mark deprecated commands
  - Add migration notes
  - Update examples

---

## ✅ Final Verification

- [ ] **Run full test suite**
  - Command: `npm run cypress:run`
  - Verify all tests pass
  - Document any failures

- [ ] **Run linting**
  - Command: `npm run lint`
  - Fix any remaining issues
  - Verify clean lint output

- [ ] **Verify type checking**
  - Command: `npx tsc --noEmit`
  - Fix any TypeScript errors
  - Ensure all files type-check

- [ ] **Update refactoring analysis**
  - Mark completed items in REFACTORING-ANALYSIS.md
  - Update statistics
  - Document lessons learned

---

## 📊 Progress Tracking

### Phase 1: Critical Fixes
- **Tasks:** 4
- **Completed:** 3
- **Progress:** 75%

### Phase 2: High Priority
- **Tasks:** 11
- **Completed:** 0
- **Progress:** 0%

### Phase 3: Medium Priority
- **Tasks:** 8
- **Completed:** 0
- **Progress:** 0%

### Overall Progress
- **Total Tasks:** 24
- **Completed:** 3
- **Progress:** 13%
- **Estimated Hours:** 18-25 hours

---

## 🎯 Success Criteria

- [ ] All tests passing (100% pass rate)
- [ ] Zero ESLint errors
- [ ] Zero TypeScript errors
- [ ] All imports resolved correctly
- [ ] No deprecated commands in active use
- [ ] Consistent file naming (all `.ts`)
- [ ] Clean directory structure
- [ ] Updated documentation

---

## 📝 Notes

- Start with Phase 1 (Critical) - tests must run first
- Phase 2 can be done in parallel by category
- Phase 3 can be deferred if time-constrained
- Archive this file when complete to `claudedocs/archive/todo/`

---

**Last Updated:** October 1, 2025
**Next Review:** After Phase 1 completion
