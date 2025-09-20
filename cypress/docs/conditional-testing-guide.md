# Cypress Conditional Testing Guide

> This document contains best practices from Cypress documentation on avoiding conditional testing anti-patterns.

## The Problem with Conditional Testing

Web applications are highly dynamic and mutable. Their state and DOM are continuously changing, making conditional testing inherently unstable and non-deterministic.

### Key Issues
1. **DOM Instability**: Web elements can change state rapidly between checks
2. **Timing Uncertainties**: Asynchronous rendering makes reliable testing difficult  
3. **Non-Deterministic Behavior**: Tests produce inconsistent results

## Core Principle

**"If you cannot accurately know the state of your application then no matter what programming idioms you have available - you cannot write 100% deterministic tests."**

## Anti-Patterns to AVOID ❌

### 1. Conditional DOM Checking
```javascript
// ❌ BAD - Never do this
cy.get('body').then(($body) => {
  if ($body.find('[data-cy="element"]').length > 0) {
    // Do something
  } else {
    // Do something else
  }
});
```

### 2. Checking Element Visibility Conditionally
```javascript
// ❌ BAD - Unreliable
cy.get('button').then(($button) => {
  if ($button.is(':visible')) {
    cy.get('button').click();
  }
});
```

### 3. Try-Catch Patterns
```javascript
// ❌ BAD - Don't use try-catch for control flow
try {
  cy.get('[data-cy="optional-element"]').click();
} catch (error) {
  // Handle missing element
}
```

### 4. Element Existence Checks
```javascript
// ❌ BAD - Race conditions
if (cy.get('[data-cy="modal"]').should('exist')) {
  // Modal exists logic
} else {
  // Modal doesn't exist logic
}
```

## Best Practices ✅

### 1. Remove the Need for Conditionals

**Strategy**: Design tests to be deterministic from the start.

```javascript
// ✅ GOOD - Set up known state
cy.cleanState();
cy.setupTestData();
cy.visit('/login');
// Now you KNOW you're on login page
cy.get('[data-cy="email-input"]').should('be.visible');
```

### 2. Use URL Parameters to Control State

```javascript
// ✅ GOOD - Control behavior via URL
cy.visit('/app?feature=enabled');
// Test with feature enabled

cy.visit('/app?feature=disabled');
// Test with feature disabled
```

### 3. Query Server State Directly

```javascript
// ✅ GOOD - Get truth from server
cy.request('/api/user/status')
  .its('body.isAuthenticated')
  .then((isAuthenticated) => {
    if (isAuthenticated) {
      cy.visit('/dashboard');
    } else {
      cy.visit('/login');
    }
  });
```

### 4. Use Data Attributes as State Indicators

```javascript
// ✅ GOOD - Reliable state indicators
cy.get('[data-state="loaded"]').should('exist');
cy.get('[data-user-role="admin"]').should('exist');
```

### 5. Force Deterministic Behavior

```javascript
// ✅ GOOD - Control application state
cy.window().then((win) => {
  // Force specific state
  win.localStorage.setItem('featureFlag', 'enabled');
});

cy.reload();
// Now test with known state
```

## Common Scenarios and Solutions

### Scenario 1: Testing Different User Roles

**❌ BAD**:
```javascript
cy.get('body').then(($body) => {
  if ($body.find('[data-cy="admin-panel"]').length > 0) {
    // Admin tests
  } else {
    // Regular user tests
  }
});
```

**✅ GOOD**:
```javascript
// Separate test files or describe blocks
describe('Admin User', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });
  
  it('sees admin panel', () => {
    cy.get('[data-cy="admin-panel"]').should('be.visible');
  });
});

describe('Regular User', () => {
  beforeEach(() => {
    cy.loginAsUser();
  });
  
  it('does not see admin panel', () => {
    cy.get('[data-cy="admin-panel"]').should('not.exist');
  });
});
```

### Scenario 2: Handling Modals/Popups

**❌ BAD**:
```javascript
cy.get('body').then(($body) => {
  if ($body.find('[data-cy="modal"]').length > 0) {
    cy.get('[data-cy="close-modal"]').click();
  }
});
```

**✅ GOOD**:
```javascript
// Option 1: Ensure modal never appears
beforeEach(() => {
  cy.window().then((win) => {
    win.localStorage.setItem('hideWelcomeModal', 'true');
  });
});

// Option 2: Separate test for modal
it('handles welcome modal', () => {
  cy.visit('/app?showWelcome=true');
  cy.get('[data-cy="modal"]').should('be.visible');
  cy.get('[data-cy="close-modal"]').click();
  cy.get('[data-cy="modal"]').should('not.exist');
});
```

### Scenario 3: Dynamic Content Loading

**❌ BAD**:
```javascript
cy.get('body').then(($body) => {
  if ($body.find('.loading').length > 0) {
    cy.wait(5000); // Arbitrary wait
  }
});
```

**✅ GOOD**:
```javascript
// Wait for specific conditions
cy.get('[data-cy="loading"]').should('not.exist');
cy.get('[data-cy="content"]').should('be.visible');

// Or intercept and wait for API
cy.intercept('GET', '/api/data').as('getData');
cy.visit('/page');
cy.wait('@getData');
cy.get('[data-cy="content"]').should('be.visible');
```

## Testing Strategies

### 1. Separate Tests for Different States
Instead of one test with conditionals, write multiple focused tests:

```javascript
describe('Authentication States', () => {
  it('redirects to login when not authenticated', () => {
    cy.clearCookies();
    cy.visit('/dashboard');
    cy.url().should('include', '/login');
  });
  
  it('shows dashboard when authenticated', () => {
    cy.login();
    cy.visit('/dashboard');
    cy.get('[data-cy="dashboard"]').should('be.visible');
  });
});
```

### 2. Use Custom Commands for State Setup
```javascript
// cypress/support/commands.ts
Cypress.Commands.add('setupAsNewUser', () => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.visit('/');
});

Cypress.Commands.add('setupAsReturningUser', () => {
  cy.setCookie('auth', 'token123');
  cy.window().then((win) => {
    win.localStorage.setItem('user', JSON.stringify({ id: 1 }));
  });
  cy.visit('/');
});
```

### 3. Intercept and Control Network Responses
```javascript
// Control what the application receives
cy.intercept('GET', '/api/feature-flags', {
  body: { showNewFeature: true }
}).as('getFlags');

cy.visit('/');
cy.wait('@getFlags');
// Now test with known feature flag state
```

## Key Takeaways

1. **Never use if/else statements** in Cypress tests
2. **Always set up known state** before testing
3. **Use separate tests** for different scenarios
4. **Control application state** through APIs, URLs, or localStorage
5. **Wait for specific conditions**, not arbitrary timeouts
6. **Make tests deterministic** by removing variability

## Remember

> "The only way to ensure your tests are 100% deterministic is to remove all variability and unknown states from your application during testing."

If you find yourself needing conditional logic in tests, it's a sign that:
- The application state is not properly controlled
- The test is trying to do too much
- The test should be split into multiple focused tests
- You need better test data setup/teardown