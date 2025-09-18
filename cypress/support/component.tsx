// * Component test support configuration

import './commands';
import React from 'react';
import { mount } from '@cypress/react';

// * Import test providers for wrapping components
import { TestProviders } from './test-providers';

// Import React Native Web configuration
import { configureReactNativeWeb } from './cypress-react-native-web';
// * Import our new React Native Web compatibility helpers
import './react-native-web-compat';
// * Import enhanced event handling for React Native Web
import './react-native-web-events';
// * Import custom React Native commands
import './react-native-commands';
// * Import viewport presets for responsive testing
import './viewport-presets';
// * Import wait strategies for async operations
import './wait-strategies';
// * Import factory helpers for test data management
import './factory-helpers';
import { registerFactoryHooks } from './factory-helpers';
// * Import boundary test utilities for edge case testing
import './boundary-test-utils';
// * Import rapid interaction utilities for testing race conditions
import './rapid-interaction-utils';
// * Import special characters utilities for input sanitization
import './special-characters-utils';
// * Import accessibility utilities for WCAG compliance testing
import './accessibility-utils';
import 'cypress-axe';
import 'cypress-real-events';

// * Augment the Cypress namespace to include our mount function
declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount;
      mountWithProviders: typeof mountWithProviders;
    }
  }
}

// * Custom mount function that includes providers
function mountWithProviders(
  component: React.ReactNode,
  options?: any
): Cypress.Chainable {
  const wrapped = <TestProviders>{component}</TestProviders>;
  return mount(wrapped, options);
}

// * Add mount commands to Cypress
Cypress.Commands.add('mount', mount);
Cypress.Commands.add('mountWithProviders', mountWithProviders);

// TODO: * Register factory hooks for automatic cleanup (must be outside of hooks)
registerFactoryHooks();

// * Configure component testing environment
before(() => {
  // * Set up any global test configuration
  cy.viewport(1280, 720);
  
  // Configure React Native Web support
  configureReactNativeWeb();
});

// * Clean up after each test
afterEach(() => {
  // * Clear any test-specific state
  cy.clearLocalStorage();
});