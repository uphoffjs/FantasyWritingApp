/**
 * Elements Page Object
 * Handles element creation, editing, and management within a project
 */

import { BasePage } from './BasePage';

export class ElementsPage extends BasePage {
  // * Page-specific selectors
  private pageSelectors = {
    // * Element list
    elementCard: '[data-cy="element-card"]',
    elementList: '[data-cy="element-list"]',
    elementBrowser: '[data-cy="element-browser"]',

    // * Element types
    characterTab: '[data-cy="character-tab"]',
    locationTab: '[data-cy="location-tab"]',
    itemTab: '[data-cy="item-tab"]',
    eventTab: '[data-cy="event-tab"]',

    // * Actions
    createElementButton: '[data-cy="create-element-button"]',
    editElementButton: '[data-cy="edit-element-button"]',
    deleteElementButton: '[data-cy="delete-element-button"]',
    searchInput: '[data-cy="element-search-input"]',
    viewToggle: '[data-cy="view-toggle"]',

    // * Create/Edit form
    elementNameInput: '[data-cy="element-name-input"]',
    elementDescriptionInput: '[data-cy="element-description-input"]',
    elementCategorySelect: '[data-cy="element-category-select"]',
    elementTagsInput: '[data-cy="element-tags-input"]',
    saveElementButton: '[data-cy="save-element-button"]',
    cancelButton: '[data-cy="cancel-button"]',

    // * Element details
    elementTitle: '[data-cy="element-title"]',
    elementDescription: '[data-cy="element-description"]',
    elementType: '[data-cy="element-type"]',
    completionProgress: '[data-cy="completion-progress"]',

    // * Questions/Answers
    questionField: '[data-cy^="question-"]',
    answerField: '[data-cy^="answer-"]',

    // * Relationships
    addRelationshipButton: '[data-cy="add-relationship-button"]',
    relationshipList: '[data-cy="relationship-list"]',
    relationshipCard: '[data-cy="relationship-card"]',
  };

  /**
   * Navigate to elements page for a project
   */
  visit(projectId: string): void {
    super.visit(`/projects/${projectId}/elements`);
    this.waitForPageLoad();
  }

  /**
   * Switch to element type tab
   */
  switchToElementType(type: 'character' | 'location' | 'item' | 'event'): void {
    const tabMap = {
      character: this.pageSelectors.characterTab,
      location: this.pageSelectors.locationTab,
      item: this.pageSelectors.itemTab,
      event: this.pageSelectors.eventTab,
    };
    cy.get(tabMap[type]).click();
  }

  /**
   * Click create element button
   */
  clickCreateElement(): void {
    cy.get(this.pageSelectors.createElementButton).click();
  }

  /**
   * Fill element basic details
   */
  fillElementDetails(name: string, description: string, category?: string): void {
    cy.get(this.pageSelectors.elementNameInput).clear().type(name);
    cy.get(this.pageSelectors.elementDescriptionInput).clear().type(description);

    if (category) {
      cy.get(this.pageSelectors.elementCategorySelect).select(category);
    }
  }

  /**
   * Add tags to element
   */
  addTags(tags: string[]): void {
    const tagsInput = cy.get(this.pageSelectors.elementTagsInput);
    tags.forEach((tag) => {
      tagsInput.type(`${tag}{enter}`);
    });
  }

  /**
   * Save element
   */
  saveElement(): void {
    cy.get(this.pageSelectors.saveElementButton).click();
  }

  /**
   * Create a new element
   */
  createElement(
    type: 'character' | 'location' | 'item' | 'event',
    name: string,
    description: string,
    options?: {
      category?: string;
      tags?: string[];
    }
  ): void {
    this.switchToElementType(type);
    this.clickCreateElement();
    this.fillElementDetails(name, description, options?.category);

    if (options?.tags) {
      this.addTags(options.tags);
    }

    this.saveElement();
  }

  /**
   * Search for an element
   */
  searchElement(searchTerm: string): void {
    cy.get(this.pageSelectors.searchInput).clear().type(searchTerm);
  }

  /**
   * Get all element cards
   */
  getElementCards(): Cypress.Chainable {
    return cy.get(this.pageSelectors.elementCard);
  }

  /**
   * Get element card by name
   */
  getElementByName(name: string): Cypress.Chainable {
    return cy.get(this.pageSelectors.elementCard)
      .contains(this.pageSelectors.elementTitle, name)
      .closest(this.pageSelectors.elementCard);
  }

  /**
   * Open element details
   */
  openElement(elementName: string): void {
    this.getElementByName(elementName).click();
  }

  /**
   * Edit an element
   */
  editElement(elementName: string): void {
    this.getElementByName(elementName)
      .find(this.pageSelectors.editElementButton)
      .click();
  }

  /**
   * Delete an element
   */
  deleteElement(elementName: string, confirm: boolean = true): void {
    this.getElementByName(elementName)
      .find(this.pageSelectors.deleteElementButton)
      .click();

    if (confirm) {
      cy.get('[data-cy="confirm-delete"]').click();
    } else {
      cy.get('[data-cy="cancel-delete"]').click();
    }
  }

  /**
   * Answer a question for an element
   */
  answerQuestion(questionId: string, answer: string): void {
    cy.get(`[data-cy="answer-${questionId}"]`).clear().type(answer);
  }

