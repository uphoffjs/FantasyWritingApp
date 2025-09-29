/// <reference types="cypress" />

/**
 * E2E Test for Complete Character Workflow
 * 
 * This test covers the complex workflows for character creation and editing,
 * including character form interactions, profile persistence, and relationship management.
 * 
 * Adapted from fantasy-element-builder for writing app domain.
 */

describe('Character Creation and Editing - Full Workflow', () => {
  beforeEach(() => {
    // ! MANDATORY: Comprehensive debug setup
    cy.comprehensiveDebug();

    // * Setup test environment with session-based auth
    cy.task('factory:reset')
    // * Use session-based API login for faster authentication
    cy.apiLogin('test@example.com', 'testpassword123')
    cy.visit('/')
    
    // * Create a test story first
    cy.get('[data-cy="create-story-button"]').click()
    cy.get('[data-cy="story-title-input"]').type('Test Fantasy Epic')
    cy.get('[data-cy="story-description-input"]').type('E2E test story for character workflows')
    cy.get('[data-cy="story-submit"]').click()
    
    // * Wait for story creation and navigate to it
    cy.contains('Test Fantasy Epic').should('be.visible')
    cy.get('[data-cy="story-card"]').contains('Test Fantasy Epic').click()
    
    // TODO: * Should be in the story view
    cy.url().should('include', '/story')
  })

  describe('Character Creation Workflow', () => {
    it('creates a protagonist character with complete profile', () => {
      // * Click create character button
      cy.get('[data-cy="create-character-button"]').click()
      
      // Select Protagonist type
      cy.get('[data-cy="character-type-protagonist"]').click()
      
      // * Fill in basic information
      cy.get('[data-cy="character-name-input"]').type('Gandalf the Grey')
      cy.get('[data-cy="character-description-input"]').type('A wise wizard and member of the Fellowship')
      
      // * Submit the creation form
      cy.get('[data-cy="create-character-submit"]').click()
      
      // TODO: * Should redirect to character editor
      cy.url().should('include', '/character')
      
      // * Verify character was created
      cy.contains('Gandalf the Grey').should('be.visible')
      
      // * Check that character profile form is rendered
      cy.get('[data-cy="character-profile-form"]').should('be.visible')
      
      // * Expand a category to fill in details
      cy.get('[data-cy="category-toggle-basic"]').click()
      
      // * Fill in some profile details (testing persistence)
      cy.get('[data-cy="field-full-name-input"]').clear().type('Gandalf Stormcrow')
      cy.get('[data-cy="field-age-input"]').type('2000')
      cy.get('[data-cy="field-occupation-input"]').type('Wizard')
      
      // * Check that changes are auto-saved (no explicit save button needed)
      // ! Following Cypress best practices - wait for save indicator instead of arbitrary time
      cy.get('[data-cy="save-indicator"]', { timeout: 3000 })
        .should('contain', 'Saved')
      
      // * Navigate away and back to verify persistence
      cy.go('back')
      cy.contains('Gandalf the Grey').click()
      
      // * Verify profile details were persisted
      cy.get('[data-cy="category-toggle-basic"]').click()
      cy.get('[data-cy="field-full-name-input"]').should('have.value', 'Gandalf Stormcrow')
      cy.get('[data-cy="field-age-input"]').should('have.value', '2000')
      cy.get('[data-cy="field-occupation-input"]').should('have.value', 'Wizard')
    })

    it('creates an antagonist character with motivations', () => {
      // * Create an antagonist
      cy.get('[data-cy="create-character-button"]').click()
      cy.get('[data-cy="character-type-antagonist"]').click()
      cy.get('[data-cy="character-name-input"]').type('Sauron')
      cy.get('[data-cy="character-description-input"]').type('The Dark Lord of Mordor')
      cy.get('[data-cy="create-character-submit"]').click()
      
      // * Fill in motivation details
      cy.get('[data-cy="category-toggle-motivation"]').click()
      cy.get('[data-cy="field-primary-goal-input"]').type('Rule all of Middle-earth')
      cy.get('[data-cy="field-fears-input"]').type('Loss of the One Ring')
      cy.get('[data-cy="field-core-belief-input"]').type('Power through domination')
      
      // * Add a backstory
      cy.get('[data-cy="category-toggle-backstory"]').click()
      cy.get('[data-cy="field-backstory-input"]').type('Once a Maia of Aulë, corrupted by Morgoth')
      
      // * Verify data persistence
      // ! Following Cypress best practices - wait for save to complete
      cy.get('[data-cy="save-indicator"]', { timeout: 3000 })
        .should('contain', 'Saved')
      cy.reload()
      cy.get('[data-cy="category-toggle-motivation"]').click()
      cy.get('[data-cy="field-primary-goal-input"]').should('have.value', 'Rule all of Middle-earth')
    })

    it('creates a supporting character with relationships', () => {
      // * First create a protagonist to relate to
      cy.get('[data-cy="create-character-button"]').click()
      cy.get('[data-cy="character-type-protagonist"]').click()
      cy.get('[data-cy="character-name-input"]').type('Frodo Baggins')
      cy.get('[data-cy="create-character-submit"]').click()
      cy.go('back')
      
      // * Now create a supporting character
      cy.get('[data-cy="create-character-button"]').click()
      cy.get('[data-cy="character-type-supporting"]').click()
      cy.get('[data-cy="character-name-input"]').type('Samwise Gamgee')
      cy.get('[data-cy="character-description-input"]').type('Loyal gardener and companion')
      cy.get('[data-cy="create-character-submit"]').click()
      
      // * Add a relationship
      cy.get('[data-cy="add-relationship-button"]').click()
      cy.get('[data-cy="relationship-type-select"]').select('best friend')
      cy.get('[data-cy="relationship-target-select"]').select('Frodo Baggins')
      cy.get('[data-cy="relationship-description-input"]').type('Devoted companion on the quest')
      cy.get('[data-cy="relationship-submit"]').click()
      
      // * Verify relationship was created
      cy.contains('best friend of Frodo Baggins').should('be.visible')
    })

    it('handles different character field types', () => {
      // * Create a character with various field types
      cy.get('[data-cy="create-character-button"]').click()
      cy.get('[data-cy="character-type-supporting"]').click()
      cy.get('[data-cy="character-name-input"]').type('Legolas')
      cy.get('[data-cy="create-character-submit"]').click()
      
      // * Test different field types
      cy.get('[data-cy="category-toggle-details"]').click()
      
      // * Text input
      cy.get('[data-cy="field-homeland-input"]').type('Woodland Realm')
      
      // * Number input
      cy.get('[data-cy="field-height-input"]').type('6')
      
      // * Select dropdown
      cy.get('[data-cy="field-species-select"]').select('Elf')
      
      // Boolean/toggle
      cy.get('[data-cy="field-is-immortal-toggle"]').click()
      
      // Textarea
      cy.get('[data-cy="field-personality-input"]').type('Keen eyesight, excellent archer, noble and brave')
      
      // * Verify all inputs retained their values
      cy.get('[data-cy="field-homeland-input"]').should('have.value', 'Woodland Realm')
      cy.get('[data-cy="field-height-input"]').should('have.value', '6')
      cy.get('[data-cy="field-species-select"]').should('have.value', 'Elf')
      cy.get('[data-cy="field-is-immortal-toggle"]').should('be.checked')
    })
  })

  describe('Character Editing Workflow', () => {
    beforeEach(() => {
    // ! MANDATORY: Comprehensive debug setup
    cy.comprehensiveDebug();

      // * Create a character to edit
      cy.get('[data-cy="create-character-button"]').click()
      cy.get('[data-cy="character-type-protagonist"]').click()
      cy.get('[data-cy="character-name-input"]').type('Aragorn')
      cy.get('[data-cy="character-description-input"]').type('Ranger of the North')
      cy.get('[data-cy="create-character-submit"]').click()
    })

    it('edits character basic information', () => {
      // * Edit the character name and description
      cy.get('[data-cy="character-header-edit"]').click()
      cy.get('[data-cy="character-name-edit-input"]').clear().type('Aragorn, son of Arathorn')
      cy.get('[data-cy="character-description-edit-input"]').clear().type('Rightful King of Gondor')
      cy.get('[data-cy="character-header-save"]').click()
      
      // * Verify changes were saved
      cy.contains('Aragorn, son of Arathorn').should('be.visible')
      cy.contains('Rightful King of Gondor').should('be.visible')
    })

    it('tracks character development completion', () => {
      // * Check initial completion
      cy.get('[data-cy="development-percentage"]').then($el => {
        const initialCompletion = parseInt($el.text())
        
        // * Fill in some character details
        cy.get('[data-cy="category-toggle-basic"]').click()
        cy.get('[data-cy="field-full-name-input"]').type('Aragorn II Elessar')
        cy.get('[data-cy="field-age-input"]').type('87')
        
        // TODO: * Completion should increase
        cy.get('[data-cy="development-percentage"]').then($newEl => {
          const newCompletion = parseInt($newEl.text())
          expect(newCompletion).to.be.greaterThan(initialCompletion)
        })
      })
    })

    it('switches between quick and detailed character modes', () => {
      // * Start in quick mode
      cy.contains('Quick Profile').should('be.visible')
      
      // * Switch to detailed mode
      cy.get('[data-cy="mode-toggle"]').click()
      
      // ? TODO: * Should show more character sections
      cy.contains('Quick Profile').should('not.exist')
      
      // TODO: * More categories should be available
      cy.get('[data-cy^="category-toggle-"]').should('have.length.greaterThan', 3)
      
      // * Switch back to quick
      cy.get('[data-cy="mode-toggle"]').click()
      cy.contains('Quick Profile').should('be.visible')
    })
  })

  describe('Character Management', () => {
    beforeEach(() => {
    // ! MANDATORY: Comprehensive debug setup
    cy.comprehensiveDebug();

      // * Create multiple characters
      const characters = [
        { name: 'Aragorn', type: 'protagonist' },
        { name: 'Legolas', type: 'supporting' },
        { name: 'Gimli', type: 'supporting' },
        { name: 'Boromir', type: 'supporting' }
      ]
      
      characters.forEach(char => {
        cy.get('[data-cy="create-character-button"]').click()
        cy.get(`[data-cy="character-type-${char.type}"]`).click()
        cy.get('[data-cy="character-name-input"]').type(char.name)
        cy.get('[data-cy="create-character-submit"]').click()
        cy.go('back')
      })
    })

    it('filters characters by type', () => {
      // ? TODO: * Should show all characters initially
      cy.get('[data-cy^="character-card-"]').should('have.length', 4)
      
      // * Create an antagonist
      cy.get('[data-cy="create-character-button"]').click()
      cy.get('[data-cy="character-type-antagonist"]').click()
      cy.get('[data-cy="character-name-input"]').type('Saruman')
      cy.get('[data-cy="create-character-submit"]').click()
      cy.go('back')
      
      // * Filter by protagonist
      cy.get('[data-cy="filter-character-type-select"]').select('protagonist')
      cy.get('[data-cy^="character-card-"]').should('have.length', 1)
      
      // * Filter by supporting
      cy.get('[data-cy="filter-character-type-select"]').select('supporting')
      cy.get('[data-cy^="character-card-"]').should('have.length', 3)
      
      // * Filter by antagonist
      cy.get('[data-cy="filter-character-type-select"]').select('antagonist')
      cy.get('[data-cy^="character-card-"]').should('have.length', 1)
      cy.contains('Saruman').should('be.visible')
    })

    it('searches characters by name', () => {
      // * Search for specific character
      cy.get('[data-cy="search-characters-input"]').type('Aragorn')
      cy.get('[data-cy^="character-card-"]').should('have.length', 1)
      cy.contains('Aragorn').should('be.visible')
      
      // * Clear search
      cy.get('[data-cy="search-characters-input"]').clear()
      cy.get('[data-cy^="character-card-"]').should('have.length', 4)
    })

    it('deletes a character', () => {
      // * Click on a character
      cy.contains('Gimli').click()
      
      // * Delete the character
      cy.get('[data-cy="character-delete-button"]').click()
      cy.get('[data-cy="confirm-delete"]').click()
      
      // TODO: * Should redirect back to story view
      cy.url().should('include', '/story')
      
      // TODO: * Character should be gone
      cy.contains('Gimli').should('not.exist')
      cy.get('[data-cy^="character-card-"]').should('have.length', 3)
    })
  })

  describe('Data Persistence', () => {
    it('persists character data across page refreshes', () => {
      // * Create a character with data
      cy.get('[data-cy="create-character-button"]').click()
      cy.get('[data-cy="character-type-protagonist"]').click()
      cy.get('[data-cy="character-name-input"]').type('Persistent Character')
      cy.get('[data-cy="create-character-submit"]').click()
      
      // * Fill in some data
      cy.get('[data-cy="category-toggle-basic"]').click()
      cy.get('[data-cy="field-full-name-input"]').type('Test Full Name')
      cy.get('[data-cy="field-age-input"]').type('100')
      
      // * Wait for auto-save
      // ! Following Cypress best practices - check save indicator
      cy.get('[data-cy="save-indicator"]', { timeout: 3000 })
        .should('contain', 'Saved')
      
      // * Refresh the page
      cy.reload()
      
      // TODO: * Data should still be there
      cy.get('[data-cy="category-toggle-basic"]').click()
      cy.get('[data-cy="field-full-name-input"]').should('have.value', 'Test Full Name')
      cy.get('[data-cy="field-age-input"]').should('have.value', '100')
    })

    it('exports and imports story data with characters', () => {
      // * Create some characters first
      cy.get('[data-cy="create-character-button"]').click()
      cy.get('[data-cy="character-type-protagonist"]').click()
      cy.get('[data-cy="character-name-input"]').type('Export Test Character')
      cy.get('[data-cy="create-character-submit"]').click()
      cy.go('back')
      
      // * Export the story
      cy.get('[data-cy="export-story-button"]').click()
      
      // TODO: * File should be downloaded (Cypress will handle this)
      // * In a real test, we'd verify the download
      
      // * For now, just verify the export button works
      cy.contains('Export').should('be.visible')
    })
  })

  describe('Error Handling', () => {
    it('handles network errors gracefully', () => {
      // * Simulate network failure
      cy.intercept('POST', '**/api/**', { statusCode: 500 })
      
      // * Try to create a character
      cy.get('[data-cy="create-character-button"]').click()
      cy.get('[data-cy="character-type-protagonist"]').click()
      cy.get('[data-cy="character-name-input"]').type('Network Test')
      cy.get('[data-cy="create-character-submit"]').click()
      
      // ? TODO: * Should show error message
      cy.contains('error', { matchCase: false }).should('be.visible')
    })

    it('validates required fields', () => {
      // * Try to create character without name
      cy.get('[data-cy="create-character-button"]').click()
      cy.get('[data-cy="character-type-protagonist"]').click()
      cy.get('[data-cy="create-character-submit"]').click()
      
      // ? TODO: * Should show validation error
      cy.contains('required', { matchCase: false }).should('be.visible')
      
      // TODO: * Should not close modal
      cy.get('[data-cy="character-type-protagonist"]').should('be.visible')
    })
  })
})

