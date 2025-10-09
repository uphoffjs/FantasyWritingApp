/// <reference types="cypress" />
// E2E test support configuration

// * Import commands
import './commands';
import './authCommands';

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

      // * Debug commands
      dumpConsoleLogs(): Chainable<void>;
    }
  }
}

// ==========================================
// 🔍 CAPTURE ALL BROWSER CONSOLE OUTPUT
// ==========================================
// * Must happen BEFORE window loads to catch all logs
Cypress.on('window:before:load', (win) => {
  // Store originals
  const originalLog = win.console.log;
  const originalError = win.console.error;
  const originalWarn = win.console.warn;

  // Override console.log to output to terminal via direct console output
  win.console.log = function(...args: unknown[]) {
    // Format message
    const message = args.map(arg => {
      try {
        return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
      } catch {
        return String(arg);
      }
    }).join(' ');

    // Store for later retrieval
    interface WindowWithLogs extends Window {
      __cypressLogs?: Array<{ type: string; message: string; timestamp: number }>;
    }
    const winWithLogs = win as WindowWithLogs;
    if (!winWithLogs.__cypressLogs) {
      winWithLogs.__cypressLogs = [];
    }
    winWithLogs.__cypressLogs.push({ type: 'log', message, timestamp: Date.now() });

    // Call original so it appears in browser console
    originalLog.apply(win.console, args);
  };

  // Override console.error
  win.console.error = function(...args: unknown[]) {
    const message = args.map(arg => {
      try {
        return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
      } catch {
        return String(arg);
      }
    }).join(' ');

    console.error('🔴 BROWSER ERROR:', message);
    originalError.apply(win.console, args);
  };

  // Override console.warn
  win.console.warn = function(...args: unknown[]) {
    const message = args.map(arg => {
      try {
        return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
      } catch {
        return String(arg);
      }
    }).join(' ');

    console.warn('⚠️ BROWSER WARN:', message);
    originalWarn.apply(win.console, args);
  };
});

// * Configure test environment
beforeEach(() => {
  // * Clear any existing test data
  cy.clearLocalStorage();
  cy.clearCookies();
});

// * Custom command to dump console logs
Cypress.Commands.add('dumpConsoleLogs', () => {
  cy.window().then((win) => {
    interface WindowWithLogs extends Window {
      __cypressLogs?: Array<{ type: string; message: string; timestamp: number }>;
    }
    const winWithLogs = win as WindowWithLogs;
    const logs = winWithLogs.__cypressLogs || [];
    cy.task('log', `\n========== CAPTURED CONSOLE LOGS (${logs.length} total) ==========`);
    logs.forEach((log: { type: string; message: string; timestamp: number }, index: number) => {
      cy.task('log', `[${index + 1}] ${log.type.toUpperCase()}: ${log.message}`);
    });
    cy.task('log', `========== END CONSOLE LOGS ==========\n`);
  });
});

// * Handle test failures globally without conditional statements
// ! IMPORTANT: Using Cypress events instead of if/else per best practices
Cypress.on('fail', (error, runnable) => {
  // * Capture failure debug information
  cy.captureFailureDebug?.();

  // * Dump console logs on failure
  cy.dumpConsoleLogs();

  // * Take a screenshot on failure
  const testTitle = runnable.title || 'unknown-test';
  // * Assert page state before screenshot
  cy.url().should('exist');
  cy.screenshot(`failed-${testTitle}`, { capture: 'runner' });

  // Re-throw the error to fail the test
  throw error;
});
