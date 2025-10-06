# TODO: Authentication Flow E2E Tests - Phase 1: Infrastructure

**Part of**: [Authentication Flow E2E Tests Implementation](./TODO-AUTH-TESTS.md)
**Based on**: [AUTH-FLOW-TEST-IMPLEMENTATION.md](claudedocs/AUTH-FLOW-TEST-IMPLEMENTATION.md)
**Sprint**: Week 1-2 (5 days)
**Phase Duration**: 3-4 hours
**Status**: Not Started

**Prerequisites**: [Phase 0: Setup](./TODO-AUTH-TESTS-PHASE-0-SETUP.md) must be completed
**Next Phase**: [Phase 2: Sign-In Flow](./TODO-AUTH-TESTS-PHASE-2-SIGNIN.md)

---

## 🎯 Phase 1 Overview

This phase builds the core testing infrastructure that all authentication tests will depend on:

- User fixtures for test data
- Seeding strategy implementation (based on Phase 0 decisions)
- Custom Cypress commands for auth operations
- Infrastructure smoke test to validate everything works

**⚠️ CRITICAL**: This phase must be 100% stable before proceeding. All subsequent phases depend on this infrastructure.

---

## 📅 Day 1: Setup & Infrastructure (3-4 hours)

### Task 1.1: Create User Fixtures

- [ ] **Create `cypress/fixtures/users.json`**

  - [ ] Add `validUser` fixture
  - [ ] Add `newUser` fixture
  - [ ] Add `existingUser` fixture
  - [ ] Add `rememberUser` fixture
  - [ ] Add `sessionUser` fixture
  - [ ] Add `expiredUser` fixture
  - [ ] Add `multiTabUser` fixture
  - [ ] Add `forgotUser` fixture

- [ ] **Validate Fixture Format**
  - [ ] Each user has `email`, `password`, `id`
  - [ ] Email formats are valid
  - [ ] Passwords meet requirements (6+ chars)
  - [ ] IDs are unique

### Task 1.2: Implement Seeding Strategy

**Option A: Supabase Admin API** (RECOMMENDED)

- [ ] **Create `cypress/support/seedHelpers.ts`**

  - [ ] Import `@supabase/supabase-js`
  - [ ] Create `supabaseAdmin` client with service key
  - [ ] Implement `seedUser(userData)` function
  - [ ] Implement `cleanupUsers()` function
  - [ ] Add error handling and logging

- [ ] **Test Seeding Functionality**
  - [ ] Create test user via seedUser()
  - [ ] Verify user exists in Supabase
  - [ ] Test cleanup function
  - [ ] Document any issues encountered

**Option B: cy.task() (If Admin API unavailable)**

- [ ] **Create `cypress/support/tasks/seedUser.js`**

  - [ ] Set up Supabase/Postgres connection
  - [ ] Implement user creation with password hashing
  - [ ] Implement cleanup function
  - [ ] Register task in `cypress.config.ts`

- [ ] **Update `cypress.config.ts`**
  ```typescript
  setupNodeEvents(on, config) {
    on('task', {
      seedUser: require('./cypress/support/tasks/seedUser'),
      cleanupUsers: require('./cypress/support/tasks/cleanupUsers')
    });
  }
  ```

### Task 1.3: Create Custom Auth Commands

- [ ] **Create `cypress/support/authCommands.ts`**

  - [ ] Implement `cy.loginAs(userFixture)` command
  - [ ] Implement `cy.logout()` command
  - [ ] Implement `cy.shouldBeAuthenticated()` command
  - [ ] Implement `cy.shouldNotBeAuthenticated()` command
  - [ ] Add session validation logic

- [ ] **Update TypeScript Declarations**

  - [ ] Create/update `cypress/support/index.d.ts`
  - [ ] Add Chainable interface declarations
  - [ ] Add JSDoc comments for each command

- [ ] **Import Commands in `cypress/support/e2e.ts`**
  ```typescript
  import './authCommands';
  ```

### Task 1.4: Infrastructure Smoke Test

- [ ] **Create `cypress/e2e/authentication/_smoke-test.cy.ts`**

  - [ ] Test fixture loading
  - [ ] Test seeding a single user
  - [ ] Test custom command `cy.loginAs()`
  - [ ] Test cleanup after test
  - [ ] Verify test passes

- [ ] **Run Smoke Test**
  ```bash
  SPEC=cypress/e2e/authentication/_smoke-test.cy.ts npm run cypress:run:spec
  ```
  - [ ] Test passes on first run
  - [ ] Test passes on second run (cleanup working)
  - [ ] Test passes 3 times consecutively

---

## ✅ Phase 1 Validation Checklist

- [ ] All fixtures created and valid
- [ ] Seeding strategy implemented and tested
- [ ] Custom commands working correctly
- [ ] Smoke test passing 3x consecutively
- [ ] No console errors during test execution
- [ ] **READY TO PROCEED TO PHASE 2**

---

## 📊 Phase 1 Status

**Started**: ********\_********
**Completed**: ********\_********
**Duration**: ****\_**** hours
**Blockers**: ********\_********
**Notes**: ********\_********

---

## 🚨 Common Issues & Solutions

### Issue: Supabase connection fails

**Solution**: Verify `cypress.env.json` has correct `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`

### Issue: Smoke test fails intermittently

**Solution**: Ensure cleanup happens in `afterEach` hook, not just `after`

### Issue: Password hashing not working

**Solution**: Check if using correct Supabase auth.admin.createUser() method

---

**Previous Phase**: [TODO-AUTH-TESTS-PHASE-0-SETUP.md](./TODO-AUTH-TESTS-PHASE-0-SETUP.md)
**Next Phase**: [TODO-AUTH-TESTS-PHASE-2-SIGNIN.md](./TODO-AUTH-TESTS-PHASE-2-SIGNIN.md)
