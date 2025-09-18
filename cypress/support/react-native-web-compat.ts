// React Native Web Compatibility for Cypress Tests
import { Platform } from 'react-native';

// * Helper to convert React Native testID to data-testid for web
export function setupReactNativeWebCompat() {
  // Ensure Platform is set to web for testing
  if (typeof window !== 'undefined' && (window as any).Cypress) {
    Platform.OS = 'web';
  }
}

// Custom Cypress commands for React Native Web
Cypress.Commands.add('getByTestId', (testId: string) => {
  // * Try multiple selectors for React Native Web compatibility
  return cy.get(`[data-testid="${testId}"],[data-cy="${testId}"],[testID="${testId}"]`).first();
});

// * Helper to wait for React Native Web rendering
Cypress.Commands.add('waitForRNWeb', (timeout = 1000) => {
  cy.wait(timeout);
});

// * Helper to handle React Native Web input events
Cypress.Commands.add('rnType', { prevSubject: true }, (subject, text: string) => {
  // * Clear and type with React Native Web compatibility
  cy.wrap(subject)
    .clear()
    .type(text)
    .blur(); // Ensure blur to trigger onChange
});

// * Helper to handle React Native Web select elements
Cypress.Commands.add('rnSelect', { prevSubject: true }, (subject, value: string) => {
  // * Handle both native select and React Native picker
  if (subject.is('select')) {
    cy.wrap(subject).select(value);
  } else {
    // For React Native pickers, click and select
    cy.wrap(subject).click();
    cy.contains(value).click();
  }
});

// * Add type declarations
declare global {
  namespace Cypress {
    interface Chainable {
      getByTestId(testId: string): Chainable<Element>;
      waitForRNWeb(timeout?: number): Chainable<void>;
      rnType(text: string): Chainable<Element>;
      rnSelect(value: string): Chainable<Element>;
    }
  }
}

// * Initialize on import
setupReactNativeWebCompat();