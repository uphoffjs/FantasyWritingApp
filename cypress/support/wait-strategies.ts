/// <reference types="cypress" />

/**
 * Wait Strategies for React Native Web Async Operations
 * 
 * React Native Web has specific timing challenges:
 * - Animations and transitions
 * - Async state updates
 * - Bridge communication delays
 * - Layout calculations
 */

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Wait for React Native animations to complete
       */
      waitForAnimation(timeout?: number): Chainable<void>;
      
      /**
       * Wait for React Native layout to stabilize
       */
      waitForLayout(timeout?: number): Chainable<void>;
      
      /**
       * Wait for async state updates to propagate
       */
      waitForStateUpdate(timeout?: number): Chainable<void>;
      
      /**
       * Wait for React Native bridge communication
       */
      waitForBridge(timeout?: number): Chainable<void>;
      
      /**
       * Wait for all React Native operations to complete
       */
      waitForRNComplete(timeout?: number): Chainable<void>;
      
      /**
       * Wait for specific element to stop moving (for animations)
       */
      waitForElementStable(selector: string, timeout?: number): Chainable<void>;
      
      /**
       * Wait for network requests to complete
       */
      waitForNetworkIdle(timeout?: number): Chainable<void>;
      
      /**
       * Retry a command with exponential backoff
       */
      retryWithBackoff<T>(
        fn: () => Cypress.Chainable<T>,
        options?: RetryOptions
      ): Chainable<T>;
      
      /**
       * Wait until a condition is met
       */
      waitUntil(
        condition: () => boolean | Cypress.Chainable<boolean>,
        options?: WaitUntilOptions
      ): Chainable<void>;
    }
  }
}

interface RetryOptions {
  retries?: number;
  delay?: number;
  backoff?: number;
  timeout?: number;
}

interface WaitUntilOptions {
  timeout?: number;
  interval?: number;
  errorMsg?: string;
}

/**
 * Wait for React Native animations to complete
 * Default timeout: 1000ms
 */
Cypress.Commands.add('waitForAnimation', (timeout = 1000) => {
  cy.log(`⏳ Waiting ${timeout}ms for animations`);
  
  // Wait for CSS animations
  cy.get('body').should($body => {
    const animations = $body.find('*').filter((i, el) => {
      const style = window.getComputedStyle(el);
      return style.animationName !== 'none' || 
             style.transitionProperty !== 'none';
    });
    expect(animations.length).to.equal(0);
  });
  
  // Additional wait for React Native animations
  cy.wait(timeout);
});

/**
 * Wait for React Native layout to stabilize
 * Checks that elements haven't moved for specified duration
 */
Cypress.Commands.add('waitForLayout', (timeout = 500) => {
  cy.log(`⏳ Waiting for layout to stabilize`);
  
  let previousPositions: Map<Element, DOMRect> = new Map();
  
  cy.document().then(doc => {
    // Capture initial positions
    doc.querySelectorAll('*').forEach(el => {
      previousPositions.set(el, el.getBoundingClientRect());
    });
    
    // Wait and check again
    cy.wait(timeout).then(() => {
      let isStable = true;
      
      doc.querySelectorAll('*').forEach(el => {
        const prevPos = previousPositions.get(el);
        const currentPos = el.getBoundingClientRect();
        
        if (prevPos && (
          Math.abs(prevPos.x - currentPos.x) > 1 ||
          Math.abs(prevPos.y - currentPos.y) > 1 ||
          Math.abs(prevPos.width - currentPos.width) > 1 ||
          Math.abs(prevPos.height - currentPos.height) > 1
        )) {
          isStable = false;
        }
      });
      
      if (!isStable) {
        cy.log('⚠️ Layout still changing, waiting more...');
        cy.waitForLayout(timeout);
      }
    });
  });
});

/**
 * Wait for React state updates to propagate
 * Uses React's act() if available
 */
