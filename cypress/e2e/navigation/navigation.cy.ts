import { setupAuth } from '../../support/test-helpers'

describe('Navigation and Routing', () => {
  beforeEach(() => {
    // Setup test environment
    cy.setupTestEnvironment()
    setupAuth()
    cy.visit('/stories')
    
    // Wait for page to load
    cy.get('body').should('be.visible')
    cy.url().should('include', '/stories')
    
    // Create a story through the UI
    cy.get('[data-testid="get-started"], [data-testid="create-story"]').first().click()
    cy.get('[data-testid="story-title"]').type('Navigation Test Epic')
    cy.get('[data-testid="story-description"]').type('Testing navigation features')
    cy.get('[data-testid="submit"]').click()
    
    // Wait for story to be created
    cy.get('[data-testid="story-card"]').should('contain', 'Navigation Test Epic')
  })

  it('should navigate between story list and story view', () => {
    // Navigate to story
    cy.get('[data-testid="story-card"]').first().click()
    cy.url().should('include', '/story/')
    
    // Navigate back to stories list using browser back
    cy.go('back')
    cy.url().should('include', '/stories')
    cy.get('[data-testid="story-card"]').should('exist')
  })

  it('should navigate between story list and story view using URL', () => {
    // Get story ID from the card
    cy.get('[data-testid="story-card"]').first().click()
    
    // Store the URL
    cy.url().then((storyUrl) => {
      // Go back to stories
      cy.visit('/stories')
      cy.get('[data-testid="story-card"]').should('exist')
      
      // Navigate directly to story using URL
      cy.visit(storyUrl)
      cy.url().should('include', '/story/')
    })
  })

  it('should maintain navigation state after page refresh', () => {
    // Navigate to story
    cy.get('[data-testid="story-card"]').first().click()
    cy.url().should('include', '/story/')
    
    // Refresh the page
    cy.reload()
    
    // Should still be on the story page
    cy.url().should('include', '/story/')
  })

  it('should handle deep linking to stories', () => {
    // Get story card and extract ID
    cy.get('[data-testid="story-card"]').first().then(($card) => {
      // Navigate to story to get the URL
      cy.wrap($card).click()
      
      cy.url().then((url) => {
        // Extract story ID from URL
        const storyId = url.split('/story/')[1]
        
        // Navigate away
        cy.visit('/stories')
        
        // Deep link directly to the story
        cy.visit(`/story/${storyId}`)
        
        // Should load the story
        cy.url().should('include', `/story/${storyId}`)
      })
    })
  })

  it('should handle navigation with browser buttons', () => {
    // Start at stories list
    cy.url().should('include', '/stories')
    
    // Navigate to story
    cy.get('[data-testid="story-card"]').first().click()
    cy.url().should('include', '/story/')
    
    // Use browser back button
    cy.go('back')
    cy.url().should('include', '/stories')
    
    // Use browser forward button
    cy.go('forward')
    cy.url().should('include', '/story/')
  })

  it('should navigate to character view from story', () => {
    // Navigate to story
    cy.get('[data-testid="story-card"]').first().click()
    
    // Create a character first
    cy.get('[data-testid="create-character-button"]').click()
    cy.get('[data-testid="character-type-protagonist"]').click()
    cy.get('[data-testid="character-name-input"]').type('Navigation Test Character')
    cy.get('[data-testid="create-character-submit"]').click()
    
    // Should be on character page
    cy.url().should('include', '/character/')
    
    // Navigate back to story
    cy.go('back')
    cy.url().should('include', '/story/')
    
    // Click on character card to navigate to character
    cy.get('[data-testid="character-card"]').contains('Navigation Test Character').click()
    cy.url().should('include', '/character/')
  })

  it('should navigate between different story sections', () => {
    // Navigate to story
    cy.get('[data-testid="story-card"]').first().click()
    
    // Check main sections are available for navigation
    cy.get('[data-testid="nav-characters"]').should('be.visible')
    cy.get('[data-testid="nav-scenes"]').should('be.visible')
    cy.get('[data-testid="nav-outline"]').should('be.visible')
    
    // Navigate to characters section
    cy.get('[data-testid="nav-characters"]').click()
    cy.url().should('include', '/characters')
    
    // Navigate to scenes section
    cy.get('[data-testid="nav-scenes"]').click()
    cy.url().should('include', '/scenes')
    
    // Navigate to outline section
    cy.get('[data-testid="nav-outline"]').click()
    cy.url().should('include', '/outline')
  })

  it('should handle breadcrumb navigation', () => {
    // Navigate to story
    cy.get('[data-testid="story-card"]').first().click()
    
    // Create and navigate to character
    cy.get('[data-testid="create-character-button"]').click()
    cy.get('[data-testid="character-type-protagonist"]').click()
    cy.get('[data-testid="character-name-input"]').type('Breadcrumb Test')
    cy.get('[data-testid="create-character-submit"]').click()
    
    // Check breadcrumb exists and navigate using it
    cy.get('[data-testid="breadcrumb"]').should('be.visible')
    cy.get('[data-testid="breadcrumb-story"]').click()
    cy.url().should('include', '/story/')
    
    // Should also have breadcrumb to stories list
    cy.get('[data-testid="breadcrumb-stories"]').click()
    cy.url().should('include', '/stories')
  })

  it('should redirect to login when not authenticated', () => {
    // Clear auth
    cy.window().then((win) => {
      win.localStorage.clear()
    })
    
    // Try to visit stories page
    cy.visit('/stories')
    
    // Should redirect to login
    cy.url().should('include', '/login')
  })

  it('should handle invalid routes gracefully', () => {
    // Try to visit a non-existent story
    cy.visit('/story/invalid-id', { failOnStatusCode: false })
    
    // Should show 404 or redirect to stories list
    cy.url().should('satisfy', (url) => {
      return url.includes('/404') || url.includes('/stories')
    })
  })

  it('should maintain scroll position on navigation', () => {
    // Navigate to story with multiple characters
    cy.get('[data-testid="story-card"]').first().click()
    
    // Create multiple characters to have scrollable content
    for (let i = 1; i <= 5; i++) {
      cy.get('[data-testid="create-character-button"]').click()
      cy.get('[data-testid="character-type-supporting"]').click()
      cy.get('[data-testid="character-name-input"]').type(`Character ${i}`)
      cy.get('[data-testid="create-character-submit"]').click()
      cy.go('back')
    }
    
    // Scroll down
    cy.scrollTo('bottom')
    
    // Navigate to a character
    cy.get('[data-testid="character-card"]').last().click()
    
    // Navigate back
    cy.go('back')
    
    // Should maintain some scroll position (though exact position may vary)
    cy.window().its('scrollY').should('be.greaterThan', 0)
  })
})