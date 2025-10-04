 
// ! Generic utility commands that accept any selector type
// * Utility Cypress commands for common operations

/**
 * Wait for page to finish loading
 */
Cypress.Commands.add('waitForLoad', () => {
  cy.get('[data-cy="loading-indicator"]').should('not.exist');
  cy.wait(500); // Small buffer for animations
});

/**
 * Check accessibility compliance
 */
Cypress.Commands.add('checkAccessibility', () => {
  cy.injectAxe();
  cy.checkA11y(null, {
    runOnly: {
      type: 'tag',
      values: ['wcag2a', 'wcag2aa']
    }
  });
});

/**
 * Get element by test ID - handles React Native Web attribute variations
 * @param selector - The test ID to search for
 */
Cypress.Commands.add('getByTestId', (selector: string) => {
  // * Try multiple selector patterns for React Native Web compatibility
  return cy.get(
    `[data-cy="${selector}"], [data-testid="${selector}"], [testID="${selector}"]`
  );
});

/**
 * Check if an element exists with any test attribute
 * @param selector - The test ID to check
 */
Cypress.Commands.add('shouldHaveTestAttr', (selector: string) => {
  cy.get('body').then(($body) => {
    const found = 
      $body.find(`[data-cy="${selector}"]`).length > 0 ||
      $body.find(`[data-testid="${selector}"]`).length > 0 ||
      $body.find(`[testID="${selector}"]`).length > 0;
    expect(found).to.be.true;
  });
});

/**
 * Take a named screenshot
 * @param name - Name for the screenshot
 */
Cypress.Commands.add('takeScreenshot', (name: string) => {
  cy.screenshot(name, {
    capture: 'viewport'
  });
});

/**
 * Verify toast message appears
 * @param message - Expected toast message text
 */
Cypress.Commands.add('verifyToast', (message: string) => {
  cy.get('[data-cy="toast-message"]')
    .should('be.visible')
    .and('contain', message);
  
  // * Wait for toast to disappear
  cy.get('[data-cy="toast-message"]', { timeout: 5000 })
    .should('not.exist');
});

/**
 * Upload a file
 * @param fileName - Name of the file to upload
 * @param selector - Selector for the file input
 */
Cypress.Commands.add('uploadFile', (fileName: string, selector = '[data-cy="file-input"]') => {
  // ! Fixed: Using cy.get outside the .then() to avoid promise chain issues
  cy.fixture(fileName).as('fileContent');
  cy.get('@fileContent').then((fileContent) => {
    // * Convert file content to proper format
    const content = typeof fileContent === 'string' ? fileContent : fileContent.toString();
    
    // * Now use cy.get() outside the callback
    cy.get(selector).attachFile({
      fileContent: content,
      fileName: fileName,
      mimeType: 'text/plain'
    });
  });
});

/**
 * Clear all form inputs in current context
 */
Cypress.Commands.add('clearForm', () => {
  cy.get('input').each(($input) => {
    cy.wrap($input).clear();
  });
  cy.get('textarea').each(($textarea) => {
    cy.wrap($textarea).clear();
  });
});

// * Export empty object to prevent TS errors
export {};