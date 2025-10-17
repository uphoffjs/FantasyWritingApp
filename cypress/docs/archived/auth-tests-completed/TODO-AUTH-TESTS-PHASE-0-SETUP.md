# TODO: Authentication Flow E2E Tests - Phase 0: Pre-Implementation Setup

**Part of**: [Authentication Flow E2E Tests Implementation](./TODO-AUTH-TESTS.md)
**Based on**: [AUTH-FLOW-TEST-IMPLEMENTATION.md](claudedocs/AUTH-FLOW-TEST-IMPLEMENTATION.md)
**Sprint**: Week 1-2 (5 days)
**Phase Duration**: 1-2 hours (Actual: 15 minutes)
**Status**: ✅ **COMPLETED** (2025-10-06)

**Prerequisites**: None (This is the starting phase)
**Next Phase**: [Phase 1: Infrastructure](./TODO-AUTH-TESTS-PHASE-1-INFRASTRUCTURE.md)

---

## 🎯 Phase 0 Overview

This phase establishes the foundation for all authentication testing by:

- Verifying Supabase configuration is correct
- Reviewing existing test infrastructure
- Creating necessary directory structure
- Making critical architectural decisions about seeding and session management

**⚠️ CRITICAL**: All decision points in this phase MUST be resolved before proceeding to Phase 1. These decisions will determine implementation approach for all subsequent phases.

---

## 📋 Phase 0: Pre-Implementation Setup

### Infrastructure & Configuration

- [x] **Verify Supabase Configuration**

  - [x] Check `cypress.env.json` for `SUPABASE_URL` - ✅ Found in `.env`: `VITE_SUPABASE_URL`
  - [ ] Check `cypress.env.json` for `SUPABASE_SERVICE_KEY` (Admin API) - ❌ NOT FOUND (will use cy.request() or cy.task())
  - [ ] Test Supabase connection with simple query - Will test in Phase 1
  - [x] Document seeding strategy decision (API/cy.task/Admin API) - See Q1 below

- [x] **Review Existing Test Infrastructure**

  - [x] Read `cypress/e2e/login-page-tests/verify-login-page.cy.ts`
  - [x] Verify `cy.comprehensiveDebug()` custom command exists - ✅ Found in `cypress/support/commands/debug/comprehensive-debug.ts`
  - [x] Verify `cy.comprehensiveDebugWithBuildCapture()` exists - ✅ Found in `cypress/support/commands/debug/build-error-capture.ts`
  - [x] Check `cypress.config.ts` for baseUrl configuration - ✅ `http://localhost:3002` (Docker: `host.docker.internal`)

- [x] **Create Test Directory Structure**
  ```bash
  mkdir -p cypress/e2e/authentication  # ✅ Created
  mkdir -p cypress/fixtures/auth       # ✅ Created
  mkdir -p cypress/support/tasks       # ✅ Created
  ```

### Decision Points (MUST RESOLVE BEFORE STARTING)

- [x] **Q1: Seeding Strategy**

  - [x] Does Supabase service key exist? → ❌ NO - No `SUPABASE_SERVICE_KEY` found
  - [x] Are there API endpoints? → ✅ YES - `authService` in `src/services/auth` provides signUp()
  - [x] Neither? → N/A
  - [x] Document chosen approach in this file → **DECISION: Use authService.signUp() via cy.task()**

- [x] **Q2: Session Management**

  - [x] Review `src/store/authStore.ts` for session logic
  - [x] Identify localStorage keys used (authToken, authUser, etc.)
  - [x] Document session timeout behavior
  - [x] Understand multi-tab sync implementation

- [x] **Q3: Error Handling**
  - [x] Review how LoginScreen displays errors
  - [x] Check if using Alert.alert() or inline error-container
  - [x] Document error display patterns for tests

---

## 📝 Decision Documentation

### Q1: Seeding Strategy Decision

**Chosen Approach**: **cy.task() with authService.signUp()**
**Rationale**:

- No Supabase service key available in environment
- Existing `authService` provides signUp() method
- Can create cy.task() to wrap authService.signUp() for test data seeding
- Avoids direct database access complexity
- Reuses existing production code for testing

**Implementation Notes**:

- Create `cypress/support/tasks/seedUser.ts` that imports and uses `authService.signUp()`
- Register task in `cypress.config.ts` setupNodeEvents
- Cleanup strategy: Delete users after tests via `authService` or direct Supabase client

### Q2: Session Management Analysis

**localStorage Keys Used**:

- `fantasy-element-builder-offline-mode` - Stores offline mode preference
- Zustand persist middleware stores auth state (need to verify exact key)
- Session managed via Supabase auth state listener in authStore

**Session Timeout Behavior**:

- Auth state managed by Supabase SDK via `authService.onAuthStateChange()`
- No explicit timeout in authStore - relies on Supabase session expiration
- `isAuthenticated` flag controlled by auth state changes

**Multi-Tab Sync**: ☑ Implemented

- Implemented via `authService.onAuthStateChange()` listener
- Zustand persist middleware syncs state across tabs automatically
- When auth state changes in one tab, listener fires in all tabs

### Q3: Error Display Pattern

**Error Display Method**: ☑ Inline error-container **AND** ☑ Alert.alert()

- **Inline**: Used for validation errors (testID="error-container")
- **Alert.alert()**: Used for success messages and forgot password flow

**Error Selector**: `[data-cy="error-container"]`
**Error Message Pattern**:

- Form validation: "Please enter your email and password", "Password must be at least 6 characters", "Passwords do not match"
- Auth errors: Returned from authService (e.g., "Invalid credentials", "User already exists")
- Generic fallback: "An unexpected error occurred. Please try again."

---

## ✅ Phase 0 Completion Checklist

- [x] All infrastructure verified
- [x] Directory structure created
- [x] All 3 decision points resolved and documented above
- [ ] Supabase connection tested successfully - **Will test in Phase 1 during seeding implementation**
- [x] Existing test infrastructure reviewed and understood
- [x] Ready to proceed to Phase 1

---

## 📊 Phase 0 Status

**Started**: 2025-10-06 14:25
**Completed**: 2025-10-06 14:40
**Duration**: 0.25 hours (15 minutes)
**Blockers**: None
**Notes**:

- No Supabase service key available - decided on cy.task() with authService
- Existing test infrastructure is solid with comprehensive debug commands
- LoginScreen uses both inline error-container and Alert.alert()
- Multi-tab sync is implemented via auth state listeners
- All required directories created successfully
- **READY FOR PHASE 1**

---

**Next Phase**: [TODO-AUTH-TESTS-PHASE-1-INFRASTRUCTURE.md](./TODO-AUTH-TESTS-PHASE-1-INFRASTRUCTURE.md)
