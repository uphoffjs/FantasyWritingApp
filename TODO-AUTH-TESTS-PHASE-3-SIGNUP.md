# TODO: Authentication Flow E2E Tests - Phase 3: Sign-Up Flow

**Part of**: [Authentication Flow E2E Tests Implementation](./TODO-AUTH-TESTS.md)
**Based on**: [AUTH-FLOW-TEST-IMPLEMENTATION.md](claudedocs/AUTH-FLOW-TEST-IMPLEMENTATION.md)
**Sprint**: Week 1-2 (5 days)
**Phase Duration**: 4-5 hours
**Status**: Not Started

**Prerequisites**: [Phase 2: Sign-In Flow](./TODO-AUTH-TESTS-PHASE-2-SIGNIN.md) must be completed
**Next Phase**: [Phase 4: Session Management](./TODO-AUTH-TESTS-PHASE-4-SESSION.md)

---

## 🎯 Phase 3 Overview

This phase implements user registration testing, including:

- Successful account creation (happy path)
- Duplicate email prevention
- Password requirement validation
- Password confirmation matching

**⚠️ CRITICAL**: These tests must validate all registration business rules to prevent data quality issues.

---

## 📅 Day 3: Sign-Up Flow (4-5 hours)

### Task 3.1: Create signup-flow.cy.ts

- [ ] **Create `cypress/e2e/authentication/signup-flow.cy.ts`**
  - [ ] Add mandatory beforeEach hooks
  - [ ] Add describe block: `'User Sign Up Flow'`
  - [ ] Add afterEach failure capture

### Task 3.2: Test 1.1 - Successful Sign-Up (Happy Path) ⭐

- [ ] **Implement Test Case**

  - [ ] Visit `/`
  - [ ] Click `[data-cy="signup-tab-button"]`
  - [ ] Type `newuser@test.com` into email
  - [ ] Type `Test123!@#` into password
  - [ ] Type `Test123!@#` into confirm password
  - [ ] Click submit
  - [ ] Assert URL includes `/projects`
  - [ ] (Optional) Assert "Account Created" message

- [ ] **Run Test**
  ```bash
  SPEC=cypress/e2e/authentication/signup-flow.cy.ts npm run cypress:run:spec
  ```
  - [ ] Test passes
  - [ ] Account created successfully
  - [ ] No errors

### Task 3.3: Test 1.2 - Prevent Duplicate Email

- [ ] **Implement Test Case**

  - [ ] Seed `existingUser` first
  - [ ] Visit `/`
  - [ ] Switch to signup tab
  - [ ] Try to register with same email
  - [ ] Click submit
  - [ ] Assert error message contains "already registered"
  - [ ] Assert still on login page

- [ ] **Run Test**
  ```bash
  SPEC=cypress/e2e/authentication/signup-flow.cy.ts npm run cypress:run:spec
  ```
  - [ ] Test passes
  - [ ] Duplicate prevention works
  - [ ] Error message clear

### Task 3.4: Test 1.3 - Validate Password Requirements

- [ ] **Implement Test Case**

  - [ ] Visit `/`, switch to signup
  - [ ] Enter valid email
  - [ ] Enter password too short (e.g., "12345")
  - [ ] Enter same in confirm
  - [ ] Click submit
  - [ ] Assert error: "at least 6 characters"

- [ ] **Run Test**
  - [ ] Test passes
  - [ ] Validation working correctly
  - [ ] Error message accurate

### Task 3.5: Test 1.4 - Password Match Validation

- [ ] **Implement Test Case**

  - [ ] Visit `/`, switch to signup
  - [ ] Enter valid email
  - [ ] Enter valid password
  - [ ] Enter different password in confirm
  - [ ] Click submit
  - [ ] Assert error: "do not match"

- [ ] **Run Test**
  - [ ] Test passes
  - [ ] Mismatch detected correctly
  - [ ] Error displayed properly

---

## ✅ Phase 3 Validation Checklist

- [ ] All 4 signup tests passing
- [ ] Suite execution time <40 seconds
- [ ] Combined auth suite (signin + signup) passing:
  ```bash
  npm run cypress:run -- --spec "cypress/e2e/authentication/{signin,signup}*.cy.ts"
  ```
- [ ] 7 total tests passing
- [ ] Combined execution time <70 seconds
- [ ] Tests pass 5x consecutively
- [ ] **READY TO PROCEED TO PHASE 4**

---

## 📊 Phase 3 Status

**Started**: ********\_********
**Completed**: ********\_********
**Duration**: ****\_**** hours
**Tests Implemented**: **\_** / 4
**Tests Passing**: **\_** / 4
**Blockers**: ********\_********
**Notes**: ********\_********

---

## 🚨 Common Issues & Solutions

### Issue: Duplicate email test passes when it should fail

**Solution**: Ensure `existingUser` is seeded in a `before()` or `beforeEach()` hook, not inside the test

### Issue: Password validation not triggering

**Solution**: Check if validation happens on submit or on blur - adjust test accordingly

### Issue: Tab switching not working

**Solution**: Verify signup tab button selector is correct, may need to add `data-cy` attribute

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

**Total Tests**: 7 (3 signin + 4 signup)
**Passing**: **\_** / 7
**Execution Time**: **\_** seconds (target: <70s)

---

**Previous Phase**: [TODO-AUTH-TESTS-PHASE-2-SIGNIN.md](./TODO-AUTH-TESTS-PHASE-2-SIGNIN.md)
**Next Phase**: [TODO-AUTH-TESTS-PHASE-4-SESSION.md](./TODO-AUTH-TESTS-PHASE-4-SESSION.md)
