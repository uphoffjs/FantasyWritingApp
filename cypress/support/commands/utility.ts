// * Stub and spy commands for testing
import * as sinon from 'sinon';

// * Add sinon stub functionality to Cypress
Cypress.Commands.add('stub', sinon.stub);
Cypress.Commands.add('spy', sinon.spy);

// * Custom command to handle both data-cy and data-testid selectors
// * This addresses React Native Web compatibility where data-cy is not passed through
Cypress.Commands.add('getByTestId', (selector: string) => {
  return cy.get(`[data-cy="${selector}"], [data-testid="${selector}"]`);
});

// * Override the default get query to handle both selectors automatically
Cypress.Commands.overwriteQuery('get', function(originalFn, selector, options) {
  // If selector starts with [data-cy, also look for data-testid
  if (typeof selector === 'string') {
    const dataCyMatch = selector.match(/^\[data-cy([^=]*)="([^"]+)"\]$/);
    if (dataCyMatch) {
      const operator = dataCyMatch[1] || ''; // Could be ^=, $=, *=, etc.
      const value = dataCyMatch[2];
      const newSelector = `[data-cy${operator}="${value}"], [data-testid${operator}="${value}"]`;
      return originalFn.call(this, newSelector, options);
    }
  }
  return originalFn.call(this, selector, options);
});

// * Augment Cypress namespace for TypeScript support
declare global {
  namespace Cypress {
    interface Chainable {
      stub: typeof sinon.stub;
      spy: typeof sinon.spy;
      getByTestId(selector: string): Chainable<JQuery<HTMLElement>>;
    }
  }
}

// * Export for TypeScript
export {};