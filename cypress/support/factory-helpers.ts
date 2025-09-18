/**
 * Factory helpers for Cypress tests
 * Provides easy access to factories and automatic cleanup
 */

import { FactoryManager } from '../fixtures/factories';

/**
 * Register factory hooks for automatic cleanup
 */
export function registerFactoryHooks() {
  // Reset factories before each test
  beforeEach(() => {
    cy.task('factory:reset');
  });
}

/**
 * Create test data using factories
 */
export function createTestData(type: string, options?: any) {
  return cy.task('factory:create', { type, options });
}

/**
 * Create a complete test scenario
 */
export function createScenario(type: 'minimal' | 'standard' | 'complete' = 'standard') {
  return cy.task('factory:scenario', { type });
}

/**
 * Seed the database with test data
 */
export function seedTestData(options?: {
  stories?: number;
  characters?: number;
  projects?: number;
  elements?: number;
}) {
  return cy.task('factory:seed', options || {});
}

/**
 * Custom Cypress commands for factories
 */
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Reset all factory counters
       */
      resetFactories(): Chainable<void>;
      
      /**
       * Create test data for a specific test type
       */
      createTestData(type: string, options?: any): Chainable<any>;
      
      /**
       * Create a test scenario
       */
      createScenario(type?: 'minimal' | 'standard' | 'complete'): Chainable<any>;
      
      /**
       * Seed test data
       */
      seedData(options?: {
        stories?: number;
        characters?: number;
        projects?: number;
        elements?: number;
      }): Chainable<any>;
    }
  }
}

// Register custom commands
Cypress.Commands.add('resetFactories', () => {
  cy.task('factory:reset');
});

Cypress.Commands.add('createTestData', (type: string, options?: any) => {
  return cy.task('factory:create', { type, options });
});

Cypress.Commands.add('createScenario', (type: 'minimal' | 'standard' | 'complete' = 'standard') => {
  return cy.task('factory:scenario', { type });
});

Cypress.Commands.add('seedData', (options) => {
  return cy.task('factory:seed', options || {});
});

// Export for direct use in tests
export default {
  registerFactoryHooks,
  createTestData,
  createScenario,
  seedTestData,
};