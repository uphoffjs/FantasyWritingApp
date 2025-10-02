# Cypress Test Quick Reference - FantasyWritingApp

**Use this file for rapid test creation. For detailed explanations, see the full documentation.**

---

## 🚨 MANDATORY TEMPLATE - Copy This for Every Test File

```typescript
// cypress/e2e/[feature]/[test-name].cy.ts
describe('Feature Name', () => {
  // ! MANDATORY: Must be first hook in every describe()
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.comprehensiveDebugWithBuildCapture();
    cy.comprehensiveDebug();
  });

  // Optional: Additional setup
  beforeEach(() => {
    // Auth, navigation, fixtures, etc.
  });

  // Optional: Failure capture
  afterEach(function () {
    if (this.currentTest?.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

  it('test description', () => {
    // Test implementation
  });

  it('another test', () => {
    // Another test
  });
});
```

---

## ⚡ Three Golden Rules

1. **ONE `describe()` per file** - Split features into separate files
2. **MANDATORY `beforeEach()` first** - Clear cookies/storage + debug
3. **Multiple `it()` tests OK** - Group related tests together

---

## ✅ DO

- Use `describe()` and `it()` ONLY (no `context()` or `specify()`)
- Use `data-cy` attributes: `cy.get('[data-cy="button-name"]')`
- Use `cy.session()` for auth (faster)
- Clean state in `beforeEach()` (not `afterEach()`)
- Use relative URLs: `cy.visit('/login')` (uses baseUrl)

---

## ❌ DON'T

- Multiple `describe()` blocks in one file
- Skip mandatory `beforeEach()` cleanup
- Use `context()` or `specify()`
- Use CSS selectors, IDs, or classes
- Use `cy.wait()` (use assertions instead)
- Use if/else conditionals in tests
- Assign Cypress commands to variables
- Create dependent tests
- Hardcode `localhost` URLs
- Commit with `.only()` or `.skip()`

---

## 🔥 Common Patterns

### Authentication

```typescript
beforeEach(() => {
  cy.session(
    'user',
    () => {
      cy.visit('/login');
      cy.get('[data-cy="email-input"]').type('test@example.com');
      cy.get('[data-cy="password-input"]').type('password123');
      cy.get('[data-cy="login-button"]').click();
    },
    {
      validate() {
        cy.getCookie('auth-token').should('exist');
      },
    },
  );
  cy.visit('/target-page');
});
```

### With Fixtures

```typescript
beforeEach(() => {
  cy.fixture('elements.json').as('elementsData');
});

it('uses fixture', function () {
  this.elementsData.forEach(element => {
    // Use element data
  });
});
```

### With Custom Commands

```typescript
beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.comprehensiveDebugWithBuildCapture();
  cy.comprehensiveDebug();
  cy.login('test@example.com', 'password123'); // Custom command
});
```

---

## 🎯 Selectors

```typescript
// ✅ CORRECT
cy.get('[data-cy="submit-button"]');
cy.get('[data-cy="email-input"]');
cy.get('[data-cy="error-message"]');

// ❌ WRONG
cy.get('.btn-primary'); // CSS class
cy.get('#submitBtn'); // ID
cy.get('button'); // Tag
cy.contains('Submit'); // Text (use data-cy)
```

---

## 📦 Assertions

```typescript
// Visibility
cy.get('[data-cy="element"]').should('be.visible');
cy.get('[data-cy="element"]').should('not.exist');

// Content
cy.get('[data-cy="title"]').should('contain', 'Expected Text');
cy.get('[data-cy="input"]').should('have.value', 'text');

// State
cy.get('[data-cy="checkbox"]').should('be.checked');
cy.get('[data-cy="button"]').should('be.disabled');
cy.get('[data-cy="link"]').should('have.attr', 'href', '/path');

// URL
cy.url().should('include', '/dashboard');
cy.url().should('eq', 'http://localhost:3002/expected-path');
```

---

## 🏃 Running Tests

```bash
# Single test file (RECOMMENDED for development)
SPEC=cypress/e2e/login-page/verify-login-page.cy.ts npm run cypress:run:spec
SPEC=cypress/e2e/login-page/verify-login-page.cy.ts npm run cypress:open:spec

# All tests
npm run cypress:open  # Interactive
npm run cypress:run   # Headless

# Docker (macOS Sequoia)
npm run cypress:docker:test
SPEC=path/to/test.cy.ts npm run cypress:docker:test:spec
```

---

## 🐛 Debugging

```typescript
// Check values
cy.log('Debug message');
cy.debug(); // Debugger breakpoint

// Inspect elements
cy.get('[data-cy="element"]').then($el => {
  console.log($el);
});

// Network requests
cy.intercept('POST', '/api/endpoint').as('apiCall');
cy.wait('@apiCall').its('response.statusCode').should('eq', 200);
```

---

## 📝 TypeScript Types

```typescript
import type { ElementCategory, WorldElement } from '../../../src/types';

describe('Typed Test', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.comprehensiveDebugWithBuildCapture();
    cy.comprehensiveDebug();
  });

  it('uses types', () => {
    const element: Partial<WorldElement> = {
      name: 'Test',
      type: 'character' as ElementCategory,
    };
    // Use typed data
  });
});
```

---

## 🚀 Quick Command Reference

```bash
# Test Execution
npm run web                    # Start dev server (port 3002)
npm run cypress:open          # Open Cypress UI
npm run test:e2e              # Run all E2E tests
npm run lint                  # MUST RUN before commits

# Single Test Execution
SPEC=path/to/test.cy.ts npm run cypress:run:spec    # Run single test
SPEC=path/to/test.cy.ts npm run cypress:open:spec   # Open single test

# Docker (macOS Sequoia only)
npm run cypress:docker:test   # All tests with auto-server
```

---

## ⚠️ Pre-Commit Checklist

- [ ] Only ONE `describe()` block per file
- [ ] Mandatory `beforeEach()` cleanup hook is first
- [ ] Using only `describe()` and `it()` (no `context()` or `specify()`)
- [ ] All selectors use `data-cy` attributes
- [ ] No `.only()` or `.skip()` in code
- [ ] No hardcoded `localhost` URLs (use relative paths)
- [ ] `npm run lint` passes
- [ ] Tests run and pass locally

---

## 📚 Full Documentation

**For detailed explanations, see:**

- [cypress-writing-organizing-tests.md](./cypress-writing-organizing-tests.md) - Complete test structure guide
- [cypress-best-practices.md](./cypress-best-practices.md) - Comprehensive best practices
- [CLAUDE.md](../../CLAUDE.md) - Project quick reference
- [CUSTOM-COMMANDS-REFERENCE.md](./CUSTOM-COMMANDS-REFERENCE.md) - Custom commands
- [SELECTOR-PATTERNS.md](./SELECTOR-PATTERNS.md) - Selector strategies

---

**Version**: 1.0
**Last Updated**: 2025-10-02
**For**: FantasyWritingApp Cypress Testing
