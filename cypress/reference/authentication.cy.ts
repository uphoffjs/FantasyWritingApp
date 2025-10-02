/// <reference types="cypress" />

import { setupAuth, clearAuth } from '../../support/test-helpers'

describe('Authentication Example Tests', () => {
  describe('Authenticated User Tests', () => {
    beforeEach(() => {
      // ! SECURITY: * Setup test environment with auth
      cy.setupTestEnvironment()
      setupAuth()
      cy.visit('/projects')
      // * Wait for page to load properly
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
      cy.setupTestEnvironment()
      setupAuth({
        user: {
          email: 'admin@example.com',
          role: 'admin',
          name: 'Admin User'
        }
      })
      cy.visit('/projects')
      // * Wait for page to load properly
      cy.url().should('include', '/projects')

      // TODO: * Should still see projects page
      cy.url().should('include', '/projects')
    })

    it('should mock developer user', () => {
      cy.setupTestEnvironment()
      setupAuth({
        user: {
          email: 'dev@example.com',
          role: 'developer',
          name: 'Developer User'
        }
      })
      cy.visit('/projects')
      // * Wait for page to load properly
      cy.url().should('include', '/projects')

      // TODO: * Should still see projects page
      cy.url().should('include', '/projects')
    })
  })

  describe('Logged Out State', () => {
    beforeEach(() => {
      // ! SECURITY: * Clear everything and don't set auth
      cy.window().then((win) => {
        win.localStorage.clear()
      })
      cy.visit('/')
    })

    it('should redirect to login when not authenticated', () => {
      // TODO: ! SECURITY: * Should be redirected to login
      cy.url().should('include', '/login')
    })
  })

  describe('Switching Between Users', () => {
    it('should switch from regular user to admin', () => {
      // * Start as regular user
      cy.setupTestEnvironment()
      setupAuth({
        user: { email: 'user@example.com', role: 'user' }
      })
      cy.visit('/projects')
      // * Wait for page to load properly
      cy.url().should('include', '/projects')

      // * Create a project
      cy.get('[data-cy="get-started"]').click()
      cy.get('[data-cy="project-name"]').type('User Project')
      cy.get('[data-cy="submit"]').click()
      
      // ! SECURITY: * Clear auth and switch to admin
      clearAuth()
      setupAuth({
        user: { email: 'admin@example.com', role: 'admin' }
      })
      cy.reload()
      
      // * Projects are stored locally, so admin would see the same projects
      cy.get('[data-cy="project-card"]').should('contain', 'User Project')
    })
  })

  describe('Supabase API Mocking', () => {
    it('should intercept Supabase API calls', () => {
      cy.setupTestEnvironment()
      setupAuth() // This sets up API mocks by default
      cy.visit('/projects')
      // * Wait for page to load properly
      cy.url().should('include', '/projects')
      
      // * Create a project (will use mocked API if needed)
      cy.get('[data-cy="get-started"]').click()
      cy.get('[data-cy="project-name"]').type('API Test Project')
      cy.get('[data-cy="submit"]').click()
      
      // * Verify the project appears
      cy.get('[data-cy="project-card"]').should('contain', 'API Test Project')
    })

    it('should work without Supabase mocking', () => {
      // * Only set localStorage, don't mock API calls
      cy.setupTestEnvironment()
      setupAuth({ skipSupabase: true })
      cy.visit('/projects')
      // * Wait for page to load properly
      cy.url().should('include', '/projects')
      
      // TODO: * Should still work with offline mode
      cy.get('[data-cy="get-started"]').should('be.visible')
    })
  })
})