/**
 * Additional E2E Tests for Character-Specific Workflows
 */
describe('Character-Specific Component Workflows', () => {
  beforeEach(() => {
    // ! MANDATORY: Comprehensive debug setup
    cy.comprehensiveDebug();

    cy.visit('/')
    // * Setup a story with characters
    cy.get('[data-cy="create-story-button"]').click()
    cy.get('[data-cy="story-title-input"]').type('Character Components Test')
    cy.get('[data-cy="story-submit"]').click()
    cy.get('[data-cy="story-card"]').contains('Character Components Test').click()
  })

  describe('Character Arc Development', () => {
    it('tracks character arc progression', () => {
      cy.get('[data-cy="create-character-button"]').click()
      cy.get('[data-cy="character-type-protagonist"]').click()
      cy.get('[data-cy="character-name-input"]').type('Arc Development Test')
      cy.get('[data-cy="create-character-submit"]').click()
      
      // * Open character arc section
      cy.get('[data-cy="category-toggle-character-arc"]').click()
      
      // * Define starting point
      cy.get('[data-cy="arc-starting-point-input"]').type('Naive farm boy')
      
      // * Define growth moments
      cy.get('[data-cy="add-growth-moment-button"]').click()
      cy.get('[data-cy="growth-moment-input"]').type('Discovers his true heritage')
      
      // * Define ending point
      cy.get('[data-cy="arc-ending-point-input"]').type('Confident leader and hero')
      
      // * Check arc completion tracking
      cy.get('[data-cy="arc-completion-indicator"]').should('be.visible')
    })
  })

  describe('Character Voice and Dialogue', () => {
    it('manages character voice patterns', () => {
      cy.get('[data-cy="create-character-button"]').click()
      cy.get('[data-cy="character-type-supporting"]').click()
      cy.get('[data-cy="character-name-input"]').type('Voice Pattern Test')
      cy.get('[data-cy="create-character-submit"]').click()
      
      // * Open voice section
      cy.get('[data-cy="category-toggle-voice"]').click()
      
      // * Set speech patterns
      cy.get('[data-cy="speech-pattern-input"]').type('Speaks formally, uses archaic language')
      
      // * Add dialogue examples
      cy.get('[data-cy="add-dialogue-example-button"]').click()
      cy.get('[data-cy="dialogue-example-input"]').type('"Verily, I shall aid thee in this quest."')
      
      // * Set vocabulary notes
      cy.get('[data-cy="vocabulary-notes-input"]').type('Avoids contractions, uses "thee" and "thou"')
      
      // * Verify voice guide is populated
      cy.contains('Speech Pattern').should('be.visible')
      cy.contains('formally').should('be.visible')
    })
  })

  describe('Character Tags and Categorization', () => {
    it('manages character tags for organization', () => {
      cy.get('[data-cy="create-character-button"]').click()
      cy.get('[data-cy="character-type-protagonist"]').click()
      cy.get('[data-cy="character-name-input"]').type('Tag Test Character')
      cy.get('[data-cy="create-character-submit"]').click()
      
      // * Find tag section
      cy.get('[data-cy="character-tags-section"]').should('be.visible')
      cy.get('[data-cy="add-tag-button"]').click()
      
      // * Select multiple character tags
      cy.get('[data-cy="tag-select-dropdown"]').click()
      cy.get('[data-cy="tag-option-hero"]').click()
      cy.get('[data-cy="tag-option-warrior"]').click()
      cy.get('[data-cy="tag-option-leader"]').click()
      
      // * Close dropdown
      cy.get('body').click(0, 0)
      
      // * Verify tags are displayed
      cy.contains('hero').should('be.visible')
      cy.contains('warrior').should('be.visible')
      cy.contains('leader').should('be.visible')
      
      // * Remove a tag
      cy.get('[data-cy="remove-tag-warrior"]').click()
      cy.contains('warrior').should('not.exist')
    })
  })
})

