/**
 * @fileoverview Touch Interaction Commands for React Native Components
 * Simulates touch gestures and mobile interactions in component tests
 *
 * Purpose:
 * - Enable testing of React Native touch gestures
 * - Simulate mobile-specific interactions (tap, swipe, long press)
 * - Support gesture-based navigation and UI interactions
 * - Provide mobile-first testing capabilities
 */

// * Touch event types for React Native Web
type TouchGesture = 'tap' | 'longPress' | 'doubleTap' | 'swipeLeft' | 'swipeRight' | 'swipeUp' | 'swipeDown' | 'pinch' | 'spread';

// * Options for touch gestures
interface TouchOptions {
  duration?: number;      // Duration in ms for long press
  distance?: number;      // Distance in pixels for swipe
  speed?: 'slow' | 'normal' | 'fast';  // Speed of gesture
  pressure?: number;      // Touch pressure (0-1)
  fingers?: number;       // Number of fingers (for multi-touch)
}

/**
 * Simulate a tap gesture on an element
 * Basic touch interaction for buttons and interactive elements
 */
Cypress.Commands.add('tap', (selector: string, options: TouchOptions = {}) => {
  const element = cy.get(selector);

  element.trigger('touchstart', {
    touches: [{ clientX: 0, clientY: 0, force: options.pressure || 1 }],
    changedTouches: [{ clientX: 0, clientY: 0 }],
  });

  // * Small delay to simulate real tap
  cy.wait(50);

  element.trigger('touchend', {
    touches: [],
    changedTouches: [{ clientX: 0, clientY: 0 }],
  });

  cy.log(`👆 Tapped: ${selector}`);

  return element;
});

/**
 * Simulate a long press gesture
 * Used for context menus, selection, and press-and-hold actions
 */
Cypress.Commands.add('longPress', (selector: string, options: TouchOptions = {}) => {
  const duration = options.duration || 500;
  const element = cy.get(selector);

  element.trigger('touchstart', {
    touches: [{ clientX: 0, clientY: 0, force: options.pressure || 1 }],
    changedTouches: [{ clientX: 0, clientY: 0 }],
  });

  // * Hold for specified duration
  cy.wait(duration);

  element.trigger('touchend', {
    touches: [],
    changedTouches: [{ clientX: 0, clientY: 0 }],
  });

  cy.log(`👆 Long pressed: ${selector} for ${duration}ms`);

  return element;
});

/**
 * Simulate a double tap gesture
 * Used for zooming and special interactions
 */
Cypress.Commands.add('doubleTap', (selector: string, options: TouchOptions = {}) => {
  const element = cy.get(selector);
  const tapDelay = 100; // Delay between taps

  // * First tap
  element.trigger('touchstart', {
    touches: [{ clientX: 0, clientY: 0 }],
    changedTouches: [{ clientX: 0, clientY: 0 }],
  });
  cy.wait(50);
  element.trigger('touchend', {
    touches: [],
    changedTouches: [{ clientX: 0, clientY: 0 }],
  });

  // * Short delay between taps
  cy.wait(tapDelay);

  // * Second tap
  element.trigger('touchstart', {
    touches: [{ clientX: 0, clientY: 0 }],
    changedTouches: [{ clientX: 0, clientY: 0 }],
  });
  cy.wait(50);
  element.trigger('touchend', {
    touches: [],
    changedTouches: [{ clientX: 0, clientY: 0 }],
  });

  cy.log(`👆👆 Double tapped: ${selector}`);

  return element;
});

/**
 * Simulate a swipe gesture
 * Used for navigation, dismissal, and scrolling
 */
