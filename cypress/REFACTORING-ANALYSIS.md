# Cypress Tests & Commands - Refactoring Analysis

**Analysis Date:** October 1, 2025
**Total Test Files:** 22
**Total Command Files:** 35+

---

## 🔴 CRITICAL - Requires Immediate Refactoring

### 1. **Missing Imports & Broken References** ❌

**Files Affected:**
- [cypress/e2e/auth/authentication.cy.ts](cypress/e2e/auth/authentication.cy.ts:3)
- [cypress/e2e/integration/command-verification.cy.ts](cypress/e2e/integration/command-verification.cy.ts:85)
- [cypress/e2e/stories/story-crud.cy.ts](cypress/e2e/stories/story-crud.cy.ts:3-4,15,31)

**Issues:**
```typescript
// ❌ BROKEN: Imports non-existent module
import { setupAuth, clearAuth } from '../../support/test-helpers'

// ❌ BROKEN: Uses undefined function
clearAuth()

// ❌ BROKEN: Undefined factory reference
StoryFactory.reset();
const story = StoryFactory.create();
```

**Impact:** 🔴 Tests will fail to run
**Effort:** Medium (2-3 hours)
**Priority:** P0 - Critical

**Recommended Fix:**
1. Remove imports from `test-helpers` (use `cy.apiLogin()`, `cy.cleanMockAuth()` instead)
2. Replace `clearAuth()` with `cy.cleanMockAuth()`
3. Fix factory imports: `import { storyFactory } from '../../fixtures/factories/story.factory'`

---

### 2. **Outdated Function Expressions** ❌

**Files Affected:**
- [cypress/e2e/sync/sync-services.cy.ts](cypress/e2e/sync/sync-services.cy.ts)
- [cypress/e2e/performance/performance-monitoring-example.cy.ts](cypress/e2e/performance/performance-monitoring-example.cy.ts:20)
- [cypress/e2e/responsive/viewport-testing-example.cy.ts](cypress/e2e/responsive/viewport-testing-example.cy.ts:20,35,52,73)
- [cypress/e2e/search/search-filter-flows.cy.js](cypress/e2e/search/search-filter-flows.cy.js:26)
- [cypress/e2e/login-navigation.cy.ts](cypress/e2e/login-navigation.cy.ts)
- [cypress/e2e/stories/story-scene-management.cy.js](cypress/e2e/stories/story-scene-management.cy.js)

**Issues:**
```javascript
// ❌ OUTDATED: function() syntax (6 files)
beforeEach(function () {
  cy.comprehensiveDebug();
});

// ✅ MODERN: Arrow function syntax
beforeEach(() => {
  cy.comprehensiveDebug();
});
```

**Impact:** 🟡 Code style inconsistency, harder to maintain
**Effort:** Low (automated fix)
**Priority:** P1 - High

**Recommended Fix:**
```bash
# Automated ESLint fix
npx eslint --fix cypress/e2e/**/*.cy.{ts,js}
```

---

## 🟡 HIGH PRIORITY - Needs Refactoring Soon

### 3. **Inconsistent Selector Patterns** ⚠️

**Files Affected:**
- [cypress/e2e/scenes/scene-editor.cy.ts](cypress/e2e/scenes/scene-editor.cy.ts)
- [cypress/e2e/characters/character-full-workflow.cy.ts](cypress/e2e/characters/character-full-workflow.cy.ts)

**Issues:**
```typescript
// ❌ ANTI-PATTERN: Uses cy.contains() with text (brittle)
cy.contains('button', 'Save').click();

// ✅ BETTER: Use data-cy attributes
cy.get('[data-cy="save-button"]').click();
```

**Impact:** 🟡 Flaky tests, localization issues
**Effort:** Medium (4-6 hours for all files)
**Priority:** P1 - High

**Recommended Fix:**
1. Add `data-cy` attributes to components
2. Replace `cy.contains()` with `cy.get('[data-cy="..."]')`
3. Update [CLAUDE.md](CLAUDE.md) selector standards

---

### 4. **Mixed Factory Patterns** ⚠️

**Files:**
- `cypress/fixtures/factories.ts` (old)
- `cypress/fixtures/factories/` (new directory)
  - `character.factory.ts` ✅
  - `story.factory.ts` ✅
  - `project.factory.ts` ✅
  - `elementFactory.js` ❌ (JS instead of TS)
  - `projectFactory.js` ❌ (duplicate)
  - `userFactory.js` ❌ (JS instead of TS)

**Issues:**
- Duplicate factories (`projectFactory.js` vs `project.factory.ts`)
- Mixed JS/TS files
- Inconsistent naming (`elementFactory` vs `element.factory`)

**Impact:** 🟡 Developer confusion, maintenance burden
**Effort:** Medium (3-4 hours)
**Priority:** P1 - High

**Recommended Fix:**
1. Delete `cypress/fixtures/factories.ts` (old monolithic file)
2. Convert `.js` factories to `.ts` with proper types
3. Rename to consistent pattern: `*.factory.ts`
4. Delete duplicate `projectFactory.js`

---

### 5. **Deprecated Custom Commands** ⚠️

**Commands to Deprecate:**
- `cy.clearLocalStorage()` → Use `cy.cleanMockAuth()` instead
- `cy.setupTestEnvironment()` → Use `cy.mockSupabaseAuth()` + `cy.mockSupabaseDatabase()`
- `cy.waitForLoad()` → Use `cy.waitForPageLoad()` instead

**Files Using Deprecated Commands:**
- [cypress/e2e/integration/command-verification.cy.ts](cypress/e2e/integration/command-verification.cy.ts:16,26,58,140)
- [cypress/e2e/stories/story-crud.cy.ts](cypress/e2e/stories/story-crud.cy.ts:22)

