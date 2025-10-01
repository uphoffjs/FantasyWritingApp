/// <reference types="cypress" />

/**
 * Mock Supabase authentication with cy.intercept()
 * Fast, isolated auth for UI and integration testing
 */

/**
 * Mock Supabase auth endpoints
 */
Cypress.Commands.add('mockSupabaseAuth', (user?: {
  id?: string;
  email?: string;
  username?: string;
  display_name?: string;
}) => {
  const mockUser = {
    id: user?.id || `mock-user-${Date.now()}`,
    email: user?.email || 'mock@example.com',
    email_confirmed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    user_metadata: {
      username: user?.username || 'mockuser',
      display_name: user?.display_name || 'Mock User',
    },
  };

  cy.log('🎭 Mocking Supabase auth for:', mockUser.email);

  // Mock login endpoint (POST /auth/v1/token)
  cy.intercept('POST', '**/auth/v1/token*', {
    statusCode: 200,
    body: {
      access_token: `mock-jwt-token-${Date.now()}`,
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      refresh_token: 'mock-refresh-token',
      user: mockUser,
    },
  }).as('mockAuthLogin');

  // Mock get user endpoint (GET /auth/v1/user)
  cy.intercept('GET', '**/auth/v1/user', {
    statusCode: 200,
    body: { user: mockUser },
  }).as('mockGetUser');

  // Mock signup endpoint (POST /auth/v1/signup)
  cy.intercept('POST', '**/auth/v1/signup', {
    statusCode: 200,
    body: {
      user: mockUser,
      session: {
        access_token: `mock-jwt-token-${Date.now()}`,
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'mock-refresh-token',
      },
    },
  }).as('mockSignup');

  // Mock logout endpoint (POST /auth/v1/logout)
  cy.intercept('POST', '**/auth/v1/logout', {
    statusCode: 204,
  }).as('mockLogout');

  // Mock password reset (POST /auth/v1/recover)
  cy.intercept('POST', '**/auth/v1/recover', {
    statusCode: 200,
  }).as('mockPasswordReset');

  // Set localStorage auth state (mimics Supabase client behavior)
  cy.window().then((win) => {
    const authKey = 'sb-mock-auth-token';
    win.localStorage.setItem(
      authKey,
      JSON.stringify({
        access_token: `mock-jwt-token-${Date.now()}`,
        token_type: 'bearer',
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        expires_in: 3600,
        refresh_token: 'mock-refresh-token',
        user: mockUser,
      })
    );
  });

  cy.log('✅ Supabase auth mocked');
});

/**
 * Clean mock auth state
 */
Cypress.Commands.add('cleanMockAuth', () => {
  cy.window().then((win) => {
    win.localStorage.clear();
    cy.log('🧹 Mock auth state cleaned');
  });
});

/**
 * Mock Supabase database endpoints
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

/**
 * Mock Supabase error responses
 * Use for testing error states
 */
Cypress.Commands.add('mockSupabaseError', (
  endpoint: string,
  errorType: 'auth' | 'network' | 'validation' | 'notFound'
) => {
  const errors = {
    auth: {
      statusCode: 401,
      body: {
        error: 'invalid_credentials',
        error_description: 'Invalid login credentials',
        message: 'Invalid login credentials',
      },
    },
    network: {
      statusCode: 500,
      body: {
        error: 'server_error',
        error_description: 'Internal server error',
        message: 'An unexpected error occurred',
      },
    },
    validation: {
      statusCode: 400,
      body: {
        error: 'validation_error',
        error_description: 'Invalid request parameters',
        message: 'Validation failed',
      },
    },
    notFound: {
      statusCode: 404,
      body: {
        error: 'not_found',
        error_description: 'Resource not found',
        message: 'The requested resource does not exist',
      },
    },
  };

  cy.intercept('*', endpoint, errors[errorType]).as(`mockError-${errorType}`);
  cy.log(`🎭 Mocking ${errorType} error for:`, endpoint);
});

export {};
