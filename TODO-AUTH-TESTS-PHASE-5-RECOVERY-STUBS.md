# TODO: Authentication Tests - Phase 5: Password Recovery (Stub-Based)

**Part of**: [Authentication Flow E2E Tests Implementation](./TODO-AUTH-TESTS.md)
**Testing Strategy**: Stub-Based Testing (Frontend Validation)
**Sprint**: Week 1-2 (5 days)
**Phase Duration**: 4-5 hours
**Status**: Not Started

**Prerequisites**: [Phase 4: Session (Stubs)](./TODO-AUTH-TESTS-PHASE-4-SESSION-STUBS.md) must be completed
**See Also**: [Phase 5 Integration Tests](./integration-tests/TODO-AUTH-TESTS-PHASE-5-RECOVERY-INTEGRATION.md) ⭐⭐⭐ **HIGH PRIORITY**

---

## 🎯 Stub Testing Overview

This phase uses **stub-based testing** for password recovery UI flow using `cy.intercept()`.

**⚠️ IMPORTANT**: Password recovery **heavily requires integration testing** due to email service and token security. Stubs only test frontend UI.

**What Stubs Test**:

- ✅ Password reset request form
- ✅ Email validation UI
- ✅ Success/error message display
- ✅ Modal/page navigation
- ✅ Frontend validation logic

**What Stubs Don't Test** (CRITICAL - requires integration):

- ❌ Email delivery
- ❌ Reset token generation
- ❌ Token validation
- ❌ Password update
- ❌ Complete reset flow

**Integration Priority**: ⭐⭐⭐ **HIGHEST** - See [Phase 5 Integration Tests](./integration-tests/TODO-AUTH-TESTS-PHASE-5-RECOVERY-INTEGRATION.md)

---

## 🧪 Stub Test Strategy

### Test 5.1: Send Password Reset Email

- ✅ **Stub**: `stubPasswordResetRequest()`
- 🎯 **Tests**: Form display, email validation, success message, UI flow
- ⚡ **Why**: Tests frontend reset request flow without email service

### Test 5.2: Invalid Email Handling

- ✅ **Stub**: `stubPasswordResetRequest()` with error
- 🎯 **Tests**: Error message display, invalid email format, user not found handling
- ⚡ **Why**: Frontend validation and error handling

---

## 📊 Test Coverage Matrix (Stub Tests Only)

| Test Aspect          | Stub Coverage |
| -------------------- | ------------- |
| **Form UI**          | ✅ Primary    |
| **Email Validation** | ✅ Primary    |
| **Success Message**  | ✅ Primary    |
| **Error Display**    | ✅ Primary    |
| **API Call**         | ✅ Mocked     |

**Not Covered by Stubs** (REQUIRES INTEGRATION):

- ❌ Email service
- ❌ Reset tokens
- ❌ Token expiration
- ❌ Password change
- ❌ Complete flow

---

## 📅 Implementation Tasks

### Task 5.1: Create password-recovery.cy.ts

- [ ] **Create `cypress/e2e/authentication/password-recovery.cy.ts`**
  - [ ] Add mandatory beforeEach hooks
  - [ ] Add describe block: `'Password Recovery'`
  - [ ] Add afterEach failure capture

### Task 5.2: Test 5.1 - Send Reset Email

**Stub Implementation**: Use `stubPasswordResetRequest()`

- [ ] **Implement Test Case**

  - [ ] Visit `/`
  - [ ] Click `[data-cy="forgot-password-link"]`
  - [ ] Assert `[data-cy="forgot-password-email-input"]` visible
  - [ ] Type forgot user email
  - [ ] Click `[data-cy="send-reset-link-button"]`
  - [ ] Wait for alert/success message
  - [ ] Assert form closes or success shown

- [ ] **Run Test**

  ```bash
  SPEC=cypress/e2e/authentication/password-recovery.cy.ts npm run cypress:run:spec
  ```

- [ ] **Validate Test Catches Failures**

### Task 5.3: Test 5.2 - Validate Email Format

**Stub Implementation**: Use `stubPasswordResetRequest()` with error

- [ ] **Implement Test Case**

  - [ ] Visit `/`
  - [ ] Click forgot password link
  - [ ] Type invalid email format
  - [ ] Click send reset button
  - [ ] Assert error shown (alert or inline)
  - [ ] Assert form still visible

- [ ] **Run Test**

- [ ] **Validate Test Catches Failures** (See Mutation Testing section below)

---

## 🧬 Mutation Testing (Test Validation)

**Purpose**: Verify tests catch real application failures by intentionally breaking code.

**⚠️ IMPORTANT**: Phase 5 stub tests only validate **frontend UI**. Backend validation (email service, token security) requires integration tests.

### Test 5.1: Send Password Reset - Mutations

**Mutation 5.1a: Remove Forgot Password Link**

- [ ] **Break**: Remove `[data-cy="forgot-password-link"]` from LoginScreen
- [ ] **Expected**: Test should FAIL (link not found)
- [ ] **What This Validates**: Test uses correct selector for password reset entry point

