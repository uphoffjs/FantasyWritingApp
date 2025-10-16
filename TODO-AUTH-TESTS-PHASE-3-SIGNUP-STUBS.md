# TODO: Authentication Tests - Phase 3: Sign-Up Flow (Stub-Based)

**Part of**: [Authentication Flow E2E Tests Implementation](./TODO-AUTH-TESTS.md)
**Testing Strategy**: Stub-Based Testing (Frontend Validation)
**Sprint**: Week 1-2 (5 days)
**Phase Duration**: 4-5 hours
**Status**: Not Started

**Prerequisites**: [Phase 2: Sign-In (Stubs)](./TODO-AUTH-TESTS-PHASE-2-SIGNIN-STUBS.md) must be completed
**See Also**: [Phase 3 Integration Tests](./integration-tests/TODO-AUTH-TESTS-PHASE-3-SIGNUP-INTEGRATION.md)

---

## 🎯 Stub Testing Overview

This phase uses **stub-based testing** for signup flow frontend validation using `cy.intercept()` to mock Supabase API calls.

**What Stubs Test**:

- ✅ Form validation logic
- ✅ Password matching
- ✅ Error message display
- ✅ Navigation flows
- ✅ UX feedback (loading states, success messages)

**What Stubs Don't Test**: Database user creation, email verification, duplicate checks at database level (see integration tests)

---

## 🧪 Stub Test Strategy

### Test 3.1: Successful Sign-Up (Happy Path)

- ✅ **Stub**: `stubSuccessfulSignup()` + `stubGetProjects()`
- 🎯 **Tests**: Form validation, UI flow, password matching, navigation after signup
- ⚡ **Why**: Fast execution, tests frontend registration logic

### Test 3.2: Duplicate Email Prevention

- ✅ **Stub**: `stubFailedSignup('User already registered')`
- 🎯 **Tests**: Error display, duplicate email error message, no navigation
- ⚡ **Why**: Deterministic error simulation, no database dependency

### Test 3.3: Password Requirements Validation

- ✅ **Stub**: `stubFailedSignup('Password does not meet requirements')`
- 🎯 **Tests**: Password strength indicators, validation errors, UX feedback
- ⚡ **Why**: Frontend validation logic, no backend needed

### Test 3.4: Password Confirmation Mismatch

- ✅ **Stub**: No stub needed (pure frontend validation)
- 🎯 **Tests**: Client-side validation, error message, disabled submit button
- ⚡ **Why**: Frontend-only logic, instant feedback

---

## 📊 Test Coverage Matrix (Stub Tests Only)

| Test Aspect           | Stub Coverage |
| --------------------- | ------------- |
| **Form Validation**   | ✅ Primary    |
| **Password Matching** | ✅ Primary    |
| **Password Strength** | ✅ Primary    |
| **Error Display**     | ✅ Primary    |
| **Navigation**        | ✅ Primary    |
| **API Calls**         | ✅ Mocked     |
| **Duplicate Check**   | ✅ Simulated  |

**Not Covered by Stubs**: Database insert, email service, verification tokens (see integration tests)

---

## 📅 Implementation Tasks

### Task 3.1: Create signup-flow.cy.ts

- [ ] **Create `cypress/e2e/authentication/signup-flow.cy.ts`**
  - [ ] Add mandatory beforeEach hooks
  - [ ] Add describe block: `'User Sign Up Flow'`
  - [ ] Add afterEach failure capture

### Task 3.2: Test 3.1 - Successful Sign-Up (Happy Path) ⭐

**Stub Implementation**: Use `stubSuccessfulSignup()` + `stubGetProjects()`

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

- [ ] **Validate Test Catches Failures**
  - Use mutation testing to verify test catches broken signup logic

### Task 3.3: Test 3.2 - Prevent Duplicate Email

**Stub Implementation**: Use `stubFailedSignup('User already registered')`

- [ ] **Implement Test Case**

  - [ ] Visit `/`
  - [ ] Switch to signup tab
  - [ ] Try to register with existing email
  - [ ] Click submit
  - [ ] Assert error message contains "already registered"
  - [ ] Assert still on login page

- [ ] **Run Test**

- [ ] **Validate Test Catches Failures**

### Task 3.4: Test 3.3 - Validate Password Requirements

**Stub Implementation**: Use `stubFailedSignup('Password does not meet requirements')`

- [ ] **Implement Test Case**

  - [ ] Visit `/`, switch to signup
  - [ ] Enter valid email
  - [ ] Enter password too short (e.g., "12345")
  - [ ] Enter same in confirm
  - [ ] Click submit
  - [ ] Assert error: "at least 6 characters"

- [ ] **Run Test**

- [ ] **Validate Test Catches Failures**

### Task 3.5: Test 3.4 - Password Match Validation

**Stub Implementation**: No stub needed (pure frontend)

- [ ] **Implement Test Case**

  - [ ] Visit `/`, switch to signup
  - [ ] Enter valid email
  - [ ] Enter valid password
  - [ ] Enter different password in confirm
  - [ ] Click submit
  - [ ] Assert error: "do not match"

- [ ] **Run Test**

- [ ] **Validate Test Catches Failures**

---

## ✅ Phase 3 Stub Tests Validation Checklist

- [ ] All 4 signup stub tests passing
- [ ] Suite execution time <40 seconds
- [ ] Combined auth suite (signin + signup stubs) passing
- [ ] 7 total tests passing
- [ ] Tests pass 5x consecutively
- [ ] Mutation testing complete

---

## 📊 Phase 3 Stub Tests Status

**Started**: **_
**Completed**: _**
**Duration**: **_ hours
**Tests Implemented**: _** / 4
**Tests Passing**: \_\_\_ / 4

---

## 🚨 Common Issues & Solutions

### Issue: Tab switching not working

**Solution**: Verify signup tab button selector is correct, may need to add `data-cy` attribute

### Issue: Password validation not triggering

**Solution**: Check if validation happens on submit or on blur - adjust test accordingly

---

**Next**: [Phase 3 Integration Tests](./integration-tests/TODO-AUTH-TESTS-PHASE-3-SIGNUP-INTEGRATION.md)
**Previous**: [Phase 2 Stubs](./TODO-AUTH-TESTS-PHASE-2-SIGNIN-STUBS.md)
**Main Plan**: [TODO-AUTH-TESTS.md](./TODO-AUTH-TESTS.md)
