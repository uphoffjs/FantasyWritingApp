/// <reference types="cypress" />

import { setupAuth, clearAuth } from '../../support/test-helpers'

describe('Verify Custom Commands Work', () => {
  it('should verify clearLocalStorage command works', () => {
    // Set some data in localStorage
    cy.window().then((win) => {
      win.localStorage.setItem('test-key', 'test-value')
    })
    
    // Clear it using our command
    cy.clearLocalStorage()
    
    // Verify it's cleared
    cy.window().then((win) => {
      expect(win.localStorage.length).to.equal(0)
    })
  })

  it('should verify setupAuth function works', () => {
    // Clear localStorage first
    cy.clearLocalStorage()
    
    // Call setupAuth
    setupAuth()
    
    // Verify auth data was set
    cy.window().then((win) => {
      const authToken = win.localStorage.getItem('supabase.auth.token')
      expect(authToken).to.not.be.null
      
      const parsed = JSON.parse(authToken!)
      expect(parsed).to.have.property('access_token', 'mock-jwt-token')
      expect(parsed).to.have.property('user')
      expect(parsed.user).to.have.property('email', 'test@example.com')
      
      const userData = win.localStorage.getItem('worldbuilding-user')
      expect(userData).to.not.be.null
      
      const isAuthenticated = win.localStorage.getItem('worldbuilding-authenticated')
      expect(isAuthenticated).to.equal('true')
      
      // Verify offline mode was set
      const offlineMode = win.localStorage.getItem('fantasy-element-builder-offline-mode')
      expect(offlineMode).to.equal('true')
    })
  })

  it('should verify setupAuth with custom user data', () => {
    cy.clearLocalStorage()
    
    // Call setupAuth with custom data
    setupAuth({
      user: {
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin'
      }
    })
    
    // Verify custom data was set
    cy.window().then((win) => {
      const authToken = win.localStorage.getItem('supabase.auth.token')
      const parsed = JSON.parse(authToken!)
      expect(parsed.user).to.have.property('email', 'admin@example.com')
      expect(parsed.user).to.have.property('name', 'Admin User')
      expect(parsed.user).to.have.property('role', 'admin')
    })
  })

  it('should verify clearAuth function works', () => {
    // Set up auth first
    setupAuth()
    
    // Verify auth is set
    cy.window().then((win) => {
      expect(win.localStorage.getItem('supabase.auth.token')).to.not.be.null
    })
    
    // Clear auth
    clearAuth()
    
    // Verify auth is cleared
    cy.window().then((win) => {
      expect(win.localStorage.getItem('supabase.auth.token')).to.be.null
      expect(win.localStorage.getItem('worldbuilding-user')).to.be.null
      expect(win.localStorage.getItem('worldbuilding-authenticated')).to.be.null
      expect(win.localStorage.getItem('fantasy-element-builder-offline-mode')).to.be.null
    })
  })

  it('should verify setupTestEnvironment command works', () => {
    // Add some data to localStorage
    cy.window().then((win) => {
      win.localStorage.setItem('test-data', 'some value')
      win.localStorage.setItem('another-key', 'another value')
    })
    
    // Call setupTestEnvironment
    cy.setupTestEnvironment()
    
    // Verify localStorage was cleared and offline mode set
    cy.window().then((win) => {
      expect(win.localStorage.getItem('test-data')).to.be.null
      expect(win.localStorage.getItem('another-key')).to.be.null
      expect(win.localStorage.getItem('fantasy-element-builder-offline-mode')).to.equal('true')
    })
  })
})