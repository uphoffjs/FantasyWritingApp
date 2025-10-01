# Cypress Command Migration Guide

**Version:** 2.0
**Date:** October 1, 2025
**Status:** Active

---

## Overview

This guide helps migrate from deprecated Cypress commands to their modern, project-specific replacements. All deprecated commands are marked with `@deprecated` JSDoc tags and will log runtime warnings during test execution.

---

## Quick Reference

| Old Command (Deprecated) | New Command (Recommended) | File |
|-------------------------|---------------------------|------|
| `cy.clearAuth()` | `cy.cleanMockAuth()` | [mock-auth.ts](../support/commands/auth/mock-auth.ts) |
| `cy.setupTestEnvironment()` | `cy.mockSupabaseAuth()` + `cy.mockSupabaseDatabase()` | [mock-auth.ts](../support/commands/auth/mock-auth.ts), [mock-database.ts](../support/commands/database/mock-database.ts) |
| `cy.clearLocalStorage()` | `cy.cleanMockAuth()` | [mock-auth.ts](../support/commands/auth/mock-auth.ts) |

---

## Migration Details

### 1. Authentication Cleanup: `clearAuth()` → `cleanMockAuth()`

**Why:** More semantic, project-specific name that clearly indicates it's for mock authentication cleanup.

**Old Code (Deprecated):**
```typescript
import { clearAuth } from '../../support/test-helpers'

describe('My Test', () => {
  beforeEach(() => {
    clearAuth() // ⚠️ DEPRECATED
  })
})
```

**New Code (Recommended):**
```typescript
describe('My Test', () => {
  beforeEach(() => {
    cy.cleanMockAuth() // ✅ Modern approach
  })
})
```

**Benefits:**
- ✅ Clearer intent (mock-specific cleanup)
- ✅ Consistent with other mock commands
- ✅ No import required (Cypress command)
- ✅ Better abstraction

**Implementation:**
```typescript
// cypress/support/commands/auth/mock-auth.ts
Cypress.Commands.add('cleanMockAuth', () => {
  cy.window().then((win) => {
    win.localStorage.removeItem('sb-mock-auth-token')
    // Clears all mock auth state
  })
  cy.log('🧹 Mock auth state cleaned')
})
```

---

### 2. Test Environment Setup: `setupTestEnvironment()` → Mock Commands

**Why:** More granular control, explicit about what's being mocked, follows Cypress best practices.

**Old Code (Deprecated):**
```typescript
import { setupTestEnvironment } from '../../support/test-helpers'

describe('My Test', () => {
  beforeEach(() => {
    setupTestEnvironment() // ⚠️ DEPRECATED
    cy.visit('/projects')
  })
})
```

**New Code (Recommended):**
```typescript
describe('My Test', () => {
  beforeEach(() => {
    // ✅ Explicit, granular mocking
    cy.mockSupabaseAuth({
      user: {
        email: 'test@example.com',
        username: 'testuser'
      }
    })
    cy.mockSupabaseDatabase()
    cy.visit('/projects')
  })
})
```

**Benefits:**
- ✅ Explicit about what's mocked
- ✅ Customizable user data
- ✅ Better test isolation
- ✅ Clearer test intent

**Advanced Usage:**
```typescript
// Custom user data
cy.mockSupabaseAuth({
  user: {
    id: 'custom-user-id',
    email: 'admin@example.com',
    username: 'admin',
    display_name: 'Admin User'
  }
})

// Mock database with specific responses
cy.mockSupabaseDatabase()

// Or mock errors for negative testing
cy.mockSupabaseError('**/auth/v1/token*', 'auth')
```

---

### 3. Local Storage Cleanup: `cy.clearLocalStorage()` → `cy.cleanMockAuth()`

**Why:** Built-in `cy.clearLocalStorage()` is too broad. Project-specific cleanup is more precise.

**Old Code:**
```typescript
it('should test something', () => {
  cy.clearLocalStorage() // ⚠️ Too broad, clears everything
  cy.visit('/login')
})
```

**New Code (Recommended):**
```typescript
it('should test something', () => {
  cy.cleanMockAuth() // ✅ Precise, clears only auth state
  cy.visit('/login')
})
```

**When to use each:**
```typescript
// Use cleanMockAuth() for most auth-related cleanup
cy.cleanMockAuth()

// Use cy.clearLocalStorage() only if you need to clear ALL storage
cy.clearLocalStorage() // Nuclear option

// Use cy.cleanState() for comprehensive cleanup (localStorage + sessionStorage + IndexedDB)
cy.cleanState() // Most thorough cleanup
```

