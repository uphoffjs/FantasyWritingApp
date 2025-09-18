/// <reference types="cypress" />

/**
 * Viewport presets for React Native Web testing
 * Covers common device sizes for responsive testing
 */

export const viewportPresets = {
  // Mobile devices
  mobile: {
    iPhoneSE: { width: 375, height: 667, name: 'iPhone SE' },
    iPhone12: { width: 390, height: 844, name: 'iPhone 12' },
    iPhone14Pro: { width: 393, height: 852, name: 'iPhone 14 Pro' },
    galaxyS21: { width: 384, height: 854, name: 'Galaxy S21' },
    pixel5: { width: 393, height: 851, name: 'Pixel 5' },
  },
  
  // Tablet devices
  tablet: {
    iPadMini: { width: 768, height: 1024, name: 'iPad Mini' },
    iPadAir: { width: 820, height: 1180, name: 'iPad Air' },
    iPadPro11: { width: 834, height: 1194, name: 'iPad Pro 11"' },
    iPadPro12: { width: 1024, height: 1366, name: 'iPad Pro 12.9"' },
    surfacePro: { width: 912, height: 1368, name: 'Surface Pro' },
  },
  
  // Desktop sizes
  desktop: {
    small: { width: 1280, height: 720, name: 'Small Desktop' },
    medium: { width: 1440, height: 900, name: 'Medium Desktop' },
    large: { width: 1920, height: 1080, name: 'Full HD' },
    xlarge: { width: 2560, height: 1440, name: '2K' },
  },
  
  // Orientation variants
  landscape: {
    iPhoneSE: { width: 667, height: 375, name: 'iPhone SE Landscape' },
    iPhone12: { width: 844, height: 390, name: 'iPhone 12 Landscape' },
    iPadMini: { width: 1024, height: 768, name: 'iPad Mini Landscape' },
  }
};

/**
 * Custom Cypress commands for viewport testing
 */
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Set viewport to a preset device
       */
      setDevice(preset: keyof typeof viewportPresets.mobile | 
                       keyof typeof viewportPresets.tablet | 
                       keyof typeof viewportPresets.desktop): Chainable<void>;
      
      /**
       * Test across multiple viewports
       */
      testResponsive(callback: () => void): Chainable<void>;
      
      /**
       * Test in mobile viewport
       */
      testMobile(callback: () => void): Chainable<void>;
      
      /**
       * Test in tablet viewport
       */
      testTablet(callback: () => void): Chainable<void>;
      
      /**
       * Test in desktop viewport
       */
      testDesktop(callback: () => void): Chainable<void>;
      
      /**
       * Check if current viewport is mobile size
       */
      isMobile(): Chainable<boolean>;
      
      /**
       * Check if current viewport is tablet size
       */
      isTablet(): Chainable<boolean>;
      
      /**
       * Check if current viewport is desktop size
       */
      isDesktop(): Chainable<boolean>;
    }
  }
}

/**
 * Set viewport to a specific device preset
 */
Cypress.Commands.add('setDevice', (deviceKey: string) => {
  // Find the device in all categories
  let device = null;
  
  for (const category of Object.values(viewportPresets)) {
    if (deviceKey in category) {
      device = category[deviceKey as keyof typeof category];
      break;
    }
  }
  
  if (device) {
    cy.viewport(device.width, device.height);
    cy.log(`📱 Viewport set to ${device.name} (${device.width}x${device.height})`);
  } else {
    throw new Error(`Device preset '${deviceKey}' not found`);
  }
});

/**
 * Test across multiple responsive breakpoints
 */
Cypress.Commands.add('testResponsive', (callback: () => void) => {
  const breakpoints = [
    viewportPresets.mobile.iPhoneSE,
    viewportPresets.tablet.iPadMini,
    viewportPresets.desktop.medium,
  ];
  
  breakpoints.forEach(breakpoint => {
    cy.viewport(breakpoint.width, breakpoint.height);
    cy.log(`📱 Testing on ${breakpoint.name}`);
    callback();
  });
});

/**
 * Test in mobile viewport
 */
Cypress.Commands.add('testMobile', (callback: () => void) => {
  cy.viewport(viewportPresets.mobile.iPhone12.width, viewportPresets.mobile.iPhone12.height);
  cy.log('📱 Testing mobile viewport');
  callback();
});

/**
 * Test in tablet viewport
 */
Cypress.Commands.add('testTablet', (callback: () => void) => {
  cy.viewport(viewportPresets.tablet.iPadMini.width, viewportPresets.tablet.iPadMini.height);
  cy.log('📱 Testing tablet viewport');
  callback();
});

/**
 * Test in desktop viewport
 */
Cypress.Commands.add('testDesktop', (callback: () => void) => {
  cy.viewport(viewportPresets.desktop.medium.width, viewportPresets.desktop.medium.height);
  cy.log('💻 Testing desktop viewport');
  callback();
});

/**
 * Check if current viewport is mobile size
 */
Cypress.Commands.add('isMobile', () => {
  return cy.window().then(win => {
    return win.innerWidth < 768;
  });
});

/**
 * Check if current viewport is tablet size
 */
Cypress.Commands.add('isTablet', () => {
  return cy.window().then(win => {
    return win.innerWidth >= 768 && win.innerWidth < 1024;
  });
});

/**
 * Check if current viewport is desktop size
 */
Cypress.Commands.add('isDesktop', () => {
  return cy.window().then(win => {
    return win.innerWidth >= 1024;
  });
});

/**
 * Helper function to get current breakpoint
 */
export function getCurrentBreakpoint(): 'mobile' | 'tablet' | 'desktop' {
  const width = Cypress.config('viewportWidth');
  
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

/**
 * Helper to conditionally run tests based on viewport
 */
export function conditionalTest(
  condition: 'mobile' | 'tablet' | 'desktop' | 'all',
  testName: string,
  testFn: () => void
) {
  const currentBreakpoint = getCurrentBreakpoint();
  
  if (condition === 'all' || condition === currentBreakpoint) {
    it(testName, testFn);
  } else {
    it.skip(`${testName} (skipped for ${currentBreakpoint})`, testFn);
  }
}

// Export for use in test files
export default viewportPresets;