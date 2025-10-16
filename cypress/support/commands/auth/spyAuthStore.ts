/**
 * Spy on Auth Store Methods - Enhanced Stub Testing
 *
 * Purpose: Validates that authentication functions are actually invoked,
 * not just that the UI handles responses correctly.
 *
 * Quality Enhancement: Closes the gap identified in mutation testing where
 * stub-based tests couldn't detect if auth functions were commented out.
 *
 * @see claudedocs/STUB-BASED-TESTING-GUIDE.md - Spy Enhancement Pattern
 * @see TODO-AUTH-TESTS-PHASE-2-SIGNIN-STUBS.md - Mutation 2.1b Analysis
 */

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /**
       * Spy on authentication store methods to validate function invocation
       *
       * @example
       * // Spy on signIn method
       * cy.spyOnAuthStore('signIn');
       *
       * // Perform login
       * cy.get('[data-cy="submit-button"]').click();
       *
       * // Validate signIn was called
       * cy.get('@authStoreSpy').should('have.been.calledOnce');
       * cy.get('@authStoreSpy').should('have.been.calledWith', 'user@test.com', 'password123');
       *
       * @param method - Auth store method to spy on (signIn, signUp, signOut, etc.)
       * @param alias - Custom alias for the spy (default: 'authStoreSpy')
       */
      spyOnAuthStore(method: 'signIn' | 'signUp' | 'signOut' | 'resetPassword', alias?: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add('spyOnAuthStore', (method: string, alias = 'authStoreSpy') => {
  cy.window().then((win) => {
    // Access the auth store from the window object
    // The auth store is accessible globally via the app instance

    // @ts-expect-error - Accessing internal app state for testing
    const appState = win.__APP_STATE__ || {};

    // @ts-expect-error - Zustand store
    const authStore = appState.authStore || win.authStore;

    if (!authStore) {
      cy.log('⚠️ Warning: Auth store not found on window object');
      cy.log('Attempting alternative access method...');

      // Alternative: Access through React DevTools global hook
      // @ts-expect-error - Accessing React internal structure
      const reactRoot = win.document.querySelector('#root')?._reactRootContainer?._internalRoot?.current;

      if (reactRoot) {
        cy.log('✅ Found React root - attempting to access auth store');
      } else {
        throw new Error(
          'Auth store not accessible. Ensure the app exposes auth store for testing.\n' +
          'Add this to your App.tsx:\n' +
          'if (typeof window !== "undefined") {\n' +
          '  window.__APP_STATE__ = { authStore: useAuthStore.getState };\n' +
          '}'
        );
      }
    }

    // Create spy on the specified method
    const spy = cy.spy(authStore, method);

    // Store spy reference with alias
    cy.wrap(spy).as(alias);

    cy.log(`✅ Spy created for authStore.${method}() - alias: @${alias}`);
  });
});

export {};
