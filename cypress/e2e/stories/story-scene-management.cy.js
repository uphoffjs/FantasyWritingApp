/**
 * Story and Scene Management E2E Test
 *
 * Comprehensive user journey for creating and managing stories and scenes
 * Following Cypress best practices with data-cy attributes
 */

describe('Story and Scene Management Flow', () => {
  // * Use factory data for consistency
  const testStory = {
    title: `Epic Fantasy ${Date.now()}`,
    genre: 'Fantasy',
    description: 'A tale of heroes and magic',
    targetWordCount: 80000
  };

  const testScene = {
    title: 'The Beginning',
    description: 'Our hero awakens to find the world changed',
    chapter: 1,
    content: 'It was a dark and stormy night...'
  };

  beforeEach(function() {

    // * Clean state BEFORE test (Cypress best practice)
    cy.task('db:clean');

    // * Use session for auth (best practice)
    cy.session('authenticated-user', () => {
      cy.visit('/login');
      cy.get('[data-cy="email-input"]').type('test@example.com');
      cy.get('[data-cy="password-input"]').type('password123');
      cy.get('[data-cy="login-button"]').click();
      cy.url().should('include', '/projects');
    }, {
      validate() {
        cy.getCookie('auth-token').should('exist');
      }
    });

    // * Navigate to starting point
    cy.visit('/projects');
    cy.get('[data-cy="projects-page"]').should('be.visible');
  });

  describe('Story Creation and Management', () => {
    it('should create a new story with all details', () => {
      // * Navigate to stories section
      cy.get('[data-cy="nav-stories"]').click();
      cy.url().should('include', '/stories');

      // * Initiate story creation
      cy.get('[data-cy="create-story-button"]').click();
      cy.get('[data-cy="story-modal"]').should('be.visible');

      // * Fill in story details
      cy.get('[data-cy="story-title-input"]').type(testStory.title);
      cy.get('[data-cy="story-genre-select"]').select(testStory.genre);
      cy.get('[data-cy="story-description-textarea"]').type(testStory.description);
      cy.get('[data-cy="story-word-count-input"]').clear().type(testStory.targetWordCount);

      // * Submit story creation
      cy.get('[data-cy="create-story-submit"]').click();

      // * Verify navigation to story detail
      cy.url().should('match', /\/story\/[\w-]+/);
      cy.get('[data-cy="story-header"]').should('contain', testStory.title);
      cy.get('[data-cy="story-genre-badge"]').should('contain', testStory.genre);
    });

    it('should edit story details', () => {
      // * Create story via API for speed (Cypress best practice)
      cy.request('POST', '/api/stories', testStory).then((response) => {
        const storyId = response.body.id;
        cy.visit(`/story/${storyId}`);
      });

      // * Open edit modal
      cy.get('[data-cy="edit-story-button"]').click();
      cy.get('[data-cy="edit-story-modal"]').should('be.visible');

      // * Update story details
      const updatedTitle = `${testStory.title} - Revised`;
      cy.get('[data-cy="story-title-input"]').clear().type(updatedTitle);
      cy.get('[data-cy="story-status-select"]').select('In Progress');

      // * Save changes
      cy.get('[data-cy="save-story-button"]').click();

      // * Verify updates
      cy.get('[data-cy="story-header"]').should('contain', updatedTitle);
      cy.get('[data-cy="story-status"]').should('contain', 'In Progress');
    });

    it('should delete a story with confirmation', () => {
      // * Create story via API
      cy.request('POST', '/api/stories', testStory).then((response) => {
        const storyId = response.body.id;
        cy.visit(`/story/${storyId}`);
      });

      // * Initiate deletion
      cy.get('[data-cy="story-settings-menu"]').click();
      cy.get('[data-cy="delete-story-option"]').click();

      // * Confirm deletion
      cy.get('[data-cy="confirm-dialog"]').should('be.visible');
      cy.get('[data-cy="confirm-delete-button"]').click();

      // * Verify redirect to stories list
      cy.url().should('include', '/stories');
      cy.get('[data-cy="story-card"]').should('not.contain', testStory.title);
    });
  });

  describe('Scene Creation and Management', () => {
    let storyId;

    beforeEach(() => {

      // * Create story context for scenes
      cy.request('POST', '/api/stories', testStory).then((response) => {
        storyId = response.body.id;
        cy.visit(`/story/${storyId}`);
        cy.get('[data-cy="scenes-tab"]').click();
      });
    });

    it('should create a new scene with content', () => {
      // * Initiate scene creation
      cy.get('[data-cy="create-scene-button"]').click();
      cy.get('[data-cy="scene-modal"]').should('be.visible');

      // * Fill in scene details
      cy.get('[data-cy="scene-title-input"]').type(testScene.title);
      cy.get('[data-cy="scene-description-input"]').type(testScene.description);
      cy.get('[data-cy="scene-chapter-select"]').select(`Chapter ${testScene.chapter}`);

      // * Submit scene creation
      cy.get('[data-cy="create-scene-submit"]').click();

      // * Verify scene editor opens
      cy.url().should('include', '/scene/');
      cy.get('[data-cy="scene-editor"]').should('be.visible');

      // * Add content to scene
      cy.get('[data-cy="scene-content-editor"]').type(testScene.content);
      cy.get('[data-cy="save-scene-button"]').click();

      // * Verify save notification
      cy.get('[data-cy="notification"]').should('contain', 'Scene saved');
    });

    it('should reorder scenes within a chapter', () => {
      // * Create multiple scenes via API
      const scenes = [
        { ...testScene, title: 'Scene 1', order: 1 },
        { ...testScene, title: 'Scene 2', order: 2 },
        { ...testScene, title: 'Scene 3', order: 3 }
      ];

      cy.wrap(scenes).each((scene) => {
        cy.request('POST', `/api/stories/${storyId}/scenes`, scene);
      });

      cy.visit(`/story/${storyId}/scenes`);

      // * Drag scene 3 to position 1
      cy.get('[data-cy="scene-item-3"]')
        .trigger('dragstart');

      cy.get('[data-cy="scene-item-1"]')
        .trigger('drop');

      // * Verify new order
      cy.get('[data-cy="scene-list"] [data-cy^="scene-item"]').then(($scenes) => {
        expect($scenes.eq(0)).to.contain('Scene 3');
        expect($scenes.eq(1)).to.contain('Scene 1');
        expect($scenes.eq(2)).to.contain('Scene 2');
      });

      // * Verify persistence after refresh
      cy.reload();
      cy.get('[data-cy="scene-list"] [data-cy^="scene-item"]').first()
        .should('contain', 'Scene 3');
    });

    it('should link scenes to characters', () => {
      // * Create scene and character
      cy.request('POST', `/api/stories/${storyId}/scenes`, testScene).then((sceneResponse) => {
        const sceneId = sceneResponse.body.id;

        cy.request('POST', `/api/stories/${storyId}/characters`, {
          name: 'Hero Character',
          description: 'The protagonist'
        }).then((charResponse) => {
          const characterId = charResponse.body.id;

          cy.visit(`/story/${storyId}/scene/${sceneId}`);
        });
      });

      // * Open character linking interface
      cy.get('[data-cy="link-characters-button"]').click();
      cy.get('[data-cy="character-selector-modal"]').should('be.visible');

      // * Select character
      cy.get('[data-cy="character-checkbox-Hero Character"]').check();
      cy.get('[data-cy="confirm-character-link"]').click();

      // * Verify character appears in scene
      cy.get('[data-cy="scene-characters"]').should('contain', 'Hero Character');
    });

    it('should track scene word count', () => {
      // * Create scene
      cy.request('POST', `/api/stories/${storyId}/scenes`, testScene).then((response) => {
        const sceneId = response.body.id;
        cy.visit(`/story/${storyId}/scene/${sceneId}`);
      });

      // * Type content and verify word count updates
      const content = 'This is a test scene with exactly ten words here.';
      cy.get('[data-cy="scene-content-editor"]').clear().type(content);

      // * Verify word count display
      cy.get('[data-cy="word-count"]').should('contain', '10');

      // * Add more content
      cy.get('[data-cy="scene-content-editor"]').type(' Adding five more words now.');
      cy.get('[data-cy="word-count"]').should('contain', '15');
    });
  });

  describe('Chapter Management', () => {
    let storyId;

    beforeEach(() => {

      cy.request('POST', '/api/stories', testStory).then((response) => {
        storyId = response.body.id;
        cy.visit(`/story/${storyId}/chapters`);
      });
    });

    it('should create and manage chapters', () => {
      // * Create new chapter
      cy.get('[data-cy="create-chapter-button"]').click();
      cy.get('[data-cy="chapter-title-input"]').type('Chapter 1: The Beginning');
      cy.get('[data-cy="chapter-description-input"]').type('Where it all starts');
      cy.get('[data-cy="create-chapter-submit"]').click();

      // * Verify chapter creation
      cy.get('[data-cy="chapter-list"]').should('contain', 'Chapter 1: The Beginning');

      // * Add scene to chapter
      cy.get('[data-cy="chapter-item-1"]').click();
      cy.get('[data-cy="add-scene-to-chapter"]').click();
      cy.get('[data-cy="scene-title-input"]').type('Opening Scene');
      cy.get('[data-cy="create-scene-submit"]').click();

      // * Verify scene appears under chapter
      cy.get('[data-cy="chapter-1-scenes"]').should('contain', 'Opening Scene');
    });

    it('should reorder chapters', () => {
      // * Create multiple chapters
      const chapters = ['Prologue', 'Chapter 1', 'Chapter 2', 'Epilogue'];

      chapters.forEach((chapter) => {
        cy.request('POST', `/api/stories/${storyId}/chapters`, {
          title: chapter,
          order: chapters.indexOf(chapter)
        });
      });

      cy.visit(`/story/${storyId}/chapters`);

      // * Drag Epilogue before Chapter 1
      cy.get('[data-cy="chapter-item-Epilogue"]').trigger('dragstart');
      cy.get('[data-cy="chapter-item-Chapter 1"]').trigger('drop');

      // * Verify new order
      cy.get('[data-cy="chapter-list"] [data-cy^="chapter-item"]').then(($chapters) => {
        expect($chapters.eq(0)).to.contain('Prologue');
        expect($chapters.eq(1)).to.contain('Epilogue');
        expect($chapters.eq(2)).to.contain('Chapter 1');
        expect($chapters.eq(3)).to.contain('Chapter 2');
      });
    });
  });

  describe('Story Timeline and Progress', () => {
    let storyId;

    beforeEach(() => {

      cy.request('POST', '/api/stories', {
        ...testStory,
        targetWordCount: 10000,
        startDate: new Date().toISOString(),
        targetEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }).then((response) => {
        storyId = response.body.id;

        // * Create scenes with content
        const scenes = Array.from({ length: 5 }, (_, i) => ({
          title: `Scene ${i + 1}`,
          content: 'Lorem ipsum '.repeat(200), // ~200 words per scene
          chapter: Math.ceil((i + 1) / 2)
        }));

        scenes.forEach(scene => {
          cy.request('POST', `/api/stories/${storyId}/scenes`, scene);
        });

        cy.visit(`/story/${storyId}/progress`);
      });
    });

    it('should display story progress and statistics', () => {
      // * Verify progress indicators
      cy.get('[data-cy="total-word-count"]').should('contain', '1000');
      cy.get('[data-cy="target-word-count"]').should('contain', '10000');
      cy.get('[data-cy="progress-bar"]').should('have.attr', 'aria-valuenow', '10');

      // * Verify chapter statistics
      cy.get('[data-cy="chapter-count"]').should('contain', '3');
      cy.get('[data-cy="scene-count"]').should('contain', '5');
      cy.get('[data-cy="average-scene-length"]').should('contain', '200');

      // * Verify timeline
      cy.get('[data-cy="days-remaining"]').should('exist');
      cy.get('[data-cy="daily-word-target"]').should('contain', '300');
    });

    it('should update progress in real-time', () => {
      // * Navigate to a scene
      cy.get('[data-cy="nav-scenes"]').click();
      cy.get('[data-cy="scene-item-1"]').click();

      // * Add more content
      const additionalContent = ' '.concat('Extra words added here. '.repeat(50));
      cy.get('[data-cy="scene-content-editor"]').type(additionalContent);
      cy.get('[data-cy="save-scene-button"]').click();

      // * Navigate back to progress
      cy.get('[data-cy="nav-progress"]').click();

      // * Verify updated statistics
      cy.get('[data-cy="total-word-count"]').should('not.contain', '1000');
      cy.get('[data-cy="progress-bar"]').should('have.attr', 'aria-valuenow')
        .and('not.equal', '10');
    });
  });

  describe('Export and Backup', () => {
    let storyId;

    beforeEach(() => {

      // * Create story with content
      cy.request('POST', '/api/stories', testStory).then((response) => {
        storyId = response.body.id;

        // * Add scenes
        cy.request('POST', `/api/stories/${storyId}/scenes`, {
          ...testScene,
          content: 'Full scene content for export testing'
        });

        cy.visit(`/story/${storyId}`);
      });
    });

    it('should export story in different formats', () => {
      // * Navigate to export options
      cy.get('[data-cy="story-settings-menu"]').click();
      cy.get('[data-cy="export-story-option"]').click();
      cy.get('[data-cy="export-modal"]').should('be.visible');

      // * Test markdown export
      cy.get('[data-cy="export-format-markdown"]').click();
      cy.get('[data-cy="include-metadata-checkbox"]').check();
      cy.get('[data-cy="export-button"]').click();

      // * Verify download initiated (can't directly test file download in Cypress)
      cy.get('[data-cy="notification"]').should('contain', 'Export completed');

      // * Test JSON backup
      cy.get('[data-cy="story-settings-menu"]').click();
      cy.get('[data-cy="export-story-option"]').click();
      cy.get('[data-cy="export-format-json"]').click();
      cy.get('[data-cy="export-button"]').click();

      cy.get('[data-cy="notification"]').should('contain', 'Backup created');
    });
  });

  // ! NOTE: Failure handling is done globally in cypress/support/e2e.ts
  // ! Following Cypress best practices - no conditional statements in tests
});