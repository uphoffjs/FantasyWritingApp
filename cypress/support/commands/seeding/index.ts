/**
 * @fileoverview Data Seeding Commands for Cypress Tests
 * Implements comprehensive data seeding strategies using factories, fixtures, and tasks
 *
 * Purpose:
 * - Provide consistent test data setup across all tests
 * - Enable multiple seeding strategies (fixtures, factories, API)
 * - Integrate with session management for performance
 * - Support data reset and cleanup operations
 */

// * Import fixture data for static seeding
import testData from '../../../fixtures/testData.json';

/**
 * Seed data using factory tasks (cy.task)
 * Dynamic data generation with factory patterns
 */
Cypress.Commands.add('seedWithFactory', (type: string, options?: any) => {
  return cy.task('factory:create', { type, options }).then((data) => {
    cy.log(`📦 Seeded ${type} data with factory`, data);
    return cy.wrap(data);
  });
});

/**
 * Seed complete scenario using factory manager
 * Creates related data (projects, stories, characters)
 */
Cypress.Commands.add('seedScenario', (
  type: 'minimal' | 'standard' | 'complete' = 'standard'
) => {
  return cy.task('factory:scenario', { type }).then((scenario) => {
    cy.log(`🌍 Seeded ${type} scenario`, scenario);
    return cy.wrap(scenario);
  });
});

/**
 * Seed bulk data with specified quantities
 * Useful for performance and pagination tests
 */
Cypress.Commands.add('seedBulkData', (options: {
  stories?: number;
  characters?: number;
  projects?: number;
  elements?: number;
}) => {
  return cy.task('factory:seed', options).then((data) => {
    cy.log(`📊 Seeded bulk data`, options);
    return cy.wrap(data);
  });
});

/**
 * Reset all factory counters and data
 * Should be called in beforeEach for clean state
 */
Cypress.Commands.add('resetFactories', () => {
  return cy.task('factory:reset').then(() => {
    cy.log('🔄 Factory data reset');
  });
});

/**
 * Seed data from fixtures (static data)
 * Fast and consistent for simple tests
 */
Cypress.Commands.add('seedFromFixture', (fixtureName: string) => {
  return cy.fixture(fixtureName).then((data) => {
    // * Apply fixture data to stores
    cy.window().then((win: any) => {
      if (data.worldbuilding && win.__zustand_worldbuilding_store) {
        const store = win.__zustand_worldbuilding_store.getState();
        Object.assign(store, data.worldbuilding);
      }
      if (data.auth && win.__zustand_auth_store) {
        const authStore = win.__zustand_auth_store.getState();
        Object.assign(authStore, data.auth);
      }
    });

    cy.log(`📄 Seeded from fixture: ${fixtureName}`);
    return cy.wrap(data);
  });
});

/**
 * Seed via API stubbing (cy.intercept)
 * Mock API responses with fixture data
 */
Cypress.Commands.add('seedWithStubs', (stubs: Array<{
  method: string;
  url: string;
  fixture?: string;
  response?: any;
}>) => {
  stubs.forEach(({ method, url, fixture, response }) => {
    if (fixture) {
      cy.intercept(method, url, { fixture }).as(`stub_${fixture}`);
    } else if (response) {
      cy.intercept(method, url, response).as(`stub_${url.split('/').pop()}`);
    }
  });

  cy.log(`🔌 Configured ${stubs.length} API stubs`);
});

/**
 * Combined seeding with session caching
 * Integrates seeding with session management for performance
 */
Cypress.Commands.add('seedWithSession', (
  sessionId: string | string[],
  seedFunction: () => void | Promise<void>
) => {
  cy.session(
    sessionId,
    () => {
      // * Run seed function once and cache
      seedFunction();
    },
    {
      validate: () => {
        // * Validate seeded data exists
        cy.window().then((win: any) => {
          const store = win.__zustand_worldbuilding_store?.getState();
          expect(store).to.exist;
        });
      },
      cacheAcrossSpecs: true,
    }
  );
});

/**
 * Clean all test data
 * Comprehensive cleanup for test isolation
 */
Cypress.Commands.add('cleanTestData', () => {
  // * Reset factories
  cy.resetFactories();

  // * Clear stores
  cy.window().then((win: any) => {
    // Clear localStorage
    win.localStorage.clear();
    win.sessionStorage.clear();

    // Reset Zustand stores if available
    if (win.__zustand_worldbuilding_store) {
      const store = win.__zustand_worldbuilding_store.getState();
      if (store.clearAllProjects) store.clearAllProjects();
    }
    if (win.__zustand_auth_store) {
      const authStore = win.__zustand_auth_store.getState();
      if (authStore.logout) authStore.logout();
    }
  });

  cy.log('🧹 Test data cleaned');
});

/**
 * Seed specific test category data
 * Convenience method for common test scenarios
 */
