// * React Native Web specific commands for cross-platform testing
// ! All commands follow Cypress best practices for React Native Web

/**
 * Platform detection helper
 * @returns Current platform (web, ios, android)
 * @example cy.getPlatform().then(platform => { if (platform === 'web') {...} })
 */
Cypress.Commands.add('getPlatform', () => {
  return cy.window().then((win) => {
    // * Check for React Native Web
    const userAgent = win.navigator.userAgent.toLowerCase();

    if (userAgent.includes('mobile') || userAgent.includes('android')) {
      return 'android';
    } else if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
      return 'ios';
    } else {
      return 'web';
    }
  });
});

/**
 * Storage abstraction for AsyncStorage/localStorage
 * @param key - Storage key
 * @param value - Value to store
 * @example cy.setStorageItem('user_token', 'abc123')
 */
Cypress.Commands.add('setStorageItem', (key: string, value: string) => {
  cy.window().then((win) => {
    // * Use localStorage for web, AsyncStorage simulation for React Native Web
    if (win.localStorage) {
      win.localStorage.setItem(key, value);
      cy.task('log', `Set storage item: ${key}`);
    } else {
      // * Fallback to window property for React Native Web
      (win as any).__asyncStorage = (win as any).__asyncStorage || {};
      (win as any).__asyncStorage[key] = value;
      cy.task('log', `Set AsyncStorage item: ${key}`);
    }
  });
});

/**
 * Get storage item
 * @param key - Storage key
 * @example cy.getStorageItem('user_token').then(value => { ... })
 */
Cypress.Commands.add('getStorageItem', (key: string) => {
  return cy.window().then((win) => {
    // * Check localStorage first
    if (win.localStorage) {
      const value = win.localStorage.getItem(key);
      cy.task('log', `Retrieved storage item: ${key}`);
      return value;
    } else {
      // * Fallback to window property
      const storage = (win as any).__asyncStorage || {};
      const value = storage[key];
      cy.task('log', `Retrieved AsyncStorage item: ${key}`);
      return value;
    }
  });
});

/**
 * Clear all storage
 * @example cy.clearStorage()
 */
Cypress.Commands.add('clearStorage', () => {
  cy.window().then((win) => {
    if (win.localStorage) {
      win.localStorage.clear();
      cy.task('log', 'Cleared localStorage');
    }

    // * Also clear AsyncStorage simulation
    (win as any).__asyncStorage = {};
    cy.task('log', 'Cleared AsyncStorage');
  });
});

/**
 * React Navigation helper - navigate to screen
 * @param screenName - Screen name to navigate to
 * @param params - Optional navigation params
 * @example cy.navigateToScreen('Profile', { userId: 123 })
 */
Cypress.Commands.add('navigateToScreen', (screenName: string, params?: any) => {
  cy.task('log', `Navigating to screen: ${screenName}`);

  // * Try multiple navigation methods for compatibility

  // * Method 1: Direct navigation link
  cy.get(`[data-cy="nav-${screenName}"]`).click({ force: true }).then(() => {
    cy.task('log', `Navigated via nav link: ${screenName}`);
  });

  // * If params provided, pass them through window
  if (params) {
    cy.window().then((win) => {
      (win as any).__navigationParams = params;
    });
  }
});

/**
 * Get current screen name
 * @example cy.getCurrentScreen().then(screen => { expect(screen).to.equal('Home') })
 */
Cypress.Commands.add('getCurrentScreen', () => {
  return cy.window().then((win) => {
    // * Check multiple sources for current screen

    // * Method 1: Check data attribute
    const screenElement = win.document.querySelector('[data-cy-screen]');
    if (screenElement) {
      return screenElement.getAttribute('data-cy-screen');
    }

    // * Method 2: Check URL for web
    const pathname = win.location.pathname;
    const screenFromPath = pathname.split('/').pop() || 'Home';

    // * Method 3: Check React Navigation state if available
    const navState = (win as any).__reactNavigationState;
    if (navState && navState.routeName) {
      return navState.routeName;
    }

    return screenFromPath;
  });
});

