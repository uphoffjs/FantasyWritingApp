# TODO: Authentication Flow E2E Tests - Phase 2: Sign-In Flow

**Part of**: [Authentication Flow E2E Tests Implementation](./TODO-AUTH-TESTS.md)
**Based on**: [AUTH-FLOW-TEST-IMPLEMENTATION.md](claudedocs/AUTH-FLOW-TEST-IMPLEMENTATION.md)
**Sprint**: Week 1-2 (5 days)
**Phase Duration**: 4-5 hours
**Status**: Not Started

**Prerequisites**: [Phase 1: Infrastructure](./TODO-AUTH-TESTS-PHASE-1-INFRASTRUCTURE.md) must be completed
**Next Phase**: [Phase 3: Sign-Up Flow](./TODO-AUTH-TESTS-PHASE-3-SIGNUP.md)

---

## 🎯 Phase 2 Overview

This phase implements the critical path for authentication - the sign-in flow. These tests verify:

- Successful user authentication (happy path)
- Invalid credentials rejection
- "Remember Me" functionality

**⚠️ CRITICAL**: These are P0 tests. They must be rock-solid with 0% flakiness before proceeding.

---

## 📅 Day 2: Critical Path - Sign-In Flow (4-5 hours)

### Task 2.1: Create signin-flow.cy.ts

- [ ] **Create `cypress/e2e/authentication/signin-flow.cy.ts`**
  - [ ] Add file header with `/// <reference types="cypress" />`
  - [ ] Add describe block: `'User Sign In Flow'`
  - [ ] Add mandatory beforeEach hooks (clearCookies, clearLocalStorage, debug)
  - [ ] Add afterEach failure capture

### Task 2.2: Test 2.1 - Successful Sign-In (Happy Path) ⭐

- [ ] **Implement Test Case**

  - [ ] Seed `validUser` before test
  - [ ] Visit `/` (login page)
  - [ ] Verify on signin tab
  - [ ] Type email into `[data-cy="email-input"]`
  - [ ] Type password into `[data-cy="password-input"]`
  - [ ] Click `[data-cy="submit-button"]`
  - [ ] Assert URL includes `/projects`
  - [ ] Assert localStorage has `authToken`

- [ ] **Run Test Individually**
  ```bash
  SPEC=cypress/e2e/authentication/signin-flow.cy.ts npm run cypress:run:spec
  ```
  - [ ] Test passes on first run
  - [ ] Test passes 3 times consecutively
  - [ ] Execution time <10 seconds

### Task 2.3: Test 2.2 - Reject Invalid Credentials

- [ ] **Implement Test Case**

  - [ ] Visit `/` (no seeding needed)
  - [ ] Type invalid email
  - [ ] Type wrong password
  - [ ] Click submit button
  - [ ] Assert `[data-cy="error-container"]` visible
  - [ ] Assert error message contains "invalid|incorrect|wrong"
  - [ ] Assert URL does NOT include `/projects`

- [ ] **Run Test**
  ```bash
  SPEC=cypress/e2e/authentication/signin-flow.cy.ts npm run cypress:run:spec
  ```
  - [ ] Test passes
  - [ ] Error message displayed correctly
  - [ ] No false positives

### Task 2.4: Test 2.3 - Remember Me Persistence

- [ ] **Implement Test Case**

  - [ ] Seed `rememberUser`
  - [ ] Visit `/`
  - [ ] Type credentials
  - [ ] Click `[data-cy="remember-me-switch"]` to enable
  - [ ] Click submit
  - [ ] Assert navigated to `/projects`
  - [ ] Reload page with `cy.reload()`
  - [ ] Assert still on `/projects` (session persisted)

- [ ] **Run Test**
  ```bash
  SPEC=cypress/e2e/authentication/signin-flow.cy.ts npm run cypress:run:spec
  ```
  - [ ] Test passes
  - [ ] Session persists after reload
  - [ ] No flakiness

---

## ✅ Phase 2 Validation Checklist

- [ ] All 3 signin tests passing
- [ ] Suite execution time <30 seconds
- [ ] Tests pass 5x consecutively (flakiness check)
- [ ] All assertions working correctly
- [ ] Docker compatibility verified:
  ```bash
  SPEC=cypress/e2e/authentication/signin-flow.cy.ts npm run cypress:docker:test:spec
  ```
- [ ] **READY TO PROCEED TO PHASE 3**

---

## 📊 Phase 2 Status

**Started**: ********\_********
**Completed**: ********\_********
**Duration**: ****\_**** hours
**Tests Implemented**: **\_** / 3
**Tests Passing**: **\_** / 3
**Blockers**: ********\_********
**Notes**: ********\_********

---

## 🚨 Common Issues & Solutions

### Issue: Test fails on "remember me" reload

**Solution**: Ensure `cy.reload()` includes proper wait for localStorage to persist

### Issue: Invalid credentials test shows false positive

**Solution**: Verify error selector matches actual error display element from Phase 0 Q3

### Issue: Flaky navigation assertion

**Solution**: Use `cy.url().should('include', '/projects')` instead of `cy.location('pathname').should('eq', '/projects')`

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

**Previous Phase**: [TODO-AUTH-TESTS-PHASE-1-INFRASTRUCTURE.md](./TODO-AUTH-TESTS-PHASE-1-INFRASTRUCTURE.md)
**Next Phase**: [TODO-AUTH-TESTS-PHASE-3-SIGNUP.md](./TODO-AUTH-TESTS-PHASE-3-SIGNUP.md)
