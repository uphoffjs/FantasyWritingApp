/**
 * ElementPage - Page object for element creation and management
 */

import BasePage from './BasePage';

class ElementPage extends BasePage {
  constructor() {
    super();
    this.path = '/project/:projectId/element/:elementId';
  }

  // * Page elements
  get elementNameInput() {
    return this.getByDataCy('element-name-input');
  }

  get elementDescriptionInput() {
    return this.getByDataCy('element-description-input');
  }

  get elementTypeSelect() {
    return this.getByDataCy('element-type-select');
  }

  get elementCategorySelect() {
    return this.getByDataCy('element-category-select');
  }

  get saveElementButton() {
    return this.getByDataCy('save-element-button');
  }

  get deleteElementButton() {
    return this.getByDataCy('delete-element-button');
  }

  get cancelButton() {
    return this.getByDataCy('cancel-button');
  }

  get backButton() {
    return this.getByDataCy('back-button');
  }

  get elementTabs() {
    return cy.get('[data-cy^="element-tab-"]');
  }

  get basicInfoTab() {
    return this.getByDataCy('element-tab-basic');
  }

  get questionsTab() {
    return this.getByDataCy('element-tab-questions');
  }

  get relationshipsTab() {
    return this.getByDataCy('element-tab-relationships');
  }

  get notesTab() {
    return this.getByDataCy('element-tab-notes');
  }

  get imageUploadButton() {
    return this.getByDataCy('element-image-upload');
  }

  get tagInput() {
    return this.getByDataCy('element-tag-input');
  }

  get elementTags() {
    return cy.get('[data-cy^="element-tag-"]');
  }

  get completionProgress() {
    return this.getByDataCy('element-completion-progress');
  }

  // * Question elements
  get questionFields() {
    return cy.get('[data-cy^="question-field-"]');
  }

  get addCustomQuestionButton() {
    return this.getByDataCy('add-custom-question-button');
  }

  // * Relationship elements
  get addRelationshipButton() {
    return this.getByDataCy('add-relationship-button');
  }

  get relationshipCards() {
    return cy.get('[data-cy^="relationship-card-"]');
  }

  get relationshipModal() {
    return this.getByDataCy('relationship-modal');
  }

  // * Page actions
  visitElement(projectId, elementId) {
    super.visit(`/project/${projectId}/element/${elementId}`);
    this.waitForElementToLoad();
    return this;
  }

  visitNewElement(projectId, elementType = 'character') {
    super.visit(`/project/${projectId}/element/new?type=${elementType}`);
    return this;
  }

  waitForElementToLoad() {
    cy.get('[data-cy="element-loading"]', { timeout: 10000 }).should('not.exist');
    return this;
  }

  // * Form actions
  enterName(name) {
    this.elementNameInput.clear().type(name);
    return this;
  }

  enterDescription(description) {
    this.elementDescriptionInput.clear().type(description);
    return this;
  }

  selectType(type) {
    this.elementTypeSelect.select(type);
    return this;
  }

  selectCategory(category) {
    this.elementCategorySelect.select(category);
    return this;
  }

  addTag(tag) {
    this.tagInput.type(`${tag}{enter}`);
    return this;
  }

  removeTag(tag) {
    cy.contains('[data-cy^="element-tag-"]', tag)
      .find('[data-cy="remove-tag"]')
      .click();
    return this;
  }

  uploadImage(imagePath) {
    cy.get('input[type="file"]').selectFile(imagePath, { force: true });
    return this;
  }

  // * Tab navigation
  switchToBasicInfo() {
    this.basicInfoTab.click();
    return this;
  }

  switchToQuestions() {
    this.questionsTab.click();
    return this;
  }

  switchToRelationships() {
    this.relationshipsTab.click();
    return this;
  }

  switchToNotes() {
    this.notesTab.click();
    return this;
  }

  // * Question handling
  answerQuestion(questionId, answer) {
    this.getByDataCy(`question-field-${questionId}`).clear().type(answer);
    return this;
  }

  answerAllQuestions(answers) {
    Object.keys(answers).forEach(questionId => {
      this.answerQuestion(questionId, answers[questionId]);
    });
    return this;
  }

  selectQuestionOption(questionId, option) {
    this.getByDataCy(`question-field-${questionId}`).select(option);
    return this;
  }

  addCustomQuestion(question, answer) {
    this.addCustomQuestionButton.click();
    this.getByDataCy('custom-question-text').type(question);
    this.getByDataCy('custom-question-answer').type(answer);
    this.getByDataCy('save-custom-question').click();
    return this;
  }

  // * Relationship management
  addRelationship(targetElement, relationshipType, description = '') {
    this.addRelationshipButton.click();
    this.getByDataCy('relationship-target-select').select(targetElement);
    this.getByDataCy('relationship-type-select').select(relationshipType);
    if (description) {
      this.getByDataCy('relationship-description').type(description);
    }
    this.getByDataCy('save-relationship-button').click();
    this.waitForModalToClose();
    return this;
  }

