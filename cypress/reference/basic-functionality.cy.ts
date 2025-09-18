/// <reference types="cypress" />

describe('Simple Test', () => {
  it('should load the login page', () => {
    cy.visit('/')
    cy.url().should('include', '/login')
  })
  
  it('should use createProject command if available', () => {
    // * Try to test if the command exists
    const commandExists = typeof cy.createProject === 'function'
    cy.log(`createProject command exists: ${commandExists}`)
    
    // * Just visit the page
    cy.visit('/')
  })
})