**Impact:** 🟡 Technical debt, confusion
**Effort:** Low (2-3 hours)
**Priority:** P2 - Medium

**Recommended Fix:**
1. Mark commands as `@deprecated` with JSDoc
2. Add migration guide to command files
3. Update test files to use new commands

---

## 🟢 MEDIUM PRIORITY - Refactor When Convenient

### 6. **Inconsistent Test Organization** 📁

**Current Structure Issues:**
```
cypress/e2e/
├── auth/                 ✅ Good: category-based
├── characters/           ✅ Good: category-based
├── elements/             ✅ Good: category-based
├── login-page/           ❌ Should be in auth/
├── integration/          ❌ Vague category
├── user-journeys/        ❌ Overlaps with other categories
├── smoke/                ❌ Should be a tag, not directory
└── examples/             ❌ Should be in docs/examples/
```

**Impact:** 🟢 Developer experience, discoverability
**Effort:** Low (1-2 hours)
**Priority:** P2 - Medium

**Recommended Fix:**
```
cypress/e2e/
├── auth/
│   ├── authentication.cy.ts
│   ├── user-registration.cy.js
│   └── verify-login-page.cy.ts      # Moved from login-page/
├── core/                              # Renamed from integration/
│   └── command-verification.cy.ts
├── flows/                             # Renamed from user-journeys/
│   ├── auth-flow.cy.ts
│   └── project-element-flow.cy.ts
└── docs/
    └── examples/                      # Moved from e2e/examples/
        └── mock-auth-example.cy.ts
```

---

### 7. **Missing TypeScript Migration** 📝

**JavaScript Files Needing Conversion:**
- `cypress/e2e/auth/user-registration.cy.js` → `.ts`
- `cypress/e2e/elements/character-creation.cy.js` → `.ts`
- `cypress/e2e/search/search-filter-flows.cy.js` → `.ts`
- `cypress/e2e/stories/story-scene-management.cy.js` → `.ts`
- `cypress/support/commands/wait/wait-helpers.js` → `.ts`

**Impact:** 🟢 Type safety, IntelliSense
**Effort:** Medium (4-5 hours)
**Priority:** P2 - Medium

---

### 8. **Duplicate Command Files** 🔄

**Duplicates Found:**
- `cypress/support/commands/utility.ts` (old - stub/spy only)
- `cypress/support/commands/utility/utility.ts` (new - same content?)

**Impact:** 🟢 Confusion, maintenance
**Effort:** Low (30 minutes)
**Priority:** P3 - Low

**Recommended Fix:**
1. Verify both files have same content
2. Delete root-level `utility.ts`
3. Ensure `utility/index.ts` imports `./utility`

---

## 📊 Summary Statistics

### Refactoring Effort Estimates

| Priority | Category | Files | Estimated Hours |
|----------|----------|-------|-----------------|
| P0 - Critical | Broken imports | 3 | 2-3 |
| P1 - High | Function expressions | 6 | 1 (automated) |
| P1 - High | Selector patterns | 2 | 4-6 |
| P1 - High | Factory cleanup | 8 | 3-4 |
| P2 - Medium | Deprecated commands | 2 | 2-3 |
| P2 - Medium | Test organization | N/A | 1-2 |
| P2 - Medium | TS migration | 5 | 4-5 |
| P3 - Low | Duplicate files | 2 | 0.5 |
| **TOTAL** | | **28+** | **18-25 hours** |

### Files by Status

- ✅ **Clean & Modern:** 7 files (32%)
- ⚠️ **Needs Minor Updates:** 10 files (45%)
- ❌ **Needs Major Refactoring:** 5 files (23%)

---

## 🎯 Recommended Action Plan

### Phase 1: Critical Fixes (Week 1)
1. ✅ Fix broken imports in 3 test files
2. ✅ Run ESLint auto-fix for function expressions
3. ✅ Update deprecated command usage

**Deliverable:** All tests passing and runnable

### Phase 2: High Priority (Week 2-3)
1. Clean up factory files (delete duplicates, convert to TS)
2. Update selector patterns in 2 files
3. Reorganize test directory structure

**Deliverable:** Consistent, maintainable test suite

### Phase 3: Medium Priority (Week 4)
1. Convert 5 JS files to TypeScript
2. Remove duplicate utility files
3. Add migration guide for deprecated commands

**Deliverable:** Fully typed, modern test suite

---

## 🔍 Detection Commands

**Find broken imports:**
```bash
grep -r "from.*test-helpers" cypress/e2e/
grep -r "StoryFactory\|CharacterFactory" cypress/e2e/
```

**Find function expressions:**
```bash
grep -r "function\s*(" cypress/e2e/ | grep -v "//.*function"
```

**Find deprecated selectors:**
```bash
grep -r "cy.contains" cypress/e2e/ | grep -v "data-cy"
```

**Find JS files needing TS conversion:**
```bash
find cypress/e2e -name "*.cy.js"
find cypress/support/commands -name "*.js"
```

---

## 📚 Related Documentation

- [CLAUDE.md](CLAUDE.md) - Project testing standards
- [cypress/CYPRESS-TESTING-STANDARDS.md](cypress/CYPRESS-TESTING-STANDARDS.md) - Testing guidelines
- [cypress/support/commands/README.md](cypress/support/commands/README.md) - Command reference
- [cypress/docs/cypress-best-practices.md](cypress/docs/cypress-best-practices.md) - Best practices

---

**Next Steps:** Review this analysis and prioritize fixes based on your project timeline.
