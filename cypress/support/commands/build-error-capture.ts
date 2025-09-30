/**
 * Build Error Capture Commands for Cypress
 * Specialized commands for detecting and reporting build/compilation errors
 */

interface BuildErrorInfo {
  type: 'build' | 'runtime' | 'network' | 'console';
  message: string;
  details?: any;
  timestamp: string;
  url?: string;
  stack?: string;
}

/**
 * Enhanced comprehensive debug that captures build errors
 * Call this BEFORE cy.visit() to ensure all error handlers are installed
 */
Cypress.Commands.add('comprehensiveDebugWithBuildCapture', () => {
  const errors: BuildErrorInfo[] = [];

  // 1. Install error handlers before page load
  cy.on('uncaught:exception', (err, runnable) => {
    errors.push({
      type: 'runtime',
      message: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString(),
    });
    cy.task('log', `[BUILD CAPTURE - UNCAUGHT] ${err.message}`);
    return false; // Prevent test failure to continue capturing
  });

  // 2. Intercept all network requests to detect build errors
  cy.intercept('**/*', req => {
    req.continue(res => {
      // Check JavaScript/TypeScript files for errors
      const isJsFile = req.url.match(/\.(js|ts|jsx|tsx)(\?|$)/);

      if (res.statusCode >= 400 || (isJsFile && res.body)) {
        // Parse response for error patterns
        const bodyStr = res.body ? String(res.body).substring(0, 2000) : '';

        const errorPatterns = [
          {
            pattern: /Cannot find package ['"]([^'"]+)['"]/,
            type: 'Missing Package',
          },
          {
            pattern: /Cannot find module ['"]([^'"]+)['"]/,
            type: 'Missing Module',
          },
          { pattern: /\[plugin:([^\]]+)\]/, type: 'Plugin Error' },
          {
            pattern: /Failed to resolve import ['"]([^'"]+)['"]/,
            type: 'Import Error',
          },
          {
            pattern: /(SyntaxError|TypeError|ReferenceError): (.+)/,
            type: 'JS Error',
          },
          { pattern: /Build failed/, type: 'Build Failure' },
          { pattern: /Transform failed/, type: 'Transform Error' },
          { pattern: /Unexpected token/, type: 'Parse Error' },
        ];

        for (const { pattern, type } of errorPatterns) {
          const match = bodyStr.match(pattern);
          if (match) {
            const error: BuildErrorInfo = {
              type: 'build',
              message: `${type}: ${match[0]}`,
              details: {
                url: req.url,
                statusCode: res.statusCode,
                matched: match[1] || match[0],
                fullError: bodyStr.substring(0, 500),
              },
              timestamp: new Date().toISOString(),
            };
            errors.push(error);
            cy.task('log', `[BUILD ERROR DETECTED] ${error.message}`);

            // Store for later retrieval
            cy.window().then(win => {
              (win as any).__cypressBuildErrors = errors;
            });
            break;
          }
        }
      }

      // Also check HTML responses for error messages
      if (
        res.headers &&
        res.headers['content-type']?.includes('text/html') &&
        res.body
      ) {
        const htmlStr = String(res.body);
        if (
          htmlStr.includes('Cannot find package') ||
          htmlStr.includes('Failed to resolve') ||
          htmlStr.includes('Build failed')
        ) {
          errors.push({
            type: 'build',
            message: 'Build error in HTML response',
            details: {
              url: req.url,
              content: htmlStr.substring(0, 500),
            },
            timestamp: new Date().toISOString(),
          });
          cy.task('log', '[BUILD ERROR IN HTML] Error page detected');
        }
      }
    });
  });

  // 3. Set up window error handlers
  cy.on('window:before:load', win => {
    // Capture all console errors immediately
    const originalError = win.console.error;
    win.console.error = function (...args: any[]) {
      const message = args
        .map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a)))
        .join(' ');

      errors.push({
        type: 'console',
        message: message,
        timestamp: new Date().toISOString(),
      });
      cy.task('log', `[CONSOLE ERROR] ${message}`);
      originalError.apply(win.console, args);
    };

    // Capture window error events
    win.addEventListener('error', evt => {
      errors.push({
        type: 'runtime',
        message: evt.message,
        details: {
          filename: evt.filename,
          lineno: evt.lineno,
          colno: evt.colno,
        },
        timestamp: new Date().toISOString(),
      });
      cy.task(
        'log',
        `[WINDOW ERROR] ${evt.message} at ${evt.filename}:${evt.lineno}`,
      );
    });

    // Capture unhandled promise rejections
    win.addEventListener('unhandledrejection', evt => {
      errors.push({
        type: 'runtime',
        message: `Unhandled Promise Rejection: ${evt.reason}`,
        timestamp: new Date().toISOString(),
      });
      cy.task('log', `[PROMISE REJECTION] ${evt.reason}`);
    });

    // Store errors on window for retrieval
    (win as any).__cypressCapturedErrors = errors;
  });

  cy.task('log', '[BUILD CAPTURE] Error capture initialized');
});

