// * Responsive testing and viewport commands
// ! All commands follow Cypress best practices for React Native Web

/**
 * Test multiple viewports - Execute test callback for each viewport size
 * @param callback - Function to run for each viewport
 * @example cy.testResponsive((viewport) => { cy.get('[data-cy="menu"]').should('be.visible'); })
 */
Cypress.Commands.add('testResponsive', (callback: (viewport: {name: string; width: number; height: number}) => void) => {
  // * Define viewport configurations
  const viewports = [
    { name: 'mobile', width: 375, height: 812 },    // iPhone X/XS
    { name: 'tablet', width: 768, height: 1024 },   // iPad
    { name: 'desktop', width: 1920, height: 1080 }  // Full HD
  ];

  // * Execute callback for each viewport
  viewports.forEach(viewport => {
    cy.viewport(viewport.width, viewport.height);
    cy.task('log', `Testing in ${viewport.name} viewport (${viewport.width}x${viewport.height})`);
    callback(viewport);
  });
});

/**
 * Simulate touch interactions for React Native Web
 * @param selector - Element selector (data-cy)
 * @param gesture - Type of gesture to simulate
 * @example cy.simulateTouch('[data-cy="button"]', 'tap')
 */
Cypress.Commands.add('simulateTouch', (selector: string, gesture: 'tap' | 'longPress' | 'swipeLeft' | 'swipeRight' | 'swipeUp' | 'swipeDown') => {
  switch(gesture) {
    case 'tap':
      // * Simple tap/click
      cy.get(selector).trigger('touchstart');
      cy.get(selector).trigger('touchend');
      break;

    case 'longPress':
      // * Long press (500ms hold)
      cy.get(selector).trigger('touchstart');
      cy.wait(500);
      cy.get(selector).trigger('touchend');
      break;

    case 'swipeLeft':
      // * Swipe left gesture
      cy.get(selector).trigger('touchstart', {
        touches: [{ clientX: 300, clientY: 100 }]
      });
      cy.get(selector).trigger('touchmove', {
        touches: [{ clientX: 50, clientY: 100 }]
      });
      cy.get(selector).trigger('touchend');
      break;

    case 'swipeRight':
      // * Swipe right gesture
      cy.get(selector).trigger('touchstart', {
        touches: [{ clientX: 50, clientY: 100 }]
      });
      cy.get(selector).trigger('touchmove', {
        touches: [{ clientX: 300, clientY: 100 }]
      });
      cy.get(selector).trigger('touchend');
      break;

    case 'swipeUp':
      // * Swipe up gesture
      cy.get(selector).trigger('touchstart', {
        touches: [{ clientX: 150, clientY: 300 }]
      });
      cy.get(selector).trigger('touchmove', {
        touches: [{ clientX: 150, clientY: 50 }]
      });
      cy.get(selector).trigger('touchend');
      break;

    case 'swipeDown':
      // * Swipe down gesture
      cy.get(selector).trigger('touchstart', {
        touches: [{ clientX: 150, clientY: 50 }]
      });
      cy.get(selector).trigger('touchmove', {
        touches: [{ clientX: 150, clientY: 300 }]
      });
      cy.get(selector).trigger('touchend');
      break;

    default:
      throw new Error(`Unknown gesture: ${gesture}`);
  }

  cy.task('log', `Simulated ${gesture} on ${selector}`);
});

/**
 * Set mobile viewport - iPhone X/XS dimensions
 * @example cy.setMobileViewport()
 */
Cypress.Commands.add('setMobileViewport', () => {
  cy.viewport(375, 812);
  cy.task('log', 'Viewport set to mobile (375x812)');
});

/**
 * Set tablet viewport - iPad dimensions
 * @example cy.setTabletViewport()
 */
Cypress.Commands.add('setTabletViewport', () => {
  cy.viewport(768, 1024);
  cy.task('log', 'Viewport set to tablet (768x1024)');
});

/**
 * Set desktop viewport - Full HD dimensions
 * @example cy.setDesktopViewport()
 */
Cypress.Commands.add('setDesktopViewport', () => {
  cy.viewport(1920, 1080);
  cy.task('log', 'Viewport set to desktop (1920x1080)');
});

