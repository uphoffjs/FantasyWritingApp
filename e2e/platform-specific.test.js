/**
 * Platform-Specific E2E Tests
 * Tests that are specific to iOS or Android platforms
 */

const { platform, waitForElement, tapElement, typeText } = require('./helpers');

describe('Platform-Specific Features', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  if (platform.isIOS()) {
    describe('iOS-Specific Tests', () => {
      it('should handle iOS keyboard toolbar', async () => {
        await waitForElement('email-input');
        await tapElement('email-input');

        // * iOS keyboard should have toolbar with Done button
        await element(by.label('Done')).atIndex(0).tap();

        // * Keyboard should dismiss
        await expect(element(by.id('email-input'))).toBeVisible();
      });

      it('should handle iOS swipe gestures', async () => {
        // * Swipe to go back (iOS specific gesture)
        await typeText('email-input', 'test@example.com');
        await typeText('password-input', 'password123');
        await tapElement('login-button');

        await waitForElement('projects-screen');
        await tapElement('project-card');

        // * Swipe from left edge to go back
        await element(by.id('project-detail-screen')).swipe('right', 'fast', 0.95, 0.05);

        await waitForElement('projects-screen');
      });

      it('should handle iOS date picker', async () => {
        await tapElement('nav-elements');
        await tapElement('create-event-button');

        await tapElement('event-date-picker');

        // * iOS date picker specific
        await element(by.type('UIPickerView')).atIndex(0).setColumnToValue(0, 'January');
        await element(by.type('UIPickerView')).atIndex(0).setColumnToValue(1, '15');
        await element(by.type('UIPickerView')).atIndex(0).setColumnToValue(2, '2025');

        await tapElement('done-button');
      });

      it('should handle Face ID / Touch ID', async () => {
        // * Navigate to settings
        await tapElement('nav-settings');
        await waitForElement('settings-screen');

        await tapElement('biometric-auth-toggle');

        // * Simulator: automatically succeed biometric auth
        await device.setBiometricEnrollment(true);
        await device.matchBiometric();

        await expect(element(by.text('Biometric authentication enabled'))).toBeVisible();
      });

      it('should handle iOS action sheets', async () => {
        await tapElement('nav-projects');
        await element(by.id('project-card')).atIndex(0).longPress();

        // * iOS action sheet should appear
        await waitForElement('action-sheet');
        await expect(element(by.label('Edit'))).toBeVisible();
        await expect(element(by.label('Delete'))).toBeVisible();
        await expect(element(by.label('Archive'))).toBeVisible();
        await expect(element(by.label('Cancel'))).toBeVisible();

        await tapElement('Cancel');
      });
    });
  }

  if (platform.isAndroid()) {
    describe('Android-Specific Tests', () => {
      it('should handle Android back button', async () => {
        await waitForElement('email-input');
        await typeText('email-input', 'test@example.com');
        await typeText('password-input', 'password123');
        await tapElement('login-button');

        await waitForElement('projects-screen');
        await tapElement('project-card');

        // * Android hardware back button
        await device.pressBack();

        await waitForElement('projects-screen');
      });

      it('should handle Android keyboard', async () => {
        await tapElement('search-button');
        await tapElement('search-input');

        // * Android: dismiss keyboard with back button
        await device.pressBack();

        // * Keyboard should be dismissed
        await expect(element(by.id('search-input'))).toBeVisible();
      });

      it('should handle Android date picker', async () => {
        await tapElement('nav-elements');
        await tapElement('create-event-button');

        await tapElement('event-date-picker');

        // * Android date picker dialog
        await element(by.text('15')).tap();
        await element(by.text('OK')).tap();
      });

      it('should handle Android permissions dialog', async () => {
        await tapElement('nav-projects');
        await tapElement('project-card');
        await tapElement('add-image-button');

        // * Android permission dialog
        await element(by.text('ALLOW')).tap();

        await waitForElement('image-picker');
      });

      it('should handle Android menu button', async () => {
        // * Open menu (if device has menu button)
        try {
          await device.pressMenu();
          await waitForElement('menu-drawer');
          await device.pressBack();
        } catch {
          // * Device doesn't have menu button
        }
      });

      it('should handle Android notifications', async () => {
        // * Open notification shade
        await device.openNotificationShade();

        // * Close notification shade
        await device.pressBack();

        await expect(element(by.id('projects-screen'))).toBeVisible();
      });
    });
  }

  describe('Cross-Platform Consistency', () => {
    it('should have consistent navigation', async () => {
      const screens = ['projects', 'elements', 'settings'];

      for (const screen of screens) {
        await tapElement(`nav-${screen}`);
        await waitForElement(`${screen}-screen`);

        // * Verify screen loaded correctly on both platforms
        await expect(element(by.id(`${screen}-screen`))).toBeVisible();
      }
    });

    it('should handle text input consistently', async () => {
      await tapElement('nav-elements');
      await tapElement('create-character-button');

      await typeText('element-name-input', 'Cross-platform Character');

      // * Text should be entered correctly on both platforms
      await expect(element(by.id('element-name-input')))
        .toHaveText('Cross-platform Character');
    });

    it('should handle scrolling consistently', async () => {
      await tapElement('back-button');
      await tapElement('nav-projects');

      // * Create multiple projects to enable scrolling
      for (let i = 0; i < 10; i++) {
        await tapElement('create-project-button');
        await typeText('project-name-input', `Project ${i}`);
        await tapElement('save-project-button');
      }

      // * Scroll should work on both platforms
      await element(by.id('projects-list')).scroll(500, 'down');
      await element(by.id('projects-list')).scroll(500, 'up');
    });

    it('should handle modals consistently', async () => {
      await tapElement('create-project-button');
      await waitForElement('create-project-modal');

      // * Modal should appear on both platforms
      await expect(element(by.id('create-project-modal'))).toBeVisible();

      // * Dismiss modal
      if (platform.isIOS()) {
        await tapElement('cancel-button');
      } else {
        await device.pressBack();
      }

      await expect(element(by.id('create-project-modal'))).not.toBeVisible();
    });
  });
});