/**
 * Error boundary detection for React Native Web
 * @example cy.checkForErrorBoundary()
 */
Cypress.Commands.add('checkForErrorBoundary', () => {
  cy.get('body').then(($body) => {
    // * React Native Web error boundary patterns
    const errorPatterns = [
      '[data-cy="error-boundary"]',
      '[data-testid="error-boundary"]',
      '[data-cy="error-fallback"]',
      '.ErrorBoundary',
      '[class*="error-boundary"]',
      '[class*="ErrorFallback"]'
    ];

    let errorFound = false;
    let errorMessage = '';

    errorPatterns.forEach(pattern => {
      const element = $body.find(pattern);
      if (element.length > 0) {
        errorFound = true;
        errorMessage = element.text();
      }
    });

    if (errorFound) {
      cy.task('log', `Error boundary detected: ${errorMessage}`);
      throw new Error(`Error boundary triggered: ${errorMessage}`);
    }

    cy.task('log', 'No error boundaries detected');
  });
});

/**
 * Handle React Native Web animations
 * @param duration - Duration to wait for animations (ms)
 * @example cy.waitForAnimations(500)
 */
Cypress.Commands.add('waitForAnimations', (duration: number = 500) => {
  cy.task('log', `Waiting ${duration}ms for animations`);

  // * Disable animations for faster testing
  cy.window().then((win) => {
    // * Inject CSS to disable animations
    const style = win.document.createElement('style');
    style.innerHTML = `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
    `;
    win.document.head.appendChild(style);
  });

  // * Still wait a bit for React to update
  cy.wait(Math.min(duration, 100));
});

/**
 * Handle React Native TextInput
 * @param selector - Element selector (data-cy or testID)
 * @param text - Text to type
 * @example cy.typeInTextInput('[data-cy="username-input"]', 'john.doe')
 */
Cypress.Commands.add('typeInTextInput', (selector: string, text: string) => {
  // * React Native Web TextInput handling
  cy.get(selector)
    .should('be.visible')
    .focus()
    .clear()
    .type(text, { delay: 50 }); // * Add delay for RN Web

  // * Trigger change event for React Native
  cy.get(selector).trigger('change');
  cy.get(selector).trigger('blur');

  cy.task('log', `Typed in TextInput: ${selector}`);
});

/**
 * Handle React Native TouchableOpacity/Pressable
 * @param selector - Element selector
 * @example cy.tapElement('[data-cy="submit-button"]')
 */
Cypress.Commands.add('tapElement', (selector: string) => {
  // * Simulate tap for React Native Web
  cy.get(selector)
    .should('be.visible')
    .trigger('touchstart')
    .trigger('touchend')
    .click({ force: true }); // * Fallback to click

  cy.task('log', `Tapped element: ${selector}`);
});

/**
 * Handle React Native ScrollView
 * @param selector - ScrollView selector
 * @param direction - Scroll direction
 * @param amount - Scroll amount (pixels)
 * @example cy.scrollInView('[data-cy="scroll-view"]', 'down', 200)
 */
Cypress.Commands.add('scrollInView', (
  selector: string,
  direction: 'up' | 'down' | 'left' | 'right',
  amount: number = 100
) => {
  cy.get(selector).then($element => {
    const element = $element[0];

    switch (direction) {
      case 'down':
        element.scrollTop += amount;
        break;
      case 'up':
        element.scrollTop -= amount;
        break;
      case 'right':
        element.scrollLeft += amount;
        break;
      case 'left':
        element.scrollLeft -= amount;
        break;
    }

    cy.task('log', `Scrolled ${direction} by ${amount}px in: ${selector}`);
  });
});

