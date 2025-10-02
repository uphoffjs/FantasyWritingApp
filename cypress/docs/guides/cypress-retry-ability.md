# Retry-ability

## Understanding Cypress Retry-ability

Cypress has built-in retry logic that automatically retries commands and assertions until they pass or timeout. This makes tests more reliable by handling timing issues and asynchronous operations gracefully.

### How Retry-ability Works

```javascript
describe('Understanding Retry-ability', () => {
  it('demonstrates automatic retry behavior', () => {
    cy.visit('/stories');

    // * This command will retry until the element exists or timeout (4 seconds default)
    cy.get('[data-cy="story-list"]').should('be.visible'); // Assertion will retry until it passes

    // ? This entire chain retries as a unit
    cy.get('[data-cy="story-item"]')
      .should('have.length.greaterThan', 0) // Retries until stories load
      .first()
      .should('contain', 'Story'); // Retries until text appears

    // ! Commands that change state don't retry
    cy.get('[data-cy="create-story-button"]').click(); // Only runs once

    // But subsequent assertions do retry
    cy.get('[data-cy="story-form"]').should('be.visible'); // Retries until form appears
  });

  it("shows what retries and what doesn't", () => {
    // ✅ These commands/assertions RETRY:
    cy.get('[data-cy="element"]'); // Retries finding element
    cy.contains('text'); // Retries finding text
    cy.should('be.visible'); // Retries assertion
    cy.should('have.text', 'expected'); // Retries text comparison
    cy.should('have.length', 3); // Retries count check
    cy.url().should('include', '/stories'); // Retries URL check

    // ❌ These commands DON'T retry (action commands):
    cy.click(); // Clicks once
    cy.type('text'); // Types once
    cy.select('option'); // Selects once
    cy.submit(); // Submits once
    cy.visit('/page'); // Visits once
  });
});
```

### Retry Timing and Configuration

```javascript
describe('Retry Timing Configuration', () => {
  it('uses default timeouts', () => {
    // * Default command timeout is 4 seconds
    cy.get('[data-cy="slow-loading-element"]').should('be.visible'); // Will retry for 4 seconds

    // * Default assertion timeout is also 4 seconds
    cy.get('[data-cy="story-title"]').should('contain', 'Expected Title'); // Retries for 4 seconds
  });

  it('customizes timeout for specific commands', () => {
    // * Extend timeout for slow operations
    cy.get('[data-cy="large-story-list"]', { timeout: 10000 }).should(
      'be.visible',
    ); // Will retry for 10 seconds

    // ? Short timeout for quick failures
    cy.get('[data-cy="should-not-exist"]', { timeout: 1000 }).should(
      'not.exist',
    ); // Fails quickly if element appears
  });

  it('customizes timeout for assertions', () => {
    cy.get('[data-cy="story-content"]').should('contain', 'Loaded content', {
      timeout: 8000,
    }); // 8 second timeout

    // * Multiple assertions with custom timeout
    cy.get('[data-cy="story-stats"]').within({ timeout: 6000 }, () => {
      cy.get('[data-cy="word-count"]').should('be.visible');
      cy.get('[data-cy="character-count"]').should('be.visible');
    });
  });

  it('handles different timeout scenarios', () => {
    // ? Fast operation - short timeout
    cy.get('[data-cy="cached-data"]', { timeout: 2000 }).should('be.visible');

    // * API call - medium timeout
    cy.get('[data-cy="api-data"]', { timeout: 8000 }).should(
      'contain',
      'API Response',
    );

    // ! File upload - long timeout
    cy.get('[data-cy="upload-progress"]', { timeout: 30000 }).should(
      'contain',
      'Upload complete',
    );
  });
});
```

## Working with Asynchronous Operations

### API Calls and Network Requests

