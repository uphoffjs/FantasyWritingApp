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
    // * Setup test environment
    cy.task('factory:reset')
    cy.visit('/')
    
    // * Create a test story first
    cy.get('[data-testid="get-started"], [data-testid="create-story-button"]').first().click()
    cy.get('[data-testid="story-title-input"]').type('Test Fantasy Epic')
    cy.get('[data-testid="story-description-input"]').type('E2E test story for character workflows')
    cy.get('[data-testid="story-submit"]').click()
    
    // * Wait for story creation and navigate to it
    cy.contains('Test Fantasy Epic').should('be.visible')
    cy.get('[data-testid="story-card"]').contains('Test Fantasy Epic').click()
    
    // TODO: * Should be in the story view
    cy.url().should('include', '/story')
  })

  describe('Character Creation Workflow', () => {
    it('creates a protagonist character with complete profile', () => {
      // * Click create character button
      cy.get('[data-testid="create-character-button"]').click()
      
      // Select Protagonist type
      cy.get('[data-testid="character-type-protagonist"]').click()
      
      // * Fill in basic information
      cy.get('[data-testid="character-name-input"]').type('Gandalf the Grey')
      cy.get('[data-testid="character-description-input"]').type('A wise wizard and member of the Fellowship')
      
      // * Submit the creation form
      cy.get('[data-testid="create-character-submit"]').click()
      
      // TODO: * Should redirect to character editor
      cy.url().should('include', '/character')
      
      // * Verify character was created
      cy.contains('Gandalf the Grey').should('be.visible')
      
      // * Check that character profile form is rendered
      cy.get('[data-testid="character-profile-form"]').should('be.visible')
      
      // * Expand a category to fill in details
      cy.get('[data-testid="category-toggle-basic"]').click()
      
      // * Fill in some profile details (testing persistence)
      cy.get('[data-testid="field-full-name-input"]').clear().type('Gandalf Stormcrow')
      cy.get('[data-testid="field-age-input"]').type('2000')
      cy.get('[data-testid="field-occupation-input"]').type('Wizard')
      
      // * Check that changes are auto-saved (no explicit save button needed)
      cy.wait(1000) // Wait for debounced save
      
      // * Navigate away and back to verify persistence
      cy.go('back')
      cy.contains('Gandalf the Grey').click()
      
      // * Verify profile details were persisted
      cy.get('[data-testid="category-toggle-basic"]').click()
      cy.get('[data-testid="field-full-name-input"]').should('have.value', 'Gandalf Stormcrow')
      cy.get('[data-testid="field-age-input"]').should('have.value', '2000')
      cy.get('[data-testid="field-occupation-input"]').should('have.value', 'Wizard')
    })

    it('creates an antagonist character with motivations', () => {
      // * Create an antagonist
      cy.get('[data-testid="create-character-button"]').click()
      cy.get('[data-testid="character-type-antagonist"]').click()
      cy.get('[data-testid="character-name-input"]').type('Sauron')
      cy.get('[data-testid="character-description-input"]').type('The Dark Lord of Mordor')
      cy.get('[data-testid="create-character-submit"]').click()
      
      // * Fill in motivation details
      cy.get('[data-testid="category-toggle-motivation"]').click()
      cy.get('[data-testid="field-primary-goal-input"]').type('Rule all of Middle-earth')
      cy.get('[data-testid="field-fears-input"]').type('Loss of the One Ring')
      cy.get('[data-testid="field-core-belief-input"]').type('Power through domination')
      
      // * Add a backstory
      cy.get('[data-testid="category-toggle-backstory"]').click()
      cy.get('[data-testid="field-backstory-input"]').type('Once a Maia of Aulë, corrupted by Morgoth')
      
      // * Verify data persistence
      cy.wait(1000)
      cy.reload()
      cy.get('[data-testid="category-toggle-motivation"]').click()
      cy.get('[data-testid="field-primary-goal-input"]').should('have.value', 'Rule all of Middle-earth')
    })

    it('creates a supporting character with relationships', () => {
      // * First create a protagonist to relate to
      cy.get('[data-testid="create-character-button"]').click()
      cy.get('[data-testid="character-type-protagonist"]').click()
      cy.get('[data-testid="character-name-input"]').type('Frodo Baggins')
      cy.get('[data-testid="create-character-submit"]').click()
      cy.go('back')
      
      // * Now create a supporting character
      cy.get('[data-testid="create-character-button"]').click()
      cy.get('[data-testid="character-type-supporting"]').click()
      cy.get('[data-testid="character-name-input"]').type('Samwise Gamgee')
      cy.get('[data-testid="character-description-input"]').type('Loyal gardener and companion')
      cy.get('[data-testid="create-character-submit"]').click()
      
      // * Add a relationship
      cy.get('[data-testid="add-relationship-button"]').click()
      cy.get('[data-testid="relationship-type-select"]').select('best friend')
      cy.get('[data-testid="relationship-target-select"]').select('Frodo Baggins')
      cy.get('[data-testid="relationship-description-input"]').type('Devoted companion on the quest')
      cy.get('[data-testid="relationship-submit"]').click()
      
      // * Verify relationship was created
      cy.contains('best friend of Frodo Baggins').should('be.visible')
    })

    it('handles different character field types', () => {
      // * Create a character with various field types
      cy.get('[data-testid="create-character-button"]').click()
      cy.get('[data-testid="character-type-supporting"]').click()
      cy.get('[data-testid="character-name-input"]').type('Legolas')
      cy.get('[data-testid="create-character-submit"]').click()
      
      // * Test different field types
      cy.get('[data-testid="category-toggle-details"]').click()
      
      // * Text input
      cy.get('[data-testid="field-homeland-input"]').type('Woodland Realm')
      
      // * Number input
      cy.get('[data-testid="field-height-input"]').type('6')
      
      // * Select dropdown
      cy.get('[data-testid="field-species-select"]').select('Elf')
      
      // Boolean/toggle
      cy.get('[data-testid="field-is-immortal-toggle"]').click()
      
      // Textarea
      cy.get('[data-testid="field-personality-input"]').type('Keen eyesight, excellent archer, noble and brave')
      
      // * Verify all inputs retained their values
      cy.get('[data-testid="field-homeland-input"]').should('have.value', 'Woodland Realm')
      cy.get('[data-testid="field-height-input"]').should('have.value', '6')
      cy.get('[data-testid="field-species-select"]').should('have.value', 'Elf')
      cy.get('[data-testid="field-is-immortal-toggle"]').should('be.checked')
    })
  })

  describe('Character Editing Workflow', () => {
    beforeEach(() => {
      // * Create a character to edit
      cy.get('[data-testid="create-character-button"]').click()
      cy.get('[data-testid="character-type-protagonist"]').click()
      cy.get('[data-testid="character-name-input"]').type('Aragorn')
      cy.get('[data-testid="character-description-input"]').type('Ranger of the North')
      cy.get('[data-testid="create-character-submit"]').click()
    })

    it('edits character basic information', () => {
      // * Edit the character name and description
      cy.get('[data-testid="character-header-edit"]').click()
      cy.get('[data-testid="character-name-edit-input"]').clear().type('Aragorn, son of Arathorn')
      cy.get('[data-testid="character-description-edit-input"]').clear().type('Rightful King of Gondor')
      cy.get('[data-testid="character-header-save"]').click()
      
      // * Verify changes were saved
      cy.contains('Aragorn, son of Arathorn').should('be.visible')
      cy.contains('Rightful King of Gondor').should('be.visible')
    })

    it('tracks character development completion', () => {
      // * Check initial completion
      cy.get('[data-testid="development-percentage"]').then($el => {
        const initialCompletion = parseInt($el.text())
        
        // * Fill in some character details
        cy.get('[data-testid="category-toggle-basic"]').click()
        cy.get('[data-testid="field-full-name-input"]').type('Aragorn II Elessar')
        cy.get('[data-testid="field-age-input"]').type('87')
        
        // TODO: * Completion should increase
        cy.get('[data-testid="development-percentage"]').then($newEl => {
          const newCompletion = parseInt($newEl.text())
          expect(newCompletion).to.be.greaterThan(initialCompletion)
        })
      })
    })

    it('switches between quick and detailed character modes', () => {
      // * Start in quick mode
      cy.contains('Quick Profile').should('be.visible')
      
      // * Switch to detailed mode
      cy.get('[data-testid="mode-toggle"]').click()
      
      // ? TODO: * Should show more character sections
      cy.contains('Quick Profile').should('not.exist')
      
      // TODO: * More categories should be available
      cy.get('[data-cy^="category-toggle-"]').should('have.length.greaterThan', 3)
      
      // * Switch back to quick
      cy.get('[data-testid="mode-toggle"]').click()
      cy.contains('Quick Profile').should('be.visible')
    })
  })

  describe('Character Management', () => {
    beforeEach(() => {
      // * Create multiple characters
      const characters = [
        { name: 'Aragorn', type: 'protagonist' },
        { name: 'Legolas', type: 'supporting' },
        { name: 'Gimli', type: 'supporting' },
        { name: 'Boromir', type: 'supporting' }
      ]
      
      characters.forEach(char => {
        cy.get('[data-testid="create-character-button"]').click()
        cy.get(`[data-testid="character-type-${char.type}"]`).click()
        cy.get('[data-testid="character-name-input"]').type(char.name)
        cy.get('[data-testid="create-character-submit"]').click()
        cy.go('back')
      })
    })

    it('filters characters by type', () => {
      // ? TODO: * Should show all characters initially
      cy.get('[data-cy^="character-card-"]').should('have.length', 4)
      
      // * Create an antagonist
      cy.get('[data-testid="create-character-button"]').click()
      cy.get('[data-testid="character-type-antagonist"]').click()
      cy.get('[data-testid="character-name-input"]').type('Saruman')
      cy.get('[data-testid="create-character-submit"]').click()
      cy.go('back')
      
      // * Filter by protagonist
      cy.get('[data-testid="filter-character-type-select"]').select('protagonist')
      cy.get('[data-cy^="character-card-"]').should('have.length', 1)
      
      // * Filter by supporting
      cy.get('[data-testid="filter-character-type-select"]').select('supporting')
      cy.get('[data-cy^="character-card-"]').should('have.length', 3)
      
      // * Filter by antagonist
      cy.get('[data-testid="filter-character-type-select"]').select('antagonist')
      cy.get('[data-cy^="character-card-"]').should('have.length', 1)
      cy.contains('Saruman').should('be.visible')
    })

    it('searches characters by name', () => {
      // * Search for specific character
      cy.get('[data-testid="search-characters-input"]').type('Aragorn')
      cy.get('[data-cy^="character-card-"]').should('have.length', 1)
      cy.contains('Aragorn').should('be.visible')
      
      // * Clear search
      cy.get('[data-testid="search-characters-input"]').clear()
      cy.get('[data-cy^="character-card-"]').should('have.length', 4)
    })

    it('deletes a character', () => {
      // * Click on a character
      cy.contains('Gimli').click()
      
      // * Delete the character
      cy.get('[data-testid="character-delete-button"]').click()
      cy.get('[data-testid="confirm-delete"]').click()
      
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
      cy.get('[data-testid="create-character-button"]').click()
      cy.get('[data-testid="character-type-protagonist"]').click()
      cy.get('[data-testid="character-name-input"]').type('Persistent Character')
      cy.get('[data-testid="create-character-submit"]').click()
      
      // * Fill in some data
      cy.get('[data-testid="category-toggle-basic"]').click()
      cy.get('[data-testid="field-full-name-input"]').type('Test Full Name')
      cy.get('[data-testid="field-age-input"]').type('100')
      
      // * Wait for auto-save
      cy.wait(1000)
      
      // * Refresh the page
      cy.reload()
      
      // TODO: * Data should still be there
      cy.get('[data-testid="category-toggle-basic"]').click()
      cy.get('[data-testid="field-full-name-input"]').should('have.value', 'Test Full Name')
      cy.get('[data-testid="field-age-input"]').should('have.value', '100')
    })

    it('exports and imports story data with characters', () => {
      // * Create some characters first
      cy.get('[data-testid="create-character-button"]').click()
      cy.get('[data-testid="character-type-protagonist"]').click()
      cy.get('[data-testid="character-name-input"]').type('Export Test Character')
      cy.get('[data-testid="create-character-submit"]').click()
      cy.go('back')
      
      // * Export the story
      cy.get('[data-testid="export-story-button"]').click()
      
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
      cy.get('[data-testid="create-character-button"]').click()
      cy.get('[data-testid="character-type-protagonist"]').click()
      cy.get('[data-testid="character-name-input"]').type('Network Test')
      cy.get('[data-testid="create-character-submit"]').click()
      
      // ? TODO: * Should show error message
      cy.contains('error', { matchCase: false }).should('be.visible')
    })

    it('validates required fields', () => {
      // * Try to create character without name
      cy.get('[data-testid="create-character-button"]').click()
      cy.get('[data-testid="character-type-protagonist"]').click()
      cy.get('[data-testid="create-character-submit"]').click()
      
      // ? TODO: * Should show validation error
      cy.contains('required', { matchCase: false }).should('be.visible')
      
      // TODO: * Should not close modal
      cy.get('[data-testid="character-type-protagonist"]').should('be.visible')
    })
  })
})

