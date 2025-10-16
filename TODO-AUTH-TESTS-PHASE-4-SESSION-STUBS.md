# TODO: Authentication Tests - Phase 4: Session Management (Stub-Based)

**Part of**: [Authentication Flow E2E Tests Implementation](./TODO-AUTH-TESTS.md)
**Testing Strategy**: Stub-Based Testing (Frontend Validation)
**Sprint**: Week 1-2 (5 days)
**Phase Duration**: 4-5 hours
**Status**: Not Started

**Prerequisites**: [Phase 3: Sign-Up (Stubs)](./TODO-AUTH-TESTS-PHASE-3-SIGNUP-STUBS.md) must be completed
**See Also**: [Phase 4 Integration Tests](./integration-tests/TODO-AUTH-TESTS-PHASE-4-SESSION-INTEGRATION.md)

---

## 🎯 Stub Testing Overview

This phase uses **stub-based testing** for frontend session management logic using `cy.intercept()` to mock session behavior.

**What Stubs Test**:

- ✅ Session restoration from localStorage
- ✅ Timeout detection and UI response
- ✅ Cross-tab synchronization logic
- ✅ Logout flow and cleanup
- ✅ Session state management

**What Stubs Don't Test**: Real JWT token behavior, token refresh, actual expiration (see integration tests)

---

## 🧪 Stub Test Strategy

### Test 4.1: Session Persistence Across Reload

- ✅ **Stub**: `stubValidSession()` + `stubGetProjects()`
- 🎯 **Tests**: Session restoration from localStorage, UI state preservation, no re-login prompt
- ⚡ **Why**: Tests frontend session management, localStorage integration

### Test 4.2: Session Timeout Handling

- ✅ **Stub**: `stubExpiredSession()` (returns 401 error)
- 🎯 **Tests**: Redirect to login on expired session, error message display, cleanup of stale data
- ⚡ **Why**: Simulates timeout without waiting for real expiration

### Test 4.3: Multi-Tab Synchronization

- ✅ **Stub**: `stubSuccessfulLogin()` + `stubSuccessfulLogout()`
- 🎯 **Tests**: localStorage events across tabs, logout propagation, login state sync
- ⚡ **Why**: Tests frontend cross-tab communication
- 📝 **Note**: Can simulate multiple tabs using `cy.visit()` in multiple windows

---

## 📊 Test Coverage Matrix (Stub Tests Only)

| Test Aspect             | Stub Coverage      |
| ----------------------- | ------------------ |
| **Session Restoration** | ✅ Primary         |
| **localStorage**        | ✅ Primary         |
| **Timeout UI**          | ✅ Primary         |
| **Logout Propagation**  | ✅ Primary         |
| **Cross-Tab Events**    | ✅ Primary         |
| **JWT Tokens**          | ✅ Fake tokens     |
| **Token Expiration**    | ✅ Simulated (401) |

**Not Covered by Stubs**: Token refresh, real expiration, database cleanup (see integration tests)

---

## 📅 Implementation Tasks

### Task 4.1: Create session-management.cy.ts

- [ ] **Create `cypress/e2e/authentication/session-management.cy.ts`**
  - [ ] Add mandatory beforeEach hooks
  - [ ] Add describe block: `'Session Management'`
  - [ ] Add afterEach failure capture

### Task 4.2: Test 4.1 - Session Persistence Across Reload

**Stub Implementation**: Use `stubValidSession()` + `stubGetProjects()`

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

- [ ] **Validate Test Catches Failures**

### Task 4.3: Test 4.2 - Session Timeout Handling

**Stub Implementation**: Use `stubExpiredSession()` (returns 401)

- [ ] **Implement Test Case**

  - [ ] Create session with `cy.loginAs()`
  - [ ] Visit `/projects`
  - [ ] Manually remove localStorage authToken
  - [ ] Try to visit `/projects` again
  - [ ] Assert redirected to `/` (login)

- [ ] **Run Test**

- [ ] **Validate Test Catches Failures**

### Task 4.4: Test 4.3 - Multi-Tab Auth Sync

**Stub Implementation**: Use `stubSuccessfulLogin()` + localStorage events

- [ ] **Implement Test Case**

  - [ ] Sign in successfully
  - [ ] Navigate to `/projects`
  - [ ] Simulate storage event (logout in another tab)
  - [ ] Wait briefly for event propagation
  - [ ] Assert current tab reacts (redirects or shows logged out)

- [ ] **Run Test**

- [ ] **Validate Test Catches Failures** (See Mutation Testing section below)

---

## 🧬 Mutation Testing (Test Validation)

**Purpose**: Verify tests catch real application failures by intentionally breaking code.

### Test 4.1: Session Persistence - Mutations

**Mutation 4.1a: Remove localStorage Persistence**

- [ ] **Break**: Remove logic that saves session to localStorage
- [ ] **Expected**: Test should FAIL (session not persisted after reload)
- [ ] **What This Validates**: Test catches broken session persistence

**Mutation 4.1b: Break Session Restoration**

- [ ] **Break**: Remove logic that restores session from localStorage on page load
- [ ] **Expected**: Test should FAIL (redirect to login after reload)
- [ ] **What This Validates**: Test validates session restoration logic

