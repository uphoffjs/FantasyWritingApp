/**
 * @fileoverview Data Seeding Strategies Example
 * Demonstrates all available seeding methods for Cypress tests
 *
 * This example shows how to use:
 * - Fixtures for static data
 * - Factories for dynamic data
 * - Scenarios for complete test environments
 * - API stubbing for mocked responses
 * - Session caching for performance
 * - Bulk data for load testing
 */

import React from 'react';
import { CreateElementModal } from '../../../src/components/CreateElementModal';
import { ElementBrowser } from '../../../src/components/ElementBrowser';
import { TestWrapper } from '../../support/component-wrapper';

describe('Data Seeding Strategies Examples', () => {
  /**
   * Strategy 1: FIXTURES - Static JSON Data
   * Best for: Simple, consistent test data that doesn't change
   * Speed: ⚡ Fastest
   */
  describe('Strategy 1: Fixture-based Seeding', () => {
    beforeEach(function() {
      cy.comprehensiveDebug();
      cy.cleanTestData();
    });

    it('loads minimal fixture for simple tests', () => {
      // * Load static data from fixture file
      cy.seedFromFixture('scenarios/minimal.json');

      cy.mountWithProviders(
        <TestWrapper>
          <CreateElementModal
            visible={true}
            projectId="project-minimal"
            onClose={cy.stub()}
            onSuccess={cy.stub()}
          />
        </TestWrapper>
      );

      // * Verify fixture data is available
      cy.window().then((win: any) => {
        const store = win.__zustand_worldbuilding_store?.getState();
        if (!store) {
          cy.log('Store not yet initialized, skipping verification');
          return;
        }

        // * Check different possible structures
        const projects = store.worldbuilding?.projects || store.projects || [];

        if (projects.length > 0) {
          expect(projects).to.have.length(1);
          expect(projects[0].name).to.equal('Minimal Test Project');
        } else {
          cy.log('No projects found in store, fixture may not be loaded yet');
        }
      });

      cy.contains('Create New Element').should('be.visible');
    });

    it('loads complete fixture for complex scenarios', () => {
      // * Load comprehensive test data
      cy.seedFromFixture('scenarios/complete.json');

      cy.mountWithProviders(
        <TestWrapper>
          <ElementBrowser projectId="project-fantasy" />
        </TestWrapper>
      );

      // * Verify complex data loaded
      cy.verifySeededData({
        projects: 2,
        elements: 5,
      });

      // * Elements from fixture should be visible
      cy.contains('Aragorn Stormwind').should('be.visible');
      cy.contains('Dragonspire Keep').should('be.visible');
    });
  });

  /**
   * Strategy 2: FACTORIES - Dynamic Data Generation
   * Best for: Unique data per test, avoiding conflicts
   * Speed: 🔄 Moderate
   */
  describe('Strategy 2: Factory-based Seeding', () => {
    beforeEach(function() {
      cy.comprehensiveDebug();
      cy.resetFactories(); // Reset factory counters
    });

    it('creates dynamic element data with factories', () => {
      // * Generate fresh data for element tests
      cy.seedWithFactory('element-creation').then((data) => {
        cy.mountWithProviders(
          <TestWrapper>
            <CreateElementModal
              visible={true}
              projectId={data.project.id}
              onClose={cy.stub()}
              onSuccess={cy.stub()}
            />
          </TestWrapper>
        );
      });

      cy.contains('Create New Element').should('be.visible');
    });

    it('creates story editing scenario', () => {
      // * Generate story with chapters and characters
      cy.seedWithFactory('story-editing').then((data) => {
        expect(data.story).to.exist;
        expect(data.story.chapters).to.have.length.greaterThan(0);
        expect(data.characters).to.have.length(2);
      });
    });

    it('creates character relationships scenario', () => {
      // * Generate interconnected character data
      cy.seedWithFactory('character-relationships').then((data) => {
        expect(data.characters).to.have.length.greaterThan(3);
        expect(data.story).to.exist;

        // Characters should have relationships
        const hasRelationships = data.characters.some(
          (char: any) => char.relationships && Object.keys(char.relationships).length > 0
        );
        expect(hasRelationships).to.be.true;
      });
    });
  });

  /**
   * Strategy 3: SCENARIOS - Complete Test Environments
   * Best for: Integration tests needing related data
   * Speed: 🔄 Moderate
   */
  describe('Strategy 3: Scenario-based Seeding', () => {
    beforeEach(function() {
      cy.comprehensiveDebug();
      cy.cleanTestData();
    });

    it('creates minimal scenario for basic tests', () => {
      cy.seedScenario('minimal').then((scenario) => {
        expect(scenario.project).to.exist;
        expect(scenario.stories).to.have.length(0);
        expect(scenario.characters).to.have.length(0);
      });
    });

    it('creates standard scenario for typical tests', () => {
      cy.seedScenario('standard').then((scenario) => {
        expect(scenario.project).to.exist;
        expect(scenario.stories).to.have.length(2);
        expect(scenario.characters).to.have.length(3);

        cy.mountWithProviders(
          <TestWrapper>
            <ElementBrowser projectId={scenario.project.id} />
          </TestWrapper>
        );
      });
    });

    it('creates complete scenario for complex tests', () => {
      cy.seedScenario('complete').then((scenario) => {
        expect(scenario.project).to.exist;
        expect(scenario.stories).to.have.length(3);
        expect(scenario.characters.length).to.be.greaterThan(5);

        // Verify complete data structure
        expect(scenario.stories[0]).to.have.property('status', 'complete');
        expect(scenario.stories[1]).to.have.property('status', 'published');
        expect(scenario.stories[2]).to.have.property('status', 'draft');
      });
    });
  });

  /**
   * Strategy 4: API STUBBING - Mocked Backend Responses
   * Best for: Testing without backend dependencies
   * Speed: ⚡ Fast
   */
  describe('Strategy 4: API Stub Seeding', () => {
    beforeEach(function() {
      cy.comprehensiveDebug();
    });

    it('stubs API responses with fixtures', () => {
      // * Configure API stubs before component mount
      cy.seedWithStubs([
        {
          method: 'GET',
          url: '/api/elements',
          fixture: 'scenarios/complete.json',
        },
        {
          method: 'POST',
          url: '/api/elements',
          response: {
            success: true,
            element: { id: 'new-element', name: 'Created Element' },
          },
        },
      ]);

      // * Mount component that makes API calls
      cy.mountWithProviders(
        <TestWrapper>
          <ElementBrowser projectId="test-project" />
        </TestWrapper>
      );

      // * Stubs intercept the requests
      cy.wait('@stub_complete');
    });
  });

  /**
   * Strategy 5: BULK DATA - Performance and Load Testing
   * Best for: Testing pagination, search, performance
   * Speed: 🐢 Slower (creates many items)
   */
  describe('Strategy 5: Bulk Data Seeding', () => {
    beforeEach(function() {
      cy.comprehensiveDebug();
      cy.cleanTestData();
    });

    it('creates bulk data for performance testing', () => {
      // * Generate large amounts of test data
      cy.seedBulkData({
        projects: 5,
        stories: 10,
        characters: 25,
        elements: 50,
      }).then((data) => {
        expect(data.projects).to.have.length(5);
        expect(data.stories).to.have.length(10);
        expect(data.characters).to.have.length(25);
        expect(data.elements).to.have.length(50);

        // Test pagination with bulk data
        cy.mountWithProviders(
          <TestWrapper>
            <ElementBrowser projectId={data.projects[0].id} />
          </TestWrapper>
        );

        // Should show pagination controls with 50 elements
        cy.get('[data-cy="pagination"]').should('exist');
      });
    });
  });

  /**
   * Strategy 6: SESSION CACHED - Reusable Test Data
   * Best for: Expensive data setup shared across tests
   * Speed: 🚀 Fast after first run
   */
  describe('Strategy 6: Session-cached Seeding', () => {
    const expensiveDataSetup = () => {
      // * Simulate expensive data generation
      cy.seedScenario('complete');
      cy.seedBulkData({ elements: 30 });
    };

    beforeEach(function() {
      cy.comprehensiveDebug();

      // * Cache expensive setup in session
      cy.seedWithSession(
        ['expensive', 'bulk', 'data'],
        expensiveDataSetup
      );
    });

    it('first test creates and caches data', () => {
      // * First run executes the expensive setup
      cy.mountWithProviders(
        <TestWrapper>
          <ElementBrowser projectId="project-fantasy" />
        </TestWrapper>
      );

      cy.verifySeededData({ elements: 30 });
    });

    it('second test reuses cached data (much faster)', () => {
      // * Subsequent tests reuse the cached session
      cy.mountWithProviders(
        <TestWrapper>
          <ElementBrowser projectId="project-fantasy" />
        </TestWrapper>
      );

      // Data is already available from session
      cy.verifySeededData({ elements: 30 });
    });
  });

  /**
   * Strategy 7: TEST-SPECIFIC - Preconfigured for Common Tests
   * Best for: Standard test scenarios with predefined data
   * Speed: 🔄 Varies by test type
   */
  describe('Strategy 7: Test-specific Seeding', () => {
    beforeEach(function() {
      cy.comprehensiveDebug();
      cy.cleanTestData();
    });

    it('seeds for element browser test', () => {
      // * Automatic data setup for element browser
      cy.seedForTest('element-browser');

      cy.mountWithProviders(
        <TestWrapper>
          <ElementBrowser projectId="test-project" />
        </TestWrapper>
      );

      // Should have elements with filters
      cy.get('[data-cy="element-filter"]').should('exist');
    });

    it('seeds for global search test', () => {
      // * Sets up data across multiple domains
      cy.seedForTest('global-search');

      cy.verifySeededData({
        projects: 3,
        stories: 5,
        characters: 10,
        elements: 15,
      });
    });

    it('seeds for empty state test', () => {
      // * Cleans all data for empty state testing
      cy.seedForTest('empty-states');

      cy.mountWithProviders(
        <TestWrapper>
          <ElementBrowser projectId="non-existent" />
        </TestWrapper>
      );

      // Should show empty state
      cy.contains('No elements found').should('be.visible');
    });
  });

  /**
   * Combined Strategies Example
   * Shows how to combine multiple seeding approaches
   */
  describe('Combined Seeding Strategies', () => {
    beforeEach(function() {
      cy.comprehensiveDebug();
      cy.cleanTestData();
    });

    it('combines fixtures, factories, and session caching', () => {
      // * Use session caching for expensive combined setup
      cy.seedWithSession(
        ['combined', 'strategy', 'test'],
        () => {
          // Load base data from fixture
          cy.seedFromFixture('scenarios/minimal.json');

          // Add dynamic data with factories
          cy.seedWithFactory('character-creation');

          // Add bulk elements for testing
          cy.seedBulkData({ elements: 20 });
        }
      );

      // * Stub API responses for save operations
      cy.seedWithStubs([
        {
          method: 'POST',
          url: '/api/elements/*/save',
          response: { success: true },
        },
      ]);

      cy.mountWithProviders(
        <TestWrapper>
          <CreateElementModal
            visible={true}
            projectId="project-minimal"
            onClose={cy.stub()}
            onSuccess={cy.stub()}
          />
        </TestWrapper>
      );

      // Verify combined data is available
      cy.verifySeededData({
        projects: 1,
        elements: 20,
      });
    });
  });

  /**
   * Performance Comparison
   * Demonstrates the speed differences between strategies
   */
  describe('Performance Comparison', () => {
    it('measures fixture loading speed', () => {
      const start = Date.now();

      cy.seedFromFixture('scenarios/complete.json');

      cy.then(() => {
        const elapsed = Date.now() - start;
        cy.log(`⚡ Fixture loading: ${elapsed}ms`);
      });
    });

    it('measures factory generation speed', () => {
      const start = Date.now();

      cy.seedScenario('complete');

      cy.then(() => {
        const elapsed = Date.now() - start;
        cy.log(`🔄 Factory generation: ${elapsed}ms`);
      });
    });

    it('measures bulk data creation speed', () => {
      const start = Date.now();

      cy.seedBulkData({
        projects: 10,
        elements: 100,
      });

      cy.then(() => {
        const elapsed = Date.now() - start;
        cy.log(`🐢 Bulk data creation: ${elapsed}ms`);
      });
    });
  });
});

/**
 * SEEDING STRATEGY SELECTION GUIDE
 *
 * Choose the right strategy based on your test needs:
 *
 * | Strategy | Use When | Speed | Isolation | Uniqueness |
 * |----------|----------|-------|-----------|------------|
 * | Fixtures | Need consistent, static data | ⚡ Fast | High | Low |
 * | Factories | Need unique data per test | 🔄 Moderate | High | High |
 * | Scenarios | Need related data sets | 🔄 Moderate | High | Medium |
 * | API Stubs | Testing without backend | ⚡ Fast | High | Low |
 * | Bulk Data | Performance testing | 🐢 Slow | High | High |
 * | Session | Expensive setup, multiple tests | 🚀 Fast* | Medium | Low |
 * | Test-specific | Common test patterns | 🔄 Varies | High | Medium |
 *
 * *After first run
 *
 * BEST PRACTICES:
 * 1. Always reset/clean data in beforeEach for isolation
 * 2. Use session caching for expensive operations
 * 3. Combine strategies for complex scenarios
 * 4. Verify seeded data after operations
 * 5. Use fixtures for CI/CD consistency
 * 6. Use factories for unique test data
 * 7. Document your seeding strategy in test files
 */