/**
 * Check if currently in mobile viewport
 * @example cy.isMobileViewport().then((isMobile) => { if (isMobile) {...} })
 */
Cypress.Commands.add('isMobileViewport', () => {
  return cy.window().then((win) => {
    return win.innerWidth < 768;
  });
});

/**
 * Check if currently in tablet viewport
 * @example cy.isTabletViewport().then((isTablet) => { if (isTablet) {...} })
 */
Cypress.Commands.add('isTabletViewport', () => {
  return cy.window().then((win) => {
    return win.innerWidth >= 768 && win.innerWidth < 1024;
  });
});

/**
 * Check if currently in desktop viewport
 * @example cy.isDesktopViewport().then((isDesktop) => { if (isDesktop) {...} })
 */
Cypress.Commands.add('isDesktopViewport', () => {
  return cy.window().then((win) => {
    return win.innerWidth >= 1024;
  });
});

/**
 * Test element visibility across viewports
 * @param selector - Element selector (data-cy)
 * @param expectations - Visibility expectations for each viewport
 * @example cy.testVisibilityAcrossViewports('[data-cy="sidebar"]', { mobile: false, tablet: true, desktop: true })
 */
Cypress.Commands.add('testVisibilityAcrossViewports', (
  selector: string,
  expectations: { mobile: boolean; tablet: boolean; desktop: boolean }
) => {
  // * Test mobile viewport
  cy.setMobileViewport();
  if (expectations.mobile) {
    cy.get(selector).should('be.visible');
  } else {
    cy.get(selector).should('not.exist');
  }

  // * Test tablet viewport
  cy.setTabletViewport();
  if (expectations.tablet) {
    cy.get(selector).should('be.visible');
  } else {
    cy.get(selector).should('not.exist');
  }

  // * Test desktop viewport
  cy.setDesktopViewport();
  if (expectations.desktop) {
    cy.get(selector).should('be.visible');
  } else {
    cy.get(selector).should('not.exist');
  }
});

/**
 * Simulate pinch zoom gesture
 * @param selector - Element selector (data-cy)
 * @param scale - Scale factor (1.5 = zoom in, 0.5 = zoom out)
 * @example cy.pinch('[data-cy="image"]', 1.5)
 */
Cypress.Commands.add('pinch', (selector: string, scale: number) => {
  cy.get(selector).trigger('touchstart', {
    touches: [
      { identifier: 1, clientX: 100, clientY: 100 },
      { identifier: 2, clientX: 200, clientY: 200 }
    ]
  });

  const distance = 100 * scale;
  cy.get(selector).trigger('touchmove', {
    touches: [
      { identifier: 1, clientX: 150 - distance/2, clientY: 150 - distance/2 },
      { identifier: 2, clientX: 150 + distance/2, clientY: 150 + distance/2 }
    ]
  });

  cy.get(selector).trigger('touchend');
  cy.task('log', `Simulated pinch ${scale > 1 ? 'zoom in' : 'zoom out'} on ${selector}`);
});

/**
 * Simulate rotation gesture
 * @param selector - Element selector (data-cy)
 * @param degrees - Degrees to rotate
 * @example cy.rotate('[data-cy="image"]', 90)
 */
Cypress.Commands.add('rotate', (selector: string, degrees: number) => {
  const radians = (degrees * Math.PI) / 180;

  cy.get(selector).trigger('touchstart', {
    touches: [
      { identifier: 1, clientX: 150, clientY: 100 },
      { identifier: 2, clientX: 150, clientY: 200 }
    ]
  });

  // * Calculate new positions after rotation
  const centerX = 150;
  const centerY = 150;
  const radius = 50;

  cy.get(selector).trigger('touchmove', {
    touches: [
      {
        identifier: 1,
        clientX: centerX + radius * Math.cos(radians),
        clientY: centerY + radius * Math.sin(radians)
      },
      {
        identifier: 2,
        clientX: centerX - radius * Math.cos(radians),
        clientY: centerY - radius * Math.sin(radians)
      }
    ]
  });

  cy.get(selector).trigger('touchend');
  cy.task('log', `Simulated rotation of ${degrees} degrees on ${selector}`);
});

// * Export empty object to prevent TS errors
export {};