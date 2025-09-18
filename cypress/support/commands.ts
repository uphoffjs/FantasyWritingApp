// Custom Cypress commands for FantasyWritingApp

// ! SECURITY: * Authentication commands
Cypress.Commands.add('login', (email = 'test@example.com', password = 'testpassword123') => {
  cy.visit('/login');
  cy.get('[data-testid=email-input]').type(email);
  cy.get('[data-testid=password-input]').type(password);
  cy.get('[data-testid=login-button]').click();
  cy.get('[data-testid=home-screen]').should('be.visible');
});

Cypress.Commands.add('logout', () => {
  cy.get('[data-testid=menu-button]').click();
  cy.get('[data-testid=logout-button]').click();
  cy.get('[data-testid=login-screen]').should('be.visible');
});

// Story/Writing commands
Cypress.Commands.add('createStory', (title: string, genre = 'Fantasy') => {
  cy.get('[data-testid=create-story-button]').click();
  cy.get('[data-testid=story-title-input]').type(title);
  cy.get('[data-testid=story-genre-select]').select(genre);
  cy.get('[data-testid=create-story-submit]').click();
  cy.get('[data-testid=story-editor]').should('be.visible');
});

Cypress.Commands.add('openStory', (title: string) => {
  cy.get('[data-testid=stories-list]').should('be.visible');
  cy.get(`[data-testid=story-item-${title.toLowerCase().replace(/\s+/g, '-')}]`).click();
  cy.get('[data-testid=story-editor]').should('be.visible');
});

Cypress.Commands.add('saveStory', () => {
  cy.get('[data-testid=save-story-button]').click();
  cy.get('[data-testid=save-success-message]').should('be.visible');
});

// * Character commands
Cypress.Commands.add('createCharacter', (name: string, role = 'protagonist') => {
  cy.get('[data-testid=characters-tab]').click();
  cy.get('[data-testid=add-character-button]').click();
  cy.get('[data-testid=character-name-input]').type(name);
  cy.get('[data-testid=character-role-select]').select(role);
  cy.get('[data-testid=save-character-button]').click();
  cy.get(`[data-testid=character-${name.toLowerCase().replace(/\s+/g, '-')}]`).should('be.visible');
});

Cypress.Commands.add('editCharacter', (name: string) => {
  cy.get('[data-testid=characters-tab]').click();
  cy.get(`[data-testid=character-${name.toLowerCase().replace(/\s+/g, '-')}]`).click();
  cy.get('[data-testid=character-editor]').should('be.visible');
});

// * Navigation commands
Cypress.Commands.add('navigateToHome', () => {
  cy.get('[data-testid=home-nav]').click();
  cy.get('[data-testid=home-screen]').should('be.visible');
});

Cypress.Commands.add('navigateToStories', () => {
  cy.get('[data-testid=stories-nav]').click();
  cy.get('[data-testid=stories-screen]').should('be.visible');
});

Cypress.Commands.add('navigateToCharacters', () => {
  cy.get('[data-testid=characters-nav]').click();
  cy.get('[data-testid=characters-screen]').should('be.visible');
});

Cypress.Commands.add('navigateToSettings', () => {
  cy.get('[data-testid=settings-nav]').click();
  cy.get('[data-testid=settings-screen]').should('be.visible');
});

// * Utility commands
Cypress.Commands.add('waitForLoad', () => {
  cy.get('[data-testid=loading-indicator]').should('not.exist');
  cy.wait(500); // Small buffer for animations
});

Cypress.Commands.add('checkAccessibility', () => {
  cy.injectAxe();
  cy.checkA11y(null, {
    runOnly: {
      type: 'tag',
      values: ['wcag2a', 'wcag2aa']
    }
  });
});

// React Native Web compatibility command
// * This command tries multiple selector strategies to work with React Native Web's attribute handling
Cypress.Commands.add('getByTestId', (selector: string) => {
  // * Try multiple selector patterns for React Native Web compatibility
  return cy.get(
    `[data-testid="${selector}"], [data-testid="${selector}"], [testID="${selector}"]`
  );
});

// * Helper to check if an element exists with any of the test attributes
Cypress.Commands.add('shouldHaveTestAttr', (selector: string) => {
  cy.get('body').then(($body) => {
    const found = 
      $body.find(`[data-testid="${selector}"]`).length > 0 ||
      $body.find(`[data-testid="${selector}"]`).length > 0 ||
      $body.find(`[testID="${selector}"]`).length > 0;
    expect(found).to.be.true;
  });
});

// * Factory reset command for test data
Cypress.Commands.add('resetFactories', () => {
  // * Reset any test data factories to their initial state
  // * This is called in beforeEach hooks to ensure clean test state
  cy.window().then((win) => {
    // * Reset any global test data or factories stored on window
    if ((win as any).testFactories) {
      (win as any).testFactories = {};
    }
    // * Clear any localStorage/sessionStorage that might affect tests
    win.localStorage.clear();
    win.sessionStorage.clear();
  });
  
  // TODO: * Reset any fixture data
  cy.fixture('testData').then((data) => {
    // * Reset to default test data if needed
    cy.wrap(data).as('defaultTestData');
  });
});

// * Export to prevent TypeScript errors
export {};