Cypress.Commands.add('swipe', (selector: string, direction: 'left' | 'right' | 'up' | 'down', options: TouchOptions = {}) => {
  const element = cy.get(selector);
  const distance = options.distance || 100;
  const speed = options.speed || 'normal';

  // * Calculate duration based on speed
  const durations = { slow: 500, normal: 200, fast: 100 };
  const duration = durations[speed];

  // * Get element position for gesture calculation
  element.then(($el) => {
    const rect = $el[0].getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let startX = centerX, startY = centerY;
    let endX = centerX, endY = centerY;

    // * Calculate swipe endpoints based on direction
    switch (direction) {
      case 'left':
        startX = centerX + distance / 2;
        endX = centerX - distance / 2;
        break;
      case 'right':
        startX = centerX - distance / 2;
        endX = centerX + distance / 2;
        break;
      case 'up':
        startY = centerY + distance / 2;
        endY = centerY - distance / 2;
        break;
      case 'down':
        startY = centerY - distance / 2;
        endY = centerY + distance / 2;
        break;
    }

    // * Start touch
    cy.wrap($el).trigger('touchstart', {
      touches: [{ clientX: startX, clientY: startY }],
      changedTouches: [{ clientX: startX, clientY: startY }],
    });

    // * Move touch (simulate swipe motion)
    const steps = 5;
    for (let i = 1; i <= steps; i++) {
      const progress = i / steps;
      const currentX = startX + (endX - startX) * progress;
      const currentY = startY + (endY - startY) * progress;

      cy.wrap($el).trigger('touchmove', {
        touches: [{ clientX: currentX, clientY: currentY }],
        changedTouches: [{ clientX: currentX, clientY: currentY }],
      });

      cy.wait(duration / steps);
    }

    // * End touch
    cy.wrap($el).trigger('touchend', {
      touches: [],
      changedTouches: [{ clientX: endX, clientY: endY }],
    });
  });

  cy.log(`👉 Swiped ${direction}: ${selector}`);

  return element;
});

/**
 * Simulate a pinch gesture (zoom out)
 * Used for zooming and scaling interactions
 */
Cypress.Commands.add('pinch', (selector: string, options: TouchOptions = {}) => {
  const element = cy.get(selector);
  const distance = options.distance || 100;

  element.then(($el) => {
    const rect = $el[0].getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // * Start with fingers apart
    cy.wrap($el).trigger('touchstart', {
      touches: [
        { identifier: 0, clientX: centerX - distance / 2, clientY: centerY },
        { identifier: 1, clientX: centerX + distance / 2, clientY: centerY },
      ],
    });

    // * Move fingers together
    const steps = 5;
    for (let i = 1; i <= steps; i++) {
      const progress = i / steps;
      const currentDistance = distance * (1 - progress);

      cy.wrap($el).trigger('touchmove', {
        touches: [
          { identifier: 0, clientX: centerX - currentDistance / 2, clientY: centerY },
          { identifier: 1, clientX: centerX + currentDistance / 2, clientY: centerY },
        ],
      });

      cy.wait(40);
    }

    // * End touch
    cy.wrap($el).trigger('touchend', {
      touches: [],
      changedTouches: [
        { identifier: 0, clientX: centerX, clientY: centerY },
        { identifier: 1, clientX: centerX, clientY: centerY },
      ],
    });
  });

  cy.log(`🤏 Pinched: ${selector}`);

  return element;
});

/**
 * Simulate a spread gesture (zoom in)
 * Used for zooming and scaling interactions
 */
Cypress.Commands.add('spread', (selector: string, options: TouchOptions = {}) => {
  const element = cy.get(selector);
  const distance = options.distance || 100;

  element.then(($el) => {
    const rect = $el[0].getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // * Start with fingers together
    cy.wrap($el).trigger('touchstart', {
      touches: [
        { identifier: 0, clientX: centerX, clientY: centerY },
        { identifier: 1, clientX: centerX, clientY: centerY },
      ],
    });

    // * Move fingers apart
    const steps = 5;
    for (let i = 1; i <= steps; i++) {
      const progress = i / steps;
      const currentDistance = distance * progress;

      cy.wrap($el).trigger('touchmove', {
        touches: [
          { identifier: 0, clientX: centerX - currentDistance / 2, clientY: centerY },
          { identifier: 1, clientX: centerX + currentDistance / 2, clientY: centerY },
        ],
      });

      cy.wait(40);
    }

    // * End touch
    cy.wrap($el).trigger('touchend', {
      touches: [],
      changedTouches: [
        { identifier: 0, clientX: centerX - distance / 2, clientY: centerY },
        { identifier: 1, clientX: centerX + distance / 2, clientY: centerY },
      ],
    });
  });

  cy.log(`🖐 Spread: ${selector}`);

  return element;
});

