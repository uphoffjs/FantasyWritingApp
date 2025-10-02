# Cypress Directory Cleanup Plan

**Generated**: 2025-10-02
**Total Issues Found**: 522 problems (435 errors, 87 warnings)
**Scope**: `/cypress` directory (excluding .md files)

---

## 📊 Issue Summary

### Error Distribution by Category

| Category                             | Count | Severity | Auto-Fixable      |
| ------------------------------------ | ----- | -------- | ----------------- |
| `cypress/require-data-selectors`     | ~380  | Error    | Yes (partial)     |
| `@typescript-eslint/no-explicit-any` | ~87   | Warning  | No (manual)       |
| `no-undef` (React, types)            | ~40   | Error    | Yes (add imports) |
| `cypress/unsafe-to-chain-command`    | ~8    | Error    | No (manual)       |
| `cypress/no-unnecessary-waiting`     | ~4    | Error    | No (manual)       |
| `@typescript-eslint/no-namespace`    | ~3    | Error    | No (refactor)     |

### Error Distribution by Directory

| Directory            | Files | Errors | Warnings | Priority          |
| -------------------- | ----- | ------ | -------- | ----------------- |
| `cypress/e2e/`       | 1     | 0      | 0        | ✅ Clean          |
| `cypress/reference/` | 6     | 20     | 2        | 🔴 High           |
| `cypress/support/`   | 10+   | ~100   | ~20      | 🔴 High           |
| `cypress/fixtures/`  | 3     | 0      | 0        | ✅ Clean          |
| `cypress/archive/`   | 90+   | ~315   | ~65      | 🟡 Low (archived) |

---

## 🎯 Recommended Fix Strategy

### Phase 1: Active E2E Tests (HIGH PRIORITY)

**Scope**: `cypress/reference/*.cy.ts` (6 files)
**Issues**: 22 total (20 errors, 2 warnings)
**Estimated Time**: 30-60 minutes

**Files to Fix**:

1. ✅ [authentication.cy.ts](../cypress/reference/authentication.cy.ts) - 6 selector errors
2. ✅ [element-editor.cy.ts](../cypress/reference/element-editor.cy.ts) - 3 selector errors
3. ✅ [element-full-workflow.cy.ts](../cypress/reference/element-full-workflow.cy.ts) - 8 errors (6 unsafe chains, 3 waits, 2 radix)
4. ✅ [navigation.cy.ts](../cypress/reference/navigation.cy.ts) - 1 selector error
5. ✅ [project-crud.cy.ts](../cypress/reference/project-crud.cy.ts) - 3 errors (2 selectors, 1 unsafe chain)
6. ✅ [basic-functionality.cy.ts](../cypress/reference/basic-functionality.cy.ts) - 0 errors (already clean)
7. ✅ [command-verification.cy.ts](../cypress/reference/command-verification.cy.ts) - 0 errors (already clean)

**Fix Actions**:

- [ ] Replace class/tag selectors with `data-cy` attributes
- [ ] Fix unsafe command chaining (split chains)
- [ ] Remove unnecessary `cy.wait()` calls (use proper assertions)
- [ ] Add radix parameter to `parseInt()` calls

**Automation Potential**: 70% (selectors can be semi-automated)

---

### Phase 2: Core Support Utilities (HIGH PRIORITY)

**Scope**: `cypress/support/*.ts` (non-command files)
**Issues**: ~100 errors, ~20 warnings
**Estimated Time**: 45-90 minutes

**Files to Fix** (Priority Order):

1. **[test-utils.ts](../cypress/support/test-utils.ts)** - 32 selector errors

   - Fix: Replace all class selectors with data-cy equivalents
   - Note: This is a utility file used by many tests

2. **[accessibility-utils.ts](../cypress/support/accessibility-utils.ts)** - 39 errors, 4 warnings

   - 37 selector errors
   - 2 `no-explicit-any` warnings
   - 2 namespace errors

3. **[selectors.ts](../cypress/support/selectors.ts)** - Check for issues

   - Should define data-cy selector constants

4. **[performance-utils.ts](../cypress/support/performance-utils.ts)** - Check
5. **[rapid-interaction-utils.ts](../cypress/support/rapid-interaction-utils.ts)** - Check
6. **[special-characters-utils.ts](../cypress/support/special-characters-utils.ts)** - Check
7. **[test-optimization-config.ts](../cypress/support/test-optimization-config.ts)** - Check
8. **[viewport-presets.ts](../cypress/support/viewport-presets.ts)** - 1 namespace error

