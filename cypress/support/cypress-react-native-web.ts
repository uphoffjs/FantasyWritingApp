/**
 * Cypress React Native Web Support
 * 
 * This file provides utilities and configuration for testing React Native Web components
 * with Cypress. React Native Web converts testID props to data-testid attributes in the DOM.
 */

// Configure Cypress to work with React Native Web's attribute handling
export const configureReactNativeWeb = () => {
  // * Add a custom command instead of overwriting get
  // React Native Web converts testID to data-testid
  Cypress.Commands.add('getByTestId', (selector: string) => {
    // * Try multiple selector patterns for React Native Web
    return cy.get(`[data-testid="${selector}"], [data-cy="${selector}"], [testID="${selector}"]`);
  });
};

// * Helper to get elements with React Native Web compatibility
export const getReactNativeWebElement = (testId: string) => {
  // * Try all possible attribute patterns
  return cy.get(`[data-testid="${testId}"], [data-cy="${testId}"], [testID="${testId}"]`);
};

// * Helper to check if element exists with any test attribute
export const elementExistsWithTestId = (testId: string) => {
  return cy.get('body').then(($body) => {
    return (
      $body.find(`[data-testid="${testId}"]`).length > 0 ||
      $body.find(`[data-cy="${testId}"]`).length > 0 ||
      $body.find(`[testID="${testId}"]`).length > 0
    );
  });
};

// * Viewport configuration for React Native Web testing
export const setMobileViewport = () => {
  cy.viewport('iphone-x');
};

export const setTabletViewport = () => {
  cy.viewport('ipad-2');
};

export const setDesktopViewport = () => {
  cy.viewport('macbook-15');
};

// * Wait for React Native Web to fully render
export const waitForReactNativeWeb = () => {
  // * Wait for React to hydrate
  cy.wait(100);
  
  // * Check if the root element exists
  cy.get('[data-reactroot], #root').should('exist');
};