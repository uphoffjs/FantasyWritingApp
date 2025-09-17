import { setupAuth } from '../../support/test-helpers'

describe('Character Editor Integration', () => {
  beforeEach(() => {
    // Setup test environment
    cy.setupTestEnvironment()
    setupAuth()
    cy.visit('/stories')
    
    // Wait for page to load
    cy.get('body').should('be.visible')
    cy.url().should('include', '/stories')
    
    // Create a story through the UI
    cy.get('[data-cy="get-started"], [data-cy="create-story"]').first().click()
    cy.get('[data-cy="story-title"]').type('Test Epic')
    cy.get('[data-cy="story-description"]').type('A test fantasy epic')
    cy.get('[data-cy="submit"]').click()
    
    // Wait for story to be created
    cy.get('[data-cy="story-card"]').should('contain', 'Test Epic')
  })

  it('should navigate to story and show character creation button', () => {
    // Navigate to the story
    cy.get('[data-cy="story-card"]').first().click()
    
    // Should show create character button
    cy.get('[data-cy="create-character-button"], button').contains(/New Character|Create Character/i).should('be.visible')
  })

  it('should open create character modal when clicking create button', () => {
    // Navigate to the story
    cy.get('[data-cy="story-card"]').first().click()
    
    // Click create character button
    cy.get('[data-cy="create-character-button"], button').contains(/New Character|Create Character/i).click()
    
    // Modal should be visible with character type selection
    cy.get('button').contains('Protagonist').should('be.visible')
    cy.get('button').contains('Antagonist').should('be.visible')
    cy.get('button').contains('Supporting').should('be.visible')
  })
})