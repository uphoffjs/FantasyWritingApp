 
// ! Test utilities that may use various selectors
// * Stub and spy commands for testing
import * as sinon from 'sinon';

// * Add sinon stub functionality to Cypress
Cypress.Commands.add('stub', sinon.stub);
Cypress.Commands.add('spy', sinon.spy);

// * Augment Cypress namespace for TypeScript support
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      stub: typeof sinon.stub;
      spy: typeof sinon.spy;
    }
  }
}

// * Export for TypeScript
export {};