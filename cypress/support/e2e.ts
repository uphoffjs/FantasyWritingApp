// E2E test support configuration

// * Import commands
import './commands';

// * Import cypress-axe for accessibility testing
import 'cypress-axe';

// * Set up global test configuration
Cypress.on('uncaught:exception', (err, runnable) => {
  // Prevent Cypress from failing tests on uncaught exceptions
  // * Return false to prevent the error from failing the test
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false;
  }
  // * Log the error for debugging
  console.error('Uncaught exception:', err);
  return false;
});

// * Add custom commands to the global namespace
declare global {
  namespace Cypress {
    interface Chainable {
      // ! SECURITY: * Authentication commands
      login(email?: string, password?: string): Chainable<void>;
      logout(): Chainable<void>;
      
      // Story/Writing commands
      createStory(title: string, genre?: string): Chainable<void>;
      openStory(title: string): Chainable<void>;
      saveStory(): Chainable<void>;
      
      // * Character commands
      createCharacter(name: string, role?: string): Chainable<void>;
      editCharacter(name: string): Chainable<void>;
      
      // * Navigation commands
      navigateToHome(): Chainable<void>;
      navigateToStories(): Chainable<void>;
      navigateToCharacters(): Chainable<void>;
      navigateToSettings(): Chainable<void>;
      
      // * Utility commands
      waitForLoad(): Chainable<void>;
      checkAccessibility(): Chainable<void>;
    }
  }
}

// * Configure test environment
before(() => {
  // * Clear any existing test data
  cy.clearLocalStorage();
  cy.clearCookies();
});

// * Handle test failures globally without conditional statements
// ! IMPORTANT: Using Cypress events instead of if/else per best practices
Cypress.on('fail', (error, runnable) => {
  // * Capture failure debug information
  cy.captureFailureDebug?.();

  // * Take a screenshot on failure
  const testTitle = runnable.title || 'unknown-test';
  cy.screenshot(`failed-${testTitle}`, { capture: 'runner' });

  // Re-throw the error to fail the test
  throw error;
});