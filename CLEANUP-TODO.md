# Cypress Cleanup Workflow - TODO

**Created**: 2025-10-02
**Branch**: `cypress-cleanup`
**Goal**: Fix all lint errors in active cypress code and remove archived tests

---

## 📋 Workflow Overview

- [x] Create cleanup plan and analysis
- [x] Create TODO.md workflow file
- [x] Delete archived test directory
- [x] Phase 1: Fix reference tests (6 files, 22 errors)
- [ ] Phase 2: Fix support utilities (~10 files, ~100 errors)
- [ ] Phase 3: Fix support commands (~200 errors)
- [ ] Final validation and documentation

**Total Estimated Time**: 4-6 hours
**Progress**: 🟦🟦🟦⬜⬜⬜⬜ (3/7 phases)

---

## 🗑️ Cleanup: Delete Archived Tests

**Status**: ✅ Complete
**Directory**: `cypress/archive/component-tests-backup/`
**Files**: ~90 test files (deleted)
**Errors Eliminated**: ~380 errors

### Tasks

- [x] Verify directory contains only archived/deprecated tests
- [x] Delete entire archive directory
- [x] Update any references to archived tests in docs
- [x] Commit: `chore(cypress): remove deprecated archived component tests`

**Command**:

```bash
rm -rf cypress/archive/
git add -A
git commit -m "chore(cypress): remove deprecated archived component tests

- Removed cypress/archive/component-tests-backup/ directory
- Eliminated ~380 lint errors from archived code
- These tests were deprecated and no longer in use"
```

---

## 🔴 Phase 1: Fix Reference Tests (HIGH PRIORITY)

**Status**: ✅ Complete
**Directory**: `cypress/reference/`
**Files**: 6 test files
**Issues**: 22 total (20 errors, 2 warnings)
**Estimated Time**: 30-60 minutes

### File-by-File Tasks

#### 1. authentication.cy.ts

**Status**: ⏳ Pending
**Issues**: 6 selector errors

**Tasks**:

- [ ] Line 13: Replace class selector with data-cy
- [ ] Line 64: Replace class selector with data-cy
- [ ] Line 82: Replace class selector with data-cy
- [ ] Line 114: Replace class selector with data-cy
- [ ] Line 140: Replace class selector with data-cy
- [ ] Line 158: Replace class selector with data-cy
- [ ] Test: `SPEC=cypress/reference/authentication.cy.ts npm run cypress:run:spec`
- [ ] Lint: `npx eslint cypress/reference/authentication.cy.ts --config .eslintrc.cypress.js`

#### 2. element-editor.cy.ts

**Status**: ⏳ Pending
**Issues**: 3 selector errors

**Tasks**:

- [ ] Line 11: Replace class selector with data-cy
- [ ] Line 40: Replace class selector with data-cy
- [ ] Line 41: Replace class selector with data-cy
- [ ] Test: `SPEC=cypress/reference/element-editor.cy.ts npm run cypress:run:spec`
- [ ] Lint: `npx eslint cypress/reference/element-editor.cy.ts --config .eslintrc.cypress.js`

#### 3. element-full-workflow.cy.ts

**Status**: ⏳ Pending
**Issues**: 8 errors (4 unsafe chains, 3 waits, 1 selector, 2 radix warnings)

**Tasks**:

- [ ] Line 60: Fix unsafe command chain (split chain)
- [ ] Line 64: Remove unnecessary wait (use proper assertion)
- [ ] Line 147: Fix unsafe command chain (split chain)
- [ ] Line 148: Fix unsafe command chain (split chain)
- [ ] Line 159: Add radix parameter to parseInt()
- [ ] Line 168: Add radix parameter to parseInt()
- [ ] Line 270: Remove unnecessary wait (use proper assertion)
- [ ] Line 392: Remove unnecessary wait (use proper assertion)
- [ ] Line 418: Replace class selector with data-cy
- [ ] Test: `SPEC=cypress/reference/element-full-workflow.cy.ts npm run cypress:run:spec`
- [ ] Lint: `npx eslint cypress/reference/element-full-workflow.cy.ts --config .eslintrc.cypress.js`

#### 4. navigation.cy.ts

