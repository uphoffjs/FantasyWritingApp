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

      /**
       * Get element by data-cy attribute (PREFERRED method)
       * @param id - The data-cy value to search for
       * @param options - Optional Cypress command options
       * @example
       * cy.getByDataCy('submit-button').click()
       */
      getByDataCy(id: string, options?: Partial<Cypress.Timeoutable>): Chainable<JQuery<HTMLElement>>;

      /**
       * Click button with specific text content (use data-cy when possible)
       * @param text - The button text to search for
       * @param options - Optional Cypress command options
       * @example
       * cy.clickButton('Submit')
       */
      clickButton(text: string, options?: Partial<Cypress.Timeoutable>): Chainable<JQuery<HTMLElement>>;

      /**
       * Get modal by data-cy attribute
       * @param modalId - The modal identifier
       * @param options - Optional Cypress command options
       * @example
       * cy.getModal('create-element').should('be.visible')
       */
      getModal(modalId: string, options?: Partial<Cypress.Timeoutable>): Chainable<JQuery<HTMLElement>>;

      /**
       * Get card element by data-cy attribute
       * @param cardId - The card identifier
       * @param options - Optional Cypress command options
       * @example
       * cy.getCard('element-card').should('exist')
       */
      getCard(cardId: string, options?: Partial<Cypress.Timeoutable>): Chainable<JQuery<HTMLElement>>;

      /**
       * Get performance monitor element by data-cy
       * @param elementId - The performance element identifier
       * @param options - Optional Cypress command options
       * @example
       * cy.getPerformanceElement('monitor-toggle').click()
       */
      getPerformanceElement(elementId: string, options?: Partial<Cypress.Timeoutable>): Chainable<JQuery<HTMLElement>>;
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

// * Get element by data-cy attribute (PREFERRED method)
Cypress.Commands.add('getByDataCy', (id: string, options?: Partial<Cypress.Timeoutable>) => {
  Cypress.log({
    name: 'getByDataCy',
    message: id,
    consoleProps: () => ({
      'Data-Cy ID': id,
      'Selector': `[data-cy="${id}"]`,
      'Options': options
    })
  });

  return cy.get(`[data-cy="${id}"]`, options);
});

// * Click button with specific text content
Cypress.Commands.add('clickButton', (text: string, options?: Partial<Cypress.Timeoutable>) => {
  Cypress.log({
    name: 'clickButton',
    message: text,
    consoleProps: () => ({
      'Button Text': text,
      'Options': options
    })
  });

  // ! WARNING: Prefer using data-cy attributes over text content
  // * First try to find button with data-cy matching the text (lowercase, hyphenated)
  const dataCyId = text.toLowerCase().replace(/\s+/g, '-');

  return cy.get('body').then($body => {
    if ($body.find(`[data-cy="${dataCyId}-button"]`).length > 0) {
      return cy.get(`[data-cy="${dataCyId}-button"]`, options).click();
    } else if ($body.find(`button[data-cy="${dataCyId}"]`).length > 0) {
      return cy.get(`button[data-cy="${dataCyId}"]`, options).click();
    } else {
      // * Fallback to text content
      return cy.contains('button', text, options).click();
    }
  });
});

// * Get modal by data-cy attribute
Cypress.Commands.add('getModal', (modalId: string, options?: Partial<Cypress.Timeoutable>) => {
  Cypress.log({
    name: 'getModal',
    message: modalId,
    consoleProps: () => ({
      'Modal ID': modalId,
      'Selector': `[data-cy="${modalId}-modal"], [data-cy="modal-${modalId}"]`,
      'Options': options
    })
  });

  // * Try common modal naming patterns
  const selectors = [
    `[data-cy="${modalId}-modal"]`,
    `[data-cy="modal-${modalId}"]`,
    `[data-cy="${modalId}"]`
  ].join(', ');

  return cy.get(selectors, options);
});

// * Get card element by data-cy attribute
Cypress.Commands.add('getCard', (cardId: string, options?: Partial<Cypress.Timeoutable>) => {
  Cypress.log({
    name: 'getCard',
    message: cardId,
    consoleProps: () => ({
      'Card ID': cardId,
      'Selector': `[data-cy="${cardId}-card"], [data-cy="card-${cardId}"]`,
      'Options': options
    })
  });

  // * Try common card naming patterns
  const selectors = [
    `[data-cy="${cardId}-card"]`,
    `[data-cy="card-${cardId}"]`,
    `[data-cy="${cardId}"]`
  ].join(', ');

  return cy.get(selectors, options);
});

// * Get performance monitor element by data-cy
Cypress.Commands.add('getPerformanceElement', (elementId: string, options?: Partial<Cypress.Timeoutable>) => {
  Cypress.log({
    name: 'getPerformanceElement',
    message: elementId,
    consoleProps: () => ({
      'Element ID': elementId,
      'Selector': `[data-cy="performance-${elementId}"]`,
      'Options': options
    })
  });

  // * Performance elements should follow the pattern: performance-[element]
  return cy.get(`[data-cy="performance-${elementId}"]`, options);
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