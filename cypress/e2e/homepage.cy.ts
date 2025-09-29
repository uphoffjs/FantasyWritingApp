// Homepage E2E tests

import { selectors } from '../support/selectors';

describe('Homepage', () => {
  beforeEach(() => {
    // ! MANDATORY: Comprehensive debug setup
    cy.comprehensiveDebug();

    // * Visit the application
    cy.visit('/');
  });

  it('should display the homepage', () => {
    // * Check that the main app container is visible
    cy.get('[data-cy="app-root"]').should('be.visible');
    
    // * You can add more specific checks here once the app structure is known
    // * For example:
    // TODO: cy.get(selectors.screens.home).should('be.visible');
  });

  it('should have proper accessibility', () => {
    // * Check accessibility compliance
    cy.checkAccessibility();
  });

  it('should be responsive', () => {
    // * Test different viewport sizes
    const viewports: Array<[number, number]> = [
      [375, 667],   // iPhone SE
      [768, 1024],  // iPad
      [1920, 1080], // Desktop
    ];

    viewports.forEach(([width, height]) => {
      cy.viewport(width, height);
      cy.get('[data-cy="app-root"]').should('be.visible');
      // * Add more responsive checks here
    });
  });
});