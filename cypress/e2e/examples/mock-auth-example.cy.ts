/// <reference types="cypress" />

describe('Mock Auth Example', () => {
  beforeEach(() => {
    cy.comprehensiveDebug();
    cy.cleanMockAuth();
  });

  it('should authenticate with mocked Supabase', () => {
    cy.mockSupabaseAuth({
      email: 'example@test.com',
      username: 'exampleuser',
    });

    cy.visit('/login');

    // Simulate login form submission
    cy.get('[data-cy="email-input"]').type('example@test.com');
    cy.get('[data-cy="password-input"]').type('password123');
    cy.get('[data-cy="submit-button"]').click();

    // Wait for mock login
    cy.wait('@mockAuthLogin');

    // Should redirect to dashboard
    cy.url().should('include', '/dashboard');
  });

  it('should handle login error states', () => {
    // Mock auth error
    cy.mockSupabaseError('**/auth/v1/token*', 'auth');

    cy.visit('/login');
    cy.get('[data-cy="email-input"]').type('wrong@example.com');
    cy.get('[data-cy="password-input"]').type('wrongpassword');
    cy.get('[data-cy="submit-button"]').click();

    cy.wait('@mockError-auth');

    // Should show error message
    cy.get('[data-cy="error-message"]').should('be.visible');
    cy.get('[data-cy="error-message"]').should('contain', 'Invalid');
  });

  it('should mock database with fixtures', () => {
    cy.mockSupabaseAuth();

    // Load fixtures
    cy.fixture('mock-projects').then((projects) => {
      cy.mockSupabaseDatabase({ projects });
    });

    cy.visit('/projects');

    // Wait for mock data load
    cy.wait('@mockGetProjects');

    // Verify projects displayed
    cy.get('[data-cy="projects-list"]').should('contain', 'Test Fantasy World');
    cy.get('[data-cy="projects-list"]').should('contain', 'Dragon Realm');
  });

  it('should mock project creation', () => {
    cy.mockSupabaseAuth();
    cy.mockSupabaseDatabase({ projects: [] });

    cy.visit('/projects');

    // Create new project
    cy.get('[data-cy="new-project-button"]').click();
    cy.get('[data-cy="project-name-input"]').type('New Mocked Project');
    cy.get('[data-cy="project-description-input"]').type('Created via mock');
    cy.get('[data-cy="save-project-button"]').click();

    // Wait for mock creation
    cy.wait('@mockCreateProject');

    // Should show success message
    cy.get('[data-cy="success-message"]').should('be.visible');
  });
});
