# Cypress Cleanup - Quick Summary

**Total Issues**: 522 (435 errors, 87 warnings)
**Recommended Fix**: Phase 1 & 2 only (~122 issues)
**Skip**: Archived tests (~400 issues)

---

## 🎯 Quick Plan

### ✅ Phase 1: Fix Active Tests (30-60 min)

- 6 files in `cypress/reference/`
- 22 errors (mostly data-cy selectors)
- **HIGH PRIORITY**

### ✅ Phase 2: Fix Support Utilities (45-90 min)

- 10 files in `cypress/support/`
- ~100 errors (selectors + TypeScript)
- **HIGH PRIORITY**

### ⏭️ Phase 3: Support Commands (2-3 hrs)

- `cypress/support/commands/`
- ~200 errors
- **MEDIUM PRIORITY** (defer if time-constrained)

### ⏭️ Phase 4: Archived Tests (8-12 hrs)

- `cypress/archive/`
- ~380 errors
- **SKIP** (deprecated code)

---

## 🔧 Common Fixes

### 1. Data-Cy Selectors (~380 instances)

```typescript
// Wrong
cy.get('.button').click();

// Right
cy.get('[data-cy="button"]').click();
```

### 2. Unsafe Chains (~8 instances)

```typescript
// Wrong
cy.get('[data-cy="input"]').type('text').should('have.value', 'text');

// Right
cy.get('[data-cy="input"]').type('text');
cy.get('[data-cy="input"]').should('have.value', 'text');
```

### 3. Remove Waits (~4 instances)

```typescript
// Wrong
cy.wait(2000);

// Right
cy.get('[data-cy="element"]').should('be.visible');
```

---

## 📋 Quick Execution

```bash
# Start cleanup branch
git checkout -b cypress-cleanup

# Phase 1: Fix reference tests
# (Fix 6 files with selector issues)
npm run lint:cypress
npm run cypress:run
git commit -m "fix(cypress): resolve lint errors in reference tests"

# Phase 2: Fix support utilities
# (Fix test-utils.ts, accessibility-utils.ts, etc.)
npm run lint:cypress
npm run cypress:run
git commit -m "fix(cypress): resolve lint errors in support utilities"

# Verify all good
npm run lint:cypress
```

---

## ⚠️ Important

- ❌ **DON'T modify**: `cypress/e2e/login-page-tests/verify-login-page.cy.ts` (protected!)
- ❌ **DON'T bulk-fix**: `cypress/archive/` (deprecated)
- ✅ **DO test**: After each phase
- ✅ **DO commit**: Incrementally

---

**Full Details**: See [CYPRESS-CLEANUP-PLAN.md](./CYPRESS-CLEANUP-PLAN.md)
