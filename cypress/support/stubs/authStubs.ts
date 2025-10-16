/// <reference types="cypress" />

/**
 * Authentication Stub Helpers for Cypress Tests
 *
 * * Purpose: Stub Supabase authentication API calls for frontend testing
 * * Strategy: Use cy.intercept() to mock authentication without backend dependency
 * * Usage: Import and call stub functions in test files
 *
 * @see claudedocs/STUB-BASED-TESTING-GUIDE.md for complete documentation
 */

// * ============================================================================
// * SUCCESSFUL AUTHENTICATION STUBS
// * ============================================================================

/**
 * Stub a successful login response
 *
 * @param email - User email (default: 'test@example.com')
 * @param password - User password (for assertion, not used in stub)
 * @returns Stub configuration with user data
 *
 * @example
 * beforeEach(() => {
 *   stubSuccessfulLogin('user@test.com');
 * });
 *
 * it('should login successfully', () => {
 *   cy.visit('/');
 *   cy.get('[data-cy="email-input"]').type('user@test.com');
 *   cy.get('[data-cy="password-input"]').type('password123');
 *   cy.get('[data-cy="submit-button"]').click();
 *   cy.wait('@login');
 *   cy.url().should('include', '/projects');
 * });
 */
export const stubSuccessfulLogin = (email = 'test@example.com') => {
  const timestamp = Date.now();

  cy.intercept('POST', '**/auth/v1/token**', {
    statusCode: 200,
    body: {
      access_token: `fake-jwt-token-${timestamp}`,
      refresh_token: `fake-refresh-token-${timestamp}`,
      expires_in: 3600,
      token_type: 'bearer',
      user: {
        id: `user-${timestamp}`,
        email: email,
        aud: 'authenticated',
        role: 'authenticated',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: new Date().toISOString(),
        email_confirmed_at: '2024-01-01T00:00:00.000Z'
      }
    }
  }).as('login');

  return {
    userId: `user-${timestamp}`,
    email: email,
    accessToken: `fake-jwt-token-${timestamp}`
  };
};

/**
 * Stub a successful signup response
 *
 * @param email - User email (default: 'newuser@example.com')
 * @param requiresEmailVerification - Whether email verification is required
 * @returns Stub configuration with user data
 *
 * @example
 * beforeEach(() => {
 *   stubSuccessfulSignup('newuser@test.com', false);
 * });
 *
 * it('should signup successfully', () => {
 *   cy.visit('/');
 *   cy.get('[data-cy="signup-tab-button"]').click();
 *   cy.get('[data-cy="email-input"]').type('newuser@test.com');
 *   cy.get('[data-cy="password-input"]').type('password123');
 *   cy.get('[data-cy="submit-button"]').click();
 *   cy.wait('@signup');
 *   cy.url().should('include', '/projects');
 * });
 */
export const stubSuccessfulSignup = (
  email = 'newuser@example.com',
  requiresEmailVerification = false
) => {
  const timestamp = Date.now();

  cy.intercept('POST', '**/auth/v1/signup', {
    statusCode: 200,
    body: {
      access_token: requiresEmailVerification ? null : `fake-jwt-token-${timestamp}`,
      refresh_token: requiresEmailVerification ? null : `fake-refresh-token-${timestamp}`,
      expires_in: requiresEmailVerification ? null : 3600,
      token_type: requiresEmailVerification ? null : 'bearer',
      user: {
        id: `user-${timestamp}`,
        email: email,
        aud: 'authenticated',
        role: 'authenticated',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        email_confirmed_at: requiresEmailVerification ? null : new Date().toISOString(),
        confirmation_sent_at: requiresEmailVerification ? new Date().toISOString() : null
      }
    }
  }).as('signup');

  return {
    userId: `user-${timestamp}`,
    email: email,
    accessToken: requiresEmailVerification ? null : `fake-jwt-token-${timestamp}`,
    requiresVerification: requiresEmailVerification
  };
};

/**
 * Stub a valid session (user already authenticated)
 *
 * @param email - User email (default: 'test@example.com')
 * @returns Stub configuration with user data
 *
 * @example
 * beforeEach(() => {
 *   stubValidSession('user@test.com');
 * });
 *
 * it('should persist session on reload', () => {
 *   cy.visit('/projects');
 *   cy.reload();
 *   cy.wait('@session');
 *   cy.url().should('include', '/projects');
 * });
 */
export const stubValidSession = (email = 'test@example.com') => {
  const timestamp = Date.now();

  cy.intercept('GET', '**/auth/v1/user**', {
    statusCode: 200,
    body: {
      id: `user-${timestamp}`,
      email: email,
      aud: 'authenticated',
      role: 'authenticated',
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: new Date().toISOString(),
      email_confirmed_at: '2024-01-01T00:00:00.000Z'
    }
  }).as('session');

  return {
    userId: `user-${timestamp}`,
    email: email
  };
};

/**
 * Stub a successful logout
 *
 * @example
 * beforeEach(() => {
 *   stubSuccessfulLogout();
 * });
 *
 * it('should logout successfully', () => {
 *   cy.visit('/projects');
 *   cy.get('[data-cy="logout-button"]').click();
 *   cy.wait('@logout');
 *   cy.url().should('include', '/login');
 * });
 */