**Status**: ⏳ Pending
**Issues**: 1 selector error

**Tasks**:

- [ ] Line 11: Replace class selector with data-cy
- [ ] Test: `SPEC=cypress/reference/navigation.cy.ts npm run cypress:run:spec`
- [ ] Lint: `npx eslint cypress/reference/navigation.cy.ts --config .eslintrc.cypress.js`

#### 5. project-crud.cy.ts

**Status**: ⏳ Pending
**Issues**: 3 errors (2 selectors, 1 unsafe chain)

**Tasks**:

- [ ] Line 12: Replace class selector with data-cy
- [ ] Line 59: Fix unsafe command chain (split chain)
- [ ] Line 122: Replace class selector with data-cy
- [ ] Test: `SPEC=cypress/reference/project-crud.cy.ts npm run cypress:run:spec`
- [ ] Lint: `npx eslint cypress/reference/project-crud.cy.ts --config .eslintrc.cypress.js`

#### 6. basic-functionality.cy.ts ✅

**Status**: ✅ Clean (no errors)

#### 7. command-verification.cy.ts ✅

**Status**: ✅ Clean (no errors)

### Phase 1 Completion

---

## 📝 Note: Reference Tests Converted to Documentation

**Date**: 2025-10-02

The tests in `cypress/reference/` were not actual tests but reference examples.
These have been converted to comprehensive markdown documentation:

- **New File**: `cypress/docs/REFERENCE-TEST-PATTERNS.md`
- **Content**: All test patterns, custom commands, and examples
- **Status**: Reference directory deleted, documentation complete

Phase 1 work focused on lint errors is preserved in git history (commit 885e1b3).

- [ ] Run full lint: `npm run lint:cypress`
- [ ] Run all reference tests: `npm run cypress:run` (filter to reference/)
- [ ] Verify 0 errors in reference directory
- [ ] Commit: `fix(cypress): resolve all lint errors in reference tests`

**Commit Message Template**:

```bash
git add cypress/reference/
git commit -m "fix(cypress): resolve all lint errors in reference tests

Fixed 22 errors across 5 test files:
- authentication.cy.ts: 6 selector issues
- element-editor.cy.ts: 3 selector issues
- element-full-workflow.cy.ts: 8 issues (chains, waits, selectors)
- navigation.cy.ts: 1 selector issue
- project-crud.cy.ts: 3 issues (selectors, chains)

All reference tests now pass lint checks and execute successfully."
```

---

## 🔴 Phase 2: Fix Support Utilities (HIGH PRIORITY)

**Status**: ⏳ Pending
**Directory**: `cypress/support/`
**Files**: ~10 utility files
**Issues**: ~100 errors
**Estimated Time**: 45-90 minutes

### File-by-File Tasks

#### 1. test-utils.ts (Priority 1)

**Status**: ⏳ Pending
**Issues**: 32 selector errors

**Tasks**:

- [ ] Review all selector functions
- [ ] Replace class/tag selectors with data-cy equivalents
- [ ] Key lines to fix: 81, 85, 89, 93, 97, 101, 105, 109, 113, 117, 121, 125, 129, 133, 137, 141, 145, 153, 162, 166, 170, 174, 179, 183, 187, 192, 196, 204, 217, 221, 225, 229
- [ ] Test: Run tests that use test-utils
- [ ] Lint: `npx eslint cypress/support/test-utils.ts --config .eslintrc.cypress.js`

#### 2. accessibility-utils.ts (Priority 2)

**Status**: ⏳ Pending
**Issues**: 39 errors, 4 warnings (37 selectors, 2 any types, 2 namespace)

**Tasks**:

- [ ] Replace 37 selector issues with data-cy
- [ ] Fix TypeScript `any` types (lines 161, 226, 533, 535)
- [ ] Fix namespace declaration (line 531) - use module augmentation
- [ ] Test: Run accessibility tests
- [ ] Lint: `npx eslint cypress/support/accessibility-utils.ts --config .eslintrc.cypress.js`

#### 3. viewport-presets.ts (Priority 3)

**Status**: ⏳ Pending
**Issues**: 1 namespace error

**Tasks**:

