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

- [ ] **Validate Test Catches Failures**

---

## ✅ Phase 4 Stub Tests Validation Checklist

- [ ] All 3 session stub tests passing
- [ ] Suite execution time <30 seconds
- [ ] Combined auth suite (signin + signup + session stubs) passing
- [ ] 10 total stub tests passing
- [ ] Tests pass 5x consecutively
- [ ] Mutation testing complete

---

## 📊 Phase 4 Stub Tests Status

**Started**: **_
**Completed**: _**
**Duration**: **_ hours
**Tests Implemented**: _** / 3
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
