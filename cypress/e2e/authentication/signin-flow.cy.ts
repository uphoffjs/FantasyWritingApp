/// <reference types="cypress" />

import { generateUniqueEmail } from '../../support/utils/testUserGenerator';

/**
 * Authentication Flow E2E Tests - Sign-In Flow
 *
 * Tests the critical path for user authentication including:
 * - Successful sign-in (happy path)
 * - Invalid credentials rejection
 * - Remember me persistence
 *
 * Seeding Strategy: Unique Email per Run
 * - Each test run generates unique emails with timestamps
 * - Eliminates need for cleanup between runs
 * - Ensures complete test isolation
 * - Uses fixtures for password and profile templates
 */

describe('User Sign In Flow', () => {
  // Store unique user data for the test run
  let testUser: { email: string; password: string };

  // ! MANDATORY: Must be first hook in every describe()
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.comprehensiveDebugWithBuildCapture();
    cy.comprehensiveDebug();
  });

  // Optional: Failure capture for debugging
  afterEach(() => {
    // Capture failure debug unconditionally (command is smart enough to handle success/failure internally)
    cy.captureFailureDebug();
  });

  describe('Test 2.1 - Successful Sign-In (Happy Path)', () => {
    beforeEach(() => {
      // * Seeding Strategy: Generate unique email for this test run
      cy.fixture('auth/users').then((users) => {
        const { password } = users.validUser;
        // Generate unique email based on base template
        const uniqueEmail = generateUniqueEmail('valid.user@fantasy-app.test');

        // Store for use in test
        testUser = { email: uniqueEmail, password };

        // Seed user with unique email (no cleanup needed - unique every time)
        cy.task('supabase:seedUser', testUser);
      });
    });

    it('should successfully login with valid credentials and navigate to projects', () => {
      // Use the unique test user created in beforeEach
      const { email, password } = testUser;

      // Visit login page
      cy.visit('/');

      // * Verify on signin tab (default state)
      cy.get('[data-cy="signin-tab-button"]').should('be.visible');

      // * QUALITY IMPROVEMENT: Verify form elements exist before interaction
      // * This ensures test fails if UI elements are missing (catches mutation 2.1a)
      cy.get('[data-cy="email-input"]').should('exist').and('be.visible');
      cy.get('[data-cy="password-input"]').should('exist').and('be.visible');
      cy.get('[data-cy="submit-button"]').should('exist').and('be.visible');

      // Type credentials
      cy.get('[data-cy="email-input"]').type(email);
      cy.get('[data-cy="password-input"]').type(password);

      // Submit form
      cy.get('[data-cy="submit-button"]').click();

      // * Assert successful navigation to projects (proves authentication succeeded)
      cy.url({ timeout: 10000 }).should('include', '/projects');

      // * Verify user-specific content is visible (confirms authenticated state)
      cy.contains('My Projects', { timeout: 10000 }).should('be.visible');
      cy.get('[data-cy="new-project-button"]', { timeout: 5000 }).should('be.visible');
    });
  });

  describe('Test 2.2 - Reject Invalid Credentials', () => {
    // * Validated 2025-10-07: Catches missing error display component
    // * Fix applied: LoginScreen.tsx:184 - Added data-cy="login-error" attribute
    // * Root cause: React Native Web doesn't map testID to data attributes for View components
    it('should display error message for invalid credentials and prevent navigation', () => {
      // Visit login page (no seeding needed - testing invalid creds)
      cy.visit('/');

      // Type invalid credentials
      cy.get('[data-cy="email-input"]').should('be.visible').type('invalid.user@fantasy-app.test');
      cy.get('[data-cy="password-input"]').should('be.visible').type('WrongPassword123!');

      // Submit form
      cy.get('[data-cy="submit-button"]').should('be.visible').click();

      // * Assert error message is displayed (wait up to 10 seconds for API response)
      cy.get('[data-cy="login-error"]', { timeout: 10000 }).should('be.visible');
      cy.get('[data-cy="login-error"]')
        .invoke('text')
        .should('match', /invalid|incorrect|wrong|credentials/i);

      // * Assert URL does NOT navigate to projects
      cy.url().should('not.include', '/projects');
      cy.url().should('include', '/'); // Should stay on login page
    });
  });

  // ! TEMPORARILY DISABLED: Test 2.3 - Remember Me Persistence
  // ! Reason: Intermittent Supabase network timeouts (external API issue)
  // ! Date Disabled: 2025-10-07
  // ! TODO: Re-enable when Supabase connection stability improves
  // ! Tracking: See TODO-AUTH-TESTS-PHASE-2-SIGNIN.md for re-enablement criteria
  describe.skip('Test 2.3 - Remember Me Persistence', () => {
    let rememberUser: { email: string; password: string };

    beforeEach(() => {
      // * Seeding Strategy: Generate unique email for this test run
      cy.fixture('auth/users').then((users) => {
        const { password } = users.rememberUser;
        // Generate unique email based on base template
        const uniqueEmail = generateUniqueEmail('remember.me@fantasy-app.test');

        // Store for use in test
        rememberUser = { email: uniqueEmail, password };

        // Seed user with unique email (no cleanup needed - unique every time)
        cy.task('supabase:seedUser', rememberUser);
      });
    });

    it('should persist session after page reload when remember me is enabled', () => {
      // Use the unique test user created in beforeEach
      const { email, password } = rememberUser;

      // Visit login page
      cy.visit('/');

      // Type credentials
      cy.get('[data-cy="email-input"]').should('be.visible').type(email);
      cy.get('[data-cy="password-input"]').should('be.visible').type(password);

      // * Enable "Remember Me" toggle
      cy.get('[data-cy="remember-me-switch"]').should('be.visible').click();

      // Submit form
      cy.get('[data-cy="submit-button"]').should('be.visible').click();

      // Assert successful navigation
      cy.url().should('include', '/projects');

      // * Reload page to test session persistence
      cy.reload();

      // * Assert still authenticated after reload (proves session persistence via Supabase)
      cy.url({ timeout: 10000 }).should('include', '/projects');

      // * Verify user remains authenticated after page reload
      cy.contains('My Projects', { timeout: 10000 }).should('be.visible');
      cy.get('[data-cy="new-project-button"]', { timeout: 5000 }).should('be.visible');
    });
  });
});
