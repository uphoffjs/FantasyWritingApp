// * Debug and testing helper Cypress commands
// ! CRITICAL: Fixed promise chain issues - no cy.task() inside callbacks

/**
 * Comprehensive debug command - logs test information
 * Must be called at the start of each test
 */
Cypress.Commands.add('comprehensiveDebug', () => {
  const timestamp = new Date().toISOString();
  
  // * Log test start
  cy.task('log', `[${timestamp}] Test started: ${Cypress.currentTest.title}`);
  
  // * Log browser info
  cy.window().then((win) => {
    const userAgent = win.navigator.userAgent;
    const viewport = `${win.innerWidth}x${win.innerHeight}`;
    const url = win.location.href;
    
    // * Use cy.task outside the then callback
    cy.task('log', `Browser: ${userAgent}`);
    cy.task('log', `Viewport: ${viewport}`);
    cy.task('log', `URL: ${url}`);
  });
  
  // * Set up console interceptors
  cy.window().then((win) => {
    // * Extend window type to include our custom property
    const extendedWin = win as Window & { __cypressLogs?: string[] };
    
    // * Store original console methods
    const originalError = extendedWin.console.error;
    const originalWarn = extendedWin.console.warn;
    const originalLog = extendedWin.console.log;
    
    // * Override console.error
    extendedWin.console.error = function(...args: any[]) {
      const message = `[CONSOLE ERROR] ${args.map(a => 
        typeof a === 'object' ? JSON.stringify(a) : a
      ).join(' ')}`;
      // Store for later logging
      extendedWin.__cypressLogs = extendedWin.__cypressLogs || [];
      extendedWin.__cypressLogs.push(message);
      originalError.apply(extendedWin.console, args);
    };
    
    // * Override console.warn
    extendedWin.console.warn = function(...args: any[]) {
      const message = `[CONSOLE WARN] ${args.map(a => 
        typeof a === 'object' ? JSON.stringify(a) : a
      ).join(' ')}`;
      extendedWin.__cypressLogs = extendedWin.__cypressLogs || [];
      extendedWin.__cypressLogs.push(message);
      originalWarn.apply(extendedWin.console, args);
    };
    
    // * Override console.log
    extendedWin.console.log = function(...args: any[]) {
      const message = `[CONSOLE LOG] ${args.map(a => 
        typeof a === 'object' ? JSON.stringify(a) : a
      ).join(' ')}`;
      extendedWin.__cypressLogs = extendedWin.__cypressLogs || [];
      extendedWin.__cypressLogs.push(message);
      originalLog.apply(extendedWin.console, args);
    };
  });
  
  // * Set up error handler
  cy.on('fail', (error) => {
    const errorMessage = `[TEST FAILURE] ${error.message}`;
    const stackTrace = `[STACK TRACE] ${error.stack}`;
    
    // * Log error info
    cy.task('log', errorMessage);
    cy.task('log', stackTrace);
    
    // Re-throw to fail the test
    throw error;
  });
});

/**
 * Capture failure debug info with screenshots and logs
 * Fixed: No cy.task inside screenshot callback
 */
