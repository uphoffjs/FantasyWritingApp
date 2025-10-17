# TODO: Authentication Tests - Phase 4: Session Management (Integration)

**Part of**: [Authentication Flow E2E Tests Implementation](../TODO-AUTH-TESTS.md)
**Testing Strategy**: Integration Testing (Backend + Frontend Validation)
**Priority**: Important (Token refresh requires integration)
**Status**: Future Work

**Prerequisites**: Supabase environment configured
**See Also**: [Phase 4 Stub Tests](../TODO-AUTH-TESTS-PHASE-4-SESSION-STUBS.md) (Primary testing)

---

## 🎯 Integration Testing Overview

Integration tests validate **real session management** including token refresh and expiration.

**When to Run**:

- 🔌 Nightly test runs
- 🔌 Pre-release validation
- 🔌 Token refresh testing

**⚠️ IMPORTANT**: Token refresh **cannot be effectively tested with stubs** - integration tests are critical here.

---

## 🧪 Integration Test Strategy

### Integration Test 4.1: Real Token Refresh

- 🔌 **Supabase**: Real JWT token expiration and refresh
- 🎯 **Tests**: Automatic token refresh, refresh token rotation, session extension
- 📁 **Location**: `cypress/e2e/integration/authentication/token-refresh-integration.cy.ts`
- ⏱️ **When**: Run nightly (requires real token expiration time)
- ⚠️ **Slow**: May need to mock system time or use short-lived tokens

### Integration Test 4.2: Real Session Timeout

- 🔌 **Supabase**: Real session expiration (24 hours default)
- 🎯 **Tests**: Actual session invalidation, cleanup of expired sessions, database state
- 📁 **Location**: `cypress/e2e/integration/authentication/session-timeout-integration.cy.ts`
- ⚠️ **Very Slow**: Requires waiting for real timeout or time manipulation

### Integration Test 4.3: Cross-Device Session Management

- 🔌 **Supabase**: Real sessions across different devices
- 🎯 **Tests**: Login from multiple devices, session limit enforcement, concurrent sessions
- 📁 **Location**: `cypress/e2e/integration/authentication/multi-device-integration.cy.ts`
- ⚠️ **Complex**: Requires multiple browser contexts or devices

---

## 📊 Test Coverage Matrix (Integration Tests)

| Test Aspect          | Integration Coverage   |
| -------------------- | ---------------------- |
| **JWT Tokens**       | 🔌 **Real (Primary)**  |
| **Token Refresh**    | 🔌 **Real (PRIMARY)**  |
| **Token Expiration** | 🔌 **Real (Primary)**  |
| **Session Limits**   | 🔌 **Real (Optional)** |
| **Database Cleanup** | 🔌 **Real (Primary)**  |

---

## 📅 Implementation Tasks

### Task 4.1: Environment Setup

- [ ] **Configure Short-Lived Tokens**
  - [ ] Set Supabase JWT expiry to 5 minutes (for testing)
  - [ ] Configure refresh token rotation
  - [ ] Set up time manipulation utilities (if needed)

### Task 4.2: Integration Test 4.1 - Token Refresh

- [ ] **Implement Test Case**

  - [ ] Sign in with real credentials
  - [ ] Navigate to `/projects`
  - [ ] **Wait for token to approach expiry** (4.5 min of 5 min token)
  - [ ] Make authenticated API call
  - [ ] **Verify automatic token refresh** occurred
  - [ ] **Check new token** in localStorage
  - [ ] **Verify refresh token rotated** (security best practice)
  - [ ] Assert session continues without interruption

- [ ] **Run Test**

  ```bash
  SPEC=cypress/e2e/integration/authentication/token-refresh-integration.cy.ts npm run cypress:run:spec
  ```

- [ ] **Alternative: Time Manipulation**
  - [ ] Use `cy.clock()` if supported by Supabase SDK
  - [ ] Or use server-side time manipulation

### Task 4.3: Integration Test 4.2 - Session Timeout

- [ ] **Implement Test Case**

  - [ ] Sign in with real credentials
  - [ ] **Wait for full session expiration** (or manipulate time)
  - [ ] Try to access protected route
  - [ ] **Verify session invalidated** in database
  - [ ] **Verify automatic logout** occurred
  - [ ] Assert redirected to login

- [ ] **Run Test**

### Task 4.4: Integration Test 4.3 - Multi-Device Sessions

- [ ] **Implement Test Case**

  - [ ] Sign in from **first browser context**
  - [ ] Sign in from **second browser context** (same user)
  - [ ] **Verify both sessions active** in Supabase
  - [ ] Logout from first context
  - [ ] **Verify only first session invalidated**
  - [ ] **Verify second session still active**

- [ ] **Run Test**

---

## ✅ Integration Tests Validation Checklist

- [ ] Short-lived token configuration working
- [ ] All 3 integration tests passing
- [ ] Token refresh mechanism validated
- [ ] Session expiration validated
- [ ] Multi-device behavior validated
- [ ] Execution time acceptable (~10-15 min with short tokens)

---

## 📊 Integration Tests Status

**Started**: **_
**Completed**: _**
**Duration**: **_ hours
**Tests Implemented**: _** / 3
**Tests Passing**: \_\_\_ / 3

---

## 🚨 Common Issues & Solutions

### Issue: Token refresh not triggering

**Solution**: Verify Supabase SDK is configured with `autoRefreshToken: true`

### Issue: Test times out waiting for token expiry

**Solution**: Use shorter token expiry (1-5 min) in test environment

### Issue: Multi-device test fails with browser context

**Solution**: Use `cy.session()` with different session IDs or use multiple Electron instances

---

## 💡 Environment Configuration

### Required Environment Variables

```bash
# .env.test
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
JWT_EXPIRY_SECONDS=300  # 5 minutes for testing
REFRESH_TOKEN_EXPIRY_SECONDS=3600  # 1 hour for testing
```

### Time Manipulation Strategies

1. **Short-lived tokens** (Recommended): Set JWT expiry to 5 minutes
2. **Clock manipulation**: Use `cy.clock()` if Supabase SDK supports it
3. **Server-side time mocking**: Mock server time for token generation
4. **Manual token expiry**: Generate pre-expired tokens via service role key

---

## 💡 Special Considerations

- ⚠️ **Token Refresh**: CRITICAL test - cannot be done with stubs
- ⚠️ **Execution Time**: These tests are inherently slow (5-15 min)
- ⚠️ **Flakiness Risk**: Time-based tests can be flaky - add proper waits and retries

---

**Next**: [Phase 5 Integration Tests](./TODO-AUTH-TESTS-PHASE-5-RECOVERY-INTEGRATION.md) ⭐⭐⭐ **CRITICAL**
**Previous**: [Phase 3 Integration Tests](./TODO-AUTH-TESTS-PHASE-3-SIGNUP-INTEGRATION.md)
**Stub Tests**: [Phase 4 Stub Tests](../TODO-AUTH-TESTS-PHASE-4-SESSION-STUBS.md) (Run these first)
**Main Plan**: [TODO-AUTH-TESTS.md](../TODO-AUTH-TESTS.md)
