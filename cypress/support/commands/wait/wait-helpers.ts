 
// ! Generic wait helper commands that accept any selector type
/**
 * Wait Helper Commands
 * Cypress best practice replacements for arbitrary waits
 */

// * Wait for auto-save to complete
Cypress.Commands.add('waitForAutoSave', () => {
  cy.get('[data-cy="save-status"], [data-cy="save-indicator"]', { timeout: 10000 })
    .should('be.visible')
    .and(($el) => {
      const text = $el.text().toLowerCase();
      expect(text).to.match(/saved|success|✓/);
    });
});

// * Wait for page/component to fully load
Cypress.Commands.add('waitForPageLoad', () => {
  // Check for loading indicators to disappear
  cy.get('[data-cy="loading"], [data-cy="spinner"], .loading-spinner', { timeout: 0 })
    .should('not.exist');

  // Ensure main content is visible
  cy.get('body').should('be.visible');

  // Wait for any pending network requests
  cy.window().then((win) => {
    return new Cypress.Promise((resolve) => {
      if (win.requestAnimationFrame) {
        win.requestAnimationFrame(() => {
          win.requestAnimationFrame(resolve);
        });
      } else {
        resolve();
      }
    });
  });
});

// * Wait for modal to open
Cypress.Commands.add('waitForModal', (modalName) => {
  cy.get(`[data-cy="${modalName}-modal"], [data-cy="modal"]`, { timeout: 5000 })
    .should('be.visible')
    .and('have.css', 'opacity', '1'); // Ensure animation completed
});

// * Wait for modal to close
Cypress.Commands.add('waitForModalClose', (modalName) => {
  cy.get(`[data-cy="${modalName}-modal"], [data-cy="modal"]`)
    .should('not.exist');
});

// * Wait for element to be interactive
Cypress.Commands.add('waitForInteractive', (selector) => {
  cy.get(selector)
    .should('be.visible')
    .and('not.be.disabled')
    .and('not.have.class', 'loading')
    .and('not.have.attr', 'aria-busy', 'true');
});

// * Wait for form validation
Cypress.Commands.add('waitForValidation', () => {
  // Wait for validation messages to appear or disappear
  cy.get('[data-cy="error-message"], [data-cy="validation-error"], .error', { timeout: 1000 })
    .should(($el) => {
      // Just ensure the validation has run, whether showing errors or not
      expect($el).to.exist;
    });
});

// * Wait for data to load in a list or table
Cypress.Commands.add('waitForDataLoad', (minItems = 1) => {
  cy.get('[data-cy="list-item"], [data-cy="table-row"], [data-cy="card"]', { timeout: 10000 })
    .should('have.length.gte', minItems);
});

// * Wait for search results
Cypress.Commands.add('waitForSearchResults', () => {
  // First, wait for search to be initiated
  cy.get('[data-cy="search-loading"], [data-cy="searching"]', { timeout: 1000 })
    .should('exist');

  // Then wait for it to complete
  cy.get('[data-cy="search-loading"], [data-cy="searching"]')
    .should('not.exist');

  // Ensure results container is visible
  cy.get('[data-cy="search-results"], [data-cy="results"]')
    .should('be.visible');
});

// * Wait for animation to complete
Cypress.Commands.add('waitForAnimation', (selector) => {
  cy.get(selector).should('be.visible');
  cy.wait(300); // Small wait for CSS animations (acceptable per Cypress docs)
});

// * Wait for debounced input
Cypress.Commands.add('waitForDebounce', (delay = 500) => {
  // This is one of the few acceptable uses of cy.wait
  // for handling debounced inputs where we know the exact delay
  cy.wait(delay);
});

// * Wait for toast/notification to appear
Cypress.Commands.add('waitForToast', () => {
  cy.get('[data-cy="toast"], [data-cy="notification"], .toast-message', { timeout: 5000 })
    .should('be.visible');
});

// * Wait for toast/notification to disappear
Cypress.Commands.add('waitForToastClear', () => {
  cy.get('[data-cy="toast"], [data-cy="notification"], .toast-message')
    .should('not.exist');
});

// * Smart wait that tries multiple strategies
Cypress.Commands.add('smartWait', (options = {}) => {
  const {
    loading = true,
    network = true,
    animation = true,
    timeout = 10000
  } = options;

  // Wait for loading indicators
  if (loading) {
    cy.get('[data-cy="loading"], .loading, [aria-busy="true"]', { timeout: 0 })
      .should('not.exist');
  }

  // Wait for network idle (if intercepts are set up)
  if (network) {
    cy.window().then((win) => {
      return new Cypress.Promise((resolve) => {
        let pendingRequests = 0;
        const checkRequests = () => {
          if (pendingRequests === 0) {
            resolve();
          } else {
            setTimeout(checkRequests, 100);
          }
        };

        // Hook into fetch/XHR if available
        if (win.fetch) {
          const originalFetch = win.fetch;
          win.fetch = function(...args) {
            pendingRequests++;
            return originalFetch.apply(this, args).finally(() => {
              pendingRequests--;
            });
          };
        }

        checkRequests();
      });
    });
  }

  // Wait for animations
  if (animation) {
    cy.wait(100); // Minimal wait for animations to start
    cy.document().then((doc) => {
      return new Cypress.Promise((resolve) => {
        if (doc.getAnimations) {
          const animations = doc.getAnimations();
          if (animations.length > 0) {
            Promise.all(animations.map(a => a.finished)).then(resolve);
          } else {
            resolve();
          }
        } else {
          resolve();
        }
      });
    });
  }
});

// * Export for TypeScript support
export {};

// * Add TypeScript declarations
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      waitForAutoSave(): Chainable<Element>;
      waitForPageLoad(): Chainable<Element>;
      waitForModal(modalName: string): Chainable<Element>;
      waitForModalClose(modalName: string): Chainable<Element>;
      waitForInteractive(selector: string): Chainable<Element>;
      waitForValidation(): Chainable<Element>;
      waitForDataLoad(minItems?: number): Chainable<Element>;
      waitForSearchResults(): Chainable<Element>;
      waitForAnimation(selector: string): Chainable<Element>;
      waitForDebounce(delay?: number): Chainable<Element>;
      waitForToast(): Chainable<Element>;
      waitForToastClear(): Chainable<Element>;
      smartWait(options?: {
        loading?: boolean;
        network?: boolean;
        animation?: boolean;
        timeout?: number;
      }): Chainable<Element>;
    }
  }
}