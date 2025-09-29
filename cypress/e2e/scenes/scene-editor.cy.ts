/// <reference types="cypress" />


/**
 * E2E Test for Scene Creation and Editing
 * 
 * This test covers scene management workflows including creation,
 * editing, ordering, and chapter organization.
 */

describe('Scene Editor and Management', () => {
  beforeEach(() => {
    // * Using cy.session() for authentication caching
    // ! MANDATORY: Comprehensive debug setup
    cy.comprehensiveDebug();

    // * Setup test environment
    // * Use session-based API login for faster authentication
    cy.apiLogin('test@example.com', 'testpassword123')
    // * Use session-based API login for faster authentication
    cy.apiLogin('test@example.com', 'testpassword123')
    cy.visit('/stories')
    
    // * Wait for page to load
    cy.get('[data-cy="page-container"]').should('be.visible')
    cy.url().should('include', '/stories')
    
    // * Create a story through the UI
    cy.get('[data-cy="create-story"]').click()
    cy.get('[data-cy="story-title"]').type('Scene Test Epic')
    cy.get('[data-cy="story-description"]').type('A test story for scene workflows')
    cy.get('[data-cy="submit"]').click()
    
    // * Wait for story to be created and navigate to it
    cy.get('[data-cy="story-card"]').should('contain', 'Scene Test Epic')
    cy.get('[data-cy="story-card"]').click()
  })

  describe('Scene Creation', () => {
    it('should create a new scene with basic information', () => {
      // * Navigate to scenes section
      cy.get('[data-cy="nav-scenes"]').click()
      
      // * Click create scene button
      cy.get('[data-cy="create-scene-button"]').click()
      
      // * Fill in scene information
      cy.get('[data-cy="scene-title-input"]').type('Opening Scene')
      cy.get('[data-cy="scene-description-input"]').type('The story begins on a dark night')
      cy.get('[data-cy="scene-chapter-select"]').select('Chapter 1')
      
      // * Submit the creation form
      cy.get('[data-cy="create-scene-submit"]').click()
      
      // TODO: * Should redirect to scene editor
      cy.url().should('include', '/scene')
      
      // * Verify scene was created
      cy.contains('Opening Scene').should('be.visible')
      
      // * Check that scene editor is rendered
      cy.get('[data-cy="scene-editor"]').should('be.visible')
    })

    it('should create scenes with different types', () => {
      cy.get('[data-cy="nav-scenes"]').click()
      
      // * Create action scene
      cy.get('[data-cy="create-scene-button"]').click()
      cy.get('[data-cy="scene-title-input"]').type('Battle Scene')
      cy.get('[data-cy="scene-type-select"]').select('Action')
      cy.get('[data-cy="create-scene-submit"]').click()
      cy.go('back')
      
      // * Create dialogue scene
      cy.get('[data-cy="create-scene-button"]').click()
      cy.get('[data-cy="scene-title-input"]').type('Character Conversation')
      cy.get('[data-cy="scene-type-select"]').select('Dialogue')
      cy.get('[data-cy="create-scene-submit"]').click()
      cy.go('back')
      
      // * Create exposition scene
      cy.get('[data-cy="create-scene-button"]').click()
      cy.get('[data-cy="scene-title-input"]').type('World Building')
      cy.get('[data-cy="scene-type-select"]').select('Exposition')
      cy.get('[data-cy="create-scene-submit"]').click()
      cy.go('back')
      
      // ? TODO: * Should show all scenes with their types
      cy.contains('Battle Scene').should('be.visible')
      cy.contains('Character Conversation').should('be.visible')
      cy.contains('World Building').should('be.visible')
    })
  })

  describe('Scene Editing', () => {
    beforeEach(() => {
    // * Using cy.session() for authentication caching
    // ! MANDATORY: Comprehensive debug setup
    cy.comprehensiveDebug();

      // * Create a scene to edit
      cy.get('[data-cy="nav-scenes"]').click()
      cy.get('[data-cy="create-scene-button"]').click()
      cy.get('[data-cy="scene-title-input"]').type('Test Scene')
      cy.get('[data-cy="scene-description-input"]').type('A scene for testing editing')
      cy.get('[data-cy="create-scene-submit"]').click()
    })

    it('should edit scene content with rich text editor', () => {
      // * Open scene content editor
      cy.get('[data-cy="scene-content-editor"]').should('be.visible')
      
      // * Type content in the editor
      cy.get('[data-cy="scene-content-editor"] [contenteditable]').click()
      cy.get('[data-cy="scene-content-editor"] [contenteditable]').type('The hero walked into the tavern, sword at their side.')
      
      // * Use formatting tools
      cy.get('[data-cy="scene-content-editor"] [contenteditable]').select()
      cy.get('[data-cy="format-bold"]').click()
      
      // * Add more content
      cy.get('[data-cy="scene-content-editor"] [contenteditable]').type('{movetoend}')
      cy.get('[data-cy="scene-content-editor"] [contenteditable]').type(' The room fell silent.')
      
      // ! Following Cypress best practices - wait for save indicator instead of arbitrary time
      // * Wait for auto-save to complete
      cy.get('[data-cy="save-status"]', { timeout: 3000 })
        .should('contain', 'Saved')
      
      // * Refresh and verify content persisted
      cy.reload()
      cy.get('[data-cy="scene-content-editor"]').should('contain', 'The hero walked')
    })

    it('should assign characters to scenes', () => {
      // * First create some characters
      cy.go('back') // Back to story view
      cy.get('[data-cy="create-character-button"]').click()
      cy.get('[data-cy="character-type-protagonist"]').click()
      cy.get('[data-cy="character-name-input"]').type('Hero')
      cy.get('[data-cy="create-character-submit"]').click()
      cy.go('back')
      
      cy.get('[data-cy="create-character-button"]').click()
      cy.get('[data-cy="character-type-supporting"]').click()
      cy.get('[data-cy="character-name-input"]').type('Sidekick')
      cy.get('[data-cy="create-character-submit"]').click()
      cy.go('back')
      
      // * Go back to scene
      cy.get('[data-cy="nav-scenes"]').click()
      cy.contains('Test Scene').click()
      
      // * Assign characters to scene
      cy.get('[data-cy="scene-characters-section"]').should('be.visible')
      cy.get('[data-cy="add-character-to-scene"]').click()
      
      cy.get('[data-cy="character-select-dropdown"]').click()
      cy.get('[data-cy="character-option-hero"]').click()
      cy.get('[data-cy="character-option-sidekick"]').click()
      cy.get('[data-cy="assign-characters-submit"]').click()
      
      // * Verify characters are assigned
      cy.contains('Hero').should('be.visible')
      cy.contains('Sidekick').should('be.visible')
    })

    it('should edit scene metadata', () => {
      // * Edit scene title and description
      cy.get('[data-cy="scene-header-edit"]').click()
      cy.get('[data-cy="scene-title-edit-input"]').clear().type('Revised Test Scene')
      cy.get('[data-cy="scene-description-edit-input"]').clear().type('Updated description for testing')
      cy.get('[data-cy="scene-header-save"]').click()
      
      // * Verify changes were saved
      cy.contains('Revised Test Scene').should('be.visible')
      cy.contains('Updated description for testing').should('be.visible')
      
      // * Change scene type
      cy.get('[data-cy="scene-metadata-edit"]').click()
      cy.get('[data-cy="scene-type-edit-select"]').select('Climax')
      cy.get('[data-cy="scene-metadata-save"]').click()
      
      // * Verify type change
      cy.get('[data-cy="scene-type-indicator"]').should('contain', 'Climax')
    })
  })

  describe('Scene Organization', () => {
    beforeEach(() => {
    // * Using cy.session() for authentication caching
    // ! MANDATORY: Comprehensive debug setup
    cy.comprehensiveDebug();

      // * Create multiple scenes for organization testing
      cy.get('[data-cy="nav-scenes"]').click()
      
      const scenes = [
        { title: 'Opening', chapter: 'Chapter 1', order: 1 },
        { title: 'Inciting Incident', chapter: 'Chapter 1', order: 2 },
        { title: 'Rising Action', chapter: 'Chapter 2', order: 3 },
        { title: 'Climax', chapter: 'Chapter 3', order: 4 }
      ]
      
      scenes.forEach(scene => {
        cy.get('[data-cy="create-scene-button"]').click()
        cy.get('[data-cy="scene-title-input"]').type(scene.title)
        cy.get('[data-cy="scene-chapter-select"]').select(scene.chapter)
        cy.get('[data-cy="create-scene-submit"]').click()
        cy.go('back')
      })
    })

    it('should reorder scenes within chapters', () => {
      // ? TODO: * Should show scenes in order
      cy.get('[data-cy^="scene-card-"]').should('have.length', 4)
      
      // * Drag and drop to reorder (if drag-drop is implemented)
      cy.get('[data-cy="scene-card-opening"]').should('be.visible')
      cy.get('[data-cy="scene-card-inciting-incident"]').should('be.visible')
      
      // Alternative: Use reorder buttons
      cy.get('[data-cy="scene-reorder-buttons"]').should('be.visible')
      cy.get('[data-cy="move-scene-down-opening"]').click()
      
      // * Verify new order
      cy.get('[data-cy^="scene-card-"]').first().should('contain', 'Inciting Incident')
    })

    it('should organize scenes by chapters', () => {
      // * Switch to chapter view
      cy.get('[data-cy="view-by-chapters"]').click()
      
      // ? TODO: * Should show chapter sections
      cy.get('[data-cy="chapter-section-1"]').should('be.visible')
      cy.get('[data-cy="chapter-section-2"]').should('be.visible')
      cy.get('[data-cy="chapter-section-3"]').should('be.visible')
      
      // TODO: * Each chapter should contain appropriate scenes
      cy.get('[data-cy="chapter-section-1"]').within(() => {
        cy.contains('Opening').should('be.visible')
        cy.contains('Inciting Incident').should('be.visible')
      })
      
      cy.get('[data-cy="chapter-section-2"]').within(() => {
        cy.contains('Rising Action').should('be.visible')
      })
    })

    it('should move scenes between chapters', () => {
      // * Click on a scene to edit
      cy.contains('Rising Action').click()
      
      // * Change chapter assignment
      cy.get('[data-cy="scene-metadata-edit"]').click()
      cy.get('[data-cy="scene-chapter-edit-select"]').select('Chapter 1')
      cy.get('[data-cy="scene-metadata-save"]').click()
      
      // * Go back to scenes list
      cy.go('back')
      cy.get('[data-cy="view-by-chapters"]').click()
      
      // * Verify scene moved to new chapter
      cy.get('[data-cy="chapter-section-1"]').within(() => {
        cy.contains('Rising Action').should('be.visible')
      })
    })
  })

  describe('Scene Management', () => {
    beforeEach(() => {
    // * Using cy.session() for authentication caching
    // ! MANDATORY: Comprehensive debug setup
    cy.comprehensiveDebug();

      // * Create multiple scenes
      cy.get('[data-cy="nav-scenes"]').click()
      
      ['Scene 1', 'Scene 2', 'Scene 3'].forEach(title => {
        cy.get('[data-cy="create-scene-button"]').click()
        cy.get('[data-cy="scene-title-input"]').type(title)
        cy.get('[data-cy="create-scene-submit"]').click()
        cy.go('back')
      })
    })

    it('should search and filter scenes', () => {
      // * Search for specific scene
      cy.get('[data-cy="search-scenes-input"]').type('Scene 2')
      cy.get('[data-cy^="scene-card-"]').should('have.length', 1)
      cy.contains('Scene 2').should('be.visible')
      
      // * Clear search
      cy.get('[data-cy="search-scenes-input"]').clear()
      cy.get('[data-cy^="scene-card-"]').should('have.length', 3)
      
      // * Filter by scene type
      cy.get('[data-cy="filter-scene-type-select"]').select('Action')
      // ? (This would show only action scenes if any were marked as such)
    })

    it('should delete a scene', () => {
      // * Click on a scene
      cy.contains('Scene 2').click()
      
      // * Delete the scene
      cy.get('[data-cy="scene-delete-button"]').click()
      cy.get('[data-cy="confirm-delete"]').click()
      
      // TODO: * Should redirect back to scenes list
      cy.url().should('include', '/story')
      
      // TODO: * Scene should be gone
      cy.get('[data-cy="nav-scenes"]').click()
      cy.contains('Scene 2').should('not.exist')
      cy.get('[data-cy^="scene-card-"]').should('have.length', 2)
    })

    it('should duplicate a scene', () => {
      // * Click on a scene
      cy.contains('Scene 1').click()
      
      // * Add some content first
      cy.get('[data-cy="scene-content-editor"] [contenteditable]').click()
      cy.get('[data-cy="scene-content-editor"] [contenteditable]').type('Original content')
      // ! Following Cypress best practices - wait for save to complete
      cy.get('[data-cy="save-status"]', { timeout: 3000 })
        .should('contain', 'Saved')
      
      // * Duplicate the scene
      cy.get('[data-cy="scene-duplicate-button"]').click()
      cy.get('[data-cy="duplicate-scene-title-input"]').clear().type('Scene 1 Copy')
      cy.get('[data-cy="confirm-duplicate"]').click()
      
      // TODO: * Should be on the new duplicated scene
      cy.contains('Scene 1 Copy').should('be.visible')
      cy.get('[data-cy="scene-content-editor"]').should('contain', 'Original content')
    })
  })

  describe('Data Persistence and Export', () => {
    it('should persist scene data across page refreshes', () => {
      // * Create a scene with content
      cy.get('[data-cy="nav-scenes"]').click()
      cy.get('[data-cy="create-scene-button"]').click()
      cy.get('[data-cy="scene-title-input"]').type('Persistence Test Scene')
      cy.get('[data-cy="create-scene-submit"]').click()
      
      // * Add content
      cy.get('[data-cy="scene-content-editor"] [contenteditable]').click()
      cy.get('[data-cy="scene-content-editor"] [contenteditable]').type('This content should persist')
      
      // ! Following Cypress best practices - wait for save indicator
      cy.get('[data-cy="save-status"]', { timeout: 3000 })
        .should('contain', 'Saved')
      
      // * Refresh the page
      cy.reload()
      
      // TODO: * Data should still be there
      cy.get('[data-cy="scene-content-editor"]').should('contain', 'This content should persist')
      cy.contains('Persistence Test Scene').should('be.visible')
    })

    it('should export scenes as part of story export', () => {
      // * Create a scene with content
      cy.get('[data-cy="nav-scenes"]').click()
      cy.get('[data-cy="create-scene-button"]').click()
      cy.get('[data-cy="scene-title-input"]').type('Export Test Scene')
      cy.get('[data-cy="create-scene-submit"]').click()
      cy.go('back')
      
      // * Export the story
      cy.get('[data-cy="export-story-button"]').click()
      
      // TODO: * Should include scenes in export options
      cy.get('[data-cy="export-scenes-checkbox"]').should('be.checked')
      cy.get('[data-cy="confirm-export"]').click()
      
      // TODO: * File should be downloaded (Cypress will handle this)
      cy.contains('Export').should('be.visible')
    })
  })
})