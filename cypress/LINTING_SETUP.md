# Cypress Linting Setup

## Overview
ESLint rules have been configured to enforce Cypress.io best practices automatically.

## Installation Required
To enable full Cypress linting, install the following package:

```bash
npm install --save-dev eslint-plugin-cypress
```

## Configuration Files

### 1. `.eslintrc.cypress.js`
- Dedicated Cypress ESLint configuration
- Enforces official Cypress.io best practices
- Prevents common anti-patterns

### 2. `.eslintrc.js` (Updated)
- Main ESLint config now extends Cypress rules for test files
- Applies strict rules to all `*.cy.{js,jsx,ts,tsx}` files

## Enforced Rules

### 🔴 CRITICAL Rules (Errors)
1. **No if/else statements** - Tests must be deterministic
2. **No arbitrary waits** - No `cy.wait(3000)`, use assertions instead
3. **No CSS/ID selectors** - Use `data-cy` attributes only
4. **No variable assignment** - Don't assign Cypress returns to variables
5. **No async tests** - Cypress handles async automatically

### 🟡 WARNINGS
1. **No forcing actions** - `{ force: true }` indicates bad test setup
2. **Prefer data-cy over data-testid** - Consistency across tests

## Available Scripts

```bash
# Lint all Cypress tests
npm run lint:cypress

# Auto-fix Cypress test issues
npm run lint:cypress:fix

# Lint entire project (includes Cypress)
npm run lint
```

## Pre-commit Hooks
Configured in `lint-staged`:
- Cypress test files are automatically linted on commit
- Import patterns are checked via `scripts/check-cypress-imports.js`

## IDE Integration
Most IDEs will automatically pick up the ESLint configuration. For VS Code:
1. Install ESLint extension
2. Add to `.vscode/settings.json`:
```json
{
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ]
}
```

## Common Violations and Fixes

### ❌ BAD: Using if/else
```javascript
// WRONG
if (someCondition) {
  cy.get('[data-cy="button"]').click();
}
```

### ✅ GOOD: Separate test cases
```javascript
// RIGHT
it('handles condition A', () => {
  // Test for specific condition
});

it('handles condition B', () => {
  // Test for other condition
});
```

### ❌ BAD: Arbitrary waits
```javascript
// WRONG
cy.wait(3000);
```

### ✅ GOOD: Wait for conditions
```javascript
// RIGHT
cy.get('[data-cy="loading"]').should('not.exist');
cy.get('[data-cy="content"]').should('be.visible');
```

### ❌ BAD: CSS/ID selectors
```javascript
// WRONG
cy.get('.button-class');
cy.get('#submit-button');
```

### ✅ GOOD: data-cy attributes
```javascript
// RIGHT
cy.get('[data-cy="submit-button"]');
```

## Validation

Run this command to check all Cypress tests for compliance:
```bash
npm run lint:cypress
```

Expected output when compliant:
- No errors or warnings
- All tests use data-cy selectors
- No conditional logic in tests
- No arbitrary waits

## Continuous Improvement
The linting rules will catch most violations, but always refer to:
- [Cypress.io Official Best Practices](https://docs.cypress.io/guides/references/best-practices)
- `/cypress/docs/cypress-best-practices.md`
- `/cypress/CYPRESS-TESTING-STANDARDS.md`