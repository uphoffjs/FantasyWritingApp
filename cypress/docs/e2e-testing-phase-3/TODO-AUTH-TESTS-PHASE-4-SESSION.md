# TODO: Authentication Flow E2E Tests - Phase 4: Session Management

**Part of**: [Authentication Flow E2E Tests Implementation](./TODO-AUTH-TESTS.md)
**Based on**: [AUTH-FLOW-TEST-IMPLEMENTATION.md](claudedocs/AUTH-FLOW-TEST-IMPLEMENTATION.md)
**Sprint**: Week 1-2 (5 days)
**Phase Duration**: 4-5 hours
**Status**: Not Started

**Prerequisites**: [Phase 3: Sign-Up Flow](./TODO-AUTH-TESTS-PHASE-3-SIGNUP.md) must be completed
**Next Phase**: [Phase 5: Password Recovery](./TODO-AUTH-TESTS-PHASE-5-RECOVERY.md)

---

## 🎯 Phase 4 Overview

This phase implements session management testing, including:

- Session persistence across page reloads
- Session timeout handling
- Multi-tab authentication synchronization

**⚠️ CRITICAL**: Session management is crucial for user experience. These tests must verify proper state management.

---

## 🧪 Testing Strategy: Stub vs Integration

### ✅ **STUB-BASED TESTS** (Recommended for Phase 4)

Use **stub-based testing** for frontend session management logic:

**Test 4.1: Session Persistence Across Reload**

- ✅ **Stub**: `stubValidSession()` + `stubGetProjects()`
- 🎯 **Tests**: Session restoration from localStorage, UI state preservation, no re-login prompt
- ⚡ **Why**: Tests frontend session management, localStorage integration

**Test 4.2: Session Timeout Handling**

- ✅ **Stub**: `stubExpiredSession()` (returns 401 error)
- 🎯 **Tests**: Redirect to login on expired session, error message display, cleanup of stale data
- ⚡ **Why**: Simulates timeout without waiting for real expiration

**Test 4.3: Multi-Tab Synchronization**

- ✅ **Stub**: `stubSuccessfulLogin()` + `stubSuccessfulLogout()`
- 🎯 **Tests**: localStorage events across tabs, logout propagation, login state sync
- ⚡ **Why**: Tests frontend cross-tab communication
- 📝 **Note**: Can simulate multiple tabs using `cy.visit()` in multiple windows

### 🔄 **INTEGRATION TESTS** (Future - When Supabase Configured)

Create separate integration tests for backend session behavior:

**Integration Test 4.1: Real Token Refresh**

- 🔌 **Supabase**: Real JWT token expiration and refresh
- 🎯 **Tests**: Automatic token refresh, refresh token rotation, session extension
- 📁 **Location**: `cypress/e2e/integration/authentication/token-refresh-integration.cy.ts`
- ⏱️ **When**: Run nightly (requires real token expiration time)
- ⚠️ **Slow**: May need to mock system time or use short-lived tokens

**Integration Test 4.2: Real Session Timeout**

- 🔌 **Supabase**: Real session expiration (24 hours default)
- 🎯 **Tests**: Actual session invalidation, cleanup of expired sessions, database state
- 📁 **Location**: `cypress/e2e/integration/authentication/session-timeout-integration.cy.ts`
- ⚠️ **Very Slow**: Requires waiting for real timeout or time manipulation

**Integration Test 4.3: Cross-Device Session Management**

- 🔌 **Supabase**: Real sessions across different devices
- 🎯 **Tests**: Login from multiple devices, session limit enforcement, concurrent sessions
- 📁 **Location**: `cypress/e2e/integration/authentication/multi-device-integration.cy.ts`
- ⚠️ **Complex**: Requires multiple browser contexts or devices

### 📊 Test Coverage Matrix

| Test Aspect             | Stub Tests         | Integration Tests      |
| ----------------------- | ------------------ | ---------------------- |
| **Session Restoration** | ✅ Primary         | ✅ Secondary           |
| **localStorage**        | ✅ Primary         | ❌ Not needed          |
| **Timeout UI**          | ✅ Primary         | ❌ Not needed          |
| **Logout Propagation**  | ✅ Primary         | ❌ Not needed          |
| **Cross-Tab Events**    | ✅ Primary         | ❌ Not needed          |
| **JWT Tokens**          | ✅ Fake tokens     | 🔌 **Real (Primary)**  |
| **Token Refresh**       | ❌ Not tested      | 🔌 **Real (Primary)**  |
| **Token Expiration**    | ✅ Simulated (401) | 🔌 **Real (Primary)**  |
| **Session Limits**      | ❌ Not tested      | 🔌 **Real (Optional)** |
| **Database Cleanup**    | ❌ Not tested      | 🔌 **Real (Primary)**  |

