/// <reference types="cypress" />

import { setupAuth, clearAuth } from '../../support/test-helpers'

describe('Authentication Example Tests', () => {
  describe('Authenticated User Tests', () => {
    beforeEach(() => {
      // Setup test environment with auth
      cy.setupTestEnvironment()
      setupAuth()
      cy.visit('/projects')
      // Wait for page to load properly
      cy.get('body').should('be.visible')
      cy.url().should('include', '/projects')
    })

    it('should show authenticated user interface', () => {
      // User should see the welcome screen or project list
      cy.url().should('include', '/projects')
      
      // Get started button should be visible for new users
      cy.get('[data-testid="get-started"]').should('be.visible')
    })

    it('should allow creating a project as authenticated user', () => {
      // Click get started
      cy.get('[data-testid="get-started"]').click()
      
      // Fill in project details
      cy.get('[data-testid="project-name"]').type('My Fantasy World')
      cy.get('[data-testid="project-description"]').type('A world of magic and adventure')
      cy.get('[data-testid="submit"]').click()
      
      // Verify project was created
      cy.get('[data-testid="project-card"]').should('contain', 'My Fantasy World')
    })

    it('should persist auth state across page reloads', () => {
      // Create a project
      cy.get('[data-testid="get-started"]').click()
      cy.get('[data-testid="project-name"]').type('Test Project')
      cy.get('[data-testid="submit"]').click()
      
      // Reload the page
      cy.reload()
      
      // Auth state should persist, project should still be visible
      cy.get('[data-testid="project-card"]').should('contain', 'Test Project')
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
      // Wait for page to load properly
      cy.get('body').should('be.visible')
      cy.url().should('include', '/projects')
      
      // Should still see projects page
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
      // Wait for page to load properly
      cy.get('body').should('be.visible')
      cy.url().should('include', '/projects')
      
      // Should still see projects page
      cy.url().should('include', '/projects')
    })
  })

  describe('Logged Out State', () => {
    beforeEach(() => {
      // Clear everything and don't set auth
      cy.window().then((win) => {
        win.localStorage.clear()
      })
      cy.visit('/')
    })

    it('should redirect to login when not authenticated', () => {
      // Should be redirected to login
      cy.url().should('include', '/login')
    })
  })

  describe('Switching Between Users', () => {
    it('should switch from regular user to admin', () => {
      // Start as regular user
      cy.setupTestEnvironment()
      setupAuth({
        user: { email: 'user@example.com', role: 'user' }
      })
      cy.visit('/projects')
      // Wait for page to load properly
      cy.get('body').should('be.visible')
      cy.url().should('include', '/projects')
      
      // Create a project
      cy.get('[data-testid="get-started"]').click()
      cy.get('[data-testid="project-name"]').type('User Project')
      cy.get('[data-testid="submit"]').click()
      
      // Clear auth and switch to admin
      clearAuth()
      setupAuth({
        user: { email: 'admin@example.com', role: 'admin' }
      })
      cy.reload()
      
      // Projects are stored locally, so admin would see the same projects
      cy.get('[data-testid="project-card"]').should('contain', 'User Project')
    })
  })

  describe('Supabase API Mocking', () => {
    it('should intercept Supabase API calls', () => {
      cy.setupTestEnvironment()
      setupAuth() // This sets up API mocks by default
      cy.visit('/projects')
      // Wait for page to load properly
      cy.get('body').should('be.visible')
      cy.url().should('include', '/projects')
      
      // Create a project (will use mocked API if needed)
      cy.get('[data-testid="get-started"]').click()
      cy.get('[data-testid="project-name"]').type('API Test Project')
      cy.get('[data-testid="submit"]').click()
      
      // Verify the project appears
      cy.get('[data-testid="project-card"]').should('contain', 'API Test Project')
    })

    it('should work without Supabase mocking', () => {
      // Only set localStorage, don't mock API calls
      cy.setupTestEnvironment()
      setupAuth({ skipSupabase: true })
      cy.visit('/projects')
      // Wait for page to load properly
      cy.get('body').should('be.visible')
      cy.url().should('include', '/projects')
      
      // Should still work with offline mode
      cy.get('[data-testid="get-started"]').should('be.visible')
    })
  })
})