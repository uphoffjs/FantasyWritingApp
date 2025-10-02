# Cypress Debug Utilities Guide

## 🔍 Overview

Comprehensive debugging is **MANDATORY** for all Cypress tests in FantasyWritingApp. This guide covers the debugging utilities, patterns, and strategies that ensure test failures are quickly diagnosed and resolved.

## 🚨 Core Philosophy

**"Every test failure should leave a complete forensic trail"**

When tests fail, especially in CI/CD environments, we need:

1. Complete error context and stack traces
2. Application state at failure time
3. Network request/response logs
4. Console output and warnings
5. Visual evidence (screenshots)
6. Performance metrics

## 📊 Debug Architecture

```
Test Execution
    ↓
Comprehensive Debug Setup (beforeEach)
    ↓
Test Runs → Monitors: [Console, Network, State, Performance]
    ↓
Failure Detected
    ↓
Capture Debug Artifacts → Save to cypress/debug-logs/
    ↓
Generate Failure Report
```

## 🛠️ Core Debug Commands

### 1. `cy.comprehensiveDebug()` - MANDATORY

**This command MUST be called in every test file's beforeEach hook.**

```javascript
// cypress/support/commands/debug/comprehensiveDebug.js
Cypress.Commands.add('comprehensiveDebug', () => {
  const testContext = {
    title: Cypress.currentTest.title,
    spec: Cypress.spec.name,
    timestamp: Date.now(),
    viewport: {
      width: Cypress.config('viewportWidth'),
      height: Cypress.config('viewportHeight'),
    },
  };

  // * Initialize debug collectors
  const debugData = {
    errors: [],
    warnings: [],
    logs: [],
    networkErrors: [],
    performanceMetrics: [],
    stateSnapshots: [],
  };

  // ! Capture uncaught exceptions
  Cypress.on('uncaught:exception', (err, runnable) => {
    debugData.errors.push({
      timestamp: new Date().toISOString(),
      message: err.message,
      stack: err.stack,
      source: runnable.title || 'unknown',
      phase: 'execution',
    });

    // * Log immediately for visibility
    console.error(`🚨 UNCAUGHT EXCEPTION: ${err.message}`);

    // ? Don't fail test on uncaught exceptions during setup
    return false;
  });

  // ! Monitor network failures
  cy.intercept('**', req => {
    const requestStart = Date.now();

    req.on('response', res => {
      const requestDuration = Date.now() - requestStart;

      // * Log performance metrics
      debugData.performanceMetrics.push({
        url: req.url,
        method: req.method,
        duration: requestDuration,
        statusCode: res.statusCode,
      });

      // * Capture network errors
      if (res.statusCode >= 400) {
        debugData.networkErrors.push({
          timestamp: new Date().toISOString(),
          url: req.url,
          method: req.method,
          statusCode: res.statusCode,
          statusMessage: res.statusMessage,
          requestBody: req.body,
          responseBody: res.body,
          headers: res.headers,
          duration: requestDuration,
        });

        console.error(
          `🌐 NETWORK ERROR: ${req.method} ${req.url} - ${res.statusCode}`,
        );
      }
    });

    req.on('error', error => {
      debugData.networkErrors.push({
        timestamp: new Date().toISOString(),
        url: req.url,
        method: req.method,
        error: error.message,
        phase: 'network-failure',
      });
    });
  });

  // ! Capture console output
  cy.window().then(win => {
    // * Console.error
    const originalError = win.console.error;
    win.console.error = (...args) => {
      debugData.errors.push({
        timestamp: new Date().toISOString(),
        type: 'console.error',
        message: args
          .map(arg =>
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg),
          )
          .join(' '),
        phase: 'runtime',
      });

      console.error(`❌ CONSOLE ERROR: ${args.join(' ')}`);
      originalError.apply(win.console, args);
    };

    // * Console.warn
    const originalWarn = win.console.warn;
    win.console.warn = (...args) => {
      debugData.warnings.push({
        timestamp: new Date().toISOString(),
        type: 'console.warn',
        message: args
          .map(arg =>
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg),
          )
          .join(' '),
      });

      console.warn(`⚠️ CONSOLE WARNING: ${args.join(' ')}`);
      originalWarn.apply(win.console, args);
    };

    // * Console.log
    const originalLog = win.console.log;
    win.console.log = (...args) => {
      debugData.logs.push({
        timestamp: new Date().toISOString(),
        type: 'console.log',
        message: args
          .map(arg =>
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg),
          )
          .join(' '),
      });

      originalLog.apply(win.console, args);
    };
  });

  // ! Set up failure handler
  cy.on('fail', err => {
    // * Capture current state
    cy.window().then(win => {
      debugData.stateSnapshots.push({
        timestamp: new Date().toISOString(),
        url: win.location.href,
        localStorage: Object.entries(win.localStorage).reduce(
          (acc, [key, value]) => {
            acc[key] = value;
            return acc;
          },
          {},
        ),
        sessionStorage: Object.entries(win.sessionStorage).reduce(
          (acc, [key, value]) => {
            acc[key] = value;
            return acc;
          },
          {},
        ),
        viewport: {
          width: win.innerWidth,
          height: win.innerHeight,
        },
      });
    });

    // * Prepare comprehensive debug report
    const debugReport = {
      testContext,
      failureError: {
        name: err.name,
        message: err.message,
        stack: err.stack,
        codeFrame: err.codeFrame,
      },
      debugData,
      summary: {
        totalErrors: debugData.errors.length,
        totalWarnings: debugData.warnings.length,
        totalNetworkErrors: debugData.networkErrors.length,
        totalLogs: debugData.logs.length,
        averageNetworkLatency:
          debugData.performanceMetrics.length > 0
            ? debugData.performanceMetrics.reduce(
                (sum, m) => sum + m.duration,
                0,
              ) / debugData.performanceMetrics.length
            : 0,
      },
      timestamp: new Date().toISOString(),
    };

    // * Save debug report
    const filename = `debug-${testContext.spec.replace(/[^a-z0-9]/gi, '-')}-${
      testContext.timestamp
    }.json`;
    cy.writeFile(`cypress/debug-logs/${filename}`, debugReport, { log: false });

    // * Save human-readable summary
    const summaryFilename = `summary-${testContext.spec.replace(
      /[^a-z0-9]/gi,
      '-',
    )}-${testContext.timestamp}.txt`;
    const summaryContent = generateHumanReadableSummary(debugReport);
    cy.writeFile(`cypress/debug-logs/${summaryFilename}`, summaryContent, {
      log: false,
    });

    // * Take failure screenshot
    cy.screenshot(
      `failure-${testContext.title.replace(/[^a-z0-9]/gi, '-')}-${
        testContext.timestamp
      }`,
      {
        capture: 'fullPage',
      },
    );

    // Re-throw to maintain test failure
    throw err;
  });

  // * Store debug data for access during test
  cy.wrap(debugData).as('debugData');
});

function generateHumanReadableSummary(report) {
  return `
