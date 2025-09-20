// * Authentication-related Cypress commands
// ! All commands use data-cy attributes for consistency

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
 * Quick login via API - Faster than UI login
 * @param email - User email
 * @param password - User password
 */
Cypress.Commands.add('apiLogin', (email = 'test@example.com', password = 'testpassword123') => {
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
    });
  });
});

/**
 * Session-based login with caching
 * @param email - User email
 */
Cypress.Commands.add('sessionLogin', (email = 'test@example.com') => {
  cy.session(
    email,
    () => {
      // * Login flow
      cy.visit('/login');
      cy.get('[data-cy="email-input"]').type(email);
      cy.get('[data-cy="password-input"]').type('testpassword123');
      cy.get('[data-cy="login-button"]').click();
      
      // * Wait for redirect
      cy.url().should('not.include', '/login');
    },
    {
      // * Validate session is still valid
      validate() {
        cy.window().then((win) => {
          const token = win.localStorage.getItem('authToken');
          expect(token).to.not.be.null;
        });
      }
    }
  );
});

// * Export empty object to prevent TS errors
export {};