**Fix Actions**:

- [ ] Replace all non-data-cy selectors with data-cy attributes
- [ ] Fix TypeScript `any` types with proper type definitions
- [ ] Refactor namespace declarations to ES6 exports
- [ ] Add missing React/type imports where needed

**Automation Potential**: 60% (selectors mostly automated, types manual)

---

### Phase 3: Support Commands (MEDIUM PRIORITY)

**Scope**: `cypress/support/commands/**/*.ts`
**Issues**: ~200+ errors
**Estimated Time**: 2-3 hours

**File Groups**:

1. **Database Commands** - `commands/database/`

   - Many `no-explicit-any` warnings
   - Some selector issues
   - Type definition improvements needed

2. **Interaction Commands** - `commands/interaction/`

   - Selector issues
   - Unsafe chain warnings

3. **Navigation Commands** - `commands/navigation/`

   - Selector issues

4. **Utility Commands** - `commands/utils/`
   - Mixed issues

**Fix Actions**:

- [ ] Systematic selector replacements per file
- [ ] Add proper TypeScript typing
- [ ] Fix React/type import issues
- [ ] Address unsafe command chains

**Automation Potential**: 50% (requires more manual review)

---

### Phase 4: Archived Component Tests (LOW PRIORITY - OPTIONAL)

**Scope**: `cypress/archive/component-tests-backup/**/*.cy.tsx`
**Issues**: ~315 errors, ~65 warnings
**Estimated Time**: 8-12 hours
**Recommendation**: **SKIP** unless specifically needed

**Rationale**:

- These are archived/backup component tests
- Not currently in active use
- Significant effort required
- May be deprecated code

**If Needed**:

- Address on a per-file basis only when reactivating
- Use as reference but don't bulk fix

---

## 🔧 Detailed Fix Procedures

### Procedure 1: Data-Cy Selector Migration

**Common Patterns to Fix**:

```typescript
// ❌ WRONG - Class selector
cy.get('.button-submit').click();

// ✅ RIGHT - Data-cy selector
cy.get('[data-cy="button-submit"]').click();

// ❌ WRONG - Tag selector
cy.get('input').type('text');

// ✅ RIGHT - Data-cy selector
cy.get('[data-cy="input-field"]').type('text');

// ❌ WRONG - Complex selector
cy.get('div.modal .btn-primary').click();

// ✅ RIGHT - Data-cy selector
cy.get('[data-cy="modal-primary-button"]').click();
```

**Semi-Automated Approach**:

1. Use regex to find selector patterns
2. For each pattern, determine if component has data-cy attribute
3. If yes, replace; if no, add data-cy to component first
4. Test after each file to ensure no breaks

**Grep Patterns for Finding Issues**:

```bash
# Find class selectors
grep -r "cy\.get\('\." cypress/reference/

# Find tag selectors
grep -r "cy\.get\('[a-z]" cypress/reference/

# Find ID selectors (usually okay but check)
grep -r "cy\.get\('#" cypress/reference/
```

---

### Procedure 2: Unsafe Command Chain Fixes

**Pattern**: `cypress/unsafe-to-chain-command`

**Example Fix**:

```typescript
// ❌ WRONG - Chaining after .click()
cy.get('[data-cy="button"]').click().should('be.disabled');

// ✅ RIGHT - Split the chain
cy.get('[data-cy="button"]').click();
cy.get('[data-cy="button"]').should('be.disabled');

// ❌ WRONG - Chaining after .type()
cy.get('[data-cy="input"]').type('text').should('have.value', 'text');

// ✅ RIGHT - Split the chain
cy.get('[data-cy="input"]').type('text');
cy.get('[data-cy="input"]').should('have.value', 'text');
```

**Locations in Code**:

