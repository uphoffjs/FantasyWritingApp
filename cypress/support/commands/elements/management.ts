// * Element management commands for bulk operations
// ! All commands follow Cypress best practices with data-cy selectors

import { ElementCategory } from '../../../../src/types/models/ElementCategory';

/**
 * Create multiple elements in batch
 * @param elements - Array of element data to create
 * @example cy.createMultipleElements([{ category: 'character', name: 'Gandalf' }, { category: 'location', name: 'Shire' }])
 */
Cypress.Commands.add('createMultipleElements', (
  elements: Array<{
    category: ElementCategory;
    name: string;
    description?: string;
    tags?: string[];
  }>
) => {
  cy.task('log', `Creating ${elements.length} elements in batch`);

  elements.forEach((element) => {
    // * Use the createElement command for each
    cy.createElement(element.category, element.name, element.description);

    // * Add tags if provided
    if (element.tags && element.tags.length > 0) {
      cy.editElement(element.name, { tags: element.tags });
    }
  });

  cy.task('log', `Batch creation completed: ${elements.length} elements`);
});

/**
 * Delete all elements in a category
 * @param category - Element category to clear
 * @example cy.clearElementCategory('character')
 */
Cypress.Commands.add('clearElementCategory', (category: ElementCategory) => {
  cy.task('log', `Clearing all elements in category: ${category}`);

  // * Filter by category first
  cy.filterElementsByCategory(category);

  // * Select all elements
  cy.get('[data-cy="select-all-elements"]').click();

  // * Bulk delete
  cy.get('[data-cy="bulk-actions-menu"]').click();
  cy.get('[data-cy="bulk-delete-option"]').click();

  // * Confirm deletion
  cy.get('[data-cy="confirm-bulk-delete"]').click();

  // * Verify deletion
  cy.get('[data-cy="element-list"]').should('contain', 'No elements found');

  cy.task('log', `Cleared category: ${category}`);
});

/**
 * Import elements from fixture
 * @param fixtureName - Name of the fixture file containing element data
 * @example cy.importElementsFromFixture('test-elements.json')
 */
Cypress.Commands.add('importElementsFromFixture', (fixtureName: string) => {
  cy.fixture(fixtureName).then((elements) => {
    cy.task('log', `Importing elements from fixture: ${fixtureName}`);

    // * Open import dialog
    cy.get('[data-cy="import-elements-button"]').click();

    // * Upload fixture data
    cy.get('[data-cy="import-file-input"]').selectFile(
      `cypress/fixtures/${fixtureName}`,
      { force: true }
    );

    // * Confirm import
    cy.get('[data-cy="confirm-import-button"]').click();

    // * Verify import success
    cy.get('[data-cy="toast-success"]').should('contain', 'Elements imported successfully');
  });
});

/**
 * Export all elements to download
 * @param format - Export format
 * @example cy.exportAllElements('json')
 */
Cypress.Commands.add('exportAllElements', (format: 'json' | 'csv' | 'markdown' = 'json') => {
  cy.task('log', `Exporting all elements as ${format}`);

  // * Open export dialog
  cy.get('[data-cy="export-all-button"]').click();

  // * Select format
  cy.get(`[data-cy="export-format-${format}"]`).click();

  // * Export
  cy.get('[data-cy="confirm-export-all"]').click();

  // * Verify export
  cy.get('[data-cy="toast-success"]').should('contain', 'Export completed');

  cy.task('log', `Exported all elements as ${format}`);
});

/**
 * Bulk update elements
 * @param elementNames - Array of element names to update
 * @param updates - Updates to apply to all elements
 * @example cy.bulkUpdateElements(['Gandalf', 'Frodo'], { tags: ['Fellowship'] })
 */
Cypress.Commands.add('bulkUpdateElements', (
  elementNames: string[],
  updates: {
    category?: ElementCategory;
    tags?: string[];
    customFields?: Record<string, string>;
  }
) => {
  cy.task('log', `Bulk updating ${elementNames.length} elements`);

  // * Select specific elements
  elementNames.forEach(name => {
    cy.get(`[data-cy="element-card-${name}"]`)
      .find('[data-cy="element-checkbox"]')
      .click();
  });

  // * Open bulk edit dialog
  cy.get('[data-cy="bulk-actions-menu"]').click();
  cy.get('[data-cy="bulk-edit-option"]').click();

  // * Apply updates
  if (updates.category) {
    cy.get('[data-cy="bulk-category-selector"]').click();
    cy.get(`[data-cy="category-option-${updates.category}"]`).click();
  }

  if (updates.tags) {
    updates.tags.forEach(tag => {
      cy.get('[data-cy="bulk-tag-input"]').type(`${tag}{enter}`);
    });
  }

  if (updates.customFields) {
    Object.entries(updates.customFields).forEach(([key, value]) => {
      cy.get('[data-cy="add-bulk-custom-field"]').click();
      cy.get('[data-cy="bulk-field-name"]').type(key);
      cy.get('[data-cy="bulk-field-value"]').type(value);
    });
  }

  // * Save bulk changes
  cy.get('[data-cy="save-bulk-changes"]').click();

  // * Verify update
  cy.get('[data-cy="toast-success"]').should('contain', 'Elements updated');

  cy.task('log', `Bulk update completed for ${elementNames.length} elements`);
});

