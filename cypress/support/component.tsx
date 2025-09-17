// Component test support configuration

import './commands';
import React from 'react';
import { mount } from '@cypress/react';

// Import test providers for wrapping components
import { TestProviders } from './test-providers';

// Augment the Cypress namespace to include our mount function
declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount;
      mountWithProviders: typeof mountWithProviders;
    }
  }
}

// Custom mount function that includes providers
function mountWithProviders(
  component: React.ReactNode,
  options?: any
): Cypress.Chainable {
  const wrapped = <TestProviders>{component}</TestProviders>;
  return mount(wrapped, options);
}

// Add mount commands to Cypress
Cypress.Commands.add('mount', mount);
Cypress.Commands.add('mountWithProviders', mountWithProviders);

// Configure component testing environment
before(() => {
  // Set up any global test configuration
  cy.viewport(1280, 720);
});

// Clean up after each test
afterEach(() => {
  // Clear any test-specific state
  cy.clearLocalStorage();
});