=================================================================
CYPRESS TEST FAILURE REPORT
=================================================================
Test: ${report.testContext.title}
Spec: ${report.testContext.spec}
Time: ${report.timestamp}
Viewport: ${report.testContext.viewport.width}x${
    report.testContext.viewport.height
  }

=================================================================
FAILURE ERROR
=================================================================
${report.failureError.name}: ${report.failureError.message}

Stack Trace:
${report.failureError.stack}

=================================================================
SUMMARY
=================================================================
• Total Errors: ${report.summary.totalErrors}
• Total Warnings: ${report.summary.totalWarnings}
• Network Errors: ${report.summary.totalNetworkErrors}
• Console Logs: ${report.summary.totalLogs}
• Avg Network Latency: ${report.summary.averageNetworkLatency}ms

=================================================================
ERRORS (Last 10)
=================================================================
${report.debugData.errors
  .slice(-10)
  .map(e => `[${e.timestamp}] ${e.type || 'error'}: ${e.message}`)
  .join('\n')}

=================================================================
NETWORK ERRORS
=================================================================
${report.debugData.networkErrors
  .map(
    e =>
      `[${e.timestamp}] ${e.method} ${e.url} - ${e.statusCode} ${
        e.statusMessage || ''
      }`,
  )
  .join('\n')}

=================================================================
PERFORMANCE METRICS (Slowest 10)
=================================================================
${report.debugData.performanceMetrics
  .sort((a, b) => b.duration - a.duration)
  .slice(0, 10)
  .map(m => `${m.method} ${m.url} - ${m.duration}ms`)
  .join('\n')}

