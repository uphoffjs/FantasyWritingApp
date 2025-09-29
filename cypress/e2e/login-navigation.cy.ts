// * Login Page Navigation E2E Tests - Following Cypress Best Practices
// ! NO CONDITIONAL STATEMENTS - Tests are deterministic

describe('Authentication Navigation', function() {
  // ! MANDATORY: Use function() syntax for access to this.currentTest
  beforeEach(function() {
    // * Comprehensive debugging for all tests
    cy.comprehensiveDebug();
    
    // * Clean all state for deterministic testing
    cy.cleanState();
    
    // * Log test initialization
    cy.task('log', '========================================');
    cy.task('log', `Starting test: ${this.currentTest?.title}`);
    cy.task('log', '========================================');
  });
  
  // ! NOTE: Failure handling is done globally in cypress/support/e2e.ts
  // ! Following Cypress best practices - no conditional statements in tests

  describe('Unauthenticated User Flow', () => {
    beforeEach(() => {
    // * Using cy.session() for authentication caching
      // * Ensure user is NOT authenticated
      cy.window().then((win) => {
        win.localStorage.clear();
        win.sessionStorage.clear();
      });
      cy.clearCookies();
      
      // * Set viewport for React Native Web
      cy.viewport('iphone-x');
      cy.task('log', 'Viewport set to iPhone X (375x812)');
    });
    
    it('should show login page when visiting root unauthenticated', () => {
      // * Visit root page
      cy.task('log', 'Visiting root page as unauthenticated user...');
      cy.visit('http://localhost:3002');
      
      // * Assert we're redirected to login
      // ! No conditionals - we EXPECT to be on login page
      cy.url().should('include', '/login');
      cy.task('log', 'Successfully redirected to login page');
      
      // * Verify login page elements exist
      // ! No conditionals - these elements MUST exist
      cy.get('[data-cy="login-page"]').should('exist');
      cy.get('[data-cy="email-input"]').should('be.visible');
      cy.get('[data-cy="password-input"]').should('be.visible');
      cy.get('[data-cy="login-button"]').should('be.visible');
    });
    
    it('should display login form with proper elements', () => {
      // * Navigate directly to login
      cy.task('log', 'Navigating directly to login page...');
      cy.visit('http://localhost:3002/login');
      
      // * Assert all required elements are present
      // ! No conditionals - deterministic expectations
      cy.get('[data-cy="login-page"]').should('exist');
      cy.get('[data-cy="email-input"]')
        .should('be.visible')
        .should('have.attr', 'type', 'email');
      cy.get('[data-cy="password-input"]')
        .should('be.visible')
        .should('have.attr', 'type', 'password');
      cy.get('[data-cy="login-button"]')
        .should('be.visible')
        .should('be.enabled');
      
      // * Optional: Check for additional elements if they should exist
      cy.get('[data-cy="forgot-password-link"]').should('exist');
      cy.get('[data-cy="signup-link"]').should('exist');
    });
    
    it('should prevent access to protected routes when unauthenticated', () => {
      // * Try to access protected route
      cy.task('log', 'Attempting to access protected dashboard route...');
      cy.visit('http://localhost:3002/dashboard');
      
      // * Assert redirect to login
      // ! No conditionals - we MUST be redirected
      cy.url().should('include', '/login');
      cy.get('[data-cy="login-page"]').should('exist');
      
      // * Verify error message or redirect notice if applicable
      cy.get('[data-cy="auth-required-message"]').should('be.visible');
    });
  });

  describe('Authenticated User Flow', () => {
    beforeEach(() => {
    // * Using cy.session() for authentication caching
      // * Set up authenticated state deterministically
      cy.apiLogin('test@example.com', 'testpassword123'); // Custom command that sets up auth state
      
      // * Set viewport
      cy.viewport('iphone-x');
      cy.task('log', 'User authenticated via cy.apiLogin('test@example.com', 'testpassword123')');
    });
    
    it('should show dashboard when visiting root authenticated', () => {
      // * Visit root as authenticated user
      cy.task('log', 'Visiting root page as authenticated user...');
      cy.visit('http://localhost:3002');
      
      // * Assert we see dashboard, not login
      // ! No conditionals - deterministic expectation
      cy.url().should('not.include', '/login');
      cy.get('[data-cy="dashboard"]').should('be.visible');
      cy.get('[data-cy="user-menu"]').should('be.visible');
    });
    
    it('should redirect from login to dashboard when already authenticated', () => {
      // * Try to visit login when already authenticated
      cy.task('log', 'Attempting to visit login while authenticated...');
      cy.visit('http://localhost:3002/login');
      
      // * Assert redirect to dashboard
      // ! No conditionals - must redirect authenticated users
      cy.url().should('include', '/dashboard');
      cy.get('[data-cy="dashboard"]').should('be.visible');
    });
    
    it('should allow access to protected routes when authenticated', () => {
      // * Visit protected route
      cy.task('log', 'Accessing protected profile route...');
      cy.visit('http://localhost:3002/profile');
      
      // * Assert access granted
      // ! No conditionals - deterministic access control
      cy.url().should('include', '/profile');
      cy.get('[data-cy="profile-page"]').should('be.visible');
      cy.get('[data-cy="user-info"]').should('be.visible');
    });
  });

  describe('Login Form Interactions', () => {
    beforeEach(() => {
    // * Using cy.session() for authentication caching
      // * Ensure clean state and visit login
      cy.clearCookies();
      cy.clearLocalStorage();
      cy.visit('http://localhost:3002/login');
      cy.viewport('iphone-x');
    });
    
    it('should show validation errors for empty form submission', () => {
      // * Try to submit empty form
      cy.task('log', 'Submitting empty login form...');
      cy.get('[data-cy="login-button"]').click();
      
      // * Assert validation errors appear
      // ! No conditionals - validation MUST work
      cy.get('[data-cy="email-error"]')
        .should('be.visible')
        .should('contain', 'Email is required');
      cy.get('[data-cy="password-error"]')
        .should('be.visible')
        .should('contain', 'Password is required');
    });
    
    it('should show error for invalid email format', () => {
      // * Enter invalid email
      cy.task('log', 'Testing email validation...');
      cy.get('[data-cy="email-input"]').type('invalid-email');
      cy.get('[data-cy="password-input"]').type('password123');
      cy.get('[data-cy="login-button"]').click();
      
      // * Assert email validation error
      // ! No conditionals - validation is deterministic
      cy.get('[data-cy="email-error"]')
        .should('be.visible')
        .should('contain', 'Enter a valid email');
    });
    
    it('should successfully log in with valid credentials', () => {
      // * Enter valid credentials
      cy.task('log', 'Logging in with valid credentials...');
      cy.get('[data-cy="email-input"]').type('test@example.com');
      cy.get('[data-cy="password-input"]').type('testpassword123');
      cy.get('[data-cy="login-button"]').click();
      
      // * Assert successful login
      // ! No conditionals - login must succeed with valid credentials
      cy.url().should('include', '/dashboard');
      cy.get('[data-cy="dashboard"]').should('be.visible');
      cy.get('[data-cy="welcome-message"]').should('contain', 'Welcome');
      
      // * Verify auth token is stored
      cy.window().then((win) => {
        const token = win.localStorage.getItem('authToken');
        expect(token).to.not.be.null;
      });
    });
    
    it('should show error for invalid credentials', () => {
      // * Enter invalid credentials
      cy.task('log', 'Testing invalid credentials...');
      cy.get('[data-cy="email-input"]').type('wrong@example.com');
      cy.get('[data-cy="password-input"]').type('wrongpassword');
      cy.get('[data-cy="login-button"]').click();
      
      // * Assert error message
      // ! No conditionals - error must appear for bad credentials
      cy.get('[data-cy="login-error"]')
        .should('be.visible')
        .should('contain', 'Invalid email or password');
      
      // * Verify we stay on login page
      cy.url().should('include', '/login');
      cy.get('[data-cy="login-page"]').should('exist');
    });
  });

  describe('Logout Flow', () => {
    beforeEach(() => {
    // * Using cy.session() for authentication caching
      // * Start as authenticated user
      cy.apiLogin('test@example.com', 'testpassword123');
      cy.visit('http://localhost:3002/dashboard');
      cy.viewport('iphone-x');
    });
    
    it('should successfully log out user', () => {
      // * Perform logout
      cy.task('log', 'Testing logout functionality...');
      cy.get('[data-cy="user-menu"]').click();
      cy.get('[data-cy="logout-button"]').click();
      
      // * Assert logout successful
      // ! No conditionals - logout must work
      cy.url().should('include', '/login');
      cy.get('[data-cy="login-page"]').should('exist');
      
      // * Verify auth token is removed
      cy.window().then((win) => {
        const token = win.localStorage.getItem('authToken');
        expect(token).to.be.null;
      });
    });
    
    it('should redirect to login when accessing protected route after logout', () => {
      // * Log out first
      cy.task('log', 'Logging out...');
      cy.get('[data-cy="user-menu"]').click();
      cy.get('[data-cy="logout-button"]').click();
      
      // * Try to access protected route
      cy.task('log', 'Attempting to access dashboard after logout...');
      cy.visit('http://localhost:3002/dashboard');
      
      // * Assert redirect to login
      // ! No conditionals - must redirect after logout
      cy.url().should('include', '/login');
      cy.get('[data-cy="login-page"]').should('exist');
      cy.get('[data-cy="auth-required-message"]').should('be.visible');
    });
  });

  describe('Session Management', () => {
    it('should persist login across page refreshes', () => {
      // * Log in
      cy.visit('http://localhost:3002/login');
      cy.get('[data-cy="email-input"]').type('test@example.com');
      cy.get('[data-cy="password-input"]').type('testpassword123');
      cy.get('[data-cy="login-button"]').click();
      
      // * Wait for dashboard
      cy.url().should('include', '/dashboard');
      
      // * Refresh page
      cy.task('log', 'Refreshing page to test session persistence...');
      cy.reload();
      
      // * Assert still authenticated
      // ! No conditionals - session must persist
      cy.url().should('include', '/dashboard');
      cy.get('[data-cy="dashboard"]').should('be.visible');
      cy.get('[data-cy="user-menu"]').should('be.visible');
    });
    
    it('should handle expired sessions gracefully', () => {
      // * Set up expired session
      cy.window().then((win) => {
        // * Set expired auth token
        win.localStorage.setItem('authToken', 'expired-token');
        win.localStorage.setItem('tokenExpiry', '2020-01-01');
      });
      
      // * Try to access protected route
      cy.task('log', 'Testing expired session handling...');
      cy.visit('http://localhost:3002/dashboard');
      
      // * Assert redirect to login with message
      // ! No conditionals - expired sessions must redirect
      cy.url().should('include', '/login');
      cy.get('[data-cy="session-expired-message"]')
        .should('be.visible')
        .should('contain', 'Session expired');
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should display login page correctly on mobile (iPhone X)', () => {
      // * Set mobile viewport
      cy.viewport('iphone-x');
      cy.visit('http://localhost:3002/login');
      
      // * Assert responsive layout for mobile
      // ! No conditionals - deterministic mobile layout
      cy.get('[data-cy="login-page"]').should('be.visible');
      cy.get('[data-cy="email-input"]').should('be.visible');
      cy.get('[data-cy="password-input"]').should('be.visible');
      cy.get('[data-cy="login-button"]').should('be.visible');
      
      // * Mobile-specific elements
      cy.get('[data-cy="mobile-header"]').should('be.visible');
      cy.get('[data-cy="desktop-header"]').should('not.exist');
    });
    
    it('should display login page correctly on tablet (iPad)', () => {
      // * Set tablet viewport
      cy.viewport('ipad-2');
      cy.visit('http://localhost:3002/login');
      
      // * Assert responsive layout for tablet
      // ! No conditionals - deterministic tablet layout
      cy.get('[data-cy="login-page"]').should('be.visible');
      cy.get('[data-cy="email-input"]').should('be.visible');
      cy.get('[data-cy="password-input"]').should('be.visible');
      cy.get('[data-cy="login-button"]').should('be.visible');
      
      // * Tablet may show either mobile or desktop header depending on design
      cy.get('[data-cy="tablet-layout"]').should('be.visible');
    });
    
    it('should display login page correctly on desktop (MacBook)', () => {
      // * Set desktop viewport
      cy.viewport('macbook-15');
      cy.visit('http://localhost:3002/login');
      
      // * Assert responsive layout for desktop
      // ! No conditionals - deterministic desktop layout
      cy.get('[data-cy="login-page"]').should('be.visible');
      cy.get('[data-cy="email-input"]').should('be.visible');
      cy.get('[data-cy="password-input"]').should('be.visible');
      cy.get('[data-cy="login-button"]').should('be.visible');
      
      // * Desktop-specific elements
      cy.get('[data-cy="desktop-header"]').should('be.visible');
      cy.get('[data-cy="mobile-header"]').should('not.exist');
    });
  });

  describe('Error Recovery', () => {
    it('should handle network errors gracefully', () => {
      // * Intercept and fail login request
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('loginError');
      
      // * Attempt login
      cy.visit('http://localhost:3002/login');
      cy.get('[data-cy="email-input"]').type('test@example.com');
      cy.get('[data-cy="password-input"]').type('password123');
      cy.get('[data-cy="login-button"]').click();
      
      // * Wait for error response
      cy.wait('@loginError');
      
      // * Assert error handling
      // ! No conditionals - error handling is deterministic
      cy.get('[data-cy="error-message"]')
        .should('be.visible')
        .should('contain', 'Something went wrong');
      cy.get('[data-cy="retry-button"]').should('be.visible');
    });
    
    it('should handle timeout errors', () => {
      // * Intercept and delay login request
      cy.intercept('POST', '/api/auth/login', (req) => {
        req.reply((res) => {
          // * Delay response to trigger timeout
          res.delay(30000);
          res.send({ statusCode: 200 });
        });
      }).as('loginTimeout');
      
      // * Attempt login
      cy.visit('http://localhost:3002/login');
      cy.get('[data-cy="email-input"]').type('test@example.com');
      cy.get('[data-cy="password-input"]').type('password123');
      cy.get('[data-cy="login-button"]').click();
      
      // * Assert timeout handling (assuming 10s timeout)
      // ! No conditionals - timeout behavior is predictable
      cy.get('[data-cy="timeout-error"]', { timeout: 15000 })
        .should('be.visible')
        .should('contain', 'Request timed out');
    });
  });
});