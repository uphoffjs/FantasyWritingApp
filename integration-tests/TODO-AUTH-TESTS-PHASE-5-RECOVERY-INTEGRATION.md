# TODO: Authentication Tests - Phase 5: Password Recovery (Integration) ⭐⭐⭐

**Part of**: [Authentication Flow E2E Tests Implementation](../TODO-AUTH-TESTS.md)
**Testing Strategy**: Integration Testing (Backend + Frontend + Email Service)
**Priority**: ⭐⭐⭐ **HIGHEST PRIORITY FOR INTEGRATION TESTS**
**Status**: Future Work

**Prerequisites**: Supabase environment configured, email service configured
**See Also**: [Phase 5 Stub Tests](../TODO-AUTH-TESTS-PHASE-5-RECOVERY-STUBS.md) (Frontend UI only)

---

## 🎯 Integration Testing Overview

Password recovery **requires extensive integration testing** due to:

1. ⭐⭐⭐ **Email Service** - Cannot be stubbed effectively
2. ⭐⭐⭐ **Token Security** - Generation and validation must be real
3. ⭐⭐⭐ **Password Update** - Database operation must be tested
4. ⭐⭐⭐ **Complete Flow** - End-to-end validation required

**⚠️ CRITICAL**: Unlike other phases, password recovery integration tests are **NOT OPTIONAL**.

---

## 🧪 Integration Test Strategy

### Integration Test 5.1: Real Password Reset Email ⭐⭐⭐

- 🔌 **Supabase**: Real `supabase.auth.resetPasswordForEmail()` call
- 🎯 **Tests**: Email actually sent, reset link generated, token created in database
- 📁 **Location**: `cypress/e2e/integration/authentication/password-reset-integration.cy.ts`
- ⏱️ **When**: Run nightly (requires email service)
- ⚠️ **Complex**: Requires email service integration

### Integration Test 5.2: Complete Reset Flow End-to-End ⭐⭐⭐

- 🔌 **Supabase**: Full flow (request → email → token → reset → login)
- 🎯 **Tests**:
  - Request reset email
  - Extract token from email
  - Click reset link
  - Enter new password
  - Verify password changed in database
  - Login with new password
- 📁 **Location**: `cypress/e2e/integration/authentication/full-reset-flow-integration.cy.ts`
- ⚠️ **Very Complex**: Requires email parsing, token extraction, multiple API calls

### Integration Test 5.3: Token Expiration ⭐⭐⭐

- 🔌 **Supabase**: Real token expiration (1-24 hours)
- 🎯 **Tests**: Expired token rejection, error messaging, re-request flow
- 📁 **Location**: `cypress/e2e/integration/authentication/reset-token-expiration-integration.cy.ts`
- ⚠️ **Very Slow**: Requires waiting for token expiration or time manipulation

---

## 📊 Test Coverage Matrix (Integration Tests)

| Test Aspect          | Integration Coverage (CRITICAL) |
| -------------------- | ------------------------------- |
| **Email Service**    | 🔌 **Real (PRIMARY)** ⭐⭐⭐    |
| **Reset Token**      | 🔌 **Real (PRIMARY)** ⭐⭐⭐    |
| **Token Expiration** | 🔌 **Real (PRIMARY)** ⭐⭐⭐    |
| **Password Change**  | 🔌 **Real (PRIMARY)** ⭐⭐⭐    |
| **Complete Flow**    | 🔌 **Real (PRIMARY)** ⭐⭐⭐    |

---

## 📅 Implementation Tasks

### Task 5.1: Environment Setup

- [ ] **Configure Email Service**
  - [ ] Set up test email inbox with API access
  - [ ] Configure Supabase password reset email template
  - [ ] Add email service credentials to `.env.test`
  - [ ] Test email retrieval API

### Task 5.2: Integration Test 5.1 - Real Reset Email ⭐⭐⭐

- [ ] **Implement Test Case**

  - [ ] Create test user (or use existing)
  - [ ] Visit `/`
  - [ ] Click forgot password link
  - [ ] Enter test user email
  - [ ] Click send reset button
  - [ ] **Verify email sent** via email service API
  - [ ] **Extract reset link** from email HTML/text
  - [ ] **Verify reset token** exists in Supabase
  - [ ] Assert success message displayed

- [ ] **Run Test**
  ```bash
  SPEC=cypress/e2e/integration/authentication/password-reset-integration.cy.ts npm run cypress:run:spec
  ```

### Task 5.3: Integration Test 5.2 - Complete Reset Flow ⭐⭐⭐

