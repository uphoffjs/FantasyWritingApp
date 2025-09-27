/**
 * Login Page Object
 * Handles authentication flows including sign in and sign up
 */

import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  // * Page-specific selectors
  private pageSelectors = {
    // * Form fields
    emailInput: '[data-cy="email-input"]',
    passwordInput: '[data-cy="password-input"]',
    confirmPasswordInput: '[data-cy="confirm-password-input"]',

    // * Buttons
    signInButton: '[data-cy="sign-in-button"]',
    signUpButton: '[data-cy="sign-up-button"]',
    signInTab: '[data-cy="sign-in-tab"]',
    signUpTab: '[data-cy="sign-up-tab"]',
    forgotPasswordLink: '[data-cy="forgot-password-link"]',

    // * Other elements
    rememberMeCheckbox: '[data-cy="remember-me-checkbox"]',
    errorAlert: '[data-cy="error-alert"]',
    successAlert: '[data-cy="success-alert"]',
    loadingIndicator: '[data-cy="loading-indicator"]',
  };

  /**
   * Navigate to login page
   */
  visit(): void {
    super.visit('/login');
    this.waitForPageLoad();
  }

  /**
   * Fill in email field
   */
  enterEmail(email: string): void {
    cy.get(this.pageSelectors.emailInput).clear().type(email);
  }

  /**
   * Fill in password field
   */
  enterPassword(password: string): void {
    cy.get(this.pageSelectors.passwordInput).clear().type(password);
  }

  /**
   * Fill in confirm password field (for sign up)
   */
  enterConfirmPassword(password: string): void {
    cy.get(this.pageSelectors.confirmPasswordInput).clear().type(password);
  }

  /**
   * Click sign in button
   */
  clickSignIn(): void {
    cy.get(this.pageSelectors.signInButton).click();
  }

  /**
   * Click sign up button
   */
  clickSignUp(): void {
    cy.get(this.pageSelectors.signUpButton).click();
  }

  /**
   * Switch to sign up tab
   */
  switchToSignUp(): void {
    cy.get(this.pageSelectors.signUpTab).click();
  }

  /**
   * Switch to sign in tab
   */
  switchToSignIn(): void {
    cy.get(this.pageSelectors.signInTab).click();
  }

  /**
   * Toggle remember me checkbox
   */
  toggleRememberMe(): void {
    cy.get(this.pageSelectors.rememberMeCheckbox).click();
  }

  /**
   * Complete sign in flow
   */
  signIn(email: string, password: string, rememberMe: boolean = false): void {
    this.enterEmail(email);
    this.enterPassword(password);

    if (rememberMe) {
      this.toggleRememberMe();
    }

    this.clickSignIn();
  }

  /**
   * Complete sign up flow
   */
  signUp(email: string, password: string, confirmPassword?: string): void {
    this.switchToSignUp();
    this.enterEmail(email);
    this.enterPassword(password);
    this.enterConfirmPassword(confirmPassword || password);
    this.clickSignUp();
  }

  /**
   * Sign in with test user
   */
  signInWithTestUser(): void {
    const testUser = Cypress.env('TEST_USER_EMAIL') || 'test@example.com';
    const testPassword = Cypress.env('TEST_USER_PASSWORD') || 'Test123!';
    this.signIn(testUser, testPassword);
  }

  /**
   * Verify successful login
   */
  verifyLoginSuccess(): void {
    // * Should redirect away from login page
    cy.url().should('not.include', '/login');
    // * Should show projects or dashboard
    cy.url().should('include', '/projects');
  }

  /**
   * Verify login error
   */
  verifyLoginError(errorMessage?: string): void {
    cy.get(this.pageSelectors.errorAlert).should('be.visible');
    if (errorMessage) {
      cy.get(this.pageSelectors.errorAlert).should('contain', errorMessage);
    }
  }

  /**
   * Verify sign up success
   */
  verifySignUpSuccess(): void {
    cy.get(this.pageSelectors.successAlert).should('be.visible');
    cy.get(this.pageSelectors.successAlert).should('contain', 'Account created');
  }

  /**
   * Click forgot password link
   */
  clickForgotPassword(): void {
    cy.get(this.pageSelectors.forgotPasswordLink).click();
  }

  /**
   * Verify form validation errors
   */
  verifyValidationError(field: 'email' | 'password' | 'confirmPassword', message: string): void {
    const fieldMap = {
      email: this.pageSelectors.emailInput,
      password: this.pageSelectors.passwordInput,
      confirmPassword: this.pageSelectors.confirmPasswordInput,
    };

    cy.get(fieldMap[field])
      .parent()
      .find('[data-cy="field-error"]')
      .should('contain', message);
  }

  /**
   * Verify user is logged in
   */
  verifyUserIsLoggedIn(): void {
    // * Check for user menu or logout button
    cy.get('[data-cy="user-menu"]').should('be.visible');
  }

  /**
   * Verify user is logged out
   */
  verifyUserIsLoggedOut(): void {
    cy.url().should('include', '/login');
    cy.get(this.pageSelectors.emailInput).should('be.visible');
  }

  /**
   * Wait for login to complete
   */
  waitForLoginToComplete(): void {
    cy.get(this.pageSelectors.loadingIndicator).should('not.exist');
    // * Wait for navigation to complete
    cy.url().should('not.include', '/login');
  }

  /**
   * Clear form inputs
   */
  clearForm(): void {
    cy.get(this.pageSelectors.emailInput).clear();
    cy.get(this.pageSelectors.passwordInput).clear();
  }

  /**
   * Submit form with Enter key
   */
  submitWithEnter(): void {
    cy.get(this.pageSelectors.passwordInput).type('{enter}');
  }

  /**
   * Verify password visibility toggle
   */
  togglePasswordVisibility(): void {
    cy.get('[data-cy="toggle-password-visibility"]').click();
  }

  /**
   * Sign in using session (for faster tests)
   */
  signInWithSession(email: string, password: string): void {
    cy.session(
      [email, password],
      () => {
        this.visit();
        this.signIn(email, password);
        this.waitForLoginToComplete();
      },
      {
        validate() {
          cy.getCookie('auth-token').should('exist');
        },
        cacheAcrossSpecs: true,
      }
    );
  }
}