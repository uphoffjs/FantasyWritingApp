# Supabase Test User Cleanup Guide

## Problem Statement

Test users cannot be deleted from Supabase due to foreign key constraints. When tests create users, those users persist in the database with associated records (profiles, projects, etc.), preventing deletion through the Auth API.

### Error Symptoms

```
❌ Failed: user@fantasy-app.test - Database error deleting user
⚠️ Could not delete user after retries
```

### Root Cause

Supabase's `deleteUser()` API fails when:

1. User has database records with foreign key constraints
2. User has active sessions or refresh tokens
3. Database tables have `ON DELETE RESTRICT` instead of `ON DELETE CASCADE`

## Solutions

### Solution 1: Manual Dashboard Cleanup (Immediate)

**When to use**: Before running tests when users are stuck

**Steps**:

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Authentication** → **Users**
4. Filter/search for test users (contains "test", "cypress", "fantasy-app.test")
5. Click three-dot menu → **Delete user**
6. Confirm deletion for each stuck user

**Pros**: Guaranteed to work, handles all constraints
**Cons**: Manual process, time-consuming for many users

---

### Solution 2: Use Unique Test Emails (Recommended)

**When to use**: For all new tests going forward

**Implementation**: Modify test fixtures to generate unique emails

```typescript
// cypress/fixtures/auth/users.json - UPDATE NEEDED
{
  "validUser": {
    "id": "valid-user-001",
    "email": `valid-${Date.now()}@fantasy-app.test`, // Dynamic email
    "password": "ValidPass123!",
    // ... rest of fields
  }
}
```

**Or in test beforeEach**:

```typescript
beforeEach(() => {
  const uniqueEmail = `test-${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 9)}@fantasy-app.test`;
  const password = 'TestPass123!';

  cy.task('supabase:seedUser', { email: uniqueEmail, password });
});
```

**Pros**: No cleanup needed, guaranteed unique users
**Cons**: Cannot test with known fixture emails, slight performance overhead

---

### Solution 3: Database CASCADE Delete (Long-term Fix)

**When to use**: For production-ready solution

**Steps**:

1. Update database schema to use `ON DELETE CASCADE`
2. Apply migration to existing tables

```sql
-- Example migration for profiles table
ALTER TABLE public.profiles
DROP CONSTRAINT profiles_user_id_fkey;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Repeat for all tables with user_id foreign keys:
-- - projects
-- - elements
-- - user_preferences
-- - etc.
```

**Pros**: Enables proper cleanup, matches production behavior
**Cons**: Requires database migration, affects all environments

---

### Solution 4: Pre-Test Database Cleanup Script

**When to use**: Run before test suites

**Implementation**: Create SQL script to delete test user data

```javascript
// scripts/cleanup-test-user-data.js
async function cleanupTestUserData() {
  const { data: users } = await supabase.auth.admin.listUsers();

  const testUserIds = users
    .filter(u => u.email?.includes('test'))
    .map(u => u.id);

  // Delete user data first (respects foreign keys)
  await supabase.from('elements').delete().in('user_id', testUserIds);
  await supabase.from('projects').delete().in('user_id', testUserIds);
  await supabase.from('profiles').delete().in('user_id', testUserIds);

  // Then delete auth users
  for (const id of testUserIds) {
    await supabase.auth.admin.deleteUser(id);
  }
}
```

**Pros**: Clean database state, works with existing schema
**Cons**: Requires knowing all tables with user references

---

## Current Implementation Status

### ✅ Completed

- [x] Environment variable loading (`dotenv` in cypress.config.ts)
- [x] Debug logging for Supabase operations
- [x] Retry logic with exponential backoff
- [x] Manual cleanup script (`scripts/cleanup-supabase-users.js`)
- [x] NPM commands: `npm run cleanup:supabase`, `npm run cleanup:supabase:force`

### ❌ Blocked by Foreign Key Constraints

- [ ] Automated cleanup via Auth API
- [ ] Pre-test cleanup hooks

### 🔧 Recommended Next Steps

1. **Immediate**: Use Solution 1 (Manual Dashboard) to unblock current tests
2. **Short-term**: Implement Solution 2 (Unique Emails) for new tests
3. **Long-term**: Implement Solution 3 (CASCADE Delete) with migrations

---

## Quick Commands

```bash
# Check stuck users
npm run cleanup:supabase

# Force cleanup (skips confirmation)
npm run cleanup:supabase:force

# Run tests after manual cleanup
SPEC=cypress/e2e/authentication/signin-flow.cy.ts npm run cypress:docker:test:spec
```

---

## Test Isolation Best Practices

### Option A: Unique Emails per Run

```typescript
const runId = Date.now();
const user = {
  email: `test-${runId}@fantasy-app.test`,
  password: 'Test123!',
};
```

### Option B: Test-Specific Prefixes

```typescript
const testName = Cypress.currentTest.title.replace(/\s+/g, '-').toLowerCase();
const user = {
  email: `${testName}-${Date.now()}@fantasy-app.test`,
  password: 'Test123!',
};
```

### Option C: Session-Based Cleanup

```typescript
before(() => {
  cy.task('db:snapshot'); // Create DB snapshot
});

after(() => {
  cy.task('db:restore'); // Restore to snapshot
});
```

---

## Related Documentation

- [Supabase Auth Admin API](https://supabase.com/docs/reference/javascript/auth-admin-deleteuser)
- [PostgreSQL Foreign Key Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-FK)
- [Cypress Best Practices: Test Isolation](https://docs.cypress.io/guides/references/best-practices#Creating-tiny-tests-with-a-single-assertion)

---

**Last Updated**: 2025-10-07
**Status**: Database foreign key constraints preventing cleanup - manual dashboard deletion required
