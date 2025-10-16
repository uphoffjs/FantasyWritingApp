# Stub-Based Testing Guide - Hybrid Approach

**Strategy**: Option 3 - Hybrid Testing (Stubbed + Integration)
**Version**: 1.0
**Date**: 2025-10-09
**Status**: Active Implementation Strategy

---

## Table of Contents

1. [Strategy Overview](#strategy-overview)
2. [Why Stubbing First?](#why-stubbing-first)
3. [How cy.intercept() Works](#how-cyintercept-works)
4. [Stub Helper Library](#stub-helper-library)
5. [Test Migration Guide](#test-migration-guide)
6. [Best Practices](#best-practices)
7. [Future Integration Path](#future-integration-path)

---

## Strategy Overview

### Hybrid Testing Approach

**Phase 1: Stubbed Tests (Current)**

- ✅ All frontend E2E tests use `cy.intercept()` to stub API calls
- ✅ Fast, reliable, no backend dependencies
- ✅ Test UI logic, validation, navigation, error handling
- ✅ **Target**: 80% test coverage, <3 minute execution

**Phase 2: Integration Tests (Future)**

- ⏳ Add real Supabase integration for critical paths
- ⏳ Run less frequently (nightly, pre-release)
- ⏳ Validate actual backend behavior
- ⏳ **Target**: 20% critical path validation, <10 minute execution

### Benefits of This Approach

| Aspect          | Stubbed Tests              | Integration Tests         |
| --------------- | -------------------------- | ------------------------- |
| **Speed**       | ⚡ Very Fast (~500ms/test) | 🐢 Slower (~2-5s/test)    |
| **Reliability** | ✅ 100% consistent         | ⚠️ Can be flaky (network) |
| **Environment** | ✅ Works anywhere          | ❌ Needs credentials      |
| **Edge Cases**  | ✅ Easy to test            | ⚠️ Hard to reproduce      |
| **Maintenance** | ⚠️ Keep stubs updated      | ✅ Auto-validates API     |
| **Coverage**    | ✅ All UI logic            | ✅ Backend integration    |

---

## Why Stubbing First?

### Current Blocker

```
❌ Supabase Authentication Error:
   AuthApiError: User not allowed (code: 'not_admin')

   Blocks: All tests requiring authentication
   Impact: Cannot complete Phase 2 validation
```

### Immediate Benefits

1. **✅ Unblock Testing Work**

   - Continue implementing tests immediately
   - No waiting for Supabase credentials
   - No environment configuration needed

2. **✅ Faster Iteration**

   - Tests run 5-10x faster
   - Quick feedback loop
   - Better developer experience

3. **✅ Better Test Control**

   - Test exact error scenarios
   - Control timing and responses
   - Reproducible edge cases

4. **✅ Quality Improvement**
   - Focus on frontend logic
   - Validate UI behavior
   - Catch UI bugs early

---

## How cy.intercept() Works

### Basic Concept

`cy.intercept()` **intercepts network requests** and provides fake responses:

```typescript
// Instead of this real API call:
POST https://your-project.supabase.co/auth/v1/token
→ Real Supabase server responds

// Cypress intercepts and responds:
cy.intercept('POST', '**/auth/v1/token**', { /* fake response */ })
→ Cypress responds immediately (no network)
```

### Pattern Matching

```typescript
// Match by method + URL pattern
cy.intercept('POST', '**/auth/v1/token**');

// Match with wildcards
cy.intercept('GET', '**/rest/v1/projects**');
cy.intercept('GET', '**/rest/v1/projects?*');

// Match specific endpoints
cy.intercept('POST', '/api/login');
cy.intercept('GET', '/api/user/profile');
```

### Response Formats

```typescript
// Simple response
cy.intercept('GET', '/api/user', {
  statusCode: 200,
  body: { id: '1', email: 'test@example.com' },
});

// Dynamic response based on request
cy.intercept('POST', '/api/projects', req => {
  req.reply({
    statusCode: 201,
    body: {
      id: 'new-id',
      ...req.body, // Echo back what was sent
      createdAt: new Date().toISOString(),
    },
  });
});

// Error responses
cy.intercept('POST', '/api/login', {
  statusCode: 400,
  body: { error: 'Invalid credentials' },
});

// Network errors
cy.intercept('GET', '/api/data', {
  forceNetworkError: true,
});

// Delayed responses
cy.intercept('GET', '/api/slow', {
  delay: 3000,
  statusCode: 200,
  body: { data: 'slow response' },
});
```

---

## Stub Helper Library

### Directory Structure

```
cypress/
├── support/
│   ├── stubs/
│   │   ├── authStubs.ts          # Authentication stubs
│   │   ├── projectStubs.ts       # Project CRUD stubs
│   │   ├── elementStubs.ts       # Element CRUD stubs
│   │   ├── sessionStubs.ts       # Session management stubs
│   │   └── index.ts              # Export all stubs
│   └── commands.ts
```

### Authentication Stubs

**File**: `cypress/support/stubs/authStubs.ts`

```typescript
/**
 * Stub successful login
 * Returns fake JWT token and user data
 */
export const stubSuccessfulLogin = (email = 'test@example.com') => {
  cy.intercept('POST', '**/auth/v1/token**', {
    statusCode: 200,
    body: {
      access_token: 'fake-jwt-token-' + Date.now(),
      refresh_token: 'fake-refresh-token-' + Date.now(),
      expires_in: 3600,
      token_type: 'bearer',
      user: {
        id: 'user-123',
        email: email,
        aud: 'authenticated',
        role: 'authenticated',
        created_at: '2024-01-01T00:00:00.000Z',
      },
    },
  }).as('login');
};

/**
 * Stub failed login
 * Returns 400 error with invalid credentials message
 */
export const stubFailedLogin = (errorMessage = 'Invalid login credentials') => {
  cy.intercept('POST', '**/auth/v1/token**', {
    statusCode: 400,
    body: {
      error: errorMessage,
      error_description: errorMessage,
    },
  }).as('loginFailed');
};

/**
 * Stub auth session check
 * Returns authenticated user data
 */
export const stubAuthSession = (
  userId = 'user-123',
  email = 'test@example.com',
) => {
  cy.intercept('GET', '**/auth/v1/user**', {
    statusCode: 200,
    body: {
      id: userId,
      email: email,
      aud: 'authenticated',
      role: 'authenticated',
      created_at: '2024-01-01T00:00:00.000Z',
    },
  }).as('session');
};

/**
 * Stub signup
 * Returns new user data
 */
export const stubSuccessfulSignup = (email = 'newuser@example.com') => {
  cy.intercept('POST', '**/auth/v1/signup**', {
    statusCode: 200,
    body: {
      access_token: 'fake-jwt-token-' + Date.now(),
      refresh_token: 'fake-refresh-token-' + Date.now(),
      user: {
        id: 'new-user-' + Date.now(),
        email: email,
        aud: 'authenticated',
        role: 'authenticated',
        email_confirmed_at: null, // Requires email confirmation
        created_at: new Date().toISOString(),
      },
    },
  }).as('signup');
};

/**
 * Stub duplicate email error during signup
 */
export const stubDuplicateEmailError = () => {
  cy.intercept('POST', '**/auth/v1/signup**', {
    statusCode: 422,
    body: {
      error: 'User already registered',
      error_description: 'A user with this email already exists',
    },
  }).as('signupDuplicate');
};

/**
 * Stub logout
 */
export const stubLogout = () => {
  cy.intercept('POST', '**/auth/v1/logout**', {
    statusCode: 204,
  }).as('logout');
};

/**
 * Stub password reset request
 */
export const stubPasswordResetRequest = () => {
  cy.intercept('POST', '**/auth/v1/recover**', {
    statusCode: 200,
    body: {},
  }).as('passwordResetRequest');
};
```

### Project Stubs

**File**: `cypress/support/stubs/projectStubs.ts`

```typescript
/**
 * Stub get projects list
 * Returns array of projects for the user
 */
export const stubGetProjects = (projects = []) => {
  // Default sample projects if none provided
  const defaultProjects =
    projects.length > 0
      ? projects
      : [
          {
            id: 'proj-1',
            name: 'Fantasy World',
            description: 'Epic fantasy setting',
            user_id: 'user-123',
            created_at: '2024-01-01T00:00:00.000Z',
            updated_at: '2024-01-01T00:00:00.000Z',
          },
          {
            id: 'proj-2',
            name: 'Sci-Fi Universe',
            description: 'Space opera',
            user_id: 'user-123',
            created_at: '2024-01-02T00:00:00.000Z',
            updated_at: '2024-01-02T00:00:00.000Z',
          },
        ];

  cy.intercept('GET', '**/rest/v1/projects**', {
    statusCode: 200,
    body: defaultProjects,
  }).as('getProjects');
};

/**
 * Stub empty projects list
 */
export const stubEmptyProjects = () => {
  cy.intercept('GET', '**/rest/v1/projects**', {
    statusCode: 200,
    body: [],
  }).as('emptyProjects');
};

/**
 * Stub create project
 * Echoes back submitted data with generated ID
 */
export const stubCreateProject = () => {
  cy.intercept('POST', '**/rest/v1/projects**', req => {
    req.reply({
      statusCode: 201,
      body: {
        id: 'new-proj-' + Date.now(),
        ...req.body,
        user_id: 'user-123',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    });
  }).as('createProject');
};

/**
 * Stub update project
 */
export const stubUpdateProject = () => {
  cy.intercept('PATCH', '**/rest/v1/projects**', req => {
    req.reply({
      statusCode: 200,
      body: {
        ...req.body,
        updated_at: new Date().toISOString(),
      },
    });
  }).as('updateProject');
};

/**
 * Stub delete project
 */
export const stubDeleteProject = () => {
  cy.intercept('DELETE', '**/rest/v1/projects**', {
    statusCode: 204,
  }).as('deleteProject');
};

/**
 * Stub project validation error
 */
export const stubProjectValidationError = (
  errorMessage = 'Project name is required',
) => {
  cy.intercept('POST', '**/rest/v1/projects**', {
    statusCode: 400,
    body: {
      error: errorMessage,
      code: 'validation_error',
    },
  }).as('projectValidationError');
};
```

### Element Stubs

**File**: `cypress/support/stubs/elementStubs.ts`

```typescript
/**
 * Stub get elements for a project
 */
export const stubGetElements = (projectId = 'proj-1', elements = []) => {
  const defaultElements =
    elements.length > 0
      ? elements
      : [
          {
            id: 'elem-1',
            project_id: projectId,
            type: 'character',
            name: 'Aragorn',
            description: 'Ranger of the North',
            created_at: '2024-01-01T00:00:00.000Z',
          },
          {
            id: 'elem-2',
            project_id: projectId,
            type: 'location',
            name: 'Rivendell',
            description: 'Elven outpost',
            created_at: '2024-01-02T00:00:00.000Z',
          },
        ];

  cy.intercept('GET', `**/rest/v1/elements**`, {
    statusCode: 200,
    body: defaultElements,
  }).as('getElements');
};

/**
 * Stub create element
 */
export const stubCreateElement = () => {
  cy.intercept('POST', '**/rest/v1/elements**', req => {
    req.reply({
      statusCode: 201,
      body: {
        id: 'new-elem-' + Date.now(),
        ...req.body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    });
  }).as('createElement');
};

/**
 * Stub update element
 */
export const stubUpdateElement = () => {
  cy.intercept('PATCH', '**/rest/v1/elements**', req => {
    req.reply({
      statusCode: 200,
      body: {
        ...req.body,
        updated_at: new Date().toISOString(),
      },
    });
  }).as('updateElement');
};

/**
 * Stub delete element
 */
export const stubDeleteElement = () => {
  cy.intercept('DELETE', '**/rest/v1/elements**', {
    statusCode: 204,
  }).as('deleteElement');
};
```

### Index Export

**File**: `cypress/support/stubs/index.ts`

```typescript
// Export all stubs for easy importing
export * from './authStubs';
export * from './projectStubs';
export * from './elementStubs';
export * from './sessionStubs';
```

---

## Test Migration Guide

### Before (Blocked by Supabase)

```typescript
/// <reference types="cypress" />

import { generateUniqueEmail } from '../../support/utils/testUserGenerator';

describe('User Sign In Flow', () => {
  let testUser: { email: string; password: string };

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();

    // ❌ BLOCKED: Requires Supabase credentials
    cy.fixture('auth/users').then(users => {
      const { password } = users.validUser;
      const uniqueEmail = generateUniqueEmail('valid.user@fantasy-app.test');
      testUser = { email: uniqueEmail, password };
      cy.task('supabase:seedUser', testUser); // FAILS
    });
  });

  it('should successfully login', () => {
    cy.visit('/');
    cy.get('[data-cy="email-input"]').type(testUser.email);
    cy.get('[data-cy="password-input"]').type(testUser.password);
    cy.get('[data-cy="submit-button"]').click();
    cy.url().should('include', '/projects');
  });
});
```

### After (Stubbed - Works Immediately)

```typescript
/// <reference types="cypress" />

import { stubSuccessfulLogin, stubAuthSession } from '../../support/stubs';

describe('User Sign In Flow', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.comprehensiveDebugWithBuildCapture();
    cy.comprehensiveDebug();

    // ✅ WORKS: Stub the authentication APIs
    stubSuccessfulLogin('test@example.com');
    stubAuthSession('user-123', 'test@example.com');
  });

  it('should successfully login and navigate to projects', () => {
    cy.visit('/');

    // Verify form elements exist (quality fix from earlier)
    cy.get('[data-cy="email-input"]').should('exist').and('be.visible');
    cy.get('[data-cy="password-input"]').should('exist').and('be.visible');
    cy.get('[data-cy="submit-button"]').should('exist').and('be.visible');

    // Fill form
    cy.get('[data-cy="email-input"]').type('test@example.com');
    cy.get('[data-cy="password-input"]').type('password123');
    cy.get('[data-cy="submit-button"]').click();

    // Wait for API call
    cy.wait('@login');

    // Verify navigation
    cy.url({ timeout: 10000 }).should('include', '/projects');
    cy.contains('My Projects').should('be.visible');
  });

  it('should display error for invalid credentials', () => {
    // Use different stub for this test
    stubFailedLogin('Invalid login credentials');

    cy.visit('/');
    cy.get('[data-cy="email-input"]').type('wrong@example.com');
    cy.get('[data-cy="password-input"]').type('wrongpassword');
    cy.get('[data-cy="submit-button"]').click();

    cy.wait('@loginFailed');

    // Verify error displayed
    cy.get('[data-cy="login-error"]').should('be.visible');
    cy.get('[data-cy="login-error"]').should('contain', 'Invalid');

    // Verify no navigation
    cy.url().should('not.include', '/projects');
  });
});
```

---

## Best Practices

### 1. Alias Your Stubs

```typescript
// ✅ GOOD: Use .as() to create aliases
cy.intercept('POST', '/api/login', {
  /* ... */
}).as('login');

// Later in test
cy.wait('@login'); // Wait for the API call
cy.get('@login').its('request.body').should('deep.equal', {
  /* ... */
});
```

### 2. Keep Stubs Realistic

```typescript
// ❌ BAD: Unrealistic response
cy.intercept('GET', '/api/user', {
  body: { name: 'Test' }, // Missing fields
});

// ✅ GOOD: Matches real API structure
cy.intercept('GET', '/api/user', {
  statusCode: 200,
  body: {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    created_at: '2024-01-01T00:00:00.000Z',
    role: 'authenticated',
  },
});
```

### 3. Test Error Scenarios

```typescript
describe('Error Handling', () => {
  it('should handle network errors', () => {
    cy.intercept('POST', '/api/login', {
      forceNetworkError: true,
    }).as('networkError');

    // Trigger login
    // Verify error message shown
  });

  it('should handle slow responses', () => {
    cy.intercept('GET', '/api/data', {
      delay: 5000,
      body: { data: [] },
    }).as('slowRequest');

    // Verify loading spinner shown
  });
});
```

### 4. Dynamic Responses

```typescript
// ✅ GOOD: Dynamic response based on request
cy.intercept('POST', '/api/projects', req => {
  const { name } = req.body;

  if (!name) {
    req.reply({
      statusCode: 400,
      body: { error: 'Name is required' },
    });
  } else {
    req.reply({
      statusCode: 201,
      body: {
        id: 'new-id',
        ...req.body,
        created_at: new Date().toISOString(),
      },
    });
  }
});
```

### 5. Reusable Stub Helpers

```typescript
// ✅ GOOD: Create reusable helpers
export const stubAuthenticatedUser = () => {
  stubSuccessfulLogin();
  stubAuthSession();
  stubGetProjects();
};

// Use in tests
beforeEach(() => {
  stubAuthenticatedUser();
  cy.visit('/projects');
});
```

---

## Future Integration Path

### When Supabase is Ready

You'll have **two test suites**:

**1. Stubbed Tests (Keep as-is)**

```
cypress/e2e/
├── stubbed/                    # Fast frontend tests
│   ├── auth/
│   ├── projects/
│   └── elements/
```

**2. Integration Tests (Add later)**

```
cypress/e2e/
├── integration/                # Real backend tests
│   ├── auth-integration.cy.ts
│   ├── projects-integration.cy.ts
│   └── data-sync-integration.cy.ts
```

### Test Comparison

| Test Type       | Run Frequency | Duration   | Purpose                      |
| --------------- | ------------- | ---------- | ---------------------------- |
| **Stubbed**     | Every commit  | ~2-3 min   | Validate UI logic            |
| **Integration** | Nightly       | ~10-15 min | Validate backend integration |

### Migration Strategy

1. **Keep stubbed tests** - They're valuable for fast feedback
2. **Add integration tests** - For critical paths only
3. **Run both** - Different purposes, both important

```typescript
// Example: Keep both versions

// cypress/e2e/stubbed/auth/signin-flow.cy.ts
describe('Sign In Flow (Stubbed)', () => {
  // Fast, reliable, tests UI logic
});

// cypress/e2e/integration/auth-integration.cy.ts
describe('Sign In Flow (Integration)', () => {
  // Slower, tests real Supabase auth
  // Run less frequently
});
```

---

## Quick Reference

### Common Stub Patterns

```typescript
// Success response
cy.intercept('GET', '/api/data', { statusCode: 200, body: { data: [] } });

// Error response
cy.intercept('POST', '/api/save', {
  statusCode: 400,
  body: { error: 'Bad request' },
});

// Network error
cy.intercept('GET', '/api/data', { forceNetworkError: true });

// Slow response
cy.intercept('GET', '/api/slow', { delay: 3000, body: { data: [] } });

// Dynamic response
cy.intercept('POST', '/api/create', req => {
  req.reply({ statusCode: 201, body: { id: 'new', ...req.body } });
});

// Wait for stub
cy.wait('@stubAlias');
```

### Stub Import Pattern

```typescript
import {
  stubSuccessfulLogin,
  stubAuthSession,
  stubGetProjects,
  stubCreateProject,
} from '../../support/stubs';
```

---

## Next Steps

1. ✅ Create stub helpers (authStubs.ts, projectStubs.ts, elementStubs.ts)
2. ✅ Update Phase 2 tests to use stubs instead of Supabase
3. ✅ Run tests and verify they pass
4. ✅ Continue with Phase 3-5 using stubbed approach
5. ⏳ Later: Add integration tests when Supabase is configured

---

**Status**: ✅ Ready for Implementation
**Next Action**: Create stub helper files and update Phase 2 tests