/**
 * Simulate touch and drag gesture
 * Used for reordering lists, moving elements, and drag interactions
 */
Cypress.Commands.add('touchDrag', (
  sourceSelector: string,
  targetSelector: string,
  options: TouchOptions = {}
) => {
  const sourceElement = cy.get(sourceSelector);
  const targetElement = cy.get(targetSelector);
  const duration = options.duration || 500;

  // * Get positions of both elements
  sourceElement.then(($source) => {
    targetElement.then(($target) => {
      const sourceRect = $source[0].getBoundingClientRect();
      const targetRect = $target[0].getBoundingClientRect();

      const startX = sourceRect.left + sourceRect.width / 2;
      const startY = sourceRect.top + sourceRect.height / 2;
      const endX = targetRect.left + targetRect.width / 2;
      const endY = targetRect.top + targetRect.height / 2;

      // * Start touch on source
      cy.wrap($source).trigger('touchstart', {
        touches: [{ clientX: startX, clientY: startY }],
        changedTouches: [{ clientX: startX, clientY: startY }],
      });

      // * Drag to target
      const steps = 10;
      for (let i = 1; i <= steps; i++) {
        const progress = i / steps;
        const currentX = startX + (endX - startX) * progress;
        const currentY = startY + (endY - startY) * progress;

        cy.document().trigger('touchmove', {
          touches: [{ clientX: currentX, clientY: currentY }],
          changedTouches: [{ clientX: currentX, clientY: currentY }],
        });

        cy.wait(duration / steps);
      }

      // * End touch on target
      cy.wrap($target).trigger('touchend', {
        touches: [],
        changedTouches: [{ clientX: endX, clientY: endY }],
      });
    });
  });

  cy.log(`📱 Dragged from ${sourceSelector} to ${targetSelector}`);
});

/**
 * Test touch responsiveness
 * Verify that element responds to touch events
 */
Cypress.Commands.add('shouldBeTouchAccessible', (selector: string) => {
  cy.get(selector).should('have.css', 'touch-action').and('not.equal', 'none');
  cy.get(selector).should('have.css', 'cursor').and('equal', 'pointer');
  cy.log(`✅ ${selector} is touch accessible`);
});

// * Extend Cypress command types
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /**
       * Simulate a tap gesture
       */
      tap(selector: string, options?: TouchOptions): Chainable<JQuery<HTMLElement>>;

      /**
       * Simulate a long press gesture
       */
      longPress(selector: string, options?: TouchOptions): Chainable<JQuery<HTMLElement>>;

      /**
       * Simulate a double tap gesture
       */
      doubleTap(selector: string, options?: TouchOptions): Chainable<JQuery<HTMLElement>>;

      /**
       * Simulate a swipe gesture
       */
      swipe(
        selector: string,
        direction: 'left' | 'right' | 'up' | 'down',
        options?: TouchOptions
      ): Chainable<JQuery<HTMLElement>>;

      /**
       * Simulate a pinch gesture (zoom out)
       */
      pinch(selector: string, options?: TouchOptions): Chainable<JQuery<HTMLElement>>;

      /**
       * Simulate a spread gesture (zoom in)
       */
      spread(selector: string, options?: TouchOptions): Chainable<JQuery<HTMLElement>>;

      /**
       * Simulate touch and drag gesture
       */
      touchDrag(
        sourceSelector: string,
        targetSelector: string,
        options?: TouchOptions
      ): void;

      /**
       * Verify element is touch accessible
       */
      shouldBeTouchAccessible(selector: string): void;
    }
  }
}