/**
 * Check if the page has build errors
 * Returns the errors if found, null otherwise
 */
Cypress.Commands.add('checkForBuildErrors', () => {
  return cy.window().then(win => {
    // Check stored errors
    const capturedErrors = (win as any).__cypressCapturedErrors || [];
    const buildErrors = (win as any).__cypressBuildErrors || [];
    const allErrors = [...capturedErrors, ...buildErrors];

    // Also check DOM for error messages
    const bodyText = win.document.body.innerText;
    const domErrorPatterns = [
      'Cannot find package',
      'Cannot find module',
      'Failed to resolve',
      'Build failed',
      'plugin:vite',
      'Transform failed',
      'Compilation failed',
    ];

    let domError: string | null = null;
    for (const pattern of domErrorPatterns) {
      if (bodyText.includes(pattern)) {
        domError = pattern;
        break;
      }
    }

    if (domError) {
      allErrors.push({
        type: 'build',
        message: `DOM contains error: ${domError}`,
        details: {
          bodySnippet: bodyText.substring(0, 500),
        },
        timestamp: new Date().toISOString(),
      });
    }

    if (allErrors.length > 0) {
      cy.task('log', `[BUILD CHECK] Found ${allErrors.length} errors`);
      return allErrors;
    }

    return null;
  });
});

/**
 * Assert that no build errors occurred
 * Fails the test with detailed error information if errors are found
 */
Cypress.Commands.add('assertNoBuildErrors', () => {
  cy.checkForBuildErrors().then(errors => {
    if (errors && errors.length > 0) {
      // Create detailed error report
      const errorReport = errors
        .map(
          (err: BuildErrorInfo, index: number) =>
            `Error ${index + 1} (${err.type}):\n  ${err.message}\n  ${
              err.details ? JSON.stringify(err.details, null, 2) : ''
            }`,
        )
        .join('\n\n');

      cy.task('log', `[BUILD ERRORS REPORT]\n${errorReport}`);

      // Take screenshot
      cy.screenshot('build-errors-detected');

      // Fail with comprehensive message
      throw new Error(`Build errors detected:\n${errorReport}`);
    }
  });
});

/**
 * Wait for app to load or detect build error
 * Useful for detecting errors that appear after initial page load
 */
Cypress.Commands.add('waitForAppOrError', (timeout = 10000) => {
  const startTime = Date.now();

  const checkApp = () => {
    return cy.window({ log: false }).then(win => {
      const bodyText = win.document.body.innerText;

      // Check for build errors
      if (
        bodyText.includes('Cannot find package') ||
        bodyText.includes('Build failed') ||
        bodyText.includes('plugin:vite')
      ) {
        throw new Error(`Build error detected: ${bodyText.substring(0, 200)}`);
      }

      // Check for app loaded (adjust selector as needed)
      const appLoaded = win.document.querySelector('[data-cy], [data-testid]');

      if (appLoaded) {
        cy.task('log', '[APP LOADED] Application loaded successfully');
        return true;
      }

      if (Date.now() - startTime > timeout) {
        throw new Error('Timeout waiting for app to load');
      }

      // Retry after a short delay
      cy.wait(500, { log: false });
      return checkApp();
    });
  };

  return checkApp();
});

/**
 * Export build error report to file
 */
Cypress.Commands.add('exportBuildErrors', (filename?: string) => {
  cy.window().then(win => {
    const errors = (win as any).__cypressCapturedErrors || [];
    const buildErrors = (win as any).__cypressBuildErrors || [];

    const report = {
      test: Cypress.currentTest.title,
      timestamp: new Date().toISOString(),
      url: win.location.href,
      errors: [...errors, ...buildErrors],
      dom: {
        title: win.document.title,
        bodySnippet: win.document.body.innerText.substring(0, 1000),
      },
      console: (win as any).__cypressLogs || [],
    };

    const fname = filename || `build-errors-${Date.now()}.json`;
    cy.writeFile(`cypress/reports/${fname}`, report);
    cy.task('log', `[ERROR EXPORT] Build errors exported to ${fname}`);
  });
});

// Extend Cypress chainable interface
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /**
       * Enhanced debug with build error capture
       * Call before cy.visit()
       */
      comprehensiveDebugWithBuildCapture(): Chainable<void>;

      /**
       * Check if build errors are present
       * @returns Array of errors or null
       */
      checkForBuildErrors(): Chainable<BuildErrorInfo[] | null>;

      /**
       * Assert no build errors occurred
       * Fails test if errors found
       */
      assertNoBuildErrors(): Chainable<void>;

      /**
       * Wait for app to load or detect build error
       * @param timeout - Max wait time in ms
       */
      waitForAppOrError(timeout?: number): Chainable<boolean>;

      /**
       * Export build errors to file
       * @param filename - Optional filename
       */
      exportBuildErrors(filename?: string): Chainable<void>;
    }
  }
}

export {};
