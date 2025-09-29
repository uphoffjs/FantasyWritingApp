/**
 * @fileoverview Example Performance Monitoring Tests
 * Demonstrates how to use performance monitoring utilities in Cypress tests
 *
 * User Story:
 * As a developer
 * I want to track component performance
 * So that I can prevent performance regressions
 *
 * Acceptance Criteria:
 * - Monitor render times
 * - Track interaction response times
 * - Validate performance budgets
 * - Generate performance reports
 */

import { DEFAULT_BUDGETS } from '../../support/commands/performance/performance-monitoring';

describe('Performance Monitoring Examples', () => {
  beforeEach(function() {
    // ! MANDATORY: Comprehensive debug setup
    cy.comprehensiveDebug();

    // * Clean state before each test
    cy.cleanState();

    // * Setup test user
    cy.setupTestUser();

    // * Navigate to elements page for testing
    cy.visit('/elements');
  });

  afterEach(() => {
    // ! NOTE: Failure handling is done globally in cypress/support/e2e.ts
    // ! Following Cypress best practices - no conditional statements in tests

    // * Generate performance report at end of each test
    cy.generatePerformanceReport();
  });

  // * Example 1: Basic component render performance
  describe('Component Render Performance', () => {
    it('should track ElementCard render performance', () => {
      // * Start monitoring before component renders
      cy.startPerformanceMonitoring('ElementCard');

      // * Render component (navigate or trigger render)
      cy.get('[data-cy="element-card"]').first().should('be.visible');

      // * End monitoring and check against budget
      cy.endPerformanceMonitoring('ElementCard', {
        budget: DEFAULT_BUDGETS.simple,
        logResults: true
      }).then((metrics) => {
        // * Assert render time is within acceptable range
        expect(metrics.renderTime).to.be.lessThan(100);
      });
    });

    it('should track multiple components', () => {
      // * Monitor ElementBrowser
      cy.startPerformanceMonitoring('ElementBrowser');
      cy.get('[data-cy="element-browser"]').should('be.visible');
      cy.endPerformanceMonitoring('ElementBrowser', {
        budget: DEFAULT_BUDGETS.complex
      });

      // * Monitor individual ElementCards
      cy.startPerformanceMonitoring('ElementCards');
      cy.get('[data-cy="element-card"]').should('have.length.greaterThan', 0);
      cy.endPerformanceMonitoring('ElementCards', {
        budget: DEFAULT_BUDGETS.medium
      });

      // * Generate summary report
      cy.generatePerformanceReport();
    });
  });

  // * Example 2: Interaction performance
  describe('Interaction Performance', () => {
    it('should measure button click response time', () => {
      // * Measure interaction performance
      cy.measureInteraction('CreateElementButton', () => {
        cy.get('[data-cy="create-element-btn"]').click();
      }, { expectedDuration: 150 }).then((interactionTime) => {
        // * Assert interaction is responsive
        expect(interactionTime).to.be.lessThan(200);
      });

      // * Close modal after test
      cy.get('[data-cy="modal-close"]').click();
    });

    it('should measure form submission performance', () => {
      // * Open create element modal
      cy.get('[data-cy="create-element-btn"]').click();

      // * Fill form
      cy.get('[data-cy="element-name-input"]').type('Test Character');
      cy.get('[data-cy="element-type-select"]').select('character');

      // * Measure form submission
      cy.measureInteraction('FormSubmission', () => {
        cy.get('[data-cy="submit-btn"]').click();
      }, { expectedDuration: 500 }).then((interactionTime) => {
        // * Form submission should complete within 500ms
        expect(interactionTime).to.be.lessThan(500);
      });
    });
  });

  // * Example 3: Re-render tracking
  describe('Re-render Tracking', () => {
    it('should track component re-renders during interactions', () => {
      // * Track re-renders when filtering elements
      cy.trackRerenders('[data-cy="element-list"]', () => {
        // * Type in search field to trigger re-renders
        cy.get('[data-cy="search-input"]').type('character');
        // ! Following Cypress best practices - wait for specific conditions instead of arbitrary time
        // * Wait for search results to update (debounced search completion)
        cy.get('[data-cy="search-results"]').should('be.visible');
        cy.get('[data-cy="element-list"]').should('contain', 'character');
      }).then((rerenderCount) => {
        // * Assert reasonable re-render count
        expect(rerenderCount).to.be.lessThan(5);
        cy.log(`Element list re-rendered ${rerenderCount} times during search`);
      });
    });

    it('should minimize re-renders on state updates', () => {
      // * Open element editor
      cy.get('[data-cy="element-card"]').first().click();

      // * Track re-renders during editing
      cy.trackRerenders('[data-cy="element-editor"]', () => {
        // * Make multiple edits
        cy.get('[data-cy="element-name-input"]').clear().type('Updated Name');
        cy.get('[data-cy="element-description"]').type(' Additional description');
      }).then((rerenderCount) => {
        // * Should have minimal re-renders with proper React optimization
        expect(rerenderCount).to.be.lessThan(10);
      });
    });
  });

  // * Example 4: Performance budgets
  describe('Performance Budget Validation', () => {
    it('should validate against custom performance budgets', () => {
      // * Define strict performance budget
      const strictBudget = {
        maxRenderTime: 50,
        maxInteractionTime: 100,
        maxMemoryUsage: 5,
        maxRerenderCount: 3
      };

      // * Monitor with custom budget
      cy.startPerformanceMonitoring('StrictComponent');
      cy.get('[data-cy="element-card"]').first().should('be.visible');
      cy.endPerformanceMonitoring('StrictComponent', {
        budget: strictBudget
      });

      // * Assert budget compliance
      cy.assertPerformanceBudget('StrictComponent', strictBudget);
    });

    it('should handle different budgets for different components', () => {
      // * Simple component with tight budget
      cy.startPerformanceMonitoring('SimpleButton');
      cy.get('[data-cy="filter-btn"]').should('be.visible');
      cy.endPerformanceMonitoring('SimpleButton', {
        budget: DEFAULT_BUDGETS.simple
      });

      // * Complex component with relaxed budget
      cy.startPerformanceMonitoring('ComplexGraph');
      cy.get('[data-cy="relationship-graph"]').should('be.visible');
      cy.endPerformanceMonitoring('ComplexGraph', {
        budget: DEFAULT_BUDGETS.complex
      });

      // * Validate both meet their respective budgets
      cy.assertPerformanceBudget('SimpleButton', DEFAULT_BUDGETS.simple);
      cy.assertPerformanceBudget('ComplexGraph', DEFAULT_BUDGETS.complex);
    });
  });

  // * Example 5: Comprehensive performance test
  describe('Comprehensive Performance Analysis', () => {
    it('should perform full performance audit of critical user flow', () => {
      // * Track entire flow performance
      cy.startPerformanceMonitoring('CompleteUserFlow');

      // * Step 1: Load element browser
      cy.startPerformanceMonitoring('LoadElementBrowser');
      cy.get('[data-cy="element-browser"]').should('be.visible');
      cy.endPerformanceMonitoring('LoadElementBrowser');

      // * Step 2: Search for elements
      cy.measureInteraction('SearchElements', () => {
        cy.get('[data-cy="search-input"]').type('character');
      });

      // * Step 3: Open element details
      cy.measureInteraction('OpenElementDetails', () => {
        cy.get('[data-cy="element-card"]').first().click();
      });

      // * Step 4: Edit element
      cy.trackRerenders('[data-cy="element-editor"]', () => {
        cy.get('[data-cy="element-name-input"]').clear().type('Updated Character');
        cy.get('[data-cy="save-btn"]').click();
      });

      // * End overall flow monitoring
      cy.endPerformanceMonitoring('CompleteUserFlow', {
        budget: { maxRenderTime: 1000 }
      });

      // * Generate comprehensive report
      cy.generatePerformanceReport();

      // * Verify overall performance
      cy.get('@performanceReport').then((report: any) => {
        expect(report.averageRenderTime).to.be.lessThan(200);
        expect(report.maxRenderTime).to.be.lessThan(500);
      });
    });
  });

  // * Example 6: Performance regression detection
  describe('Performance Regression Detection', () => {
    it('should detect performance regressions', () => {
      // * Baseline performance metrics (would normally come from historical data)
      const baselineMetrics = {
        elementCardRender: 45,
        searchInteraction: 120,
        modalOpen: 80
      };

      // * Test current performance against baseline
      cy.startPerformanceMonitoring('ElementCard');
      cy.get('[data-cy="element-card"]').first().should('be.visible');
      cy.endPerformanceMonitoring('ElementCard').then((metrics) => {
        // * Allow 20% regression tolerance
        const tolerance = 1.2;
        expect(metrics.renderTime).to.be.lessThan(baselineMetrics.elementCardRender * tolerance);
      });

      // * Test search performance
      cy.measureInteraction('Search', () => {
        cy.get('[data-cy="search-input"]').type('test');
      }).then((interactionTime) => {
        expect(interactionTime).to.be.lessThan(baselineMetrics.searchInteraction * 1.2);
      });

      // * Test modal performance
      cy.measureInteraction('ModalOpen', () => {
        cy.get('[data-cy="create-element-btn"]').click();
      }).then((interactionTime) => {
        expect(interactionTime).to.be.lessThan(baselineMetrics.modalOpen * 1.2);
      });
    });
  });
});

// * Export helper for running performance tests on specific components
export const runPerformanceAudit = (componentSelector: string, componentName: string) => {
  cy.startPerformanceMonitoring(componentName);
  cy.get(componentSelector).should('be.visible');
  cy.endPerformanceMonitoring(componentName, {
    budget: DEFAULT_BUDGETS.medium,
    logResults: true
  });
  cy.assertPerformanceBudget(componentName, DEFAULT_BUDGETS.medium);
};