Cypress.Commands.add('captureFailureDebug', () => {
  const testName = Cypress.currentTest.title.replace(/[^a-z0-9]/gi, '-');
  const timestamp = Date.now();
  const screenshotName = `failed-${testName}-${timestamp}`;
  
  // * Take screenshot
  cy.screenshot(screenshotName, {
    capture: 'fullPage'
  });
  
  // * Log screenshot info separately
  cy.task('log', `Screenshot taken: ${screenshotName}`);
  
  // * Log current URL
  // ! Fixed: Moved cy.task outside of .then() callback
  cy.url().then((url) => {
    // Store URL for logging outside the promise
    return url;
  }).then((url) => {
    cy.task('log', `Failed at URL: ${url}`);
  });
  
  // * Log page title
  // ! Fixed: Moved cy.task outside of .then() callback
  cy.title().then((title) => {
    return title;
  }).then((title) => {
    cy.task('log', `Page title: ${title}`);
  });
  
  // * Check for error boundaries
  cy.get('body').then(($body) => {
    const errorBoundarySelectors = [
      '[data-cy="error-boundary"]',
      '[data-testid="error-boundary"]',
      '.error-boundary',
      '[class*="error"]',
      '[class*="Error"]'
    ];
    
    const errors = [];
    errorBoundarySelectors.forEach(selector => {
      const elements = $body.find(selector);
      if (elements.length) {
        elements.each((i, el) => {
          errors.push(`${selector}: ${el.textContent}`);
        });
      }
    });
    
    // ! Fixed: Store errors for logging outside the callback
    if (errors.length > 0) {
      (win as any).__cypressErrorBoundaries = errors;
    }
  });
  
  // * Log error boundaries if found
  cy.window().then((win) => {
    const errors = (win as any).__cypressErrorBoundaries;
    if (errors && errors.length > 0) {
      cy.task('log', `Error boundaries found: ${JSON.stringify(errors)}`);
    }
  });
  
  // * Log visible text
  cy.get('body').then(($body) => {
    const visibleText = $body.text().substring(0, 1000);
    // ! Fixed: Store text for logging outside the callback
    return visibleText;
  }).then((visibleText) => {
    cy.task('log', `Visible page text (first 1000 chars): ${visibleText}`);
  });
  
  // * Log testable elements
  cy.get('[data-cy], [data-testid]').then(($elements) => {
    const elements = [];
    $elements.each((i, el) => {
      if (i < 10) { // Limit to first 10
        elements.push({
          'data-cy': el.getAttribute('data-cy'),
          'data-testid': el.getAttribute('data-testid'),
          tagName: el.tagName,
          text: el.textContent?.substring(0, 50)
        });
      }
    });
    // ! Fixed: Store data for logging outside the callback
    return { count: $elements.length, elements };
  }).then((data) => {
    cy.task('log', `Found ${data.count} testable elements: ${JSON.stringify(data.elements)}`);
  });
  
  // * Check for loading indicators
  const loadingSelectors = [
    '[data-cy*="loading"]',
    '[data-cy*="spinner"]',
    '[data-testid*="loading"]',
    '[data-testid*="spinner"]',
    '.loading',
    '.spinner'
  ];
  
  cy.get('body').then(($body) => {
    const foundLoaders = [];
    loadingSelectors.forEach(selector => {
      if ($body.find(selector).length) {
        foundLoaders.push(selector);
      }
    });
    // ! Fixed: Store loaders for logging outside the callback
    if (foundLoaders.length > 0) {
      (win as any).__cypressLoadingIndicators = foundLoaders;
    }
  });
  
  // * Log loading indicators if found
  cy.window().then((win) => {
    const loaders = (win as any).__cypressLoadingIndicators;
    if (loaders && loaders.length > 0) {
      cy.task('log', `Loading indicators found: ${loaders.join(', ')}`);
    }
  });
  
  // * Log stored console messages
  cy.window().then((win) => {
    const extendedWin = win as Window & { __cypressLogs?: string[] };
    if (extendedWin.__cypressLogs && extendedWin.__cypressLogs.length > 0) {
      // ! Fixed: Return logs to log outside the callback
      return extendedWin.__cypressLogs;
    }
    return null;
  }).then((logs) => {
    if (logs) {
      logs.forEach(log => {
        cy.task('log', log);
      });
    }
  });
});

/**
 * Log a message with timestamp
 * @param message - Message to log
 */
Cypress.Commands.add('logWithTimestamp', (message: string) => {
  const timestamp = new Date().toISOString();
  cy.task('log', `[${timestamp}] ${message}`);
});

/**
 * Verify no console errors occurred
 */
Cypress.Commands.add('verifyNoConsoleErrors', () => {
  cy.window().then((win) => {
    const extendedWin = win as Window & { __cypressLogs?: string[] };
    const logs = extendedWin.__cypressLogs || [];
    const errors = logs.filter(log => log.includes('[CONSOLE ERROR]'));
    expect(errors, 'Console errors found').to.be.empty;
  });
});

// * Export empty object to prevent TS errors
export {};