**Mutation 4.1c: Skip Auth State Rehydration**

- [ ] **Break**: Remove auth state rehydration logic in authStore
- [ ] **Expected**: Test should FAIL (user appears logged out after reload)
- [ ] **What This Validates**: Test catches missing state management logic

**Mutation 4.1d: Break cy.session() Validation**

- [ ] **Break**: Return false from cy.session() validation function
- [ ] **Expected**: Test should recreate session (may still pass, but less efficient)
- [ ] **What This Validates**: Session caching optimization

### Test 4.2: Session Timeout - Mutations

**Mutation 4.2a: Remove Session Expiration Check**

- [ ] **Break**: Remove logic that checks if session is expired
- [ ] **Expected**: Test should FAIL (no redirect to login when token removed)
- [ ] **What This Validates**: Test validates timeout detection

**Mutation 4.2b: Allow Expired Sessions**

- [ ] **Break**: Allow accessing protected routes with invalid/missing token
- [ ] **Expected**: Test should FAIL (no redirect when it should occur)
- [ ] **What This Validates**: Test catches security bypass

**Mutation 4.2c: Break Automatic Logout**

- [ ] **Break**: Remove automatic logout logic on session expiry
- [ ] **Expected**: Test should FAIL (user not logged out properly)
- [ ] **What This Validates**: Test validates expiry handling

**Mutation 4.2d: Skip Session Cleanup**

- [ ] **Break**: Remove localStorage cleanup on logout/expiry
- [ ] **Expected**: Test may still PASS (stub focuses on redirect)
- [ ] **Note**: Cleanup validation requires additional assertions

### Test 4.3: Multi-Tab Sync - Mutations

**Mutation 4.3a: Remove Storage Event Listener**

- [ ] **Break**: Remove `window.addEventListener('storage', ...)` listener
- [ ] **Expected**: Test should FAIL (no cross-tab sync)
- [ ] **What This Validates**: Test validates event listener setup

**Mutation 4.3b: Skip Cross-Tab Synchronization**

- [ ] **Break**: Remove logic that synchronizes auth state across tabs
- [ ] **Expected**: Test should FAIL (tabs don't react to logout)
- [ ] **What This Validates**: Test catches broken sync logic

**Mutation 4.3c: Break onAuthStateChange Listener**

- [ ] **Break**: Remove Zustand or Supabase `onAuthStateChange()` subscription
- [ ] **Expected**: Test should FAIL (state changes not detected)
- [ ] **What This Validates**: Test validates state change detection

**Mutation 4.3d: Disable Zustand Persist Middleware**

- [ ] **Break**: Remove or break Zustand persist middleware configuration
- [ ] **Expected**: Test may FAIL (depends on implementation)
- [ ] **What This Validates**: Test validates state persistence mechanism

### Mutation Testing Workflow

```bash
# For each mutation:
# 1. Create validation branch
git checkout -b validate/session-mutation-[id]

# 2. Break application code (remove/comment out logic)
# 3. Run test
SPEC=cypress/e2e/authentication/session-management.cy.ts npm run cypress:run:spec

# 4. Verify test FAILS (or document expected behavior)
# 5. Restore code
git checkout feature/cypress-test-coverage
git branch -D validate/session-mutation-[id]
```

---

## ✅ Phase 4 Stub Tests Validation Checklist

- [ ] All 3 session stub tests passing
- [ ] Suite execution time <30 seconds
- [ ] Combined auth suite (signin + signup + session stubs) passing
- [ ] 10 total stub tests passing
- [ ] Tests pass 5x consecutively
- [ ] **Mutation testing complete** (See Mutation Testing section above)
  - [ ] Test 4.1: 4 mutations to validate
  - [ ] Test 4.2: 4 mutations to validate
  - [ ] Test 4.3: 4 mutations to validate
  - [ ] Total: 12 mutations to validate session test quality

---

## 📊 Phase 4 Stub Tests Status

**Started**: **\_
**Completed**: \_**
**Duration**: **\_ hours
**Tests Implemented**: \_** / 3
**Tests Passing**: \_\_\_ / 3

---

## 🚨 Common Issues & Solutions

### Issue: cy.session() not caching properly

**Solution**: Ensure session validation function is properly checking localStorage and returns boolean

### Issue: Storage event not triggering in test

**Solution**: Use `cy.window().then(win => win.localStorage.removeItem('authToken'))` then trigger storage event manually

### Issue: Redirect assertion fails intermittently

**Solution**: Add proper wait before asserting URL: `cy.url().should('include', '/')` with default timeout

---

## 💡 Special Considerations

- ⚠️ **Token Refresh**: Very difficult to test with stubs (requires real time-based behavior) - see integration tests
- ⚠️ **Session Timeout**: Use `stubExpiredSession()` for fast testing
- ✅ **Multi-Tab**: Can be fully tested with stubs using localStorage events

---

**Next**: [Phase 4 Integration Tests](./integration-tests/TODO-AUTH-TESTS-PHASE-4-SESSION-INTEGRATION.md)
**Previous**: [Phase 3 Stubs](./TODO-AUTH-TESTS-PHASE-3-SIGNUP-STUBS.md)
**Main Plan**: [TODO-AUTH-TESTS.md](./TODO-AUTH-TESTS.md)