```javascript
describe('Asynchronous API Operations', () => {
  beforeEach(() => {
    cy.visit('/stories');
  });

  it('waits for API calls to complete', () => {
    // * Set up intercept to monitor API calls
    cy.intercept('GET', '/api/stories').as('getStories');
    cy.intercept('POST', '/api/stories').as('createStory');

    // Trigger API call
    cy.get('[data-cy="refresh-button"]').click();

    // ? Wait for specific API call
    cy.wait('@getStories').then(interception => {
      expect(interception.response.statusCode).to.equal(200);
    });

    // ! Assertions retry until API response is reflected in UI
    cy.get('[data-cy="story-list"]')
      .should('be.visible')
      .and('not.contain', 'Loading...');

    cy.get('[data-cy="story-item"]').should('have.length.greaterThan', 0); // Retries until stories appear
  });

  it('handles slow API responses', () => {
    // * Simulate slow API response
    cy.intercept('GET', '/api/stories', {
      delay: 2000, // 2 second delay
      fixture: 'stories.json',
    }).as('getSlowStories');

    cy.get('[data-cy="load-stories-button"]').click();

    // Show loading state immediately
    cy.get('[data-cy="loading-spinner"]').should('be.visible');

    // Wait for API call
    cy.wait('@getSlowStories');

    // ? Assertions retry until UI updates
    cy.get('[data-cy="loading-spinner"]').should('not.exist');
    cy.get('[data-cy="story-list"]').should('be.visible');
  });

  it('handles API errors with retry', () => {
    // * Simulate API error, then success
    let callCount = 0;
    cy.intercept('GET', '/api/stories', req => {
      callCount++;
      if (callCount === 1) {
        req.reply({ statusCode: 500, body: { error: 'Server error' } });
      } else {
        req.reply({ fixture: 'stories.json' });
      }
    }).as('getStoriesWithRetry');

    cy.get('[data-cy="load-stories-button"]').click();

    // ? First attempt shows error
    cy.get('[data-cy="error-message"]').should('be.visible');

    // Retry button click
    cy.get('[data-cy="retry-button"]').click();

    // ! Second attempt succeeds - assertions retry until success
    cy.get('[data-cy="error-message"]').should('not.exist');
    cy.get('[data-cy="story-list"]').should('be.visible');
  });
});
```

### Dynamic Content Loading

```javascript
describe('Dynamic Content Loading', () => {
  it('waits for lazy-loaded content', () => {
    cy.visit('/stories');

    // * Scroll to trigger lazy loading
    cy.get('[data-cy="story-list"]').scrollTo('bottom');

    // ? Assertions retry until new content loads
    cy.get('[data-cy="story-item"]').should('have.length.greaterThan', 10); // More items after scroll

    cy.get('[data-cy="load-more-indicator"]').should('not.exist'); // Loading indicator disappears
  });

  it('handles progressive content loading', () => {
    cy.visit('/story/large-content');

    // * Content loads in phases
    cy.get('[data-cy="story-metadata"]').should('be.visible'); // Phase 1: Metadata loads first

    cy.get('[data-cy="story-content"]')
      .should('be.visible') // Phase 2: Content loads
      .and('not.be.empty');

    cy.get('[data-cy="story-images"]').should('be.visible'); // Phase 3: Images load last

    // ? All images should eventually load
    cy.get('[data-cy="story-images"] img').each($img => {
      cy.wrap($img)
        .should('have.attr', 'src')
        .and('not.be.empty')
        .then($el => {
          // ! Wait for image to actually load
          expect($el[0].complete).to.be.true;
          expect($el[0].naturalWidth).to.be.greaterThan(0);
        });
    });
  });

  it('waits for real-time updates', () => {
    cy.visit('/story/collaborative');

    // * Simulate collaborative editing
    cy.window().then(win => {
      // Simulate incoming update
      setTimeout(() => {
        win.postMessage(
          {
            type: 'COLLABORATIVE_UPDATE',
            data: { content: 'Updated by another user' },
          },
          '*',
        );
      }, 1000);
    });

    // ? Assertion retries until real-time update appears
    cy.get('[data-cy="story-content"]').should(
      'contain',
      'Updated by another user',
    );

    cy.get('[data-cy="collaboration-indicator"]')
      .should('be.visible')
      .and('contain', 'Recently updated');
  });
});
```

## Handling Flaky Tests

### Common Flakiness Patterns

```javascript
describe('Preventing Flaky Tests', () => {
  it('waits for animations to complete', () => {
    cy.visit('/stories');

    // * Wait for page animations to finish
    cy.get('[data-cy="main-content"]')
      .should('be.visible')
      .and('have.class', 'animation-complete'); // App sets this class when ready

    // ❌ DON'T: Use arbitrary waits
    // cy.wait(1000)  // Bad - timing dependent

    // ✅ DO: Wait for specific conditions
    cy.get('[data-cy="story-card"]')
      .should('have.css', 'opacity', '1') // Animation complete
      .first()
      .click();

    // ? Wait for navigation animation
    cy.get('[data-cy="story-details"]')
      .should('be.visible')
      .and('not.have.class', 'transitioning');
  });

  it('handles race conditions properly', () => {
    cy.visit('/stories');

    // * Set up intercepts to control timing
    cy.intercept('GET', '/api/stories', { fixture: 'stories.json' }).as(
      'getStories',
    );
    cy.intercept('GET', '/api/user', { fixture: 'user.json' }).as('getUser');

    // ? Wait for both APIs to complete
    cy.wait(['@getStories', '@getUser']);

    // Now safe to make assertions
    cy.get('[data-cy="user-name"]').should('contain', 'Test User');
    cy.get('[data-cy="story-list"]').should('be.visible');

    // ! Avoid race conditions in actions
    cy.get('[data-cy="create-story-button"]')
      .should('be.enabled') // Wait for button to be enabled
      .click();
  });

  it('handles timing-dependent operations', () => {
    cy.visit('/stories/new');

    // * Auto-save functionality testing
    cy.get('[data-cy="story-title-input"]').type('My Story Title');

    // ? Wait for auto-save to trigger
    cy.get('[data-cy="auto-save-indicator"]')
      .should('be.visible')
      .and('contain', 'Saving...');

    // ! Wait for save to complete
    cy.get('[data-cy="auto-save-indicator"]')
      .should('contain', 'Saved')
      .and('not.contain', 'Saving...');

    // Verify save was successful
    cy.reload();
    cy.get('[data-cy="story-title-input"]').should(
      'have.value',
      'My Story Title',
    );
  });
});
```