/**
 * Archive elements
 * @param elementNames - Array of element names to archive
 * @example cy.archiveElements(['Old Character 1', 'Old Location'])
 */
Cypress.Commands.add('archiveElements', (elementNames: string[]) => {
  cy.task('log', `Archiving ${elementNames.length} elements`);

  // * Select elements to archive
  elementNames.forEach(name => {
    cy.get(`[data-cy="element-card-${name}"]`)
      .find('[data-cy="element-checkbox"]')
      .click();
  });

  // * Archive selected
  cy.get('[data-cy="bulk-actions-menu"]').click();
  cy.get('[data-cy="archive-option"]').click();

  // * Confirm archive
  cy.get('[data-cy="confirm-archive"]').click();

  // * Verify archival
  cy.get('[data-cy="toast-success"]').should('contain', 'Elements archived');

  // * Verify elements moved to archive
  elementNames.forEach(name => {
    cy.get(`[data-cy="element-card-${name}"]`).should('not.exist');
  });

  cy.task('log', `Archived ${elementNames.length} elements`);
});

/**
 * Restore archived elements
 * @param elementNames - Array of element names to restore
 * @example cy.restoreElements(['Old Character 1'])
 */
Cypress.Commands.add('restoreElements', (elementNames: string[]) => {
  cy.task('log', `Restoring ${elementNames.length} archived elements`);

  // * Navigate to archive
  cy.get('[data-cy="view-archive-button"]').click();

  // * Select elements to restore
  elementNames.forEach(name => {
    cy.get(`[data-cy="archived-element-${name}"]`)
      .find('[data-cy="element-checkbox"]')
      .click();
  });

  // * Restore selected
  cy.get('[data-cy="restore-selected"]').click();

  // * Confirm restoration
  cy.get('[data-cy="confirm-restore"]').click();

  // * Verify restoration
  cy.get('[data-cy="toast-success"]').should('contain', 'Elements restored');

  // * Return to main view
  cy.get('[data-cy="exit-archive-view"]').click();

  // * Verify elements are back
  elementNames.forEach(name => {
    cy.get(`[data-cy="element-card-${name}"]`).should('exist');
  });

  cy.task('log', `Restored ${elementNames.length} elements`);
});

/**
 * Duplicate an element
 * @param elementName - Element name to duplicate
 * @param newName - Name for the duplicated element
 * @example cy.duplicateElement('Gandalf', 'Gandalf Copy')
 */
Cypress.Commands.add('duplicateElement', (elementName: string, newName: string) => {
  cy.task('log', `Duplicating element: ${elementName} as ${newName}`);

  // * Open element options
  cy.get(`[data-cy="element-card-${elementName}"]`)
    .find('[data-cy="element-options"]')
    .click();

  // * Click duplicate option
  cy.get('[data-cy="duplicate-element-option"]').click();

  // * Enter new name
  cy.get('[data-cy="duplicate-name-input"]').clear().type(newName);

  // * Confirm duplication
  cy.get('[data-cy="confirm-duplicate"]').click();

  // * Verify duplication
  cy.get('[data-cy="toast-success"]').should('contain', 'Element duplicated');
  cy.get(`[data-cy="element-card-${newName}"]`).should('exist');

  cy.task('log', `Duplicated ${elementName} as ${newName}`);
});

/**
 * Sort elements by specified criteria
 * @param sortBy - Sort criteria
 * @param order - Sort order
 * @example cy.sortElements('name', 'asc')
 */
Cypress.Commands.add('sortElements', (
  sortBy: 'name' | 'created' | 'modified' | 'category',
  order: 'asc' | 'desc' = 'asc'
) => {
  cy.task('log', `Sorting elements by ${sortBy} (${order})`);

  // * Open sort menu
  cy.get('[data-cy="element-sort-button"]').click();

  // * Select sort criteria
  cy.get(`[data-cy="sort-by-${sortBy}"]`).click();

  // * Select order
  cy.get(`[data-cy="sort-order-${order}"]`).click();

  // * Apply sort
  cy.get('[data-cy="apply-sort"]').click();

  // * Verify sort indicator
  cy.get('[data-cy="current-sort"]').should('contain', sortBy);

  cy.task('log', `Elements sorted by ${sortBy} (${order})`);
});

// * Export empty object to prevent TS errors
export {};