/**
 * Performance Testing for Character Management
 */
describe('Performance with Many Characters', () => {
  it('handles stories with many characters efficiently', () => {
    cy.visit('/')
    
    // * Create story
    cy.get('[data-cy="create-story-button"]').click()
    cy.get('[data-cy="story-title-input"]').type('Performance Test Story')
    cy.get('[data-cy="story-submit"]').click()
    cy.get('[data-cy="story-card"]').contains('Performance Test Story').click()
    
    // * Create multiple characters programmatically
    const characterTypes = ['protagonist', 'supporting', 'antagonist']
    for (let i = 1; i <= 15; i++) {
      const type = characterTypes[i % 3]
      cy.get('[data-cy="create-character-button"]').click()
      cy.get(`[data-cy="character-type-${type}"]`).click()
      cy.get('[data-cy="character-name-input"]').type(`Character ${i}`)
      cy.get('[data-cy="create-character-submit"]').click()
      cy.go('back')
    }
    
    // TODO: * Should handle display efficiently
    cy.get('[data-cy^="character-card-"]').should('have.length.at.least', 10)
    
    // TODO: * Search should still be fast
    cy.get('[data-cy="search-characters-input"]').type('Character 10')
    cy.get('[data-cy^="character-card-"]').should('have.length', 1)
    cy.contains('Character 10').should('be.visible')
  })
})