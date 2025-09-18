/// <reference types="cypress" />
import React, { useState } from 'react';
import { TextInput } from '../../src/components/TextInput';
import {
  MemoryManagement,
  PerformanceMonitoring,
  TestOptimization,
  Benchmarking,
  ResourceMonitoring
} from '../support/performance-utils';
import {
  TestConfig,
  setupPerformanceHooks,
  OptimizedHelpers,
  BenchmarkHelpers
} from '../support/test-optimization-config';

describe('TextInput - Performance & Memory', () => {
  // Set up performance hooks for all tests
  setupPerformanceHooks();

  describe('Memory Management', () => {
    it('should not leak memory on mount/unmount cycles', () => {
      const MountUnmountTest = () => {
        const [mounted, setMounted] = useState(true);
        
        return (
          <div>
            <button 
              data-testid="toggle-mount"
              onClick={() => setMounted(!mounted)}
            >
              Toggle
            </button>
            {mounted && <TextInput data-testid="test-input" />}
          </div>
        );
      };

      cy.mount(<MountUnmountTest />);
      
      // Take initial snapshot
      MemoryManagement.takeSnapshot('initial');
      
      // Perform multiple mount/unmount cycles
      for (let i = 0; i < 10; i++) {
        cy.get('[data-testid="toggle-mount"]').click();
        cy.wait(50);
        cy.get('[data-testid="toggle-mount"]').click();
        cy.wait(50);
      }
      
      // Force garbage collection and take final snapshot
      MemoryManagement.forceGarbageCollection();
      cy.wait(100);
      MemoryManagement.takeSnapshot('final');
      
      // Check for memory leaks
      const leak = MemoryManagement.compareSnapshots('initial', 'final');
      expect(leak).to.be.lessThan(TestConfig.memoryThresholds.leak);
    });

    it('should clean up event listeners properly', () => {
      cy.mount(<TextInput data-testid="test-input" />);
      
      // Add multiple event listeners
      cy.get('[data-testid="test-input"]').then($input => {
        const element = $input[0];
        let listenerCount = 0;
        
        // Track event listeners
        const originalAddEventListener = element.addEventListener;
        element.addEventListener = function(...args) {
          listenerCount++;
          return originalAddEventListener.apply(this, args);
        };
        
        // Simulate heavy interaction
        for (let i = 0; i < 20; i++) {
          cy.get('[data-testid="test-input"]')
            .focus()
            .type('test')
            .blur();
        }
        
        // Unmount and check cleanup
        cy.mount(<div>Empty</div>);
        
        // Verify listeners were removed (count should be 0 or very low)
        expect(listenerCount).to.be.lessThan(5);
      });
    });

    it('should handle large text without memory issues', () => {
      const largeText = 'a'.repeat(10000);
      
      MemoryManagement.takeSnapshot('before-large-text');
      
      cy.mount(<TextInput data-testid="test-input" maxLength={10000} />);
      cy.get('[data-testid="test-input"]').type(largeText, { delay: 0 });
      
      MemoryManagement.takeSnapshot('after-large-text');
      
      const memoryIncrease = MemoryManagement.compareSnapshots(
        'before-large-text',
        'after-large-text'
      );
      
      // Memory increase should be reasonable for 10KB of text
      expect(memoryIncrease).to.be.lessThan(TestConfig.memoryThresholds.warning);
    });
  });

  describe('Performance Benchmarks', () => {
    it('should mount within performance budget', () => {
      const start = PerformanceMonitoring.startTiming('mount');
      
      OptimizedHelpers.mountWithPerformance(
        <TextInput data-testid="test-input" />
      );
      
      const duration = PerformanceMonitoring.endTiming('mount', start);
      
      expect(duration).to.be.lessThan(TestConfig.performanceBudgets.componentMount);
    });

    it('should render updates within performance budget', () => {
      const ControlledInput = () => {
        const [value, setValue] = useState('');
        return (
          <TextInput
            data-testid="test-input"
            value={value}
            onChange={(e: any) => setValue(e.target.value)}
          />
        );
      };

      cy.mount(<ControlledInput />);
      
      const start = PerformanceMonitoring.startTiming('render-updates');
      
      // Type rapidly to trigger multiple renders
      cy.get('[data-testid="test-input"]').type('Performance test text', { delay: 0 });
      
      const duration = PerformanceMonitoring.endTiming('render-updates', start);
      const averageRenderTime = duration / 20; // Approximate number of renders
      
      expect(averageRenderTime).to.be.lessThan(TestConfig.performanceBudgets.componentRender);
    });

    it('should handle rapid interactions efficiently', () => {
      cy.mount(<TextInput data-testid="test-input" />);
      
      const start = PerformanceMonitoring.startTiming('rapid-interaction');
      
      // Simulate rapid user input
      for (let i = 0; i < 50; i++) {
        cy.get('[data-testid="test-input"]')
          .type('a', { delay: 0 })
          .type('{backspace}', { delay: 0 });
      }
      
      const duration = PerformanceMonitoring.endTiming('rapid-interaction', start);
      const averageInteractionTime = duration / 100;
      
      expect(averageInteractionTime).to.be.lessThan(
        TestConfig.performanceBudgets.interaction / 10
      );
    });
  });

  describe('Benchmark Comparisons', () => {
    it('should benchmark different input sizes', () => {
      BenchmarkHelpers.benchmarkRender(
        'Small Input',
        () => <TextInput data-testid="small" placeholder="Small" />,
        5
      );
      
      BenchmarkHelpers.benchmarkRender(
        'Large Input with Validation',
        () => (
          <TextInput
            data-testid="large"
            placeholder="Large"
            maxLength={1000}
            pattern="[A-Za-z0-9]*"
            required
          />
        ),
        5
      );
      
      // Compare the performance
      cy.wrap(null).then(() => {
        const stats = PerformanceMonitoring.getStatistics('mount');
        cy.log(`Mount Performance - Avg: ${stats.avg.toFixed(2)}ms, P95: ${stats.p95.toFixed(2)}ms`);
      });
    });

    it('should compare controlled vs uncontrolled performance', async () => {
      const results = await BenchmarkHelpers.comparePerformance([
        {
          name: 'Uncontrolled',
          fn: () => {
            cy.mount(<TextInput data-testid="uncontrolled" />);
            cy.get('[data-testid="uncontrolled"]').type('test');
          }
        },
        {
          name: 'Controlled',
          fn: () => {
            const ControlledWrapper = () => {
              const [value, setValue] = useState('');
              return (
                <TextInput
                  data-testid="controlled"
                  value={value}
                  onChange={(e: any) => setValue(e.target.value)}
                />
              );
            };
            cy.mount(<ControlledWrapper />);
            cy.get('[data-testid="controlled"]').type('test');
          }
        }
      ], 5);
      
      // Results are logged automatically by comparePerformance
      expect(results).to.have.property('Uncontrolled');
      expect(results).to.have.property('Controlled');
    });
  });

  describe('Resource Monitoring', () => {
    it('should not cause frame drops during input', () => {
      cy.mount(<TextInput data-testid="test-input" />);
      
      // Monitor frame rate during interaction
      if ('requestAnimationFrame' in window) {
        let frameCount = 0;
        const startTime = performance.now();
        
        const measureFrames = () => {
          frameCount++;
          if (performance.now() - startTime < 1000) {
            requestAnimationFrame(measureFrames);
          }
        };
        
        requestAnimationFrame(measureFrames);
        
        // Type while monitoring frames
        cy.get('[data-testid="test-input"]').type('Frame rate test input text');
        
        cy.wait(1000).then(() => {
          // Should maintain close to 60 FPS
          expect(frameCount).to.be.greaterThan(50);
        });
      }
    });

    it('should optimize batch operations', () => {
      const MultiInputTest = () => {
        const [values, setValues] = useState(Array(10).fill(''));
        
        return (
          <div>
            {values.map((value, index) => (
              <TextInput
                key={index}
                data-testid={`input-${index}`}
                value={value}
                onChange={(e: any) => {
                  const newValues = [...values];
                  newValues[index] = e.target.value;
                  setValues(newValues);
                }}
              />
            ))}
          </div>
        );
      };

      const start = PerformanceMonitoring.startTiming('batch-mount');
      
      cy.mount(<MultiInputTest />);
      
      const mountDuration = PerformanceMonitoring.endTiming('batch-mount', start);
      
      // Batch mounting should be efficient
      const averagePerInput = mountDuration / 10;
      expect(averagePerInput).to.be.lessThan(TestConfig.performanceBudgets.componentMount);
      
      // Test batch updates
      const updateStart = PerformanceMonitoring.startTiming('batch-update');
      
      TestOptimization.batchDOMOperations([
        () => cy.get('[data-testid="input-0"]').type('a'),
        () => cy.get('[data-testid="input-1"]').type('b'),
        () => cy.get('[data-testid="input-2"]').type('c'),
      ]);
      
      const updateDuration = PerformanceMonitoring.endTiming('batch-update', updateStart);
      
      expect(updateDuration).to.be.lessThan(TestConfig.performanceBudgets.interaction * 3);
    });
  });

  describe('Anti-Flakiness Validation', () => {
    it('should handle debounced input reliably', () => {
      const DebouncedInput = () => {
        const [value, setValue] = useState('');
        const [debouncedValue, setDebouncedValue] = useState('');
        
        React.useEffect(() => {
          const timer = setTimeout(() => {
            setDebouncedValue(value);
          }, 300);
          
          return () => clearTimeout(timer);
        }, [value]);
        
        return (
          <div>
            <TextInput
              data-testid="debounced-input"
              value={value}
              onChange={(e: any) => setValue(e.target.value)}
            />
            <div data-testid="debounced-output">{debouncedValue}</div>
          </div>
        );
      };

      cy.mount(<DebouncedInput />);
      
      // Use optimized helper for stable interaction
      OptimizedHelpers.interactWithRetry('debounced-input', 'type', 'test');
      
      // Wait for debounce with stable state
      OptimizedHelpers.waitForStableState();
      
      cy.get('[data-testid="debounced-output"]').should('have.text', 'test');
    });

    it('should handle throttled input reliably', () => {
      const ThrottledInput = () => {
        const [value, setValue] = useState('');
        const [updateCount, setUpdateCount] = useState(0);
        const throttledUpdate = TestOptimization.throttle((val: string) => {
          setValue(val);
          setUpdateCount(c => c + 1);
        }, 100);
        
        return (
          <div>
            <TextInput
              data-testid="throttled-input"
              onChange={(e: any) => throttledUpdate(e.target.value)}
            />
            <div data-testid="update-count">{updateCount}</div>
          </div>
        );
      };

      cy.mount(<ThrottledInput />);
      
      // Type rapidly
      for (let i = 0; i < 10; i++) {
        cy.get('[data-testid="throttled-input"]').type('a', { delay: 10 });
      }
      
      cy.wait(500);
      
      // Updates should be throttled (less than 10)
      cy.get('[data-testid="update-count"]').then($el => {
        const count = parseInt($el.text());
        expect(count).to.be.lessThan(10);
        expect(count).to.be.greaterThan(0);
      });
    });
  });

  describe('Performance Report', () => {
    after(() => {
      // Generate comprehensive performance report
      cy.wrap(null).then(() => {
        cy.log('=== Performance Test Summary ===');
        
        // Memory statistics
        const memorySnapshots = Array.from(MemoryManagement.memorySnapshots.entries());
        if (memorySnapshots.length > 0) {
          cy.log('Memory Usage:');
          memorySnapshots.forEach(([label, bytes]) => {
            cy.log(`  ${label}: ${(bytes / 1000000).toFixed(2)}MB`);
          });
        }
        
        // Timing statistics
        const timingLabels = ['mount', 'render-updates', 'interaction'];
        timingLabels.forEach(label => {
          const stats = PerformanceMonitoring.getStatistics(label);
          if (stats.count > 0) {
            cy.log(`${label} Performance:`);
            cy.log(`  Avg: ${stats.avg.toFixed(2)}ms`);
            cy.log(`  P95: ${stats.p95.toFixed(2)}ms`);
          }
        });
        
        // Benchmark results
        const benchmarks = Array.from(Benchmarking.benchmarks.entries());
        if (benchmarks.length > 0) {
          cy.log('Benchmark Results:');
          benchmarks.forEach(([name, stats]) => {
            cy.log(`  ${name}: ${stats.avg.toFixed(2)}ms`);
          });
        }
      });
    });
  });
});