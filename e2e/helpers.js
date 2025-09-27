/**
 * Detox E2E Test Helpers
 * Common utilities and helper functions for native testing
 */

/**
 * * Wait for element to be visible with retry
 */
async function waitForElement(testID, timeout = 10000) {
  return await waitFor(element(by.id(testID)))
    .toBeVisible()
    .withTimeout(timeout);
}

/**
 * * Type text into an input field
 */
async function typeText(testID, text, clearFirst = true) {
  const input = element(by.id(testID));

  if (clearFirst) {
    await input.clearText();
  }

  await input.typeText(text);
}

/**
 * * Tap on an element
 */
async function tapElement(testID) {
  await element(by.id(testID)).tap();
}

/**
 * * Scroll to element
 */
async function scrollToElement(testID, direction = 'down', scrollViewTestID = null) {
  const scrollView = scrollViewTestID
    ? element(by.id(scrollViewTestID))
    : element(by.type('RCTScrollView')).atIndex(0);

  await waitFor(element(by.id(testID)))
    .toBeVisible()
    .whileElement(scrollView)
    .scroll(200, direction);
}

/**
 * * Swipe on element
 */
async function swipeElement(testID, direction, speed = 'fast', percentage = 0.75) {
  await element(by.id(testID)).swipe(direction, speed, percentage);
}

/**
 * * Check if element exists (doesn't have to be visible)
 */
async function elementExists(testID) {
  try {
    await expect(element(by.id(testID))).toExist();
    return true;
  } catch {
    return false;
  }
}

/**
 * * Login helper
 */
async function login(email = 'test@example.com', password = 'password123') {
  await waitForElement('email-input');
  await typeText('email-input', email);
  await typeText('password-input', password);
  await tapElement('login-button');

  // * Wait for navigation to complete
  await waitForElement('projects-screen');
}

/**
 * * Navigate to screen
 */
async function navigateToScreen(screenName) {
  const navMapping = {
    'projects': 'nav-projects',
    'elements': 'nav-elements',
    'settings': 'nav-settings',
    'profile': 'nav-profile'
  };

  const navTestID = navMapping[screenName.toLowerCase()];
  if (navTestID) {
    await tapElement(navTestID);
    await waitForElement(`${screenName.toLowerCase()}-screen`);
  }
}

/**
 * * Create a new project
 */
async function createProject(name, description = '') {
  await tapElement('create-project-button');
  await waitForElement('project-name-input');
  await typeText('project-name-input', name);

  if (description) {
    await typeText('project-description-input', description);
  }

  await tapElement('save-project-button');
  await waitForElement('project-card');
}

/**
 * * Create a new element
 */
async function createElement(type, name, description = '') {
  await tapElement(`create-${type}-button`);
  await waitForElement('element-name-input');
  await typeText('element-name-input', name);

  if (description) {
    await typeText('element-description-input', description);
  }

  await tapElement('save-element-button');
  await waitForElement('element-card');
}

/**
 * * Take screenshot
 */
async function takeScreenshot(name) {
  await device.takeScreenshot(name);
}

/**
 * * Reload React Native
 */
async function reloadApp() {
  await device.reloadReactNative();
}

/**
 * * Background and foreground app
 */
async function backgroundApp(duration = null) {
  if (duration) {
    await device.sendToHome();
    await new Promise(resolve => setTimeout(resolve, duration));
    await device.launchApp();
  } else {
    await device.sendToHome();
  }
}

/**
 * * Shake device (for dev menu)
 */
async function shakeDevice() {
  await device.shake();
}

/**
 * * Platform-specific helpers
 */
const platform = {
  isIOS: () => device.getPlatform() === 'ios',
  isAndroid: () => device.getPlatform() === 'android',

  async selectFromPicker(testID, value) {
    if (this.isIOS()) {
      await element(by.id(testID)).setColumnToValue(0, value);
    } else {
      // Android picker handling
      await tapElement(testID);
      await element(by.text(value)).tap();
    }
  },

  async dismissKeyboard() {
    if (this.isIOS()) {
      await element(by.label('Done')).atIndex(0).tap();
    } else {
      await device.pressBack();
    }
  },

  async allowPermission(permission) {
    if (this.isIOS()) {
      await element(by.label('Allow')).tap();
    } else {
      await element(by.text('ALLOW')).tap();
    }
  }
};

module.exports = {
  waitForElement,
  typeText,
  tapElement,
  scrollToElement,
  swipeElement,
  elementExists,
  login,
  navigateToScreen,
  createProject,
  createElement,
  takeScreenshot,
  reloadApp,
  backgroundApp,
  shakeDevice,
  platform
};