import React from 'react';
import { mount } from '@cypress/react';
import { TestProviders } from './test-providers';

// Custom mount function that includes providers
export function mountWithProviders(
  component: React.ReactNode,
  options?: any
): Cypress.Chainable {
  const wrapped = <TestProviders {...options}>{component}</TestProviders>;
  return mount(wrapped, options);
}

// Export for compatibility
export default mountWithProviders;