- [ ] **Implement Test Case**

  - [ ] **Step 1: Request Reset**
    - [ ] Visit `/`, click forgot password
    - [ ] Enter test user email
    - [ ] Submit reset request
  - [ ] **Step 2: Extract Token**
    - [ ] Retrieve email via API
    - [ ] Parse reset link from email
    - [ ] Extract token from URL
  - [ ] **Step 3: Reset Password**
    - [ ] Visit reset link (with token)
    - [ ] Enter new password
    - [ ] Submit password change
    - [ ] **Verify password updated** in database
  - [ ] **Step 4: Verify Login**
    - [ ] Attempt login with **old password** → should FAIL
    - [ ] Attempt login with **new password** → should SUCCEED
    - [ ] Assert logged in successfully

- [ ] **Run Test**

### Task 5.4: Integration Test 5.3 - Token Expiration ⭐⭐⭐

- [ ] **Implement Test Case**

  - [ ] Request password reset
  - [ ] Extract reset link from email
  - [ ] **Wait for token expiration** (or manipulate time)
  - [ ] Try to use expired token
  - [ ] **Verify token rejected** by Supabase
  - [ ] Assert error message displayed
  - [ ] **Verify old password still works**

- [ ] **Run Test**

---

## ✅ Integration Tests Validation Checklist

- [ ] Email service configured and working
- [ ] All 3 integration tests passing
- [ ] Email delivery validated
- [ ] Token generation validated
- [ ] Token expiration validated
- [ ] Password change validated
- [ ] Complete flow end-to-end validated
- [ ] Execution time acceptable (~5-10 min)

---

## 📊 Integration Tests Status

**Started**: **_
**Completed**: _**
**Duration**: **_ hours
**Tests Implemented**: _** / 3
**Tests Passing**: \_\_\_ / 3

---

## 🚨 Common Issues & Solutions

### Issue: Email not received or delayed

**Solution**: Use email service API polling with timeout (60-120 sec)

### Issue: Cannot extract token from email

**Solution**: Parse both HTML and plain text versions, use regex or HTML parser

### Issue: Reset link expires before test completes

**Solution**: Configure shorter token expiry (5-10 min) in test environment

### Issue: Password change not reflected in database

**Solution**: Add wait time after password change, verify via Supabase admin API

---

## 💡 Environment Configuration

### Required Environment Variables

```bash
# .env.test
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # For password verification
TEST_EMAIL_SERVICE_API=https://mailtrap.io/api
TEST_EMAIL_SERVICE_KEY=your-email-service-key
TEST_EMAIL_INBOX_ID=your-inbox-id
PASSWORD_RESET_TOKEN_EXPIRY_SECONDS=600  # 10 minutes for testing
```

### Email Parsing Strategies

1. **Email Service API**: Retrieve email via API (Mailtrap, testmail.app)
2. **HTML Parsing**: Use `cheerio` or similar to parse email HTML
3. **Regex Extraction**: Extract reset URL using regex pattern
4. **Token Extraction**: Parse token from URL query parameter or path

---

## 💡 Token Extraction Example

```typescript
// Example: Extract reset token from email
cy.task('getLatestEmail', { inbox: 'test-inbox' }).then(email => {
  const emailHtml = email.html_body;
  // Extract reset URL from email
  const resetUrlMatch = emailHtml.match(
    /https:\/\/.*?reset-password\?token=([^"&]+)/,
  );
  const resetToken = resetUrlMatch[1];

  // Visit reset page with token
  cy.visit(`/reset-password?token=${resetToken}`);
});
```

---

## 💡 Password Verification Example

```typescript
// Verify password changed in database
cy.task('verifyPassword', {
  email: 'test@example.com',
  oldPassword: 'OldPass123!',
  newPassword: 'NewPass456!',
}).then(result => {
  expect(result.oldPasswordWorks).to.be.false;
  expect(result.newPasswordWorks).to.be.true;
});
```

---

## ⚠️ CRITICAL REMINDER

**Password recovery integration tests are NOT OPTIONAL** because:

1. Email service interaction **cannot be stubbed effectively**
2. Token security is **critical** and must be validated end-to-end
3. Password change affects **database state** and must be tested
4. Complete flow requires **multiple systems working together**

**These tests are the HIGHEST PRIORITY for integration testing.**

---

**Previous**: [Phase 4 Integration Tests](./TODO-AUTH-TESTS-PHASE-4-SESSION-INTEGRATION.md)
**Stub Tests**: [Phase 5 Stub Tests](../TODO-AUTH-TESTS-PHASE-5-RECOVERY-STUBS.md) (Frontend UI only)
**Main Plan**: [TODO-AUTH-TESTS.md](../TODO-AUTH-TESTS.md)
