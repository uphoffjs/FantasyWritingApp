/// <reference types="cypress" />

/**
 * Custom Cypress Commands for React Native Web Testing
 * 
 * This file provides specialized commands for testing React Native components
 * that have been compiled to web using React Native Web.
 */

// * Type definitions for custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Get React Native element with multiple selector strategies
       */
      getRN(testId: string, options?: Partial<Cypress.Loggable & Cypress.Timeoutable>): Chainable<JQuery<HTMLElement>>;
      
      /**
       * Click a TouchableOpacity or Pressable component
       */
      rnClick(options?: Partial<Cypress.ClickOptions>): Chainable<Element>;
      
      /**
       * Type text into a React Native TextInput
       */
      rnType(text: string, options?: Partial<Cypress.TypeOptions>): Chainable<Element>;
      
      /**
       * Select an option in a React Native Picker
       */
      rnSelect(value: string): Chainable<Element>;
      
      /**
       * Clear and type into React Native TextInput
       */
      rnClearAndType(text: string): Chainable<Element>;
      
      /**
       * Trigger blur event on React Native input
       */
      rnBlur(): Chainable<Element>;
      
      /**
       * Trigger focus event on React Native input
       */
      rnFocus(): Chainable<Element>;
      
      /**
       * Swipe gesture for React Native ScrollView/FlatList
       */
      rnSwipe(direction: 'up' | 'down' | 'left' | 'right', distance?: number): Chainable<Element>;
      
      /**
       * Long press for React Native TouchableOpacity
       */
      rnLongPress(duration?: number): Chainable<Element>;
      
      /**
       * Wait for React Native component to be ready
       */
      waitForRN(timeout?: number): Chainable<void>;
      
      /**
       * Check if element is visible with React Native Web rendering
       */
      shouldBeVisibleRN(): Chainable<Element>;
      
      /**
       * Get parent TouchableOpacity or Pressable
       */
      getTouchable(): Chainable<Element>;
      
      /**
       * Toggle a React Native Switch component
       */
      rnToggleSwitch(): Chainable<Element>;
      
      /**
       * Scroll to element in React Native ScrollView
       */
      rnScrollTo(position?: 'top' | 'bottom' | 'center'): Chainable<Element>;
    }
  }
}

/**
 * Get React Native element with comprehensive fallback selector strategies
 * Tries multiple selector patterns to find React Native Web elements
 * Follows priority order: testID attributes > accessibility > semantic > content
 */
Cypress.Commands.add('getRN', (testId: string, options = {}) => {
  // Priority 1: Test-specific attributes (most reliable)
  const testSelectors = [
    `[data-testid="${testId}"]`,          // React Native Web standard
    `[data-cy="${testId}"]`,              // Legacy Cypress standard
    `[testID="${testId}"]`,               // React Native attribute
    `[data-test-id="${testId}"]`,        // Alternative format
    `[data-test="${testId}"]`            // Shortened format
  ];

  // Priority 2: Accessibility attributes (good fallback)
  const accessibilitySelectors = [
    `[aria-label="${testId}"]`,           // ARIA standard
    `[accessibilityLabel="${testId}"]`,   // React Native accessibility
    `[role][aria-label*="${testId}"]`,    // Partial ARIA match
    `[accessible="true"][aria-label*="${testId}"]` // RN accessible elements
  ];

  // Priority 3: Semantic attributes (component-specific)
  const semanticSelectors = [
    `[id="${testId}"]`,                   // ID attribute
    `[name="${testId}"]`,                 // Form element name
    `input[placeholder*="${testId}"]`,    // Input placeholders
    `button:contains("${testId}")`,       // Button text content
    `[title="${testId}"]`                 // Title attribute
  ];

  // * Try each selector group in priority order
  const allSelectors = [
    ...testSelectors,
    ...accessibilitySelectors,
    ...semanticSelectors
  ];

  // * Check each selector for matches
  for (const selector of allSelectors) {
    try {
      const el = Cypress.$(selector);
      if (el.length > 0) {
        return cy.get(selector, options);
      }
    } catch (e) {
      // * Continue to next selector if this one fails
      continue;
    }
  }
  
  // * If no selector works, try content-based search as last resort
  // * This helps during development when testIDs might be missing
  const contentElement = Cypress.$(`*:contains("${testId}")`).filter((i, el) => {
    const $el = Cypress.$(el);
    // * Only match leaf nodes to avoid parent containers
    return $el.children().length === 0 || $el.is('button, a, input, textarea');
  });

  if (contentElement.length > 0) {
    cy.log(`⚠️ getRN fallback: Using content selector for "${testId}". Add testID to component!`);
    return cy.wrap(contentElement.first());
  }
  
  // * If nothing works, use the primary selector and let Cypress provide helpful error
  return cy.get(testSelectors[0], options);
});

