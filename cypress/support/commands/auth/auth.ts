// * Authentication-related Cypress commands
// ! All commands use data-cy attributes for consistency

// * Test users configuration for role-based testing
const testUsers = {
  admin: { email: 'admin@test.com', password: 'admin123', role: 'admin' },
  editor: { email: 'editor@test.com', password: 'editor123', role: 'editor' },
  viewer: { email: 'viewer@test.com', password: 'viewer123', role: 'viewer' },
  user: { email: 'user@test.com', password: 'user123', role: 'user' }
};

/**
 * Login command - Logs in a user with the specified credentials
 * @param email - User email address
 * @param password - User password
 */
Cypress.Commands.add('login', (email = 'test@example.com', password = 'testpassword123') => {
  // * Navigate to login page
  cy.visit('/login');
  
  // * Enter credentials
  cy.get('[data-cy="email-input"]').type(email);
  cy.get('[data-cy="password-input"]').type(password);
  
  // * Submit login form
  cy.get('[data-cy="login-button"]').click();
  
  // * Verify successful login
  cy.get('[data-cy="home-screen"]').should('be.visible');
  
  // * Store auth state for reuse
  cy.window().its('localStorage.authToken').should('exist');
});

/**
 * Logout command - Logs out the current user
 */
Cypress.Commands.add('logout', () => {
  // * Open menu
  cy.get('[data-cy="menu-button"]').click();
  
  // * Click logout
  cy.get('[data-cy="logout-button"]').click();
  
  // * Verify logout successful
  cy.get('[data-cy="login-screen"]').should('be.visible');
  
  // * Verify auth token removed
  cy.window().then((win) => {
    expect(win.localStorage.getItem('authToken')).to.be.null;
  });
});

/**
 * Quick login via API - PRIMARY METHOD (Faster than UI login)
 * @param email - User email
 * @param password - User password
 */
Cypress.Commands.add('apiLogin', (email = 'test@example.com', password = 'testpassword123') => {
  // * Use session caching for API login too
  cy.session(
    ['api', email],
    () => {
      // * Make API request to login endpoint
      cy.request('POST', '/api/auth/login', {
        email,
        password
      }).then((response) => {
        // * Store auth token and user data in window
        // ! Fixed: Direct localStorage access without cy commands
        cy.window().then((win) => {
          win.localStorage.setItem('authToken', response.body.token);
          win.localStorage.setItem('userData', JSON.stringify(response.body.user));
          win.localStorage.setItem('userRole', response.body.user.role || 'user');
        });
      });
    },
    {
      // * Validate session is still valid
      validate() {
        cy.window().then((win) => {
          const token = win.localStorage.getItem('authToken');
          expect(token, 'Auth token should exist').to.not.be.null;

          // * Verify token hasn't expired (if JWT format)
          if (token) {
            try {
              const payload = JSON.parse(atob(token.split('.')[1]));
              if (payload.exp) {
                expect(payload.exp * 1000, 'Token should not be expired').to.be.greaterThan(Date.now());
              }
            } catch (e) {
              // * Not a JWT token, just verify it exists
            }
          }
        });
      },
      // ! CRITICAL: Enable caching across test files for performance
      cacheAcrossSpecs: true
    }
  );
});

/**
 * Session-based login with caching
 * @param email - User email
 * @param password - User password (optional)
 */
Cypress.Commands.add('sessionLogin', (email = 'test@example.com', password = 'testpassword123') => {
  cy.session(
    email,
    () => {
      // * Login flow
      cy.visit('/login');
      cy.get('[data-cy="email-input"]').type(email);
      cy.get('[data-cy="password-input"]').type(password);
      cy.get('[data-cy="login-button"]').click();

      // * Wait for redirect
      cy.url().should('not.include', '/login');
    },
    {
      // * Validate session is still valid with token expiry check
      validate() {
        cy.window().then((win) => {
          const token = win.localStorage.getItem('authToken');
          expect(token, 'Auth token should exist').to.not.be.null;

          // * Verify token hasn't expired (if JWT format)
          if (token) {
            try {
              const payload = JSON.parse(atob(token.split('.')[1]));
              if (payload.exp) {
                expect(payload.exp * 1000, 'Token should not be expired').to.be.greaterThan(Date.now());
              }
            } catch (e) {
              // * Not a JWT token, just verify it exists
            }
          }
        });
      },
      // ! CRITICAL: Enable caching across test files for performance
      cacheAcrossSpecs: true
    }
  );
});

/**
 * Role-based login helper - Login as a specific user type
 * @param userType - Type of user: 'admin', 'editor', 'viewer', or 'user'
 */
Cypress.Commands.add('loginAs', (userType: 'admin' | 'editor' | 'viewer' | 'user') => {
  const user = testUsers[userType];

  if (!user) {
    throw new Error(`Unknown user type: ${userType}`);
  }

  // * Use session caching with role-based identification
  cy.session(
    ['role', userType, user.email],
    () => {
      // * Use API login for speed
      cy.request('POST', '/api/auth/login', {
        email: user.email,
        password: user.password
      }).then((response) => {
        cy.window().then((win) => {
          win.localStorage.setItem('authToken', response.body.token);
          win.localStorage.setItem('userData', JSON.stringify(response.body.user));
          win.localStorage.setItem('userRole', user.role);
        });
      });
    },
    {
      // * Validate session and role
      validate() {
        cy.window().then((win) => {
          const role = win.localStorage.getItem('userRole');
          expect(role, `User should have ${userType} role`).to.equal(user.role);

          const token = win.localStorage.getItem('authToken');
          expect(token, 'Auth token should exist').to.not.be.null;

          // * Verify token hasn't expired (if JWT format)
          if (token) {
            try {
              const payload = JSON.parse(atob(token.split('.')[1]));
              if (payload.exp) {
                expect(payload.exp * 1000, 'Token should not be expired').to.be.greaterThan(Date.now());
              }
            } catch (e) {
              // * Not a JWT token, just verify it exists
            }
          }
        });
      },
      // ! CRITICAL: Enable caching across test files for performance
      cacheAcrossSpecs: true
    }
  );
});

// * Export empty object to prevent TS errors
export {};
// TypeScript declarations
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /**
       * API-based login using cy.request() (faster than UI)
       * @param email - User email
       * @param password - User password
       * @example
       * cy.apiLogin('test@example.com', 'testpassword123');
       */
      apiLogin(email?: string, password?: string): Chainable<void>;

      /**
       * Login as a specific user type with predefined credentials
       * @param userType - Type of user to login as
       * @example
       * cy.loginAs('admin');
       */
      loginAs(userType: 'admin' | 'editor' | 'viewer' | 'user'): Chainable<void>;
    }
  }
}
