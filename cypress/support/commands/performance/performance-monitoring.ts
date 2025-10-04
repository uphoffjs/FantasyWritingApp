/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-shadow */
// ! Performance monitoring utilities with intentional any types
 
// ! Performance monitoring commands that may use various selectors
/**
 * @fileoverview Performance Monitoring Utilities for Cypress Tests
 * Provides comprehensive performance tracking for critical component tests
 *
 * User Story:
 * As a developer
 * I want to track component performance metrics
 * So that I can identify and prevent performance regressions
 *
 * Acceptance Criteria:
 * - Track render times for components
 * - Monitor re-render counts
 * - Measure interaction response times
 * - Generate performance reports
 * - Set performance budgets
 */

// * Performance metrics storage
interface PerformanceMetrics {
  componentName: string;
  renderTime?: number;
  interactionTime?: number;
  memoryUsage?: number;
  rerenderCount?: number;
  timestamp: number;
  testName?: string;
}

// * Performance budget thresholds
interface PerformanceBudget {
  maxRenderTime?: number;      // milliseconds
  maxInteractionTime?: number; // milliseconds
  maxMemoryUsage?: number;     // megabytes
  maxRerenderCount?: number;   // count
}

// * Default performance budgets by component type
const DEFAULT_BUDGETS: Record<string, PerformanceBudget> = {
  simple: {
    maxRenderTime: 50,
    maxInteractionTime: 100,
    maxRerenderCount: 2
  },
  medium: {
    maxRenderTime: 100,
    maxInteractionTime: 200,
    maxRerenderCount: 5
  },
  complex: {
    maxRenderTime: 200,
    maxInteractionTime: 500,
    maxRerenderCount: 10
  }
};

/**
 * Start performance monitoring for a component
 * Marks the beginning of a performance measurement
 */
Cypress.Commands.add('startPerformanceMonitoring', (componentName: string) => {
  cy.window().then((win) => {
    // * Create performance mark
    win.performance.mark(`${componentName}-start`);

    // * Initialize metrics storage
    if (!win.cypressPerformanceMetrics) {
      win.cypressPerformanceMetrics = [];
    }

    // * Store initial memory usage if available
    if (win.performance.memory) {
      const initialMemory = win.performance.memory.usedJSHeapSize / 1048576; // Convert to MB
      cy.wrap(initialMemory).as('initialMemory');
    }

    cy.log(`⚡ Performance monitoring started for ${componentName}`);
  });
});

/**
 * End performance monitoring and calculate metrics
 * Measures the time between start and end marks
 */
Cypress.Commands.add('endPerformanceMonitoring', (
  componentName: string,
  options: { budget?: PerformanceBudget; logResults?: boolean } = {}
) => {
  const { budget = DEFAULT_BUDGETS.simple, logResults = true } = options;

  cy.window().then((win) => {
    // * Create end mark
    win.performance.mark(`${componentName}-end`);

    // * Measure performance
    win.performance.measure(
      `${componentName}-render`,
      `${componentName}-start`,
      `${componentName}-end`
    );

    // * Get the measurement
    const measures = win.performance.getEntriesByName(`${componentName}-render`);
    const renderTime = measures[0]?.duration || 0;

    // * Calculate memory usage if available
    let memoryUsage = 0;
    if (win.performance.memory) {
      const currentMemory = win.performance.memory.usedJSHeapSize / 1048576; // MB
      cy.get('@initialMemory').then((initialMemory: any) => {
        memoryUsage = currentMemory - initialMemory;
      });
    }

    // * Create metrics object
    const metrics: PerformanceMetrics = {
      componentName,
      renderTime,
      memoryUsage,
      timestamp: Date.now(),
      testName: Cypress.currentTest.title
    };

    // * Store metrics
    if (!win.cypressPerformanceMetrics) {
      win.cypressPerformanceMetrics = [];
    }
    win.cypressPerformanceMetrics.push(metrics);

    // * Log results if requested
    if (logResults) {
      cy.log(`⚡ Performance Results for ${componentName}:`);
      cy.log(`  Render Time: ${renderTime.toFixed(2)}ms`);
      if (memoryUsage > 0) {
        cy.log(`  Memory Usage: ${memoryUsage.toFixed(2)}MB`);
      }
    }

    // * Validate against budget
    if (budget.maxRenderTime && renderTime > budget.maxRenderTime) {
      cy.log(`⚠️ Performance Budget Exceeded: Render time ${renderTime.toFixed(2)}ms > ${budget.maxRenderTime}ms`);
    }

    // * Clean up marks
    win.performance.clearMarks(`${componentName}-start`);
    win.performance.clearMarks(`${componentName}-end`);
    win.performance.clearMeasures(`${componentName}-render`);

    // * Return metrics for assertions
    cy.wrap(metrics);
  });
});

/**
 * Measure interaction performance
 * Tracks the time it takes for an interaction to complete
 */
Cypress.Commands.add('measureInteraction', (
  interactionName: string,
  interactionFn: () => void,
  options: { expectedDuration?: number } = {}
) => {
  const { expectedDuration = 100 } = options;

  cy.window().then((win) => {
    // * Mark interaction start
    win.performance.mark(`${interactionName}-interaction-start`);

    // * Execute interaction
    interactionFn();

    // * Mark interaction end
    cy.window().then((win) => {
      win.performance.mark(`${interactionName}-interaction-end`);

      // * Measure interaction time
      win.performance.measure(
        `${interactionName}-interaction`,
        `${interactionName}-interaction-start`,
        `${interactionName}-interaction-end`
      );

      const measures = win.performance.getEntriesByName(`${interactionName}-interaction`);
      const interactionTime = measures[0]?.duration || 0;

      cy.log(`⚡ Interaction "${interactionName}" took ${interactionTime.toFixed(2)}ms`);

      if (interactionTime > expectedDuration) {
        cy.log(`⚠️ Interaction slower than expected: ${interactionTime.toFixed(2)}ms > ${expectedDuration}ms`);
      }

      // * Clean up
      win.performance.clearMarks(`${interactionName}-interaction-start`);
      win.performance.clearMarks(`${interactionName}-interaction-end`);
      win.performance.clearMeasures(`${interactionName}-interaction`);

      cy.wrap(interactionTime);
    });
  });
});

