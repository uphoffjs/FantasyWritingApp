/// <reference types="cypress" />
// E2E test support configuration

// * Import commands
import './commands';

// * Import cypress-axe for accessibility testing
import 'cypress-axe';

// * Set up global test configuration
Cypress.on('uncaught:exception', (err, runnable, promise) => {
  // ==========================================
  // 🔴 COMPREHENSIVE ERROR CAPTURE
  // ==========================================

  // Log detailed error information to terminal
  console.error('\n=== 🔴 UNCAUGHT EXCEPTION ===');
  console.error('Message:', err.message);
  console.error('Stack:', err.stack);
  console.error('Test:', runnable?.title || 'Unknown');
  console.error('Time:', new Date().toISOString());
  console.error('=============================\n');

  // Log to Cypress task for file/service logging (if configured)
  if (Cypress.env('LOG_ERRORS')) {
    cy.task('logError', {
      type: 'uncaught_exception',
      message: err.message,
      stack: err.stack,
      test: runnable?.title,
      timestamp: new Date().toISOString()
    }, { log: false }).catch(() => {
      // Silently fail if task not configured
    });
  }

  // Ignore known harmless errors
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false; // Don't fail test
  }

  // For all other errors: LOG but FAIL the test
  // This ensures we see the error immediately in terminal
  return true; // Fail the test with this error
});

// ==========================================
// 🔴 UNHANDLED PROMISE REJECTIONS
// ==========================================
Cypress.on('unhandled:rejection', (error, promise) => {
  console.error('\n=== 🔴 UNHANDLED PROMISE REJECTION ===');
  console.error('Error:', error?.message || error);
  console.error('Stack:', error?.stack);
  console.error('Time:', new Date().toISOString());
  console.error('======================================\n');

  if (Cypress.env('LOG_ERRORS')) {
    cy.task('logError', {
      type: 'promise_rejection',
      message: error?.message || String(error),
      stack: error?.stack,
      timestamp: new Date().toISOString()
    }, { log: false }).catch(() => {});
  }
});

// * Add custom commands to the global namespace
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
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
beforeEach(() => {
  // * Clear any existing test data
  cy.clearLocalStorage();
  cy.clearCookies();

  // ==========================================
  // 🔴 CAPTURE BROWSER CONSOLE ERRORS
  // ==========================================
  cy.window().then((win) => {
    // Store original console.error
    const originalError = win.console.error;

    // Override console.error to capture runtime errors
    win.console.error = function(...args) {
      // Log to terminal immediately
      console.error('🔴 BROWSER CONSOLE ERROR:', ...args);

      // Call original console.error
      originalError.apply(win.console, args);

      // Store error for test access
      win.cypressErrors = win.cypressErrors || [];
      win.cypressErrors.push({
        type: 'console_error',
        args: args,
        timestamp: new Date().toISOString()
      });
    };

    // Also capture console.warn for visibility
    const originalWarn = win.console.warn;
    win.console.warn = function(...args) {
      console.warn('⚠️  BROWSER CONSOLE WARN:', ...args);
      originalWarn.apply(win.console, args);
    };
  });
});

// * Handle test failures globally without conditional statements
// ! IMPORTANT: Using Cypress events instead of if/else per best practices
Cypress.on('fail', (error, runnable) => {
  // * Capture failure debug information
  cy.captureFailureDebug?.();

  // * Take a screenshot on failure
  const testTitle = runnable.title || 'unknown-test';
  // * Assert page state before screenshot
  cy.url().should('exist');
  cy.screenshot(`failed-${testTitle}`, { capture: 'runner' });

  // Re-throw the error to fail the test
  throw error;
});