---

## Migration Patterns

### Pattern 1: Simple Auth Tests

**Before:**
```typescript
describe('Authentication Tests', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    cy.setupTestEnvironment()
  })

  afterEach(() => {
    clearAuth()
  })
})
```

**After:**
```typescript
describe('Authentication Tests', () => {
  beforeEach(() => {
    cy.cleanMockAuth()
    cy.mockSupabaseAuth()
    cy.mockSupabaseDatabase()
  })

  afterEach(() => {
    cy.cleanMockAuth()
  })
})
```

### Pattern 2: Custom User Testing

**Before:**
```typescript
it('should test admin user', () => {
  cy.clearLocalStorage()
  cy.setupTestEnvironment()
  // Manually set admin data...
})
```

**After:**
```typescript
it('should test admin user', () => {
  cy.mockSupabaseAuth({
    user: {
      email: 'admin@test.com',
      role: 'admin'
    }
  })
  cy.mockSupabaseDatabase()
  cy.visit('/admin')
})
```

### Pattern 3: Session-Based Authentication

**Before:**
```typescript
beforeEach(() => {
  cy.clearLocalStorage()
  cy.apiLogin('test@example.com', 'password')
})
```

**After:**
```typescript
beforeEach(() => {
  // cy.apiLogin() already handles cleanup internally
  cy.apiLogin('test@example.com', 'password')
})
```

---

## Command Reference

### New Mock Authentication Commands

#### `cy.mockSupabaseAuth(options?)`

Mock Supabase authentication with optional user data.

```typescript
cy.mockSupabaseAuth({
  user: {
    id: 'user-123',
    email: 'test@example.com',
    username: 'testuser',
    display_name: 'Test User'
  },
  skipSupabase: false // Set true to skip API mocking
})
```

**Features:**
- Sets mock auth token in localStorage
- Mocks Supabase auth endpoints
- Configurable user data
- Logs mock state for debugging

#### `cy.cleanMockAuth()`

Clean all mock authentication state.

```typescript
cy.cleanMockAuth()
```

**What it clears:**
- Mock auth tokens
- User data
- Session state
- Offline mode flags

#### `cy.mockSupabaseDatabase()`

Mock Supabase database endpoints.

```typescript
cy.mockSupabaseDatabase()
```

**Mocks:**
- Profile endpoints
- Project CRUD endpoints
- Element CRUD endpoints
- Standard Supabase REST patterns

#### `cy.mockSupabaseError(endpoint, errorType)`

Mock Supabase errors for negative testing.

```typescript
cy.mockSupabaseError('**/auth/v1/token*', 'auth')
cy.mockSupabaseError('**/rest/v1/projects*', 'network')
```

**Error Types:**
- `auth` - 401 authentication errors
- `network` - 500 server errors
- `validation` - 400 validation errors
- `notFound` - 404 not found errors

---

## Session-Based Commands

### `cy.apiLogin(email, password)`

Modern session-based API login (preferred).

```typescript
cy.apiLogin('test@example.com', 'testpassword123')
```

**Features:**
- ✅ Uses `cy.session()` for caching
- ✅ Faster than UI login
- ✅ Automatically handles cleanup
- ✅ Validates session state

### `cy.loginAs(role)`

Role-based login helper.

```typescript
cy.loginAs('admin')  // Logs in as admin user
cy.loginAs('user')   // Logs in as regular user
```

**Available Roles:**
- `admin` - Administrator user
- `user` - Regular user
- `developer` - Developer user

---

## Deprecation Timeline

| Command | Deprecated | Removal | Replacement |
|---------|-----------|---------|-------------|
| `clearAuth()` | Oct 2025 | Feb 2026 | `cy.cleanMockAuth()` |
| `setupTestEnvironment()` | Oct 2025 | Feb 2026 | `cy.mockSupabaseAuth()` + `cy.mockSupabaseDatabase()` |

**Grace Period:** 4 months (Oct 2025 - Feb 2026)

**Warnings:**
- ⚠️ Runtime warnings in test logs
- ⚠️ IDE warnings via @deprecated JSDoc
- ⚠️ TypeScript type-level deprecation warnings

---

## Automated Migration

### Find Deprecated Usage

