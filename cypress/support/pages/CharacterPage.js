/**
 * CharacterPage - Page Object for Character Management
 * Encapsulates all character-related page interactions
 */

class CharacterPage {
  // * Selectors
  selectors = {
    // Character list
    characterList: '[data-cy="character-list"]',
    characterCard: '[data-cy="character-card"]',
    characterName: '[data-cy="character-name"]',
    characterDescription: '[data-cy="character-description"]',

    // Character creation
    createCharacterButton: '[data-cy="create-character-button"]',
    characterModal: '[data-cy="create-character-modal"]',
    nameInput: '[data-cy="character-name-input"]',
    descriptionInput: '[data-cy="character-description-input"]',
    categorySelect: '[data-cy="character-category-select"]',
    submitButton: '[data-cy="submit-character-button"]',
    cancelButton: '[data-cy="cancel-button"]',

    // Character details
    characterDetail: '[data-cy="character-detail"]',
    editButton: '[data-cy="edit-character-button"]',
    deleteButton: '[data-cy="delete-character-button"]',

    // Questionnaire
    questionnaireSection: '[data-cy="questionnaire-section"]',
    questionField: '[data-cy^="question-"]',
    saveAnswersButton: '[data-cy="save-answers-button"]',

    // Relationships
    relationshipSection: '[data-cy="relationship-section"]',
    addRelationshipButton: '[data-cy="add-relationship-button"]',
    relationshipModal: '[data-cy="relationship-modal"]',
    targetCharacterSelect: '[data-cy="target-character-select"]',
    relationshipTypeSelect: '[data-cy="relationship-type-select"]',

    // Filters and search
    searchInput: '[data-cy="character-search-input"]',
    categoryFilter: '[data-cy="category-filter"]',
    completionFilter: '[data-cy="completion-filter"]',

    // Loading and empty states
    loadingSpinner: '[data-cy="loading-spinner"]',
    emptyState: '[data-cy="empty-state"]',
    errorMessage: '[data-cy="error-message"]'
  };

  // * Navigation
  visit(projectId) {
    cy.visit(`/projects/${projectId}/characters`);
    return this;
  }

  visitCharacterDetail(projectId, characterId) {
    cy.visit(`/projects/${projectId}/characters/${characterId}`);
    return this;
  }

  // * Character Creation
  openCreateModal() {
    cy.get(this.selectors.createCharacterButton).click();
    cy.get(this.selectors.characterModal).should('be.visible');
    return this;
  }

  fillCharacterForm({ name, description, category }) {
    if (name) {
      cy.get(this.selectors.nameInput).clear().type(name);
    }
    if (description) {
      cy.get(this.selectors.descriptionInput).clear().type(description);
    }
    if (category) {
      cy.get(this.selectors.categorySelect).select(category);
    }
    return this;
  }

  submitCharacterForm() {
    cy.get(this.selectors.submitButton).click();
    return this;
  }

  cancelCharacterForm() {
    cy.get(this.selectors.cancelButton).click();
    return this;
  }

  createNewCharacter(characterData) {
    this.openCreateModal();
    this.fillCharacterForm(characterData);
    this.submitCharacterForm();
    cy.get(this.selectors.characterModal).should('not.exist');
    return this;
  }

  // * Character List Operations
  searchCharacters(searchTerm) {
    cy.get(this.selectors.searchInput).clear().type(searchTerm);
    return this;
  }

  filterByCategory(category) {
    cy.get(this.selectors.categoryFilter).select(category);
    return this;
  }

  filterByCompletion(completionStatus) {
    cy.get(this.selectors.completionFilter).select(completionStatus);
    return this;
  }

  selectCharacter(characterName) {
    cy.get(this.selectors.characterCard)
      .contains(characterName)
      .click();
    return this;
  }

  // * Character Detail Operations
  editCharacter() {
    cy.get(this.selectors.editButton).click();
    return this;
  }

  deleteCharacter() {
    cy.get(this.selectors.deleteButton).click();
    // * Handle confirmation dialog
    cy.on('window:confirm', () => true);
    return this;
  }

  // * Questionnaire Operations
  answerQuestion(questionId, answer) {
    cy.get(`[data-cy="question-${questionId}"]`).clear().type(answer);
    return this;
  }

  answerMultipleQuestions(answers) {
    Object.entries(answers).forEach(([questionId, answer]) => {
      this.answerQuestion(questionId, answer);
    });
    return this;
  }

  saveAnswers() {
    cy.get(this.selectors.saveAnswersButton).click();
    return this;
  }

  // * Relationship Operations
  openRelationshipModal() {
    cy.get(this.selectors.addRelationshipButton).click();
    cy.get(this.selectors.relationshipModal).should('be.visible');
    return this;
  }

  addRelationship(targetCharacter, relationshipType) {
    this.openRelationshipModal();
    cy.get(this.selectors.targetCharacterSelect).select(targetCharacter);
    cy.get(this.selectors.relationshipTypeSelect).select(relationshipType);
    cy.get(this.selectors.submitButton).click();
    cy.get(this.selectors.relationshipModal).should('not.exist');
    return this;
  }

  // * Assertions
  shouldHaveCharacterCount(count) {
    cy.get(this.selectors.characterCard).should('have.length', count);
    return this;
  }

  shouldShowCharacter(characterName) {
    cy.get(this.selectors.characterCard)
      .contains(characterName)
      .should('be.visible');
    return this;
  }

  shouldNotShowCharacter(characterName) {
    cy.get(this.selectors.characterCard)
      .contains(characterName)
      .should('not.exist');
    return this;
  }

  shouldShowEmptyState() {
    cy.get(this.selectors.emptyState).should('be.visible');
    return this;
  }

  shouldShowLoadingSpinner() {
    cy.get(this.selectors.loadingSpinner).should('be.visible');
    return this;
  }

  shouldNotShowLoadingSpinner() {
    cy.get(this.selectors.loadingSpinner).should('not.exist');
    return this;
  }

  shouldShowError(errorMessage) {
    cy.get(this.selectors.errorMessage)
      .should('be.visible')
      .and('contain', errorMessage);
    return this;
  }

  shouldShowCharacterDetail(characterName) {
    cy.get(this.selectors.characterDetail).should('be.visible');
    cy.get(this.selectors.characterName).should('contain', characterName);
    return this;
  }

  shouldHaveRelationshipCount(count) {
    cy.get(this.selectors.relationshipSection)
      .find('[data-cy="relationship-item"]')
      .should('have.length', count);
    return this;
  }

  shouldHaveCompletionPercentage(percentage) {
    cy.get('[data-cy="completion-percentage"]')
      .should('contain', `${percentage}%`);
    return this;
  }

  // * Utility methods
  waitForCharactersToLoad() {
    cy.get(this.selectors.loadingSpinner).should('not.exist');
    cy.get(this.selectors.characterList).should('be.visible');
    return this;
  }

  clearFilters() {
    cy.get(this.selectors.searchInput).clear();
    cy.get(this.selectors.categoryFilter).select('all');
    cy.get(this.selectors.completionFilter).select('all');
    return this;
  }
}

export default CharacterPage;