Cypress.Commands.add('seedForTest', (testType: string) => {
  const seedStrategies: Record<string, () => void> = {
    // Element tests
    'element-creation': () => {
      cy.seedWithFactory('element-creation');
    },
    'element-browser': () => {
      cy.seedWithFactory('element-browser');
    },

    // Story tests
    'story-creation': () => {
      cy.seedWithFactory('story-creation');
    },
    'story-editing': () => {
      cy.seedWithFactory('story-editing');
    },

    // Character tests
    'character-creation': () => {
      cy.seedWithFactory('character-creation');
    },
    'character-profile': () => {
      cy.seedWithFactory('character-profile');
    },

    // Project tests
    'project-dashboard': () => {
      cy.seedWithFactory('project-dashboard');
    },

    // Search tests
    'global-search': () => {
      cy.seedBulkData({
        projects: 3,
        stories: 5,
        characters: 10,
        elements: 15
      });
    },

    // Empty state tests
    'empty-states': () => {
      cy.cleanTestData();
    },
  };

  const strategy = seedStrategies[testType];
  if (strategy) {
    strategy();
    cy.log(`🎯 Seeded for test type: ${testType}`);
  } else {
    // Default to standard scenario
    cy.seedScenario('standard');
  }
});

/**
 * Verify seeded data
 * Validation helper for seeding operations
 */
Cypress.Commands.add('verifySeededData', (expectations: {
  projects?: number;
  stories?: number;
  characters?: number;
  elements?: number;
}) => {
  cy.window().then((win: any) => {
    const store = win.__zustand_worldbuilding_store?.getState();

    if (expectations.projects !== undefined) {
      expect(store.projects).to.have.length(expectations.projects);
    }
    if (expectations.elements !== undefined) {
      expect(store.elements).to.have.length(expectations.elements);
    }

    cy.log('✅ Seeded data verified', expectations);
  });
});

// * Type definitions for TypeScript
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Seed data using factory tasks
       */
      seedWithFactory(type: string, options?: any): Chainable<any>;

      /**
       * Seed complete scenario
       */
      seedScenario(type?: 'minimal' | 'standard' | 'complete'): Chainable<any>;

      /**
       * Seed bulk data with quantities
       */
      seedBulkData(options: {
        stories?: number;
        characters?: number;
        projects?: number;
        elements?: number;
      }): Chainable<any>;

      /**
       * Reset all factory counters
       */
      resetFactories(): Chainable<void>;

      /**
       * Seed from fixture file
       */
      seedFromFixture(fixtureName: string): Chainable<any>;

      /**
       * Setup API stubs for seeding
       */
      seedWithStubs(stubs: Array<{
        method: string;
        url: string;
        fixture?: string;
        response?: any;
      }>): Chainable<void>;

      /**
       * Seed with session caching
       */
      seedWithSession(
        sessionId: string | string[],
        seedFunction: () => void | Promise<void>
      ): Chainable<void>;

      /**
       * Clean all test data
       */
      cleanTestData(): Chainable<void>;

      /**
       * Seed for specific test type
       */
      seedForTest(testType: string): Chainable<void>;

      /**
       * Verify seeded data expectations
       */
      verifySeededData(expectations: {
        projects?: number;
        stories?: number;
        characters?: number;
        elements?: number;
      }): Chainable<void>;
    }
  }
}

export {};

/**
 * SEEDING STRATEGY GUIDE:
 *
 * 1. FIXTURES (Static Data)
 *    - Use for: Simple, consistent test data
 *    - Speed: Fastest
 *    - Example: cy.seedFromFixture('basic-project.json')
 *
 * 2. FACTORIES (Dynamic Data)
 *    - Use for: Complex, varied test data
 *    - Speed: Moderate
 *    - Example: cy.seedWithFactory('story-creation')
 *
 * 3. SCENARIOS (Related Data Sets)
 *    - Use for: Complete test environments
 *    - Speed: Moderate
 *    - Example: cy.seedScenario('complete')
 *
 * 4. API STUBS (Mocked Responses)
 *    - Use for: Testing without backend
 *    - Speed: Fast
 *    - Example: cy.seedWithStubs([...])
 *
 * 5. BULK DATA (Performance Testing)
 *    - Use for: Load testing, pagination
 *    - Speed: Slower
 *    - Example: cy.seedBulkData({ elements: 100 })
 *
 * 6. SESSION CACHED (Reusable Data)
 *    - Use for: Shared test data across suite
 *    - Speed: Fast after first run
 *    - Example: cy.seedWithSession(['project'], () => {...})
 *
 * BEST PRACTICES:
 * - Always reset in beforeEach: cy.resetFactories()
 * - Use session caching for expensive operations
 * - Combine strategies for complex scenarios
 * - Verify seeded data after operations
 * - Clean data between test suites
 */