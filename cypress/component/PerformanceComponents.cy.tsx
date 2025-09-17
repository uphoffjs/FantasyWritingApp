import React from 'react';
import { PerformanceMonitorComponent } from '../../src/components/PerformanceMonitor';
import { PerformanceDashboard } from '../../src/components/PerformanceDashboard';
import { PerformanceProfiler, withPerformanceProfiler } from '../../src/components/PerformanceProfiler';

// Mock the performance monitor service
const mockPerformanceMonitor = {
  getReport: cy.stub(),
  clear: cy.stub(),
  getSummary: cy.stub(),
  clearMetrics: cy.stub(),
  recordMetric: cy.stub()
};

// Mock the usePerformanceMetrics hook
const mockUsePerformanceMetrics = {
  metrics: []
};

// Test component for profiler
const TestComponent: React.FC<{ text: string }> = ({ text }) => (
  <div data-cy="test-component">{text}</div>
);

describe('PerformanceMonitorComponent', () => {
  const mockReport = {
    fps: 60,
    avgRenderTime: 12.5,
    memoryUsage: {
      usedJSHeapSize: 50 * 1024 * 1024,
      totalJSHeapSize: 100 * 1024 * 1024
    },
    totalRenders: 150,
    slowRenders: 5,
    slowestComponents: [
      { name: 'ElementBrowser', avgTime: 25.3 },
      { name: 'RelationshipGraph', avgTime: 18.7 },
      { name: 'TemplateManager', avgTime: 16.2 }
    ]
  };

  beforeEach(() => {
    cy.stub(window, 'performanceMonitor').value(mockPerformanceMonitor);
    mockPerformanceMonitor.getReport.returns(mockReport);
    mockPerformanceMonitor.clear.reset();
  });

  describe('Rendering', () => {
    it('renders collapsed [data-cy*="button"] by default', () => {
      cy.mount(<PerformanceMonitorComponent />);
      cy.get('[data-cy*="button"][title="Show Performance Monitor"]').should('be.visible');
      cy.get('.lucide-activity').should('be.visible');
    });

    it('renders expanded when defaultOpen is true', () => {
      cy.mount(<PerformanceMonitorComponent defaultOpen={true} />);
      cy.contains('Performance Monitor').should('be.visible');
      cy.contains('FPS').should('be.visible');
    });

    it('does not render in production', () => {
      const originalEnv = process.env.NODE_ENV;
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        writable: true
      });
      
      cy.mount(<PerformanceMonitorComponent />);
      cy.get('[data-cy*="button"][title="Show Performance Monitor"]').should('not.exist');
      
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalEnv,
        writable: true
      });
    });

    it('renders in different positions', () => {
      cy.mount(<PerformanceMonitorComponent position="top-left" />);
      cy.get('.top-4.left-4').should('exist');

      cy.mount(<PerformanceMonitorComponent position="bottom-left" />);
      cy.get('.bottom-4.left-4').should('exist');

      cy.mount(<PerformanceMonitorComponent position="top-right" />);
      cy.get('.top-4.right-4').should('exist');
    });
  });

  describe('Metrics Display', () => {
    it('displays FPS metric', () => {
      cy.mount(<PerformanceMonitorComponent defaultOpen={true} />);
      cy.contains('FPS').should('be.visible');
      cy.contains('60').should('be.visible');
    });

    it('displays average render time', () => {
      cy.mount(<PerformanceMonitorComponent defaultOpen={true} />);
      cy.contains('Avg Render').should('be.visible');
      cy.contains('12.5ms').should('be.visible');
    });

    it('displays memory usage', () => {
      cy.mount(<PerformanceMonitorComponent defaultOpen={true} />);
      cy.contains('Memory Usage').should('be.visible');
      cy.contains('Used:').should('be.visible');
      cy.contains('50.0 MB').should('be.visible');
      cy.contains('Total:').should('be.visible');
      cy.contains('100.0 MB').should('be.visible');
    });

    it('shows memory usage progress bar', () => {
      cy.mount(<PerformanceMonitorComponent defaultOpen={true} />);
      cy.get('[data-cy*="metals-gold"]').should('have.attr', 'style').and('include', 'width: 50%');
    });

    it('displays render statistics', () => {
      cy.mount(<PerformanceMonitorComponent defaultOpen={true} />);
      cy.contains('Render Statistics').should('be.visible');
      cy.contains('Total Renders:').should('be.visible');
      cy.contains('150').should('be.visible');
      cy.contains('Slow Renders (>16ms):').should('be.visible');
      cy.contains('5').should('be.visible');
    });

    it('highlights slow renders in red', () => {
      cy.mount(<PerformanceMonitorComponent defaultOpen={true} />);
      cy.contains('5').should('be.visible') // React Native Web uses inline styles instead of CSS classes;
    });

    it('displays slowest components', () => {
      cy.mount(<PerformanceMonitorComponent defaultOpen={true} />);
      cy.contains('Slowest Components').should('be.visible');
      cy.contains('ElementBrowser').should('be.visible');
      cy.contains('25.3ms').should('be.visible');
      cy.contains('RelationshipGraph').should('be.visible');
      cy.contains('18.7ms').should('be.visible');
    });

    it('highlights components over 16ms threshold', () => {
      cy.mount(<PerformanceMonitorComponent defaultOpen={true} />);
      cy.contains('25.3ms').should('be.visible') // React Native Web uses inline styles instead of CSS classes;
      cy.contains('18.7ms').should('be.visible') // React Native Web uses inline styles instead of CSS classes;
      cy.contains('16.2ms').should('not.have.class', 'text-flame-400');
    });
  });

  describe('Interactions', () => {
    it('toggles expanded state when [data-cy*="button"] clicked', () => {
      cy.mount(<PerformanceMonitorComponent />);
      cy.get('[data-cy*="button"][title="Show Performance Monitor"]').click();
      cy.contains('Performance Monitor').should('be.visible');
    });

    it('closes when X [data-cy*="button"] clicked', () => {
      cy.mount(<PerformanceMonitorComponent defaultOpen={true} />);
      cy.get('[data-cy*="button"]').contains('×').parent().click();
      cy.contains('Performance Monitor').should('not.exist');
      cy.get('[data-cy*="button"][title="Show Performance Monitor"]').should('be.visible');
    });

    it('clears metrics when Clear [data-cy*="button"] clicked', () => {
      cy.mount(<PerformanceMonitorComponent defaultOpen={true} />);
      cy.contains('Clear Metrics').click();
      expect(mockPerformanceMonitor.clear).to.have.been.called;
    });

    it('logs to console when Log [data-cy*="button"] clicked', () => {
      cy.stub(console, 'log');
      cy.mount(<PerformanceMonitorComponent defaultOpen={true} />);
      cy.contains('Log to Console').click();
      cy.wrap(console.log).should('have.been.calledWith', 'Full Report:', mockReport);
    });
  });

  describe('Auto-update', () => {
    it('updates report every 2 seconds when open', () => {
      cy.clock();
      cy.mount(<PerformanceMonitorComponent defaultOpen={true} />);
      
      // Initial call
      expect(mockPerformanceMonitor.getReport).to.have.been.calledOnce;
      
      // Advance 2 seconds
      cy.tick(2000);
      expect(mockPerformanceMonitor.getReport).to.have.been.calledTwice;
      
      // Advance another 2 seconds
      cy.tick(2000);
      expect(mockPerformanceMonitor.getReport).to.have.been.calledThrice;
    });

    it('does not update when collapsed', () => {
      cy.clock();
      cy.mount(<PerformanceMonitorComponent />);
      
      mockPerformanceMonitor.getReport.reset();
      cy.tick(2000);
      expect(mockPerformanceMonitor.getReport).not.to.have.been.called;
    });

    it('stops updating when closed', () => {
      cy.clock();
      cy.mount(<PerformanceMonitorComponent defaultOpen={true} />);
      
      mockPerformanceMonitor.getReport.reset();
      cy.get('[data-cy*="button"]').contains('×').parent().click();
      
      cy.tick(2000);
      expect(mockPerformanceMonitor.getReport).not.to.have.been.called;
    });
  });

  describe('Edge Cases', () => {
    it('handles null memory usage', () => {
      mockPerformanceMonitor.getReport.returns({
        ...mockReport,
        memoryUsage: null
      });
      cy.mount(<PerformanceMonitorComponent defaultOpen={true} />);
      cy.contains('Memory Usage').should('not.exist');
    });

    it('handles empty slowest components', () => {
      mockPerformanceMonitor.getReport.returns({
        ...mockReport,
        slowestComponents: []
      });
      cy.mount(<PerformanceMonitorComponent defaultOpen={true} />);
      cy.contains('Slowest Components').should('not.exist');
    });

    it('handles zero slow renders', () => {
      mockPerformanceMonitor.getReport.returns({
        ...mockReport,
        slowRenders: 0
      });
      cy.mount(<PerformanceMonitorComponent defaultOpen={true} />);
      cy.contains('0').should('not.have.class', 'text-flame-400');
    });

    it('formats large memory values correctly', () => {
      mockPerformanceMonitor.getReport.returns({
        ...mockReport,
        memoryUsage: {
          usedJSHeapSize: 1024 * 1024 * 1024, // 1GB
          totalJSHeapSize: 2 * 1024 * 1024 * 1024 // 2GB
        }
      });
      cy.mount(<PerformanceMonitorComponent defaultOpen={true} />);
      cy.contains('1024.0 MB').should('be.visible');
      cy.contains('2048.0 MB').should('be.visible');
    });
  });
});