/**
 * Click handler for TouchableOpacity/Pressable components
 * Handles both touch and click events
 */
Cypress.Commands.add('rnClick', { prevSubject: true }, (subject, options = {}) => {
  return cy.wrap(subject).then($el => {
    const element = $el[0];
    
    // * Check if element has touch handlers
    const hasTouchHandlers = element.hasAttribute('role') && 
                            element.getAttribute('role') === 'button';
    
    if (hasTouchHandlers) {
      // * Simulate touch events for React Native components
      const touchStart = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
        touches: [{ clientX: 0, clientY: 0 } as Touch]
      });
      
      const touchEnd = new TouchEvent('touchend', {
        bubbles: true,
        cancelable: true,
        touches: []
      });
      
      element.dispatchEvent(touchStart);
      setTimeout(() => element.dispatchEvent(touchEnd), 50);
    }
    
    // * Also trigger standard click as fallback
    return cy.wrap(subject).click(options);
  });
});

/**
 * Type into React Native TextInput with proper event handling
 */
Cypress.Commands.add('rnType', { prevSubject: true }, (subject, text: string, options = {}) => {
  return cy.wrap(subject).then($el => {
    const element = $el[0] as HTMLInputElement;
    
    // * Focus the element first
    element.focus();
    
    // * Clear existing value if needed
    if (options.delay === undefined) {
      options.delay = 0;
    }
    
    // * Type each character with proper events
    return cy.wrap(subject).type(text, options).then(() => {
      // Trigger React Native specific events
      const changeEvent = new Event('change', { bubbles: true });
      const inputEvent = new Event('input', { bubbles: true });
      
      element.dispatchEvent(inputEvent);
      element.dispatchEvent(changeEvent);
      
      // * Trigger onChangeText if it exists
      if ((element as any).onChangeText) {
        (element as any).onChangeText(element.value);
      }
      
      return cy.wrap(subject);
    });
  });
});

/**
 * Select option in React Native Picker
 */
Cypress.Commands.add('rnSelect', { prevSubject: true }, (subject, value: string) => {
  return cy.wrap(subject).then($el => {
    const element = $el[0];
    
    if (element.tagName === 'SELECT') {
      // * Standard select element
      return cy.wrap(subject).select(value);
    } else {
      // React Native Picker rendered as custom component
      cy.wrap(subject).click();
      // * Look for option in dropdown
      cy.contains(value).click();
      return cy.wrap(subject);
    }
  });
});

/**
 * Clear and type into React Native TextInput
 */
Cypress.Commands.add('rnClearAndType', { prevSubject: true }, (subject, text: string) => {
  return cy.wrap(subject)
    .clear()
    .rnType(text);
});

/**
 * Blur React Native TextInput
 */
Cypress.Commands.add('rnBlur', { prevSubject: true }, (subject) => {
  return cy.wrap(subject).then($el => {
    const element = $el[0] as HTMLInputElement;
    
    const blurEvent = new FocusEvent('blur', {
      bubbles: true,
      cancelable: true,
      relatedTarget: null
    });
    
    element.dispatchEvent(blurEvent);
    element.blur();
    
    // * Trigger change event on blur
    if (element.value !== undefined) {
      const changeEvent = new Event('change', { bubbles: true });
      element.dispatchEvent(changeEvent);
    }
    
    return cy.wrap(subject);
  });
});

/**
 * Focus React Native TextInput
 */
Cypress.Commands.add('rnFocus', { prevSubject: true }, (subject) => {
  return cy.wrap(subject).then($el => {
    const element = $el[0] as HTMLInputElement;
    
    const focusEvent = new FocusEvent('focus', {
      bubbles: true,
      cancelable: true
    });
    
    element.dispatchEvent(focusEvent);
    element.focus();
    
    return cy.wrap(subject);
  });
});