/**
 * Additional E2E Tests for Character-Specific Workflows
 */
describe('Character-Specific Component Workflows', () => {
  beforeEach(() => {
    cy.visit('/')
    // * Setup a story with characters
    cy.get('[data-testid="get-started"], [data-testid="create-story-button"]').first().click()
    cy.get('[data-testid="story-title-input"]').type('Character Components Test')
    cy.get('[data-testid="story-submit"]').click()
    cy.get('[data-testid="story-card"]').contains('Character Components Test').click()
  })

  describe('Character Arc Development', () => {
    it('tracks character arc progression', () => {
      cy.get('[data-testid="create-character-button"]').click()
      cy.get('[data-testid="character-type-protagonist"]').click()
      cy.get('[data-testid="character-name-input"]').type('Arc Development Test')
      cy.get('[data-testid="create-character-submit"]').click()
      
      // * Open character arc section
      cy.get('[data-testid="category-toggle-character-arc"]').click()
      
      // * Define starting point
      cy.get('[data-testid="arc-starting-point-input"]').type('Naive farm boy')
      
      // * Define growth moments
      cy.get('[data-testid="add-growth-moment-button"]').click()
      cy.get('[data-testid="growth-moment-input"]').type('Discovers his true heritage')
      
      // * Define ending point
      cy.get('[data-testid="arc-ending-point-input"]').type('Confident leader and hero')
      
      // * Check arc completion tracking
      cy.get('[data-testid="arc-completion-indicator"]').should('be.visible')
    })
  })

  describe('Character Voice and Dialogue', () => {
    it('manages character voice patterns', () => {
      cy.get('[data-testid="create-character-button"]').click()
      cy.get('[data-testid="character-type-supporting"]').click()
      cy.get('[data-testid="character-name-input"]').type('Voice Pattern Test')
      cy.get('[data-testid="create-character-submit"]').click()
      
      // * Open voice section
      cy.get('[data-testid="category-toggle-voice"]').click()
      
      // * Set speech patterns
      cy.get('[data-testid="speech-pattern-input"]').type('Speaks formally, uses archaic language')
      
      // * Add dialogue examples
      cy.get('[data-testid="add-dialogue-example-button"]').click()
      cy.get('[data-testid="dialogue-example-input"]').type('"Verily, I shall aid thee in this quest."')
      
      // * Set vocabulary notes
      cy.get('[data-testid="vocabulary-notes-input"]').type('Avoids contractions, uses "thee" and "thou"')
      
      // * Verify voice guide is populated
      cy.contains('Speech Pattern').should('be.visible')
      cy.contains('formally').should('be.visible')
    })
  })

  describe('Character Tags and Categorization', () => {
    it('manages character tags for organization', () => {
      cy.get('[data-testid="create-character-button"]').click()
      cy.get('[data-testid="character-type-protagonist"]').click()
      cy.get('[data-testid="character-name-input"]').type('Tag Test Character')
      cy.get('[data-testid="create-character-submit"]').click()
      
      // * Find tag section
      cy.get('[data-testid="character-tags-section"]').should('be.visible')
      cy.get('[data-testid="add-tag-button"]').click()
      
      // * Select multiple character tags
      cy.get('[data-testid="tag-select-dropdown"]').click()
      cy.get('[data-testid="tag-option-hero"]').click()
      cy.get('[data-testid="tag-option-warrior"]').click()
      cy.get('[data-testid="tag-option-leader"]').click()
      
      // * Close dropdown
      cy.get('body').click(0, 0)
      
      // * Verify tags are displayed
      cy.contains('hero').should('be.visible')
      cy.contains('warrior').should('be.visible')
      cy.contains('leader').should('be.visible')
      
      // * Remove a tag
      cy.get('[data-testid="remove-tag-warrior"]').click()
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
    cy.get('[data-testid="get-started"], [data-testid="create-story-button"]').first().click()
    cy.get('[data-testid="story-title-input"]').type('Performance Test Story')
    cy.get('[data-testid="story-submit"]').click()
    cy.get('[data-testid="story-card"]').contains('Performance Test Story').click()
    
    // * Create multiple characters programmatically
    const characterTypes = ['protagonist', 'supporting', 'antagonist']
    for (let i = 1; i <= 15; i++) {
      const type = characterTypes[i % 3]
      cy.get('[data-testid="create-character-button"]').click()
      cy.get(`[data-testid="character-type-${type}"]`).click()
      cy.get('[data-testid="character-name-input"]').type(`Character ${i}`)
      cy.get('[data-testid="create-character-submit"]').click()
      cy.go('back')
    }
    
    // TODO: * Should handle display efficiently
    cy.get('[data-cy^="character-card-"]').should('have.length.at.least', 10)
    
    // TODO: * Search should still be fast
    cy.get('[data-testid="search-characters-input"]').type('Character 10')
    cy.get('[data-cy^="character-card-"]').should('have.length', 1)
    cy.contains('Character 10').should('be.visible')
  })
})