/**
 * Authentication User Journey Tests
 * Tests complete authentication flows including sign up, sign in, and logout
 */

import { LoginPage } from '../../support/pages/LoginPage';
import { ProjectsPage } from '../../support/pages/ProjectsPage';
import { NavigationPage } from '../../support/pages/NavigationPage';

describe('Authentication User Journey', () => {
  const loginPage = new LoginPage();
  const projectsPage = new ProjectsPage();
  const navigationPage = new NavigationPage();

  // * Test user credentials
  const timestamp = Date.now();
  const testUser = {
    email: `test.user.${timestamp}@example.com`,
    password: 'TestPassword123!',
  };

  beforeEach(() => {
    // ! MANDATORY: Comprehensive debug setup
    cy.comprehensiveDebug();

    // * Clean state before each test
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  describe('Sign Up Flow', () => {
    it('should allow new user to sign up', () => {
      // * Navigate to login page
      loginPage.visit();

      // * Switch to sign up
      loginPage.switchToSignUp();

      // * Fill in sign up form
      loginPage.signUp(testUser.email, testUser.password);

      // * Verify success message
      loginPage.verifySignUpSuccess();

      // * User should be redirected to projects page
      cy.url().should('include', '/projects');
      navigationPage.verifyUserLoggedIn();
    });

    it('should prevent duplicate email registration', () => {
      // * First, create a user
      loginPage.visit();
      loginPage.signUp(testUser.email, testUser.password);
      loginPage.verifySignUpSuccess();

      // * Logout
      navigationPage.logout();

      // * Try to sign up with same email
      loginPage.visit();
      loginPage.signUp(testUser.email, testUser.password);

      // * Should show error
      loginPage.verifyLoginError('Email already registered');
    });

    it('should validate password requirements', () => {
      loginPage.visit();
      loginPage.switchToSignUp();

      // * Try weak password
      loginPage.enterEmail(`weak.${timestamp}@example.com`);
      loginPage.enterPassword('weak');
      loginPage.enterConfirmPassword('weak');
      loginPage.clickSignUp();

      // * Should show validation error
      loginPage.verifyValidationError('password', 'Password must be at least 8 characters');
    });

    it('should validate password confirmation', () => {
      loginPage.visit();
      loginPage.switchToSignUp();

      // * Enter mismatched passwords
      loginPage.enterEmail(`mismatch.${timestamp}@example.com`);
      loginPage.enterPassword('Password123!');
      loginPage.enterConfirmPassword('DifferentPassword123!');
      loginPage.clickSignUp();

      // * Should show validation error
      loginPage.verifyValidationError('confirmPassword', 'Passwords do not match');
    });
  });

  describe('Sign In Flow', () => {
    before(() => {
      // * Create a test user for sign in tests
      loginPage.visit();
      loginPage.signUp(testUser.email, testUser.password);
      navigationPage.logout();
    });

    it('should allow existing user to sign in', () => {
      loginPage.visit();
      loginPage.signIn(testUser.email, testUser.password);

      // * Should redirect to projects
      loginPage.verifyLoginSuccess();
      navigationPage.verifyUserLoggedIn();
    });

    it('should show error for invalid credentials', () => {
      loginPage.visit();
      loginPage.signIn(testUser.email, 'WrongPassword123!');

      // * Should show error message
      loginPage.verifyLoginError('Invalid email or password');

      // * Should stay on login page
      cy.url().should('include', '/login');
    });

    it('should show error for non-existent user', () => {
      loginPage.visit();
      loginPage.signIn('nonexistent@example.com', 'Password123!');

      // * Should show error message
      loginPage.verifyLoginError('Invalid email or password');
    });

    it('should remember user with Remember Me option', () => {
      loginPage.visit();
      loginPage.signIn(testUser.email, testUser.password, true);

      // * Verify logged in
      loginPage.verifyLoginSuccess();

      // * Close browser (simulate) and revisit
      cy.reload();

      // * Should still be logged in
      navigationPage.verifyUserLoggedIn();
    });

    it('should allow sign in with Enter key', () => {
      loginPage.visit();
      loginPage.enterEmail(testUser.email);
      loginPage.enterPassword(testUser.password);
      loginPage.submitWithEnter();

      // * Should sign in successfully
      loginPage.verifyLoginSuccess();
    });
  });

  describe('Logout Flow', () => {
    beforeEach(() => {
    // ! MANDATORY: Comprehensive debug setup
    cy.comprehensiveDebug();

      // * Sign in before each test
      loginPage.visit();
      loginPage.signIn(testUser.email, testUser.password);
    });

    it('should successfully logout user', () => {
      // * Verify logged in
      navigationPage.verifyUserLoggedIn();

      // * Logout
      navigationPage.logout();

      // * Should redirect to login page
      navigationPage.verifyUserLoggedOut();

      // * Trying to access protected page should redirect to login
      cy.visit('/projects');
      cy.url().should('include', '/login');
    });

    it('should clear session on logout', () => {
      // * Logout
      navigationPage.logout();

      // * Check cookies and localStorage are cleared
      cy.getCookie('auth-token').should('not.exist');
      cy.window().then((win) => {
        expect(win.localStorage.getItem('user')).to.be.null;
      });
    });
  });

  describe('Session Management', () => {
    it('should maintain session across page refreshes', () => {
      loginPage.visit();
      loginPage.signIn(testUser.email, testUser.password);

      // * Refresh page
      cy.reload();

      // * Should still be logged in
      navigationPage.verifyUserLoggedIn();
      cy.url().should('include', '/projects');
    });

    it('should redirect to login when session expires', () => {
      loginPage.visit();
      loginPage.signIn(testUser.email, testUser.password);

      // * Clear auth token to simulate expired session
      cy.clearCookie('auth-token');

      // * Try to navigate to protected page
      cy.visit('/projects');

      // * Should redirect to login
      cy.url().should('include', '/login');
    });
  });

  describe('Password Reset Flow', () => {
    it('should allow user to request password reset', () => {
      loginPage.visit();
      loginPage.clickForgotPassword();

      // * Enter email
      cy.get('[data-cy="reset-email-input"]').type(testUser.email);
      cy.get('[data-cy="send-reset-button"]').click();

      // * Should show success message
      cy.get('[data-cy="reset-success-message"]')
        .should('be.visible')
        .and('contain', 'Password reset email sent');
    });
  });

  describe('Navigation After Auth', () => {
    it('should show user menu when logged in', () => {
      loginPage.visit();
      loginPage.signIn(testUser.email, testUser.password);

      // * User menu should be visible
      navigationPage.verifyUserLoggedIn();
      navigationPage.openUserMenu();

      // * Should show user email
      navigationPage.verifyUsername(testUser.email);
    });

    it('should allow navigation to user profile', () => {
      loginPage.visit();
      loginPage.signIn(testUser.email, testUser.password);

      // * Navigate to profile
      navigationPage.goToProfile();

      // * Should be on profile page
      cy.url().should('include', '/profile');
    });

    it('should allow navigation to account settings', () => {
      loginPage.visit();
      loginPage.signIn(testUser.email, testUser.password);

      // * Navigate to account settings
      navigationPage.goToAccountSettings();

      // * Should be on settings page
      cy.url().should('include', '/settings');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', () => {
      // * Intercept and fail the login request
      cy.intercept('POST', '**/api/auth/login', {
        statusCode: 500,
        body: { error: 'Internal Server Error' }
      }).as('loginError');

      loginPage.visit();
      loginPage.signIn(testUser.email, testUser.password);

      cy.wait('@loginError');

      // * Should show error message
      loginPage.verifyLoginError('Something went wrong. Please try again.');
    });

    it('should handle validation errors', () => {
      loginPage.visit();

      // * Try to submit empty form
      loginPage.clickSignIn();

      // * Should show validation errors
      loginPage.verifyValidationError('email', 'Email is required');
      loginPage.verifyValidationError('password', 'Password is required');
    });
  });
});