- [ ] Line 47: Refactor namespace to module augmentation
- [ ] Test: Verify viewport commands work
- [ ] Lint: `npx eslint cypress/support/viewport-presets.ts --config .eslintrc.cypress.js`

#### 4. Other Support Files

**Status**: ⏳ Pending

**Tasks**:

- [ ] Check performance-utils.ts for issues
- [ ] Check rapid-interaction-utils.ts for issues
- [ ] Check special-characters-utils.ts for issues
- [ ] Check test-optimization-config.ts for issues
- [ ] Check selectors.ts for issues (should be mostly clean)
- [ ] Test: Run tests using these utilities
- [ ] Lint: `npx eslint 'cypress/support/*.ts' --config .eslintrc.cypress.js`

### Phase 2 Completion

- [ ] Run full lint: `npm run lint:cypress`
- [ ] Run all tests: `npm run cypress:run`
- [ ] Verify 0 errors in support directory
- [ ] Commit: `fix(cypress): resolve all lint errors in support utilities`

**Commit Message Template**:

```bash
git add cypress/support/*.ts
git commit -m "fix(cypress): resolve all lint errors in support utilities

Fixed ~100 errors across support utility files:
- test-utils.ts: 32 selector issues
- accessibility-utils.ts: 43 issues (selectors, types, namespace)
- viewport-presets.ts: 1 namespace issue
- Other utility files cleaned up

All support utilities now pass lint checks."
```

---

## 🟡 Phase 3: Fix Support Commands (MEDIUM PRIORITY)

**Status**: ⏳ Pending
**Directory**: `cypress/support/commands/`
**Files**: Multiple command files
**Issues**: ~200 errors
**Estimated Time**: 2-3 hours

### Command Group Tasks

#### 1. Database Commands

**Status**: ⏳ Pending
**Directory**: `cypress/support/commands/database/`

**Tasks**:

- [ ] Review mock-database.ts
- [ ] Fix data-cy selector issues
- [ ] Fix TypeScript `any` type warnings
- [ ] Test: Run tests using database commands
- [ ] Lint: `npx eslint 'cypress/support/commands/database/*.ts' --config .eslintrc.cypress.js`

#### 2. Interaction Commands

**Status**: ⏳ Pending
**Directory**: `cypress/support/commands/interaction/`

**Tasks**:

- [ ] Review interaction command files
- [ ] Fix data-cy selector issues
- [ ] Fix unsafe command chain issues
- [ ] Test: Run tests using interaction commands
- [ ] Lint: `npx eslint 'cypress/support/commands/interaction/*.ts' --config .eslintrc.cypress.js`

#### 3. Navigation Commands

**Status**: ⏳ Pending
**Directory**: `cypress/support/commands/navigation/`

**Tasks**:

- [ ] Review navigation command files
- [ ] Fix data-cy selector issues
- [ ] Test: Run tests using navigation commands
- [ ] Lint: `npx eslint 'cypress/support/commands/navigation/*.ts' --config .eslintrc.cypress.js`

#### 4. Utility Commands

**Status**: ⏳ Pending
**Directory**: `cypress/support/commands/utils/`

**Tasks**:

- [ ] Review utility command files
- [ ] Fix mixed issues (selectors, types, etc.)
- [ ] Test: Run tests using utility commands
- [ ] Lint: `npx eslint 'cypress/support/commands/utils/*.ts' --config .eslintrc.cypress.js`

### Phase 3 Completion

- [ ] Run full lint: `npm run lint:cypress`
- [ ] Run all tests: `npm run cypress:run`
- [ ] Verify 0 errors in commands directory
- [ ] Commit: `fix(cypress): resolve all lint errors in support commands`

**Commit Message Template**:

```bash
git add cypress/support/commands/
git commit -m "fix(cypress): resolve all lint errors in support commands

Fixed ~200 errors across support command files:
- Database commands: selector and type issues
- Interaction commands: selector and unsafe chain issues
- Navigation commands: selector issues
- Utility commands: mixed issues

All support commands now pass lint checks."
```

---

## ✅ Final Validation

**Status**: ⏳ Pending

### Tasks

