/**
 * StoryPage - Page Object for Story and Scene Management
 * Encapsulates all story and scene-related page interactions
 */

class StoryPage {
  // * Selectors
  selectors = {
    // Story list
    storyList: '[data-cy="story-list"]',
    storyCard: '[data-cy="story-card"]',
    storyTitle: '[data-cy="story-title"]',
    storyDescription: '[data-cy="story-description"]',

    // Story creation
    createStoryButton: '[data-cy="create-story-button"]',
    storyModal: '[data-cy="create-story-modal"]',
    titleInput: '[data-cy="story-title-input"]',
    descriptionInput: '[data-cy="story-description-input"]',
    genreSelect: '[data-cy="story-genre-select"]',
    submitButton: '[data-cy="submit-story-button"]',
    cancelButton: '[data-cy="cancel-button"]',

    // Scene management
    sceneList: '[data-cy="scene-list"]',
    sceneCard: '[data-cy="scene-card"]',
    createSceneButton: '[data-cy="create-scene-button"]',
    sceneModal: '[data-cy="create-scene-modal"]',
    sceneTitleInput: '[data-cy="scene-title-input"]',
    sceneContentInput: '[data-cy="scene-content-input"]',
    sceneLocationSelect: '[data-cy="scene-location-select"]',
    sceneCharactersSelect: '[data-cy="scene-characters-select"]',

    // Chapter management
    chapterList: '[data-cy="chapter-list"]',
    chapterCard: '[data-cy="chapter-card"]',
    createChapterButton: '[data-cy="create-chapter-button"]',
    chapterModal: '[data-cy="create-chapter-modal"]',
    chapterTitleInput: '[data-cy="chapter-title-input"]',
    chapterNumberInput: '[data-cy="chapter-number-input"]',

    // Story details
    storyDetail: '[data-cy="story-detail"]',
    editButton: '[data-cy="edit-story-button"]',
    deleteButton: '[data-cy="delete-story-button"]',
    exportButton: '[data-cy="export-story-button"]',

    // Writing tools
    wordCount: '[data-cy="word-count"]',
    characterCount: '[data-cy="character-count"]',
    readingTime: '[data-cy="reading-time"]',
    markdownEditor: '[data-cy="markdown-editor"]',
    previewButton: '[data-cy="preview-button"]',
    saveButton: '[data-cy="save-button"]',
    autoSaveIndicator: '[data-cy="auto-save-indicator"]',

    // Organization
    reorderButton: '[data-cy="reorder-scenes-button"]',
    dragHandle: '[data-cy="drag-handle"]',
    dropZone: '[data-cy="drop-zone"]',
    moveUpButton: '[data-cy="move-up-button"]',
    moveDownButton: '[data-cy="move-down-button"]',

    // Filters and search
    searchInput: '[data-cy="story-search-input"]',
    genreFilter: '[data-cy="genre-filter"]',
    statusFilter: '[data-cy="status-filter"]',

    // Loading and empty states
    loadingSpinner: '[data-cy="loading-spinner"]',
    emptyState: '[data-cy="empty-state"]',
    errorMessage: '[data-cy="error-message"]',

    // Timeline view
    timelineView: '[data-cy="timeline-view"]',
    timelineEvent: '[data-cy="timeline-event"]',
    chronologyButton: '[data-cy="chronology-button"]'
  };

  // * Navigation
  visit(projectId) {
    cy.visit(`/projects/${projectId}/stories`);
    return this;
  }

  visitStoryDetail(projectId, storyId) {
    cy.visit(`/projects/${projectId}/stories/${storyId}`);
    return this;
  }

  visitSceneDetail(projectId, storyId, sceneId) {
    cy.visit(`/projects/${projectId}/stories/${storyId}/scenes/${sceneId}`);
    return this;
  }

  // * Story Creation
  openCreateStoryModal() {
    cy.get(this.selectors.createStoryButton).click();
    cy.get(this.selectors.storyModal).should('be.visible');
    return this;
  }

  fillStoryForm({ title, description, genre }) {
    if (title) {
      cy.get(this.selectors.titleInput).clear().type(title);
    }
    if (description) {
      cy.get(this.selectors.descriptionInput).clear().type(description);
    }
    if (genre) {
      cy.get(this.selectors.genreSelect).select(genre);
    }
    return this;
  }

  submitStoryForm() {
    cy.get(this.selectors.submitButton).click();
    return this;
  }

  createNewStory(storyData) {
    this.openCreateStoryModal();
    this.fillStoryForm(storyData);
    this.submitStoryForm();
    cy.get(this.selectors.storyModal).should('not.exist');
    return this;
  }

  // * Scene Creation
  openCreateSceneModal() {
    cy.get(this.selectors.createSceneButton).click();
    cy.get(this.selectors.sceneModal).should('be.visible');
    return this;
  }

  fillSceneForm({ title, content, location, characters }) {
    if (title) {
      cy.get(this.selectors.sceneTitleInput).clear().type(title);
    }
    if (content) {
      cy.get(this.selectors.sceneContentInput).clear().type(content);
    }
    if (location) {
      cy.get(this.selectors.sceneLocationSelect).select(location);
    }
    if (characters && characters.length > 0) {
      characters.forEach(character => {
        cy.get(this.selectors.sceneCharactersSelect).select(character);
      });
    }
    return this;
  }

  createNewScene(sceneData) {
    this.openCreateSceneModal();
    this.fillSceneForm(sceneData);
    cy.get(this.selectors.submitButton).click();
    cy.get(this.selectors.sceneModal).should('not.exist');
    return this;
  }