### Retry Strategies for Complex Scenarios

```javascript
describe('Advanced Retry Strategies', () => {
  it('retries custom conditions', () => {
    cy.visit('/stories');

    // * Custom retry logic for complex conditions
    function waitForStoryCountToStabilize() {
      let previousCount = 0;
      let stableCount = 0;

      cy.get('[data-cy="story-item"]').then($elements => {
        const currentCount = $elements.length;

        if (currentCount === previousCount) {
          stableCount++;
        } else {
          stableCount = 0;
          previousCount = currentCount;
        }

        // ? Retry until count is stable for 3 checks
        if (stableCount < 3) {
          cy.wait(100);
          waitForStoryCountToStabilize();
        }
      });
    }

    // Trigger dynamic loading
    cy.get('[data-cy="load-all-stories"]').click();

    // Wait for stable state
    waitForStoryCountToStabilize();

    // Now safe to assert final count
    cy.get('[data-cy="story-item"]').should('have.length.greaterThan', 0);
  });

  it('handles eventual consistency', () => {
    // * Testing eventual consistency scenarios
    cy.intercept('POST', '/api/stories').as('createStory');
    cy.intercept('GET', '/api/stories').as('getStories');

    cy.visit('/stories');

    // Create a story
    cy.get('[data-cy="create-story-button"]').click();
    cy.get('[data-cy="title-input"]').type('New Story');
    cy.get('[data-cy="save-button"]').click();

    cy.wait('@createStory');

    // ? Navigate back to list - might not immediately show new story
    cy.get('[data-cy="back-to-list"]').click();

    // ! Retry until eventual consistency kicks in
    cy.get('[data-cy="story-item"]')
      .should('contain', 'New Story') // Retries until new story appears
      .and('have.length.greaterThan', 0);
  });

  it('handles multi-step async workflows', () => {
    cy.visit('/stories/new');

    // * Complex multi-step workflow
    cy.get('[data-cy="title-input"]').type('Async Story');
    cy.get('[data-cy="save-draft-button"]').click();

    // ? Wait for each step
    cy.get('[data-cy="save-status"]').should('contain', 'Draft saved');

    // Add content
    cy.get('[data-cy="content-editor"]').type('Story content here');

    // Trigger auto-save
    cy.get('[data-cy="content-editor"]').blur();

    // ! Wait for auto-save chain to complete
    cy.get('[data-cy="word-count"]')
      .should('not.contain', 'Calculating...')
      .and('contain', '3 words');

    cy.get('[data-cy="last-saved"]').should('contain', 'Just now');

    // Publish workflow
    cy.get('[data-cy="publish-button"]').click();
    cy.get('[data-cy="confirm-publish"]').click();

    // ? Multi-step publishing process
    cy.get('[data-cy="publish-status"]')
      .should('contain', 'Validating...')
      .then(() => {
        cy.get('[data-cy="publish-status"]').should('contain', 'Processing...');
      })
      .then(() => {
        cy.get('[data-cy="publish-status"]').should('contain', 'Published');
      });
  });
});
```

## Network Conditions and Timing

### Slow Network Simulation

