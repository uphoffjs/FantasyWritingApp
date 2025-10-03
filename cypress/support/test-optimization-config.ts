// ! PERFORMANCE: * Test optimization configuration and setup
// TODO: ! PERFORMANCE: * Applies performance improvements, memory management, and anti-flakiness measures

/* eslint-disable @typescript-eslint/no-explicit-any */

/// <reference types="cypress" />
import type * as React from 'react';
import {
  MemoryManagement,
  PerformanceMonitoring,
  TestOptimization,
  AntiFlakinessUtils,
  ResourceMonitoring
} from './performance-utils';

/**
 * Global test configuration for optimization
 */
export const TestConfig = {
  // ! PERFORMANCE: * Performance budgets (in ms)
  performanceBudgets: {
    componentMount: 100,
    componentRender: 50,
    interaction: 200,
    navigation: 300,
    dataFetch: 500,
    animation: 300
  },
  
  // // DEPRECATED: * Memory thresholds (in bytes)
  memoryThresholds: {
    leak: 1000000, // 1MB
    warning: 5000000, // 5MB
    critical: 10000000 // 10MB
  },
  
  // * Retry configuration
  retryConfig: {
    maxRetries: 3,
    baseDelay: 100,
    maxDelay: 2000
  },
  
  // * Timeout configuration
  timeouts: {
    short: 5000,
    medium: 10000,
    long: 30000,
    network: 15000
  },
  
  // * Parallelization config
  parallelConfig: {
    maxConcurrency: 3,
    batchSize: 5
  }
};

/**
 * Performance hooks for all tests
 */
export const setupPerformanceHooks = () => {
  // * Before all tests
  // eslint-disable-next-line no-undef
  before(() => {
    // * Clear any previous state
    MemoryManagement.performCleanup();
    PerformanceMonitoring.clearMetrics();
    
    // * Start resource monitoring
    if (Cypress.config('watchForFileChanges')) {
      ResourceMonitoring.monitorCPU();
      ResourceMonitoring.monitorFrameRate();
    }
  });
  
  // * Before each test
  beforeEach(() => {
    // * Take initial memory snapshot
    MemoryManagement.takeSnapshot('test-start');
    
    // * Clear timers from previous tests
    MemoryManagement.clearAllTimers();
    
    // * Set up network idle detection
    cy.intercept('**/*', { middleware: true }, (req) => {
      req.alias = 'networkRequest';
    });
  });
  
  // * After each test
  afterEach(() => {
    // * Clean up DOM
    MemoryManagement.cleanupDOM();
    
    // ! PERFORMANCE: Clear React Fiber cache
    MemoryManagement.clearReactFiber();
    
    // * Clear event listeners
    MemoryManagement.clearEventListeners();
    
    // * Take final memory snapshot
    MemoryManagement.takeSnapshot('test-end');
    
    // * Check for memory leaks
    const leak = MemoryManagement.compareSnapshots('test-start', 'test-end');
    if (leak > TestConfig.memoryThresholds.warning) {
      cy.log(`⚠️ Potential memory leak: ${(leak / 1000000).toFixed(2)}MB`);
    }
    
    // * Force garbage collection
    MemoryManagement.forceGarbageCollection();
  });
  
  // * After all tests
  // eslint-disable-next-line no-undef
  after(() => {
    // ! PERFORMANCE: * Generate performance report
    generatePerformanceReport();
    
    // * Final cleanup
    MemoryManagement.performCleanup();
  });
};

/**
 * Optimized test helpers
 */
