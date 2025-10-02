# Cypress Open Mode

## Understanding Open Mode

Cypress Open Mode provides an interactive testing environment for developing, debugging, and running tests. It offers real-time feedback, powerful debugging tools, and an intuitive interface for test development.

### Opening the Test Runner

```bash
# Open E2E tests
npx cypress open
npx cypress open --e2e

# Open Component tests
npx cypress open --component

# Open with specific browser
npx cypress open --browser chrome
npx cypress open --browser firefox
npx cypress open --browser edge

# Open with configuration
npx cypress open --config baseUrl=http://localhost:3000
npx cypress open --env apiUrl=http://localhost:3001
```

### Test Runner Interface Overview

```javascript
describe('Open Mode Interface Features', () => {
  it('demonstrates the test runner capabilities', () => {
    cy.visit('/stories');

    // * The Test Runner shows:
    // - Test execution in real-time
    // - Command log on the left
    // - Application under test on the right
    // - Browser DevTools integration
    // - Screenshot/video capture

    cy.get('[data-cy="story-list"]').should('be.visible');
    // ^ This command appears in the Command Log

    cy.get('[data-cy="create-story-button"]').click();
    // ^ Click is logged with before/after snapshots

    cy.get('[data-cy="story-title-input"]').type('Interactive Test Story');
    // ^ Typing is logged with each keystroke visible

    // ? The right panel shows your app updating in real-time
    cy.get('[data-cy="story-title"]').should(
      'contain',
      'Interactive Test Story',
    );
  });
});
```

## Interactive Debugging Features

### Command Log and Time Travel

```javascript
describe('Interactive Debugging', () => {
  it('demonstrates command log features', () => {
    cy.visit('/stories');

    // * Each command creates an entry in the Command Log
    cy.get('[data-cy="story-list"]').as('storyList');
    // ^ Aliased commands show with @ symbol

    cy.get('@storyList').should('be.visible');
    // ^ Clicking this command in the log shows the element at that time

    cy.get('[data-cy="create-story-button"]').click();
    // ^ Click commands show before/after snapshots

    cy.get('[data-cy="story-form"]').within(() => {
      // ? Commands within() are grouped visually
      cy.get('[data-cy="title-input"]').type('Debug Story');
      cy.get('[data-cy="content-input"]').type('Debugging content');
      cy.get('[data-cy="save-button"]').click();
    });

    // ! Failed assertions are highlighted in red
    // cy.get('[data-cy="nonexistent"]').should('exist')
    // ^ This would show failure details in the Command Log
  });

  it('shows debugging with DOM snapshots', () => {
    cy.visit('/stories/1');

    // * Before state snapshot
    cy.get('[data-cy="story-content"]').should('be.visible');

    // Action that changes the DOM
    cy.get('[data-cy="edit-button"]').click();

    // * After state snapshot
    cy.get('[data-cy="edit-form"]').should('be.visible');

    // ? Clicking commands in the log shows DOM at that moment
    // Click "click" in the Command Log to see before/after
  });
});
```

### Browser DevTools Integration

```javascript
describe('DevTools Integration', () => {
  it('demonstrates debugging with browser tools', () => {
    cy.visit('/stories');

    // * Use debugger statement for breakpoints
    cy.get('[data-cy="story-item"]').then($stories => {
      // debugger; // Uncomment to pause execution
      console.log('Stories found:', $stories.length);

      // ? Access elements in DevTools console
      // Type $stories in console to inspect jQuery elements
    });

    cy.get('[data-cy="create-story-button"]').click();

    // * Inspect network requests in DevTools
    cy.get('[data-cy="title-input"]').type('DevTools Story');
    cy.get('[data-cy="save-button"]').click();

    // ? Check Network tab for API calls
    // ? Check Console for any errors
    // ? Use Elements tab to inspect DOM changes
  });

  it('uses cy.debug() for interactive debugging', () => {
    cy.visit('/stories');

    cy.get('[data-cy="story-list"]')
      .debug() // Pauses test and opens DevTools
      .should('be.visible');

    // ? When paused:
    // - DevTools console is open
    // - Subject is available as 'subject' variable
    // - Can inspect and manipulate in console
    // - Resume with Cypress.resume()
  });

  it('uses cy.pause() for manual testing', () => {
    cy.visit('/stories');

    cy.get('[data-cy="story-list"]').should('be.visible');

    // cy.pause() // Uncomment to pause and allow manual interaction

    // ? When paused:
    // - Can interact with app manually
    // - Test runner shows "Paused" state
    // - Resume by clicking "Resume" button
    // - Useful for exploring app state
  });
});
```

