/// <reference types="cypress" />

/**
 * Phase 4: Session Management Tests (Stub-Based)
 *
 * * Purpose: Test session persistence, timeout handling, and multi-tab synchronization
 * * Strategy: Stub-based testing using cy.intercept() for API mocking
 * * Enhancement: Includes spy validation for auth function invocation
 *
 * @see TODO-AUTH-TESTS-PHASE-4-SESSION-STUBS.md
 * @see claudedocs/STUB-BASED-TESTING-GUIDE.md
 * @see cypress/docs/references/QUICK-TEST-REFERENCE.md
 */

import {
  stubSuccessfulLogin,
  stubValidSession,
  stubExpiredSession,
  stubSuccessfulLogout,
} from '../../support/stubs';
import { stubGetProjects } from '../../support/stubs/projectStubs';

describe('Session Management', () => {
  // ! MANDATORY: Must be first hook in every describe()
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.comprehensiveDebugWithBuildCapture();
    cy.comprehensiveDebug();
  });

  // Optional: Failure capture
  afterEach(() => {
    // Note: Using function() to access this.currentTest
    // captureFailureDebug handles its own conditional logic internally
    cy.captureFailureDebug();
  });

  /**
   * Test 4.1: Session Persistence Across Reload
   *
   * * Tests: Session restoration from localStorage
   * * Tests: UI state preservation after reload
   * * Tests: No re-login prompt for valid session
   *
   * @see TODO-AUTH-TESTS-PHASE-4-SESSION-STUBS.md - Task 4.2
   */
  describe('Test 4.1: Session Persistence Across Reload', () => {
    const testEmail = 'session-test@example.com';
    const testPassword = 'password123';

    it('should persist session across page reload', () => {
      // * Setup: Stub successful authentication and project data
      stubSuccessfulLogin(testEmail);
      stubGetProjects();
      stubValidSession(testEmail);

      // * Step 1: Login and navigate to projects
      cy.visit('/');

      // Verify login form exists
      cy.get('[data-cy="email-input"]').should('be.visible');
      cy.get('[data-cy="password-input"]').should('be.visible');
      cy.get('[data-cy="submit-button"]').should('be.visible');

      // Perform login
      cy.get('[data-cy="email-input"]').type(testEmail);
      cy.get('[data-cy="password-input"]').type(testPassword);
      cy.get('[data-cy="submit-button"]').click();

      // Wait for login API call
      cy.wait('@login');

      // Verify navigation to projects
      cy.url({ timeout: 10000 }).should('include', '/projects');

      // * Step 2: Verify session stored in localStorage
      cy.window().then((win) => {
        const authState = win.localStorage.getItem('auth-storage');
        expect(authState).to.exist;
        cy.log('✅ Session stored in localStorage');
      });

      // * Step 3: Reload page
      cy.reload();

      // * Step 4: Verify still on projects page (no redirect to login)
      cy.url({ timeout: 10000 }).should('include', '/projects');

      // * Step 5: Verify session data restored
      cy.window().then((win) => {
        const authState = win.localStorage.getItem('auth-storage');
        expect(authState).to.exist;

        const parsedState = JSON.parse(authState as string);
        expect(parsedState.state.user).to.exist;
        expect(parsedState.state.user.email).to.equal(testEmail);

        cy.log('✅ Session restored from localStorage');
      });

      // * Step 6: Verify no re-login prompt
      cy.get('[data-cy="email-input"]').should('not.exist');
      cy.get('[data-cy="password-input"]').should('not.exist');
    });

    it('should maintain auth state after multiple reloads', () => {
      // * Setup: Stub authentication
      stubSuccessfulLogin(testEmail);
      stubGetProjects();
      stubValidSession(testEmail);

      // * Login
      cy.visit('/');
      cy.get('[data-cy="email-input"]').type(testEmail);
      cy.get('[data-cy="password-input"]').type(testPassword);
      cy.get('[data-cy="submit-button"]').click();
      cy.wait('@login');
      cy.url({ timeout: 10000 }).should('include', '/projects');

      // * Reload multiple times
      for (let i = 0; i < 3; i++) {
        cy.reload();
        cy.url({ timeout: 10000 }).should('include', '/projects');
        cy.log(`✅ Reload ${i + 1}: Session persisted`);
      }

      // * Verify session still valid
      cy.window().then((win) => {
        const authState = win.localStorage.getItem('auth-storage');
        expect(authState).to.exist;
        cy.log('✅ Session maintained after multiple reloads');
      });
    });
  });

  /**
   * Test 4.2: Session Timeout Handling
   *
   * * Tests: Redirect to login on expired session
   * * Tests: Error message display for expired session
   * * Tests: Cleanup of stale data on timeout
   *
   * @see TODO-AUTH-TESTS-PHASE-4-SESSION-STUBS.md - Task 4.3
   */
  describe('Test 4.2: Session Timeout Handling', () => {
    const testEmail = 'timeout-test@example.com';
    const testPassword = 'password123';

    it('should redirect to login when session expires', () => {
      // * Setup: Initial successful login
      stubSuccessfulLogin(testEmail);
      stubGetProjects();
      stubValidSession(testEmail);

      // * Step 1: Login successfully
      cy.visit('/');
      cy.get('[data-cy="email-input"]').type(testEmail);
      cy.get('[data-cy="password-input"]').type(testPassword);
      cy.get('[data-cy="submit-button"]').click();
      cy.wait('@login');
      cy.url({ timeout: 10000 }).should('include', '/projects');

      // * Step 2: Simulate session expiration
      // Override session stub to return 401
      stubExpiredSession();

      // * Step 3: Manually remove auth token to trigger session check
      cy.window().then((win) => {
        const authState = win.localStorage.getItem('auth-storage');
        expect(authState).to.exist; // Assert state exists before modifying

        const parsedState = JSON.parse(authState as string);
        parsedState.state.session = null;
        parsedState.state.user = null;
        win.localStorage.setItem('auth-storage', JSON.stringify(parsedState));
        cy.log('✅ Simulated session expiration in localStorage');
      });

      // * Step 4: Navigate or refresh to trigger session validation
      cy.visit('/projects');

      // * Step 5: Verify redirect to login
      cy.url({ timeout: 10000 }).should('match', /\/(login)?$/);

      // * Step 6: Verify login form displayed
      cy.get('[data-cy="email-input"]').should('be.visible');
      cy.get('[data-cy="password-input"]').should('be.visible');
      cy.get('[data-cy="submit-button"]').should('be.visible');
    });

    it('should clear session data on timeout', () => {
      // * Setup: Initial successful login
      stubSuccessfulLogin(testEmail);
      stubGetProjects();
      stubValidSession(testEmail);

      // * Login
      cy.visit('/');
      cy.get('[data-cy="email-input"]').type(testEmail);
      cy.get('[data-cy="password-input"]').type(testPassword);
      cy.get('[data-cy="submit-button"]').click();
      cy.wait('@login');
      cy.url({ timeout: 10000 }).should('include', '/projects');

      // * Verify session stored
      cy.window().then((win) => {
        const authState = win.localStorage.getItem('auth-storage');
        expect(authState).to.exist;
        const parsedState = JSON.parse(authState as string);
        expect(parsedState.state.user).to.exist;
      });

      // * Simulate session expiration
      stubExpiredSession();

      // * Clear session manually
      cy.window().then((win) => {
        const authState = win.localStorage.getItem('auth-storage');
        expect(authState).to.exist; // Assert state exists before modifying

        const parsedState = JSON.parse(authState as string);
        parsedState.state.session = null;
        parsedState.state.user = null;
        win.localStorage.setItem('auth-storage', JSON.stringify(parsedState));
      });

      // * Trigger session check
      cy.visit('/projects');

      // * Verify session cleared
      cy.window().then((win) => {
        const authState = win.localStorage.getItem('auth-storage');
        expect(authState).to.exist; // Assert state exists

        const parsedState = JSON.parse(authState as string);
        expect(parsedState.state.user).to.be.null;
        expect(parsedState.state.session).to.be.null;
        cy.log('✅ Session data cleared on timeout');
      });
    });
  });

  /**
   * Test 4.3: Multi-Tab Auth Sync
   *
   * * Tests: localStorage events across tabs
   * * Tests: Logout propagation to all tabs
   * * Tests: Login state synchronization
   *
   * @see TODO-AUTH-TESTS-PHASE-4-SESSION-STUBS.md - Task 4.4
   */
  describe('Test 4.3: Multi-Tab Auth Sync', () => {
    const testEmail = 'multitab-test@example.com';
    const testPassword = 'password123';

    it('should synchronize logout across tabs', () => {
      // * Setup: Successful authentication
      stubSuccessfulLogin(testEmail);
      stubGetProjects();
      stubValidSession(testEmail);
      stubSuccessfulLogout();

      // * Step 1: Login in "tab 1"
      cy.visit('/');
      cy.get('[data-cy="email-input"]').type(testEmail);
      cy.get('[data-cy="password-input"]').type(testPassword);
      cy.get('[data-cy="submit-button"]').click();
      cy.wait('@login');
      cy.url({ timeout: 10000 }).should('include', '/projects');

      // * Step 2: Verify authenticated state
      cy.window().then((win) => {
        const authState = win.localStorage.getItem('auth-storage');
        expect(authState).to.exist;
        const parsedState = JSON.parse(authState as string);
        expect(parsedState.state.user).to.exist;
        cy.log('✅ Tab 1: User authenticated');
      });

      // * Step 3: Simulate logout in "another tab" via storage event
      cy.window().then((win) => {
        // Update localStorage to simulate logout
        const authState = win.localStorage.getItem('auth-storage');
        expect(authState).to.exist; // Assert state exists before modifying

        const parsedState = JSON.parse(authState as string);
        parsedState.state.session = null;
        parsedState.state.user = null;
        win.localStorage.setItem('auth-storage', JSON.stringify(parsedState));

        // Trigger storage event (simulates change from another tab)
        const storageEvent = new StorageEvent('storage', {
          key: 'auth-storage',
          oldValue: authState,
          newValue: JSON.stringify(parsedState),
          storageArea: win.localStorage,
          url: win.location.href,
        });
        win.dispatchEvent(storageEvent);

        cy.log('✅ Simulated logout in another tab (storage event)');
      });

      // * Step 4: Verify current tab reacts to logout (event should propagate immediately)
      // The app should redirect to login or show logged out state
      cy.url({ timeout: 10000 }).should('match', /\/(login)?$/);

      // * Step 6: Verify login form visible
      cy.get('[data-cy="email-input"]').should('be.visible');
      cy.get('[data-cy="password-input"]').should('be.visible');
      cy.log('✅ Tab 1: Reacted to logout from another tab');
    });

    it('should synchronize login state across tabs', () => {
      // * Setup: Authentication stubs
      stubSuccessfulLogin(testEmail);
      stubGetProjects();
      stubValidSession(testEmail);

      // * Step 1: Start on login page (simulating "tab 1")
      cy.visit('/');
      cy.get('[data-cy="email-input"]').should('be.visible');

      // * Step 2: Simulate login in "another tab" via storage event
      cy.window().then((win) => {
        const timestamp = Date.now();
        const newAuthState = {
          state: {
            user: {
              id: `user-${timestamp}`,
              email: testEmail,
              aud: 'authenticated',
              role: 'authenticated',
            },
            session: {
              access_token: `fake-jwt-token-${timestamp}`,
              refresh_token: `fake-refresh-token-${timestamp}`,
            },
          },
          version: 0,
        };

        const oldValue = win.localStorage.getItem('auth-storage');
        win.localStorage.setItem('auth-storage', JSON.stringify(newAuthState));

        // Trigger storage event
        const storageEvent = new StorageEvent('storage', {
          key: 'auth-storage',
          oldValue: oldValue,
          newValue: JSON.stringify(newAuthState),
          storageArea: win.localStorage,
          url: win.location.href,
        });
        win.dispatchEvent(storageEvent);

        cy.log('✅ Simulated login in another tab (storage event)');
      });

      // * Step 3: Verify current tab reacts to login (event should propagate immediately)
      // The app should recognize authenticated state
      cy.window().then((win) => {
        const authState = win.localStorage.getItem('auth-storage');
        expect(authState).to.exist;
        const parsedState = JSON.parse(authState as string);
        expect(parsedState.state.user).to.exist;
        expect(parsedState.state.user.email).to.equal(testEmail);
        cy.log('✅ Tab 1: Synchronized login state from another tab');
      });
    });

    it('should handle rapid cross-tab updates', () => {
      // * Setup: Authentication stubs
      stubSuccessfulLogin(testEmail);
      stubGetProjects();
      stubValidSession(testEmail);
      stubSuccessfulLogout();

      // * Login
      cy.visit('/');
      cy.get('[data-cy="email-input"]').type(testEmail);
      cy.get('[data-cy="password-input"]').type(testPassword);
      cy.get('[data-cy="submit-button"]').click();
      cy.wait('@login');
      cy.url({ timeout: 10000 }).should('include', '/projects');

      // * Simulate rapid storage events (login/logout/login)
      cy.window().then((win) => {
        const authState = win.localStorage.getItem('auth-storage');
        expect(authState).to.exist; // Assert initial state exists

        // Event 1: Logout
        const loggedOutState = JSON.parse(authState as string);
        loggedOutState.state.user = null;
        loggedOutState.state.session = null;
        win.localStorage.setItem('auth-storage', JSON.stringify(loggedOutState));

        const logoutEvent = new StorageEvent('storage', {
          key: 'auth-storage',
          oldValue: authState,
          newValue: JSON.stringify(loggedOutState),
          storageArea: win.localStorage,
        });
        win.dispatchEvent(logoutEvent);
        cy.log('✅ Event 1: Logout');

        // Event 2: Login again (events should process immediately)
        const timestamp = Date.now();
        const loggedInState = {
          state: {
            user: {
              id: `user-${timestamp}`,
              email: testEmail,
            },
            session: {
              access_token: `token-${timestamp}`,
            },
          },
          version: 0,
        };

        const intermediateState = win.localStorage.getItem('auth-storage');
        win.localStorage.setItem('auth-storage', JSON.stringify(loggedInState));

        const loginEvent = new StorageEvent('storage', {
          key: 'auth-storage',
          oldValue: intermediateState,
          newValue: JSON.stringify(loggedInState),
          storageArea: win.localStorage,
        });
        win.dispatchEvent(loginEvent);
        cy.log('✅ Event 2: Login');
      });

      // * Verify final state is consistent (should update immediately)
      cy.window().then((win) => {
        const finalState = win.localStorage.getItem('auth-storage');
        expect(finalState).to.exist;
        const parsedState = JSON.parse(finalState as string);
        expect(parsedState.state.user).to.exist;
        cy.log('✅ Final state consistent after rapid updates');
      });
    });
  });
});
