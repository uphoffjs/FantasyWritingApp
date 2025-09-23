// * Custom Selector Commands for FantasyWritingApp
// * Handles the testID → data-testid conversion for React Native Web
// * Provides flexible selector strategy that works with both data-cy and data-testid

/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Get element by test ID, supporting multiple selector strategies
       * Handles React Native Web's testID → data-testid conversion
       * Also supports data-cy for best practices compliance
       * @param id - The test ID to search for
       * @param options - Optional Cypress command options
       * @example
       * cy.getByTestId('submit-button').click()
       * cy.getByTestId('input-field').type('text')
       */
      getByTestId(id: string, options?: Partial<Cypress.Timeoutable>): Chainable<JQuery<HTMLElement>>;

      /**
       * Find element by test ID within a parent element
       * @param id - The test ID to search for
       * @param options - Optional Cypress command options
       * @example
       * cy.get('[data-testid="form"]').findByTestId('submit-button')
       */
      findByTestId(id: string, options?: Partial<Cypress.Timeoutable>): Chainable<JQuery<HTMLElement>>;
    }
  }
}

// * Main selector command that handles multiple strategies
Cypress.Commands.add('getByTestId', (id: string, options?: Partial<Cypress.Timeoutable>) => {
  // * Try multiple selector strategies in order of preference:
  // * 1. data-cy (Cypress best practice)
  // * 2. data-testid (React Native Web conversion)
  // * 3. testID (fallback for React Native components)

  // * Build a combined selector that matches any of the strategies
  const selectors = [
    `[data-cy="${id}"]`,
    `[data-testid="${id}"]`,
    `[testID="${id}"]`
  ].join(', ');

  // * Log the action for debugging
  Cypress.log({
    name: 'getByTestId',
    message: id,
    consoleProps: () => ({
      'Test ID': id,
      'Selector': selectors,
      'Options': options
    })
  });

  return cy.get(selectors, options);
});

// * Find command for searching within a parent element
Cypress.Commands.add('findByTestId', { prevSubject: 'element' }, (subject, id: string, options?: Partial<Cypress.Timeoutable>) => {
  // * Build the same combined selector
  const selectors = [
    `[data-cy="${id}"]`,
    `[data-testid="${id}"]`,
    `[testID="${id}"]`
  ].join(', ');

  // * Log the action for debugging
  Cypress.log({
    name: 'findByTestId',
    message: id,
    consoleProps: () => ({
      'Test ID': id,
      'Selector': selectors,
      'Parent': subject,
      'Options': options
    })
  });

  return cy.wrap(subject).find(selectors, options);
});

// * Overwrite the default cy.get to also support shorthand test ID syntax
// * This allows using cy.get('@testId:button') as shorthand
Cypress.Commands.overwriteQuery('get', function(originalFn, selector: string, options?: Partial<Cypress.Timeoutable>) {
  // * Check if the selector uses our special test ID syntax
  if (typeof selector === 'string' && selector.startsWith('@testId:')) {
    const id = selector.substring(8); // Remove '@testId:' prefix
    return cy.getByTestId(id, options);
  }

  // * Otherwise, use the original get function
  return originalFn.call(this, selector, options);
});

export {};