  // * Chapter Creation
  openCreateChapterModal() {
    cy.get(this.selectors.createChapterButton).click();
    cy.get(this.selectors.chapterModal).should('be.visible');
    return this;
  }

  createNewChapter({ title, number }) {
    this.openCreateChapterModal();
    if (title) {
      cy.get(this.selectors.chapterTitleInput).clear().type(title);
    }
    if (number) {
      cy.get(this.selectors.chapterNumberInput).clear().type(number);
    }
    cy.get(this.selectors.submitButton).click();
    cy.get(this.selectors.chapterModal).should('not.exist');
    return this;
  }

  // * Story List Operations
  searchStories(searchTerm) {
    cy.get(this.selectors.searchInput).clear().type(searchTerm);
    return this;
  }

  filterByGenre(genre) {
    cy.get(this.selectors.genreFilter).select(genre);
    return this;
  }

  filterByStatus(status) {
    cy.get(this.selectors.statusFilter).select(status);
    return this;
  }

  selectStory(storyTitle) {
    cy.get(this.selectors.storyCard)
      .contains(storyTitle)
      .click();
    return this;
  }

  // * Story Detail Operations
  editStory() {
    cy.get(this.selectors.editButton).click();
    return this;
  }

  deleteStory() {
    cy.get(this.selectors.deleteButton).click();
    // * Handle confirmation dialog
    cy.on('window:confirm', () => true);
    return this;
  }

  exportStory(format = 'markdown') {
    cy.get(this.selectors.exportButton).click();
    cy.get(`[data-cy="export-${format}"]`).click();
    return this;
  }

  // * Scene Management
  selectScene(sceneTitle) {
    cy.get(this.selectors.sceneCard)
      .contains(sceneTitle)
      .click();
    return this;
  }

  reorderScene(fromIndex, toIndex) {
    cy.get(this.selectors.dragHandle).eq(fromIndex).as('draggedScene');
    cy.get(this.selectors.dropZone).eq(toIndex).as('dropTarget');

    cy.get('@draggedScene').drag('@dropTarget');
    return this;
  }

  moveSceneUp(sceneTitle) {
    cy.get(this.selectors.sceneCard)
      .contains(sceneTitle)
      .parent()
      .find(this.selectors.moveUpButton)
      .click();
    return this;
  }

  moveSceneDown(sceneTitle) {
    cy.get(this.selectors.sceneCard)
      .contains(sceneTitle)
      .parent()
      .find(this.selectors.moveDownButton)
      .click();
    return this;
  }

  // * Writing Tools
  writeContent(content) {
    cy.get(this.selectors.markdownEditor).clear().type(content);
    return this;
  }

  saveContent() {
    cy.get(this.selectors.saveButton).click();
    return this;
  }

  togglePreview() {
    cy.get(this.selectors.previewButton).click();
    return this;
  }

  waitForAutoSave() {
    cy.get(this.selectors.autoSaveIndicator).should('contain', 'Saved');
    return this;
  }

  // * Timeline Operations
  switchToTimelineView() {
    cy.get(this.selectors.chronologyButton).click();
    cy.get(this.selectors.timelineView).should('be.visible');
    return this;
  }

  selectTimelineEvent(eventTitle) {
    cy.get(this.selectors.timelineEvent)
      .contains(eventTitle)
      .click();
    return this;
  }

  // * Assertions
  shouldHaveStoryCount(count) {
    cy.get(this.selectors.storyCard).should('have.length', count);
    return this;
  }

  shouldShowStory(storyTitle) {
    cy.get(this.selectors.storyCard)
      .contains(storyTitle)
      .should('be.visible');
    return this;
  }

  shouldHaveSceneCount(count) {
    cy.get(this.selectors.sceneCard).should('have.length', count);
    return this;
  }

  shouldHaveChapterCount(count) {
    cy.get(this.selectors.chapterCard).should('have.length', count);
    return this;
  }

  shouldShowWordCount(count) {
    cy.get(this.selectors.wordCount).should('contain', count);
    return this;
  }

  shouldShowReadingTime(time) {
    cy.get(this.selectors.readingTime).should('contain', time);
    return this;
  }

  shouldShowEmptyState() {
    cy.get(this.selectors.emptyState).should('be.visible');
    return this;
  }

  shouldShowError(errorMessage) {
    cy.get(this.selectors.errorMessage)
      .should('be.visible')
      .and('contain', errorMessage);
    return this;
  }

  shouldShowStoryDetail(storyTitle) {
    cy.get(this.selectors.storyDetail).should('be.visible');
    cy.get(this.selectors.storyTitle).should('contain', storyTitle);
    return this;
  }

  shouldBeInChronologicalOrder(sceneTitles) {
    sceneTitles.forEach((title, index) => {
      cy.get(this.selectors.sceneCard)
        .eq(index)
        .should('contain', title);
    });
    return this;
  }

  // * Utility methods
  waitForStoriesToLoad() {
    cy.get(this.selectors.loadingSpinner).should('not.exist');
    cy.get(this.selectors.storyList).should('be.visible');
    return this;
  }

  clearFilters() {
    cy.get(this.selectors.searchInput).clear();
    cy.get(this.selectors.genreFilter).select('all');
    cy.get(this.selectors.statusFilter).select('all');
    return this;
  }

  verifyAutoSave() {
    cy.get(this.selectors.autoSaveIndicator).should('contain', 'Saving...');
    cy.get(this.selectors.autoSaveIndicator).should('contain', 'Saved');
    return this;
  }
}

export default StoryPage;