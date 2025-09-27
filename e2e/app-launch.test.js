/**
 * App Launch E2E Tests
 * Tests app initialization and basic navigation
 */

const {
  waitForElement,
  typeText,
  tapElement,
  takeScreenshot,
  platform
} = require('./helpers');

describe('App Launch and Initialization', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      delete: true
    });
  });

  it('should show login screen on first launch', async () => {
    await waitForElement('login-screen');
    await expect(element(by.id('login-screen'))).toBeVisible();

    // * Check for login form elements
    await expect(element(by.id('email-input'))).toBeVisible();
    await expect(element(by.id('password-input'))).toBeVisible();
    await expect(element(by.id('login-button'))).toBeVisible();

    await takeScreenshot('login-screen');
  });

  it('should show error on invalid login', async () => {
    await typeText('email-input', 'invalid@email');
    await typeText('password-input', 'wrong');
    await tapElement('login-button');

    await waitForElement('error-message');
    await expect(element(by.id('error-message'))).toBeVisible();

    await takeScreenshot('login-error');
  });

  it('should login successfully with valid credentials', async () => {
    await typeText('email-input', 'test@example.com');
    await typeText('password-input', 'password123');
    await tapElement('login-button');

    // * Should navigate to projects screen
    await waitForElement('projects-screen');
    await expect(element(by.id('projects-screen'))).toBeVisible();

    await takeScreenshot('projects-screen-after-login');
  });

  it('should have working bottom navigation', async () => {
    // * Test navigation to different screens
    const screens = [
      { nav: 'nav-elements', screen: 'elements-screen' },
      { nav: 'nav-settings', screen: 'settings-screen' },
      { nav: 'nav-projects', screen: 'projects-screen' }
    ];

    for (const { nav, screen } of screens) {
      await tapElement(nav);
      await waitForElement(screen);
      await expect(element(by.id(screen))).toBeVisible();
    }
  });

  it('should handle app backgrounding and foregrounding', async () => {
    // * Background the app
    await device.sendToHome();

    // * Wait a moment
    await new Promise(resolve => setTimeout(resolve, 2000));

    // * Foreground the app
    await device.launchApp();

    // * Should still be on the same screen
    await expect(element(by.id('projects-screen'))).toBeVisible();
  });

  if (platform.isIOS()) {
    it('should show dev menu on shake (iOS)', async () => {
      await device.shake();

      // * Dev menu should appear
      await waitFor(element(by.text('Reload')))
        .toBeVisible()
        .withTimeout(5000);

      // * Dismiss dev menu
      await tapElement('Cancel');
    });
  }

  it('should handle orientation changes', async () => {
    // * Portrait to landscape
    await device.setOrientation('landscape');
    await expect(element(by.id('projects-screen'))).toBeVisible();

    // * Back to portrait
    await device.setOrientation('portrait');
    await expect(element(by.id('projects-screen'))).toBeVisible();
  });

  it('should handle network disconnection gracefully', async () => {
    // * Disable network
    await device.disableSynchronization();
    await device.setURLBlacklist(['.*']);

    // * Try to refresh projects
    await element(by.id('projects-list')).swipe('down');

    // * Should show offline message
    await waitForElement('offline-indicator');

    // * Re-enable network
    await device.setURLBlacklist([]);
    await device.enableSynchronization();
  });
});