  editRelationship(relationshipId, updates) {
    cy.get(`[data-cy="relationship-card-${relationshipId}"]`)
      .find('[data-cy="edit-relationship"]')
      .click();

    if (updates.type) {
      this.getByDataCy('relationship-type-select').select(updates.type);
    }
    if (updates.description) {
      this.getByDataCy('relationship-description').clear().type(updates.description);
    }

    this.getByDataCy('save-relationship-button').click();
    this.waitForModalToClose();
    return this;
  }

  deleteRelationship(relationshipId) {
    cy.get(`[data-cy="relationship-card-${relationshipId}"]`)
      .find('[data-cy="delete-relationship"]')
      .click();
    this.getByDataCy('confirm-delete-button').click();
    return this;
  }

  waitForModalToClose() {
    this.relationshipModal.should('not.exist');
    return this;
  }

  // * Complex workflows
  createCompleteCharacter(characterData) {
    // Basic info
    this.enterName(characterData.name);
    this.enterDescription(characterData.description);

    if (characterData.category) {
      this.selectCategory(characterData.category);
    }

    if (characterData.tags) {
      characterData.tags.forEach(tag => this.addTag(tag));
    }

    // Questions
    if (characterData.questions) {
      this.switchToQuestions();
      this.answerAllQuestions(characterData.questions);
    }

    // Relationships
    if (characterData.relationships) {
      this.switchToRelationships();
      characterData.relationships.forEach(rel => {
        this.addRelationship(rel.target, rel.type, rel.description);
      });
    }

    // Notes
    if (characterData.notes) {
      this.switchToNotes();
      this.getByDataCy('element-notes').clear().type(characterData.notes);
    }

    this.saveElement();
    return this;
  }

  saveElement() {
    this.saveElementButton.click();
    cy.get('[data-cy="save-success"]', { timeout: 10000 }).should('be.visible');
    return this;
  }

  deleteElement() {
    this.deleteElementButton.click();
    this.getByDataCy('confirm-delete-button').click();
    cy.url().should('not.include', '/element/');
    return this;
  }

  // * Assertions
  shouldHaveName(name) {
    this.elementNameInput.should('have.value', name);
    return this;
  }

  shouldHaveDescription(description) {
    this.elementDescriptionInput.should('have.value', description);
    return this;
  }

  shouldHaveType(type) {
    this.elementTypeSelect.should('have.value', type);
    return this;
  }

  shouldHaveCategory(category) {
    this.elementCategorySelect.should('have.value', category);
    return this;
  }

  shouldHaveTag(tag) {
    cy.contains('[data-cy^="element-tag-"]', tag).should('exist');
    return this;
  }

  shouldNotHaveTag(tag) {
    cy.contains('[data-cy^="element-tag-"]', tag).should('not.exist');
    return this;
  }

  shouldHaveCompletionPercentage(percentage) {
    this.completionProgress.should('contain', `${percentage}%`);
    return this;
  }

  shouldHaveRelationshipCount(count) {
    this.relationshipCards.should('have.length', count);
    return this;
  }

  shouldHaveRelationship(targetName, type) {
    cy.contains('[data-cy^="relationship-card-"]', targetName)
      .should('exist')
      .and('contain', type);
    return this;
  }

  shouldShowSaveSuccess() {
    this.getByDataCy('save-success')
      .should('be.visible')
      .and('contain', 'saved');
    return this;
  }

  shouldShowValidationError(field) {
    this.getByDataCy(`${field}-error`).should('be.visible');
    return this;
  }

  shouldHaveQuestionAnswered(questionId) {
    this.getByDataCy(`question-field-${questionId}`)
      .invoke('val')
      .should('not.be.empty');
    return this;
  }

  shouldBeInViewMode() {
    this.elementNameInput.should('be.disabled');
    this.elementDescriptionInput.should('be.disabled');
    this.getByDataCy('edit-element-button').should('be.visible');
    return this;
  }

  shouldBeInEditMode() {
    this.elementNameInput.should('not.be.disabled');
    this.elementDescriptionInput.should('not.be.disabled');
    this.saveElementButton.should('be.visible');
    return this;
  }

  // * Utility methods
  getCompletionPercentage() {
    return this.completionProgress.invoke('text').then(text => {
      return parseInt(text.match(/\d+/)[0], 10);
    });
  }

  getAllQuestionAnswers() {
    const answers = {};
    return this.questionFields.each(($field, index) => {
      const questionId = $field.attr('data-cy').replace('question-field-', '');
      answers[questionId] = $field.val();
    }).then(() => answers);
  }

  exportElement() {
    this.getByDataCy('export-element-button').click();
    // Handle file download
    return this;
  }

  duplicateElement() {
    this.getByDataCy('duplicate-element-button').click();
    cy.url().should('include', '/element/new');
    return this;
  }

  // * Navigation
  goBack() {
    this.backButton.click();
    return this;
  }

  navigateToProject() {
    this.getByDataCy('project-breadcrumb').click();
    return this;
  }
}

export default ElementPage;