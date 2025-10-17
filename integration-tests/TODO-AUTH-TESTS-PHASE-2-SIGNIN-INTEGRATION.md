# TODO: Authentication Tests - Phase 2: Sign-In Flow (Integration)

**Part of**: [Authentication Flow E2E Tests Implementation](../TODO-AUTH-TESTS.md)
**Testing Strategy**: Integration Testing (Backend + Frontend Validation)
**Priority**: Medium (Stubs cover most needs)
**Status**: Future Work

**Prerequisites**: Supabase environment configured
**See Also**: [Phase 2 Stub Tests](../TODO-AUTH-TESTS-PHASE-2-SIGNIN-STUBS.md) (Primary testing)

---

## 🎯 Integration Testing Overview

Integration tests validate **backend behavior** with real Supabase authentication.

**When to Run**:

- 🔌 Nightly test runs
- 🔌 Pre-release validation
- 🔌 Staging environment testing

**Not for**: CI/CD pre-commit hooks, PR validation (use stubs instead)

---

## 🧪 Integration Test Strategy

### Integration Test 2.1: Real Authentication Flow

- 🔌 **Supabase**: Real `supabase.auth.signInWithPassword()` call
- 🎯 **Tests**: Actual JWT token generation, database user validation, real session creation
- 📁 **Location**: `cypress/e2e/integration/authentication/signin-integration.cy.ts`
- ⏱️ **When**: Run nightly or pre-release (slower, requires environment)

### Integration Test 2.2: Real Invalid Credentials

- 🔌 **Supabase**: Real auth error from Supabase
- 🎯 **Tests**: Actual Supabase error responses, rate limiting, security policies
- 📁 **Location**: `cypress/e2e/integration/authentication/signin-errors-integration.cy.ts`

### Integration Test 2.3: Real Session Persistence

- 🔌 **Supabase**: Real session tokens, refresh tokens, expiry
- 🎯 **Tests**: Actual token refresh, session expiration, cross-device sessions
- 📁 **Location**: `cypress/e2e/integration/authentication/session-integration.cy.ts`

---

## 📊 Test Coverage Matrix (Integration Tests)

| Test Aspect         | Integration Coverage  |
| ------------------- | --------------------- |
| **UI Logic**        | ❌ Not needed         |
| **Form Validation** | ❌ Not needed         |
| **Navigation**      | ✅ Secondary          |
| **API Calls**       | 🔌 **Real (Primary)** |
| **Database**        | 🔌 **Real (Primary)** |
| **JWT Tokens**      | 🔌 **Real (Primary)** |
| **Session Storage** | 🔌 **Real Supabase**  |
| **Token Refresh**   | 🔌 **Real (Primary)** |

---

## 📅 Implementation Tasks

### Task 2.1: Environment Setup

- [ ] **Configure Supabase Environment**
  - [ ] Create test Supabase project or use staging
  - [ ] Add Supabase credentials to `.env.test`
  - [ ] Configure test user pool
  - [ ] Set up database cleanup scripts

### Task 2.2: Integration Test 2.1 - Real Authentication

- [ ] **Implement Test Case**

  - [ ] Visit `/` (login page)
  - [ ] Type test user credentials
  - [ ] Click submit
  - [ ] **Verify real API call** to Supabase
  - [ ] **Verify real JWT token** in response
  - [ ] **Verify database session** created
  - [ ] Assert navigation to `/projects`

- [ ] **Run Test**
  ```bash
  SPEC=cypress/e2e/integration/authentication/signin-integration.cy.ts npm run cypress:run:spec
  ```

### Task 2.3: Integration Test 2.2 - Real Error Handling

- [ ] **Implement Test Case**

  - [ ] Visit `/`
  - [ ] Type invalid credentials
  - [ ] Click submit
  - [ ] **Verify real Supabase error** response
  - [ ] **Check rate limiting** behavior
  - [ ] Assert error message displayed

- [ ] **Run Test**

### Task 2.4: Integration Test 2.3 - Real Session Management

- [ ] **Implement Test Case**

  - [ ] Sign in with real credentials
  - [ ] Navigate to `/projects`
  - [ ] **Verify real session token** in Supabase
  - [ ] Reload page
  - [ ] **Verify automatic token refresh** (if near expiry)
  - [ ] Assert session persists

- [ ] **Run Test**

---

## ✅ Integration Tests Validation Checklist

- [ ] Supabase environment configured
- [ ] All 3 integration tests passing
- [ ] Tests verify real JWT tokens
- [ ] Tests verify database operations
- [ ] Token refresh mechanism validated
- [ ] Execution time acceptable (~30-60s)

---

## 📊 Integration Tests Status

**Started**: **_
**Completed**: _**
**Duration**: **_ hours
**Tests Implemented**: _** / 3
**Tests Passing**: \_\_\_ / 3

---

## 🚨 Common Issues & Solutions

### Issue: Supabase connection timeout

**Solution**: Verify Supabase project URL and anon key in environment variables

### Issue: Test user not found

**Solution**: Ensure test user exists in Supabase database or create during test setup

### Issue: Token refresh intermittent failures

**Solution**: Use Supabase tokens with short expiry (5 min) for faster testing

---

## 💡 Environment Configuration

### Required Environment Variables

```bash
# .env.test
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key (for cleanup)
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=Test123!@#
```

### Test User Management

- Consider using Supabase CLI to seed test users
- Implement cleanup scripts to remove test sessions
- Use unique email prefixes for parallel test runs

---

**Next**: [Phase 3 Integration Tests](./TODO-AUTH-TESTS-PHASE-3-SIGNUP-INTEGRATION.md)
**Stub Tests**: [Phase 2 Stub Tests](../TODO-AUTH-TESTS-PHASE-2-SIGNIN-STUBS.md) (Run these first)
**Main Plan**: [TODO-AUTH-TESTS.md](../TODO-AUTH-TESTS.md)