```bash
# Find all uses of deprecated commands
grep -r "clearAuth()" cypress/e2e/
grep -r "setupTestEnvironment()" cypress/e2e/
grep -r "cy.clearLocalStorage()" cypress/e2e/

# Count occurrences
grep -r "clearAuth()" cypress/e2e/ | wc -l
```

### Batch Update

```bash
# Replace clearAuth() with cy.cleanMockAuth()
find cypress/e2e -name "*.cy.ts" -exec sed -i '' 's/clearAuth()/cy.cleanMockAuth()/g' {} +

# Replace cy.clearLocalStorage() with cy.cleanMockAuth() (where appropriate)
find cypress/e2e -name "*.cy.ts" -exec sed -i '' 's/cy\.clearLocalStorage()/cy.cleanMockAuth()/g' {} +
```

**⚠️ Warning:** Review changes before committing. Some uses of `cy.clearLocalStorage()` may be intentional.

---

## Testing After Migration

### Verification Checklist

- [ ] All tests still pass: `npm run cypress:run`
- [ ] No deprecation warnings in test logs
- [ ] No import errors: `npm run lint`
- [ ] TypeScript compiles: `npx tsc --noEmit`
- [ ] Session caching works correctly
- [ ] Mock data is properly cleaned between tests

### Common Issues

**Issue 1: Tests fail with "user not authenticated"**
```typescript
// Problem: Forgot to add mock database
cy.mockSupabaseAuth()
cy.visit('/projects') // ❌ Fails - no database mock

// Solution: Add database mock
cy.mockSupabaseAuth()
cy.mockSupabaseDatabase() // ✅ Works
cy.visit('/projects')
```

**Issue 2: User data not persisting**
```typescript
// Problem: clearLocalStorage() is too aggressive
cy.mockSupabaseAuth()
cy.clearLocalStorage() // ❌ Clears auth too
cy.visit('/dashboard')

// Solution: Use cleanMockAuth() or remove unnecessary clear
cy.mockSupabaseAuth()
cy.visit('/dashboard') // ✅ Auth persists
```

**Issue 3: Session conflicts**
```typescript
// Problem: Multiple logins without cleanup
cy.apiLogin('user1@test.com', 'pass')
cy.apiLogin('user2@test.com', 'pass') // ❌ Session conflict

// Solution: Clear sessions between logins
cy.apiLogin('user1@test.com', 'pass')
cy.clearTestSessions()
cy.apiLogin('user2@test.com', 'pass') // ✅ Works
```

---

## Best Practices

### 1. Use Session-Based Login When Possible

```typescript
// ✅ Preferred: Fast, cached, automatic cleanup
cy.apiLogin('test@example.com', 'password')

// ❌ Avoid: Slow, manual cleanup required
cy.visit('/login')
cy.get('[data-cy="email"]').type('test@example.com')
cy.get('[data-cy="password"]').type('password')
cy.get('[data-cy="submit"]').click()
```

### 2. Clean State in beforeEach, Not afterEach

```typescript
// ✅ Preferred: Clean BEFORE tests (Cypress best practice)
beforeEach(() => {
  cy.cleanMockAuth()
  cy.mockSupabaseAuth()
})

// ❌ Avoid: Cleaning after tests
afterEach(() => {
  cy.cleanMockAuth() // Unnecessary cleanup
})
```

### 3. Be Explicit About What You Mock

```typescript
// ✅ Clear, explicit, testable
cy.mockSupabaseAuth({ user: { email: 'test@example.com' } })
cy.mockSupabaseDatabase()

// ❌ Unclear what's happening
cy.setupTestEnvironment() // What does this mock?
```

### 4. Use Role Helpers for Common Scenarios

```typescript
// ✅ Simple, readable
cy.loginAs('admin')

// ❌ Verbose, repetitive
cy.mockSupabaseAuth({
  user: {
    email: 'admin@example.com',
    role: 'admin',
    permissions: ['admin']
  }
})
```

---

## Support

**Questions?** Check:
- [Cypress Testing Standards](../CYPRESS-TESTING-STANDARDS.md)
- [Cypress Best Practices](./cypress-best-practices.md)
- [test-helpers.ts](../support/test-helpers.ts) - Deprecated commands source
- [mock-auth.ts](../support/commands/auth/mock-auth.ts) - New commands source

**Issues?** Common problems and solutions above.

---

**Version History:**
- v2.0 (Oct 2025) - Added modern mock commands, deprecated old patterns
- v1.0 (2024) - Original command set

**Last Updated:** October 1, 2025
