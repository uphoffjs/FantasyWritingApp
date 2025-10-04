// * Element validation commands for testing element states
// ! All commands follow Cypress best practices with data-cy selectors

import { ElementCategory } from '../../../../src/types/models/ElementCategory';

/**
 * Verify element exists with expected properties
 * @param name - Element name to verify
 * @param expectedProperties - Properties to check
 * @example cy.verifyElement('Gandalf', { category: 'character', hasDescription: true })
 */
Cypress.Commands.add('verifyElement', (
  name: string,
  expectedProperties?: {
    category?: ElementCategory;
    hasDescription?: boolean;
    tags?: string[];
    linkedElements?: string[];
  }
) => {
  cy.task('log', `Verifying element: ${name}`);

  // * Check element exists
  cy.get(`[data-cy="element-card-${name}"]`).should('exist');

  if (expectedProperties) {
    // * Open element for detailed verification
    cy.openElement(name);

    // * Verify category
    if (expectedProperties.category) {
      cy.get('[data-cy="element-category-display"]')
        .should('contain', expectedProperties.category);
    }

    // * Verify description
    if (expectedProperties.hasDescription !== undefined) {
      const assertion = expectedProperties.hasDescription ? 'not.be.empty' : 'be.empty';
      cy.get('[data-cy="element-description-display"]').should(assertion);
    }

    // * Verify tags
    if (expectedProperties.tags) {
      expectedProperties.tags.forEach(tag => {
        cy.get(`[data-cy="element-tag-${tag}"]`).should('exist');
      });
    }

    // * Verify linked elements
    if (expectedProperties.linkedElements) {
      expectedProperties.linkedElements.forEach(linkedName => {
        cy.get(`[data-cy="element-link-${linkedName}"]`).should('exist');
      });
    }

    // * Close element editor
    cy.get('[data-cy="close-element-editor"]').click();
  }

  cy.task('log', `Element ${name} verified successfully`);
});

/**
 * Verify element count in a category
 * @param category - Element category
 * @param expectedCount - Expected number of elements
 * @example cy.verifyElementCount('character', 5)
 */
Cypress.Commands.add('verifyElementCount', (
  category: ElementCategory | 'all',
  expectedCount: number
) => {
  cy.task('log', `Verifying element count for ${category}: expecting ${expectedCount}`);

  if (category !== 'all') {
    // * Filter by category first
    cy.filterElementsByCategory(category);
  }

  // * Check count
  cy.get('[data-cy="element-count-display"]')
    .should('contain', `${expectedCount} element${expectedCount === 1 ? '' : 's'}`);

  // * Also verify actual card count
  cy.get('[data-cy^="element-card-"]').should('have.length', expectedCount);

  cy.task('log', `Element count verified: ${expectedCount} ${category} elements`);
});

/**
 * Verify element is not present
 * @param name - Element name that should not exist
 * @example cy.verifyElementDoesNotExist('DeletedCharacter')
 */
Cypress.Commands.add('verifyElementDoesNotExist', (name: string) => {
  cy.task('log', `Verifying element does not exist: ${name}`);

  cy.get(`[data-cy="element-card-${name}"]`).should('not.exist');

  cy.task('log', `Confirmed: Element ${name} does not exist`);
});

/**
 * Verify custom field on an element
 * @param elementName - Element name
 * @param fieldName - Custom field name
 * @param expectedValue - Expected field value
 * @example cy.verifyElementCustomField('Gandalf', 'Power Level', '9000')
 */
Cypress.Commands.add('verifyElementCustomField', (
  elementName: string,
  fieldName: string,
  expectedValue: string
) => {
  cy.task('log', `Verifying custom field '${fieldName}' on element: ${elementName}`);

  cy.openElement(elementName);

  // * Check custom field exists and has correct value
  cy.get(`[data-cy="custom-field-${fieldName}"]`)
    .should('exist')
    .should('contain', expectedValue);

  // * Close element editor
  cy.get('[data-cy="close-element-editor"]').click();

  cy.task('log', `Custom field '${fieldName}' verified with value: ${expectedValue}`);
});

/**
 * Verify element search results
 * @param searchTerm - Search term used
 * @param expectedResults - Array of element names that should appear
 * @example cy.verifySearchResults('wizard', ['Gandalf', 'Saruman'])
 */
