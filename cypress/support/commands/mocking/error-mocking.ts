/// <reference types="cypress" />

/**
 * Mock Error Response Commands
 * Simulate error conditions for testing error handling
 */

/**
 * Mock Supabase error responses for testing error states
 * @param endpoint - The endpoint pattern to mock
 * @param errorType - Type of error to simulate
 * @example
 * ```typescript
 * cy.mockSupabaseError('** /auth/v1/token*', 'auth');
 * cy.mockSupabaseError('** /rest/v1/projects*', 'notFound');
 * ```
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

  const errorConfig = errors[errorType];

  cy.intercept('**/'+endpoint.replace(/^\*\*\//, ''), {
    statusCode: errorConfig.statusCode,
    body: errorConfig.body,
  }).as(`mock${errorType.charAt(0).toUpperCase() + errorType.slice(1)}Error`);

  cy.log(`🚨 Mocking ${errorType} error for ${endpoint}`);
});

export {};
