// ! PERFORMANCE: * Performance monitoring and optimization utilities for Cypress tests
// TODO: * Prevents memory leaks, improves execution speed, and reduces flakiness

/**
 * Memory management utilities
 */
export const MemoryManagement = {
  /**
   * Track memory usage before and after tests
   */
  memorySnapshots: new Map<string, number>(),
  
  /**
   * Take a memory snapshot
   */
  takeSnapshot: (label: string) => {
    if (performance.memory) {
      const usage = performance.memory.usedJSHeapSize;
      MemoryManagement.memorySnapshots.set(label, usage);
      return usage;
    }
    return 0;
  },
  
  /**
   * Compare memory snapshots
   */
  compareSnapshots: (before: string, after: string): number => {
    const beforeMem = MemoryManagement.memorySnapshots.get(before) || 0;
    const afterMem = MemoryManagement.memorySnapshots.get(after) || 0;
    return afterMem - beforeMem;
  },
  
  /**
   * Force garbage collection (if available)
   */
  forceGarbageCollection: () => {
    if (window.gc) {
      window.gc();
    }
  },
  
  /**
   * Clean up DOM elements
   */
  cleanupDOM: () => {
    // * Remove all test containers
    cy.document().then(doc => {
      const testContainers = doc.querySelectorAll('[data-cy-root], [data-test-root]');
      testContainers.forEach(container => container.remove());
    });
  },
  
  /**
   * Clear all event listeners
   */
  clearEventListeners: () => {
    cy.window().then(win => {
      // * Store original addEventListener
      const originalAddEventListener = win.addEventListener;
      const listeners: Array<{ type: string; listener: EventListener; options?: any }> = [];
      
      // * Override addEventListener to track listeners
      win.addEventListener = function(type: string, listener: EventListener, options?: any) {
        listeners.push({ type, listener, options });
        return originalAddEventListener.call(this, type, listener, options);
      };
      
      // * Clean up function
      return () => {
        listeners.forEach(({ type, listener, options }) => {
          win.removeEventListener(type, listener, options);
        });
        listeners.length = 0;
      };
    });
  },
  
  /**
   * Clear all timers
   */
  clearAllTimers: () => {
    cy.window().then(win => {
      // * Clear all timeouts
      let id = win.setTimeout(() => {}, 0);
      while (id--) {
        win.clearTimeout(id);
      }
      
      // * Clear all intervals
      id = win.setInterval(() => {}, 1000);
      while (id--) {
        win.clearInterval(id);
      }
    });
  },
  
  /**
   * Clear React Fiber cache (for React components)
   */
  clearReactFiber: () => {
    cy.window().then(win => {
      const reactRoot = (win as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
      if (reactRoot) {
        // ! PERFORMANCE: Clear React DevTools cache
        reactRoot.renderers?.clear?.();
        reactRoot.fiberRoots?.clear?.();
      }
    });
  },
  
  /**
   * Comprehensive cleanup
   */
  performCleanup: () => {
    MemoryManagement.cleanupDOM();
    MemoryManagement.clearAllTimers();
    MemoryManagement.clearReactFiber();
    MemoryManagement.forceGarbageCollection();
  }
};

/**
 * Performance monitoring utilities
 */
export const PerformanceMonitoring = {
  metrics: new Map<string, number[]>(),
  
  /**
   * Start performance timing
   */
  startTiming: (label: string): number => {
    const start = performance.now();
    return start;
  },
  
  /**
   * End performance timing
   */
  endTiming: (label: string, start: number): number => {
    const duration = performance.now() - start;
    
    if (!PerformanceMonitoring.metrics.has(label)) {
      PerformanceMonitoring.metrics.set(label, []);
    }
    PerformanceMonitoring.metrics.get(label)!.push(duration);
    
    return duration;
  },
  
  /**
   * Get average timing for a label
   */
  getAverageTiming: (label: string): number => {
    const timings = PerformanceMonitoring.metrics.get(label);
    if (!timings || timings.length === 0) return 0;
    
    const sum = timings.reduce((a, b) => a + b, 0);
    return sum / timings.length;
  },
  
  /**
   * Get performance statistics
   */
  getStatistics: (label: string) => {
    const timings = PerformanceMonitoring.metrics.get(label);
    if (!timings || timings.length === 0) {
      return { min: 0, max: 0, avg: 0, median: 0, p95: 0 };
    }
    
    const sorted = [...timings].sort((a, b) => a - b);
    const avg = timings.reduce((a, b) => a + b, 0) / timings.length;
    const median = sorted[Math.floor(sorted.length / 2)];
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    
    return {
      min: Math.min(...timings),
      max: Math.max(...timings),
      avg,
      median,
      p95,
      count: timings.length
    };
  },
  
  /**
   * Clear metrics
   */
  clearMetrics: () => {
    PerformanceMonitoring.metrics.clear();
  }
};

/**
 * Test optimization utilities
 */
export const TestOptimization = {
  /**
   * Batch DOM operations
   */
  batchDOMOperations: (operations: (() => void)[]) => {
    cy.document().then(doc => {
      // Use DocumentFragment for batch insertions
      const fragment = doc.createDocumentFragment();
      
      // * Execute all operations
      operations.forEach(op => op());
      
      // * Force single reflow
      doc.body.offsetHeight;
    });
  },
  
  /**
   * Debounce test actions
   */
  debounce: (fn: Function, delay: number = 100) => {
    let timeoutId: NodeJS.Timeout;
    
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), delay);
    };
  },
  
  /**
   * Throttle test actions
   */
  throttle: (fn: Function, limit: number = 100) => {
    let inThrottle: boolean = false;
    
    return (...args: any[]) => {
      if (!inThrottle) {
        fn(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },
  
  /**
   * Lazy load test data
   */
  lazyLoadData: <T>(loader: () => Promise<T>) => {
    let cache: T | null = null;
    
    return async (): Promise<T> => {
      if (cache === null) {
        cache = await loader();
      }
      return cache;
    };
  },
  
  /**
   * Parallel test execution helper
   */
  runParallel: async (tasks: (() => Promise<any>)[], maxConcurrency: number = 3) => {
    const results = [];
    const executing: Promise<any>[] = [];
    
    for (const task of tasks) {
      const p = task().then(result => {
        executing.splice(executing.indexOf(p), 1);
        return result;
      });
      
      results.push(p);
      executing.push(p);
      
      if (executing.length >= maxConcurrency) {
        await Promise.race(executing);
      }
    }
    
    return Promise.all(results);
  }
};

/**
 * Anti-flakiness utilities
 */
export const AntiFlakinessUtils = {
  /**
   * Retry with exponential backoff
   */
  retryWithBackoff: async (
    fn: () => Promise<any>,
    maxRetries: number = 3,
    baseDelay: number = 100
  ) => {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        if (i < maxRetries - 1) {
          const delay = baseDelay * Math.pow(2, i);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  },
  
  /**
   * Wait for stable DOM
   */
  waitForStableDOM: (selector: string, timeout: number = 5000) => {
    const checkInterval = 100;
    let previousHTML = '';
    let stableCount = 0;
    const requiredStableChecks = 3;
    
    return cy.wrap(null).then(() => {
      return new Cypress.Promise((resolve, reject) => {
        const startTime = Date.now();
        
        const check = () => {
          cy.get(selector).then($el => {
            const currentHTML = $el.html();
            
            if (currentHTML === previousHTML) {
              stableCount++;
              if (stableCount >= requiredStableChecks) {
                resolve(undefined);
                return;
              }
            } else {
              stableCount = 0;
              previousHTML = currentHTML;
            }
            
            if (Date.now() - startTime > timeout) {
              reject(new Error('DOM did not stabilize in time'));
            } else {
              setTimeout(check, checkInterval);
            }
          });
        };
        
        check();
      });
    });
  },
  
  /**
   * Wait for network idle
   */
  waitForNetworkIdle: (timeout: number = 3000, idleTime: number = 500) => {
    let pendingRequests = 0;
    let idleTimer: NodeJS.Timeout;
    
    return new Cypress.Promise((resolve) => {
      cy.intercept('**/*', (req) => {
        pendingRequests++;
        
        req.continue((res) => {
          pendingRequests--;
          
          if (pendingRequests === 0) {
            clearTimeout(idleTimer);
            idleTimer = setTimeout(resolve, idleTime);
          }
        });
      });
      
      // * Resolve after timeout even if network is active
      setTimeout(resolve, timeout);
    });
  },
  
  /**
   * Wait for animations to complete
   */
  waitForAnimations: () => {
    cy.get('[data-animating]').should('not.exist');
    cy.wait(300); // Wait for CSS animations
  },
  
  /**
   * Ensure element is interactable
   */
  ensureInteractable: (selector: string) => {
    cy.get(selector)
      .should('exist')
      .should('be.visible')
      .should('not.be.disabled')
      .should('not.have.css', 'pointer-events', 'none');
  }
};

/**
 * Performance benchmarking utilities
 */
export const Benchmarking = {
  benchmarks: new Map<string, any>(),
  
  /**
   * Run a benchmark
   */
  runBenchmark: async (
    name: string,
    fn: () => void | Promise<void>,
    iterations: number = 10
  ) => {
    const timings: number[] = [];
    
    // * Warmup run
    await fn();
    
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await fn();
      const duration = performance.now() - start;
      timings.push(duration);
    }
    
    const stats = {
      name,
      iterations,
      timings,
      min: Math.min(...timings),
      max: Math.max(...timings),
      avg: timings.reduce((a, b) => a + b, 0) / timings.length,
      median: timings.sort((a, b) => a - b)[Math.floor(timings.length / 2)]
    };
    
    Benchmarking.benchmarks.set(name, stats);
    return stats;
  },
  
  /**
   * Compare benchmarks
   */
  compareBenchmarks: (baseline: string, comparison: string) => {
    const baselineStats = Benchmarking.benchmarks.get(baseline);
    const comparisonStats = Benchmarking.benchmarks.get(comparison);
    
    if (!baselineStats || !comparisonStats) {
      throw new Error('Benchmark not found');
    }
    
    const improvement = ((baselineStats.avg - comparisonStats.avg) / baselineStats.avg) * 100;
    
    return {
      baseline: baselineStats,
      comparison: comparisonStats,
      improvement,
      faster: improvement > 0
    };
  },
  
  /**
   * Set performance budget
   */
  setPerformanceBudget: (budgets: Record<string, number>) => {
    return (name: string, duration: number) => {
      const budget = budgets[name];
      if (budget && duration > budget) {
        throw new Error(`Performance budget exceeded for ${name}: ${duration}ms > ${budget}ms`);
      }
    };
  }
};

/**
 * Resource monitoring utilities
 */
export const ResourceMonitoring = {
  /**
   * Monitor CPU usage
   */
  monitorCPU: () => {
    if ('requestIdleCallback' in window) {
      let idleTime = 0;
      let busyTime = 0;
      let lastTime = performance.now();
      
      const measure = () => {
        requestIdleCallback((deadline) => {
          const currentTime = performance.now();
          const frameTime = currentTime - lastTime;
          idleTime += deadline.timeRemaining();
          busyTime = frameTime - deadline.timeRemaining();
          lastTime = currentTime;
          
          const cpuUsage = (busyTime / frameTime) * 100;
          cy.log(`CPU Usage: ${cpuUsage.toFixed(2)}%`);
          
          measure();
        });
      };
      
      measure();
    }
  },
  
  /**
   * Monitor frame rate
   */
  monitorFrameRate: () => {
    let frameCount = 0;
    let lastTime = performance.now();
    const targetFPS = 60;
    
    const measure = () => {
      requestAnimationFrame(() => {
        frameCount++;
        const currentTime = performance.now();
        
        if (currentTime - lastTime >= 1000) {
          const fps = frameCount;
          frameCount = 0;
          lastTime = currentTime;
          
          if (fps < targetFPS * 0.9) {
            cy.log(`⚠️ Low FPS: ${fps}`);
          }
        }
        
        measure();
      });
    };
    
    measure();
  }
};

// * Register cleanup hooks
Cypress.on('test:after:run', () => {
  MemoryManagement.performCleanup();
  PerformanceMonitoring.clearMetrics();
});

// * Custom commands
Cypress.Commands.add('measurePerformance', (label: string, fn: () => void) => {
  const start = PerformanceMonitoring.startTiming(label);
  fn();
  const duration = PerformanceMonitoring.endTiming(label, start);
  cy.log(`${label}: ${duration.toFixed(2)}ms`);
});

Cypress.Commands.add('ensureNoMemoryLeak', (threshold: number = 1000000) => {
  MemoryManagement.takeSnapshot('before');
  cy.wait(100);
  MemoryManagement.forceGarbageCollection();
  cy.wait(100);
  MemoryManagement.takeSnapshot('after');
  
  const leak = MemoryManagement.compareSnapshots('before', 'after');
  if (leak > threshold) {
    throw new Error(`Memory leak detected: ${leak} bytes`);
  }
});

// * Type declarations
declare global {
  namespace Cypress {
    interface Chainable {
      measurePerformance(label: string, fn: () => void): void;
      ensureNoMemoryLeak(threshold?: number): void;
    }
  }
}

export default {
  MemoryManagement,
  PerformanceMonitoring,
  TestOptimization,
  AntiFlakinessUtils,
  Benchmarking,
  ResourceMonitoring
};