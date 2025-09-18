// React Native Web Event Handling for Cypress Tests
// TODO: * This file provides comprehensive event handling fixes for React Native Web components in tests

import { Platform } from 'react-native';

// * Debug logging for event tracking
const DEBUG_EVENTS = false;

export function logEvent(eventName: string, detail?: any) {
  if (DEBUG_EVENTS && typeof window !== 'undefined' && (window as any).Cypress) {
    console.log(`[RN-Web Event] ${eventName}`, detail);
  }
}

// * Create a synthetic React Native event
export function createSyntheticEvent(type: string, target: any, value?: any) {
  const event = {
    type,
    target,
    currentTarget: target,
    nativeEvent: {
      text: value,
      value: value,
      target,
    },
    persist: () => {},
    preventDefault: () => {},
    stopPropagation: () => {},
    bubbles: true,
    cancelable: true,
    defaultPrevented: false,
    eventPhase: 2,
    isTrusted: true,
    timeStamp: Date.now(),
  };
  
  logEvent(`Created synthetic event: ${type}`, { value });
  return event;
}

// Enhanced Cypress commands for React Native Web event handling
Cypress.Commands.add('rnTypeText', { prevSubject: true }, (subject, text: string) => {
  return cy.wrap(subject).then(($el) => {
    const element = $el[0];
    
    // * Focus the element
    element.focus();
    logEvent('Focus', { element });
    
    // * Clear existing value
    element.value = '';
    
    // * Type each character
    for (const char of text) {
      element.value += char;
      
      // * Trigger input event
      const inputEvent = new Event('input', { bubbles: true });
      Object.defineProperty(inputEvent, 'target', {
        value: element,
        enumerable: true,
      });
      element.dispatchEvent(inputEvent);
      logEvent('Input event', { char, value: element.value });
      
      // * Trigger change event
      const changeEvent = new Event('change', { bubbles: true });
      Object.defineProperty(changeEvent, 'target', {
        value: element,
        enumerable: true,
      });
      element.dispatchEvent(changeEvent);
      logEvent('Change event', { value: element.value });
      
      // For React Native Web, also trigger onChangeText
      if (element.onChangeText) {
        element.onChangeText(element.value);
        logEvent('onChangeText called', { value: element.value });
      }
    }
    
    // * Blur to ensure final change is registered
    element.blur();
    logEvent('Blur', { finalValue: element.value });
    
    // * Trigger final change event on blur
    const finalChangeEvent = new Event('change', { bubbles: true });
    Object.defineProperty(finalChangeEvent, 'target', {
      value: element,
      enumerable: true,
    });
    element.dispatchEvent(finalChangeEvent);
    
    return cy.wrap(subject);
  });
});

// * Command to properly select options in React Native Web
Cypress.Commands.add('rnSelectOption', { prevSubject: true }, (subject, value: string) => {
  return cy.wrap(subject).then(($el) => {
    const element = $el[0];
    
    if (element.tagName === 'SELECT') {
      // * Standard select element
      element.value = value;
      
      const changeEvent = new Event('change', { bubbles: true });
      Object.defineProperty(changeEvent, 'target', {
        value: element,
        enumerable: true,
      });
      element.dispatchEvent(changeEvent);
      logEvent('Select change', { value });
    } else {
      // React Native Picker or custom select
      cy.wrap(subject).click();
      cy.contains(value).click();
      logEvent('Custom select', { value });
    }
    
    return cy.wrap(subject);
  });
});

// * Command to trigger blur with proper event handling
Cypress.Commands.add('rnBlur', { prevSubject: true }, (subject) => {
  return cy.wrap(subject).then(($el) => {
    const element = $el[0];
    
    // * Create and dispatch blur event
    const blurEvent = new FocusEvent('blur', {
      bubbles: true,
      cancelable: true,
      relatedTarget: null,
    });
    
    element.dispatchEvent(blurEvent);
    element.blur();
    logEvent('Blur triggered', { element });
    
    // * Also trigger change if there's a value
    if (element.value !== undefined) {
      const changeEvent = new Event('change', { bubbles: true });
      Object.defineProperty(changeEvent, 'target', {
        value: element,
        enumerable: true,
      });
      element.dispatchEvent(changeEvent);
      logEvent('Change on blur', { value: element.value });
    }
    
    return cy.wrap(subject);
  });
});

