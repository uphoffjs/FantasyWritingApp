/**
 * Character Creation Flow - E2E Test
 * Tests the complete character creation journey from project to fully detailed character
 *
 * User Story:
 * As a fantasy writer
 * I want to create detailed character profiles
 * So that I can develop rich, consistent characters for my stories
 *
 * Acceptance Criteria:
 * - User can navigate to character creation from project
 * - User can enter basic character information
 * - User can answer character development questions
 * - User can establish character relationships
 * - User can save and view the completed character
 * - Character appears in project's element list
 */

import LoginPage from '../../support/pages/LoginPage';
import ProjectListPage from '../../support/pages/ProjectListPage';
import ElementPage from '../../support/pages/ElementPage';
import NavigationPage from '../../support/pages/NavigationPage';

describe('Character Creation Flow', () => {
  const loginPage = new LoginPage();
  const projectListPage = new ProjectListPage();
  const elementPage = new ElementPage();
  const navigation = new NavigationPage();

  // * Test data
  const testProject = {
    name: 'Epic Fantasy Novel',
    description: 'A tale of heroes and magic',
    genre: 'Fantasy'
  };

  const testCharacter = {
    name: 'Aragorn Strider',
    description: 'A ranger from the North, heir to the throne of Gondor',
    category: 'protagonist',
    tags: ['ranger', 'king', 'warrior'],
    questions: {
      'appearance': 'Tall, dark-haired, weathered face with grey eyes',
      'personality': 'Noble, brave, humble despite royal heritage',
      'backstory': 'Raised in Rivendell after father was killed',
      'motivation': 'Protect Middle-earth and reclaim his throne',
      'strengths': 'Leadership, combat skills, tracking abilities',
      'weaknesses': 'Self-doubt about worthiness to be king',
      'relationships': 'Close bonds with Fellowship members'
    },
    notes: 'Main protagonist of the story, undergoes hero journey'
  };

  before(() => {
    // * Setup: Create a user and project for testing
    cy.task('seedDatabase', {
      users: 1,
      projects: 1
    }).then((data) => {
      cy.wrap(data.user).as('testUser');
      cy.wrap(data.projects[0]).as('testProject');
    });
  });

  beforeEach(() => {
    // * Login and navigate to project
    cy.session('authenticated-user', () => {
      loginPage.loginViaAPI('test@example.com', 'Test123!');
    });

    cy.visit('/projects');
    projectListPage.waitForProjectsToLoad();
  });

  describe('Character Creation Success Path', () => {
    it('should create a complete character profile', () => {
      // * Step 1: Navigate to project
      projectListPage.selectProject('Epic Fantasy Novel');
      cy.url().should('include', '/project/');

      // * Step 2: Start character creation
      cy.get('[data-cy="create-element-button"]').click();
      cy.get('[data-cy="element-type-character"]').click();

      // * Step 3: Fill basic information
      elementPage.enterName(testCharacter.name);
      elementPage.enterDescription(testCharacter.description);
      elementPage.selectCategory(testCharacter.category);

      // * Step 4: Add tags
      testCharacter.tags.forEach(tag => {
        elementPage.addTag(tag);
      });

      // * Step 5: Answer character questions
      elementPage.switchToQuestions();
      Object.keys(testCharacter.questions).forEach(questionId => {
        elementPage.answerQuestion(questionId, testCharacter.questions[questionId]);
      });

      // * Step 6: Add notes
      elementPage.switchToNotes();
      cy.get('[data-cy="element-notes"]').type(testCharacter.notes);

      // * Step 7: Save character
      elementPage.saveElement();
      elementPage.shouldShowSaveSuccess();

      // * Step 8: Verify character was created
      elementPage.shouldHaveName(testCharacter.name);
      elementPage.shouldHaveDescription(testCharacter.description);
      elementPage.shouldHaveCategory(testCharacter.category);

      // * Step 9: Verify character appears in project list
      elementPage.navigateToProject();
      cy.get('[data-cy="element-list"]').should('contain', testCharacter.name);
    });

    it('should calculate completion percentage based on filled fields', () => {
      // * Create minimal character
      projectListPage.selectProject('Epic Fantasy Novel');
      cy.get('[data-cy="create-element-button"]').click();
      cy.get('[data-cy="element-type-character"]').click();

      // * Only fill required fields
      elementPage.enterName('Minimal Character');
      elementPage.saveElement();

      // * Check low completion percentage
      elementPage.shouldHaveCompletionPercentage(20);

      // * Add more details
      elementPage.enterDescription('A mysterious figure');
      elementPage.selectCategory('supporting');
      elementPage.addTag('mysterious');
      elementPage.saveElement();

      // * Check increased completion
      elementPage.shouldHaveCompletionPercentage(40);

      // * Answer questions
      elementPage.switchToQuestions();
      elementPage.answerQuestion('appearance', 'Unknown');
      elementPage.answerQuestion('personality', 'Secretive');
      elementPage.saveElement();

      // * Check higher completion
      elementPage.shouldHaveCompletionPercentage(60);
    });

    it('should allow image upload for character', () => {
      projectListPage.selectProject('Epic Fantasy Novel');
      cy.get('[data-cy="create-element-button"]').click();
      cy.get('[data-cy="element-type-character"]').click();

      elementPage.enterName('Visual Character');

      // * Upload character image
      elementPage.uploadImage('cypress/fixtures/character-portrait.jpg');

      // * Verify image uploaded
      cy.get('[data-cy="element-image-preview"]').should('be.visible');
      cy.get('[data-cy="element-image-preview"]')
        .should('have.attr', 'src')
        .and('include', 'character-portrait');

      elementPage.saveElement();
      elementPage.shouldShowSaveSuccess();
    });
  });

  describe('Character Relationships', () => {
    it('should create relationships between characters', () => {
      // * Create first character
      projectListPage.selectProject('Epic Fantasy Novel');
      cy.get('[data-cy="create-element-button"]').click();
      cy.get('[data-cy="element-type-character"]').click();
      elementPage.enterName('Frodo Baggins');
      elementPage.saveElement();

      // * Create second character
      elementPage.navigateToProject();
      cy.get('[data-cy="create-element-button"]').click();
      cy.get('[data-cy="element-type-character"]').click();
      elementPage.enterName('Samwise Gamgee');
      elementPage.saveElement();

      // * Add relationship
      elementPage.switchToRelationships();
      elementPage.addRelationship(
        'Frodo Baggins',
        'friend',
        'Loyal companion on the journey'
      );

      elementPage.shouldHaveRelationshipCount(1);
      elementPage.shouldHaveRelationship('Frodo Baggins', 'friend');

      // * Verify bidirectional relationship
      elementPage.navigateToProject();
      cy.contains('[data-cy^="element-card-"]', 'Frodo Baggins').click();
      elementPage.switchToRelationships();
      elementPage.shouldHaveRelationship('Samwise Gamgee', 'friend');
    });

    it('should handle multiple relationship types', () => {
      projectListPage.selectProject('Epic Fantasy Novel');

      // * Create character with multiple relationships
      cy.get('[data-cy="create-element-button"]').click();
      cy.get('[data-cy="element-type-character"]').click();
      elementPage.enterName('Complex Character');
      elementPage.saveElement();

      elementPage.switchToRelationships();

      // * Add different relationship types
      const relationships = [
        { target: 'Aragorn Strider', type: 'ally', description: 'Fellow warrior' },
        { target: 'Frodo Baggins', type: 'protector', description: 'Sworn to protect' },
        { target: 'Sauron', type: 'enemy', description: 'Ancient nemesis' }
      ];

      relationships.forEach(rel => {
        elementPage.addRelationship(rel.target, rel.type, rel.description);
      });

      elementPage.shouldHaveRelationshipCount(3);
    });
  });

  describe('Character Templates', () => {
    it('should use character template to pre-fill questions', () => {
      projectListPage.selectProject('Epic Fantasy Novel');
      cy.get('[data-cy="create-element-button"]').click();
      cy.get('[data-cy="element-type-character"]').click();

      // * Select template
      cy.get('[data-cy="template-selector"]').select('Hero Archetype');

      // * Verify template populated fields
      elementPage.shouldHaveCategory('protagonist');
      cy.get('[data-cy="suggested-questions"]').should('be.visible');

      // * Template should include hero-specific questions
      elementPage.switchToQuestions();
      cy.get('[data-cy="question-field-hero-journey"]').should('exist');
      cy.get('[data-cy="question-field-fatal-flaw"]').should('exist');
      cy.get('[data-cy="question-field-call-to-adventure"]').should('exist');
    });

    it('should allow switching between templates', () => {
      projectListPage.selectProject('Epic Fantasy Novel');
      cy.get('[data-cy="create-element-button"]').click();
      cy.get('[data-cy="element-type-character"]').click();

      // * Start with villain template
      cy.get('[data-cy="template-selector"]').select('Villain Archetype');
      elementPage.switchToQuestions();
      cy.get('[data-cy="question-field-evil-motivation"]').should('exist');

      // * Switch to mentor template
      elementPage.switchToBasicInfo();
      cy.get('[data-cy="template-selector"]').select('Mentor Archetype');
      elementPage.switchToQuestions();
      cy.get('[data-cy="question-field-wisdom-to-impart"]').should('exist');
      cy.get('[data-cy="question-field-evil-motivation"]').should('not.exist');
    });
  });

  describe('Character Validation', () => {
    it('should validate required fields', () => {
      projectListPage.selectProject('Epic Fantasy Novel');
      cy.get('[data-cy="create-element-button"]').click();
      cy.get('[data-cy="element-type-character"]').click();

      // * Try to save without name
      elementPage.saveElement();
      elementPage.shouldShowValidationError('name');

      // * Add name and save
      elementPage.enterName('Valid Character');
      elementPage.saveElement();
      elementPage.shouldShowSaveSuccess();
    });

    it('should prevent duplicate character names in same project', () => {
      projectListPage.selectProject('Epic Fantasy Novel');

      // * Try to create character with existing name
      cy.get('[data-cy="create-element-button"]').click();
      cy.get('[data-cy="element-type-character"]').click();
      elementPage.enterName('Aragorn Strider'); // Already exists
      elementPage.saveElement();

      cy.get('[data-cy="error-message"]')
        .should('be.visible')
        .and('contain', 'already exists');
    });

    it('should validate character name length', () => {
      projectListPage.selectProject('Epic Fantasy Novel');
      cy.get('[data-cy="create-element-button"]').click();
      cy.get('[data-cy="element-type-character"]').click();

      // * Test maximum length
      const longName = 'A'.repeat(256);
      elementPage.enterName(longName);
      elementPage.saveElement();
      elementPage.shouldShowValidationError('name');

      // * Test valid length
      elementPage.enterName('A'.repeat(100));
      elementPage.saveElement();
      elementPage.shouldShowSaveSuccess();
    });
  });

  describe('Character Editing', () => {
    it('should edit existing character', () => {
      projectListPage.selectProject('Epic Fantasy Novel');
      cy.contains('[data-cy^="element-card-"]', 'Aragorn Strider').click();

      // * Edit character details
      elementPage.enterName('Aragorn II Elessar');
      elementPage.enterDescription('The returned king of Gondor');
      elementPage.addTag('king');
      elementPage.saveElement();

      elementPage.shouldShowSaveSuccess();
      elementPage.shouldHaveName('Aragorn II Elessar');
    });

    it('should track edit history', () => {
      projectListPage.selectProject('Epic Fantasy Novel');
      cy.contains('[data-cy^="element-card-"]', 'Aragorn Strider').click();

      // * Make an edit
      elementPage.enterDescription('Updated description');
      elementPage.saveElement();

      // * Check history
      cy.get('[data-cy="view-history-button"]').click();
      cy.get('[data-cy="history-modal"]').should('be.visible');
      cy.get('[data-cy="history-entry"]').should('have.length.greaterThan', 0);
      cy.get('[data-cy="history-entry"]').first().should('contain', 'Updated description');
    });

    it('should autosave changes', () => {
      projectListPage.selectProject('Epic Fantasy Novel');
      cy.contains('[data-cy^="element-card-"]', 'Aragorn Strider').click();

      // * Enable autosave
      cy.get('[data-cy="autosave-toggle"]').click();

      // * Make changes
      elementPage.enterDescription('Autosaved description');

      // * Wait for autosave (usually 2-3 seconds)
      cy.wait(3000);

      // * Refresh page
      cy.reload();

      // * Verify changes persisted
      elementPage.shouldHaveDescription('Autosaved description');
    });
  });

  describe('Character Deletion', () => {
    it('should delete character with confirmation', () => {
      projectListPage.selectProject('Epic Fantasy Novel');
      cy.contains('[data-cy^="element-card-"]', 'Minimal Character').click();

      // * Delete character
      elementPage.deleteElement();

      // * Verify navigation back to project
      cy.url().should('include', '/project/');
      cy.url().should('not.include', '/element/');

      // * Verify character removed from list
      cy.get('[data-cy="element-list"]').should('not.contain', 'Minimal Character');
    });

    it('should handle relationship cleanup on deletion', () => {
      // * Delete character with relationships
      projectListPage.selectProject('Epic Fantasy Novel');
      cy.contains('[data-cy^="element-card-"]', 'Samwise Gamgee').click();
      elementPage.deleteElement();

      // * Check related character
      cy.contains('[data-cy^="element-card-"]', 'Frodo Baggins').click();
      elementPage.switchToRelationships();
      elementPage.shouldHaveRelationshipCount(0);
    });
  });

  describe('Character Search and Filter', () => {
    it('should search characters by name', () => {
      projectListPage.selectProject('Epic Fantasy Novel');

      // * Search for specific character
      cy.get('[data-cy="element-search"]').type('Aragorn');
      cy.get('[data-cy="element-list"]').should('contain', 'Aragorn');
      cy.get('[data-cy="element-list"]').should('not.contain', 'Frodo');

      // * Clear search
      cy.get('[data-cy="element-search"]').clear();
      cy.get('[data-cy="element-list"]').should('contain', 'Frodo');
    });

    it('should filter characters by category', () => {
      projectListPage.selectProject('Epic Fantasy Novel');

      // * Filter by protagonist
      cy.get('[data-cy="category-filter"]').select('protagonist');
      cy.get('[data-cy^="element-card-"]').should('have.length.greaterThan', 0);

      // * Filter by antagonist
      cy.get('[data-cy="category-filter"]').select('antagonist');
      cy.get('[data-cy="no-results-message"]').should('be.visible');
    });

    it('should filter characters by tags', () => {
      projectListPage.selectProject('Epic Fantasy Novel');

      // * Click on tag to filter
      cy.contains('[data-cy^="tag-filter-"]', 'ranger').click();
      cy.get('[data-cy="element-list"]').should('contain', 'Aragorn');
      cy.get('[data-cy="active-filters"]').should('contain', 'ranger');

      // * Remove filter
      cy.get('[data-cy="clear-filters"]').click();
      cy.get('[data-cy="active-filters"]').should('not.exist');
    });
  });

  describe('Mobile Character Creation', () => {
    beforeEach(() => {
      cy.viewport('iphone-x');
    });

    it('should work on mobile devices', () => {
      projectListPage.selectProject('Epic Fantasy Novel');
      cy.get('[data-cy="create-element-button"]').click();
      cy.get('[data-cy="element-type-character"]').click();

      // * Mobile-optimized form
      elementPage.enterName('Mobile Character');
      elementPage.enterDescription('Created on mobile');

      // * Swipe to navigate tabs
      elementPage.switchToQuestions();
      cy.get('[data-cy="questions-tab-content"]').should('be.visible');

      elementPage.saveElement();
      elementPage.shouldShowSaveSuccess();
    });
  });

  describe('Performance', () => {
    it('should load character list efficiently', () => {
      // * Create many characters for performance testing
      cy.task('seedDatabase', {
        projectId: 'test-project-id',
        characters: 100
      });

      // * Measure load time
      cy.window().then(win => {
        win.performance.mark('character-list-start');
      });

      projectListPage.selectProject('Epic Fantasy Novel');

      cy.window().then(win => {
        win.performance.mark('character-list-end');
        win.performance.measure(
          'character-list-load',
          'character-list-start',
          'character-list-end'
        );

        const measure = win.performance.getEntriesByName('character-list-load')[0];
        expect(measure.duration).to.be.lessThan(2000); // Should load in 2 seconds
      });

      // * Verify virtualization works
      cy.get('[data-cy^="element-card-"]').should('have.length.lessThan', 20); // Only visible items rendered
    });
  });
});