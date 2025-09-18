/// <reference types="cypress" />

/**
 * Unified test helpers for authentication and setup
 * Works both as importable functions and Cypress commands
 */

export interface MockAuthOptions {
  user?: {
    id?: string
    email?: string
    name?: string
    role?: 'user' | 'admin' | 'developer'
    metadata?: Record<string, unknown>
  }
  skipSupabase?: boolean
  setOfflineMode?: boolean
}

/**
 * Setup mock authentication
 * Can be used directly or via cy.setupAuth()
 */
export function setupAuth(options: MockAuthOptions = {}) {
  const defaultUser = {
    id: 'test-user-123',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user' as const,
    ...((options && options.user) || {})
  }

  // ! SECURITY: * Set auth state in localStorage (matching Supabase auth structure)
  const authToken = {
    access_token: 'mock-jwt-token',
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: Date.now() + 3600000,
    refresh_token: 'mock-refresh-token',
    user: defaultUser
  }

  cy.window().then((win) => {
    // ! SECURITY: * Clear any existing auth state
    win.localStorage.removeItem('supabase.auth.token')
    win.localStorage.removeItem('worldbuilding-user')
    win.localStorage.removeItem('worldbuilding-authenticated')
    
    // ! SECURITY: * Set offline mode by default to bypass auth checks
    if (options.setOfflineMode !== false) {
      win.localStorage.setItem('fantasy-writing-app-offline-mode', 'true')
    }
    
    // ! SECURITY: Set Supabase auth token format
    win.localStorage.setItem('supabase.auth.token', JSON.stringify(authToken))
    
    // * Set user data
    win.localStorage.setItem('worldbuilding-user', JSON.stringify(defaultUser))
    
    // ! SECURITY: * Mark as authenticated
    win.localStorage.setItem('worldbuilding-authenticated', 'true')
  })

  // Mock Supabase API responses if not skipped
  if (!options.skipSupabase) {
    // ! SECURITY: * Mock auth endpoints
    cy.intercept('POST', '**/auth/v1/token*', {
      statusCode: 200,
      body: {
        access_token: 'mock-jwt-token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'mock-refresh-token',
        user: defaultUser
      }
    }).as('mockAuthToken')

    cy.intercept('GET', '**/auth/v1/user', {
      statusCode: 200,
      body: defaultUser
    }).as('mockAuthUser')

    // * Mock profile/user data endpoints
    cy.intercept('GET', '**/rest/v1/profiles*', {
      statusCode: 200,
      body: [defaultUser]
    }).as('mockProfiles')

    // ! SECURITY: * Mock project endpoints (for authenticated requests)
    cy.intercept('GET', '**/rest/v1/projects*', {
      statusCode: 200,
      body: []
    }).as('mockProjects')

    cy.intercept('POST', '**/rest/v1/projects', {
      statusCode: 201,
      body: {
        id: 'mock-project-id',
        name: 'Test Project',
        owner_id: defaultUser.id,
        created_at: new Date().toISOString()
      }
    }).as('mockCreateProject')
  }
}

/**
 * Clear authentication and reset to clean state
 */
export function clearAuth() {
  cy.window().then((win) => {
    win.localStorage.removeItem('supabase.auth.token')
    win.localStorage.removeItem('worldbuilding-user')
    win.localStorage.removeItem('worldbuilding-authenticated')
    win.localStorage.removeItem('fantasy-element-builder-offline-mode')
  })
}

/**
 * Setup clean test environment
 * Clears localStorage and sets up offline mode
 */
export function setupTestEnvironment() {
  cy.window().then((win) => {
    win.localStorage.clear()
    // ! SECURITY: * Set offline mode to bypass auth checks
    win.localStorage.setItem('fantasy-element-builder-offline-mode', 'true')
  })
}

// * Register as Cypress commands
declare global {
  namespace Cypress {
    interface Chainable {
      setupAuth(options?: MockAuthOptions): Chainable<void>
      clearAuth(): Chainable<void>
      setupTestEnvironment(): Chainable<void>
    }
  }
}

// * Add commands if Cypress is available
if (typeof Cypress !== 'undefined') {
  Cypress.Commands.add('setupAuth', setupAuth)
  Cypress.Commands.add('clearAuth', clearAuth)
  Cypress.Commands.add('setupTestEnvironment', setupTestEnvironment)
}