  /**
   * Answer multiple questions
   */
  answerQuestions(answers: Record<string, string>): void {
    Object.entries(answers).forEach(([questionId, answer]) => {
      this.answerQuestion(questionId, answer);
    });
  }

  /**
   * Add a relationship to an element
   */
  addRelationship(
    targetElementName: string,
    relationshipType: string,
    description?: string
  ): void {
    cy.get(this.pageSelectors.addRelationshipButton).click();

    // * Select target element
    cy.get('[data-cy="relationship-target-select"]').select(targetElementName);

    // * Select relationship type
    cy.get('[data-cy="relationship-type-select"]').select(relationshipType);

    // * Add description if provided
    if (description) {
      cy.get('[data-cy="relationship-description-input"]').type(description);
    }

    // * Save relationship
    cy.get('[data-cy="save-relationship-button"]').click();
  }

  /**
   * Verify element exists
   */
  verifyElementExists(elementName: string): void {
    cy.get(this.pageSelectors.elementCard)
      .contains(this.pageSelectors.elementTitle, elementName)
      .should('be.visible');
  }

  /**
   * Verify element does not exist
   */
  verifyElementDoesNotExist(elementName: string): void {
    cy.get(this.pageSelectors.elementCard)
      .contains(this.pageSelectors.elementTitle, elementName)
      .should('not.exist');
  }

  /**
   * Verify element count
   */
  verifyElementCount(expectedCount: number): void {
    cy.get(this.pageSelectors.elementCard).should('have.length', expectedCount);
  }

  /**
   * Verify element details
   */
  verifyElementDetails(elementName: string, details: {
    description?: string;
    type?: string;
    completion?: number;
  }): void {
    const elementCard = this.getElementByName(elementName);

    if (details.description) {
      elementCard
        .find(this.pageSelectors.elementDescription)
        .should('contain', details.description);
    }

    if (details.type) {
      elementCard
        .find(this.pageSelectors.elementType)
        .should('contain', details.type);
    }

    if (details.completion !== undefined) {
      elementCard
        .find(this.pageSelectors.completionProgress)
        .should('contain', `${details.completion}%`);
    }
  }

  /**
   * Toggle view mode
   */
  toggleView(view: 'grid' | 'list'): void {
    cy.get(this.pageSelectors.viewToggle).click();
    cy.get(`[data-cy="${view}-view"]`).click();
  }

  /**
   * Filter elements by completion
   */
  filterByCompletion(filter: 'all' | 'complete' | 'incomplete'): void {
    cy.get('[data-cy="completion-filter"]').select(filter);
  }

  /**
   * Sort elements
   */
  sortElements(sortBy: 'name' | 'date' | 'completion'): void {
    cy.get('[data-cy="sort-elements"]').select(sortBy);
  }

  /**
   * Verify relationship exists
   */
  verifyRelationshipExists(targetName: string, type: string): void {
    cy.get(this.pageSelectors.relationshipList)
      .find(this.pageSelectors.relationshipCard)
      .contains(targetName)
      .parent()
      .should('contain', type);
  }

  /**
   * Get completion percentage for an element
   */
  getCompletionPercentage(elementName: string): Cypress.Chainable<number> {
    return this.getElementByName(elementName)
      .find(this.pageSelectors.completionProgress)
      .invoke('text')
      .then((text) => {
        const match = text.match(/(\d+)%/);
        return match ? parseInt(match[1], 10) : 0;
      });
  }

  /**
   * Verify search results
   */
  verifySearchResults(expectedElements: string[]): void {
    cy.get(this.pageSelectors.elementCard).should('have.length', expectedElements.length);

    expectedElements.forEach((elementName) => {
      this.verifyElementExists(elementName);
    });
  }

  /**
   * Create multiple elements quickly
   */
  createMultipleElements(
    type: 'character' | 'location' | 'item' | 'event',
    elements: Array<{ name: string; description: string }>
  ): void {
    this.switchToElementType(type);

    elements.forEach((element) => {
      this.clickCreateElement();
      this.fillElementDetails(element.name, element.description);
      this.saveElement();
      // * Wait for modal to close
      cy.get(this.pageSelectors.elementNameInput).should('not.exist');
      cy.wait(500);
    });
  }

  /**
   * Verify element type tab is active
   */
  verifyActiveTab(type: 'character' | 'location' | 'item' | 'event'): void {
    const tabMap = {
      character: this.pageSelectors.characterTab,
      location: this.pageSelectors.locationTab,
      item: this.pageSelectors.itemTab,
      event: this.pageSelectors.eventTab,
    };

    cy.get(tabMap[type]).should('have.class', 'active');
  }

  /**
   * Export elements
   */
  exportElements(format: 'json' | 'csv' | 'markdown'): void {
    cy.get('[data-cy="export-button"]').click();
    cy.get(`[data-cy="export-${format}"]`).click();
  }

  /**
   * Import elements
   */
  importElements(filePath: string): void {
    cy.get('[data-cy="import-button"]').click();
    cy.get('[data-cy="file-input"]').selectFile(filePath);
    cy.get('[data-cy="confirm-import"]').click();
  }
}