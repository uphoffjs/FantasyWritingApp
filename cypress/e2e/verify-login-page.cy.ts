/// <reference types="cypress" />

/**
 * Simple Login Page Render Test
 * Verifies that the login page loads with all essential elements
 */

describe('Login Page Renders', () => {
  beforeEach(() => {
    // Clear cookies and local storage before each test to ensure a clean state
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.comprehensiveDebugWithBuildCapture(); // Ensure debug and build error capture is active
  });
  it('should render the login page with all essential elements', () => {
    // Visit the app
    cy.visit('/');

    // Verify essential elements are present using testID attributes from LoginScreen.tsx
    // Note: testID in React Native is converted to data-cy for Cypress on web
    cy.get('[data-cy="email-input"]').should('be.visible');
    cy.get('[data-cy="password-input"]').should('be.visible');
    cy.get('[data-cy="submit-button"]').should('be.visible');
    cy.get('[data-cy="signin-tab-button"]').should('be.visible');
    cy.get('[data-cy="signup-tab-button"]').should('be.visible');
    cy.get('[data-cy="remember-me-switch"]').should('be.visible');
    cy.get('[data-cy="forgot-password-link"]').should('be.visible');
  });
});