export const OptimizedHelpers = {
  /**
   * Optimized component mount
   */
  mountWithPerformance: (component: React.ReactElement, options?: any) => {
    const start = PerformanceMonitoring.startTiming('mount');
    
    cy.mount(component, options);
    
    const duration = PerformanceMonitoring.endTiming('mount', start);
    
    // ! PERFORMANCE: * Check performance budget
    if (duration > TestConfig.performanceBudgets.componentMount) {
      cy.log(`⚠️ Slow mount: ${duration.toFixed(2)}ms`);
    }
    
    return cy.get('[data-cy-root]');
  },
  
  /**
   * Optimized interaction with retry
   */
  interactWithRetry: (
    selector: string,
    action: 'click' | 'type' | 'select',
    value?: string
  ) => {
    return AntiFlakinessUtils.retryWithBackoff(async () => {
      AntiFlakinessUtils.ensureInteractable(selector);
      
      const start = PerformanceMonitoring.startTiming('interaction');
      
      switch (action) {
        case 'click':
          cy.get(selector).click();
          break;
        case 'type':
          cy.get(selector).clear().type(value || '');
          break;
        case 'select':
          cy.get(selector).select(value || '');
          break;
      }
      
      const duration = PerformanceMonitoring.endTiming('interaction', start);
      
      if (duration > TestConfig.performanceBudgets.interaction) {
        cy.log(`⚠️ Slow interaction: ${duration.toFixed(2)}ms`);
      }
    }, TestConfig.retryConfig.maxRetries, TestConfig.retryConfig.baseDelay);
  },
  
  /**
   * Wait for stable state
   */
  waitForStableState: () => {
    return Promise.all([
      AntiFlakinessUtils.waitForNetworkIdle(TestConfig.timeouts.network),
      AntiFlakinessUtils.waitForAnimations(),
      AntiFlakinessUtils.waitForStableDOM('body', TestConfig.timeouts.medium)
    ]);
  },
  
  /**
   * Batch assertions for performance
   */
  batchAssertions: (assertions: Array<() => void>) => {
    const start = PerformanceMonitoring.startTiming('assertions');
    
    TestOptimization.batchDOMOperations(assertions);
    
    const duration = PerformanceMonitoring.endTiming('assertions', start);
    cy.log(`Assertions completed in ${duration.toFixed(2)}ms`);
  },
  
  /**
   * Lazy load test fixtures
   */
  lazyFixture: <T>(fixtureName: string) => {
    return TestOptimization.lazyLoadData<T>(async () => {
      return new Promise((resolve) => {
        cy.fixture(fixtureName).then(resolve);
      });
    });
  }
};

/**
 * Anti-flakiness wrappers
 */
export const StableWrappers = {
  /**
   * Stable click with retries
   */
  stableClick: (selector: string) => {
    return AntiFlakinessUtils.retryWithBackoff(async () => {
      AntiFlakinessUtils.ensureInteractable(selector);
      cy.get(selector).click({ force: false });
    });
  },
  
  /**
   * Stable type with debounce
   */
  stableType: TestOptimization.debounce((selector: string, text: string) => {
    cy.get(selector).clear().type(text, { delay: 0 });
  }, 100),
  
  /**
   * Stable assertion with wait
   */
  stableAssert: (selector: string, assertion: string, value?: any) => {
    AntiFlakinessUtils.waitForStableDOM(selector);
    
    if (value !== undefined) {
      cy.get(selector).should(assertion, value);
    } else {
      cy.get(selector).should(assertion);
    }
  }
};

/**
 * Performance benchmarking helpers
 */
