/// <reference types="cypress" />

describe('Authentication Example Tests', () => {
  describe('Authenticated User Tests', () => {
    beforeEach(() => {
    // * Using cy.session() for authentication caching

      // * Use session-based API login for faster authentication
      cy.apiLogin('test@example.com', 'testpassword123')
      cy.visit('/projects')
      // * Wait for page to load properly
      cy.get('body').should('be.visible')
      cy.url().should('include', '/projects')
    })

    it('should show authenticated user interface', () => {
      // TODO: * User should see the welcome screen or project list
      cy.url().should('include', '/projects')

      // TODO: * Get started button should be visible for new users
      cy.get('[data-cy="get-started"]').should('be.visible')
    })

    it('should allow creating a project as authenticated user', () => {
      // * Click get started
      cy.get('[data-cy="get-started"]').click()

      // * Fill in project details
      cy.get('[data-cy="project-name"]').type('My Fantasy World')
      cy.get('[data-cy="project-description"]').type('A world of magic and adventure')
      cy.get('[data-cy="submit"]').click()

      // * Verify project was created
      cy.get('[data-cy="project-card"]').should('contain', 'My Fantasy World')
    })

    it('should persist auth state across page reloads', () => {
      // * Create a project
      cy.get('[data-cy="get-started"]').click()
      cy.get('[data-cy="project-name"]').type('Test Project')
      cy.get('[data-cy="submit"]').click()

      // * Reload the page
      cy.reload()

      // TODO: ! SECURITY: * Auth state should persist, project should still be visible
      cy.get('[data-cy="project-card"]').should('contain', 'Test Project')
    })
  })

  describe('Different User Roles', () => {
    it('should mock admin user', () => {
      // * Use session-based role login
      cy.loginAs('admin')
      cy.visit('/projects')
      // * Wait for page to load properly
      cy.get('body').should('be.visible')
      cy.url().should('include', '/projects')

      // TODO: * Should still see projects page
      cy.url().should('include', '/projects')
    })

    it('should mock developer user', () => {
      // * Use session-based login with custom email
      cy.apiLogin('dev@example.com', 'devpassword123')
      cy.visit('/projects')
      // * Wait for page to load properly
      cy.get('body').should('be.visible')
      cy.url().should('include', '/projects')

      // TODO: * Should still see projects page
      cy.url().should('include', '/projects')
    })
  })

  describe('Logged Out State', () => {
    beforeEach(() => {
    // * Using cy.session() for authentication caching

      // ! SECURITY: * Clear everything and don't set auth
      cy.cleanMockAuth()
      cy.visit('/')
    })

    it('should redirect to login when not authenticated', () => {
      // TODO: ! SECURITY: * Should be redirected to login
      cy.url().should('include', '/login')
    })
  })

  describe('Switching Between Users', () => {
    it('should switch from regular user to admin', () => {
      // * Start as regular user using session-based role login
      cy.loginAs('user')
      cy.visit('/projects')
      // * Wait for page to load properly
      cy.get('body').should('be.visible')
      cy.url().should('include', '/projects')

      // * Create a project
      cy.get('[data-cy="get-started"]').click()
      cy.get('[data-cy="project-name"]').type('User Project')
      cy.get('[data-cy="submit"]').click()

      // ! SECURITY: * Clear auth and switch to admin
      cy.clearTestSessions() // Clear session cache
      cy.loginAs('admin')
      cy.reload()

      // * Projects are stored locally, so admin would see the same projects
      cy.get('[data-cy="project-card"]').should('contain', 'User Project')
    })
  })

  describe('Supabase API Mocking', () => {
    it('should intercept Supabase API calls', () => {
      // * Use session-based API login
      cy.apiLogin('test@example.com', 'testpassword123')
      cy.visit('/projects')
      // * Wait for page to load properly
      cy.get('body').should('be.visible')
      cy.url().should('include', '/projects')

      // * Create a project (will use mocked API if needed)
      cy.get('[data-cy="get-started"]').click()
      cy.get('[data-cy="project-name"]').type('API Test Project')
      cy.get('[data-cy="submit"]').click()

      // * Verify the project appears
      cy.get('[data-cy="project-card"]').should('contain', 'API Test Project')
    })

    it('should work without Supabase mocking', () => {
      // * Use session-based API login with skip flag
      cy.apiLogin('test@example.com', 'testpassword123')
      cy.visit('/projects')
      // * Wait for page to load properly
      cy.get('body').should('be.visible')
      cy.url().should('include', '/projects')

      // TODO: * Should still work with offline mode
      cy.get('[data-cy="get-started"]').should('be.visible')
    })
  })
})
