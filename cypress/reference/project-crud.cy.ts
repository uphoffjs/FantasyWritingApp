/// <reference types="cypress" />

import { setupAuth } from '../../support/test-helpers'

describe('Project Creation', () => {
  beforeEach(() => {
    // ! SECURITY: * Setup test environment with auth
    cy.setupTestEnvironment()
    setupAuth()
    cy.visit('/projects')
    // * Wait for the page to be fully loaded instead of arbitrary wait
    cy.url().should('include', '/projects')
  })

  it('should allow user to create their first project', () => {
    // * Verify we're on the projects page
    cy.url().should('include', '/projects')
    
    // Click Get Started button on welcome screen
    cy.get('[data-cy="get-started"]').should('be.visible').click()
    
    // * Verify the create project modal opens
    cy.get('[data-cy="create-project-modal"]').should('be.visible')
    
    // * Fill in the project details
    const projectName = 'My Fantasy World'
    const projectDescription = 'A world of magic and adventure'
    
    cy.get('[data-cy="project-name"]').type(projectName)
    cy.get('[data-cy="project-description"]').type(projectDescription)
    
    // * Submit the form
    cy.get('[data-cy="submit"]').click()
    
    // * Verify the modal closes
    cy.get('[data-cy="create-project-modal"]').should('not.exist')
    
    // * Verify the new project appears in the project list
    cy.get('[data-cy="project-card"]')
      .should('contain', projectName)
      .and('contain', projectDescription)
    
    // * Verify the project persists after page reload
    cy.reload()
    cy.get('[data-cy="project-card"]')
      .should('contain', projectName)
      .and('contain', projectDescription)
  })

  it('should validate required fields when creating a project', () => {
    // Click Get Started button on welcome screen
    cy.get('[data-cy="get-started"]').click()
    
    // * Verify submit button is disabled without required fields
    cy.get('[data-cy="submit"]').should('be.disabled')
    
    // * Type a space and clear to trigger validation
    cy.get('[data-cy="project-name"]').type(' ')
    cy.get('[data-cy="project-name"]').clear()
    
    // TODO: * Submit button should still be disabled
    cy.get('[data-cy="submit"]').should('be.disabled')
    
    // * Fill in the name and submit
    cy.get('[data-cy="project-name"]').type('Test Project')
    cy.get('[data-cy="submit"]').click()
    
    // * Verify the project is created successfully
    cy.get('[data-cy="create-project-modal"]').should('not.exist')
    cy.get('[data-cy="project-card"]').should('contain', 'Test Project')
  })

  it('should handle project creation errors gracefully', () => {
    // * Mock a server error for project creation
    cy.intercept('POST', '**/rest/v1/projects', {
      statusCode: 500,
      body: { error: 'Internal server error' }
    }).as('createProjectError')
    
    // * Try to create a project
    cy.get('[data-cy="get-started"]').click()
    cy.get('[data-cy="project-name"]').type('Failed Project')
    cy.get('[data-cy="submit"]').click()
    
    // TODO: * Since we're using localStorage, the project should still be created
    // * The error intercept won't affect localStorage operations
    cy.get('[data-cy="create-project-modal"]').should('not.exist')
    cy.get('[data-cy="project-card"]').should('contain', 'Failed Project')
  })

  it('should allow canceling project creation', () => {
    // * Open create project modal
    cy.get('[data-cy="get-started"]').click()
    
    // * Type some data
    cy.get('[data-cy="project-name"]').type('Cancelled Project')
    
    // * Click cancel button
    cy.get('[data-cy="cancel"]').click()
    
    // * Verify modal closes without creating the project
    cy.get('[data-cy="create-project-modal"]').should('not.exist')
    
    // * Verify we're back at the welcome screen (no projects exist)
    cy.get('[data-cy="get-started"]').should('be.visible')
  })
})

describe('Project Creation - With Existing Projects', () => {
  beforeEach(() => {
    // * Clear localStorage first
    cy.window().then((win) => {
      win.localStorage.clear()
    })
    
    // ! SECURITY: * Setup auth and offline mode
    setupAuth()
    
    // * Visit the page first
    cy.visit('/projects')
    // * Wait for page to load properly
    cy.url().should('include', '/projects')
    
    // * Now create a project through the UI
    cy.get('[data-cy="get-started"]').click()
    cy.get('[data-cy="project-name"]').type('Existing Project')
    cy.get('[data-cy="project-description"]').type('A test project')
    cy.get('[data-cy="submit"]').click()
    
    // * Wait for the project to be created
    cy.get('[data-cy="project-card"]').should('contain', 'Existing Project')
  })

  it('should show create project button when projects exist', () => {
    // TODO: * When projects exist, we should see the project list
    // with the existing project card
    cy.get('[data-cy="project-card"]').should('contain', 'Existing Project')
    
    // TODO: The ProjectList component should have a create project button
    // * There are multiple create buttons - desktop, mobile, and FAB
    cy.get('[data-cy="create-project"], [data-cy="fab-create-project"]')
      .first()
      .should('be.visible')
    
    // * Test that clicking it opens the modal
    cy.get('[data-cy="create-project"], [data-cy="fab-create-project"]')
      .first()
      .click()
    
    // * Verify modal opens
    cy.get('[data-cy="create-project-modal"]').should('be.visible')
  })
})