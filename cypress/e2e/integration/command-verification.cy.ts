/// <reference types="cypress" />

import { setupAuth, clearAuth } from '../../support/test-helpers'

describe('Verify Custom Commands Work', () => {
  it('should verify clearLocalStorage command works', () => {
    // * Set some data in localStorage
    cy.window().then((win) => {
      win.localStorage.setItem('test-key', 'test-value')
    })
    
    // * Clear it using our command
    cy.clearLocalStorage()
    
    // * Verify it's cleared
    cy.window().then((win) => {
      expect(win.localStorage.length).to.equal(0)
    })
  })

  it('should verify setupAuth function works', () => {
    // * Clear localStorage first
    cy.clearLocalStorage()
    
    // ! SECURITY: * Call setupAuth
    setupAuth()
    
    // ! SECURITY: * Verify auth data was set
    cy.window().then((win) => {
      const authToken = win.// ! SECURITY: Using localStorage
      localStorage.getItem('supabase.auth.token')
      expect(authToken).to.not.be.null
      
      const parsed = JSON.parse(authToken!)
      expect(parsed).to.have.property('access_token', 'mock-jwt-token')
      expect(parsed).to.have.property('user')
      expect(parsed.user).to.have.property('email', 'test@example.com')
      
      const userData = win.// ! SECURITY: Using localStorage
      localStorage.getItem('writing-app-user')
      expect(userData).to.not.be.null
      
      const isAuthenticated = win.// ! SECURITY: Using localStorage
      localStorage.getItem('writing-app-authenticated')
      expect(isAuthenticated).to.equal('true')
      
      // * Verify offline mode was set
      const offlineMode = win.// ! SECURITY: Using localStorage
      localStorage.getItem('fantasy-writing-app-offline-mode')
      expect(offlineMode).to.equal('true')
    })
  })

  it('should verify setupAuth with custom user data', () => {
    cy.clearLocalStorage()
    
    // ! SECURITY: * Call setupAuth with custom data
    setupAuth({
      user: {
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin'
      }
    })
    
    // * Verify custom data was set
    cy.window().then((win) => {
      const authToken = win.// ! SECURITY: Using localStorage
      localStorage.getItem('supabase.auth.token')
      const parsed = JSON.parse(authToken!)
      expect(parsed.user).to.have.property('email', 'admin@example.com')
      expect(parsed.user).to.have.property('name', 'Admin User')
      expect(parsed.user).to.have.property('role', 'admin')
    })
  })

  it('should verify clearAuth function works', () => {
    // ! SECURITY: * Set up auth first
    setupAuth()
    
    // ! SECURITY: * Verify auth is set
    cy.window().then((win) => {
      expect(win.// ! SECURITY: Using localStorage
      localStorage.getItem('supabase.auth.token')).to.not.be.null
    })
    
    // ! SECURITY: * Clear auth
    clearAuth()
    
    // ! SECURITY: * Verify auth is cleared
    cy.window().then((win) => {
      expect(win.// ! SECURITY: Using localStorage
      localStorage.getItem('supabase.auth.token')).to.be.null
      expect(win.// ! SECURITY: Using localStorage
      localStorage.getItem('writing-app-user')).to.be.null
      expect(win.// ! SECURITY: Using localStorage
      localStorage.getItem('writing-app-authenticated')).to.be.null
      expect(win.// ! SECURITY: Using localStorage
      localStorage.getItem('fantasy-writing-app-offline-mode')).to.be.null
    })
  })

  it('should verify setupTestEnvironment command works', () => {
    // * Add some data to localStorage
    cy.window().then((win) => {
      win.localStorage.setItem('test-data', 'some value')
      win.localStorage.setItem('another-key', 'another value')
    })
    
    // * Call setupTestEnvironment
    cy.setupTestEnvironment()
    
    // * Verify localStorage was cleared and offline mode set
    cy.window().then((win) => {
      expect(win.// ! SECURITY: Using localStorage
      localStorage.getItem('test-data')).to.be.null
      expect(win.// ! SECURITY: Using localStorage
      localStorage.getItem('another-key')).to.be.null
      expect(win.// ! SECURITY: Using localStorage
      localStorage.getItem('fantasy-writing-app-offline-mode')).to.equal('true')
    })
  })

  it('should verify story-specific storage keys work', () => {
    // ! SECURITY: * Setup auth
    setupAuth()
    
    // * Verify writing app specific keys are used
    cy.window().then((win) => {
      // * Set story data
      win.localStorage.setItem('current-story-id', 'test-story-123')
      win.localStorage.setItem('story-draft-auto-save', 'true')
      
      // * Verify keys exist
      expect(win.// ! SECURITY: Using localStorage
      localStorage.getItem('current-story-id')).to.equal('test-story-123')
      expect(win.// ! SECURITY: Using localStorage
      localStorage.getItem('story-draft-auto-save')).to.equal('true')
    })
    
    // * Clear and verify cleanup
    cy.clearLocalStorage()
    cy.window().then((win) => {
      expect(win.// ! SECURITY: Using localStorage
      localStorage.getItem('current-story-id')).to.be.null
      expect(win.// ! SECURITY: Using localStorage
      localStorage.getItem('story-draft-auto-save')).to.be.null
    })
  })
})