### 🎯 Recommended Approach

**Use Stubs For**:

- ✅ Session restoration from storage
- ✅ Timeout detection and UI response
- ✅ Cross-tab synchronization logic
- ✅ Logout flow and cleanup
- ✅ Session state management

**Use Integration For**:

- 🔌 Real JWT token behavior
- 🔌 Token refresh mechanism
- 🔌 Actual session expiration
- 🔌 Cross-device session limits
- 🔌 Database session cleanup

**Special Considerations**:

- ⚠️ **Token Refresh**: Very difficult to test with stubs (requires real time-based behavior)
- ⚠️ **Session Timeout**: Use `stubExpiredSession()` for fast testing, integration for real behavior
- ✅ **Multi-Tab**: Can be fully tested with stubs using localStorage events

---

## 📅 Day 4: Session Management (4-5 hours)

### Task 4.1: Create session-management.cy.ts

- [ ] **Create `cypress/e2e/authentication/session-management.cy.ts`**
  - [ ] Add mandatory beforeEach hooks
  - [ ] Add describe block: `'Session Management'`
  - [ ] Add afterEach failure capture

### Task 4.2: Test 3.1 - Session Persistence Across Reload

- [ ] **Implement Test Case**

  - [ ] Use `cy.session()` to create authenticated session
  - [ ] Visit `/projects` directly
  - [ ] Assert no redirect to login
  - [ ] Assert project list visible
  - [ ] Reload page
  - [ ] Assert still on `/projects`

- [ ] **Run Test**

  ```bash
  SPEC=cypress/e2e/authentication/session-management.cy.ts npm run cypress:run:spec
  ```

  - [ ] Test passes
  - [ ] Session persists correctly
  - [ ] No unexpected redirects

- [ ] **Validate Test Catches Failures**

  1. ✅ Test passes with current code
  2. 🔧 `git checkout -b validate/session-persistence`
  3. 💥 Break code:
     - Remove session restoration logic on page load
     - Clear localStorage on page reload
     - Break `cy.session()` validation function
     - Remove session persistence in authStore
  4. 🧪 Run test and verify it fails
  5. ❌ Check error message is clear
  6. ↩️ `git checkout main && git branch -D validate/session-persistence`
  7. 📝 Add comment: `// * Validated: catches broken session persistence`

### Task 4.3: Test 3.2 - Session Timeout Handling

- [ ] **Implement Test Case**

  - [ ] Create session with `cy.loginAs()`
  - [ ] Visit `/projects`
  - [ ] Manually remove localStorage authToken
  - [ ] Try to visit `/projects` again
  - [ ] Assert redirected to `/` (login)

- [ ] **Run Test**

  - [ ] Test passes
  - [ ] Timeout handling works
  - [ ] Redirect behavior correct

- [ ] **Validate Test Catches Failures**

  1. ✅ Test passes with current code
  2. 🔧 `git checkout -b validate/session-timeout`
  3. 💥 Break code:
     - Remove auth check/redirect logic for expired sessions
     - Allow accessing protected routes without valid token
     - Skip session timeout detection
     - Remove redirect to login on invalid session
  4. 🧪 Run test and verify it fails
  5. ❌ Check error message is clear
  6. ↩️ `git checkout main && git branch -D validate/session-timeout`
  7. 📝 Add comment: `// * Validated: catches missing timeout handling`

### Task 4.4: Test 3.3 - Multi-Tab Auth Sync

- [ ] **Implement Test Case**

  - [ ] Sign in successfully
  - [ ] Navigate to `/projects`
  - [ ] Simulate storage event (logout in another tab)
  - [ ] Wait briefly for event propagation
  - [ ] Assert current tab reacts (redirects or shows logged out)

- [ ] **Run Test**

  - [ ] Test passes
  - [ ] Multi-tab sync works (if implemented)
  - [ ] OR document that feature not yet implemented

