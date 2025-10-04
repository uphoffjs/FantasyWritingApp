# Mock Supabase Testing Guide

## Overview

This project uses `cy.intercept()` to mock Supabase auth and database operations for fast, isolated Cypress testing.

## Quick Start

### Basic Auth Mocking

```typescript
beforeEach(() => {
  cy.mockSupabaseAuth();
  cy.visit('/dashboard');
});
```

### Auth with Custom User

```typescript
beforeEach(() => {
  cy.mockSupabaseAuth({
    email: 'custom@example.com',
    username: 'customuser',
    display_name: 'Custom User',
  });
  cy.visit('/dashboard');
});
```

### Database Mocking with Fixtures

```typescript
beforeEach(() => {
  cy.mockSupabaseAuth();

  cy.fixture('mock-projects').then(projects => {
    cy.mockSupabaseDatabase({ projects });
  });

  cy.visit('/projects');
  cy.wait('@mockGetProjects');
});
```

### Error State Testing

```typescript
it('should handle auth errors', () => {
  cy.mockSupabaseError('**/auth/v1/token*', 'auth');
  cy.visit('/login');
  // ... submit form
  cy.wait('@mockError-auth');
  cy.get('[data-cy="error-message"]').should('be.visible');
});
```

## Available Commands

### cy.mockSupabaseAuth(user?)

Mocks Supabase authentication endpoints.

**Parameters:**

- user.id - Mock user ID (default: auto-generated)
- user.email - Mock email (default: 'mock@example.com')
- user.username - Mock username (default: 'mockuser')
- user.display_name - Mock display name (default: 'Mock User')

**Intercepted Endpoints:**

- POST /auth/v1/token - Login
- GET /auth/v1/user - Get user
- POST /auth/v1/signup - Signup
- POST /auth/v1/logout - Logout
- POST /auth/v1/recover - Password reset

### cy.mockSupabaseDatabase(fixtures)

Mocks Supabase database endpoints.

**Parameters:**

- fixtures.profiles - Array of profile objects
- fixtures.projects - Array of project objects
- fixtures.elements - Array of element objects

**Intercepted Endpoints (per table):**

- GET /rest/v1/[table] - List items
- POST /rest/v1/[table] - Create item
- PATCH /rest/v1/[table] - Update item
- DELETE /rest/v1/[table] - Delete item

### cy.mockSupabaseError(endpoint, errorType)

Mocks error responses for testing error states.

**Parameters:**

- endpoint - URL pattern to intercept
- errorType - Type of error: 'auth' | 'network' | 'validation' | 'notFound'

**Error Types:**

- auth - 401 Invalid credentials
- network - 500 Server error
- validation - 400 Validation error
- notFound - 404 Not found

### cy.cleanMockAuth()

Clears all mock auth state from localStorage.

## Test Patterns

### Full Integration Test

```typescript
describe('Project Workflow', () => {
  beforeEach(() => {
    // Setup auth and data
    cy.mockSupabaseAuth({ email: 'workflow@test.com' });
    cy.fixture('mock-projects').then(projects => {
      cy.mockSupabaseDatabase({ projects });
    });
  });

  it('should create, edit, and delete project', () => {
    cy.visit('/projects');
    cy.wait('@mockGetProjects');

    // Create
    cy.get('[data-cy="new-project-button"]').click();
    cy.get('[data-cy="project-name-input"]').type('New Project');
    cy.get('[data-cy="save-project-button"]').click();
    cy.wait('@mockCreateProject');

    // Edit
    cy.get('[data-cy="edit-project-button"]').first().click();
    cy.get('[data-cy="project-name-input"]').clear().type('Updated Project');
    cy.get('[data-cy="save-project-button"]').click();
    cy.wait('@mockUpdateProject');

    // Delete
    cy.get('[data-cy="delete-project-button"]').first().click();
    cy.get('[data-cy="confirm-delete-button"]').click();
    cy.wait('@mockDeleteProject');
  });
});
```

### Error State Testing

```typescript
describe('Error Handling', () => {
  it('should handle network errors', () => {
    cy.mockSupabaseAuth();
    cy.mockSupabaseError('**/rest/v1/projects*', 'network');

    cy.visit('/projects');
    cy.wait('@mockError-network');

    cy.get('[data-cy="error-message"]').should('contain', 'server error');
  });

  it('should handle validation errors', () => {
    cy.mockSupabaseAuth();
    cy.mockSupabaseDatabase({ projects: [] });
    cy.mockSupabaseError('**/rest/v1/projects', 'validation');

    cy.visit('/projects/new');
    cy.get('[data-cy="save-project-button"]').click();
    cy.wait('@mockError-validation');

    cy.get('[data-cy="validation-error"]').should('be.visible');
  });
});
```

## Benefits of Mocking

✅ **Fast** - No network calls, tests run 10-100x faster
✅ **Isolated** - No external dependencies, tests always work
✅ **Flexible** - Easy to test edge cases and error states
✅ **Portable** - Works offline, no backend setup needed
✅ **Deterministic** - Same results every time

## Tips & Best Practices

1. **Always clean before tests:**

   ```typescript
   beforeEach(() => {
     cy.cleanMockAuth(); // Start fresh
   });
   ```

2. **Wait for intercepts:**

   ```typescript
   cy.wait('@mockGetProjects'); // Ensures data loaded
   ```

3. **Use fixtures for complex data:**

   ```typescript
   cy.fixture('mock-projects').then(projects => {
     cy.mockSupabaseDatabase({ projects });
   });
   ```

4. **Test error states:**

   ```typescript
   cy.mockSupabaseError('**/auth/v1/token*', 'auth');
   ```

5. **Mock before visit:**
   ```typescript
   cy.mockSupabaseAuth(); // Setup mocks first
   cy.visit('/page'); // Then navigate
   ```

## Examples

See cypress/e2e/examples/mock-auth-example.cy.ts for complete working examples.

## Troubleshooting

**Issue:** "Mock not intercepting"

- **Fix:** Ensure cy.mockSupabaseAuth() is called **before** cy.visit()

**Issue:** "Data not loading"

- **Fix:** Add cy.wait('@mockGetProjects') after navigation

**Issue:** "Auth token not found"

- **Fix:** Check that cy.mockSupabaseAuth() sets localStorage correctly

**Issue:** "Tests flaky"

- **Fix:** Always use cy.wait() for intercepts, don't rely on timeouts
