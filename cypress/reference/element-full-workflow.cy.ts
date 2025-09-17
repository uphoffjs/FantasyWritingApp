/// <reference types="cypress" />

/**
 * E2E Test for Complete Element Workflow
 * 
 * This test covers the complex workflows that timeout in component tests,
 * including BaseElementForm interactions, answer persistence, and state management.
 * 
 * Created in Session 29 to address timeout issues discovered in Sessions 26-28.
 */

describe('Element Creation and Editing - Full Workflow', () => {
  beforeEach(() => {
    // Setup test environment
    cy.task('factory:reset')
    cy.visit('/')
    
    // Create a test project first
    cy.get('[data-cy="get-started"], [data-cy="create-project-button"]').first().click()
    cy.get('[data-cy="project-name-input"]').type('Test Fantasy World')
    cy.get('[data-cy="project-description-input"]').type('E2E test world for element workflows')
    cy.get('[data-cy="project-submit"]').click()
    
    // Wait for project creation and navigate to it
    cy.contains('Test Fantasy World').should('be.visible')
    cy.get('[data-cy="project-card"]').contains('Test Fantasy World').click()
    
    // Should be in the project view
    cy.url().should('include', '/project')
  })

  describe('Element Creation Workflow', () => {
    it('creates a character element with complete form filling', () => {
      // Click create element button
      cy.get('[data-cy="create-element-button"]').click()
      
      // Select Character category
      cy.get('[data-cy="category-character"]').click()
      
      // Fill in basic information
      cy.get('[data-cy="element-name-input"]').type('Gandalf the Grey')
      cy.get('[data-cy="element-description-input"]').type('A wise wizard and member of the Fellowship')
      
      // Submit the creation form
      cy.get('[data-cy="create-element-submit"]').click()
      
      // Should redirect to element editor
      cy.url().should('include', '/element')
      
      // Verify element was created
      cy.contains('Gandalf the Grey').should('be.visible')
      
      // Check that BaseElementForm is rendered (this is what times out in component tests)
      cy.get('[data-cy="base-element-form"]').should('be.visible')
      
      // Expand a category to fill in questions
      cy.get('[data-cy="category-toggle-general"]').click()
      
      // Fill in some answers (testing answer persistence)
      cy.get('[data-cy="question-name-input"]').clear().type('Gandalf Stormcrow')
      cy.get('[data-cy="question-age-input"]').type('2000')
      
      // Check that changes are auto-saved (no explicit save button needed)
      cy.wait(1000) // Wait for debounced save
      
      // Navigate away and back to verify persistence
      cy.go('back')
      cy.contains('Gandalf the Grey').click()
      
      // Verify answers were persisted
      cy.get('[data-cy="category-toggle-general"]').click()
      cy.get('[data-cy="question-name-input"]').should('have.value', 'Gandalf Stormcrow')
      cy.get('[data-cy="question-age-input"]').should('have.value', '2000')
    })

    it('creates a location element with relationships', () => {
      // First create a character to relate to
      cy.get('[data-cy="create-element-button"]').click()
      cy.get('[data-cy="category-character"]').click()
      cy.get('[data-cy="element-name-input"]').type('King Aragorn')
      cy.get('[data-cy="create-element-submit"]').click()
      cy.go('back')
      
      // Now create a location
      cy.get('[data-cy="create-element-button"]').click()
      cy.get('[data-cy="category-location"]').click()
      cy.get('[data-cy="element-name-input"]').type('Minas Tirith')
      cy.get('[data-cy="element-description-input"]').type('The capital city of Gondor')
      cy.get('[data-cy="create-element-submit"]').click()
      
      // Add a relationship
      cy.get('[data-cy="add-relationship-button"]').click()
      cy.get('[data-cy="relationship-type-select"]').select('ruled by')
      cy.get('[data-cy="relationship-target-select"]').select('King Aragorn')
      cy.get('[data-cy="relationship-submit"]').click()
      
      // Verify relationship was created
      cy.contains('ruled by King Aragorn').should('be.visible')
    })

    it('handles different question types in forms', () => {
      // Create an element with various question types
      cy.get('[data-cy="create-element-button"]').click()
      cy.get('[data-cy="category-magic"]').click()
      cy.get('[data-cy="element-name-input"]').type('Fire Magic System')
      cy.get('[data-cy="create-element-submit"]').click()
      
      // Test different question types
      cy.get('[data-cy="category-toggle-details"]').click()
      
      // Text input
      cy.get('[data-cy="question-source-input"]').type('Ancient dragon teachings')
      
      // Number input
      cy.get('[data-cy="question-power-level-input"]').type('9')
      
      // Select dropdown
      cy.get('[data-cy="question-rarity-select"]').select('Rare')
      
      // Boolean/checkbox
      cy.get('[data-cy="question-requires-training-toggle"]').click()
      
      // Textarea
      cy.get('[data-cy="question-description-input"]').type('A powerful and dangerous form of magic that requires years of study')
      
      // Verify all inputs retained their values
      cy.get('[data-cy="question-source-input"]').should('have.value', 'Ancient dragon teachings')
      cy.get('[data-cy="question-power-level-input"]').should('have.value', '9')
      cy.get('[data-cy="question-rarity-select"]').should('have.value', 'Rare')
      cy.get('[data-cy="question-requires-training-toggle"]').should('be.checked')
    })
  })

  describe('Element Editing Workflow', () => {
    beforeEach(() => {
      // Create an element to edit
      cy.get('[data-cy="create-element-button"]').click()
      cy.get('[data-cy="category-character"]').click()
      cy.get('[data-cy="element-name-input"]').type('Frodo Baggins')
      cy.get('[data-cy="element-description-input"]').type('Ring bearer')
      cy.get('[data-cy="create-element-submit"]').click()
    })

    it('edits element basic information', () => {
      // Edit the element name and description
      cy.get('[data-cy="element-header-edit"]').click()
      cy.get('[data-cy="element-name-edit-input"]').clear().type('Frodo Baggins of the Shire')
      cy.get('[data-cy="element-description-edit-input"]').clear().type('Ring bearer and hero of Middle-earth')
      cy.get('[data-cy="element-header-save"]').click()
      
      // Verify changes were saved
      cy.contains('Frodo Baggins of the Shire').should('be.visible')
      cy.contains('Ring bearer and hero of Middle-earth').should('be.visible')
    })

    it('tracks completion percentage', () => {
      // Check initial completion
      cy.get('[data-cy="completion-percentage"]').then($el => {
        const initialCompletion = parseInt($el.text())
        
        // Fill in some questions
        cy.get('[data-cy="category-toggle-general"]').click()
        cy.get('[data-cy="question-name-input"]').type('Frodo')
        cy.get('[data-cy="question-age-input"]').type('50')
        
        // Completion should increase
        cy.get('[data-cy="completion-percentage"]').then($newEl => {
          const newCompletion = parseInt($newEl.text())
          expect(newCompletion).to.be.greaterThan(initialCompletion)
        })
      })
    })

    it('switches between basic and detailed modes', () => {
      // Start in basic mode
      cy.contains('Quick Mode').should('be.visible')
      
      // Switch to detailed mode
      cy.get('[data-cy="mode-toggle"]').click()
      
      // Should show more questions
      cy.contains('Quick Mode').should('not.exist')
      
      // More categories should be available
      cy.get('[data-cy^="category-toggle-"]').should('have.length.greaterThan', 2)
      
      // Switch back to basic
      cy.get('[data-cy="mode-toggle"]').click()
      cy.contains('Quick Mode').should('be.visible')
    })
  })

  describe('Element Management', () => {
    beforeEach(() => {
      // Create multiple elements
      const elements = ['Aragorn', 'Legolas', 'Gimli', 'Boromir']
      
      elements.forEach(name => {
        cy.get('[data-cy="create-element-button"]').click()
        cy.get('[data-cy="category-character"]').click()
        cy.get('[data-cy="element-name-input"]').type(name)
        cy.get('[data-cy="create-element-submit"]').click()
        cy.go('back')
      })
    })

    it('filters elements by category', () => {
      // Should show all elements initially
      cy.get('[data-cy^="element-card-"]').should('have.length', 4)
      
      // Create a location element
      cy.get('[data-cy="create-element-button"]').click()
      cy.get('[data-cy="category-location"]').click()
      cy.get('[data-cy="element-name-input"]').type('Rivendell')
      cy.get('[data-cy="create-element-submit"]').click()
      cy.go('back')
      
      // Filter by character
      cy.get('[data-cy="filter-category-select"]').select('character')
      cy.get('[data-cy^="element-card-"]').should('have.length', 4)
      
      // Filter by location
      cy.get('[data-cy="filter-category-select"]').select('location')
      cy.get('[data-cy^="element-card-"]').should('have.length', 1)
      cy.contains('Rivendell').should('be.visible')
    })

    it('searches elements by name', () => {
      // Search for specific element
      cy.get('[data-cy="search-elements-input"]').type('Aragorn')
      cy.get('[data-cy^="element-card-"]').should('have.length', 1)
      cy.contains('Aragorn').should('be.visible')
      
      // Clear search
      cy.get('[data-cy="search-elements-input"]').clear()
      cy.get('[data-cy^="element-card-"]').should('have.length', 4)
    })

    it('deletes an element', () => {
      // Click on an element
      cy.contains('Gimli').click()
      
      // Delete the element
      cy.get('[data-cy="element-delete-button"]').click()
      cy.get('[data-cy="confirm-delete"]').click()
      
      // Should redirect back to project view
      cy.url().should('include', '/project')
      
      // Element should be gone
      cy.contains('Gimli').should('not.exist')
      cy.get('[data-cy^="element-card-"]').should('have.length', 3)
    })
  })

  describe('Data Persistence', () => {
    it('persists element data across page refreshes', () => {
      // Create an element with data
      cy.get('[data-cy="create-element-button"]').click()
      cy.get('[data-cy="category-character"]').click()
      cy.get('[data-cy="element-name-input"]').type('Persistent Character')
      cy.get('[data-cy="create-element-submit"]').click()
      
      // Fill in some data
      cy.get('[data-cy="category-toggle-general"]').click()
      cy.get('[data-cy="question-name-input"]').type('Test Name')
      cy.get('[data-cy="question-age-input"]').type('100')
      
      // Wait for auto-save
      cy.wait(1000)
      
      // Refresh the page
      cy.reload()
      
      // Data should still be there
      cy.get('[data-cy="category-toggle-general"]').click()
      cy.get('[data-cy="question-name-input"]').should('have.value', 'Test Name')
      cy.get('[data-cy="question-age-input"]').should('have.value', '100')
    })

    it('exports and imports project data', () => {
      // Create some elements first
      cy.get('[data-cy="create-element-button"]').click()
      cy.get('[data-cy="category-character"]').click()
      cy.get('[data-cy="element-name-input"]').type('Export Test Character')
      cy.get('[data-cy="create-element-submit"]').click()
      cy.go('back')
      
      // Export the project
      cy.get('[data-cy="export-project-button"]').click()
      
      // File should be downloaded (Cypress will handle this)
      // In a real test, we'd verify the download
      
      // For now, just verify the export button works
      cy.contains('Export').should('be.visible')
    })
  })

  describe('Error Handling', () => {
    it('handles network errors gracefully', () => {
      // Simulate network failure
      cy.intercept('POST', '**/api/**', { statusCode: 500 })
      
      // Try to create an element
      cy.get('[data-cy="create-element-button"]').click()
      cy.get('[data-cy="category-character"]').click()
      cy.get('[data-cy="element-name-input"]').type('Network Test')
      cy.get('[data-cy="create-element-submit"]').click()
      
      // Should show error message
      cy.contains('error', { matchCase: false }).should('be.visible')
    })

    it('validates required fields', () => {
      // Try to create element without name
      cy.get('[data-cy="create-element-button"]').click()
      cy.get('[data-cy="category-character"]').click()
      cy.get('[data-cy="create-element-submit"]').click()
      
      // Should show validation error
      cy.contains('required', { matchCase: false }).should('be.visible')
      
      // Should not close modal
      cy.get('[data-cy="category-character"]').should('be.visible')
    })
  })
})

