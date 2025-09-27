/**
 * LoginPage - Page object for login/registration functionality
 */

import BasePage from './BasePage';

class LoginPage extends BasePage {
  constructor() {
    super();
    this.path = '/login';
  }

  // * Page elements
  get emailInput() {
    return this.getByDataCy('email-input');
  }

  get passwordInput() {
    return this.getByDataCy('password-input');
  }

  get confirmPasswordInput() {
    return this.getByDataCy('confirm-password-input');
  }

  get signInButton() {
    return this.getByDataCy('sign-in-button');
  }

  get signUpButton() {
    return this.getByDataCy('sign-up-button');
  }

  get signInTab() {
    return this.getByDataCy('sign-in-tab');
  }

  get signUpTab() {
    return this.getByDataCy('sign-up-tab');
  }

  get rememberMeCheckbox() {
    return this.getByDataCy('remember-me-checkbox');
  }

  get forgotPasswordLink() {
    return this.getByDataCy('forgot-password-link');
  }

  get errorMessage() {
    return this.getByDataCy('auth-error-message');
  }

  get successMessage() {
    return this.getByDataCy('auth-success-message');
  }

  // * Page actions
  visit() {
    super.visit(this.path);
    return this;
  }

  switchToSignUp() {
    this.signUpTab.click();
    return this;
  }

  switchToSignIn() {
    this.signInTab.click();
    return this;
  }

  enterEmail(email) {
    this.emailInput.clear().type(email);
    return this;
  }

  enterPassword(password) {
    this.passwordInput.clear().type(password);
    return this;
  }

  enterConfirmPassword(password) {
    this.confirmPasswordInput.clear().type(password);
    return this;
  }

  checkRememberMe() {
    this.rememberMeCheckbox.check();
    return this;
  }

  uncheckRememberMe() {
    this.rememberMeCheckbox.uncheck();
    return this;
  }

  clickForgotPassword() {
    this.forgotPasswordLink.click();
    return this;
  }

  submitSignIn() {
    this.signInButton.click();
    return this;
  }

  submitSignUp() {
    this.signUpButton.click();
    return this;
  }

  // * Complex workflows
  signIn(email, password, rememberMe = false) {
    this.enterEmail(email);
    this.enterPassword(password);

    if (rememberMe) {
      this.checkRememberMe();
    }

    this.submitSignIn();
    return this;
  }

  signUp(email, password, confirmPassword = null) {
    this.switchToSignUp();
    this.enterEmail(email);
    this.enterPassword(password);
    this.enterConfirmPassword(confirmPassword || password);
    this.submitSignUp();
    return this;
  }

  signInWithValidCredentials() {
    const email = Cypress.env('TEST_USER_EMAIL') || 'test@example.com';
    const password = Cypress.env('TEST_USER_PASSWORD') || 'Test123!';
    return this.signIn(email, password);
  }

  signUpNewUser(uniqueId = Date.now()) {
    const email = `user${uniqueId}@test.com`;
    const password = 'Test123!';
    return this.signUp(email, password);
  }

  // * Password reset workflow
  initiatePasswordReset(email) {
    this.clickForgotPassword();
    this.getByDataCy('reset-email-input').clear().type(email);
    this.getByDataCy('send-reset-button').click();
    return this;
  }

  // * Assertions
  shouldShowSignInForm() {
    this.emailInput.should('be.visible');
    this.passwordInput.should('be.visible');
    this.signInButton.should('be.visible');
    this.confirmPasswordInput.should('not.exist');
    return this;
  }

  shouldShowSignUpForm() {
    this.emailInput.should('be.visible');
    this.passwordInput.should('be.visible');
    this.confirmPasswordInput.should('be.visible');
    this.signUpButton.should('be.visible');
    return this;
  }

  shouldShowError(errorText) {
    this.errorMessage.should('be.visible').and('contain', errorText);
    return this;
  }

  shouldShowSuccess(successText) {
    this.successMessage.should('be.visible').and('contain', successText);
    return this;
  }

  shouldBeLoggedIn() {
    cy.url().should('not.include', '/login');
    cy.getCookie('auth').should('exist');
    return this;
  }

  shouldNotBeLoggedIn() {
    cy.url().should('include', '/login');
    cy.getCookie('auth').should('not.exist');
    return this;
  }

  // * Form validation checks
  shouldShowEmailError(errorText = 'valid email') {
    this.getByDataCy('email-error').should('be.visible').and('contain', errorText);
    return this;
  }

  shouldShowPasswordError(errorText = 'at least') {
    this.getByDataCy('password-error').should('be.visible').and('contain', errorText);
    return this;
  }

  shouldShowPasswordMismatchError() {
    this.getByDataCy('confirm-password-error')
      .should('be.visible')
      .and('contain', 'match');
    return this;
  }

  shouldHaveSignInButtonDisabled() {
    this.signInButton.should('be.disabled');
    return this;
  }

  shouldHaveSignUpButtonDisabled() {
    this.signUpButton.should('be.disabled');
    return this;
  }

  // * Utility methods
  clearForm() {
    this.emailInput.clear();
    this.passwordInput.clear();
    cy.get('[data-cy="confirm-password-input"]').then($el => {
      if ($el.length > 0) {
        $el.val('');
      }
    });
    return this;
  }

  logout() {
    cy.clearCookies();
    cy.clearLocalStorage();
    this.visit();
    return this;
  }

  // * Session management for faster tests
  loginViaAPI(email = 'test@example.com', password = 'Test123!') {
    cy.request('POST', `${this.baseUrl}/api/auth/login`, {
      email,
      password
    }).then(response => {
      cy.setCookie('auth', response.body.token);
      cy.window().then(window => {
        window.localStorage.setItem('user', JSON.stringify(response.body.user));
      });
    });
    return this;
  }

  // * Wait for navigation after login
  waitForLoginRedirect() {
    cy.url().should('not.include', '/login', { timeout: 10000 });
    return this;
  }

  // * OAuth login methods (if applicable)
  signInWithGoogle() {
    this.getByDataCy('google-signin-button').click();
    // Handle OAuth flow
    return this;
  }

  signInWithGitHub() {
    this.getByDataCy('github-signin-button').click();
    // Handle OAuth flow
    return this;
  }
}

export default LoginPage;