/**
 * Track component re-renders
 * Monitors how many times a component re-renders during a test
 */
Cypress.Commands.add('trackRerenders', (componentSelector: string, callback: () => void) => {
  let renderCount = 0;

  // * Set up mutation observer to track DOM changes
  cy.get(componentSelector).then(($el) => {
    cy.window().then((win) => {
      const observer = new win.MutationObserver(() => {
        renderCount++;
      });

      observer.observe($el[0], {
        childList: true,
        subtree: true,
        attributes: true
      });

      // * Store observer reference for cleanup
      cy.wrap(observer).as('rerenderObserver');
      cy.wrap(0).as('initialRenderCount');
    });
  });

  // * Execute callback that may trigger re-renders
  callback();

  // * Clean up and report
  cy.get('@rerenderObserver').then((observer: any) => {
    observer.disconnect();
    cy.log(`⚡ Component re-rendered ${renderCount} times`);
    cy.wrap(renderCount);
  });
});

/**
 * Generate performance report
 * Summarizes all performance metrics collected during the test
 */
Cypress.Commands.add('generatePerformanceReport', () => {
  cy.window().then((win) => {
    const metrics = win.cypressPerformanceMetrics || [];

    if (metrics.length === 0) {
      cy.log('📊 No performance metrics collected');
      return;
    }

    // * Calculate summary statistics
    const summary = {
      totalComponents: metrics.length,
      averageRenderTime: 0,
      maxRenderTime: 0,
      minRenderTime: Infinity,
      totalMemoryUsage: 0
    };

    metrics.forEach((metric: PerformanceMetrics) => {
      if (metric.renderTime) {
        summary.averageRenderTime += metric.renderTime;
        summary.maxRenderTime = Math.max(summary.maxRenderTime, metric.renderTime);
        summary.minRenderTime = Math.min(summary.minRenderTime, metric.renderTime);
      }
      if (metric.memoryUsage) {
        summary.totalMemoryUsage += metric.memoryUsage;
      }
    });

    summary.averageRenderTime /= metrics.length;

    // * Generate report
    cy.log('📊 Performance Report:');
    cy.log(`  Components Tested: ${summary.totalComponents}`);
    cy.log(`  Average Render Time: ${summary.averageRenderTime.toFixed(2)}ms`);
    cy.log(`  Max Render Time: ${summary.maxRenderTime.toFixed(2)}ms`);
    cy.log(`  Min Render Time: ${summary.minRenderTime.toFixed(2)}ms`);
    if (summary.totalMemoryUsage > 0) {
      cy.log(`  Total Memory Impact: ${summary.totalMemoryUsage.toFixed(2)}MB`);
    }

    // * Store report for potential assertions
    cy.wrap(summary).as('performanceReport');
  });
});

/**
 * Assert performance within budget
 * Validates that performance metrics meet specified thresholds
 */
Cypress.Commands.add('assertPerformanceBudget', (
  componentName: string,
  budget: PerformanceBudget
) => {
  cy.window().then((win) => {
    const metrics = win.cypressPerformanceMetrics || [];
    const componentMetrics = metrics.find((m: PerformanceMetrics) =>
      m.componentName === componentName
    );

    if (!componentMetrics) {
      throw new Error(`No metrics found for component: ${componentName}`);
    }

    // * Assert render time
    if (budget.maxRenderTime && componentMetrics.renderTime) {
      expect(componentMetrics.renderTime, 'Render time within budget')
        .to.be.lessThan(budget.maxRenderTime);
    }

    // * Assert interaction time
    if (budget.maxInteractionTime && componentMetrics.interactionTime) {
      expect(componentMetrics.interactionTime, 'Interaction time within budget')
        .to.be.lessThan(budget.maxInteractionTime);
    }

    // * Assert memory usage
    if (budget.maxMemoryUsage && componentMetrics.memoryUsage) {
      expect(componentMetrics.memoryUsage, 'Memory usage within budget')
        .to.be.lessThan(budget.maxMemoryUsage);
    }

    cy.log(`✅ ${componentName} meets performance budget`);
  });
});

// * TypeScript definitions
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      startPerformanceMonitoring(componentName: string): void;

      endPerformanceMonitoring(
        componentName: string,
        options?: { budget?: PerformanceBudget; logResults?: boolean }
      ): Chainable<PerformanceMetrics>;

      measureInteraction(
        interactionName: string,
        interactionFn: () => void,
        options?: { expectedDuration?: number }
      ): Chainable<number>;

      trackRerenders(
        componentSelector: string,
        callback: () => void
      ): Chainable<number>;

      generatePerformanceReport(): void;

      assertPerformanceBudget(
        componentName: string,
        budget: PerformanceBudget
      ): void;
    }
  }

  interface Window {
    cypressPerformanceMetrics?: PerformanceMetrics[];
  }
}

export { PerformanceMetrics, PerformanceBudget, DEFAULT_BUDGETS };