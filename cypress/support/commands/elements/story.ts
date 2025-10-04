// * Story and writing-related Cypress commands

/**
 * Create a new story
 * @param title - Story title
 * @param genre - Story genre (default: Fantasy)
 */
Cypress.Commands.add('createStory', (title: string, genre = 'Fantasy') => {
  cy.get('[data-cy="create-story-button"]').click();
  cy.get('[data-cy="story-title-input"]').type(title);
  cy.get('[data-cy="story-genre-select"]').select(genre);
  cy.get('[data-cy="create-story-submit"]').click();
  cy.get('[data-cy="story-editor"]').should('be.visible');
});

/**
 * Open an existing story
 * @param title - Title of the story to open
 */
Cypress.Commands.add('openStory', (title: string) => {
  cy.get('[data-cy="stories-list"]').should('be.visible');
  const storyId = title.toLowerCase().replace(/\s+/g, '-');
  cy.get(`[data-cy="story-item-${storyId}"]`).click();
  cy.get('[data-cy="story-editor"]').should('be.visible');
});

/**
 * Save the current story
 */
Cypress.Commands.add('saveStory', () => {
  cy.get('[data-cy="save-story-button"]').click();
  cy.get('[data-cy="save-success-message"]').should('be.visible');
});

/**
 * Delete a story
 * @param title - Title of the story to delete
 */
Cypress.Commands.add('deleteStory', (title: string) => {
  const storyId = title.toLowerCase().replace(/\s+/g, '-');
  cy.get(`[data-cy="story-item-${storyId}"]`).rightclick();
  cy.get('[data-cy="delete-story-option"]').click();
  cy.get('[data-cy="confirm-delete-button"]').click();
  cy.get(`[data-cy="story-item-${storyId}"]`).should('not.exist');
});

/**
 * Add chapter to story
 * @param chapterTitle - Title of the new chapter
 */
Cypress.Commands.add('addChapter', (chapterTitle: string) => {
  cy.get('[data-cy="add-chapter-button"]').click();
  cy.get('[data-cy="chapter-title-input"]').type(chapterTitle);
  cy.get('[data-cy="save-chapter-button"]').click();
  cy.get(`[data-cy="chapter-${chapterTitle.toLowerCase().replace(/\s+/g, '-')}"]`).should('be.visible');
});

// * Export empty object to prevent TS errors
export {};