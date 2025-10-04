/**
 * Element Creation E2E Tests
 * Tests creating and managing story elements (characters, locations, etc.)
 */

const {
  waitForElement,
  typeText,
  tapElement,
  scrollToElement,
  login,
  createProject,
  createElement,
  takeScreenshot,
  platform
} = require('./helpers');

describe('Element Creation and Management', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      permissions: { photos: 'YES', camera: 'YES' }
    });
    await login();
    await createProject('Test Fantasy World', 'For testing elements');
    await tapElement('project-card');
  });

  beforeEach(async () => {
    await waitForElement('element-browser');
  });

  describe('Character Creation', () => {
    it('should create a new character', async () => {
      await tapElement('create-character-button');
      await waitForElement('create-element-modal');

      // * Fill in basic details
      await typeText('element-name-input', 'Aragorn');
      await typeText('element-description-input', 'Ranger of the North');

      // * Select character type
      await tapElement('element-category-picker');
      await element(by.text('Hero')).tap();

      await tapElement('save-element-button');

      // * Verify character was created
      await waitForElement('element-card');
      await expect(element(by.text('Aragorn'))).toBeVisible();

      await takeScreenshot('character-created');
    });

    it('should add character details through questionnaire', async () => {
      await tapElement('element-card');
      await waitForElement('element-editor');

      // * Navigate to questionnaire
      await tapElement('questionnaire-tab');

      // * Answer basic questions
      await scrollToElement('age-input');
      await typeText('age-input', '87');

      await scrollToElement('occupation-input');
      await typeText('occupation-input', 'Ranger, King');

      await scrollToElement('personality-input');
      await typeText('personality-input', 'Noble, brave, humble');

      // * Save changes
      await tapElement('save-button');

      await takeScreenshot('character-details-added');
    });

    it('should add character image', async () => {
      await tapElement('add-image-button');

      if (platform.isIOS()) {
        // * Handle photo library permission
        await element(by.label('Select from Library')).tap();
        await element(by.label('Allow Access to All Photos')).tap();
      } else {
        await tapElement('choose-from-gallery');
        await element(by.text('ALLOW')).tap();
      }

      // * Select first image (in real device/simulator)
      await element(by.type('UIImageView')).atIndex(0).tap();
      await tapElement('use-photo-button');

      // * Verify image was added
      await waitForElement('element-image');
      await expect(element(by.id('element-image'))).toBeVisible();
    });
  });

  describe('Location Creation', () => {
    it('should create a new location', async () => {
      await tapElement('back-button');
      await waitForElement('element-browser');

      await tapElement('create-location-button');
      await waitForElement('create-element-modal');

      // * Fill in location details
      await typeText('element-name-input', 'Rivendell');
      await typeText('element-description-input', 'Elven refuge in Middle-earth');

      // * Select location type
      await tapElement('element-category-picker');
      await element(by.text('City')).tap();

      await tapElement('save-element-button');

      // * Verify location was created
      await expect(element(by.text('Rivendell'))).toBeVisible();
    });

    it('should link location to character', async () => {
      // * Open location
      await element(by.text('Rivendell')).tap();
      await waitForElement('element-editor');

      // * Navigate to relationships
      await tapElement('relationships-tab');
      await tapElement('add-relationship-button');

      // * Select relationship type
      await tapElement('relationship-type-picker');
      await element(by.text('Home of')).tap();

      // * Select related element
      await tapElement('related-element-picker');
      await element(by.text('Aragorn')).tap();

      await tapElement('save-relationship-button');

      // * Verify relationship was created
      await expect(element(by.text('Home of: Aragorn'))).toBeVisible();

      await takeScreenshot('location-character-relationship');
    });
  });

  describe('Item Creation', () => {
    it('should create a magical item', async () => {
      await tapElement('back-button');
      await waitForElement('element-browser');

      await tapElement('create-item-button');
      await waitForElement('create-element-modal');

      // * Fill in item details
      await typeText('element-name-input', 'Sting');
      await typeText('element-description-input', 'Elven blade that glows blue');

      // * Select item type
      await tapElement('element-category-picker');
      await element(by.text('Weapon')).tap();

      // * Add tags
      await tapElement('add-tag-button');
      await typeText('tag-input', 'magical');
      await tapElement('confirm-tag-button');

      await tapElement('add-tag-button');
      await typeText('tag-input', 'elven');
      await tapElement('confirm-tag-button');

      await tapElement('save-element-button');

      // * Verify item was created with tags
      await expect(element(by.text('Sting'))).toBeVisible();
      await expect(element(by.text('magical'))).toBeVisible();
      await expect(element(by.text('elven'))).toBeVisible();
    });
  });

  describe('Element Filtering and Search', () => {
    it('should filter elements by type', async () => {
      await tapElement('back-button');
      await waitForElement('element-browser');

      // * Open filter options
      await tapElement('filter-button');
      await waitForElement('filter-modal');

      // * Filter by characters only
      await tapElement('filter-characters-only');
      await tapElement('apply-filter-button');

      // * Verify only characters are shown
      await expect(element(by.text('Aragorn'))).toBeVisible();
      await expect(element(by.text('Rivendell'))).not.toBeVisible();
      await expect(element(by.text('Sting'))).not.toBeVisible();
    });

    it('should search for elements', async () => {
      await tapElement('search-button');
      await typeText('search-input', 'elf');

      // * Should find elven-related items
      await expect(element(by.text('Rivendell'))).toBeVisible();
      await expect(element(by.text('Sting'))).toBeVisible();
      await expect(element(by.text('Aragorn'))).not.toBeVisible();
    });

    it('should show element completion status', async () => {
      // * Check for completion indicators
      const elements = ['Aragorn', 'Rivendell', 'Sting'];

      for (const elementName of elements) {
        const card = element(by.text(elementName)).withAncestor(by.id('element-card'));
        await expect(element(by.id('completion-indicator')).withAncestor(card)).toBeVisible();
      }

      await takeScreenshot('element-completion-status');
    });
  });

  describe('Bulk Operations', () => {
    it('should select multiple elements', async () => {
      await tapElement('select-mode-button');
      await waitForElement('selection-toolbar');

      // * Select multiple elements
      await tapElement('select-all-button');

      // * Verify selection count
      await expect(element(by.text('3 selected'))).toBeVisible();
    });

    it('should bulk delete elements', async () => {
      // * Continue from selection mode
      await tapElement('bulk-delete-button');
      await waitForElement('confirm-bulk-delete-modal');

      // * Cancel for now (don't actually delete test data)
      await tapElement('cancel-button');

      // * Exit selection mode
      await tapElement('cancel-selection-button');
    });
  });

  describe('Element Templates', () => {
    it('should use a character template', async () => {
      await tapElement('create-character-button');
      await waitForElement('create-element-modal');

      // * Select template
      await tapElement('use-template-button');
      await waitForElement('template-selector');

      await element(by.text('Hero Template')).tap();

      // * Verify template populated fields
      await expect(element(by.id('element-category-picker')))
        .toHaveText('Hero');

      // * Complete with custom name
      await typeText('element-name-input', 'Legolas');
      await tapElement('save-element-button');

      await expect(element(by.text('Legolas'))).toBeVisible();
    });
  });
});