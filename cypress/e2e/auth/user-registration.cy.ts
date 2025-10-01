/// <reference types="cypress" />

/**
 * User Registration Flow - E2E Test
 * Tests the complete user registration journey from landing to first project creation
 *
 * User Story:
 * As a new user
 * I want to create an account
 * So that I can start managing my fantasy writing projects
 *
 * Acceptance Criteria:
 * - User can navigate to registration form
 * - User can enter valid registration details
 * - User receives confirmation of account creation
 * - User is automatically logged in after registration
 * - User can access the projects dashboard
 * - User can create their first project
 */

import LoginPage from '../../support/pages/LoginPage';
import ProjectListPage from '../../support/pages/ProjectListPage';
import NavigationPage from '../../support/pages/NavigationPage';

describe('User Registration Flow', () => {
  const loginPage = new LoginPage();
  const projectListPage = new ProjectListPage();
  const navigation = new NavigationPage();

  // * Generate unique user data for each test
  const generateUserData = () => {
    const timestamp = Date.now();
    return {
      email: `testuser${timestamp}@example.com`,
      password: 'Test123!@#',
      firstName: 'Test',
      lastName: 'User'
    };
  };

  beforeEach(() => {

    // * Clean state before each test (Cypress best practice)
    cy.clearCookies();
    cy.clearLocalStorage();

    // * Visit the login page
    loginPage.visit();
  });

  describe('Successful Registration', () => {
    it('should allow new user to register and access the application', () => {
      const userData = generateUserData();

      // * Step 1: Navigate to registration form
      loginPage.switchToSignUp();
      loginPage.shouldShowSignUpForm();

      // * Step 2: Fill in registration details
      loginPage.enterEmail(userData.email);
      loginPage.enterPassword(userData.password);
      loginPage.enterConfirmPassword(userData.password);

      // * Step 3: Submit registration
      loginPage.submitSignUp();

      // * Step 4: Verify successful registration
      loginPage.shouldShowSuccess('Account created successfully');

      // * Step 5: Verify automatic login
      loginPage.waitForLoginRedirect();
      navigation.shouldBeLoggedIn();

      // * Step 6: Verify navigation to projects page
      cy.url().should('include', '/projects');
      projectListPage.shouldShowEmptyState();

      // * Step 7: Verify user can create first project
      projectListPage.createNewProject({
        name: 'My First Fantasy World',
        description: 'A magical realm filled with dragons and wizards',
        genre: 'Fantasy'
      });

      projectListPage.shouldHaveProjectCount(1);
      projectListPage.shouldShowProject('My First Fantasy World');
    });

    it('should display onboarding for new users', () => {
      const userData = generateUserData();

      // * Register new user
      loginPage.signUpNewUser(Date.now());
      loginPage.waitForLoginRedirect();

      // * Check for onboarding elements
      cy.get('[data-cy="onboarding-welcome"]').should('be.visible');
      cy.get('[data-cy="onboarding-tutorial"]').should('be.visible');

      // * Complete onboarding
      cy.get('[data-cy="skip-onboarding"]').click();

      // * Verify user is on projects page
      projectListPage.shouldShowEmptyState();
    });
  });

  describe('Registration Validation', () => {
    it('should validate email format', () => {
      loginPage.switchToSignUp();

      // * Test invalid email formats
      const invalidEmails = [
        'notanemail',
        'missing@domain',
        '@nodomain.com',
        'spaces in@email.com'
      ];

      invalidEmails.forEach(email => {
        loginPage.enterEmail(email);
        loginPage.enterPassword('ValidPass123!');
        loginPage.submitSignUp();
        loginPage.shouldShowEmailError('valid email');
        loginPage.clearForm();
      });
    });

    it('should validate password requirements', () => {
      loginPage.switchToSignUp();
      loginPage.enterEmail('test@example.com');

      // * Test weak passwords
      const weakPasswords = [
        'short',           // Too short
        'nouppercase123!', // No uppercase
        'NOLOWERCASE123!', // No lowercase
        'NoNumbers!',      // No numbers
        'NoSpecial123',    // No special characters
      ];

      weakPasswords.forEach(password => {
        loginPage.enterPassword(password);
        loginPage.enterConfirmPassword(password);
        loginPage.submitSignUp();
        loginPage.shouldShowPasswordError();
        loginPage.clearForm();
        loginPage.enterEmail('test@example.com');
      });
    });

    it('should validate password confirmation match', () => {
      loginPage.switchToSignUp();

      loginPage.enterEmail('test@example.com');
      loginPage.enterPassword('ValidPass123!');
      loginPage.enterConfirmPassword('DifferentPass123!');
      loginPage.submitSignUp();

      loginPage.shouldShowPasswordMismatchError();
    });

    it('should prevent duplicate email registration', () => {
      const userData = generateUserData();

      // * First registration
      loginPage.signUp(userData.email, userData.password);
      loginPage.waitForLoginRedirect();

      // * Logout
      navigation.logout();

      // * Attempt duplicate registration
      loginPage.switchToSignUp();
      loginPage.enterEmail(userData.email);
      loginPage.enterPassword(userData.password);
      loginPage.enterConfirmPassword(userData.password);
      loginPage.submitSignUp();

      loginPage.shouldShowError('Email already registered');
    });

    it('should require all mandatory fields', () => {
      loginPage.switchToSignUp();

      // * Try to submit empty form
      loginPage.submitSignUp();
      loginPage.shouldHaveSignUpButtonDisabled();

      // * Fill email only
      loginPage.enterEmail('test@example.com');
      loginPage.submitSignUp();
      loginPage.shouldShowError('Password is required');

      // * Fill password but not confirm
      loginPage.enterPassword('ValidPass123!');
      loginPage.submitSignUp();
      loginPage.shouldShowError('Please confirm your password');
    });
  });

  describe('Registration User Experience', () => {
    it('should show/hide password when toggle is clicked', () => {
      loginPage.switchToSignUp();

      // * Password should be hidden by default
      loginPage.passwordInput.should('have.attr', 'type', 'password');

      // * Click show password
      cy.get('[data-cy="toggle-password-visibility"]').click();
      loginPage.passwordInput.should('have.attr', 'type', 'text');

      // * Click hide password
      cy.get('[data-cy="toggle-password-visibility"]').click();
      loginPage.passwordInput.should('have.attr', 'type', 'password');
    });

    it('should display password strength indicator', () => {
      loginPage.switchToSignUp();

      // * Weak password
      loginPage.enterPassword('weak');
      cy.get('[data-cy="password-strength"]').should('contain', 'Weak');

      // * Medium password
      loginPage.enterPassword('Medium123');
      cy.get('[data-cy="password-strength"]').should('contain', 'Medium');

      // * Strong password
      loginPage.enterPassword('Str0ng!Pass#2024');
      cy.get('[data-cy="password-strength"]').should('contain', 'Strong');
    });

    it('should allow switching between sign in and sign up', () => {
      // * Start on sign in
      loginPage.shouldShowSignInForm();

      // * Switch to sign up
      loginPage.switchToSignUp();
      loginPage.shouldShowSignUpForm();

      // * Switch back to sign in
      loginPage.switchToSignIn();
      loginPage.shouldShowSignInForm();
    });

    it('should preserve email when switching between forms', () => {
      const email = 'test@example.com';

      // * Enter email in sign in
      loginPage.enterEmail(email);

      // * Switch to sign up
      loginPage.switchToSignUp();
      loginPage.emailInput.should('have.value', email);

      // * Switch back to sign in
      loginPage.switchToSignIn();
      loginPage.emailInput.should('have.value', email);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', () => {
      // * Simulate network failure
      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 500,
        body: { error: 'Internal Server Error' }
      }).as('registerError');

      loginPage.switchToSignUp();
      loginPage.signUp('test@example.com', 'ValidPass123!');

      cy.wait('@registerError');
      loginPage.shouldShowError('Something went wrong. Please try again.');
    });

    it('should handle timeout errors', () => {
      // * Simulate timeout
      cy.intercept('POST', '**/api/auth/register', (req) => {
        req.reply((res) => {
          res.delay(15000); // 15 second delay
          res.send({ success: true });
        });
      }).as('registerTimeout');

      loginPage.switchToSignUp();
      loginPage.signUp('test@example.com', 'ValidPass123!');

      // * Should show timeout error after 10 seconds
      loginPage.shouldShowError('Request timeout');
    });

    it('should allow retry after error', () => {
      // * First attempt fails
      cy.intercept('POST', '**/api/auth/register', { times: 1 }, {
        statusCode: 500,
        body: { error: 'Server Error' }
      }).as('firstAttempt');

      // * Second attempt succeeds
      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 200,
        body: { success: true, user: { id: '123', email: 'test@example.com' } }
      }).as('secondAttempt');

      loginPage.switchToSignUp();

      // * First attempt
      loginPage.signUp('test@example.com', 'ValidPass123!');
      cy.wait('@firstAttempt');
      loginPage.shouldShowError('Server Error');

      // * Dismiss error and retry
      loginPage.dismissError();
      loginPage.submitSignUp();
      cy.wait('@secondAttempt');
      loginPage.waitForLoginRedirect();
    });
  });

  describe('Mobile Registration', () => {
    beforeEach(() => {

      cy.viewport('iphone-x');
    });

    it('should work on mobile devices', () => {
      const userData = generateUserData();

      loginPage.switchToSignUp();
      loginPage.signUp(userData.email, userData.password);
      loginPage.waitForLoginRedirect();

      // * Mobile navigation should work
      navigation.shouldBeOnPage('projects');
      cy.get('[data-cy="bottom-navigation"]').should('be.visible');
    });

    it('should handle keyboard properly on mobile', () => {
      loginPage.switchToSignUp();

      // * Focus email field - keyboard should appear
      loginPage.emailInput.focus();
      // Note: Can't actually test keyboard appearance in Cypress

      // * Tab to password field
      loginPage.passwordInput.focus();
      loginPage.emailInput.should('not.have.focus');

      // * Submit with enter key
      loginPage.enterEmail('test@example.com');
      loginPage.enterPassword('ValidPass123!');
      loginPage.enterConfirmPassword('ValidPass123!');
      loginPage.confirmPasswordInput.type('{enter}');

      // * Form should be submitted
      cy.url().should('not.include', '/login');
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard navigable', () => {
      loginPage.switchToSignUp();

      // * Tab through form fields
      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-cy', 'email-input');

      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-cy', 'password-input');

      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-cy', 'confirm-password-input');

      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-cy', 'sign-up-button');
    });

    it('should have proper ARIA labels', () => {
      loginPage.switchToSignUp();

      loginPage.emailInput.should('have.attr', 'aria-label', 'Email address');
      loginPage.passwordInput.should('have.attr', 'aria-label', 'Password');
      loginPage.confirmPasswordInput.should('have.attr', 'aria-label', 'Confirm password');
      loginPage.signUpButton.should('have.attr', 'aria-label', 'Create account');
    });

    it('should announce form errors to screen readers', () => {
      loginPage.switchToSignUp();

      // * Submit invalid form
      loginPage.submitSignUp();

      // * Error should be announced
      cy.get('[role="alert"]').should('exist');
      cy.get('[aria-live="polite"]').should('contain', 'required');
    });
  });

  describe('Performance', () => {
    it('should complete registration within acceptable time', () => {
      const userData = generateUserData();

      // * Mark performance start
      cy.window().then(win => {
        win.performance.mark('registration-start');
      });

      loginPage.switchToSignUp();
      loginPage.signUp(userData.email, userData.password);
      loginPage.waitForLoginRedirect();

      // * Mark performance end
      cy.window().then(win => {
        win.performance.mark('registration-end');
        win.performance.measure(
          'registration-flow',
          'registration-start',
          'registration-end'
        );

        const measure = win.performance.getEntriesByName('registration-flow')[0];
        expect(measure.duration).to.be.lessThan(5000); // Should complete in 5 seconds
      });
    });
  });
});