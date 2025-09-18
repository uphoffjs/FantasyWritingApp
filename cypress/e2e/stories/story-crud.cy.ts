/// <reference types="cypress" />

import { selectors } from '../../support/selectors';
import { StoryFactory } from '../../fixtures/factories/story.factory';
import { setupAuth } from '../../support/test-helpers';

/**
 * Story CRUD E2E tests
 * Adapted from fantasy-element-builder's project-crud.cy.ts
 */
describe('Story CRUD Operations', () => {
  beforeEach(() => {
    // Reset factory counters for test isolation
    StoryFactory.reset();
    
    // Setup authentication
    setupAuth();
    
    // Visit the stories page
    cy.visit('/stories');
    cy.waitForLoad();
  });

  describe('Create Story', () => {
    it('should create a new story', () => {
      // Click create story button
      cy.get(selectors.story.createButton).click();
      
      // Fill in story details
      const story = StoryFactory.create();
      cy.get(selectors.story.titleInput).type(story.title);
      cy.get(selectors.story.genreSelect).select(story.genre);
      cy.get(selectors.story.descriptionInput).type(story.summary || '');
      
      // Submit form
      cy.get(selectors.story.createSubmit).click();
      
      // Verify navigation to story editor
      cy.get(selectors.story.editor).should('be.visible');
      cy.url().should('include', '/story/');
      
      // Verify story appears in list
      cy.visit('/stories');
      cy.get(selectors.story.storiesList).should('contain', story.title);
    });

    it('should validate required fields', () => {
      cy.get(selectors.story.createButton).click();
      
      // Try to submit without title
      cy.get(selectors.story.createSubmit).click();
      
      // Should show validation error
      cy.get(selectors.form.fieldError('title')).should('be.visible');
      cy.get(selectors.form.fieldError('title')).should('contain', 'Title is required');
    });

    it('should cancel story creation', () => {
      cy.get(selectors.story.createButton).click();
      
      // Fill in some data
      cy.get(selectors.story.titleInput).type('Test Story');
      
      // Click cancel
      cy.get(selectors.story.cancelButton).click();
      
      // Should return to stories list
      cy.get(selectors.story.storiesList).should('be.visible');
      cy.get(selectors.story.titleInput).should('not.exist');
    });
  });

  describe('Read/View Story', () => {
    let testStory: ReturnType<typeof StoryFactory.create>;

    beforeEach(() => {
      // Create a test story via API or UI
      testStory = StoryFactory.createWithChapters(3);
      
      // Mock API response for story list
      cy.intercept('GET', '**/api/stories*', {
        statusCode: 200,
        body: [testStory]
      }).as('getStories');
      
      cy.visit('/stories');
      cy.wait('@getStories');
    });

    it('should display story in list', () => {
      cy.get(selectors.story.storyItem(testStory.id)).should('be.visible');
      cy.get(selectors.story.storyTitle(testStory.id)).should('contain', testStory.title);
      cy.get(selectors.story.storyPreview(testStory.id)).should('contain', testStory.summary);
    });

    it('should open story editor when clicked', () => {
      cy.get(selectors.story.storyItem(testStory.id)).click();
      
      cy.get(selectors.story.editor).should('be.visible');
      cy.get(selectors.story.content).should('contain', testStory.content);
      cy.get(selectors.story.wordCount).should('contain', testStory.wordCount.toString());
    });

    it('should display story metadata', () => {
      cy.get(selectors.story.storyItem(testStory.id)).click();
      
      // Check metadata display
      cy.get('[data-testid=story-genre]').should('contain', testStory.genre);
      cy.get('[data-testid=story-status]').should('contain', testStory.status);
      cy.get('[data-testid=chapter-count]').should('contain', testStory.chapters.length.toString());
    });
  });

  describe('Update Story', () => {
    let testStory: ReturnType<typeof StoryFactory.create>;

    beforeEach(() => {
      testStory = StoryFactory.createDraft();
      
      // Mock API responses
      cy.intercept('GET', '**/api/stories*', {
        statusCode: 200,
        body: [testStory]
      }).as('getStories');
      
      cy.intercept('PUT', `**/api/stories/${testStory.id}`, {
        statusCode: 200,
        body: { ...testStory, title: 'Updated Title' }
      }).as('updateStory');
      
      cy.visit('/stories');
      cy.wait('@getStories');
      cy.get(selectors.story.storyItem(testStory.id)).click();
    });

    it('should update story title', () => {
      // Clear and type new title
      cy.get(selectors.story.titleInput).clear().type('Updated Title');
      
      // Save changes
      cy.get(selectors.story.saveButton).click();
      cy.wait('@updateStory');
      
      // Verify success message
      cy.get(selectors.ui.saveSuccessMessage).should('be.visible');
      
      // Verify title is updated in list
      cy.visit('/stories');
      cy.get(selectors.story.storyTitle(testStory.id)).should('contain', 'Updated Title');
    });

    it('should auto-save story content', () => {
      // Type in story editor
      cy.get(selectors.story.content).type(' Additional content for the story.');
      
      // Wait for auto-save (typically after a debounce period)
      cy.wait(2000);
      
      // Check for auto-save indicator
      cy.get(selectors.story.lastSaved).should('contain', 'Saved');
    });

    it('should update story status', () => {
      // Change status from draft to published
      cy.get('[data-testid=story-status-select]').select('published');
      
      cy.get(selectors.story.saveButton).click();
      cy.wait('@updateStory');
      
      // Verify status change
      cy.get('[data-testid=story-status]').should('contain', 'published');
    });
  });

  describe('Delete Story', () => {
    let testStory: ReturnType<typeof StoryFactory.create>;

    beforeEach(() => {
      testStory = StoryFactory.create();
      
      // Mock API responses
      cy.intercept('GET', '**/api/stories*', {
        statusCode: 200,
        body: [testStory]
      }).as('getStories');
      
      cy.intercept('DELETE', `**/api/stories/${testStory.id}`, {
        statusCode: 204
      }).as('deleteStory');
      
      cy.visit('/stories');
      cy.wait('@getStories');
    });

    it('should delete a story with confirmation', () => {
      // Open story
      cy.get(selectors.story.storyItem(testStory.id)).click();
      
      // Click delete button
      cy.get(selectors.story.deleteButton).click();
      
      // Confirm deletion in modal
      cy.get(selectors.modal.root).should('be.visible');
      cy.get(selectors.modal.title).should('contain', 'Delete Story');
      cy.get(selectors.modal.confirm).click();
      
      cy.wait('@deleteStory');
      
      // Should redirect to stories list
      cy.url().should('include', '/stories');
      
      // Story should not be in list
      cy.get(selectors.story.storiesList).should('not.contain', testStory.title);
    });

    it('should cancel story deletion', () => {
      cy.get(selectors.story.storyItem(testStory.id)).click();
      cy.get(selectors.story.deleteButton).click();
      
      // Cancel deletion
      cy.get(selectors.modal.cancel).click();
      
      // Should stay on story editor
      cy.get(selectors.story.editor).should('be.visible');
      
      // Story should still exist
      cy.visit('/stories');
      cy.get(selectors.story.storiesList).should('contain', testStory.title);
    });
  });

  describe('Story List Operations', () => {
    beforeEach(() => {
      // Create multiple stories
      const stories = StoryFactory.createMany(10);
      
      cy.intercept('GET', '**/api/stories*', {
        statusCode: 200,
        body: stories
      }).as('getStories');
      
      cy.visit('/stories');
      cy.wait('@getStories');
    });

    it('should search stories', () => {
      cy.get(selectors.ui.searchInput).type('Test Story');
      
      // Should filter stories
      cy.get(selectors.story.storiesList)
        .find('[data-cy^=story-item]')
        .should('have.length.lessThan', 10);
    });

    it('should filter stories by genre', () => {
      cy.get(selectors.ui.filterButton).click();
      cy.get('[data-testid=filter-genre-fantasy]').click();
      
      // Should only show fantasy stories
      cy.get(selectors.story.storiesList)
        .find('[data-testid=story-genre]')
        .each(($el) => {
          cy.wrap($el).should('contain', 'fantasy');
        });
    });

    it('should sort stories', () => {
      // Sort by date (newest first)
      cy.get(selectors.ui.sortButton).click();
      cy.get('[data-testid=sort-date-desc]').click();
      
      // Verify sorting (would need to check actual dates)
      cy.get(selectors.story.storiesList)
        .find('[data-cy^=story-item]')
        .first()
        .should('contain', 'story-10'); // Latest created
    });

    it('should handle pagination', () => {
      // Mock API with more stories
      const manyStories = StoryFactory.createMany(25);
      cy.intercept('GET', '**/api/stories*', {
        statusCode: 200,
        body: manyStories.slice(0, 10),
        headers: {
          'x-total-count': '25'
        }
      }).as('getStoriesPage1');
      
      cy.visit('/stories');
      cy.wait('@getStoriesPage1');
      
      // Check pagination controls
      cy.get(selectors.pagination.next).should('be.visible');
      cy.get(selectors.pagination.info).should('contain', '1-10 of 25');
      
      // Go to next page
      cy.get(selectors.pagination.next).click();
      
      // Should load next set of stories
      cy.get(selectors.pagination.info).should('contain', '11-20 of 25');
    });
  });

  describe('Story Editor Features', () => {
    let testStory: ReturnType<typeof StoryFactory.createWithChapters>;

    beforeEach(() => {
      testStory = StoryFactory.createWithChapters(3);
      
      cy.intercept('GET', `**/api/stories/${testStory.id}`, {
        statusCode: 200,
        body: testStory
      }).as('getStory');
      
      cy.visit(`/story/${testStory.id}/edit`);
      cy.wait('@getStory');
    });

    it('should navigate between chapters', () => {
      // Should show first chapter by default
      cy.get('[data-testid=chapter-title]').should('contain', testStory.chapters[0].title);
      
      // Navigate to next chapter
      cy.get('[data-testid=next-chapter]').click();
      cy.get('[data-testid=chapter-title]').should('contain', testStory.chapters[1].title);
      
      // Navigate to previous chapter
      cy.get('[data-testid=prev-chapter]').click();
      cy.get('[data-testid=chapter-title]').should('contain', testStory.chapters[0].title);
    });

    it('should add a new chapter', () => {
      cy.get('[data-testid=add-chapter-button]').click();
      
      // Fill in chapter details
      cy.get('[data-testid=new-chapter-title]').type('New Chapter Title');
      cy.get('[data-testid=create-chapter-button]').click();
      
      // Should add chapter to the story
      cy.get('[data-testid=chapter-list]').should('contain', 'New Chapter Title');
    });

    it('should track word count', () => {
      const initialWordCount = testStory.wordCount;
      
      // Add more content
      cy.get(selectors.story.content).type(' Adding more words to the story.');
      
      // Word count should update
      cy.get(selectors.story.wordCount)
        .invoke('text')
        .then((text) => {
          const newCount = parseInt(text.replace(/\D/g, ''));
          expect(newCount).to.be.greaterThan(initialWordCount);
        });
    });
  });
});