=================================================================
STATE SNAPSHOT
=================================================================
URL: ${report.debugData.stateSnapshots[0]?.url || 'N/A'}
LocalStorage Keys: ${Object.keys(
    report.debugData.stateSnapshots[0]?.localStorage || {},
  ).join(', ')}
SessionStorage Keys: ${Object.keys(
    report.debugData.stateSnapshots[0]?.sessionStorage || {},
  ).join(', ')}

=================================================================
`;
}
```

### 2. `cy.captureFailureDebug()`

Additional debug capture for the afterEach hook:

```javascript
Cypress.Commands.add('captureFailureDebug', () => {
  // * Capture DOM snapshot
  cy.document().then(doc => {
    const htmlSnapshot = doc.documentElement.outerHTML;
    const timestamp = Date.now();

    cy.writeFile(
      `cypress/debug-logs/dom-snapshot-${timestamp}.html`,
      htmlSnapshot,
      { log: false },
    );
  });

  // * Capture React Native/Zustand store state
  cy.window().then(win => {
    const storeState = {};

    // * Extract Zustand store data
    Object.keys(win.localStorage).forEach(key => {
      if (key.includes('fantasy') || key.includes('store')) {
        try {
          storeState[key] = JSON.parse(win.localStorage.getItem(key));
        } catch (e) {
          storeState[key] = win.localStorage.getItem(key);
        }
      }
    });

    const timestamp = Date.now();
    cy.writeFile(
      `cypress/debug-logs/store-state-${timestamp}.json`,
      storeState,
      { log: false },
    );
  });

  // * Take viewport screenshot
  cy.screenshot('failure-viewport', {
    capture: 'viewport',
    overwrite: true,
  });

  // * Take full page screenshot
  cy.screenshot('failure-fullpage', {
    capture: 'fullPage',
    overwrite: true,
  });
});
```

### 3. `cy.logDebugInfo()`

Log structured debug information during tests:

```javascript
Cypress.Commands.add('logDebugInfo', (label, data) => {
  const timestamp = new Date().toISOString();

  // * Console log for immediate visibility
  console.log(`🔍 DEBUG [${timestamp}] ${label}:`, data);

  // * Also capture in Cypress log
  cy.log(`**DEBUG: ${label}**`, data);

  // * Store in debug data if available
  cy.get('@debugData', { log: false }).then(debugData => {
    debugData.logs.push({
      timestamp,
      label,
      data: typeof data === 'object' ? JSON.stringify(data, null, 2) : data,
    });
  });
});
```

## 📁 Debug Output Structure

```
cypress/debug-logs/
├── debug-[spec]-[timestamp].json          # Complete debug data
├── summary-[spec]-[timestamp].txt         # Human-readable summary
├── dom-snapshot-[timestamp].html          # DOM at failure time
├── store-state-[timestamp].json          # Application state
├── screenshots/
│   ├── failure-[test]-[timestamp].png    # Failure screenshot
│   ├── failure-viewport.png              # Viewport capture
│   └── failure-fullpage.png              # Full page capture
└── network-logs/
    └── [timestamp]-requests.har          # HAR file of network traffic
```

## 🎯 Debug Strategies

### Strategy 1: Progressive Debug Enhancement

```javascript
describe('Element Management', () => {
  beforeEach(() => {
    // ! Level 1: Basic debug
    cy.comprehensiveDebug();

    // * Level 2: Enhanced logging for complex tests
    if (Cypress.env('DEBUG_VERBOSE')) {
      cy.on('command:start', command => {
        cy.logDebugInfo('Command Start', {
          name: command.get('name'),
          args: command.get('args'),
        });
      });
    }

    // * Level 3: Performance monitoring
    if (Cypress.env('DEBUG_PERFORMANCE')) {
      cy.window().then(win => {
        win.performance.mark('test-start');
      });
    }
  });

  afterEach(function () {
    // * Capture performance metrics
    if (Cypress.env('DEBUG_PERFORMANCE')) {
      cy.window().then(win => {
        win.performance.mark('test-end');
        win.performance.measure('test-duration', 'test-start', 'test-end');
        const measure = win.performance.getEntriesByType('measure')[0];
        cy.logDebugInfo('Test Performance', {
          duration: measure.duration,
          testName: this.currentTest.title,
        });
      });
    }

    // ! Capture failure debug
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
});
```