/**
 * Swipe gesture for ScrollView/FlatList
 */
Cypress.Commands.add('rnSwipe', { prevSubject: true }, (subject, direction: string, distance = 100) => {
  return cy.wrap(subject).then($el => {
    const element = $el[0];
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    let endX = centerX;
    let endY = centerY;
    
    switch (direction) {
      case 'up':
        endY = centerY - distance;
        break;
      case 'down':
        endY = centerY + distance;
        break;
      case 'left':
        endX = centerX - distance;
        break;
      case 'right':
        endX = centerX + distance;
        break;
    }
    
    cy.wrap(subject)
      .trigger('touchstart', centerX, centerY)
      .trigger('touchmove', endX, endY)
      .trigger('touchend', endX, endY);
    
    return cy.wrap(subject);
  });
});

/**
 * Long press for TouchableOpacity
 */
Cypress.Commands.add('rnLongPress', { prevSubject: true }, (subject, duration = 500) => {
  return cy.wrap(subject).then($el => {
    const element = $el[0];
    
    const touchStart = new TouchEvent('touchstart', {
      bubbles: true,
      cancelable: true,
      touches: [{ clientX: 0, clientY: 0 } as Touch]
    });
    
    element.dispatchEvent(touchStart);
    
    cy.wait(duration);
    
    const touchEnd = new TouchEvent('touchend', {
      bubbles: true,
      cancelable: true,
      touches: []
    });
    
    element.dispatchEvent(touchEnd);
    
    // * Trigger onLongPress if it exists
    if ((element as any).onLongPress) {
      (element as any).onLongPress();
    }
    
    return cy.wrap(subject);
  });
});

/**
 * Wait for React Native components to be ready
 */
Cypress.Commands.add('waitForRN', (timeout = 100) => {
  cy.wait(timeout);
  
  // Force React to flush updates if available
  cy.window().then(win => {
    if ((win as any).React && (win as any).React.unstable_flushSync) {
      (win as any).React.unstable_flushSync(() => {});
    }
  });
});

/**
 * Check visibility with React Native Web rendering
 */
Cypress.Commands.add('shouldBeVisibleRN', { prevSubject: true }, (subject) => {
  return cy.wrap(subject).should($el => {
    const element = $el[0];
    const style = window.getComputedStyle(element);
    
    // Check React Native Web visibility patterns
    const isVisible = 
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      style.opacity !== '0' &&
      element.offsetParent !== null;
    
    expect(isVisible).to.be.true;
  });
});

/**
 * Get parent TouchableOpacity or Pressable
 */
Cypress.Commands.add('getTouchable', { prevSubject: true }, (subject) => {
  return cy.wrap(subject).closest('[role="button"]');
});

/**
 * Toggle React Native Switch component
 */
Cypress.Commands.add('rnToggleSwitch', { prevSubject: true }, (subject) => {
  return cy.wrap(subject).then($el => {
    const element = $el[0] as HTMLInputElement;
    
    if (element.type === 'checkbox' || element.getAttribute('role') === 'switch') {
      // * Click to toggle
      cy.wrap(subject).click();
      
      // * Trigger onChange if exists
      if ((element as any).onChange) {
        (element as any).onChange({ target: { checked: !element.checked } });
      }
    }
    
    return cy.wrap(subject);
  });
});

/**
 * Scroll to element in React Native ScrollView
 */
Cypress.Commands.add('rnScrollTo', { prevSubject: true }, (subject, position = 'center') => {
  return cy.wrap(subject).then($el => {
    const element = $el[0];
    
    let scrollOptions: ScrollIntoViewOptions = {
      behavior: 'smooth',
      block: 'center',
      inline: 'center'
    };
    
    switch (position) {
      case 'top':
        scrollOptions.block = 'start';
        break;
      case 'bottom':
        scrollOptions.block = 'end';
        break;
      case 'center':
      default:
        scrollOptions.block = 'center';
        break;
    }
    
    element.scrollIntoView(scrollOptions);
    
    return cy.wrap(subject);
  });
});

// * Export empty object to make this a module
export {};