### Real-time Test Development

```javascript
describe('Real-time Test Development', () => {
  it('develops tests interactively', () => {
    cy.visit('/stories');

    // * Start with basic test structure
    cy.get('[data-cy="create-story-button"]').should('be.visible');

    // ? Add commands incrementally and see results immediately
    // Uncomment lines one by one to see immediate feedback:

    // cy.get('[data-cy="create-story-button"]').click()
    // cy.get('[data-cy="story-form"]').should('be.visible')
    // cy.get('[data-cy="title-input"]').type('Interactive Development')
    // cy.get('[data-cy="content-input"]').type('Building tests incrementally')
    // cy.get('[data-cy="save-button"]').click()
    // cy.get('[data-cy="success-message"]').should('be.visible')

    // ! Each command executes immediately when you save the file
    // The test runner automatically reruns on file changes
  });

  it('explores selectors interactively', () => {
    cy.visit('/stories');

    // * Use Selector Playground (target icon in test runner)
    // Click the target icon, then click elements in your app
    // Cypress suggests the best selector

    cy.get('[data-cy="story-list"]').should('be.visible');

    // ? Try different selectors to see what works:
    // cy.get('.story-item') // Class selector
    // cy.get('[data-testid="story"]') // Test ID
    // cy.contains('Story Title') // Text content
    // cy.get('[data-cy="story-item"]') // Recommended data-cy

    // ! Open DevTools Elements tab to inspect generated selectors
  });
});
```

## Selector Playground

### Using the Selector Playground

```javascript
describe('Selector Playground Features', () => {
  it('demonstrates selector discovery', () => {
    cy.visit('/stories');

    // * Steps to use Selector Playground:
    // 1. Click the target icon (🎯) in the test runner
    // 2. Click any element in your application
    // 3. Cypress shows the suggested selector
    // 4. Copy the selector to your test

    // ? Example selectors the playground might suggest:
    cy.get('[data-cy="story-list"]'); // Best - data-cy attribute
    // cy.get('.story-container') // OK - CSS class
    // cy.get('#story-section') // Avoid - ID selector
    // cy.contains('My Stories') // OK - text content

    cy.get('[data-cy="story-item"]').first().click();

    // * Playground helps find dynamic selectors:
    // For elements with changing IDs or classes
    // cy.get('[data-cy^="story-item-"]') // Starts with
    // cy.get('[data-cy*="story"]') // Contains
    // cy.get('[data-cy$="-item"]') // Ends with
  });

  it('refines selectors with playground feedback', () => {
    cy.visit('/stories/new');

    // * Use playground to test selector specificity

    // Too generic (might match multiple elements):
    // cy.get('input') // Matches all inputs

    // Better (more specific):
    // cy.get('input[type="text"]') // Text inputs only

    // Best (unique data attribute):
    cy.get('[data-cy="story-title-input"]')
      .should('be.visible')
      .and('have.attr', 'placeholder');

    // ? Playground shows element counts:
    // - Green: Found exactly 1 element (good)
    // - Yellow: Found multiple elements (refine selector)
    // - Red: Found 0 elements (selector doesn't work)
  });
});
```

### Advanced Selector Techniques