- [ ] **Validate Test Catches Failures**

  1. ✅ Test passes with current code
  2. 🔧 `git checkout -b validate/multi-tab-sync`
  3. 💥 Break code:
     - Remove storage event listener in authStore
     - Skip cross-tab auth state synchronization
     - Remove `onAuthStateChange()` listener
     - Break Zustand persist middleware sync
  4. 🧪 Run test and verify it fails
  5. ❌ Check error message is clear
  6. ↩️ `git checkout main && git branch -D validate/multi-tab-sync`
  7. 📝 Add comment: `// * Validated: catches missing multi-tab sync`

---

### Task 4.4: Comprehensive Mutation Testing (Final Validation)

**Objective**: Validate that all session tests catch application code failures

**Application Code Mutations to Test**:

**Test 4.1: Session Persistence**

- [ ] Mutation 4.1a: Remove localStorage persistence logic
- [ ] Mutation 4.1b: Break session restoration on reload
- [ ] Mutation 4.1c: Skip auth state rehydration

**Test 4.2: Session Expiration**

- [ ] Mutation 4.2a: Remove session expiration check
- [ ] Mutation 4.2b: Allow expired sessions to stay active
- [ ] Mutation 4.2c: Break automatic logout on expiry

**Test 4.3: Multi-Tab Synchronization**

- [ ] Mutation 4.3a: Remove storage event listener
- [ ] Mutation 4.3b: Skip cross-tab state synchronization
- [ ] Mutation 4.3c: Break onAuthStateChange listener

**Documentation**:

- [ ] Create mutation testing report
- [ ] Add validation comments to test file
- [ ] Calculate quality score (target: >85%)

---

## ✅ Phase 4 Validation Checklist

- [ ] All 3 session tests passing
- [ ] Suite execution time <30 seconds
- [ ] Combined auth suite (signin + signup + session) passing
- [ ] 10 total tests passing
- [ ] Combined execution time <100 seconds
- [ ] Tests pass 5x consecutively
- [ ] **Mutation testing complete** (All session tests verified to catch application failures)
- [ ] **Validation comments added** (Test file documents what failures each test catches)
- [ ] **Mutation testing report created** (Quality score calculated and documented)
- [ ] **READY TO PROCEED TO PHASE 5**

---

## 📊 Phase 4 Status

**Started**: **\*\*\*\***\_**\*\*\*\***
**Completed**: **\*\*\*\***\_**\*\*\*\***
**Duration**: \***\*\_\*\*** hours
**Tests Implemented**: **\_** / 3
**Tests Passing**: **\_** / 3
**Blockers**: **\*\*\*\***\_**\*\*\*\***
**Notes**: **\*\*\*\***\_**\*\*\*\***

---

## 🚨 Common Issues & Solutions

### Issue: cy.session() not caching properly

**Solution**: Ensure session validation function is properly checking localStorage and returns boolean

### Issue: Storage event not triggering in test

**Solution**: Use `cy.window().then(win => win.localStorage.removeItem('authToken'))` then trigger storage event manually

### Issue: Redirect assertion fails intermittently

**Solution**: Add proper wait before asserting URL: `cy.url().should('include', '/')` with default timeout

---

## 📋 Test Execution Log

| Run | Date | Time | Pass/Fail | Notes |
| --- | ---- | ---- | --------- | ----- |
| 1   |      |      |           |       |
| 2   |      |      |           |       |
| 3   |      |      |           |       |
| 4   |      |      |           |       |
| 5   |      |      |           |       |

---

## 📈 Combined Test Suite Progress

**Total Tests**: 10 (3 signin + 4 signup + 3 session)
**Passing**: **\_** / 10
**Execution Time**: **\_** seconds (target: <100s)

---

## 💡 Session Management Notes

### Multi-Tab Sync Implementation Status

- [ ] Feature is implemented in codebase
- [ ] Feature not yet implemented (skip test or mark as pending)

### localStorage Keys Used

From Phase 0 Q2:

- `authToken`: **\*\*\*\***\_**\*\*\*\***
- `authUser`: **\*\*\*\***\_**\*\*\*\***
- Other: **\*\*\*\***\_**\*\*\*\***

---

**Previous Phase**: [TODO-AUTH-TESTS-PHASE-3-SIGNUP.md](./TODO-AUTH-TESTS-PHASE-3-SIGNUP.md)
**Next Phase**: [TODO-AUTH-TESTS-PHASE-5-RECOVERY.md](./TODO-AUTH-TESTS-PHASE-5-RECOVERY.md)