- [element-full-workflow.cy.ts:60](../cypress/reference/element-full-workflow.cy.ts#L60)
- [element-full-workflow.cy.ts:147-148](../cypress/reference/element-full-workflow.cy.ts#L147-L148)
- [project-crud.cy.ts:59](../cypress/reference/project-crud.cy.ts#L59)

---

### Procedure 3: Remove Unnecessary Waits

**Pattern**: `cypress/no-unnecessary-waiting`

**Example Fix**:

```typescript
// ❌ WRONG - Arbitrary wait
cy.get('[data-cy="button"]').click();
cy.wait(2000); // Waiting 2 seconds
cy.get('[data-cy="result"]').should('be.visible');

// ✅ RIGHT - Wait for condition
cy.get('[data-cy="button"]').click();
cy.get('[data-cy="result"]').should('be.visible'); // Cypress auto-retries

// ✅ RIGHT - Wait for network request
cy.intercept('POST', '/api/save').as('saveRequest');
cy.get('[data-cy="button"]').click();
cy.wait('@saveRequest'); // Wait for specific request
cy.get('[data-cy="result"]').should('be.visible');
```

**Locations in Code**:

- [element-full-workflow.cy.ts:64](../cypress/reference/element-full-workflow.cy.ts#L64)
- [element-full-workflow.cy.ts:270](../cypress/reference/element-full-workflow.cy.ts#L270)
- [element-full-workflow.cy.ts:392](../cypress/reference/element-full-workflow.cy.ts#L392)

---

### Procedure 4: TypeScript Type Fixes

**Pattern**: `@typescript-eslint/no-explicit-any`

**Example Fix**:

```typescript
// ❌ WRONG - Using any type
function processData(data: any) {
  return data.value;
}

// ✅ RIGHT - Proper type
interface DataType {
  value: string;
}

function processData(data: DataType) {
  return data.value;
}

// ✅ RIGHT - Generic type
function processData<T extends { value: string }>(data: T) {
  return data.value;
}
```

**Locations**: Throughout support/accessibility-utils.ts, support/commands/\*\*

---

### Procedure 5: Missing Import Fixes

**Pattern**: `no-undef` (React, Benchmarking not defined)

**Example Fix**:

```typescript
// ❌ WRONG - React not imported
const component = <div>Hello</div>;

// ✅ RIGHT - Import React
import React from 'react';
const component = <div>Hello</div>;

// ❌ WRONG - Type not imported
const bench: Benchmarking.Result = { time: 100 };

// ✅ RIGHT - Import type
import type { Benchmarking } from './types';
const bench: Benchmarking.Result = { time: 100 };
```

---

### Procedure 6: Namespace to ES6 Module

**Pattern**: `@typescript-eslint/no-namespace`

**Example Fix**:

```typescript
// ❌ WRONG - Using namespace
declare namespace Cypress {
  interface Chainable {
    customCommand(): void;
  }
}

// ✅ RIGHT - Module augmentation
declare global {
  namespace Cypress {
    interface Chainable {
      customCommand(): void;
    }
  }
}

// Or use ES6 exports instead
export interface CustomCommand {
  customCommand(): void;
}
```

**Locations**:

- [accessibility-utils.ts:531](../cypress/support/accessibility-utils.ts#L531)
- [viewport-presets.ts:47](../cypress/support/viewport-presets.ts#L47)

---

## 📋 Execution Checklist

### Pre-Execution

- [ ] Backup current state: `git checkout -b cypress-cleanup`
- [ ] Verify tests pass before changes: `npm run cypress:run`
- [ ] Review protected files list (don't modify without approval)
- [ ] Read [QUICK-TEST-REFERENCE.md](../cypress/docs/QUICK-TEST-REFERENCE.md)

### Phase 1: Reference Tests

- [ ] Fix authentication.cy.ts (6 errors)
- [ ] Fix element-editor.cy.ts (3 errors)
- [ ] Fix element-full-workflow.cy.ts (8 errors)
- [ ] Fix navigation.cy.ts (1 error)
- [ ] Fix project-crud.cy.ts (3 errors)
- [ ] Run lint: `npm run lint:cypress`
- [ ] Run tests: `npm run cypress:run`
- [ ] Commit: `git commit -m "fix(cypress): resolve lint errors in reference tests"`

### Phase 2: Support Utilities

- [ ] Fix test-utils.ts (32 errors)
- [ ] Fix accessibility-utils.ts (43 errors)
- [ ] Fix viewport-presets.ts (1 error)
- [ ] Check and fix other support/\*.ts files
- [ ] Run lint: `npm run lint:cypress`
- [ ] Run tests: `npm run cypress:run`
- [ ] Commit: `git commit -m "fix(cypress): resolve lint errors in support utilities"`

### Phase 3: Support Commands (If Needed)

- [ ] Fix database commands
- [ ] Fix interaction commands
- [ ] Fix navigation commands
- [ ] Fix utility commands
- [ ] Run lint: `npm run lint:cypress`
- [ ] Run tests: `npm run cypress:run`
- [ ] Commit: `git commit -m "fix(cypress): resolve lint errors in support commands"`

### Post-Execution

- [ ] Final lint check: `npm run lint:cypress`
- [ ] Final test run: `npm run cypress:run`
- [ ] Create test failure report if any tests fail
- [ ] Update this plan with lessons learned
- [ ] Merge to main branch

---

## 🚨 Important Warnings

### Protected Files

**DO NOT MODIFY** these files without special approval:

- `cypress/e2e/login-page-tests/verify-login-page.cy.ts`
- Any files in [protected-files.json](../scripts/protected-files.json)

See [PRE-COMMIT-PROTECTION-GUIDE.md](./PRE-COMMIT-PROTECTION-GUIDE.md) for details.

### Archive Directory

**DO NOT** bulk-fix archived files unless specifically requested:

- `cypress/archive/component-tests-backup/**`

These are backup/deprecated tests that may not need fixing.

### Test-First Approach

After each fix:

1. Run lint to verify errors resolved
2. Run affected tests to ensure no breaks
3. Create test failure reports for any new failures

See [TEST-RESULTS-MANAGEMENT.md](./TEST-RESULTS-MANAGEMENT.md)

---

## 📊 Progress Tracking

### Completion Status

| Phase                      | Status     | Errors Fixed | Errors Remaining | Date Completed |
| -------------------------- | ---------- | ------------ | ---------------- | -------------- |
| Phase 1: Reference Tests   | ⏳ Pending | 0            | 22               | -              |
| Phase 2: Support Utilities | ⏳ Pending | 0            | ~100             | -              |
| Phase 3: Support Commands  | ⏳ Pending | 0            | ~200             | -              |
| Phase 4: Archive           | ⏭️ Skipped | 0            | ~380             | -              |

### Error Reduction Goals

| Metric                | Initial | Target | Current | Progress |
| --------------------- | ------- | ------ | ------- | -------- |
| Total Errors          | 435     | 50     | 435     | 0%       |
| Total Warnings        | 87      | 20     | 87      | 0%       |
| Selector Errors       | 380     | 0      | 380     | 0%       |
| TypeScript Errors     | 40      | 10     | 40      | 0%       |
| Cypress Best Practice | 15      | 5      | 15      | 0%       |

**Note**: Archived files not included in targets

---

## 🤖 For Claude AI Assistant

### Execution Guidelines

When executing this cleanup plan:

1. **Follow Phase Order**: Complete Phase 1 before Phase 2, etc.
2. **Test After Each File**: Run `npm run lint:cypress` after each file fix
3. **Commit Incrementally**: Commit after each phase or logical group
4. **Never Skip Testing**: Always verify tests still pass
5. **Document Issues**: If something can't be fixed easily, document why

### Fix Priorities

1. **Must Fix**: Active test files (reference/, support/)
2. **Should Fix**: Support command files
3. **May Skip**: Archived component tests

### Safety Rules

- ❌ Never modify protected files
- ❌ Never use `--no-verify` unless approved
- ❌ Never skip test validation
- ✅ Always create test failure reports for failures
- ✅ Always backup before major changes

### Automation Approach

**Can Automate** (with caution):

- Data-cy selector replacements (with verification)
- Adding missing imports
- Radix parameter additions

**Must Do Manually**:

- Unsafe command chain fixes (requires understanding flow)
- Removing unnecessary waits (requires understanding timing)
- TypeScript type refinements (requires understanding data structures)
- Namespace refactoring (requires understanding module structure)

---

## 📚 Related Documentation

- [QUICK-TEST-REFERENCE.md](../cypress/docs/QUICK-TEST-REFERENCE.md) - Test writing guide
- [CYPRESS-COMPLETE-REFERENCE.md](./CYPRESS-COMPLETE-REFERENCE.md) - Complete Cypress guide
- [TEST-RESULTS-MANAGEMENT.md](./TEST-RESULTS-MANAGEMENT.md) - Test failure reporting
- [PRE-COMMIT-PROTECTION-GUIDE.md](./PRE-COMMIT-PROTECTION-GUIDE.md) - Protected files info
- [CLAUDE.md](../CLAUDE.md) - Main project guide

---

**Plan Version**: 1.0
**Last Updated**: 2025-10-02
**Next Review**: After Phase 1 completion