// * Command to properly click React Native TouchableOpacity elements
Cypress.Commands.add('rnClick', { prevSubject: true }, (subject) => {
  return cy.wrap(subject).then(($el) => {
    const element = $el[0];
    
    // * Simulate touch events for React Native Web
    const touchStartEvent = new TouchEvent('touchstart', {
      bubbles: true,
      cancelable: true,
      touches: [{ clientX: 0, clientY: 0 } as Touch],
    });
    
    const touchEndEvent = new TouchEvent('touchend', {
      bubbles: true,
      cancelable: true,
      touches: [],
    });
    
    element.dispatchEvent(touchStartEvent);
    logEvent('Touch start', { element });
    
    // * Small delay to simulate real touch
    setTimeout(() => {
      element.dispatchEvent(touchEndEvent);
      logEvent('Touch end', { element });
    }, 50);
    
    // * Also trigger standard click as fallback
    element.click();
    logEvent('Click fallback', { element });
    
    return cy.wrap(subject);
  });
});

// * Helper to wait for React Native Web state updates
Cypress.Commands.add('waitForRNState', (timeout = 100) => {
  cy.wait(timeout);
  
  // Force React to flush any pending updates
  if (typeof window !== 'undefined' && (window as any).React) {
    const React = (window as any).React;
    if (React.unstable_flushSync) {
      React.unstable_flushSync(() => {});
      logEvent('Flushed React updates');
    }
  }
});

// * Helper to get elements with better React Native Web compatibility
Cypress.Commands.add('getRNElement', (selector: string) => {
  // * Try multiple selector strategies
  const selectors = [
    `[data-testid="${selector}"]`,
    `[data-cy="${selector}"]`,
    `[testID="${selector}"]`,
    `[accessibilityTestID="${selector}"]`,
    `[aria-label="${selector}"]`,
  ];
  
  for (const sel of selectors) {
    const element = Cypress.$(sel);
    if (element.length > 0) {
      logEvent('Found element', { selector: sel });
      return cy.get(sel).first();
    }
  }
  
  // * Fallback to standard get
  return cy.get(selector);
});

// * Add type declarations
declare global {
  namespace Cypress {
    interface Chainable {
      rnTypeText(text: string): Chainable<Element>;
      rnSelectOption(value: string): Chainable<Element>;
      rnBlur(): Chainable<Element>;
      rnClick(): Chainable<Element>;
      waitForRNState(timeout?: number): Chainable<void>;
      getRNElement(selector: string): Chainable<Element>;
    }
  }
}

// * Export helper for enabling debug mode
export function enableEventDebug() {
  (window as any).__RN_WEB_EVENT_DEBUG__ = true;
}

// * Export helper for checking if React Native Web is ready
export function isReactNativeWebReady(): boolean {
  if (typeof window === 'undefined') return false;
  
  const hasReact = !!(window as any).React;
  const hasReactDOM = !!(window as any).ReactDOM;
  const hasRNWeb = !!(window as any).__REACT_NATIVE_WEB__;
  
  return hasReact && hasReactDOM;
}

// TODO: * Initialize event handling improvements
export function initializeEventHandling() {
  if (typeof window !== 'undefined' && (window as any).Cypress) {
    // Patch React Native Web's event handling for better test compatibility
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(type: string, listener: any, options?: any) {
      logEvent(`Event listener added: ${type}`);
      return originalAddEventListener.call(this, type, listener, options);
    };
    
    // Ensure Platform.OS is set correctly for tests
    if (Platform) {
      Platform.OS = 'web';
    }
    
    logEvent('Event handling initialized');
  }
}

// Auto-initialize on import
initializeEventHandling();