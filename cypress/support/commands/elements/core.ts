// * Core element commands for FantasyWritingApp
// ! All commands follow Cypress best practices with data-cy selectors

import { ElementCategory } from '../../../../src/types/models/ElementCategory';

/**
 * Create a new element with specified category and details
 * @param category - The element category (character, location, etc.)
 * @param name - Element name
 * @param description - Optional description
 * @example cy.createElement('character', 'Gandalf', 'A wise wizard')
 */
Cypress.Commands.add('createElement', (
  category: ElementCategory,
  name: string,
  description?: string
) => {
  // * Open create element modal
  cy.get('[data-cy="create-element-button"]').click();

  // * Select category
  cy.get('[data-cy="element-category-selector"]').click();
  cy.get(`[data-cy="category-option-${category}"]`).click();

  // * Enter element details
  cy.get('[data-cy="element-name-input"]').type(name);

  if (description) {
    cy.get('[data-cy="element-description-input"]').type(description);
  }

  // * Save the element
  cy.get('[data-cy="save-element-button"]').click();

  // * Verify element was created
  cy.get('[data-cy="toast-success"]').should('contain', 'Element created successfully');

  cy.task('log', `Created ${category} element: ${name}`);
});

/**
 * Open an element for editing
 * @param name - Element name to open
 * @example cy.openElement('Gandalf')
 */
Cypress.Commands.add('openElement', (name: string) => {
  // * Search for the element
  cy.get('[data-cy="element-search-input"]').type(name);

  // * Click on the element card
  cy.get(`[data-cy="element-card-${name}"]`).click();

  // * Wait for editor to load
  cy.get('[data-cy="element-editor"]').should('be.visible');

  cy.task('log', `Opened element: ${name}`);
});

/**
 * Delete an element
 * @param name - Element name to delete
 * @example cy.deleteElement('Gandalf')
 */
Cypress.Commands.add('deleteElement', (name: string) => {
  // * Open element options
  cy.get(`[data-cy="element-card-${name}"]`).find('[data-cy="element-options"]').click();

  // * Click delete option
  cy.get('[data-cy="delete-element-option"]').click();

  // * Confirm deletion
  cy.get('[data-cy="confirm-delete-button"]').click();

  // * Verify deletion
  cy.get('[data-cy="toast-success"]').should('contain', 'Element deleted');
  cy.get(`[data-cy="element-card-${name}"]`).should('not.exist');

  cy.task('log', `Deleted element: ${name}`);
});

/**
 * Edit an element's properties
 * @param name - Element name to edit
 * @param updates - Object containing properties to update
 * @example cy.editElement('Gandalf', { description: 'Updated description' })
 */
Cypress.Commands.add('editElement', (
  name: string,
  updates: {
    name?: string;
    description?: string;
    category?: ElementCategory;
    tags?: string[];
  }
) => {
  // * Open the element
  cy.openElement(name);

  // * Update properties
  if (updates.name) {
    cy.get('[data-cy="element-name-input"]').clear().type(updates.name);
  }

  if (updates.description) {
    cy.get('[data-cy="element-description-input"]').clear().type(updates.description);
  }

  if (updates.category) {
    cy.get('[data-cy="element-category-selector"]').click();
    cy.get(`[data-cy="category-option-${updates.category}"]`).click();
  }

  if (updates.tags) {
    updates.tags.forEach(tag => {
      cy.get('[data-cy="element-tag-input"]').type(`${tag}{enter}`);
    });
  }

  // * Save changes
  cy.get('[data-cy="save-element-button"]').click();

  // * Verify save
  cy.get('[data-cy="toast-success"]').should('contain', 'Element updated');

  cy.task('log', `Updated element: ${name}`);
});

/**
 * Add a custom field to an element
 * @param elementName - Element name
 * @param fieldName - Custom field name
 * @param fieldValue - Custom field value
 * @example cy.addElementCustomField('Gandalf', 'Power Level', '9000')
 */
Cypress.Commands.add('addElementCustomField', (
  elementName: string,
  fieldName: string,
  fieldValue: string
) => {
  cy.openElement(elementName);

  // * Add custom field
  cy.get('[data-cy="add-custom-field-button"]').click();
  cy.get('[data-cy="custom-field-name-input"]').type(fieldName);
  cy.get('[data-cy="custom-field-value-input"]').type(fieldValue);
  cy.get('[data-cy="save-custom-field-button"]').click();

  // * Verify field was added
  cy.get(`[data-cy="custom-field-${fieldName}"]`).should('contain', fieldValue);

  cy.task('log', `Added custom field '${fieldName}' to element: ${elementName}`);
});

/**
 * Link an element to another element
 * @param sourceElement - Source element name
 * @param targetElement - Target element name
 * @param linkType - Type of relationship
 * @example cy.linkElements('Gandalf', 'Frodo', 'Mentor')
 */
Cypress.Commands.add('linkElements', (
  sourceElement: string,
  targetElement: string,
  linkType?: string
) => {
  cy.openElement(sourceElement);

  // * Open link dialog
  cy.get('[data-cy="add-link-button"]').click();

  // * Search for target element
  cy.get('[data-cy="link-search-input"]').type(targetElement);
  cy.get(`[data-cy="link-option-${targetElement}"]`).click();

  // * Set link type if provided
  if (linkType) {
    cy.get('[data-cy="link-type-input"]').type(linkType);
  }

  // * Save link
  cy.get('[data-cy="save-link-button"]').click();

  // * Verify link was created
  cy.get(`[data-cy="element-link-${targetElement}"]`).should('exist');

  cy.task('log', `Linked ${sourceElement} to ${targetElement}`);
});

/**
 * Filter elements by category
 * @param category - Element category to filter by
 * @example cy.filterElementsByCategory('character')
 */
Cypress.Commands.add('filterElementsByCategory', (category: ElementCategory) => {
  // * Open filter menu
  cy.get('[data-cy="element-filter-button"]').click();

  // * Select category filter
  cy.get(`[data-cy="filter-category-${category}"]`).click();

  // * Apply filter
  cy.get('[data-cy="apply-filter-button"]').click();

  // * Verify filter is active
  cy.get('[data-cy="active-filter-badge"]').should('contain', category);

  cy.task('log', `Filtered elements by category: ${category}`);
});

/**
 * Search for elements
 * @param searchTerm - Search term
 * @example cy.searchElements('wizard')
 */
Cypress.Commands.add('searchElements', (searchTerm: string) => {
  cy.get('[data-cy="element-search-input"]').clear().type(searchTerm);

  // * Wait for search results
  cy.get('[data-cy="search-results"]').should('be.visible');

  cy.task('log', `Searched for elements: ${searchTerm}`);
});

/**
 * Export element data
 * @param elementName - Element name to export
 * @param format - Export format (json, markdown, txt)
 * @example cy.exportElement('Gandalf', 'json')
 */
Cypress.Commands.add('exportElement', (
  elementName: string,
  format: 'json' | 'markdown' | 'txt' = 'json'
) => {
  cy.openElement(elementName);

  // * Open export menu
  cy.get('[data-cy="element-export-button"]').click();

  // * Select format
  cy.get(`[data-cy="export-format-${format}"]`).click();

  // * Export
  cy.get('[data-cy="confirm-export-button"]').click();

  // * Verify export
  cy.get('[data-cy="toast-success"]').should('contain', 'Element exported');

  cy.task('log', `Exported element ${elementName} as ${format}`);
});

// * Export empty object to prevent TS errors
export {};