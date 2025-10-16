/// <reference types="cypress" />

import {
  stubSuccessfulLogin,
  stubFailedLogin,
  stubValidSession,
  stubGetProjects
} from '../../support/stubs';

/**
 * Authentication Flow E2E Tests - Sign-In Flow
 *
 * Tests the critical path for user authentication including:
 * - Successful sign-in (happy path)
 * - Invalid credentials rejection
 * - Remember me persistence
 *
 * Testing Strategy: Stub-Based Frontend Testing
 * - Uses cy.intercept() to stub Supabase API calls
 * - Tests frontend behavior without backend dependency
 * - Ensures UI correctly handles success/error responses
 * - No cleanup needed - stubs are isolated to each test
 *
 * @see claudedocs/STUB-BASED-TESTING-GUIDE.md for complete documentation
 */

describe('User Sign In Flow', () => {
  // Test user credentials (no seeding needed with stubs)
  const testEmail = 'test.user@fantasy-app.test';
  const testPassword = 'TestPassword123!';

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
      // * Stub successful login and projects API
      stubSuccessfulLogin(testEmail);
      stubGetProjects(); // Stub projects page data
    });

    it('should successfully login with valid credentials and navigate to projects', () => {
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
      cy.get('[data-cy="email-input"]').type(testEmail);
      cy.get('[data-cy="password-input"]').type(testPassword);

      // Submit form
      cy.get('[data-cy="submit-button"]').click();

      // * Wait for login API call to complete
      cy.wait('@login');

      // * Assert successful navigation to projects (proves authentication succeeded)
      cy.url({ timeout: 10000 }).should('include', '/projects');

      // * Wait for projects API call
      cy.wait('@getProjects');

      // * Verify user-specific content is visible (confirms authenticated state)
      cy.contains('My Projects', { timeout: 10000 }).should('be.visible');
      cy.get('[data-cy="new-project-button"]', { timeout: 5000 }).should('be.visible');
    });
  });

  describe('Test 2.2 - Reject Invalid Credentials', () => {
    beforeEach(() => {
      // * Stub failed login response
      stubFailedLogin('Invalid login credentials');
    });

    it('should display error message for invalid credentials and prevent navigation', () => {
      // Visit login page
      cy.visit('/');

      // Type invalid credentials
      cy.get('[data-cy="email-input"]').should('be.visible').type('invalid.user@fantasy-app.test');
      cy.get('[data-cy="password-input"]').should('be.visible').type('WrongPassword123!');

      // Submit form
      cy.get('[data-cy="submit-button"]').should('be.visible').click();

      // * Wait for failed login API call
      cy.wait('@loginFailed');

      // * Assert error message is displayed
      cy.get('[data-cy="login-error"]', { timeout: 10000 }).should('be.visible');
      cy.get('[data-cy="login-error"]')
        .invoke('text')
        .should('match', /invalid|incorrect|wrong|credentials/i);

      // * Assert URL does NOT navigate to projects
      cy.url().should('not.include', '/projects');
      cy.url().should('include', '/'); // Should stay on login page
    });
  });

  describe('Test 2.3 - Remember Me Persistence', () => {
    const rememberEmail = 'remember.me@fantasy-app.test';
    const rememberPassword = 'RememberPassword123!';

    beforeEach(() => {
      // * Stub successful login and valid session
      stubSuccessfulLogin(rememberEmail);
      stubValidSession(rememberEmail);
      stubGetProjects(); // Stub projects page data
    });

    it('should persist session after page reload when remember me is enabled', () => {
      // Visit login page
      cy.visit('/');

      // Type credentials
      cy.get('[data-cy="email-input"]').should('be.visible').type(rememberEmail);
      cy.get('[data-cy="password-input"]').should('be.visible').type(rememberPassword);

      // * Enable "Remember Me" toggle
      cy.get('[data-cy="remember-me-switch"]').should('be.visible').click();

      // Submit form
      cy.get('[data-cy="submit-button"]').should('be.visible').click();

      // * Wait for login API call
      cy.wait('@login');

      // Assert successful navigation
      cy.url({ timeout: 10000 }).should('include', '/projects');

      // * Wait for projects API call
      cy.wait('@getProjects');

      // * Reload page to test session persistence
      cy.reload();

      // * Wait for session validation API call
      cy.wait('@session');

      // * Assert still authenticated after reload (proves session persistence)
      cy.url({ timeout: 10000 }).should('include', '/projects');

      // * Verify user remains authenticated after page reload
      cy.contains('My Projects', { timeout: 10000 }).should('be.visible');
      cy.get('[data-cy="new-project-button"]', { timeout: 5000 }).should('be.visible');
    });
  });
});