```javascript
describe('Advanced Selector Playground Usage', () => {
  it('discovers complex selectors', () => {
    cy.visit('/stories');

    // * For dynamic content with changing attributes
    // Playground suggests robust selectors

    // ? Example: Story cards with dynamic IDs
    cy.get('[data-cy="story-item"]')
      .filter('[data-status="published"]') // Filter by attribute
      .first()
      .within(() => {
        // Nested selections within specific context
        cy.get('[data-cy="story-title"]').should('be.visible');
        cy.get('[data-cy="publication-date"]').should('contain', '2024');
      });

    // * For form elements with validation states
    cy.get('[data-cy="title-input"]')
      .should('not.have.class', 'error') // No validation error initially
      .clear()
      .blur() // Trigger validation
      .should('have.class', 'error'); // Should show error state

    // ? Playground helps with sibling selectors
    cy.get('[data-cy="required-field"]')
      .siblings('[data-cy="error-message"]')
      .should('be.visible');
  });

  it('handles React Native Web component selectors', () => {
    cy.visit('/stories');

    // * React Native components become HTML elements on web
    // Playground shows the actual DOM structure

    // TouchableOpacity becomes <div role="button">
    cy.get('[data-cy="story-card"][role="button"]')
      .should('be.visible')
      .and('have.attr', 'role', 'button');

    // TextInput becomes <input> or <textarea>
    cy.get('[data-cy="story-content"][type="text"]').should('be.visible');

    // ? Use playground to verify React Native Web mappings:
    // - View → div
    // - Text → span or div
    // - TouchableOpacity → div with role="button"
    // - TextInput → input or textarea
    // - ScrollView → div with overflow styles
  });
});
```

## Test Runner Configuration

### Viewport and Device Testing

```javascript
describe('Viewport Testing in Open Mode', () => {
  it('tests different screen sizes', () => {
    // * Open Mode allows real-time viewport changes
    cy.viewport('iphone-x'); // Mobile viewport
    cy.visit('/stories');

    cy.get('[data-cy="mobile-menu"]').should('be.visible');
    cy.get('[data-cy="desktop-sidebar"]').should('not.be.visible');

    // ? Change viewport in real-time using test runner controls
    // or programmatically:
    cy.viewport('ipad-2'); // Tablet viewport
    cy.get('[data-cy="tablet-layout"]').should('be.visible');

    cy.viewport(1920, 1080); // Desktop viewport
    cy.get('[data-cy="desktop-sidebar"]').should('be.visible');
    cy.get('[data-cy="mobile-menu"]').should('not.be.visible');
  });

  it('simulates device characteristics', () => {
    // * Test touch vs mouse interactions
    cy.viewport('iphone-x');
    cy.visit('/stories');

    // Touch interactions on mobile
    cy.get('[data-cy="story-card"]').trigger('touchstart').trigger('touchend');

    // ? Switch to desktop for mouse interactions
    cy.viewport(1280, 720);

    // Mouse interactions on desktop
    cy.get('[data-cy="story-card"]')
      .trigger('mouseenter') // Hover effects
      .click();
  });
});
```

### Browser-Specific Testing

```javascript
describe('Browser-Specific Features', () => {
  it('tests Chrome-specific features', () => {
    // * When running in Chrome, access Chrome DevTools
    cy.visit('/stories');

    cy.window().then(win => {
      // ? Chrome-specific APIs
      if (win.chrome) {
        cy.log('Running in Chrome');
        // Test Chrome-specific features
      }

      // Check for browser-specific behavior
      const isChrome = win.navigator.userAgent.includes('Chrome');
      if (isChrome) {
        // Chrome-specific assertions
        cy.get('[data-cy="chrome-feature"]').should('be.visible');
      }
    });
  });

  it('handles browser console output', () => {
    cy.visit('/stories');

    // * Console messages appear in both:
    // - Test runner (Cypress console)
    // - Browser DevTools console

    cy.window().then(win => {
      win.console.log('Test message from application');
    });

    cy.log('Test message from Cypress');

    // ? Check for console errors
    cy.window().then(win => {
      const errors = [];
      const originalError = win.console.error;

      win.console.error = (...args) => {
        errors.push(args.join(' '));
        originalError(...args);
      };

      // Trigger action that might cause errors
      cy.get('[data-cy="error-prone-action"]').click();

      cy.then(() => {
        expect(errors).to.have.length(0); // No console errors
      });
    });
  });
});
```