Cypress.Commands.add('waitForStateUpdate', (timeout = 300) => {
  cy.log(`⏳ Waiting for state updates`);
  
  cy.window().then(win => {
    // Check if React DevTools are available
    if ((win as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      // Force React to flush updates
      const hook = (win as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
      if (hook.renderers && hook.renderers.size > 0) {
        // Trigger re-render detection
        cy.wait(timeout);
      }
    } else {
      // Fallback wait
      cy.wait(timeout);
    }
  });
  
  // Ensure DOM is updated
  cy.document().should('exist');
});

/**
 * Wait for React Native bridge communication
 * Specific to React Native Web's async messaging
 */
Cypress.Commands.add('waitForBridge', (timeout = 200) => {
  cy.log(`⏳ Waiting for RN bridge`);
  
  // Check for pending bridge messages
  cy.window().then(win => {
    if ((win as any).__REACT_NATIVE_BRIDGE__) {
      const bridge = (win as any).__REACT_NATIVE_BRIDGE__;
      
      // Wait for message queue to clear
      const checkQueue = () => {
        if (bridge.pendingMessages && bridge.pendingMessages.length > 0) {
          cy.wait(50).then(checkQueue);
        }
      };
      
      checkQueue();
    } else {
      // No bridge, just wait
      cy.wait(timeout);
    }
  });
});

/**
 * Wait for all React Native operations to complete
 * Combines multiple wait strategies
 */
Cypress.Commands.add('waitForRNComplete', (timeout = 500) => {
  cy.log(`⏳ Waiting for all RN operations`);
  
  // Chain all wait operations
  cy.waitForBridge(200);
  cy.waitForStateUpdate(300);
  cy.waitForAnimation(timeout);
  cy.waitForLayout(300);
});

/**
 * Wait for specific element to stop moving
 * Useful for animation testing
 */
Cypress.Commands.add('waitForElementStable', (selector: string, timeout = 1000) => {
  cy.log(`⏳ Waiting for ${selector} to stabilize`);
  
  let previousPosition: DOMRect | null = null;
  const checkInterval = 100;
  const maxChecks = timeout / checkInterval;
  let checks = 0;
  
  const checkPosition = () => {
    cy.get(selector).then($el => {
      const currentPosition = $el[0].getBoundingClientRect();
      
      if (previousPosition && 
          Math.abs(previousPosition.x - currentPosition.x) < 1 &&
          Math.abs(previousPosition.y - currentPosition.y) < 1) {
        // Element is stable
        return;
      }
      
      previousPosition = currentPosition;
      checks++;
      
      if (checks < maxChecks) {
        cy.wait(checkInterval).then(checkPosition);
      } else {
        cy.log('⚠️ Element did not stabilize in time');
      }
    });
  };
  
  checkPosition();
});

/**
 * Wait for network requests to complete
 */
Cypress.Commands.add('waitForNetworkIdle', (timeout = 3000) => {
  cy.log(`⏳ Waiting for network idle`);
  
  let pendingRequests = 0;
  
  cy.intercept('**/*', (req) => {
    pendingRequests++;
    
    req.continue((res) => {
      pendingRequests--;
    });
  });
  
  // Wait until no pending requests
  cy.waitUntil(
    () => pendingRequests === 0,
    { timeout, errorMsg: 'Network requests did not complete' }
  );
});

/**
 * Retry a command with exponential backoff
 */
Cypress.Commands.add('retryWithBackoff', <T>(
  fn: () => Cypress.Chainable<T>,
  options: RetryOptions = {}
) => {
  const {
    retries = 3,
    delay = 100,
    backoff = 2,
    timeout = 10000
  } = options;
  
  let attempt = 0;
  let currentDelay = delay;
  
  const attemptCommand = (): Cypress.Chainable<T> => {
    return fn().then(
      // Success
      (result) => result,
      // Failure
      (error) => {
        attempt++;
        
        if (attempt >= retries) {
          throw error;
        }
        
        cy.log(`⚠️ Retry ${attempt}/${retries} after ${currentDelay}ms`);
        currentDelay *= backoff;
        
        return cy.wait(currentDelay).then(() => attemptCommand());
      }
    );
  };
  
  return cy.wrap(null).then(() => attemptCommand());
});

/**
 * Wait until a condition is met
 */
Cypress.Commands.add('waitUntil', (
  condition: () => boolean | Cypress.Chainable<boolean>,
  options: WaitUntilOptions = {}
) => {
  const {
    timeout = 5000,
    interval = 100,
    errorMsg = 'Condition not met'
  } = options;
  
  const startTime = Date.now();
  
  const checkCondition = (): Cypress.Chainable<void> => {
    const result = condition();
    
    // Handle both boolean and Chainable returns
    const promise = typeof result === 'boolean' 
      ? Promise.resolve(result)
      : Cypress.Promise.resolve(result);
    
    return cy.wrap(promise).then((conditionMet) => {
      if (conditionMet) {
        return;
      }
      
      if (Date.now() - startTime > timeout) {
        throw new Error(`${errorMsg} (timeout: ${timeout}ms)`);
      }
      
      return cy.wait(interval).then(() => checkCondition());
    });
  };
  
  return checkCondition();
});

/**
 * Helper to detect if React Native Web is rendering
 */
export function isReactNativeWebRendering(): boolean {
  const doc = Cypress.$('body');
  
  // Check for React Native Web specific attributes
  return doc.find('[data-rnw]').length > 0 ||
         doc.find('[data-focusable]').length > 0 ||
         doc.find('[dir="auto"]').length > 0;
}

/**
 * Helper to wait for specific React Native Web events
 */
export function waitForRNEvent(eventName: string, timeout = 1000): Cypress.Chainable<void> {
  return cy.window().then(win => {
    return new Cypress.Promise((resolve) => {
      const handler = () => {
        win.removeEventListener(eventName, handler);
        resolve();
      };
      
      win.addEventListener(eventName, handler);
      
      // Timeout fallback
      setTimeout(() => {
        win.removeEventListener(eventName, handler);
        resolve();
      }, timeout);
    });
  });
}

// Export for use in test files
export default {
  isReactNativeWebRendering,
  waitForRNEvent
};