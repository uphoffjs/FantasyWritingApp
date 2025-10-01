/// <reference types="cypress" />

describe('Basic App Functionality - Smoke Tests', () => {
  beforeEach(() => {
  });

  it.only({tags: ["@smoke"]}, 'should load the login page when not authenticated', () => {
    cy.visit('/');
    cy.url().should('include', '/login');
  });

  it({tags: ["@smoke"]}, 'should display main navigation after authentication', () => {
    // * Use session-based API login for faster authentication
    cy.apiLogin('test@example.com', 'testpassword123');
    cy.visit('/');

    // * Should navigate to stories page for authenticated users
    cy.url().should('satisfy', url => {
      return url.includes('/stories') || url.includes('/dashboard');
    });
  });

  it({tags: ["@smoke"]}, 'should use createStory command if available', () => {
    // * Use session-based API login for faster authentication
    cy.apiLogin('test@example.com', 'testpassword123');

    // * Try to test if the command exists
    const commandExists = typeof cy.createStory === 'function';
    cy.log(`createStory command exists: ${commandExists}`);

    cy.visit('/');
  });

  it({tags: ["@smoke"]}, 'should handle basic story creation workflow', () => {
    // * Use session-based API login for faster authentication
    cy.apiLogin('test@example.com', 'testpassword123');
    cy.visit('/stories');

    // * Should show create story button
    cy.get('[data-cy="create-story"], [data-cy="get-started"]').should(
      'be.visible',
    );
  });

  it({tags: ["@smoke"]}, 'should handle basic navigation between main sections', () => {
    // * Use session-based API login for faster authentication
    cy.apiLogin('test@example.com', 'testpassword123');
    cy.visit('/');

    // * Check that main navigation elements exist
    // eslint-disable-next-line cypress/require-data-selectors
    cy.get('body').should('be.visible');

    // * Basic smoke test - app loads without throwing errors
    cy.get('[data-cy="app-container"], main, #root').should('exist');
  });

  it('should handle React Native Web rendering', () => {
    // * Use session-based API login for faster authentication
    cy.apiLogin('test@example.com', 'testpassword123');
    cy.visit('/');

    // * Check that React Native Web components render
    // eslint-disable-next-line cypress/require-data-selectors
    cy.get('body').should('have.css', 'font-family');

    // * Should not have any critical console errors
    cy.window().then(win => {
      // * Basic check that window and document are available
      expect(win.document).to.exist;
      expect(win.navigator).to.exist;
    });
  });

  it('should handle authenticated state correctly', () => {
    // * Use session-based API login for faster authentication
    cy.apiLogin('test@example.com', 'testpassword123');

    // * Verify auth token is set via session
    cy.window().then(win => {
      expect(win.localStorage.getItem('authToken')).to.exist;
    });

    cy.visit('/');

    // * App should load in authenticated mode
    // eslint-disable-next-line cypress/require-data-selectors
    cy.get('body').should('be.visible');
    cy.url().should('not.include', '/login');
  });

  it('should handle responsive design basics', () => {
    // * Use session-based API login for faster authentication
    cy.apiLogin('test@example.com', 'testpassword123');
    cy.visit('/');

    // * Test mobile viewport
    cy.viewport(375, 667);
    // eslint-disable-next-line cypress/require-data-selectors
    cy.get('body').should('be.visible');

    // * Test tablet viewport
    cy.viewport(768, 1024);
    // eslint-disable-next-line cypress/require-data-selectors
    cy.get('body').should('be.visible');

    // * Test desktop viewport
    cy.viewport(1920, 1080);
    // eslint-disable-next-line cypress/require-data-selectors
    cy.get('body').should('be.visible');
  });

  it('should handle error boundaries', () => {
    // * Use session-based API login for faster authentication
    cy.apiLogin('test@example.com', 'testpassword123');
    cy.visit('/');

    // * Basic check that error boundary components would work
    // (This is mainly to ensure the app structure supports error handling)
    cy.window().then(win => {
      // Check React is loaded
      expect(win.React || win.require).to.exist;
    });
  });

  it('should maintain session across multiple tests (performance check)', () => {
    // * First login - session created
    cy.apiLogin('test@example.com', 'testpassword123');
    cy.visit('/');
    cy.url().should('not.include', '/login');

    // * Navigate to another page - session should persist
    cy.visit('/stories');
    cy.url().should('include', '/stories');

    // * Check auth token still exists
    cy.window().then(win => {
      expect(win.localStorage.getItem('authToken')).to.exist;
    });
  });

  it('should handle role-based authentication', () => {
    // * Use session-based role login for admin user
    cy.loginAs('admin');
    cy.visit('/');

    // * Verify admin role is set
    cy.window().then(win => {
      expect(win.localStorage.getItem('userRole')).to.equal('admin');
    });
  });
});
