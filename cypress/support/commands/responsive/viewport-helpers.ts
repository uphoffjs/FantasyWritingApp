/**
 * @fileoverview Enhanced Responsive Viewport Testing Helpers
 * Following Cypress best practices for mobile-first React Native Web testing
 *
 * Best Practice: Test across multiple viewports to ensure responsive design
 * Mobile-first approach for React Native Web applications
 */

 
// ! These are generic viewport helper commands that accept any selector type

// * Device viewport presets using Cypress built-in device names
export const DEVICE_VIEWPORTS = [
  'iphone-x',      // 375x812
  'iphone-6',      // 375x667
  'ipad-2',        // 768x1024
  'ipad-mini',     // 768x1024
  'samsung-s10',   // 360x760
  'samsung-note9', // 414x846
  'macbook-11',    // 1366x768
  'macbook-13',    // 1280x800
  'macbook-15',    // 1440x900
  'macbook-16'     // 1536x960
] as const;

// * Custom viewport configurations for specific test scenarios
export const CUSTOM_VIEWPORTS = {
  mobile: { width: 375, height: 812, name: 'Mobile' },
  tablet: { width: 768, height: 1024, name: 'Tablet' },
  desktop: { width: 1920, height: 1080, name: 'Desktop' },
  ultrawide: { width: 2560, height: 1440, name: 'Ultrawide' }
} as const;

// * Breakpoint definitions for responsive testing
export const BREAKPOINTS = {
  mobile: 640,
  tablet: 768,
  laptop: 1024,
  desktop: 1280
} as const;

/**
 * Test Component Across All Device Viewports
 * Template for comprehensive responsive testing
 */
Cypress.Commands.add('testAcrossViewports', (
  testDescription: string,
  testCallback: (device: string) => void
) => {
  describe(`Responsive Design: ${testDescription}`, () => {
    DEVICE_VIEWPORTS.forEach((device) => {
      // eslint-disable-next-line no-undef
      context(`${device} viewport`, () => {
        beforeEach(function() {
          // ! MANDATORY: Comprehensive debug setup
          cy.comprehensiveDebug();
          cy.cleanState();

          // * Set viewport to device preset
          cy.viewport(device);
          cy.log(`📱 Testing on ${device}`);
        });

        afterEach(function() {
          if (this.currentTest.state === 'failed') {
            cy.captureFailureDebug();
          }
        });

        it(`should render correctly on ${device}`, () => {
          testCallback(device);
        });
      });
    });
  });
});

/**
 * Test Specific Breakpoint Transitions
 * Verify behavior when crossing responsive breakpoints
 */
Cypress.Commands.add('testBreakpointTransition', (
  fromViewport: keyof typeof CUSTOM_VIEWPORTS,
  toViewport: keyof typeof CUSTOM_VIEWPORTS,
  assertions: {
    before: () => void;
    after: () => void;
  }
) => {
  const from = CUSTOM_VIEWPORTS[fromViewport];
  const to = CUSTOM_VIEWPORTS[toViewport];

  // * Test initial viewport
  cy.viewport(from.width, from.height);
  cy.log(`📐 Starting at ${from.name} (${from.width}x${from.height})`);
  assertions.before();

  // * Transition to new viewport
  cy.viewport(to.width, to.height);
  cy.log(`📐 Transitioning to ${to.name} (${to.width}x${to.height})`);
  assertions.after();
});

/**
 * Assert Responsive Element Visibility
 * Check if elements show/hide at correct breakpoints
 */
Cypress.Commands.add('assertResponsiveVisibility', (
  selector: string,
  visibilityMap: {
    mobile?: boolean;
    tablet?: boolean;
    desktop?: boolean;
  }
) => {
  Object.entries(visibilityMap).forEach(([viewport, shouldBeVisible]) => {
    if (viewport in CUSTOM_VIEWPORTS) {
      const config = CUSTOM_VIEWPORTS[viewport as keyof typeof CUSTOM_VIEWPORTS];
      cy.viewport(config.width, config.height);

      if (shouldBeVisible) {
        cy.get(selector).should('be.visible');
        cy.log(`✅ ${selector} visible on ${viewport}`);
      } else {
        cy.get(selector).should('not.exist');
        cy.log(`✅ ${selector} hidden on ${viewport}`);
      }
    }
  });
});

/**
 * Test Orientation Changes
 * Verify behavior in portrait vs landscape modes
 */
Cypress.Commands.add('testOrientation', (
  device: string,
  orientationTests: {
    portrait: () => void;
    landscape: () => void;
  }
) => {
  // * Test portrait orientation
  cy.viewport(device);
  cy.log(`📱 Testing ${device} in portrait`);
  orientationTests.portrait();

  // * Test landscape orientation (swap width/height)
  cy.viewport(device, 'landscape');
  cy.log(`📱 Testing ${device} in landscape`);
  orientationTests.landscape();
});

/**
 * Assert Layout Properties at Different Viewports
 * Verify CSS properties change correctly across breakpoints
 */
Cypress.Commands.add('assertResponsiveLayout', (
  selector: string,
  layoutMap: {
    mobile?: Record<string, string>;
    tablet?: Record<string, string>;
    desktop?: Record<string, string>;
  }
) => {
  Object.entries(layoutMap).forEach(([viewport, cssProperties]) => {
    if (viewport in CUSTOM_VIEWPORTS) {
      const config = CUSTOM_VIEWPORTS[viewport as keyof typeof CUSTOM_VIEWPORTS];
      cy.viewport(config.width, config.height);

      cy.get(selector).should((element) => {
        Object.entries(cssProperties).forEach(([property, value]) => {
          expect(element).to.have.css(property, value);
        });
      });

      cy.log(`✅ Layout verified for ${viewport}`);
    }
  });
});

/**
 * Test Touch vs Mouse Interactions
 * Ensure both input methods work across devices
 */
Cypress.Commands.add('testInteractionMethods', (
  selector: string,
  action: 'click' | 'hover' | 'drag'
) => {
  // * Mobile touch interaction
  cy.viewport('iphone-x');
  if (action === 'click') {
    cy.get(selector).trigger('touchstart');
    cy.get(selector).trigger('touchend');
  }

  // * Desktop mouse interaction
  cy.viewport('macbook-15');
  if (action === 'click') {
    cy.get(selector).click();
  } else if (action === 'hover') {
    cy.get(selector).trigger('mouseenter');
  }
});

// * TypeScript definitions
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      testAcrossViewports(
        testDescription: string,
        testCallback: (device: string) => void
      ): void;

      testBreakpointTransition(
        fromViewport: keyof typeof CUSTOM_VIEWPORTS,
        toViewport: keyof typeof CUSTOM_VIEWPORTS,
        assertions: { before: () => void; after: () => void }
      ): void;

      assertResponsiveVisibility(
        selector: string,
        visibilityMap: {
          mobile?: boolean;
          tablet?: boolean;
          desktop?: boolean;
        }
      ): void;

      testOrientation(
        device: string,
        orientationTests: {
          portrait: () => void;
          landscape: () => void;
        }
      ): void;

      assertResponsiveLayout(
        selector: string,
        layoutMap: {
          mobile?: Record<string, string>;
          tablet?: Record<string, string>;
          desktop?: Record<string, string>;
        }
      ): void;

      testInteractionMethods(
        selector: string,
        action: 'click' | 'hover' | 'drag'
      ): void;
    }
  }
}

export {};