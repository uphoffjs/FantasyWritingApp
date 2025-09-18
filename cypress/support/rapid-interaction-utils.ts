// * Utility functions and helpers for testing rapid user interactions
// * Prevents race conditions and timing issues in tests

/**
 * Debounce and throttle utilities for testing rapid interactions
 */
export const RapidInteractionUtils = {
  /**
   * Wait for debounced input to settle before assertion
   */
  waitForDebounce: (delay: number = 300) => {
    return cy.wait(delay);
  },

  /**
   * Wait for throttled actions to complete
   */
  waitForThrottle: (delay: number = 150) => {
    return cy.wait(delay);
  },

  /**
   * Ensure all pending promises and microtasks are resolved
   */
  waitForMicrotasks: () => {
    return cy.wait(0);
  },

  /**
   * Wait for React to finish rendering
   */
  waitForReactRender: () => {
    return cy.wait(16); // One frame at 60fps
  },

  /**
   * Wait for all animations to complete
   */
  waitForAnimations: () => {
    return cy.get('[data-animating]').should('not.exist');
  },

  /**
   * Wait for network requests to complete
   */
  waitForNetworkIdle: (timeout: number = 2000) => {
    return cy.intercept('**/*', { middleware: true }).as('networkActivity');
  }
};

/**
 * Custom commands for rapid interactions
 */
export const RapidInteractionCommands = {
  /**
   * Type rapidly with configurable delays
   */
  rapidType: (selector: string, text: string, delayBetweenChars: number = 0) => {
    cy.get(selector).clear();
    
    if (delayBetweenChars === 0) {
      // * Instant typing - set value directly
      cy.get(selector).invoke('val', text).trigger('input').trigger('change');
    } else {
      // * Type with custom delay
      cy.get(selector).type(text, { delay: delayBetweenChars });
    }
    
    return cy.get(selector);
  },

  /**
   * Click multiple times rapidly
   */
  rapidClick: (selector: string, count: number, delayBetweenClicks: number = 0) => {
    for (let i = 0; i < count; i++) {
      cy.get(selector).click({ force: true });
      if (delayBetweenClicks > 0 && i < count - 1) {
        cy.wait(delayBetweenClicks);
      }
    }
    return cy.get(selector);
  },

  /**
   * Toggle a control rapidly
   */
  rapidToggle: (selector: string, count: number, delayBetween: number = 0) => {
    for (let i = 0; i < count; i++) {
      cy.get(selector).click();
      if (delayBetween > 0 && i < count - 1) {
        cy.wait(delayBetween);
      }
    }
    return cy.get(selector);
  },

  /**
   * Rapidly switch between tabs/sections
   */
  rapidTabSwitch: (tabSelectors: string[], delayBetween: number = 0) => {
    tabSelectors.forEach((selector, index) => {
      cy.get(selector).click();
      if (delayBetween > 0 && index < tabSelectors.length - 1) {
        cy.wait(delayBetween);
      }
    });
  },

  /**
   * Rapidly scroll through content
   */
  rapidScroll: (selector: string, positions: number[], delayBetween: number = 0) => {
    positions.forEach((position, index) => {
      cy.get(selector).scrollTo(0, position);
      if (delayBetween > 0 && index < positions.length - 1) {
        cy.wait(delayBetween);
      }
    });
    return cy.get(selector);
  }
};

/**
 * Race condition prevention helpers
 */
export const RaceConditionHelpers = {
  /**
   * Ensure state has settled before proceeding
   */
  waitForStateSettled: (checkFn: () => boolean, maxAttempts: number = 10) => {
    let attempts = 0;
    
    const check = () => {
      if (checkFn() || attempts >= maxAttempts) {
        return;
      }
      attempts++;
      cy.wait(100).then(check);
    };
    
    return cy.wrap(null).then(check);
  },

  /**
   * Retry an action until it succeeds
   */
  retryUntilSuccess: (
    action: () => void,
    verification: () => Cypress.Chainable,
    maxRetries: number = 3
  ) => {
    let retries = 0;
    
    const attemptAction = () => {
      action();
      
      return verification()
        .then(() => true)
        .catch(() => {
          if (retries < maxRetries) {
            retries++;
            cy.wait(100);
            return attemptAction();
          }
          throw new Error(`Action failed after ${maxRetries} retries`);
        });
    };
    
    return cy.wrap(null).then(attemptAction);
  },

  /**
   * Ensure async operations complete before assertions
   */
  waitForAsyncOperation: (
    operationSelector: string,
    completionIndicator: string,
    timeout: number = 5000
  ) => {
    // * Trigger the operation
    cy.get(operationSelector).click();
    
    // * Wait for completion indicator
    cy.get(completionIndicator, { timeout }).should('exist');
    
    return cy.get(completionIndicator);
  },

  /**
   * Handle concurrent state updates
   */
  synchronizeStateUpdates: (actions: (() => void)[], delayBetween: number = 50) => {
    actions.forEach((action, index) => {
      action();
      if (index < actions.length - 1) {
        cy.wait(delayBetween);
      }
    });
    
    // * Wait for all updates to propagate
    return cy.wait(100);
  }
};