```javascript
describe('Network Condition Testing', () => {
  it('handles slow network conditions', () => {
    // * Simulate slow network
    cy.intercept('GET', '/api/stories', {
      delay: 5000, // 5 second delay
      fixture: 'stories.json',
    }).as('getSlowStories');

    cy.visit('/stories');

    // ? Should show loading state
    cy.get('[data-cy="loading-spinner"]').should('be.visible');

    // Should still show loading after reasonable time
    cy.wait(2000);
    cy.get('[data-cy="loading-spinner"]').should('be.visible');

    // ! Eventually loads with extended timeout
    cy.wait('@getSlowStories', { timeout: 10000 });

    cy.get('[data-cy="loading-spinner"]').should('not.exist');

    cy.get('[data-cy="story-list"]').should('be.visible');
  });

  it('handles network failures and recovery', () => {
    // * Simulate network failure then recovery
    let requestCount = 0;

    cy.intercept('GET', '/api/stories', req => {
      requestCount++;
      if (requestCount <= 2) {
        // First two requests fail
        req.reply({ statusCode: 503, body: { error: 'Service unavailable' } });
      } else {
        // Third request succeeds
        req.reply({ fixture: 'stories.json' });
      }
    }).as('getStoriesWithFailure');

    cy.visit('/stories');

    // ? Should show error state
    cy.get('[data-cy="error-message"]')
      .should('be.visible')
      .and('contain', 'Failed to load');

    // Retry automatically or manually
    cy.get('[data-cy="retry-button"]').click();

    // ? Still fails on second attempt
    cy.get('[data-cy="error-message"]').should('be.visible');

    // Third retry succeeds
    cy.get('[data-cy="retry-button"]').click();

    // ! Eventually succeeds
    cy.get('[data-cy="error-message"]').should('not.exist');

    cy.get('[data-cy="story-list"]').should('be.visible');
  });

  it('tests offline/online scenarios', () => {
    cy.visit('/stories');

    // * Simulate going offline
    cy.window().then(win => {
      win.navigator.onLine = false;
      win.dispatchEvent(new Event('offline'));
    });

    // ? Should show offline indicator
    cy.get('[data-cy="offline-indicator"]')
      .should('be.visible')
      .and('contain', 'You are offline');

    // Try to create story while offline
    cy.get('[data-cy="create-story-button"]').click();
    cy.get('[data-cy="title-input"]').type('Offline Story');
    cy.get('[data-cy="save-button"]').click();

    // ? Should queue for later
    cy.get('[data-cy="queued-message"]')
      .should('be.visible')
      .and('contain', 'Will save when online');

    // ! Simulate coming back online
    cy.window().then(win => {
      win.navigator.onLine = true;
      win.dispatchEvent(new Event('online'));
    });

    // ? Should auto-sync
    cy.get('[data-cy="sync-indicator"]')
      .should('be.visible')
      .and('contain', 'Syncing...');

    cy.get('[data-cy="sync-indicator"]').should('contain', 'Synced');

    cy.get('[data-cy="offline-indicator"]').should('not.exist');
  });
});
```

### Timeout Management

```javascript
describe('Timeout Management Strategies', () => {
  it('uses progressive timeout strategies', () => {
    cy.visit('/stories');

    // * Quick operations - short timeout
    cy.get('[data-cy="navigation-menu"]', { timeout: 2000 }).should(
      'be.visible',
    );

    // * Medium operations - standard timeout (4s default)
    cy.get('[data-cy="story-list"]').should('be.visible');

    // * Slow operations - extended timeout
    cy.get('[data-cy="large-story-content"]', { timeout: 15000 })
      .should('be.visible')
      .and('not.be.empty');

    // ! Very slow operations - maximum timeout
    cy.get('[data-cy="ai-generated-content"]', { timeout: 30000 }).should(
      'contain',
      'Generated content',
    );
  });

  it('handles timeout escalation', () => {
    cy.visit('/stories/heavy-processing');

    function waitForProcessingWithEscalation() {
      // * Start with short timeout
      cy.get('[data-cy="processing-status"]', { timeout: 5000 })
        .should('be.visible')
        .then($el => {
          const status = $el.text();

          if (status.includes('Complete')) {
            return; // Done
          } else if (status.includes('In Progress')) {
            // ? Escalate timeout
            cy.get('[data-cy="processing-status"]', { timeout: 15000 }).should(
              'contain',
              'Complete',
            );
          } else {
            // ! Maximum escalation
            cy.get('[data-cy="processing-status"]', { timeout: 30000 }).should(
              'contain',
              'Complete',
            );
          }
        });
    }

    cy.get('[data-cy="start-processing"]').click();
    waitForProcessingWithEscalation();
  });

  it('uses conditional timeouts based on system state', () => {
    cy.visit('/stories');

    // * Check system performance first
    cy.window().then(win => {
      const connectionType = win.navigator.connection?.effectiveType;
      const isSlowConnection = ['slow-2g', '2g', '3g'].includes(connectionType);

      const timeout = isSlowConnection ? 15000 : 8000;

      // ? Adjust timeout based on connection
      cy.get('[data-cy="network-dependent-content"]', { timeout }).should(
        'be.visible',
      );
    });

    // Check if system is under load
    cy.window().then(win => {
      if (win.performance.memory?.usedJSHeapSize > 50 * 1024 * 1024) {
        // ! High memory usage - use longer timeout
        cy.get('[data-cy="memory-intensive-content"]', {
          timeout: 20000,
        }).should('be.visible');
      } else {
        cy.get('[data-cy="memory-intensive-content"]', {
          timeout: 8000,
        }).should('be.visible');
      }
    });
  });
});
```

This comprehensive guide covers all aspects of Cypress retry-ability, helping you write more reliable tests that handle timing issues and asynchronous operations gracefully.