### Strategy 2: Interactive Debugging

```javascript
// Enable pause points for debugging
Cypress.Commands.add('debugPause', message => {
  if (Cypress.env('DEBUG_INTERACTIVE')) {
    cy.log(`⏸️ DEBUG PAUSE: ${message}`);
    cy.pause();
  }
});

// Usage in tests
it('should create element', () => {
  cy.get('[data-cy="create-button"]').click();

  cy.debugPause('Check form state before filling');

  cy.get('[data-cy="name-input"]').type('Test Element');

  cy.debugPause('Verify input value');

  cy.get('[data-cy="save-button"]').click();
});
```

### Strategy 3: Network Debug Mode

```javascript
// Enhanced network debugging
Cypress.Commands.add('debugNetwork', () => {
  const requests = [];

  cy.intercept('**', req => {
    const requestData = {
      timestamp: Date.now(),
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
    };

    requests.push(requestData);

    req.on('response', res => {
      requestData.response = {
        statusCode: res.statusCode,
        headers: res.headers,
        body: res.body,
        duration: Date.now() - requestData.timestamp,
      };

      // * Log slow requests
      if (requestData.response.duration > 1000) {
        cy.logDebugInfo('Slow Request', requestData);
      }

      // * Log failed requests
      if (res.statusCode >= 400) {
        cy.logDebugInfo('Failed Request', requestData);
      }
    });
  });

  // * Save network log on test end
  cy.on('test:after:run', () => {
    cy.writeFile(`cypress/debug-logs/network-${Date.now()}.json`, requests, {
      log: false,
    });
  });
});
```

## 🔍 Debugging React Native Specific Issues

### 1. AsyncStorage/LocalStorage Debugging

```javascript
Cypress.Commands.add('debugStorage', () => {
  cy.window().then(win => {
    const storage = {
      localStorage: {},
      sessionStorage: {},
      asyncStorage: {}, // React Native Web uses localStorage
    };

    // * Extract all storage
    Object.keys(win.localStorage).forEach(key => {
      storage.localStorage[key] = win.localStorage.getItem(key);

      // * Parse JSON values
      try {
        storage.localStorage[key] = JSON.parse(storage.localStorage[key]);
      } catch (e) {
        // Keep as string if not JSON
      }
    });

    // * Log storage state
    cy.logDebugInfo('Storage State', storage);

    return storage;
  });
});
```

### 2. React Native Component Tree Debugging

```javascript
Cypress.Commands.add('debugComponentTree', () => {
  cy.window().then(win => {
    // * Find React fiber root
    const rootElement = win.document.querySelector('#root');
    const reactFiber = rootElement._reactRootContainer;

    if (reactFiber) {
      const componentTree = extractComponentTree(reactFiber);
      cy.logDebugInfo('React Component Tree', componentTree);
    }
  });
});

function extractComponentTree(fiber, depth = 0, maxDepth = 5) {
  if (!fiber || depth > maxDepth) return null;

  const tree = {
    type: fiber.type?.name || fiber.type || 'Unknown',
    props: fiber.memoizedProps,
    state: fiber.memoizedState,
    children: [],
  };

  let child = fiber.child;
  while (child) {
    tree.children.push(extractComponentTree(child, depth + 1, maxDepth));
    child = child.sibling;
  }

  return tree;
}
```

### 3. Touch Event Debugging

```javascript
Cypress.Commands.add('debugTouch', selector => {
  cy.get(selector).then($el => {
    const element = $el[0];

    // * Log touch event listeners
    const listeners = getEventListeners(element);
    cy.logDebugInfo('Touch Event Listeners', {
      selector,
      listeners: {
        touchstart: listeners.touchstart?.length || 0,
        touchmove: listeners.touchmove?.length || 0,
        touchend: listeners.touchend?.length || 0,
        touchcancel: listeners.touchcancel?.length || 0,
      },
    });

    // * Simulate and log touch events
    const events = [];

    ['touchstart', 'touchmove', 'touchend'].forEach(eventType => {
      element.addEventListener(eventType, e => {
        events.push({
          type: eventType,
          timestamp: Date.now(),
          touches: Array.from(e.touches).map(t => ({
            x: t.clientX,
            y: t.clientY,
          })),
        });
      });
    });

    // * Trigger touch sequence
    cy.wrap($el)
      .trigger('touchstart', { touches: [{ clientX: 100, clientY: 100 }] })
      .trigger('touchmove', { touches: [{ clientX: 150, clientY: 150 }] })
      .trigger('touchend');

    cy.logDebugInfo('Touch Events Captured', events);
  });
});
```

