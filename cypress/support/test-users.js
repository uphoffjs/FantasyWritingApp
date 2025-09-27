/**
 * Test User Management
 *
 * Centralized test user configuration and management
 * Following Cypress best practices for user authentication
 */

// * Test user configurations
export const TEST_USERS = {
  // * Standard test user
  standard: {
    email: 'test@example.com',
    password: 'Test123!@#',
    name: 'Test User',
    role: 'user'
  },

  // * Admin user for elevated permissions
  admin: {
    email: 'admin@example.com',
    password: 'Admin123!@#',
    name: 'Admin User',
    role: 'admin'
  },

  // * Premium user with additional features
  premium: {
    email: 'premium@example.com',
    password: 'Premium123!@#',
    name: 'Premium User',
    role: 'premium'
  },

  // * New user for registration tests
  newUser: () => ({
    email: `newuser${Date.now()}@example.com`,
    password: 'NewUser123!@#',
    name: `New User ${Date.now()}`,
    role: 'user'
  }),

  // * User with existing data
  withData: {
    email: 'datauser@example.com',
    password: 'Data123!@#',
    name: 'User With Data',
    role: 'user',
    hasProjects: true,
    projectCount: 5,
    elementCount: 25
  }
};

/**
 * Create and authenticate a test user
 * Uses cy.session() for efficient auth caching
 */
export function authenticateUser(userType = 'standard') {
  const user = typeof userType === 'string' ? TEST_USERS[userType] : userType;

  // * Use session to cache authentication
  cy.session(
    [user.email, user.role], // Unique key for this session
    () => {
      // * Setup function - runs once per unique key
      cy.visit('/login');

      // * Fill login form
      cy.get('[data-cy="email-input"]').type(user.email);
      cy.get('[data-cy="password-input"]').type(user.password);
      cy.get('[data-cy="login-button"]').click();

      // * Wait for successful login
      cy.url().should('not.include', '/login');
      cy.getCookie('auth-token').should('exist');

      // * Store user data for later use
      window.localStorage.setItem('currentUser', JSON.stringify(user));
    },
    {
      // * Validation function - checks if session is still valid
      validate() {
        cy.getCookie('auth-token').should('exist');

        // * Optional: Check API endpoint to verify token
        cy.request({
          url: '/api/auth/verify',
          failOnStatusCode: false
        }).then((response) => {
          expect(response.status).to.eq(200);
        });
      },
      // * Cache across test files in same spec run
      cacheAcrossSpecs: true
    }
  );

  // * Return to ensure we're on the right page after session restore
  cy.visit('/');

  return user;
}

/**
 * Create a new user via API
 * Faster than UI registration for test setup
 */
export function createUserViaAPI(userData = {}) {
  const user = {
    ...TEST_USERS.newUser(),
    ...userData
  };

  return cy.request('POST', '/api/auth/register', user).then((response) => {
    expect(response.status).to.eq(201);
    return response.body;
  });
}

/**
 * Create user with seeded data
 * Useful for tests that need existing content
 */
export function createUserWithData(options = {}) {
  const {
    projectCount = 3,
    elementsPerProject = 5,
    storiesCount = 2
  } = options;

  // * Create user
  return createUserViaAPI().then((user) => {
    // * Create projects
    const projects = Array.from({ length: projectCount }, (_, i) => ({
      name: `Project ${i + 1}`,
      userId: user.id
    }));

    cy.task('db:seed', { projects }).then((result) => {
      // * Create elements for each project
      projects.forEach((project, projectIndex) => {
        const elements = Array.from({ length: elementsPerProject }, (_, i) => ({
          name: `Element ${i + 1}`,
          projectId: project.id,
          type: ['character', 'location', 'item'][i % 3]
        }));

        cy.task('db:createElements', elements);
      });

      // * Create stories if requested
      if (storiesCount > 0) {
        const stories = Array.from({ length: storiesCount }, (_, i) => ({
          title: `Story ${i + 1}`,
          userId: user.id
        }));

        cy.task('db:seed', { stories });
      }
    });

    return user;
  });
}

/**
 * Switch between users in same test
 * Useful for multi-user interaction tests
 */
export function switchUser(userType) {
  // * Clear current session
  cy.clearCookies();
  cy.clearLocalStorage();

  // * Authenticate as new user
  return authenticateUser(userType);
}

/**
 * Logout current user
 */
export function logout() {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.visit('/');
}

/**
 * Get current user data
 */
export function getCurrentUser() {
  return cy.window().then((win) => {
    const userStr = win.localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  });
}

/**
 * Custom command to simplify user auth in tests
 */
Cypress.Commands.add('loginAs', (userType = 'standard') => {
  return authenticateUser(userType);
});

/**
 * Custom command to create user with data
 */
Cypress.Commands.add('createTestUser', (options = {}) => {
  return createUserWithData(options);
});

/**
 * Custom command to switch users
 */
Cypress.Commands.add('switchToUser', (userType) => {
  return switchUser(userType);
});

/**
 * Custom command to logout
 */
Cypress.Commands.add('logout', () => {
  return logout();
});

// * Export utility functions for use in tests
export default {
  TEST_USERS,
  authenticateUser,
  createUserViaAPI,
  createUserWithData,
  switchUser,
  logout,
  getCurrentUser
};