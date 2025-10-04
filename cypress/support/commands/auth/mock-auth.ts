/// <reference types="cypress" />

/**
 * Mock Supabase Authentication Commands
 * Fast, isolated auth testing with cy.intercept()
 */

/**
 * Mock Supabase auth endpoints
 * @param user - Optional user data to mock
 * @example
 * cy.mockSupabaseAuth({ email: 'test@example.com', username: 'testuser' });
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
 * Clean mock auth state from localStorage
 * @example
 * cy.cleanMockAuth();
 */
Cypress.Commands.add('cleanMockAuth', () => {
  cy.window().then((win) => {
    win.localStorage.clear();
    cy.log('🧹 Mock auth state cleaned');
  });
});

export {};

// TypeScript declarations
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /**
       * Mock Supabase authentication endpoints with cy.intercept()
       * @param user - Optional user data to mock
       * @example
       * cy.mockSupabaseAuth({ email: 'test@example.com', username: 'testuser' });
       */
      mockSupabaseAuth(user?: {
        id?: string;
        email?: string;
        username?: string;
        display_name?: string;
      }): Chainable<void>;

      /**
       * Clean mock authentication state from localStorage
       * @example
       * cy.cleanMockAuth();
       */
      cleanMockAuth(): Chainable<void>;
    }
  }
}