## 🛑 Debug Environment Variables

Control debug behavior with environment variables:

```javascript
// cypress.config.js
module.exports = {
  e2e: {
    env: {
      DEBUG_VERBOSE: false,        // Extra logging
      DEBUG_PERFORMANCE: false,    // Performance metrics
      DEBUG_INTERACTIVE: false,    // Pause points
      DEBUG_NETWORK: true,         // Network logging
      DEBUG_SCREENSHOTS: true,     // Always take screenshots
      DEBUG_STATE: true,          // Capture state snapshots
      DEBUG_MAX_LOGS: 1000        // Max debug logs to keep
    }
  }
};

// Override via CLI
npm run cypress:run -- --env DEBUG_VERBOSE=true,DEBUG_INTERACTIVE=true
```

## 📋 Debug Checklist

### Before Writing Tests

- [ ] Import comprehensive debug command
- [ ] Set up beforeEach with `cy.comprehensiveDebug()`
- [ ] Set up afterEach with failure capture
- [ ] Configure environment variables

### During Test Development

- [ ] Add debug logging for complex operations
- [ ] Use debug pause points for verification
- [ ] Monitor network requests
- [ ] Check console for errors/warnings

### When Tests Fail

- [ ] Check `cypress/debug-logs/` for reports
- [ ] Review screenshots for visual evidence
- [ ] Analyze network errors
- [ ] Check state snapshots
- [ ] Review console output

### CI/CD Debugging

- [ ] Enable verbose logging in CI
- [ ] Archive debug-logs directory
- [ ] Save screenshots as artifacts
- [ ] Generate HTML reports
- [ ] Set up alerts for failures

## 🎨 Debug Visualization

### Generate HTML Debug Report

```javascript
// cypress/support/generateDebugReport.js
function generateHTMLReport(debugData) {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Cypress Debug Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .error { background: #ffebee; padding: 10px; margin: 10px 0; }
    .warning { background: #fff3e0; padding: 10px; margin: 10px 0; }
    .network-error { background: #e3f2fd; padding: 10px; margin: 10px 0; }
    pre { background: #f5f5f5; padding: 10px; overflow-x: auto; }
    .metric { display: inline-block; margin: 10px; padding: 10px; background: #e8f5e9; }
  </style>
</head>
<body>
  <h1>Test Failure Report</h1>
  
  <div class="metrics">
    <div class="metric">Errors: ${debugData.errors.length}</div>
    <div class="metric">Warnings: ${debugData.warnings.length}</div>
    <div class="metric">Network Errors: ${debugData.networkErrors.length}</div>
  </div>
  
  <h2>Errors</h2>
  ${debugData.errors
    .map(
      e => `
    <div class="error">
      <strong>${e.timestamp}</strong><br>
      ${e.message}<br>
      <pre>${e.stack || ''}</pre>
    </div>
  `,
    )
    .join('')}
  
  <h2>Network Errors</h2>
  ${debugData.networkErrors
    .map(
      e => `
    <div class="network-error">
      <strong>${e.method} ${e.url}</strong><br>
      Status: ${e.statusCode}<br>
      Duration: ${e.duration}ms
    </div>
  `,
    )
    .join('')}
  
  <h2>Console Logs</h2>
  <pre>${debugData.logs
    .map(l => `[${l.timestamp}] ${l.message}`)
    .join('\n')}</pre>
</body>
</html>
  `;
}
```

## 🚀 Best Practices

1. **Always use comprehensive debug** in every test file
2. **Capture state on failure** for forensic analysis
3. **Log strategic checkpoints** in complex flows
4. **Monitor performance** for slow operations
5. **Save network traffic** for API debugging
6. **Use structured logging** for easier parsing
7. **Clean up old debug logs** periodically
8. **Document debug patterns** in test files
9. **Share debug reports** with team
10. **Continuously improve** debug utilities

## 📚 Further Reading

- [Cypress Debugging Documentation](https://docs.cypress.io/guides/guides/debugging)
- [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/)
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Network HAR Specification](http://www.softwareishard.com/blog/har-12-spec/)