Cypress.Commands.add('verifySearchResults', (
  searchTerm: string,
  expectedResults: string[]
) => {
  cy.task('log', `Verifying search results for: ${searchTerm}`);

  // * Perform search
  cy.searchElements(searchTerm);

  // * Check each expected result appears
  expectedResults.forEach(name => {
    cy.get(`[data-cy="element-card-${name}"]`).should('be.visible');
  });

  // * Verify count matches
  cy.get('[data-cy^="element-card-"]').should('have.length', expectedResults.length);

  cy.task('log', `Search results verified: found ${expectedResults.length} matching elements`);
});

/**
 * Verify element is archived
 * @param elementName - Element name that should be archived
 * @example cy.verifyElementArchived('Old Character')
 */
Cypress.Commands.add('verifyElementArchived', (elementName: string) => {
  cy.task('log', `Verifying element is archived: ${elementName}`);

  // * Element should not be in main view
  cy.get(`[data-cy="element-card-${elementName}"]`).should('not.exist');

  // * Navigate to archive
  cy.get('[data-cy="view-archive-button"]').click();

  // * Element should be in archive
  cy.get(`[data-cy="archived-element-${elementName}"]`).should('exist');

  // * Return to main view
  cy.get('[data-cy="exit-archive-view"]').click();

  cy.task('log', `Confirmed: Element ${elementName} is archived`);
});

/**
 * Verify element link relationship
 * @param sourceElement - Source element name
 * @param targetElement - Target element name
 * @param linkType - Optional link type to verify
 * @example cy.verifyElementLink('Gandalf', 'Frodo', 'Mentor')
 */
Cypress.Commands.add('verifyElementLink', (
  sourceElement: string,
  targetElement: string,
  linkType?: string
) => {
  cy.task('log', `Verifying link from ${sourceElement} to ${targetElement}`);

  cy.openElement(sourceElement);

  // * Check link exists
  cy.get(`[data-cy="element-link-${targetElement}"]`).should('exist');

  // * Check link type if provided
  if (linkType) {
    cy.get(`[data-cy="element-link-${targetElement}"]`)
      .find('[data-cy="link-type-label"]')
      .should('contain', linkType);
  }

  // * Close element editor
  cy.get('[data-cy="close-element-editor"]').click();

  cy.task('log', `Link verified: ${sourceElement} → ${targetElement}${linkType ? ` (${linkType})` : ''}`);
});

/**
 * Verify element sort order
 * @param expectedOrder - Array of element names in expected order
 * @example cy.verifyElementOrder(['Aragorn', 'Boromir', 'Gandalf'])
 */
Cypress.Commands.add('verifyElementOrder', (expectedOrder: string[]) => {
  cy.task('log', `Verifying element order: ${expectedOrder.join(', ')}`);

  // * Get all element cards and verify order
  cy.get('[data-cy^="element-card-"]').then($elements => {
    const actualOrder = $elements.toArray().map(el => {
      const dataCy = el.getAttribute('data-cy');
      return dataCy ? dataCy.replace('element-card-', '') : '';
    }).filter(name => name);

    // * Compare orders
    expect(actualOrder).to.deep.equal(expectedOrder);
  });

  cy.task('log', `Element order verified correctly`);
});

/**
 * Verify bulk operation results
 * @param operation - Type of bulk operation performed
 * @param affectedElements - Elements that should be affected
 * @param verification - What to verify
 * @example cy.verifyBulkOperation('tag', ['Gandalf', 'Frodo'], { tag: 'Fellowship' })
 */
Cypress.Commands.add('verifyBulkOperation', (
  operation: 'tag' | 'category' | 'delete' | 'archive',
  affectedElements: string[],
  verification: {
    tag?: string;
    category?: ElementCategory;
    shouldExist?: boolean;
  }
) => {
  cy.task('log', `Verifying bulk ${operation} operation on ${affectedElements.length} elements`);

  affectedElements.forEach(elementName => {
    switch (operation) {
      case 'tag':
        if (verification.tag) {
          cy.openElement(elementName);
          cy.get(`[data-cy="element-tag-${verification.tag}"]`).should('exist');
          cy.get('[data-cy="close-element-editor"]').click();
        }
        break;

      case 'category':
        if (verification.category) {
          cy.openElement(elementName);
          cy.get('[data-cy="element-category-display"]')
            .should('contain', verification.category);
          cy.get('[data-cy="close-element-editor"]').click();
        }
        break;

      case 'delete':
        cy.verifyElementDoesNotExist(elementName);
        break;

      case 'archive':
        cy.verifyElementArchived(elementName);
        break;
    }
  });

  cy.task('log', `Bulk ${operation} operation verified successfully`);
});

// * Export empty object to prevent TS errors
export {};