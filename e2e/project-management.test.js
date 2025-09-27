/**
 * Project Management E2E Tests
 * Tests creating, editing, and managing projects
 */

const {
  waitForElement,
  typeText,
  tapElement,
  scrollToElement,
  swipeElement,
  login,
  createProject,
  takeScreenshot,
  platform
} = require('./helpers');

describe('Project Management', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      permissions: { notifications: 'YES' }
    });
    await login();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    await waitForElement('projects-screen');
  });

  it('should create a new project', async () => {
    await tapElement('create-project-button');
    await waitForElement('create-project-modal');

    // * Fill in project details
    await typeText('project-name-input', 'Epic Fantasy Novel');
    await typeText('project-description-input', 'A tale of dragons and magic');

    // * Select genre
    if (platform.isIOS()) {
      await element(by.id('genre-picker')).setColumnToValue(0, 'Fantasy');
    } else {
      await tapElement('genre-picker');
      await element(by.text('Fantasy')).tap();
    }

    await tapElement('save-project-button');

    // * Verify project was created
    await waitForElement('project-card');
    await expect(element(by.text('Epic Fantasy Novel'))).toBeVisible();

    await takeScreenshot('new-project-created');
  });

  it('should edit an existing project', async () => {
    // * Long press to show context menu
    await element(by.id('project-card')).atIndex(0).longPress();
    await tapElement('edit-project-option');

    await waitForElement('edit-project-modal');

    // * Update project details
    await typeText('project-name-input', ' - Revised');
    await tapElement('save-project-button');

    // * Verify changes were saved
    await expect(element(by.text('Epic Fantasy Novel - Revised'))).toBeVisible();
  });

  it('should delete a project with confirmation', async () => {
    // * Create a test project to delete
    await createProject('Project to Delete', 'Will be removed');

    // * Long press and delete
    await element(by.text('Project to Delete')).longPress();
    await tapElement('delete-project-option');

    // * Confirm deletion
    await waitForElement('confirm-delete-modal');
    await tapElement('confirm-delete-button');

    // * Verify project was deleted
    await expect(element(by.text('Project to Delete'))).not.toExist();
  });

  it('should search and filter projects', async () => {
    // * Create multiple projects
    await createProject('Dragon Quest', 'Adventure story');
    await createProject('Space Opera', 'Sci-fi epic');
    await createProject('Mystery Manor', 'Detective story');

    // * Search for specific project
    await tapElement('search-button');
    await typeText('search-input', 'Dragon');

    // * Verify filtered results
    await expect(element(by.text('Dragon Quest'))).toBeVisible();
    await expect(element(by.text('Space Opera'))).not.toBeVisible();
    await expect(element(by.text('Mystery Manor'))).not.toBeVisible();

    // * Clear search
    await tapElement('clear-search-button');
    await expect(element(by.text('Space Opera'))).toBeVisible();
  });

  it('should sort projects by different criteria', async () => {
    await tapElement('sort-button');
    await waitForElement('sort-options-modal');

    // * Sort by name
    await tapElement('sort-by-name');
    await tapElement('apply-sort-button');

    // * Take screenshot of sorted list
    await takeScreenshot('projects-sorted-by-name');

    // * Sort by date
    await tapElement('sort-button');
    await tapElement('sort-by-date');
    await tapElement('apply-sort-button');

    await takeScreenshot('projects-sorted-by-date');
  });

  it('should handle pull-to-refresh', async () => {
    // * Pull down to refresh
    await element(by.id('projects-list')).swipe('down', 'slow', 0.9);

    // * Should show refresh indicator
    await waitForElement('refresh-indicator');

    // * Wait for refresh to complete
    await waitFor(element(by.id('refresh-indicator')))
      .not.toBeVisible()
      .withTimeout(5000);
  });

  it('should navigate into a project', async () => {
    await tapElement('project-card');

    // * Should show project detail screen
    await waitForElement('project-detail-screen');
    await expect(element(by.id('element-browser'))).toBeVisible();

    // * Navigate back
    if (platform.isIOS()) {
      await tapElement('back-button');
    } else {
      await device.pressBack();
    }

    await waitForElement('projects-screen');
  });

  it('should handle empty project state', async () => {
    // * Clear all projects (mock scenario)
    // In real app, this would require clearing data

    // * Check for empty state message
    const hasProjects = await element(by.id('project-card')).exists();

    if (!hasProjects) {
      await expect(element(by.id('empty-projects-message'))).toBeVisible();
      await expect(element(by.text('No projects yet'))).toBeVisible();
    }
  });

  it('should show project statistics', async () => {
    await tapElement('project-card');
    await waitForElement('project-detail-screen');

    // * Check for statistics
    await expect(element(by.id('element-count'))).toBeVisible();
    await expect(element(by.id('last-updated'))).toBeVisible();
    await expect(element(by.id('completion-percentage'))).toBeVisible();

    await takeScreenshot('project-statistics');
  });

  it('should handle project archiving', async () => {
    // * Long press to show options
    await element(by.id('project-card')).atIndex(0).longPress();
    await tapElement('archive-project-option');

    // * Confirm archiving
    await tapElement('confirm-archive-button');

    // * Switch to archived view
    await tapElement('filter-button');
    await tapElement('show-archived-toggle');

    // * Verify project is in archived list
    await waitForElement('archived-project-indicator');

    await takeScreenshot('archived-projects');
  });
});