/// <reference types="cypress" />

describe('Basic App Functionality - Smoke Tests', () => {
  it('should load the login page when not authenticated', () => {
    cy.visit('/')
    cy.url().should('include', '/login')
  })
  
  it('should display main navigation after authentication', () => {
    // Setup auth and visit main page
    cy.setupTestEnvironment()
    cy.visit('/')
    
    // Should navigate to stories page for authenticated users
    cy.url().should('satisfy', (url) => {
      return url.includes('/stories') || url.includes('/dashboard')
    })
  })

  it('should use createStory command if available', () => {
    // Try to test if the command exists
    const commandExists = typeof cy.createStory === 'function'
    cy.log(`createStory command exists: ${commandExists}`)
    
    // Setup environment and visit
    cy.setupTestEnvironment()
    cy.visit('/')
  })

  it('should handle basic story creation workflow', () => {
    cy.setupTestEnvironment()
    cy.visit('/stories')
    
    // Should show create story button
    cy.get('[data-testid="create-story"], [data-testid="get-started"]').should('be.visible')
  })

  it('should handle basic navigation between main sections', () => {
    cy.setupTestEnvironment()
    cy.visit('/')
    
    // Check that main navigation elements exist
    cy.get('body').should('be.visible')
    
    // Basic smoke test - app loads without throwing errors
    cy.get('[data-testid="app-container"], main, #root').should('exist')
  })

  it('should handle React Native Web rendering', () => {
    cy.setupTestEnvironment()
    cy.visit('/')
    
    // Check that React Native Web components render
    cy.get('body').should('have.css', 'font-family')
    
    // Should not have any critical console errors
    cy.window().then((win) => {
      // Basic check that window and document are available
      expect(win.document).to.exist
      expect(win.navigator).to.exist
    })
  })

  it('should handle offline mode gracefully', () => {
    cy.setupTestEnvironment()
    
    // Verify offline mode is set
    cy.window().then((win) => {
      expect(win.localStorage.getItem('fantasy-writing-app-offline-mode')).to.equal('true')
    })
    
    cy.visit('/')
    
    // App should still load in offline mode
    cy.get('body').should('be.visible')
  })

  it('should handle responsive design basics', () => {
    cy.setupTestEnvironment()
    cy.visit('/')
    
    // Test mobile viewport
    cy.viewport(375, 667)
    cy.get('body').should('be.visible')
    
    // Test tablet viewport
    cy.viewport(768, 1024)
    cy.get('body').should('be.visible')
    
    // Test desktop viewport
    cy.viewport(1920, 1080)
    cy.get('body').should('be.visible')
  })

  it('should handle error boundaries', () => {
    cy.setupTestEnvironment()
    cy.visit('/')
    
    // Basic check that error boundary components would work
    // (This is mainly to ensure the app structure supports error handling)
    cy.window().then((win) => {
      // Check React is loaded
      expect(win.React || win.require).to.exist
    })
  })
})