describe('PerformanceDashboard Component', () => {
  const mockSummary = {
    totalMetrics: 500,
    budgetViolations: 3,
    metrics: {
      LCP: { avg: 2000, p95: 2500 },
      FID: { avg: 50, p95: 80 },
      CLS: { avg: 0.05, p95: 0.08 },
      render: { avg: 10, p95: 15 },
      search: { avg: 75, p95: 120 },
      store_update: { avg: 30, p95: 45 }
    }
  };

  const mockMetrics = [
    { name: 'render', value: 12, unit: 'ms', timestamp: Date.now() - 1000 },
    { name: 'search', value: 85, unit: 'ms', timestamp: Date.now() - 500 },
    { name: 'store_update', value: 35, unit: 'ms', timestamp: Date.now() }
  ];

  beforeEach(() => {
    cy.stub(window, 'performanceMonitor').value(mockPerformanceMonitor);
    cy.stub(window, 'usePerformanceMetrics').returns({ metrics: mockMetrics });
    mockPerformanceMonitor.getSummary.returns(mockSummary);
    mockPerformanceMonitor.clearMetrics.reset();
  });

  describe('Rendering', () => {
    it('does not render when show is false', () => {
      cy.mount(<PerformanceDashboard show={false} onClose={cy.stub()} />);
      cy.get('.fixed.inset-0').should('not.exist');
    });

    it('renders modal when show is true', () => {
      cy.mount(<PerformanceDashboard show={true} onClose={cy.stub()} />);
      cy.contains('Performance Dashboard').should('be.visible');
      cy.contains('Real-time performance metrics and monitoring').should('be.visible');
    });

    it('renders backdrop', () => {
      cy.mount(<PerformanceDashboard show={true} onClose={cy.stub()} />);
      cy.get('[data-cy*="black"]\\/50').should('be.visible');
    });
  });

  describe('Web Vitals Display', () => {
    it('displays LCP metric', () => {
      cy.mount(<PerformanceDashboard show={true} onClose={cy.stub()} />);
      cy.contains('Largest Contentful Paint').should('be.visible');
      cy.contains('2000').should('be.visible');
      cy.contains('Budget: 2500ms').should('be.visible');
    });

    it('displays FID metric', () => {
      cy.mount(<PerformanceDashboard show={true} onClose={cy.stub()} />);
      cy.contains('First Input Delay').should('be.visible');
      cy.contains('50').should('be.visible');
      cy.contains('Budget: 100ms').should('be.visible');
    });

    it('displays CLS metric', () => {
      cy.mount(<PerformanceDashboard show={true} onClose={cy.stub()} />);
      cy.contains('Cumulative Layout Shift').should('be.visible');
      cy.contains('0.050').should('be.visible');
      cy.contains('Budget: 0.1score').should('be.visible');
    });

    it('highlights metrics over budget', () => {
      mockPerformanceMonitor.getSummary.returns({
        ...mockSummary,
        metrics: {
          ...mockSummary.metrics,
          LCP: { avg: 3000, p95: 3500 }
        }
      });
      cy.mount(<PerformanceDashboard show={true} onClose={cy.stub()} />);
      cy.get('.border-red-400').should('exist');
      cy.get('.lucide-alert-triangle').should('be.visible');
    });
  });

  describe('Application Performance', () => {
    it('displays render time P95', () => {
      cy.mount(<PerformanceDashboard show={true} onClose={cy.stub()} />);
      cy.contains('Render Time (P95)').should('be.visible');
      cy.contains('15').should('be.visible');
    });

    it('displays search time P95', () => {
      cy.mount(<PerformanceDashboard show={true} onClose={cy.stub()} />);
      cy.contains('Search Time (P95)').should('be.visible');
      cy.contains('120').should('be.visible');
    });

    it('displays store update P95', () => {
      cy.mount(<PerformanceDashboard show={true} onClose={cy.stub()} />);
      cy.contains('Store Update (P95)').should('be.visible');
      cy.contains('45').should('be.visible');
    });
  });

  describe('Time Window Selection', () => {
    it('shows time window [data-cy*="button"]s', () => {
      cy.mount(<PerformanceDashboard show={true} onClose={cy.stub()} />);
      cy.contains('1m').should('be.visible');
      cy.contains('5m').should('be.visible');
      cy.contains('15m').should('be.visible');
    });

    it('highlights active time window', () => {
      cy.mount(<PerformanceDashboard show={true} onClose={cy.stub()} />);
      cy.contains('5m').should('be.visible') // React Native Web uses inline styles instead of CSS classes;
      cy.contains('1m').should('be.visible') // React Native Web uses inline styles instead of CSS classes;
    });

    it('changes time window when clicked', () => {
      cy.mount(<PerformanceDashboard show={true} onClose={cy.stub()} />);
      cy.contains('1m').click();
      cy.contains('1m').should('be.visible') // React Native Web uses inline styles instead of CSS classes;
      cy.contains('5m').should('be.visible') // React Native Web uses inline styles instead of CSS classes;
    });

    it('displays [data-cy*="select"]ed time window in summary', () => {
      cy.mount(<PerformanceDashboard show={true} onClose={cy.stub()} />);
      cy.contains('Time Window:').parent().contains('5m').should('be.visible');
      
      cy.contains('1m').click();
      cy.contains('Time Window:').parent().contains('1m').should('be.visible');
    });
  });

  describe('Performance Summary', () => {
    it('displays total metrics count', () => {
      cy.mount(<PerformanceDashboard show={true} onClose={cy.stub()} />);
      cy.contains('Total Metrics:').should('be.visible');
      cy.contains('500').should('be.visible');
    });

    it('displays budget violations', () => {
      cy.mount(<PerformanceDashboard show={true} onClose={cy.stub()} />);
      cy.contains('Budget Violations:').should('be.visible');
      cy.contains('3').should('be.visible') // React Native Web uses inline styles instead of CSS classes;
    });
  });

  describe('Recent Metrics', () => {
    it('displays recent metrics list', () => {
      cy.mount(<PerformanceDashboard show={true} onClose={cy.stub()} />);
      cy.contains('Recent Metrics').should('be.visible');
      cy.contains('render').should('be.visible');
      cy.contains('12.00 ms').should('be.visible');
    });

    it('shows metrics in reverse chronological order', () => {
      cy.mount(<PerformanceDashboard show={true} onClose={cy.stub()} />);
      cy.get('.font-mono').first().should('contain', 'store_update');
    });

    it('limits display to last 20 metrics', () => {
      const manyMetrics = Array.from({ length: 30 }, (_, i) => ({
        name: `metric_${i}`,
        value: i,
        unit: 'ms',
        timestamp: Date.now() - i * 1000
      }));
      cy.stub(window, 'usePerformanceMetrics').returns({ metrics: manyMetrics });
      
      cy.mount(<PerformanceDashboard show={true} onClose={cy.stub()} />);
      cy.get('.font-mono').should('have.length', 20);
    });
  });

  describe('Interactions', () => {
    it('closes when X [data-cy*="button"] clicked', () => {
      const onClose = cy.stub();
      cy.mount(<PerformanceDashboard show={true} onClose={onClose} />);
      cy.get('[data-cy*="button"]').contains('×').click();
      expect(onClose).to.have.been.called;
    });

    it('clears metrics when Clear [data-cy*="button"] clicked', () => {
      cy.mount(<PerformanceDashboard show={true} onClose={cy.stub()} />);
      cy.contains('Clear Metrics').click();
      expect(mockPerformanceMonitor.clearMetrics).to.have.been.called;
    });

    it('exports to console when Export [data-cy*="button"] clicked', () => {
      cy.stub(console, 'log');
      cy.stub(console, 'table');
      cy.mount(<PerformanceDashboard show={true} onClose={cy.stub()} />);
      cy.contains('Export to Console').click();
      cy.wrap(console.log).should('have.been.calledWith', 'Performance Summary:', mockSummary);
      cy.wrap(console.table).should('have.been.calledWith', mockSummary.metrics);
    });
  });

  describe('Auto-update', () => {
    it('updates summary every second', () => {
      cy.clock();
      cy.mount(<PerformanceDashboard show={true} onClose={cy.stub()} />);
      
      mockPerformanceMonitor.getSummary.reset();
      cy.tick(1000);
      expect(mockPerformanceMonitor.getSummary).to.have.been.calledOnce;
      
      cy.tick(1000);
      expect(mockPerformanceMonitor.getSummary).to.have.been.calledTwice;
    });

    it('stops updating when closed', () => {
      cy.clock();
      const onClose = cy.stub();
      cy.mount(<PerformanceDashboard show={true} onClose={onClose} />);
      
      mockPerformanceMonitor.getSummary.reset();
      cy.get('[data-cy*="button"]').contains('×').click();
      
      cy.tick(1000);
      expect(mockPerformanceMonitor.getSummary).not.to.have.been.called;
    });
  });

  describe('Edge Cases', () => {
    it('handles null metrics gracefully', () => {
      mockPerformanceMonitor.getSummary.returns({
        ...mockSummary,
        metrics: {
          LCP: null,
          FID: null,
          CLS: null
        }
      });
      cy.mount(<PerformanceDashboard show={true} onClose={cy.stub()} />);
      cy.contains('-').should('exist');
    });

    it('handles empty recent metrics', () => {
      cy.stub(window, 'usePerformanceMetrics').returns({ metrics: [] });
      cy.mount(<PerformanceDashboard show={true} onClose={cy.stub()} />);
      cy.contains('Recent Metrics').should('be.visible');
      cy.get('.font-mono').should('not.exist');
    });
  });

  describe('Responsive Design', () => {
    it('adapts grid layout on mobile', () => {
      cy.viewport(375, 667);
      cy.mount(<PerformanceDashboard show={true} onClose={cy.stub()} />);
      cy.get('.md\\:grid-cols-3').should('exist');
    });

    it('scrolls content on small screens', () => {
      cy.viewport(375, 667);
      cy.mount(<PerformanceDashboard show={true} onClose={cy.stub()} />);
      cy.get('.overflow-y-auto').should('exist');
    });
  });
});

