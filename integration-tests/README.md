# Integration Tests Documentation

This folder contains **integration test documentation** for authentication flows.

## 📂 Folder Structure

```
integration-tests/
├── README.md (this file)
├── TODO-AUTH-TESTS-PHASE-2-SIGNIN-INTEGRATION.md
├── TODO-AUTH-TESTS-PHASE-3-SIGNUP-INTEGRATION.md
├── TODO-AUTH-TESTS-PHASE-4-SESSION-INTEGRATION.md
└── TODO-AUTH-TESTS-PHASE-5-RECOVERY-INTEGRATION.md
```

## 🎯 Purpose

Integration tests validate **backend behavior** with real:

- Supabase API calls
- Database operations
- JWT token generation
- Email service integration
- Token refresh mechanisms

## 🧪 Testing Strategy

### Stub Tests (Primary) vs Integration Tests (Secondary)

| Phase                 | Stub Tests (Fast)              | Integration Tests (Slow)               | Priority    |
| --------------------- | ------------------------------ | -------------------------------------- | ----------- |
| **Phase 2: Sign-In**  | ✅ Frontend validation         | 🔌 Real auth, JWT, database            | Medium      |
| **Phase 3: Sign-Up**  | ✅ Frontend validation         | 🔌 Real user creation, email           | Optional    |
| **Phase 4: Session**  | ✅ Frontend session management | 🔌 **Token refresh** (CRITICAL)        | Important   |
| **Phase 5: Recovery** | ✅ Frontend UI only            | 🔌 **Complete flow** (CRITICAL) ⭐⭐⭐ | **HIGHEST** |

### When to Run

- **Stub Tests**: Every commit, PR validation, pre-commit hooks
- **Integration Tests**: Nightly, pre-release, staging environment

## 📋 Integration Test Files

### Phase 2: Sign-In (Integration)

**File**: [TODO-AUTH-TESTS-PHASE-2-SIGNIN-INTEGRATION.md](./TODO-AUTH-TESTS-PHASE-2-SIGNIN-INTEGRATION.md)
**Priority**: Medium
**Tests**: Real authentication, JWT tokens, session creation

### Phase 3: Sign-Up (Integration)

**File**: [TODO-AUTH-TESTS-PHASE-3-SIGNUP-INTEGRATION.md](./TODO-AUTH-TESTS-PHASE-3-SIGNUP-INTEGRATION.md)
**Priority**: Optional
**Tests**: Database user creation, email verification, duplicate prevention

### Phase 4: Session (Integration)

**File**: [TODO-AUTH-TESTS-PHASE-4-SESSION-INTEGRATION.md](./TODO-AUTH-TESTS-PHASE-4-SESSION-INTEGRATION.md)
**Priority**: Important
**Tests**: **Token refresh** (cannot be stubbed), session expiration, multi-device

### Phase 5: Password Recovery (Integration) ⭐⭐⭐

**File**: [TODO-AUTH-TESTS-PHASE-5-RECOVERY-INTEGRATION.md](./TODO-AUTH-TESTS-PHASE-5-RECOVERY-INTEGRATION.md)
**Priority**: ⭐⭐⭐ **HIGHEST PRIORITY**
**Tests**: Email service, reset tokens, password change, **complete flow**

**⚠️ CRITICAL**: Phase 5 integration tests are **NOT OPTIONAL** - email service and token security cannot be effectively tested with stubs.

## 🚀 Getting Started

### Prerequisites

1. **Supabase Environment**

   - Test Supabase project configured
   - Environment variables in `.env.test`

2. **Email Service**
   - Test email inbox with API access (Mailtrap, testmail.app)
   - Email service credentials configured

### Environment Variables

```bash
# .env.test
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
TEST_EMAIL_SERVICE_API=https://mailtrap.io/api
TEST_EMAIL_SERVICE_KEY=your-email-service-key
TEST_EMAIL_INBOX_ID=your-inbox-id
JWT_EXPIRY_SECONDS=300  # 5 minutes for testing
PASSWORD_RESET_TOKEN_EXPIRY_SECONDS=600  # 10 minutes
```

### Running Integration Tests

```bash
# Run all integration tests
npm run cypress:run -- --spec "cypress/e2e/integration/authentication/**/*.cy.ts"

# Run specific phase
SPEC=cypress/e2e/integration/authentication/signin-integration.cy.ts npm run cypress:run:spec

# Run in Docker
npm run cypress:docker:test -- --spec "cypress/e2e/integration/authentication/**/*.cy.ts"
```

## 📊 Test Coverage

### What Integration Tests Cover

- ✅ Real Supabase API calls
- ✅ Database operations (CRUD)
- ✅ JWT token generation and validation
- ✅ Token refresh mechanism (CRITICAL)
- ✅ Email service integration
- ✅ Reset token generation and validation
- ✅ Password change operations
- ✅ Complete end-to-end flows

### What Stub Tests Cover (See main project)

- ✅ Frontend UI logic
- ✅ Form validation
- ✅ Error display
- ✅ Navigation flows
- ✅ State management
- ✅ Mock API responses

## 💡 Implementation Order

1. **Start with Stub Tests** (See parent folder)

   - Complete all stub tests first
   - Validate frontend behavior
   - Fast feedback loop

2. **Then Add Integration Tests**
   - Phase 5 (Password Recovery) first ⭐⭐⭐ **CRITICAL**
   - Phase 4 (Session/Token Refresh) second
   - Phase 2 and 3 as needed

## 🚨 Common Issues

### Email Service Issues

- **Problem**: Email not received
- **Solution**: Check email service API connection, verify inbox ID

### Token Expiration Issues

- **Problem**: Tests timing out
- **Solution**: Use short-lived tokens (5-10 min) in test environment

### Supabase Connection Issues

- **Problem**: Connection timeout
- **Solution**: Verify Supabase project URL and keys

## 📖 Related Documentation

- **Main Test Plan**: [../TODO-AUTH-TESTS.md](../TODO-AUTH-TESTS.md)
- **Stub Tests**: See parent folder TODO-AUTH-TESTS-PHASE-\*-STUBS.md files
- **Stub Testing Guide**: [../claudedocs/STUB-BASED-TESTING-GUIDE.md](../claudedocs/STUB-BASED-TESTING-GUIDE.md)

---

**Last Updated**: 2025-10-16
**Status**: Documentation complete, implementation pending
