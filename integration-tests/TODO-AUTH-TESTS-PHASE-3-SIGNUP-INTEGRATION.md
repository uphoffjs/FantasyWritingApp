# TODO: Authentication Tests - Phase 3: Sign-Up Flow (Integration)

**Part of**: [Authentication Flow E2E Tests Implementation](../TODO-AUTH-TESTS.md)
**Testing Strategy**: Integration Testing (Backend + Frontend Validation)
**Priority**: Optional (Stubs cover most needs)
**Status**: Future Work

**Prerequisites**: Supabase environment configured, email service configured
**See Also**: [Phase 3 Stub Tests](../TODO-AUTH-TESTS-PHASE-3-SIGNUP-STUBS.md) (Primary testing)

---

## 🎯 Integration Testing Overview

Integration tests validate **backend signup behavior** with real Supabase and email service.

**When to Run**:

- 🔌 Nightly test runs
- 🔌 Pre-release validation
- 🔌 Email service testing

---

## 🧪 Integration Test Strategy

### Integration Test 3.1: Real User Creation

- 🔌 **Supabase**: Real `supabase.auth.signUp()` call
- 🎯 **Tests**: Database user record creation, email verification system, welcome email sent
- 📁 **Location**: `cypress/e2e/integration/authentication/signup-integration.cy.ts`
- ⏱️ **When**: Run nightly (requires email service, database)

### Integration Test 3.2: Real Duplicate Email Check

- 🔌 **Supabase**: Real database constraint violation
- 🎯 **Tests**: Database-level duplicate prevention, race conditions, concurrent signups
- 📁 **Location**: `cypress/e2e/integration/authentication/signup-errors-integration.cy.ts`

### Integration Test 3.3: Email Verification Flow

- 🔌 **Supabase**: Real email service, verification tokens
- 🎯 **Tests**: Verification email sent, token validation, account activation
- 📁 **Location**: `cypress/e2e/integration/authentication/email-verification-integration.cy.ts`
- ⚠️ **Complex**: Requires email service integration, token extraction

---

## 📊 Test Coverage Matrix (Integration Tests)

| Test Aspect             | Integration Coverage   |
| ----------------------- | ---------------------- |
| **Form Validation**     | ❌ Not needed          |
| **Password Matching**   | ❌ Not needed          |
| **API Calls**           | 🔌 **Real (Primary)**  |
| **Database Insert**     | 🔌 **Real (Primary)**  |
| **Duplicate Check**     | 🔌 **Real (Primary)**  |
| **Email Service**       | 🔌 **Real (Primary)**  |
| **Verification Tokens** | 🔌 **Real (Primary)**  |
| **Rate Limiting**       | 🔌 **Real (Optional)** |

---

## 📅 Implementation Tasks

### Task 3.1: Environment Setup

- [ ] **Configure Email Service**
  - [ ] Set up test email inbox (e.g., Mailtrap, testmail.app)
  - [ ] Configure Supabase email templates
  - [ ] Add email service credentials to `.env.test`

### Task 3.2: Integration Test 3.1 - Real User Creation

- [ ] **Implement Test Case**

  - [ ] Generate unique test email
  - [ ] Visit `/`, switch to signup tab
  - [ ] Enter test credentials
  - [ ] Click submit
  - [ ] **Verify real API call** to Supabase
  - [ ] **Verify database user record** created
  - [ ] **Check email sent** (via email service API)
  - [ ] Assert navigation to `/projects`

- [ ] **Run Test**
  ```bash
  SPEC=cypress/e2e/integration/authentication/signup-integration.cy.ts npm run cypress:run:spec
  ```

### Task 3.3: Integration Test 3.2 - Real Duplicate Prevention

- [ ] **Implement Test Case**

  - [ ] Create test user via API
  - [ ] Visit `/`, switch to signup
  - [ ] Try to register with same email
  - [ ] **Verify real database constraint** error
  - [ ] **Test concurrent signup attempts** (race condition)
  - [ ] Assert error displayed correctly

- [ ] **Run Test**

### Task 3.4: Integration Test 3.3 - Email Verification

- [ ] **Implement Test Case**

  - [ ] Sign up with test email
  - [ ] **Extract verification email** via email service API
  - [ ] **Parse verification token** from email
  - [ ] Click verification link
  - [ ] **Verify account activated** in database
  - [ ] **Verify can login** with verified account

- [ ] **Run Test**

---

## ✅ Integration Tests Validation Checklist

- [ ] Email service configured and accessible
- [ ] All 3 integration tests passing
- [ ] Tests verify real database records
- [ ] Email sending validated
- [ ] Token verification working
- [ ] Execution time acceptable (~60-120s)

---

## 📊 Integration Tests Status

**Started**: **_
**Completed**: _**
**Duration**: **_ hours
**Tests Implemented**: _** / 3
**Tests Passing**: \_\_\_ / 3

---

## 🚨 Common Issues & Solutions

### Issue: Email not received in test inbox

**Solution**: Check Supabase email settings and verify email service API connection

### Issue: Database constraint error unexpected format

**Solution**: Verify Supabase error response format and adjust test assertions

### Issue: Token extraction from email fails

**Solution**: Use email service API to access email HTML/text instead of polling inbox

---

## 💡 Environment Configuration

### Required Environment Variables

```bash
# .env.test
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
TEST_EMAIL_SERVICE_API=https://mailtrap.io/api
TEST_EMAIL_SERVICE_KEY=your-email-service-key
TEST_EMAIL_INBOX_ID=your-inbox-id
```

### Email Service Integration

- **Mailtrap**: Good for development, has API for email retrieval
- **testmail.app**: Good for automated testing, simple API
- **MailHog**: Self-hosted option for local development

---

**Next**: [Phase 4 Integration Tests](./TODO-AUTH-TESTS-PHASE-4-SESSION-INTEGRATION.md)
**Previous**: [Phase 2 Integration Tests](./TODO-AUTH-TESTS-PHASE-2-SIGNIN-INTEGRATION.md)
**Stub Tests**: [Phase 3 Stub Tests](../TODO-AUTH-TESTS-PHASE-3-SIGNUP-STUBS.md) (Run these first)
**Main Plan**: [TODO-AUTH-TESTS.md](../TODO-AUTH-TESTS.md)
