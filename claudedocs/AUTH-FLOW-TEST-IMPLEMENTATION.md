# Authentication Flow - Test Implementation Plan

**Quality Engineer**: Detailed test implementation for Phase 1 (P0)
**Version**: 1.0
**Date**: 2025-10-06
**Status**: Implementation Ready
**Parent Plan**: [E2E-TEST-PLAN.md](./E2E-TEST-PLAN.md)

---

## Table of Contents

1. [Overview](#overview)
2. [Test Suite Structure](#test-suite-structure)
3. [Test File Specifications](#test-file-specifications)
4. [Data Fixtures & Seeds](#data-fixtures--seeds)
5. [Custom Commands](#custom-commands)
6. [Implementation Sequence](#implementation-sequence)

---

## Overview

### Scope

Implement comprehensive E2E tests for the Authentication Flow covering:

- Sign-up with new account
- Sign-in with existing credentials
- Remember me functionality
- Forgot password flow
- Sign-out and session cleanup

### Success Criteria

- ✅ 8-10 test cases covering critical auth paths
- ✅ All edge cases identified in E2E Test Plan
- ✅ <60 seconds execution time for auth suite
- ✅ Zero flaky tests (run 10x without failure)
- ✅ Docker compatible

### Available Test IDs (from LoginScreen.tsx)

Based on analysis of `src/screens/LoginScreen.tsx`:

```typescript
// Tab Navigation
'signin-tab-button';
'signup-tab-button';

// Form Inputs
'email-input';
'password-input';
'confirm-password-input';
'forgot-password-email-input';

// Interactive Elements
'submit-button';
'remember-me-switch';
'forgot-password-link';
'send-reset-link-button';
'close-forgot-password-button';

// Status/Feedback
'error-container';
```

---

## Test Suite Structure

### Directory Organization

```
cypress/e2e/authentication/
├── signup-flow.cy.ts          (4 tests - ~30s)
├── signin-flow.cy.ts           (3 tests - ~20s)
├── session-management.cy.ts    (3 tests - ~25s)
└── password-recovery.cy.ts     (2 tests - ~15s)

Total: 12 tests (~90 seconds)
```

### Test Execution Order

**Sequential Priority** (for CI/CD optimization):

1. `signin-flow.cy.ts` - Most critical, fastest
2. `signup-flow.cy.ts` - Account creation dependency
3. `session-management.cy.ts` - Depends on signin
4. `password-recovery.cy.ts` - Independent, can run parallel

---

## Test File Specifications

### 1. signup-flow.cy.ts (4 tests)

**Purpose**: Validate new user registration with edge cases

**Test Cases**:

#### Test 1.1: Successful Sign-Up (Happy Path)

```typescript
it('should successfully create new account with valid data', () => {
  // Arrange: Visit login page in signup mode
  cy.visit('/');
  cy.get('[data-cy="signup-tab-button"]').click();

  // Act: Fill form with valid data
  cy.get('[data-cy="email-input"]').type('newuser@test.com');
  cy.get('[data-cy="password-input"]').type('Test123!@#');
  cy.get('[data-cy="confirm-password-input"]').type('Test123!@#');
  cy.get('[data-cy="submit-button"]').click();

  // Assert: Account created, navigated to projects
  cy.url().should('include', '/projects');

  // Verify alert message (if applicable)
  // cy.contains('Account Created!').should('be.visible');
});
```

**Edge Cases**:

- Email validation (invalid format)
- Password length requirements (<6 chars)
- Password mismatch
- Duplicate account creation

#### Test 1.2: Prevent Duplicate Email Registration

```typescript
it('should prevent duplicate email registration', () => {
  // Arrange: Create user first (seed data)
  cy.task('seedUser', {
    email: 'existing@test.com',
    password: 'Exist123!@#',
  });

  // Act: Try to register with same email
  cy.visit('/');
  cy.get('[data-cy="signup-tab-button"]').click();
  cy.get('[data-cy="email-input"]').type('existing@test.com');
  cy.get('[data-cy="password-input"]').type('NewPass123!@#');
  cy.get('[data-cy="confirm-password-input"]').type('NewPass123!@#');
  cy.get('[data-cy="submit-button"]').click();

  // Assert: Error message displayed
  cy.get('[data-cy="error-container"]')
    .should('be.visible')
    .and('contain', 'already registered');
});
```

#### Test 1.3: Validate Password Requirements

```typescript
it('should validate password requirements', () => {
  cy.visit('/');
  cy.get('[data-cy="signup-tab-button"]').click();
  cy.get('[data-cy="email-input"]').type('test@test.com');

  // Test: Password too short
  cy.get('[data-cy="password-input"]').type('12345');
  cy.get('[data-cy="confirm-password-input"]').type('12345');
  cy.get('[data-cy="submit-button"]').click();

  cy.get('[data-cy="error-container"]')
    .should('be.visible')
    .and('contain', 'at least 6 characters');
});
```

#### Test 1.4: Validate Password Match

```typescript
it('should require password confirmation to match', () => {
  cy.visit('/');
  cy.get('[data-cy="signup-tab-button"]').click();
  cy.get('[data-cy="email-input"]').type('test@test.com');
  cy.get('[data-cy="password-input"]').type('Test123!@#');
  cy.get('[data-cy="confirm-password-input"]').type('Different123!@#');
  cy.get('[data-cy="submit-button"]').click();

  cy.get('[data-cy="error-container"]')
    .should('be.visible')
    .and('contain', 'do not match');
});
```

---

### 2. signin-flow.cy.ts (3 tests)

**Purpose**: Validate existing user authentication

**Test Cases**:

#### Test 2.1: Successful Sign-In (Happy Path)

```typescript
it('should successfully sign in with valid credentials', () => {
  // Arrange: Seed authenticated user
  cy.task('seedUser', {
    email: 'valid@test.com',
    password: 'Valid123!@#',
  });

  // Act: Sign in
  cy.visit('/');
  cy.get('[data-cy="signin-tab-button"]').should(
    'have.attr',
    'aria-selected',
    'true',
  ); // Already on signin
  cy.get('[data-cy="email-input"]').type('valid@test.com');
  cy.get('[data-cy="password-input"]').type('Valid123!@#');
  cy.get('[data-cy="submit-button"]').click();

  // Assert: Redirected to projects
  cy.url().should('include', '/projects');

  // Verify auth state persisted
  cy.window()
    .its('localStorage')
    .invoke('getItem', 'authToken')
    .should('exist');
});
```

#### Test 2.2: Reject Invalid Credentials

```typescript
it('should reject invalid credentials', () => {
  cy.visit('/');

  // Test: Wrong password
  cy.get('[data-cy="email-input"]').type('user@test.com');
  cy.get('[data-cy="password-input"]').type('WrongPassword123');
  cy.get('[data-cy="submit-button"]').click();

  // Assert: Error displayed, stay on login page
  cy.get('[data-cy="error-container"]')
    .should('be.visible')
    .and('contain', /invalid|incorrect|wrong/i);

  cy.url().should('not.include', '/projects');
});
```

#### Test 2.3: Persist Session with "Remember Me"

```typescript
it('should persist session with "remember me" enabled', () => {
  // Arrange: Seed user
  cy.task('seedUser', {
    email: 'remember@test.com',
    password: 'Remember123!@#',
  });

  // Act: Sign in with remember me
  cy.visit('/');
  cy.get('[data-cy="email-input"]').type('remember@test.com');
  cy.get('[data-cy="password-input"]').type('Remember123!@#');
  cy.get('[data-cy="remember-me-switch"]').click(); // Enable
  cy.get('[data-cy="submit-button"]').click();

  // Assert: Auth persisted after reload
  cy.url().should('include', '/projects');
  cy.reload();
  cy.url().should('include', '/projects'); // Still authenticated
});
```

---

### 3. session-management.cy.ts (3 tests)

**Purpose**: Validate session persistence and multi-tab synchronization

**Test Cases**:

#### Test 3.1: Maintain Session Across Page Reload

```typescript
it('should maintain session across page reload', () => {
  // Arrange: Create authenticated session
  cy.session('testUser', () => {
    cy.task('seedUser', {
      email: 'session@test.com',
      password: 'Session123!@#',
    });
    cy.visit('/');
    cy.get('[data-cy="email-input"]').type('session@test.com');
    cy.get('[data-cy="password-input"]').type('Session123!@#');
    cy.get('[data-cy="submit-button"]').click();
    cy.url().should('include', '/projects');
  });

  // Act: Visit protected page
  cy.visit('/projects');

  // Assert: No redirect to login
  cy.url().should('include', '/projects');
  cy.get('[data-cy="project-list"]').should('be.visible');

  // Reload and verify still authenticated
  cy.reload();
  cy.url().should('include', '/projects');
});
```

#### Test 3.2: Handle Session Timeout Gracefully

```typescript
it('should handle session timeout gracefully', () => {
  // Arrange: Create session with short expiry
  cy.session('expiredUser', () => {
    cy.task('seedUser', {
      email: 'expired@test.com',
      password: 'Expired123!@#',
    });
    cy.visit('/');
    cy.get('[data-cy="email-input"]').type('expired@test.com');
    cy.get('[data-cy="password-input"]').type('Expired123!@#');
    cy.get('[data-cy="submit-button"]').click();
  });

  // Act: Simulate token expiry
  cy.window().then(win => {
    win.localStorage.removeItem('authToken');
  });

  // Try to access protected resource
  cy.visit('/projects');

  // Assert: Redirected to login
  cy.url().should('not.include', '/projects');
  cy.url().should('eq', Cypress.config('baseUrl') + '/');
});
```

#### Test 3.3: Synchronize Auth State Across Tabs

```typescript
it('should synchronize auth state across tabs', () => {
  // Note: This test simulates multi-tab behavior
  // Arrange: Sign in
  cy.task('seedUser', {
    email: 'multitab@test.com',
    password: 'Multi123!@#',
  });

  cy.visit('/');
  cy.get('[data-cy="email-input"]').type('multitab@test.com');
  cy.get('[data-cy="password-input"]').type('Multi123!@#');
  cy.get('[data-cy="submit-button"]').click();
  cy.url().should('include', '/projects');

  // Act: Simulate logout in another tab (via localStorage event)
  cy.window().then(win => {
    win.localStorage.removeItem('authToken');
    win.dispatchEvent(
      new StorageEvent('storage', {
        key: 'authToken',
        oldValue: 'some-token',
        newValue: null,
        storageArea: win.localStorage,
      }),
    );
  });

  // Assert: Current tab reacts to auth change
  // This depends on implementation - may redirect or show logged-out state
  cy.wait(1000); // Brief wait for event propagation
  cy.url().should('not.include', '/projects');
});
```

---

### 4. password-recovery.cy.ts (2 tests)

**Purpose**: Validate forgot password workflow

**Test Cases**:

#### Test 4.1: Send Password Reset Email

```typescript
it('should send password reset email for valid email', () => {
  // Arrange: Seed user
  cy.task('seedUser', {
    email: 'forgot@test.com',
    password: 'Forgot123!@#',
  });

  // Act: Trigger forgot password
  cy.visit('/');
  cy.get('[data-cy="forgot-password-link"]').click();

  // Verify forgot password modal/form visible
  cy.get('[data-cy="forgot-password-email-input"]').should('be.visible');

  cy.get('[data-cy="forgot-password-email-input"]').type('forgot@test.com');
  cy.get('[data-cy="send-reset-link-button"]').click();

  // Assert: Success message (may be alert or toast)
  // Note: Implementation may use Alert.alert() - verify success state
  cy.wait(500); // Wait for alert (if shown)

  // Verify form closes or success message shown
  // This depends on LoginScreen implementation
});
```

#### Test 4.2: Validate Email Before Sending Reset

```typescript
it('should validate email format before sending reset', () => {
  cy.visit('/');
  cy.get('[data-cy="forgot-password-link"]').click();

  // Test: Invalid email format
  cy.get('[data-cy="forgot-password-email-input"]').type('invalid-email');
  cy.get('[data-cy="send-reset-link-button"]').click();

  // Assert: Error shown (may be alert or inline error)
  // Check for alert or error message
  cy.wait(500);

  // Verify form still visible (not closed)
  cy.get('[data-cy="forgot-password-email-input"]').should('be.visible');
});
```

---

## Data Fixtures & Seeds

### User Fixtures

Create `cypress/fixtures/users.json`:

```json
{
  "validUser": {
    "email": "valid@test.com",
    "password": "Valid123!@#",
    "id": "user-valid-001"
  },
  "newUser": {
    "email": "newuser@test.com",
    "password": "Test123!@#",
    "id": "user-new-001"
  },
  "existingUser": {
    "email": "existing@test.com",
    "password": "Exist123!@#",
    "id": "user-exist-001"
  },
  "rememberUser": {
    "email": "remember@test.com",
    "password": "Remember123!@#",
    "id": "user-remember-001"
  },
  "sessionUser": {
    "email": "session@test.com",
    "password": "Session123!@#",
    "id": "user-session-001"
  },
  "expiredUser": {
    "email": "expired@test.com",
    "password": "Expired123!@#",
    "id": "user-expired-001"
  },
  "multiTabUser": {
    "email": "multitab@test.com",
    "password": "Multi123!@#",
    "id": "user-multitab-001"
  },
  "forgotUser": {
    "email": "forgot@test.com",
    "password": "Forgot123!@#",
    "id": "user-forgot-001"
  }
}
```

### Seeding Strategy

**Option A: API Seeding** (PREFERRED - Fast)

```typescript
// cypress/support/seedHelpers.ts
export const seedUser = userData => {
  return cy.request({
    method: 'POST',
    url: '/api/seed/user',
    body: userData,
    failOnStatusCode: false,
  });
};
```

**Option B: cy.task() Seeding** (If no API available)

```typescript
// cypress/support/tasks/seedUser.js
module.exports = userData => {
  // Direct database insertion
  const { Pool } = require('pg');
  const pool = new Pool({
    /* Supabase connection */
  });

  return pool.query(
    'INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)',
    [userData.id, userData.email, hashPassword(userData.password)],
  );
};
```

**Option C: Supabase Admin API** (Recommended for this project)

```typescript
// cypress/support/seedHelpers.ts
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  Cypress.env('SUPABASE_URL'),
  Cypress.env('SUPABASE_SERVICE_KEY'), // Service role key
);

export const seedUser = async userData => {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: userData.email,
    password: userData.password,
    email_confirm: true,
    user_metadata: { id: userData.id },
  });

  if (error) throw error;
  return data;
};
```

---

## Custom Commands

### Authentication Custom Commands

Create `cypress/support/authCommands.ts`:

```typescript
// ! Custom command for authenticated session
Cypress.Commands.add('loginAs', (userFixture: string) => {
  cy.fixture('users').then(users => {
    const user = users[userFixture];

    cy.session(
      user.email,
      () => {
        cy.task('seedUser', user);
        cy.visit('/');
        cy.get('[data-cy="email-input"]').type(user.email);
        cy.get('[data-cy="password-input"]').type(user.password);
        cy.get('[data-cy="submit-button"]').click();
        cy.url().should('include', '/projects');
      },
      {
        validate: () => {
          cy.window()
            .its('localStorage')
            .invoke('getItem', 'authToken')
            .should('exist');
        },
      },
    );
  });
});

// ! Custom command for logout
Cypress.Commands.add('logout', () => {
  cy.window().then(win => {
    win.localStorage.removeItem('authToken');
    win.localStorage.removeItem('authUser');
  });
  cy.visit('/');
});

// ! Custom command for checking auth state
Cypress.Commands.add('shouldBeAuthenticated', () => {
  cy.url().should('include', '/projects');
  cy.window()
    .its('localStorage')
    .invoke('getItem', 'authToken')
    .should('exist');
});

Cypress.Commands.add('shouldNotBeAuthenticated', () => {
  cy.url().should('not.include', '/projects');
  cy.window()
    .its('localStorage')
    .invoke('getItem', 'authToken')
    .should('not.exist');
});
```

### TypeScript Declarations

Add to `cypress/support/index.d.ts`:

```typescript
declare namespace Cypress {
  interface Chainable {
    /**
     * Login as a specific user fixture
     * @param userFixture - Key from users.json fixture
     */
    loginAs(userFixture: string): Chainable<void>;

    /**
     * Logout current user
     */
    logout(): Chainable<void>;

    /**
     * Assert user is authenticated
     */
    shouldBeAuthenticated(): Chainable<void>;

    /**
     * Assert user is NOT authenticated
     */
    shouldNotBeAuthenticated(): Chainable<void>;
  }
}
```

---

## Implementation Sequence

### Week 1: Foundation (Days 1-3)

**Day 1: Setup & Infrastructure**

- ✅ Create test fixtures (`users.json`)
- ✅ Implement seeding strategy (Supabase Admin API)
- ✅ Create custom commands (`authCommands.ts`)
- ✅ Test infrastructure with simple smoke test

**Day 2: Critical Path Tests**

- ✅ Implement `signin-flow.cy.ts` (3 tests)
  - Test 2.1: Successful sign-in ⭐
  - Test 2.2: Reject invalid credentials
  - Test 2.3: Remember me persistence
- ✅ Run tests 10x to verify no flakiness

**Day 3: Sign-Up Flow**

- ✅ Implement `signup-flow.cy.ts` (4 tests)
  - Test 1.1: Successful sign-up ⭐
  - Test 1.2: Prevent duplicate email
  - Test 1.3: Password validation
  - Test 1.4: Password match validation
- ✅ Run full auth suite (7 tests)

### Week 2: Advanced Scenarios (Days 4-5)

**Day 4: Session Management**

- ✅ Implement `session-management.cy.ts` (3 tests)
  - Test 3.1: Session persistence
  - Test 3.2: Session timeout
  - Test 3.3: Multi-tab sync
- ✅ Run full suite (10 tests)

**Day 5: Password Recovery + Polish**

- ✅ Implement `password-recovery.cy.ts` (2 tests)
  - Test 4.1: Send reset email
  - Test 4.2: Email validation
- ✅ Final suite run (12 tests)
- ✅ Documentation and cleanup

### Week 2 End: Validation & CI/CD

**Validation Checklist**:

- [ ] All 12 tests passing consistently
- [ ] Execution time <90 seconds (target: 60s)
- [ ] Zero flaky tests (10 consecutive runs)
- [ ] Docker compatibility verified
- [ ] CI/CD pre-commit gate updated

---

## Testing Best Practices (Reminders)

### Mandatory Test Structure

Every test file MUST follow this template:

```typescript
/// <reference types="cypress" />

describe('[Feature Name]', () => {
  // ! MANDATORY: Must be first
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.comprehensiveDebugWithBuildCapture();
    cy.comprehensiveDebug();
  });

  // Optional: Additional setup
  beforeEach(() => {
    // Seed data, setup session, etc.
  });

  // Optional: Failure capture
  afterEach(function () {
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

  it('should [expected behavior]', () => {
    // Test implementation
  });
});
```

### Three Golden Rules

1. **Only `data-cy` Selectors**

   ```typescript
   // ✅ CORRECT
   cy.get('[data-cy="submit-button"]');

   // ❌ WRONG
   cy.get('.btn-submit');
   cy.get('#submit');
   ```

2. **Relative URLs Only**

   ```typescript
   // ✅ CORRECT
   cy.visit('/');
   cy.visit('/projects');

   // ❌ WRONG
   cy.visit('http://localhost:3002/');
   ```

3. **No Arbitrary Waits**

   ```typescript
   // ✅ CORRECT
   cy.get('[data-cy="element"]').should('be.visible');

   // ❌ WRONG
   cy.wait(2000);
   ```

---

## Success Metrics

### Coverage Targets

- **Critical Paths**: 100% (signin, signup)
- **Edge Cases**: 80% (validations, errors)
- **Session Management**: 100% (persistence, timeout)
- **Password Recovery**: 100% (reset flow)

### Performance Targets

- **Individual Test**: <10 seconds
- **Suite Execution**: <90 seconds (target: 60s)
- **CI/CD Pre-Commit**: <60 seconds (3-5 critical tests)

### Quality Targets

- **Flakiness**: 0% (10 consecutive runs without failure)
- **False Positives**: 0%
- **Docker Compatibility**: 100%

---

## Next Steps

### Immediate Actions

1. ✅ Review this implementation plan
2. ⏳ Set up Supabase seeding (Admin API or cy.task)
3. ⏳ Create user fixtures
4. ⏳ Implement custom auth commands
5. ⏳ Begin Day 1 implementation

### Questions to Resolve

**Q1**: Does Supabase service key exist in cypress.env.json?

- **If Yes**: Use Supabase Admin API for seeding
- **If No**: Request key or use cy.task() with direct DB access

**Q2**: Are there existing API endpoints for user seeding?

- **If Yes**: Use cy.request() for fast seeding
- **If No**: Implement Supabase Admin API approach

**Q3**: How is session timeout handled in the app?

- **Check**: `src/store/authStore.ts` for timeout logic
- **Adapt**: Test 3.2 based on actual implementation

---

## Appendix

### References

- [E2E-TEST-PLAN.md](./E2E-TEST-PLAN.md) - Parent test plan
- [CYPRESS-COMPLETE-REFERENCE.md](./CYPRESS-COMPLETE-REFERENCE.md) - Complete Cypress guide
- [QUICK-TEST-REFERENCE.md](../cypress/docs/QUICK-TEST-REFERENCE.md) - Test template
- [verify-login-page.cy.ts](../cypress/e2e/login-page-tests/verify-login-page.cy.ts) - Existing test pattern

### Test ID Reference

Complete list from `LoginScreen.tsx`:

```typescript
// Navigation
'signin-tab-button';
'signup-tab-button';

// Form Inputs
'email-input';
'password-input';
'confirm-password-input';

// Actions
'submit-button';
'remember-me-switch';
'forgot-password-link';

// Password Recovery
'forgot-password-email-input';
'send-reset-link-button';
'close-forgot-password-button';

// Feedback
'error-container';
```

---

**Document Owner**: Quality Engineer Persona
**Review Cycle**: Daily during implementation
**Last Updated**: 2025-10-06
**Status**: ✅ Ready for Implementation
