/// <reference types="cypress" />

/**
 * Mock Supabase Database Commands
 * Mock CRUD operations for testing without real database
 */

/**
 * Mock Supabase database endpoints (profiles, projects, elements)
 * @param fixtures - Optional fixture data to return
 * @example
 * cy.fixture('mock-projects').then((projects) => {
 *   cy.mockSupabaseDatabase({ projects });
 * });
 */
Cypress.Commands.add('mockSupabaseDatabase', (fixtures?: {
  profiles?: any[];
  projects?: any[];
  elements?: any[];
}) => {
  cy.log('🎭 Mocking Supabase database');

  // Mock profiles endpoint (GET /rest/v1/profiles)
  if (fixtures?.profiles !== undefined) {
    cy.intercept('GET', '**/rest/v1/profiles*', {
      statusCode: 200,
      body: fixtures.profiles,
      headers: {
        'Content-Range': `0-${fixtures.profiles.length - 1}/${fixtures.profiles.length}`,
      },
    }).as('mockGetProfiles');

    // Mock profile creation (POST /rest/v1/profiles)
    cy.intercept('POST', '**/rest/v1/profiles', (req) => {
      req.reply({
        statusCode: 201,
        body: [{ ...req.body, id: req.body.id || `profile-${Date.now()}` }],
      });
    }).as('mockCreateProfile');

    // Mock profile update (PATCH /rest/v1/profiles)
    cy.intercept('PATCH', '**/rest/v1/profiles*', (req) => {
      req.reply({
        statusCode: 200,
        body: [{ ...req.body }],
      });
    }).as('mockUpdateProfile');
  }

  // Mock projects endpoint (GET /rest/v1/projects)
  if (fixtures?.projects !== undefined) {
    cy.intercept('GET', '**/rest/v1/projects*', {
      statusCode: 200,
      body: fixtures.projects,
      headers: {
        'Content-Range': `0-${fixtures.projects.length - 1}/${fixtures.projects.length}`,
      },
    }).as('mockGetProjects');

    // Mock project creation (POST /rest/v1/projects)
    cy.intercept('POST', '**/rest/v1/projects', (req) => {
      req.reply({
        statusCode: 201,
        body: [{ ...req.body, id: `project-${Date.now()}`, created_at: new Date().toISOString() }],
      });
    }).as('mockCreateProject');

    // Mock project update (PATCH /rest/v1/projects)
    cy.intercept('PATCH', '**/rest/v1/projects*', (req) => {
      req.reply({
        statusCode: 200,
        body: [{ ...req.body, updated_at: new Date().toISOString() }],
      });
    }).as('mockUpdateProject');

    // Mock project delete (DELETE /rest/v1/projects)
    cy.intercept('DELETE', '**/rest/v1/projects*', {
      statusCode: 204,
    }).as('mockDeleteProject');
  }

  // Mock elements endpoint (GET /rest/v1/world_elements)
  if (fixtures?.elements !== undefined) {
    cy.intercept('GET', '**/rest/v1/world_elements*', {
      statusCode: 200,
      body: fixtures.elements,
      headers: {
        'Content-Range': `0-${fixtures.elements.length - 1}/${fixtures.elements.length}`,
      },
    }).as('mockGetElements');

    // Mock element creation (POST /rest/v1/world_elements)
    cy.intercept('POST', '**/rest/v1/world_elements', (req) => {
      req.reply({
        statusCode: 201,
        body: [{ ...req.body, id: `element-${Date.now()}`, created_at: new Date().toISOString() }],
      });
    }).as('mockCreateElement');

    // Mock element update (PATCH /rest/v1/world_elements)
    cy.intercept('PATCH', '**/rest/v1/world_elements*', (req) => {
      req.reply({
        statusCode: 200,
        body: [{ ...req.body, updated_at: new Date().toISOString() }],
      });
    }).as('mockUpdateElement');

    // Mock element delete (DELETE /rest/v1/world_elements)
    cy.intercept('DELETE', '**/rest/v1/world_elements*', {
      statusCode: 204,
    }).as('mockDeleteElement');
  }

  cy.log('✅ Supabase database mocked');
});

export {};