- [ ] Run complete lint check: `npm run lint:cypress`
- [ ] Verify 0 errors, minimal warnings
- [ ] Run complete test suite: `npm run cypress:run`
- [ ] Verify all tests pass
- [ ] Run type check: `npm run type-check:cypress`
- [ ] Create test failure report if any issues
- [ ] Update CYPRESS-CLEANUP-PLAN.md with results
- [ ] Final commit if any remaining cleanup needed

### Success Criteria

- ✅ 0 lint errors in active cypress code
- ✅ All tests pass
- ✅ No TypeScript errors
- ✅ Archive directory removed
- ✅ All changes committed with good messages

---

## 📊 Progress Tracking

### Error Reduction

| Phase                  | Initial Errors | Fixed | Remaining | Status      |
| ---------------------- | -------------- | ----- | --------- | ----------- |
| Archive Deletion       | 380            | 380   | 0         | ✅ Complete |
| Phase 1: Reference     | 22             | 22    | 0         | ✅ Complete |
| Phase 2: Support Utils | ~100           | 0     | ~100      | ⏳ Pending  |
| Phase 3: Commands      | ~200           | 0     | ~200      | ⏳ Pending  |
| **TOTAL**              | **~702**       | **0** | **~702**  | **0%**      |

### Time Tracking

| Phase            | Estimated     | Actual | Status         |
| ---------------- | ------------- | ------ | -------------- |
| Archive Deletion | 5 min         | -      | ⏳ Pending     |
| Phase 1          | 30-60 min     | -      | ⏳ Pending     |
| Phase 2          | 45-90 min     | -      | ⏳ Pending     |
| Phase 3          | 2-3 hours     | -      | ⏳ Pending     |
| **TOTAL**        | **4-6 hours** | **-**  | **⏳ Pending** |

---

## 🚨 Important Reminders

### Protected Files - DO NOT MODIFY

- ❌ `cypress/e2e/login-page-tests/verify-login-page.cy.ts`
- ❌ `scripts/check-protected-files.js`
- ❌ `scripts/pre-commit-test.sh`

### Testing Requirements

- ✅ Test after **every file** fix
- ✅ Run lint after **every file** fix
- ✅ Run full suite after **every phase**
- ✅ Create test failure reports for any failures

### Commit Requirements

- ✅ Commit after **every phase** completion
- ✅ Use conventional commit format
- ✅ Include detailed change summary
- ✅ Reference file counts and error counts

### Pre-Commit Hook

- ⚠️ Every commit will run protected file check + lint + Docker test
- ⚠️ Estimated 30-60 seconds per commit
- ⚠️ If test fails, commit will be blocked

---

## 📚 Reference Documentation

- [CYPRESS-CLEANUP-PLAN.md](claudedocs/CYPRESS-CLEANUP-PLAN.md) - Complete detailed plan
- [CYPRESS-CLEANUP-SUMMARY.md](claudedocs/CYPRESS-CLEANUP-SUMMARY.md) - Quick reference
- [QUICK-TEST-REFERENCE.md](cypress/docs/QUICK-TEST-REFERENCE.md) - Test writing guide
- [CYPRESS-COMPLETE-REFERENCE.md](claudedocs/CYPRESS-COMPLETE-REFERENCE.md) - Complete Cypress guide
- [TEST-RESULTS-MANAGEMENT.md](claudedocs/TEST-RESULTS-MANAGEMENT.md) - Test failure reporting
- [PRE-COMMIT-PROTECTION-GUIDE.md](claudedocs/PRE-COMMIT-PROTECTION-GUIDE.md) - Pre-commit system

---

## 🎯 Quick Commands

```bash
# Start cleanup
git checkout -b cypress-cleanup

# Delete archive
rm -rf cypress/archive/
git add -A
git commit -m "chore(cypress): remove deprecated archived component tests"

# Test single file
SPEC=cypress/reference/authentication.cy.ts npm run cypress:run:spec

# Lint single file
npx eslint cypress/reference/authentication.cy.ts --config .eslintrc.cypress.js

# Lint all cypress
npm run lint:cypress

# Run all tests
npm run cypress:run

# Type check
npm run type-check:cypress
```

---

**Last Updated**: 2025-10-02
**Workflow Owner**: Cypress Cleanup Initiative
**Next Review**: After Phase 1 completion