/**
 * Performance testing for rapid interactions
 */
export const PerformanceHelpers = {
  /**
   * Measure response time for rapid actions
   */
  measureRapidActionPerformance: (
    action: () => void,
    expectedMaxDuration: number = 100
  ) => {
    const startTime = performance.now();
    
    action();
    
    cy.wrap(null).then(() => {
      const duration = performance.now() - startTime;
      expect(duration).to.be.lessThan(expectedMaxDuration);
      return duration;
    });
  },

  /**
   * Test UI responsiveness during rapid interactions
   */
  testResponsiveness: (
    rapidAction: () => void,
    uiCheckSelector: string,
    maxResponseTime: number = 16 // 60fps
  ) => {
    let lastFrameTime = performance.now();
    const frameTimes: number[] = [];
    
    const measureFrame = () => {
      const currentTime = performance.now();
      const frameTime = currentTime - lastFrameTime;
      frameTimes.push(frameTime);
      lastFrameTime = currentTime;
      
      if (frameTimes.length < 60) { // Measure 60 frames
        requestAnimationFrame(measureFrame);
      }
    };
    
    requestAnimationFrame(measureFrame);
    rapidAction();
    
    cy.wait(1000).then(() => {
      const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
      expect(avgFrameTime).to.be.lessThan(maxResponseTime);
    });
  }
};

/**
 * Stress testing utilities
 */
export const StressTestHelpers = {
  /**
   * Simulate rapid user typing
   */
  simulateRapidTyping: (
    selector: string,
    text: string,
    wordsPerMinute: number = 80
  ) => {
    const charDelay = Math.floor(60000 / (wordsPerMinute * 5)); // Avg 5 chars per word
    
    cy.get(selector).clear();
    text.split('').forEach((char, index) => {
      cy.get(selector).type(char, { delay: 0 });
      if (index < text.length - 1) {
        cy.wait(charDelay);
      }
    });
    
    return cy.get(selector);
  },

  /**
   * Simulate user rage clicking
   */
  simulateRageClick: (selector: string, duration: number = 1000) => {
    const clicks = Math.floor(duration / 50); // ~20 clicks per second
    
    for (let i = 0; i < clicks; i++) {
      cy.get(selector).click({ force: true });
      cy.wait(50);
    }
    
    return cy.get(selector);
  },

  /**
   * Simulate rapid form submission attempts
   */
  simulateRapidFormSubmit: (
    formSelector: string,
    submitSelector: string,
    attempts: number = 5
  ) => {
    for (let i = 0; i < attempts; i++) {
      cy.get(submitSelector).click({ force: true });
      cy.wait(100);
    }
    
    // * Verify only one submission was processed
    cy.get('[data-submission-count]').should('have.text', '1');
  },

  /**
   * Simulate concurrent actions from multiple "users"
   */
  simulateConcurrentActions: (actions: (() => void)[], concurrency: number = 3) => {
    const batches = [];
    
    for (let i = 0; i < actions.length; i += concurrency) {
      batches.push(actions.slice(i, i + concurrency));
    }
    
    batches.forEach(batch => {
      // * Execute batch concurrently
      batch.forEach(action => action());
      // * Wait for batch to complete
      cy.wait(100);
    });
  }
};

/**
 * Custom assertions for rapid interactions
 */
