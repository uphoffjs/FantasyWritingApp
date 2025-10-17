/// <reference types="cypress" />

/**
 * Authentication Tests - Phase 3: Sign-Up Flow (Stub-Based)
 *
 * * Purpose: Validate user sign-up frontend logic using stubbed API responses
 * * Strategy: Stub-based testing for fast, reliable frontend validation
 * * Coverage: Form validation, password matching, error handling, navigation
 *
 * @see TODO-AUTH-TESTS-PHASE-3-SIGNUP-STUBS.md for complete test plan
 * @see claudedocs/STUB-BASED-TESTING-GUIDE.md for stub testing methodology
 */

import {
  stubSuccessfulSignup,
  stubFailedSignup,
  stubGetProjects,
} from '../../support/stubs';

describe('User Sign Up Flow', () => {
  const testEmail = 'newuser@test.com';
  const testPassword = 'Test123!@#';
  const weakPassword = '12345';

  // ! MANDATORY: Must be first hook in every describe()
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.comprehensiveDebugWithBuildCapture();
    cy.comprehensiveDebug();
  });

  // Optional: Failure capture for debugging
  afterEach(() => {
    // Note: Using function() to access this.currentTest
    // captureFailureDebug handles its own conditional logic internally
    cy.captureFailureDebug();
  });

  // * ========================================================================
  // * TEST 3.1: SUCCESSFUL SIGN-UP (HAPPY PATH) ⭐
  // * ========================================================================

  describe('Test 3.1 - Successful Sign-Up', () => {
    beforeEach(() => {
      // Stub successful signup and post-signup project fetch
      stubSuccessfulSignup(testEmail, false);
      stubGetProjects();
    });

    it('should successfully register new user and navigate to projects', () => {
      cy.visit('/');

      // Verify we're on login screen
      cy.url().should('include', '/');

      // Switch to signup tab
      cy.get('[data-cy="signup-tab-button"]')
        .should('exist')
        .and('be.visible')
        .click();

      // Verify signup form is visible
      cy.get('[data-cy="email-input"]').should('exist').and('be.visible');
      cy.get('[data-cy="password-input"]').should('exist').and('be.visible');
      cy.get('[data-cy="confirm-password-input"]')
        .should('exist')
        .and('be.visible');
      cy.get('[data-cy="submit-button"]').should('exist').and('be.visible');

      // Fill signup form
      cy.get('[data-cy="email-input"]').clear();
      cy.get('[data-cy="email-input"]').type(testEmail);
      cy.get('[data-cy="password-input"]').clear();
      cy.get('[data-cy="password-input"]').type(testPassword);
      cy.get('[data-cy="confirm-password-input"]').clear();
      cy.get('[data-cy="confirm-password-input"]').type(testPassword);

      // Submit form
      cy.get('[data-cy="submit-button"]').click();

      // Wait for signup API call
      cy.wait('@signup');

      // Verify successful navigation to projects
      cy.url({ timeout: 10000 }).should('include', '/projects');

      // Verify projects page loaded
      cy.contains('My Projects', { timeout: 10000 }).should('be.visible');
    });
  });

  // * ========================================================================
  // * TEST 3.2: PREVENT DUPLICATE EMAIL
  // * ========================================================================

  describe('Test 3.2 - Duplicate Email Prevention', () => {
    beforeEach(() => {
      // Stub duplicate email error
      stubFailedSignup('User already registered');
    });

    it('should display error message when email already exists', () => {
      cy.visit('/');

      // Switch to signup tab
      cy.get('[data-cy="signup-tab-button"]').click();

      // Fill form with existing email
      cy.get('[data-cy="email-input"]').clear();
      cy.get('[data-cy="email-input"]').type('existing@test.com');
      cy.get('[data-cy="password-input"]').clear();
      cy.get('[data-cy="password-input"]').type(testPassword);
      cy.get('[data-cy="confirm-password-input"]').clear();
      cy.get('[data-cy="confirm-password-input"]').type(testPassword);

      // Submit form
      cy.get('[data-cy="submit-button"]').click();

      // Wait for failed signup API call
      cy.wait('@signupFailed');

      // Verify error message is displayed
      cy.get('[data-cy="login-error"]')
        .should('exist')
        .and('be.visible')
        .and('contain', 'already registered');

      // Verify no navigation occurred (still on login page)
      cy.url().should('not.include', '/projects');
      cy.url().should('include', '/');
    });
  });

  // * ========================================================================
  // * TEST 3.3: PASSWORD REQUIREMENTS VALIDATION
  // * ========================================================================

  describe('Test 3.3 - Password Requirements Validation', () => {
    it('should validate password meets minimum length requirement', () => {
      cy.visit('/');

      // Switch to signup tab
      cy.get('[data-cy="signup-tab-button"]').click();

      // Fill form with weak password
      cy.get('[data-cy="email-input"]').clear();
      cy.get('[data-cy="email-input"]').type(testEmail);
      cy.get('[data-cy="password-input"]').clear();
      cy.get('[data-cy="password-input"]').type(weakPassword);
      cy.get('[data-cy="confirm-password-input"]').clear();
      cy.get('[data-cy="confirm-password-input"]').type(weakPassword);

      // Submit form
      cy.get('[data-cy="submit-button"]').click();

      // Verify error message for password length
      cy.get('[data-cy="login-error"]')
        .should('exist')
        .and('be.visible')
        .and('contain', 'at least 6 characters');

      // Verify no navigation occurred
      cy.url().should('not.include', '/projects');
      cy.url().should('include', '/');
    });
  });

  // * ========================================================================
  // * TEST 3.4: PASSWORD CONFIRMATION MISMATCH
  // * ========================================================================

  describe('Test 3.4 - Password Confirmation Mismatch', () => {
    it('should display error when passwords do not match', () => {
      cy.visit('/');

      // Switch to signup tab
      cy.get('[data-cy="signup-tab-button"]').click();

      // Fill form with mismatched passwords
      cy.get('[data-cy="email-input"]').clear();
      cy.get('[data-cy="email-input"]').type(testEmail);
      cy.get('[data-cy="password-input"]').clear();
      cy.get('[data-cy="password-input"]').type(testPassword);
      cy.get('[data-cy="confirm-password-input"]').clear();
      cy.get('[data-cy="confirm-password-input"]').type('DifferentPassword123!');

      // Submit form
      cy.get('[data-cy="submit-button"]').click();

      // Verify error message for password mismatch
      cy.get('[data-cy="login-error"]')
        .should('exist')
        .and('be.visible')
        .and('contain', 'do not match');

      // Verify no navigation occurred
      cy.url().should('not.include', '/projects');
      cy.url().should('include', '/');
    });
  });
});