## Network Monitoring and Debugging

### Real-time Network Inspection

```javascript
describe('Network Debugging in Open Mode', () => {
  it('monitors network requests', () => {
    // * Set up intercepts for visibility
    cy.intercept('GET', '/api/stories', { fixture: 'stories.json' }).as(
      'getStories',
    );
    cy.intercept('POST', '/api/stories').as('createStory');
    cy.intercept('PUT', '/api/stories/*').as('updateStory');

    cy.visit('/stories');

    // ? Network requests appear in:
    // - Cypress Command Log (with aliases)
    // - Browser DevTools Network tab
    // - Test runner shows request/response details

    cy.wait('@getStories').then(interception => {
      // Click on the network request in Command Log to see details
      cy.log('Stories loaded:', interception.response.body.length);
    });

    // Create story and monitor request
    cy.get('[data-cy="create-story-button"]').click();
    cy.get('[data-cy="title-input"]').type('Network Test Story');
    cy.get('[data-cy="save-button"]').click();

    cy.wait('@createStory').then(interception => {
      // ? Inspect full request/response in Command Log
      expect(interception.request.body).to.include({
        title: 'Network Test Story',
      });
      expect(interception.response.statusCode).to.equal(201);
    });
  });

  it('debugs network timing issues', () => {
    // * Simulate slow network for debugging
    cy.intercept('GET', '/api/stories', {
      delay: 3000, // 3 second delay
      fixture: 'stories.json',
    }).as('getSlowStories');

    cy.visit('/stories');

    // ? Watch loading states in real-time
    cy.get('[data-cy="loading-spinner"]').should('be.visible');

    // Monitor timing in Network tab
    cy.wait('@getSlowStories', { timeout: 10000 });

    cy.get('[data-cy="loading-spinner"]').should('not.exist');
    cy.get('[data-cy="story-list"]').should('be.visible');

    // ! Check DevTools Network tab for:
    // - Request timing waterfall
    // - Response time breakdown
    // - Cache behavior
  });

  it('tests offline scenarios', () => {
    cy.visit('/stories');

    // * Simulate offline in DevTools
    // Open DevTools → Network tab → Throttling → Offline

    // Or programmatically:
    cy.window().then(win => {
      win.navigator.onLine = false;
      win.dispatchEvent(new Event('offline'));
    });

    // ? Test offline behavior
    cy.get('[data-cy="offline-indicator"]').should('be.visible');

    // Try to create story while offline
    cy.get('[data-cy="create-story-button"]').click();
    cy.get('[data-cy="title-input"]').type('Offline Story');
    cy.get('[data-cy="save-button"]').click();

    // Should handle gracefully
    cy.get('[data-cy="offline-message"]').should('be.visible');
  });
});
```

## Test Development Workflow

### Hot Reloading and File Watching

```javascript
describe('Development Workflow', () => {
  it('demonstrates hot reloading', () => {
    cy.visit('/stories');

    // * Test runner automatically reruns when files change
    // Edit this test file and save - test reruns immediately

    cy.get('[data-cy="story-list"]').should('be.visible');

    // ? Modify selectors or assertions and see instant feedback
    // Change assertions to see immediate pass/fail results

    // Example: Change this assertion and save the file
    cy.get('[data-cy="page-title"]').should('contain', 'Stories');
    // ^ Try changing 'Stories' to something else
  });

  it('iterative test development', () => {
    cy.visit('/stories/new');

    // * Build tests incrementally:

    // Step 1: Verify page loads
    cy.get('[data-cy="story-form"]').should('be.visible');

    // Step 2: Add form interaction (uncomment to test)
    // cy.get('[data-cy="title-input"]').type('Iterative Story')

    // Step 3: Add save action (uncomment to test)
    // cy.get('[data-cy="save-button"]').click()

    // Step 4: Add verification (uncomment to test)
    // cy.get('[data-cy="success-message"]').should('be.visible')

    // ? Each step can be tested immediately by uncommenting
    // Build confidence incrementally
  });
});
```