/**
 * Handle React Native FlatList/VirtualizedList
 * @param selector - List selector
 * @param itemIndex - Index of item to scroll to
 * @example cy.scrollToListItem('[data-cy="project-list"]', 10)
 */
Cypress.Commands.add('scrollToListItem', (selector: string, itemIndex: number) => {
  cy.get(selector).then($list => {
    // * Find the item at the specified index
    const itemSelector = `${selector} [data-cy-index="${itemIndex}"]`;

    // * Scroll the item into view
    cy.get(itemSelector).scrollIntoView();

    cy.task('log', `Scrolled to list item ${itemIndex} in: ${selector}`);
  });
});

/**
 * Verify React Native component rendered
 * @param componentName - Component name to verify
 * @example cy.verifyComponentRendered('HomeScreen')
 */
Cypress.Commands.add('verifyComponentRendered', (componentName: string) => {
  // * Check for component markers
  cy.get(`[data-cy-component="${componentName}"]`).should('exist');

  // * Also check for testID
  cy.get(`[data-testid="${componentName}"]`).should('exist');

  cy.task('log', `Component rendered: ${componentName}`);
});

/**
 * Handle React Native Modal
 * @param action - Action to perform (open, close, verify)
 * @param modalId - Modal identifier
 * @example cy.handleModal('open', 'confirmation-modal')
 */
Cypress.Commands.add('handleModal', (
  action: 'open' | 'close' | 'verify',
  modalId: string
) => {
  switch (action) {
    case 'open':
      cy.get(`[data-cy="open-${modalId}"]`).click();
      cy.get(`[data-cy="${modalId}"]`).should('be.visible');
      break;

    case 'close':
      // * Try multiple close methods
      cy.get(`[data-cy="${modalId}-close"]`).click({ force: true });
      // * Fallback: Press escape
      cy.get('body').type('{esc}');
      cy.get(`[data-cy="${modalId}"]`).should('not.exist');
      break;

    case 'verify':
      cy.get(`[data-cy="${modalId}"]`).should('be.visible');
      break;
  }

  cy.task('log', `Modal ${action}: ${modalId}`);
});

/**
 * Handle React Native Picker/Select
 * @param selector - Picker selector
 * @param value - Value to select
 * @example cy.selectPickerValue('[data-cy="genre-picker"]', 'Fantasy')
 */
Cypress.Commands.add('selectPickerValue', (selector: string, value: string) => {
  // * Open picker
  cy.get(selector).click();

  // * Select value
  cy.get(`[data-cy="picker-option-${value}"]`).click();

  // * Verify selection
  cy.get(selector).should('contain', value);

  cy.task('log', `Selected picker value: ${value} in ${selector}`);
});

/**
 * Handle React Native Switch
 * @param selector - Switch selector
 * @param state - Desired state
 * @example cy.toggleSwitch('[data-cy="dark-mode-switch"]', true)
 */
Cypress.Commands.add('toggleSwitch', (selector: string, state: boolean) => {
  cy.get(selector).then($switch => {
    const currentState = $switch.attr('aria-checked') === 'true';

    if (currentState !== state) {
      cy.get(selector).click();
    }

    // * Verify state
    cy.get(selector).should('have.attr', 'aria-checked', String(state));
  });

  cy.task('log', `Toggle switch ${selector} to: ${state}`);
});

/**
 * Wait for React Native to be ready
 * @example cy.waitForReactNative()
 */
Cypress.Commands.add('waitForReactNative', () => {
  // * Wait for React Native Web to initialize
  cy.window().then((win) => {
    // * Check for React Native global
    const checkReady = () => {
      return !!(win as any).__REACT_NATIVE__;
    };

    // * Wait with timeout
    cy.wrap(null).should(() => {
      expect(checkReady()).to.be.true;
    });
  });

  // * Wait for initial render
  cy.get('[data-cy], [data-testid]').should('exist');

  cy.task('log', 'React Native Web ready');
});

// * Export empty object to prevent TS errors
export {};