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
    // ! MANDATORY: Comprehensive debug setup
    cy.comprehensiveDebug();

    // * Clean state before each test
    cy.cleanState();

    // * Setup test user
    cy.setupTestUser();
  });

  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

  // * Example 1: Test across all device viewports
  describe('Navigation Menu Responsiveness', () => {
    ['iphone-x', 'ipad-2', 'macbook-15'].forEach((device) => {
      context(`${device} viewport`, () => {
        beforeEach(function() {
          cy.viewport(device);
          cy.visit('/');
        });

        it(`displays appropriate navigation on ${device}`, () => {
          cy.window().then((win) => {
            if (win.innerWidth < 768) {
              // * Mobile: hamburger menu should be visible
              cy.get('[data-cy="mobile-menu"]').should('be.visible');
              cy.get('[data-cy="desktop-sidebar"]').should('not.exist');
            } else {
              // * Desktop: sidebar should be visible
              cy.get('[data-cy="desktop-sidebar"]').should('be.visible');
              cy.get('[data-cy="mobile-menu"]').should('not.exist');
            }
          });
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
  describe('Comprehensive Viewport Testing', () => {
    it('should test element card across all viewports', () => {
      cy.visit('/elements');

      // * This will run the test across all defined device viewports
      cy.testAcrossViewports('Element Card Display', (device) => {
        // * Common assertions for all viewports
        cy.get('[data-cy="element-card"]').should('be.visible');

        // * Device-specific assertions
        if (device.includes('iphone') || device.includes('samsung')) {
          // * Mobile-specific tests
          cy.get('[data-cy="element-card"]').should('have.css', 'width', '100%');
          cy.get('[data-cy="element-actions"]').should('have.css', 'flex-direction', 'column');
        } else if (device.includes('ipad')) {
          // * Tablet-specific tests
          cy.get('[data-cy="element-card"]').should('not.have.css', 'width', '100%');
          cy.get('[data-cy="element-grid"]').should('have.css', 'grid-template-columns');
        } else {
          // * Desktop-specific tests
          cy.get('[data-cy="element-sidebar"]').should('be.visible');
          cy.get('[data-cy="element-grid"]').should('have.css', 'grid-template-columns');
        }
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