**Mutation 5.1b: Remove Reset Request API Call**

- [ ] **Break**: Comment out `authService.resetPasswordForEmail()` call
- [ ] **Expected**: Test may still PASS (stub intercepts API call)
- [ ] **Note**: Stub tests don't validate actual API calls - only UI flow

**Mutation 5.1c: Break Success Message**

- [ ] **Break**: Remove success message display after reset request
- [ ] **Expected**: Test should FAIL (success message not shown)
- [ ] **What This Validates**: Test validates success feedback to user

**Mutation 5.1d: Skip Form Close**

- [ ] **Break**: Keep forgot password form open after successful submission
- [ ] **Expected**: Test may FAIL (form doesn't close/hide)
- [ ] **What This Validates**: Test validates UI state transition

### Test 5.2: Email Validation - Mutations

**Mutation 5.2a: Remove Email Format Validation**

- [ ] **Break**: Remove email regex validation in forgot password form
- [ ] **Expected**: Test should FAIL (no error for invalid email)
- [ ] **What This Validates**: Test validates frontend email validation

**Mutation 5.2b: Remove Error Display**

- [ ] **Break**: Remove error message display for invalid email
- [ ] **Expected**: Test should FAIL (error not shown)
- [ ] **What This Validates**: Test catches missing error UI

**Mutation 5.2c: Allow Empty Email**

- [ ] **Break**: Allow form submission with empty email field
- [ ] **Expected**: Test should FAIL (no validation error)
- [ ] **What This Validates**: Test validates required field validation

**Mutation 5.2d: Remove Form Validation**

- [ ] **Break**: Skip all form validation and allow any input
- [ ] **Expected**: Test should FAIL (validation bypassed)
- [ ] **What This Validates**: Test ensures validation exists

### Mutation Testing Workflow

```bash
# For each mutation:
# 1. Create validation branch
git checkout -b validate/recovery-mutation-[id]

# 2. Break application code (remove/comment out logic)
# 3. Run test
SPEC=cypress/e2e/authentication/password-recovery.cy.ts npm run cypress:run:spec

# 4. Verify test FAILS (or document if test passes when it shouldn't)
# 5. Restore code
git checkout feature/cypress-test-coverage
git branch -D validate/recovery-mutation-[id]
```

### What Stub Tests DON'T Validate

**❌ Email Service** - Stub doesn't send real emails

- **Solution**: Requires integration test with email service API

**❌ Reset Token Generation** - Stub doesn't create real tokens

- **Solution**: Requires integration test with Supabase

**❌ Token Expiration** - Stub doesn't validate token timing

- **Solution**: Requires integration test with real token lifecycle

**❌ Password Change** - Stub doesn't update database

- **Solution**: Requires integration test with database validation

**See**: [Phase 5 Integration Tests](./integration-tests/TODO-AUTH-TESTS-PHASE-5-RECOVERY-INTEGRATION.md) for complete password recovery validation

---

## ✅ Phase 5 Stub Tests Validation Checklist

- [ ] All 2 password recovery stub tests passing
- [ ] Suite execution time <20 seconds
- [ ] Combined auth suite (all stubs) passing
- [ ] 12 total stub tests passing
- [ ] Tests pass 5x consecutively
- [ ] **Mutation testing complete** (See Mutation Testing section above)
  - [ ] Test 5.1: 4 mutations to validate
  - [ ] Test 5.2: 4 mutations to validate
  - [ ] Total: 8 mutations to validate password recovery UI tests
  - [ ] **Note**: Backend validation requires integration tests ⭐⭐⭐

---

## 📊 Phase 5 Stub Tests Status

**Started**: **\_
**Completed**: \_**
**Duration**: **\_ hours
**Tests Implemented**: \_** / 2
**Tests Passing**: \_\_\_ / 2

---

## ⚠️ CRITICAL REMINDER

**Password recovery stub tests only validate frontend UI**. The actual recovery mechanism requires:

1. ⭐⭐⭐ **Email Service Integration** - Email must actually be sent
2. ⭐⭐⭐ **Token Security** - Token generation and validation must be real
3. ⭐⭐⭐ **Password Update** - Database password change must be tested
4. ⭐⭐⭐ **Complete Flow** - End-to-end reset flow is required

**See**: [Phase 5 Integration Tests](./integration-tests/TODO-AUTH-TESTS-PHASE-5-RECOVERY-INTEGRATION.md) for complete testing strategy

---

**Next**: [Phase 5 Integration Tests](./integration-tests/TODO-AUTH-TESTS-PHASE-5-RECOVERY-INTEGRATION.md) ⭐⭐⭐ **CRITICAL**
**Previous**: [Phase 4 Stubs](./TODO-AUTH-TESTS-PHASE-4-SESSION-STUBS.md)
**Main Plan**: [TODO-AUTH-TESTS.md](./TODO-AUTH-TESTS.md)