export const RapidInteractionAssertions = {
  /**
   * Assert that rapid clicks don't cause duplicate actions
   */
  assertNoDuplicateActions: (
    selector: string,
    actionCount: number,
    expectedResult: number = 1
  ) => {
    for (let i = 0; i < actionCount; i++) {
      cy.get(selector).click({ force: true });
    }
    
    cy.wait(500); // Wait for all actions to process
    cy.get('[data-action-count]').should('have.text', expectedResult.toString());
  },

  /**
   * Assert that rapid input doesn't lose characters
   */
  assertNoCharacterLoss: (selector: string, text: string) => {
    // * Type rapidly
    cy.get(selector).clear().type(text, { delay: 0 });
    
    // * Verify all characters are present
    cy.get(selector).should('have.value', text);
  },

  /**
   * Assert that rapid state changes are handled correctly
   */
  assertCorrectStateAfterRapidChanges: (
    toggleSelector: string,
    toggleCount: number,
    expectedState: 'on' | 'off'
  ) => {
    for (let i = 0; i < toggleCount; i++) {
      cy.get(toggleSelector).click();
    }
    
    const expectedClass = expectedState === 'on' ? 'active' : 'inactive';
    cy.get(toggleSelector).should('have.class', expectedClass);
  },

  /**
   * Assert that UI remains responsive during rapid interactions
   */
  assertUIResponsiveness: (
    action: () => void,
    checkSelector: string,
    maxBlockingTime: number = 50
  ) => {
    const startTime = Date.now();
    
    action();
    
    // * Check that UI element is still interactive
    cy.get(checkSelector).click({ timeout: maxBlockingTime });
    
    const duration = Date.now() - startTime;
    expect(duration).to.be.lessThan(maxBlockingTime);
  }
};

/**
 * Configuration for rapid interaction testing
 */
export const RapidInteractionConfig = {
  // * Default delays
  DEFAULT_DEBOUNCE_DELAY: 300,
  DEFAULT_THROTTLE_DELAY: 150,
  DEFAULT_ANIMATION_DURATION: 300,
  
  // // DEPRECATED: ! PERFORMANCE: * Performance thresholds
  MAX_INPUT_LAG: 100, // ms
  MAX_RENDER_TIME: 16, // ms (60fps)
  MAX_RESPONSE_TIME: 200, // ms
  
  // * Stress test parameters
  RAGE_CLICK_RATE: 20, // clicks per second
  RAPID_TYPE_WPM: 100, // words per minute
  MAX_CONCURRENT_ACTIONS: 10,
  
  // * Retry configuration
  DEFAULT_MAX_RETRIES: 3,
  RETRY_DELAY: 100, // ms
  
  // * Timeout configuration
  ASYNC_OPERATION_TIMEOUT: 5000, // ms
  STATE_SETTLE_TIMEOUT: 2000, // ms
  NETWORK_IDLE_TIMEOUT: 2000, // ms
};

// * Register custom Cypress commands
Cypress.Commands.add('rapidType', RapidInteractionCommands.rapidType);
Cypress.Commands.add('rapidClick', RapidInteractionCommands.rapidClick);
Cypress.Commands.add('rapidToggle', RapidInteractionCommands.rapidToggle);
Cypress.Commands.add('rapidTabSwitch', RapidInteractionCommands.rapidTabSwitch);
Cypress.Commands.add('rapidScroll', RapidInteractionCommands.rapidScroll);

Cypress.Commands.add('waitForDebounce', RapidInteractionUtils.waitForDebounce);
Cypress.Commands.add('waitForThrottle', RapidInteractionUtils.waitForThrottle);
Cypress.Commands.add('waitForReactRender', RapidInteractionUtils.waitForReactRender);

// * Type declarations for custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      rapidType(selector: string, text: string, delayBetweenChars?: number): Chainable<Element>;
      rapidClick(selector: string, count: number, delayBetweenClicks?: number): Chainable<Element>;
      rapidToggle(selector: string, count: number, delayBetween?: number): Chainable<Element>;
      rapidTabSwitch(tabSelectors: string[], delayBetween?: number): void;
      rapidScroll(selector: string, positions: number[], delayBetween?: number): Chainable<Element>;
      
      waitForDebounce(delay?: number): Chainable<void>;
      waitForThrottle(delay?: number): Chainable<void>;
      waitForReactRender(): Chainable<void>;
    }
  }
}

export default RapidInteractionUtils;