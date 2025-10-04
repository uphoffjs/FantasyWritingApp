# Cypress Best Practices Audit Report

**Date**: 2025-09-27
**Auditor**: Claude Code Assistant
**Status**: 🟡 Needs Improvement

## Executive Summary

An audit of the Cypress E2E tests revealed several violations of Cypress best practices that need to be addressed. While the overall test structure is good (component tests archived, page objects implemented), there are specific issues that should be fixed to ensure reliable and maintainable tests.

## 🔴 Critical Issues Found

### 1. Arbitrary Waits

**Severity**: High
**Files Affected**: 5 files
**Issue**: Using `cy.wait()` with fixed milliseconds

**Violations Found**:

```javascript
// cypress/e2e/scenes/scene-editor.cy.ts
cy.wait(1000); // Wait for auto-save

// cypress/e2e/elements/character-creation.cy.js
cy.wait(3000);

// cypress/e2e/stories/story-crud.cy.ts
cy.wait(2000);
```

**Fix Required**:

```javascript
// ❌ BAD - Arbitrary wait
cy.wait(3000);

// ✅ GOOD - Wait for specific condition
cy.get('[data-cy="save-indicator"]').should('contain', 'Saved');

// ✅ GOOD - Wait for API call
cy.intercept('POST', '/api/save').as('saveRequest');
cy.wait('@saveRequest');
```

### 2. Selector Issues

**Severity**: Medium
**Issue**: Need to verify all selectors use `data-cy` attributes

**Recommendation**: Run selector audit to ensure compliance

## 🟡 Medium Priority Issues

### 3. Test Independence

**Status**: ✅ Mostly Good
**Finding**: Tests use `beforeEach` for setup and clean state before tests

### 4. Session Management

**Status**: ✅ Good
**Finding**: Proper use of `cy.session()` in auth tests

### 5. Component Testing in E2E

**Status**: ✅ Resolved
**Finding**: Component tests have been properly archived

## 🟢 Best Practices Followed

### ✅ Proper Test Structure

- Component tests archived
- E2E tests focused on user journeys
- Page object pattern implemented
- Test data factories created

### ✅ Clean State Management

- Tests clean state BEFORE, not after
- Proper use of `beforeEach` hooks
- Session management implemented

### ✅ Data Management

- Test user management implemented
- Fixture files and factories available
- Database seeding patterns documented

## 📋 Action Items

### Immediate (Priority 1)

1. **Remove all arbitrary waits**

   - [ ] Fix scene-editor.cy.ts waits
   - [ ] Fix character-creation.cy.js waits
   - [ ] Fix story-crud.cy.ts waits
   - [ ] Replace with proper assertions or intercepts

2. **Create wait utility functions**

   ```javascript
   // cypress/support/commands/wait-helpers.js
   Cypress.Commands.add('waitForAutoSave', () => {
     cy.get('[data-cy="save-status"]').should('contain', 'Saved');
   });

   Cypress.Commands.add('waitForLoad', () => {
     cy.get('[data-cy="loading"]').should('not.exist');
   });
   ```

### Short-term (Priority 2)

3. **Audit all selectors**

   - [ ] Ensure all use `data-cy` attributes
   - [ ] Remove any class or ID selectors
   - [ ] Update page objects if needed

4. **Add intercept patterns**
   ```javascript
   // Setup common intercepts
   cy.intercept('POST', '/api/*').as('apiPost');
   cy.intercept('GET', '/api/*').as('apiGet');
   ```

### Long-term (Priority 3)

5. **Performance optimization**

   - [ ] Implement parallel test execution
   - [ ] Add test timing reports
   - [ ] Optimize slow tests

6. **Documentation**
   - [ ] Update test writing guide
   - [ ] Create anti-pattern examples
   - [ ] Add to PR checklist

## 📊 Metrics

### Current State

- **Total E2E Tests**: ~30 test files
- **Arbitrary Waits Found**: 5 instances
- **Average Test Duration**: Unknown (needs measurement)
- **Flaky Tests**: Unknown (needs tracking)

### Target State

- **Arbitrary Waits**: 0
- **Test Success Rate**: >99%
- **Average Duration**: <30 seconds per test
- **Flaky Tests**: 0

## 🛠️ Enforcement Script

```bash
#!/bin/bash
# cypress-lint.sh - Check for Cypress anti-patterns

echo "🔍 Checking for Cypress anti-patterns..."

# Check for arbitrary waits
WAITS=$(grep -r "cy.wait([0-9]" cypress/e2e/ | wc -l)
if [ $WAITS -gt 0 ]; then
  echo "❌ Found $WAITS arbitrary waits"
  grep -r "cy.wait([0-9]" cypress/e2e/
  exit 1
fi

# Check for bad selectors
BAD_SELECTORS=$(grep -r "cy.get(['\"]\\." cypress/e2e/ | wc -l)
if [ $BAD_SELECTORS -gt 0 ]; then
  echo "❌ Found $BAD_SELECTORS class selectors"
  exit 1
fi

echo "✅ All checks passed!"
```

## 🔧 Fix Templates

### Template 1: Replace Arbitrary Wait with Assertion

```javascript
// Before
cy.get('[data-cy="save-button"]').click();
cy.wait(2000); // Wait for save

// After
cy.get('[data-cy="save-button"]').click();
cy.get('[data-cy="save-status"]').should('contain', 'Saved');
```

### Template 2: Replace Wait with Intercept

```javascript
// Before
cy.get('[data-cy="submit"]').click();
cy.wait(3000); // Wait for API

// After
cy.intercept('POST', '/api/submit').as('submitRequest');
cy.get('[data-cy="submit"]').click();
cy.wait('@submitRequest');
```

### Template 3: Replace Wait with Custom Command

```javascript
// Before
cy.visit('/page');
cy.wait(1000); // Wait for page load

// After
cy.visit('/page');
cy.get('[data-cy="page-loaded"]').should('be.visible');
// OR
cy.waitForPageLoad(); // Custom command
```

## 📝 Best Practices Checklist

For every test, ensure:

- [ ] No `cy.wait()` with milliseconds
- [ ] All selectors use `data-cy`
- [ ] Test is independent (can run alone)
- [ ] State cleaned BEFORE test, not after
- [ ] Uses page objects for common interactions
- [ ] Has meaningful test description
- [ ] Uses proper assertions
- [ ] Handles async operations correctly

## 🚀 Next Steps

1. **Immediate**: Fix the 5 arbitrary waits found
2. **This Sprint**: Implement wait helper commands
3. **Next Sprint**: Full selector audit
4. **Ongoing**: Monitor for new violations

## 📚 References

- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Cypress Anti-Patterns](https://docs.cypress.io/guides/references/anti-patterns)
- [Effective Waiting Strategies](https://docs.cypress.io/guides/guides/network-requests)

---

**Recommendation**: Address Priority 1 items immediately to improve test reliability. The arbitrary waits are likely causing intermittent test failures and should be replaced with proper assertions or network intercepts.