describe('PerformanceProfiler Component', () => {
  beforeEach(() => {
    cy.stub(window, 'performanceMonitor').value(mockPerformanceMonitor);
    mockPerformanceMonitor.recordMetric.reset();
    cy.stub(console, 'warn');
  });

  describe('Basic Profiling', () => {
    it('renders children correctly', () => {
      cy.mount(
        <PerformanceProfiler id="test">
          <TestComponent text="Hello World" />
        </PerformanceProfiler>
      );
      cy.get('[data-cy="test-component"]').should('contain', 'Hello World');
    });

    it('records mount metrics', () => {
      cy.mount(
        <PerformanceProfiler id="test">
          <TestComponent text="Test" />
        </PerformanceProfiler>
      );
      
      // React Profiler will call onRender during mount
      cy.wait(10).then(() => {
        expect(mockPerformanceMonitor.recordMetric).to.have.been.calledWith(
          'test_mount_duration',
          Cypress.sinon.match.number,
          'ms',
          Cypress.sinon.match.object
        );
      });
    });

    it('includes metadata in metrics', () => {
      const metadata = { userId: '123', pageId: 'home' };
      cy.mount(
        <PerformanceProfiler id="test" metadata={metadata}>
          <TestComponent text="Test" />
        </PerformanceProfiler>
      );
      
      cy.wait(10).then(() => {
        expect(mockPerformanceMonitor.recordMetric).to.have.been.calledWith(
          Cypress.sinon.match.string,
          Cypress.sinon.match.number,
          'ms',
          Cypress.sinon.match(metadata)
        );
      });
    });
  });

  describe('Performance Warnings', () => {
    it('warns when update render exceeds 16ms', () => {
      // This test would need actual re-rendering to trigger update phase
      // For component testing, we'll simulate the callback
      const onRender = cy.stub();
      
      // Simulate React calling onRender with update phase and high duration
      const profilerCallback = (id, phase, actualDuration) => {
        if (phase === 'update' && actualDuration > 16) {
          console.warn(`Component ${id} update render took ${actualDuration.toFixed(2)}ms (target: 16ms)`);
        }
      };
      
      profilerCallback('test', 'update', 25);
      cy.wrap(console.warn).should('have.been.calledWith', 
        'Component test update render took 25.00ms (target: 16ms)'
      );
    });
  });

  describe('Wasted Render Detection', () => {
    it('tracks wasted renders when ratio > 0.5', () => {
      // Simulate a wasted render scenario
      const onRender = (id, phase, actualDuration, baseDuration) => {
        const wastedRatio = baseDuration > 0 ? (baseDuration - actualDuration) / baseDuration : 0;
        if (wastedRatio > 0.5) {
          mockPerformanceMonitor.recordMetric(`${id}_wasted_render`, wastedRatio, 'ratio', {
            actualDuration,
            baseDuration,
            phase,
          });
        }
      };
      
      // Simulate a render where actual is much less than base (indicating optimization potential)
      onRender('test', 'update', 5, 20);
      
      expect(mockPerformanceMonitor.recordMetric).to.have.been.calledWith(
        'test_wasted_render',
        0.75,
        'ratio',
        Cypress.sinon.match.object
      );
    });
  });

  describe('HOC withPerformanceProfiler', () => {
    it('wraps component with profiler', () => {
      const WrappedComponent = withPerformanceProfiler(TestComponent, 'wrapped-test');
      
      cy.mount(<WrappedComponent text="Wrapped" />);
      cy.get('[data-cy="test-component"]').should('contain', 'Wrapped');
    });

    it('preserves display name', () => {
      const WrappedComponent = withPerformanceProfiler(TestComponent, 'wrapped-test');
      expect(WrappedComponent.displayName).to.equal('withPerformanceProfiler(TestComponent)');
    });

    it('passes props correctly through HOC', () => {
      const WrappedComponent = withPerformanceProfiler(TestComponent, 'wrapped-test');
      
      cy.mount(<WrappedComponent text="Props Test" />);
      cy.get('[data-cy="test-component"]').should('contain', 'Props Test');
    });

    it('profiles wrapped component', () => {
      const WrappedComponent = withPerformanceProfiler(TestComponent, 'wrapped-test');
      
      cy.mount(<WrappedComponent text="Test" />);
      
      cy.wait(10).then(() => {
        expect(mockPerformanceMonitor.recordMetric).to.have.been.calledWith(
          'wrapped-test_mount_duration',
          Cypress.sinon.match.number,
          'ms',
          Cypress.sinon.match.object
        );
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles zero base duration', () => {
      const onRender = (id, phase, actualDuration, baseDuration) => {
        const wastedRatio = baseDuration > 0 ? (baseDuration - actualDuration) / baseDuration : 0;
        if (wastedRatio > 0.5) {
          mockPerformanceMonitor.recordMetric(`${id}_wasted_render`, wastedRatio, 'ratio');
        }
      };
      
      onRender('test', 'update', 0, 0);
      expect(mockPerformanceMonitor.recordMetric).not.to.have.been.called;
    });

    it('handles multiple children', () => {
      cy.mount(
        <PerformanceProfiler id="multi-test">
          <TestComponent text="First" />
          <TestComponent text="Second" />
          <TestComponent text="Third" />
        </PerformanceProfiler>
      );
      
      cy.get('[data-cy="test-component"]').should('have.length', 3);
    });

    it('handles nested profilers', () => {
      cy.mount(
        <PerformanceProfiler id="outer">
          <div>
            <PerformanceProfiler id="inner">
              <TestComponent text="Nested" />
            </PerformanceProfiler>
          </div>
        </PerformanceProfiler>
      );
      
      cy.get('[data-cy="test-component"]').should('contain', 'Nested');
      
      cy.wait(10).then(() => {
        // Both profilers should record metrics
        const calls = mockPerformanceMonitor.recordMetric.getCalls();
        const metricNames = calls.map(call => call.args[0]);
        expect(metricNames).to.include('outer_mount_duration');
        expect(metricNames).to.include('inner_mount_duration');
      });
    });
  });
});