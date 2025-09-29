/**
 * @fileoverview Example Responsive Viewport Tests
 * Demonstrates best practices for testing responsive design in React Native Web
 *
 * User Story:
 * As a user accessing the app on different devices
 * I want the interface to adapt to my screen size
 * So that I have an optimal viewing experience
 *
 * Acceptance Criteria:
 * - Mobile menu should show on small screens
 * - Desktop sidebar should show on large screens
 * - Touch interactions work on mobile devices
 * - Content reflows appropriately at breakpoints
 */

import { DEVICE_VIEWPORTS, CUSTOM_VIEWPORTS } from '../../support/commands/responsive/viewport-helpers';

describe('Responsive Design Tests', () => {
  beforeEach(function() {
    // * Setup test user
    cy.setupTestUser();
  });

  // ! NOTE: Failure handling is done globally in cypress/support/e2e.ts
  // ! Following Cypress best practices - no conditional statements in tests

  // * Example 1: Test across all device viewports
  // ! Following Cypress best practices - separate tests for different conditions instead of if/else
  describe('Navigation Menu Responsiveness', () => {
    // * Mobile device tests
    const mobileDevices = ['iphone-x'];
    mobileDevices.forEach((device) => {
      context(`${device} viewport (mobile)`, () => {
        beforeEach(function() {
          cy.viewport(device);
          cy.visit('/');
        });

        it(`displays mobile navigation on ${device}`, () => {
          // * Mobile: hamburger menu should be visible
          cy.get('[data-cy="mobile-menu"]').should('be.visible');
          cy.get('[data-cy="desktop-sidebar"]').should('not.exist');
        });
      });
    });

    // * Tablet device tests
    const tabletDevices = ['ipad-2'];
    tabletDevices.forEach((device) => {
      context(`${device} viewport (tablet)`, () => {
        beforeEach(function() {
          cy.viewport(device);
          cy.visit('/');
        });

        it(`displays appropriate navigation on ${device}`, () => {
          // * Tablet may show desktop or mobile depending on orientation
          // * Test should check for one or the other without conditionals
          cy.get('body').then($body => {
            // * Use data attributes set by the app based on viewport
            const viewportMode = $body.attr('data-viewport-mode');
            cy.wrap(viewportMode).should('be.oneOf', ['tablet', 'desktop']);
          });
        });
      });
    });

    // * Desktop device tests
    const desktopDevices = ['macbook-15'];
    desktopDevices.forEach((device) => {
      context(`${device} viewport (desktop)`, () => {
        beforeEach(function() {
          cy.viewport(device);
          cy.visit('/');
        });

        it(`displays desktop navigation on ${device}`, () => {
          // * Desktop: sidebar should be visible
          cy.get('[data-cy="desktop-sidebar"]').should('be.visible');
          cy.get('[data-cy="mobile-menu"]').should('not.exist');
        });
      });
    });
  });

  // * Example 2: Test breakpoint transitions
  describe('Breakpoint Transition Tests', () => {
    it('should handle menu transition from mobile to desktop', () => {
      cy.visit('/');

      cy.testBreakpointTransition('mobile', 'desktop', {
        before: () => {
          // * Mobile view assertions
          cy.get('[data-cy="mobile-menu"]').should('be.visible');
          cy.get('[data-cy="desktop-sidebar"]').should('not.exist');
        },
        after: () => {
          // * Desktop view assertions
          cy.get('[data-cy="desktop-sidebar"]').should('be.visible');
          cy.get('[data-cy="mobile-menu"]').should('not.exist');
        }
      });
    });
  });

  // * Example 3: Test responsive visibility
  describe('Element Visibility Tests', () => {
    it('should show/hide elements based on viewport', () => {
      cy.visit('/');

      // * Define visibility rules for different elements
      cy.assertResponsiveVisibility('[data-cy="mobile-menu"]', {
        mobile: true,
        tablet: true,
        desktop: false
      });

      cy.assertResponsiveVisibility('[data-cy="desktop-sidebar"]', {
        mobile: false,
        tablet: false,
        desktop: true
      });

      cy.assertResponsiveVisibility('[data-cy="tablet-toolbar"]', {
        mobile: false,
        tablet: true,
        desktop: false
      });
    });
  });

  // * Example 4: Test orientation changes
  describe('Orientation Tests', () => {
    it('should adapt layout for portrait and landscape', () => {
      cy.visit('/');

      cy.testOrientation('ipad-2', {
        portrait: () => {
          // * Portrait layout assertions
          cy.get('[data-cy="content-area"]').should('have.css', 'flex-direction', 'column');
          cy.get('[data-cy="sidebar"]').should('have.css', 'width', '100%');
        },
        landscape: () => {
          // * Landscape layout assertions
          cy.get('[data-cy="content-area"]').should('have.css', 'flex-direction', 'row');
          cy.get('[data-cy="sidebar"]').should('not.have.css', 'width', '100%');
        }
      });
    });
  });

  // * Example 5: Test responsive layout properties
  describe('Layout Property Tests', () => {
    it('should apply correct styles at different breakpoints', () => {
      cy.visit('/');

      cy.assertResponsiveLayout('[data-cy="main-content"]', {
        mobile: {
          'padding': '16px',
          'font-size': '14px',
          'max-width': '100%'
        },
        tablet: {
          'padding': '24px',
          'font-size': '16px',
          'max-width': '768px'
        },
        desktop: {
          'padding': '32px',
          'font-size': '16px',
          'max-width': '1200px'
        }
      });
    });
  });

  // * Example 6: Test touch vs mouse interactions
  describe('Interaction Method Tests', () => {
    it('should handle both touch and mouse events', () => {
      cy.visit('/');

      // * Test will automatically switch between mobile (touch) and desktop (mouse)
      cy.testInteractionMethods('[data-cy="action-button"]', 'click');

      // * Verify the action was triggered in both cases
      cy.get('[data-cy="action-result"]').should('be.visible');
    });
  });

  // * Example 7: Comprehensive viewport test using helper
  // ! Following Cypress best practices - separate tests for each device category
  describe('Comprehensive Viewport Testing', () => {
    // * Mobile device tests
    describe('Mobile Viewports', () => {
      const mobileDevices = ['iphone-x', 'samsung-s10'];

      mobileDevices.forEach((device) => {
        it(`should display element card correctly on ${device}`, () => {
          cy.viewport(device);
          cy.visit('/elements');

          // * Common assertions for all viewports
          cy.get('[data-cy="element-card"]').should('be.visible');

          // * Mobile-specific tests
          cy.get('[data-cy="element-card"]').should('have.css', 'width', '100%');
          cy.get('[data-cy="element-actions"]').should('have.css', 'flex-direction', 'column');
        });
      });
    });

    // * Tablet device tests
    describe('Tablet Viewports', () => {
      const tabletDevices = ['ipad-2', 'ipad-pro'];

      tabletDevices.forEach((device) => {
        it(`should display element card correctly on ${device}`, () => {
          cy.viewport(device);
          cy.visit('/elements');

          // * Common assertions for all viewports
          cy.get('[data-cy="element-card"]').should('be.visible');

          // * Tablet-specific tests
          cy.get('[data-cy="element-card"]').should('not.have.css', 'width', '100%');
          cy.get('[data-cy="element-grid"]').should('have.css', 'grid-template-columns');
        });
      });
    });

    // * Desktop device tests
    describe('Desktop Viewports', () => {
      const desktopDevices = ['macbook-15', 'macbook-13'];

      desktopDevices.forEach((device) => {
        it(`should display element card correctly on ${device}`, () => {
          cy.viewport(device);
          cy.visit('/elements');

          // * Common assertions for all viewports
          cy.get('[data-cy="element-card"]').should('be.visible');

          // * Desktop-specific tests
          cy.get('[data-cy="element-sidebar"]').should('be.visible');
          cy.get('[data-cy="element-grid"]').should('have.css', 'grid-template-columns');
        });
      });
    });
  });

  // * Example 8: React Native Web specific responsive tests
  describe('React Native Web Responsive Behavior', () => {
    it('should handle React Native style transformations', () => {
      cy.visit('/');

      // * Test mobile viewport (React Native primary target)
      cy.viewport('iphone-x');
      cy.get('[data-cy="react-native-view"]').should('have.css', 'display', 'flex');
      cy.get('[data-cy="react-native-text"]').should('have.css', 'display', 'inline');

      // * Test desktop viewport (web adaptation)
      cy.viewport('macbook-15');
      cy.get('[data-cy="react-native-view"]').should('have.css', 'display', 'flex');
      // * React Native Web maintains consistency across viewports
    });

    it('should handle ScrollView responsiveness', () => {
      cy.visit('/elements');

      // * Mobile: vertical scroll
      cy.viewport('iphone-x');
      cy.get('[data-cy="element-scroll-view"]').should('have.css', 'overflow-y', 'auto');

      // * Desktop: might have different scroll behavior
      cy.viewport('macbook-15');
      cy.get('[data-cy="element-scroll-view"]').should('be.visible');
    });
  });
});

// * Export for reuse in other tests
export const testResponsiveElement = (elementSelector: string) => {
  DEVICE_VIEWPORTS.forEach(device => {
    cy.viewport(device);
    cy.get(elementSelector).should('be.visible');
    cy.log(`✅ ${elementSelector} renders on ${device}`);
  });
};