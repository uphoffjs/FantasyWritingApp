import { setupAuth } from '../../support/test-helpers'

describe('Navigation and Routing', () => {
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
    cy.get('[data-cy="project-name"]').type('Navigation Test World')
    cy.get('[data-cy="project-description"]').type('Testing navigation features')
    cy.get('[data-cy="submit"]').click()
    
    // Wait for project to be created
    cy.get('[data-cy="project-card"]').should('contain', 'Navigation Test World')
  })

  it('should navigate between project list and project view', () => {
    // Navigate to project
    cy.get('[data-cy="project-card"]').first().click()
    cy.url().should('include', '/project/')
    
    // Navigate back to projects list using browser back
    cy.go('back')
    cy.url().should('include', '/projects')
    cy.get('[data-cy="project-card"]').should('exist')
  })

  it('should navigate between project list and project view using URL', () => {
    // Get project ID from the card
    cy.get('[data-cy="project-card"]').first().click()
    
    // Store the URL
    cy.url().then((projectUrl) => {
      // Go back to projects
      cy.visit('/projects')
      cy.get('[data-cy="project-card"]').should('exist')
      
      // Navigate directly to project using URL
      cy.visit(projectUrl)
      cy.url().should('include', '/project/')
    })
  })

  it('should maintain navigation state after page refresh', () => {
    // Navigate to project
    cy.get('[data-cy="project-card"]').first().click()
    cy.url().should('include', '/project/')
    
    // Refresh the page
    cy.reload()
    
    // Should still be on the project page
    cy.url().should('include', '/project/')
  })

  it('should handle deep linking to projects', () => {
    // Get project card and extract ID
    cy.get('[data-cy="project-card"]').first().then(($card) => {
      // Navigate to project to get the URL
      cy.wrap($card).click()
      
      cy.url().then((url) => {
        // Extract project ID from URL
        const projectId = url.split('/project/')[1]
        
        // Navigate away
        cy.visit('/projects')
        
        // Deep link directly to the project
        cy.visit(`/project/${projectId}`)
        
        // Should load the project
        cy.url().should('include', `/project/${projectId}`)
      })
    })
  })

  it('should handle navigation with browser buttons', () => {
    // Start at projects list
    cy.url().should('include', '/projects')
    
    // Navigate to project
    cy.get('[data-cy="project-card"]').first().click()
    cy.url().should('include', '/project/')
    
    // Use browser back button
    cy.go('back')
    cy.url().should('include', '/projects')
    
    // Use browser forward button
    cy.go('forward')
    cy.url().should('include', '/project/')
  })

  it('should redirect to login when not authenticated', () => {
    // Clear auth
    cy.window().then((win) => {
      win.localStorage.clear()
    })
    
    // Try to visit projects page
    cy.visit('/projects')
    
    // Should redirect to login
    cy.url().should('include', '/login')
  })
})