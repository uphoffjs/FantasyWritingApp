import { setupAuth } from '../../support/test-helpers'

describe('Element Editor Integration', () => {
  beforeEach(() => {
    // Setup test environment
    cy.setupTestEnvironment()
    setupAuth()
    cy.visit('/projects')
    
    // Wait for page to load
    cy.get('body').should('be.visible')
    cy.url().should('include', '/projects')
    
    // Create a project through the UI
    cy.get('[data-cy="get-started"], [data-cy="create-project"]').first().click()
    cy.get('[data-cy="project-name"]').type('Test World')
    cy.get('[data-cy="project-description"]').type('A test fantasy world')
    cy.get('[data-cy="submit"]').click()
    
    // Wait for project to be created
    cy.get('[data-cy="project-card"]').should('contain', 'Test World')
  })

  it('should navigate to project and show element creation button', () => {
    // Navigate to the project
    cy.get('[data-cy="project-card"]').first().click()
    
    // Should show create element button
    cy.get('[data-cy="create-element-button"], button').contains(/New Element|Create Element/i).should('be.visible')
  })

  it('should open create element modal when clicking create button', () => {
    // Navigate to the project
    cy.get('[data-cy="project-card"]').first().click()
    
    // Click create element button
    cy.get('[data-cy="create-element-button"], button').contains(/New Element|Create Element/i).click()
    
    // Modal should be visible with category selection
    cy.get('button').contains('Character').should('be.visible')
    cy.get('button').contains('Location').should('be.visible')
  })
})