export const stubSuccessfulLogout = () => {
  cy.intercept('POST', '**/auth/v1/logout', {
    statusCode: 204,
    body: {}
  }).as('logout');
};

/**
 * Stub a successful password reset request
 *
 * @param email - User email (default: 'test@example.com')
 *
 * @example
 * beforeEach(() => {
 *   stubPasswordResetRequest('user@test.com');
 * });
 *
 * it('should request password reset', () => {
 *   cy.visit('/forgot-password');
 *   cy.get('[data-cy="email-input"]').type('user@test.com');
 *   cy.get('[data-cy="submit-button"]').click();
 *   cy.wait('@passwordReset');
 *   cy.get('[data-cy="success-message"]').should('be.visible');
 * });
 */
export const stubPasswordResetRequest = (email = 'test@example.com') => {
  cy.intercept('POST', '**/auth/v1/recover', {
    statusCode: 200,
    body: {}
  }).as('passwordReset');
};

// * ============================================================================
// * FAILED AUTHENTICATION STUBS
// * ============================================================================

/**
 * Stub a failed login (invalid credentials)
 *
 * @param errorMessage - Custom error message (default: 'Invalid login credentials')
 *
 * @example
 * beforeEach(() => {
 *   stubFailedLogin();
 * });
 *
 * it('should show error for invalid credentials', () => {
 *   cy.visit('/');
 *   cy.get('[data-cy="email-input"]').type('wrong@test.com');
 *   cy.get('[data-cy="password-input"]').type('wrongpassword');
 *   cy.get('[data-cy="submit-button"]').click();
 *   cy.wait('@loginFailed');
 *   cy.get('[data-cy="login-error"]').should('be.visible');
 *   cy.get('[data-cy="login-error"]').should('contain', 'Invalid login credentials');
 * });
 */
export const stubFailedLogin = (errorMessage = 'Invalid login credentials') => {
  cy.intercept('POST', '**/auth/v1/token**', {
    statusCode: 400,
    body: {
      error: 'invalid_grant',
      error_description: errorMessage
    }
  }).as('loginFailed');
};

/**
 * Stub a failed signup (email already exists)
 *
 * @param errorMessage - Custom error message (default: 'User already registered')
 *
 * @example
 * beforeEach(() => {
 *   stubFailedSignup('User already registered');
 * });
 *
 * it('should show error for existing email', () => {
 *   cy.visit('/');
 *   cy.get('[data-cy="signup-tab-button"]').click();
 *   cy.get('[data-cy="email-input"]').type('existing@test.com');
 *   cy.get('[data-cy="password-input"]').type('password123');
 *   cy.get('[data-cy="submit-button"]').click();
 *   cy.wait('@signupFailed');
 *   cy.get('[data-cy="signup-error"]').should('be.visible');
 * });
 */
export const stubFailedSignup = (errorMessage = 'User already registered') => {
  cy.intercept('POST', '**/auth/v1/signup', {
    statusCode: 422,
    body: {
      error: 'user_already_exists',
      error_description: errorMessage
    }
  }).as('signupFailed');
};

/**
 * Stub an expired or invalid session
 *
 * @example
 * beforeEach(() => {
 *   stubExpiredSession();
 * });
 *
 * it('should redirect to login on expired session', () => {
 *   cy.visit('/projects');
 *   cy.wait('@sessionExpired');
 *   cy.url().should('include', '/login');
 * });
 */
export const stubExpiredSession = () => {
  cy.intercept('GET', '**/auth/v1/user**', {
    statusCode: 401,
    body: {
      error: 'invalid_token',
      error_description: 'JWT expired'
    }
  }).as('sessionExpired');
};

// * ============================================================================
// * NETWORK ERROR STUBS
// * ============================================================================

/**
 * Stub a network timeout error
 *
 * @param delayMs - Delay before timeout (default: 30000ms)
 *
 * @example
 * beforeEach(() => {
 *   stubNetworkTimeout();
 * });
 *
 * it('should show timeout error', () => {
 *   cy.visit('/');
 *   cy.get('[data-cy="email-input"]').type('user@test.com');
 *   cy.get('[data-cy="password-input"]').type('password123');
 *   cy.get('[data-cy="submit-button"]').click();
 *   cy.get('[data-cy="error-message"]').should('contain', 'timeout');
 * });
 */
export const stubNetworkTimeout = (delayMs = 30000) => {
  cy.intercept('POST', '**/auth/v1/**', {
    forceNetworkError: true,
    delay: delayMs
  }).as('networkTimeout');
};

/**
 * Stub a server error (500)
 *
 * @example
 * beforeEach(() => {
 *   stubServerError();
 * });
 *
 * it('should handle server error gracefully', () => {
 *   cy.visit('/');
 *   cy.get('[data-cy="email-input"]').type('user@test.com');
 *   cy.get('[data-cy="password-input"]').type('password123');
 *   cy.get('[data-cy="submit-button"]').click();
 *   cy.wait('@serverError');
 *   cy.get('[data-cy="error-message"]').should('be.visible');
 * });
 */
export const stubServerError = () => {
  cy.intercept('POST', '**/auth/v1/**', {
    statusCode: 500,
    body: {
      error: 'internal_server_error',
      error_description: 'An unexpected error occurred'
    }
  }).as('serverError');
};