### Debugging Failed Tests

```javascript
describe('Debugging Test Failures', () => {
  it('demonstrates failure analysis tools', () => {
    cy.visit('/stories');

    cy.get('[data-cy="story-list"]').should('be.visible');

    // * Intentional failure for demonstration:
    // cy.get('[data-cy="nonexistent-element"]').should('exist')
    // ^ Uncomment to see failure debugging features

    // ? When test fails in Open Mode:
    // - Command Log shows failed step in red
    // - Error message appears with details
    // - DOM snapshot shows state at failure
    // - Stack trace available in DevTools
    // - Can inspect element state at time of failure
  });

  it('debugging with screenshots and videos', () => {
    cy.visit('/stories');

    // * Open Mode captures:
    // - Screenshots on failure (automatic)
    // - Video of entire test run (optional)
    // - DOM snapshots at each step

    cy.get('[data-cy="create-story-button"]').click();

    // Force a failure to see debugging info:
    // cy.get('[data-cy="wrong-selector"]').should('exist')

    // ? After failure:
    // - Click failed command in log to see state
    // - Use browser DevTools to inspect DOM
    // - Check screenshot in Test Results panel
  });

  it('using browser debugging tools', () => {
    cy.visit('/stories');

    // * Set breakpoint with debugger statement
    cy.get('[data-cy="story-list"]').then(() => {
      // debugger; // Uncomment to pause execution
      // ? When paused:
      // - DevTools opens automatically
      // - Can inspect variables in scope
      // - Set additional breakpoints
      // - Step through code execution
    });

    // * Use cy.debug() for element inspection
    cy.get('[data-cy="story-item"]')
      // .debug() // Uncomment to inspect elements
      .should('have.length.greaterThan', 0);

    // ? cy.debug() provides:
    // - Element details in console
    // - jQuery object for manipulation
    // - DOM structure inspection
  });
});
```

### Performance Monitoring

```javascript
describe('Performance Monitoring in Open Mode', () => {
  it('monitors test execution performance', () => {
    cy.visit('/stories', {
      onBeforeLoad: win => {
        win.performance.mark('test-start');
      },
    });

    // * Monitor command execution times
    cy.get('[data-cy="story-list"]', { timeout: 5000 }).should('be.visible');

    cy.window().then(win => {
      win.performance.mark('list-loaded');
      win.performance.measure('list-load-time', 'test-start', 'list-loaded');

      const measure = win.performance.getEntriesByName('list-load-time')[0];
      cy.log(`List loaded in ${measure.duration}ms`);

      // ? Check performance in DevTools:
      // - Performance tab for detailed timing
      // - Memory tab for memory usage
      // - Lighthouse for performance audit
    });
  });

  it('identifies slow operations', () => {
    cy.visit('/stories');

    // * Use Command Log timing info
    // Each command shows execution time

    const startTime = Date.now();

    cy.get('[data-cy="large-story-list"]', { timeout: 10000 })
      .should('be.visible')
      .then(() => {
        const loadTime = Date.now() - startTime;
        cy.log(`Operation took ${loadTime}ms`);

        // ! Alert if operation is too slow
        if (loadTime > 3000) {
          cy.log('⚠️ Slow operation detected');
        }
      });

    // ? Optimize based on timing feedback:
    // - Reduce timeout for fast operations
    // - Increase timeout for known slow operations
    // - Identify performance bottlenecks
  });
});
```

This comprehensive guide covers all aspects of Cypress Open Mode, providing you with the knowledge to effectively develop, debug, and optimize your tests in the interactive testing environment.