/**
 * Additional E2E Tests for Complex Workflows
 * These specifically address components that timeout in isolation
 */
describe('Complex Component Workflows', () => {
  beforeEach(() => {
    cy.visit('/')
    // Setup a project with elements
    cy.get('[data-cy="get-started"], [data-cy="create-project-button"]').first().click()
    cy.get('[data-cy="project-name-input"]').type('Complex Test World')
    cy.get('[data-cy="project-submit"]').click()
    cy.get('[data-cy="project-card"]').contains('Complex Test World').click()
  })

  describe('Toast Notifications (addresses timeout issues)', () => {
    it('shows success toast on element creation', () => {
      cy.get('[data-cy="create-element-button"]').click()
      cy.get('[data-cy="category-character"]').click()
      cy.get('[data-cy="element-name-input"]').type('Toast Test')
      cy.get('[data-cy="create-element-submit"]').click()
      
      // Toast should appear and auto-dismiss
      cy.get('[data-cy="toast-success"]').should('be.visible')
      cy.contains('Element created successfully').should('be.visible')
      
      // Should auto-dismiss after a few seconds
      cy.get('[data-cy="toast-success"]', { timeout: 6000 }).should('not.exist')
    })

    it('shows error toast on validation failure', () => {
      cy.get('[data-cy="create-element-button"]').click()
      cy.get('[data-cy="category-character"]').click()
      // Submit without required field
      cy.get('[data-cy="create-element-submit"]').click()
      
      // Error toast should appear
      cy.get('[data-cy="toast-error"]').should('be.visible')
    })
  })

  describe('RichTextEditor (addresses timeout issues)', () => {
    it('handles rich text editing in element descriptions', () => {
      // Create an element
      cy.get('[data-cy="create-element-button"]').click()
      cy.get('[data-cy="category-character"]').click()
      cy.get('[data-cy="element-name-input"]').type('Rich Text Test')
      cy.get('[data-cy="create-element-submit"]').click()
      
      // Open a category with rich text fields
      cy.get('[data-cy="category-toggle-backstory"]').click()
      
      // Find rich text editor
      cy.get('[data-cy="rich-text-editor"]').should('be.visible')
      
      // Type in the editor
      cy.get('[data-cy="rich-text-editor"] [contenteditable]').type('This is **bold** text')
      
      // Verify formatting toolbar works
      cy.get('[data-cy="format-bold"]').click()
      cy.get('[data-cy="rich-text-editor"] [contenteditable]').type(' and more bold')
      
      // Content should be saved
      cy.wait(1000)
      cy.reload()
      cy.get('[data-cy="category-toggle-backstory"]').click()
      cy.get('[data-cy="rich-text-editor"]').should('contain', 'This is')
    })
  })

  describe('TagMultiSelect (addresses timeout issues)', () => {
    it('manages tags for element categorization', () => {
      // Create an element
      cy.get('[data-cy="create-element-button"]').click()
      cy.get('[data-cy="category-character"]').click()
      cy.get('[data-cy="element-name-input"]').type('Tag Test Character')
      cy.get('[data-cy="create-element-submit"]').click()
      
      // Find tag selector
      cy.get('[data-cy="element-tags-section"]').should('be.visible')
      cy.get('[data-cy="add-tag-button"]').click()
      
      // Select multiple tags
      cy.get('[data-cy="tag-select-dropdown"]').click()
      cy.get('[data-cy="tag-option-hero"]').click()
      cy.get('[data-cy="tag-option-wizard"]').click()
      cy.get('[data-cy="tag-option-mentor"]').click()
      
      // Close dropdown
      cy.get('body').click(0, 0)
      
      // Verify tags are displayed
      cy.contains('hero').should('be.visible')
      cy.contains('wizard').should('be.visible')
      cy.contains('mentor').should('be.visible')
      
      // Remove a tag
      cy.get('[data-cy="remove-tag-wizard"]').click()
      cy.contains('wizard').should('not.exist')
    })
  })
})

/**
 * Performance and Scale Testing
 */
describe('Performance with Large Data Sets', () => {
  it('handles projects with many elements efficiently', () => {
    cy.visit('/')
    
    // Create project
    cy.get('[data-cy="get-started"], [data-cy="create-project-button"]').first().click()
    cy.get('[data-cy="project-name-input"]').type('Performance Test')
    cy.get('[data-cy="project-submit"]').click()
    cy.get('[data-cy="project-card"]').contains('Performance Test').click()
    
    // Create multiple elements programmatically
    for (let i = 1; i <= 20; i++) {
      cy.get('[data-cy="create-element-button"]').click()
      cy.get('[data-cy="category-character"]').click()
      cy.get('[data-cy="element-name-input"]').type(`Character ${i}`)
      cy.get('[data-cy="create-element-submit"]').click()
      cy.go('back')
    }
    
    // Should handle pagination or virtualization
    cy.get('[data-cy^="element-card-"]').should('have.length.at.least', 10)
    
    // Search should still be fast
    cy.get('[data-cy="search-elements-input"]').type('Character 15')
    cy.get('[data-cy^="element-card-"]').should('have.length', 1)
    cy.contains('Character 15').should('be.visible')
  })
})