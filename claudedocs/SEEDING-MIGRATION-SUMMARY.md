# Database Seeding Migration Summary

**Date**: 2025-10-06
**Migration**: cy.task() → Supabase Admin API

## Overview

Migrated from direct database seeding via `cy.task()` to the official **Supabase Admin API** method for test data management.

---

## Changes Made

### 1. New Files Created

#### [cypress/support/seedHelpers.ts](../cypress/support/seedHelpers.ts)

Supabase Admin client with helper functions:

- `seedUser(userData)` - Create users with auto-confirmed emails
- `cleanupUsers()` - Remove all test users (email contains 'test' or 'cypress')
- `getUserByEmail(email)` - Retrieve user by email
- `deleteUserByEmail(email)` - Delete specific user

### 2. Files Modified

#### [.env](../.env)

```bash
# Added
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### [.env.example](../.env.example)

```bash
# Added
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

#### [cypress/support/commands/utility/seeding.ts](../cypress/support/commands/utility/seeding.ts)

Added 4 new Cypress commands:

```typescript
cy.seedSupabaseUser({ email, password, metadata });
cy.cleanupSupabaseUsers();
cy.deleteSupabaseUser(email);
cy.getSupabaseUser(email);
```

#### [cypress/support/index.d.ts](../cypress/support/index.d.ts)

Added TypeScript type definitions for new commands.

#### [cypress.config.ts](../cypress.config.ts)

- Added environment variables:
  ```typescript
  VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  ```
- Removed cy.task registrations for `seedUser` and `cleanupUsers`

#### [scripts/docker-cypress-with-cleanup.sh](../scripts/docker-cypress-with-cleanup.sh)

Added environment variable passing to Docker:

```bash
-e CYPRESS_VITE_SUPABASE_URL="$VITE_SUPABASE_URL"
-e CYPRESS_SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY"
```

#### [cypress/e2e/authentication/\_smoke-test.cy.ts](../cypress/e2e/authentication/_smoke-test.cy.ts)

Updated from:

```typescript
cy.task('seedUser', testUser);
cy.task('cleanupUsers', emails);
```

To:

```typescript
cy.seedSupabaseUser({ email, password, metadata });
cy.cleanupSupabaseUsers();
```

### 3. Files Removed

- `cypress/support/tasks/` directory (entire cy.task implementation)
- `cypress/e2e/auth-tests/test-seed-helper.cy.ts` (temporary verification test)

---

## New Usage Pattern

### Before (cy.task)

```typescript
cy.task('seedUser', {
  id: 'user123',
  email: 'test@example.com',
  password: 'Test1234!',
}).then(result => {
  // Handle result
});

cy.task('cleanupUsers', ['test@example.com']);
```

### After (Supabase Admin API)

```typescript
// Seed a user
cy.seedSupabaseUser({
  email: 'test@example.com',
  password: 'Test1234!',
  metadata: {
    testUser: true,
    createdBy: 'cypress',
  },
}).then(user => {
  expect(user).to.exist;
  expect(user.email).to.equal('test@example.com');
});

// Clean up all test users
cy.cleanupSupabaseUsers();

// Delete specific user
cy.deleteSupabaseUser('test@example.com');

// Get user by email
cy.getSupabaseUser('test@example.com').then(user => {
  expect(user).to.exist;
});
```

---

## Benefits

### ✅ Advantages of Supabase Admin API

1. **Official API** - Uses supported Supabase SDK
2. **Better Security** - Service role key properly bypasses RLS
3. **Proper Auth Handling** - Password hashing via Supabase auth system
4. **Type Safety** - Full TypeScript support
5. **Less Complexity** - No direct DB connection management
6. **Maintainability** - Follows Supabase best practices

### ⚠️ Trade-offs

- **Slightly Slower** - ~100-200ms per user vs ~50-100ms with direct DB
- **For typical test suite**: Adds 1-2 seconds total (negligible)

---

## Migration Checklist

- [x] Add `SUPABASE_SERVICE_ROLE_KEY` to `.env`
- [x] Create `cypress/support/seedHelpers.ts`
- [x] Add new Cypress commands to `commands/utility/seeding.ts`
- [x] Update type definitions in `cypress/support/index.d.ts`
- [x] Remove `cypress/support/tasks/` directory
- [x] Update `cypress.config.ts` (remove cy.task, add env vars)
- [x] Update Docker script to pass env vars
- [x] Update existing tests to use new commands
- [x] Remove temporary test files
- [x] Verify updated tests pass

---

## Testing

Run the updated smoke test:

```bash
SPEC=cypress/e2e/authentication/_smoke-test.cy.ts npm run cypress:docker:test:spec
```

---

## Next Steps

When writing new tests, use the new seeding commands:

```typescript
describe('My Test', () => {
  before(() => {
    cy.cleanupSupabaseUsers(); // Clean before all tests
  });

  beforeEach(() => {
    // Seed fresh user for each test
    cy.seedSupabaseUser({
      email: 'test@example.com',
      password: 'Test1234!',
    });
  });

  after(() => {
    cy.cleanupSupabaseUsers(); // Final cleanup
  });

  it('should test with real user', () => {
    // Your test code here
  });
});
```

---

## Troubleshooting

### Issue: `supabaseKey is required`

**Solution**: Environment variables not loaded. Ensure `.env` file exists and Docker script loads it.

### Issue: User already exists

**Solution**: Call `cy.cleanupSupabaseUsers()` or `cy.deleteSupabaseUser(email)` before seeding.

### Issue: Tests fail in Docker

**Solution**: Ensure `scripts/docker-cypress-with-cleanup.sh` passes env vars to Docker container.

---

## Documentation

- **Implementation**: [cypress/support/seedHelpers.ts](../cypress/support/seedHelpers.ts)
- **Commands**: [cypress/support/commands/utility/seeding.ts](../cypress/support/commands/utility/seeding.ts)
- **Types**: [cypress/support/index.d.ts](../cypress/support/index.d.ts)
- **Example Test**: [cypress/e2e/authentication/\_smoke-test.cy.ts](../cypress/e2e/authentication/_smoke-test.cy.ts)