export const BenchmarkHelpers = {
  /**
   * Benchmark a component render
   */
  benchmarkRender: async (
    name: string,
    component: () => React.ReactElement,
    iterations: number = 10
  ) => {
    const results = await TestOptimization.runParallel(
      Array(iterations).fill(null).map(() => async () => {
        const start = performance.now();
        cy.mount(component());
        cy.wait(100); // Wait for render
        MemoryManagement.cleanupDOM();
        return performance.now() - start;
      }),
      1 // Run sequentially for accurate timing
    );
    
    const avg = results.reduce((a, b) => a + b, 0) / results.length;
    cy.log(`📊 ${name} average render: ${avg.toFixed(2)}ms`);
    
    return avg;
  },
  
  /**
   * Compare performance between implementations
   */
  comparePerformance: async (
    implementations: Array<{
      name: string;
      fn: () => void | Promise<void>;
    }>,
    iterations: number = 10
  ) => {
    const results: Record<string, number> = {};
    
    for (const impl of implementations) {
      // eslint-disable-next-line no-undef
      const stats = await Benchmarking.runBenchmark(impl.name, impl.fn, iterations);
      results[impl.name] = stats.avg;
    }
    
    // * Find the fastest
    const fastest = Object.entries(results).reduce((prev, curr) => 
      curr[1] < prev[1] ? curr : prev
    );
    
    cy.log(`🏆 Fastest: ${fastest[0]} (${fastest[1].toFixed(2)}ms)`);
    
    // ? * Show comparisons
    Object.entries(results).forEach(([name, time]) => {
      if (name !== fastest[0]) {
        const diff = ((time - fastest[1]) / fastest[1] * 100).toFixed(1);
        cy.log(`   ${name}: ${time.toFixed(2)}ms (+${diff}%)`);
      }
    });
    
    return results;
  }
};

/**
 * Generate performance report
 */
const generatePerformanceReport = () => {
  cy.log('📊 === Performance Report ===');
  
  // * Memory usage
  const memorySnapshots = Array.from(MemoryManagement.memorySnapshots.entries());
  if (memorySnapshots.length > 0) {
    cy.log('💾 Memory Usage:');
    memorySnapshots.forEach(([label, bytes]) => {
      cy.log(`   ${label}: ${(bytes / 1000000).toFixed(2)}MB`);
    });
  }
  
  // * Timing statistics
  const timingLabels = Array.from(PerformanceMonitoring.metrics.keys());
  if (timingLabels.length > 0) {
    cy.log('⏱️ Timing Statistics:');
    timingLabels.forEach(label => {
      const stats = PerformanceMonitoring.getStatistics(label);
      cy.log(`   ${label}:`);
      cy.log(`     Avg: ${stats.avg.toFixed(2)}ms`);
      cy.log(`     Min: ${stats.min.toFixed(2)}ms`);
      cy.log(`     Max: ${stats.max.toFixed(2)}ms`);
      cy.log(`     P95: ${stats.p95.toFixed(2)}ms`);
    });
  }
  
  // * Benchmark results
  // eslint-disable-next-line no-undef
  const benchmarks = Array.from(Benchmarking.benchmarks.entries());
  if (benchmarks.length > 0) {
    cy.log('🏃 Benchmark Results:');
    benchmarks.forEach(([name, stats]) => {
      cy.log(`   ${name}: ${stats.avg.toFixed(2)}ms (${stats.iterations} iterations)`);
    });
  }
};

/**
 * Custom Cypress commands for optimization
 */
Cypress.Commands.add('optimizedMount', OptimizedHelpers.mountWithPerformance);
Cypress.Commands.add('stableClick', StableWrappers.stableClick);
Cypress.Commands.add('stableType', StableWrappers.stableType);
Cypress.Commands.add('stableAssert', StableWrappers.stableAssert);
Cypress.Commands.add('waitForStableState', OptimizedHelpers.waitForStableState);
Cypress.Commands.add('benchmarkRender', BenchmarkHelpers.benchmarkRender);

// * Type declarations
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      optimizedMount(component: React.ReactElement, options?: any): Chainable<Element>;
      stableClick(selector: string): void;
      stableType(selector: string, text: string): void;
      stableAssert(selector: string, assertion: string, value?: any): void;
      waitForStableState(): Chainable<void>;
      benchmarkRender(name: string, component: () => React.ReactElement, iterations?: number): Chainable<number>;
    }
  }
}

export default {
  TestConfig,
  setupPerformanceHooks,
  OptimizedHelpers,
  StableWrappers,
  BenchmarkHelpers
};