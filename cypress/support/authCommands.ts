/**
 * Custom Cypress commands for authentication testing
 *
 * These commands provide reusable authentication utilities for E2E tests.
 */

/**
 * Login as a specific user from fixtures
 * @param userFixture - The fixture name (e.g., 'validUser', 'existingUser')
 * @example cy.loginAs('validUser')
 */
Cypress.Commands.add('loginAs', (userFixture: string) => {
  cy.log(`🔐 Logging in as: ${userFixture}`);

  // Load the user fixture
  cy.fixture(`auth/users.json`).then((users) => {
    const user = users[userFixture];

    if (!user) {
      throw new Error(`User fixture "${userFixture}" not found in auth/users.json`);
    }

    // Visit login page
    cy.visit('/login');

    // Fill in login form
    cy.get('[data-cy="email-input"]').type(user.email);
    cy.get('[data-cy="password-input"]').type(user.password);

    // Submit login
    cy.get('[data-cy="login-button"]').click();

    // Wait for navigation away from login page
    cy.url().should('not.include', '/login');

    // Verify authentication
    cy.shouldBeAuthenticated();

    cy.log(`✅ Successfully logged in as: ${user.email}`);
  });
});

/**
 * Logout the current user
 * @example cy.logout()
 */
Cypress.Commands.add('logout', () => {
  cy.log('🚪 Logging out');

  // * Try to find logout button in navigation or settings
  // * Adjust selectors based on your app's implementation
  cy.get('body').then(($body) => {
    // Check if logout button exists in navigation
    if ($body.find('[data-cy="logout-button"]').length > 0) {
      cy.get('[data-cy="logout-button"]').click();
    } else if ($body.find('[data-cy="settings-button"]').length > 0) {
      // Navigate to settings first
      cy.get('[data-cy="settings-button"]').click();
      cy.get('[data-cy="logout-button"]').click();
    } else {
      // Fallback: Clear cookies and local storage
      cy.log('⚠️ No logout button found, clearing session manually');
      cy.clearCookies();
      cy.clearLocalStorage();
    }
  });

  // Verify we're logged out
  cy.shouldNotBeAuthenticated();

  cy.log('✅ Successfully logged out');
});

/**
 * Assert that user is authenticated
 * @example cy.shouldBeAuthenticated()
 */
Cypress.Commands.add('shouldBeAuthenticated', () => {
  cy.log('🔍 Verifying authentication');

  // * Check for authentication indicators
  // * Adjust based on your app's authentication UI

  // Method 1: Check for auth token in localStorage
  cy.window().its('localStorage').then((storage) => {
    // Supabase stores auth in localStorage with key 'sb-{project-ref}-auth-token'
    const authKeys = Object.keys(storage).filter((key) => key.includes('auth-token'));

    if (authKeys.length === 0) {
      throw new Error('No auth token found in localStorage');
    }

    const authData = JSON.parse(storage[authKeys[0]]);

    if (!authData || !authData.access_token) {
      throw new Error('Invalid auth token structure');
    }
  });

  // Method 2: Check for authenticated UI elements
  // * Uncomment and adjust based on your app's UI
  // cy.get('[data-cy="user-menu"]').should('be.visible');
  // cy.get('[data-cy="logout-button"]').should('exist');

  cy.log('✅ User is authenticated');
});

/**
 * Assert that user is NOT authenticated
 * @example cy.shouldNotBeAuthenticated()
 */
Cypress.Commands.add('shouldNotBeAuthenticated', () => {
  cy.log('🔍 Verifying NOT authenticated');

  // * Check that authentication indicators are absent

  // Method 1: Check localStorage is clear
  cy.window().its('localStorage').then((storage) => {
    const authKeys = Object.keys(storage).filter((key) => key.includes('auth-token'));

    if (authKeys.length > 0) {
      const authData = JSON.parse(storage[authKeys[0]]);

      // Check if token exists and is valid
      if (authData && authData.access_token) {
        throw new Error('Auth token still exists in localStorage');
      }
    }
  });

  // Method 2: Check that authenticated UI elements don't exist
  // * Uncomment and adjust based on your app's UI
  // cy.get('[data-cy="user-menu"]').should('not.exist');

  cy.log('✅ User is NOT authenticated');
});

// * Export types for TypeScript support
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /**
       * Login as a specific user from fixtures
       * @param userFixture - The fixture name (e.g., 'validUser', 'existingUser')
       * @example cy.loginAs('validUser')
       */
      loginAs(userFixture: string): Chainable<void>;

      /**
       * Logout the current user
       * @example cy.logout()
       */
      logout(): Chainable<void>;

      /**
       * Assert that user is authenticated
       * @example cy.shouldBeAuthenticated()
       */
      shouldBeAuthenticated(): Chainable<void>;

      /**
       * Assert that user is NOT authenticated
       * @example cy.shouldNotBeAuthenticated()
       */
      shouldNotBeAuthenticated(): Chainable<void>;
    }
  }
}
