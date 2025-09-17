// Custom Cypress commands for FantasyWritingApp

// Authentication commands
Cypress.Commands.add('login', (email = 'test@example.com', password = 'testpassword123') => {
  cy.visit('/login');
  cy.get('[data-cy=email-input]').type(email);
  cy.get('[data-cy=password-input]').type(password);
  cy.get('[data-cy=login-button]').click();
  cy.get('[data-cy=home-screen]').should('be.visible');
});

Cypress.Commands.add('logout', () => {
  cy.get('[data-cy=menu-button]').click();
  cy.get('[data-cy=logout-button]').click();
  cy.get('[data-cy=login-screen]').should('be.visible');
});

// Story/Writing commands
Cypress.Commands.add('createStory', (title: string, genre = 'Fantasy') => {
  cy.get('[data-cy=create-story-button]').click();
  cy.get('[data-cy=story-title-input]').type(title);
  cy.get('[data-cy=story-genre-select]').select(genre);
  cy.get('[data-cy=create-story-submit]').click();
  cy.get('[data-cy=story-editor]').should('be.visible');
});

Cypress.Commands.add('openStory', (title: string) => {
  cy.get('[data-cy=stories-list]').should('be.visible');
  cy.get(`[data-cy=story-item-${title.toLowerCase().replace(/\s+/g, '-')}]`).click();
  cy.get('[data-cy=story-editor]').should('be.visible');
});

Cypress.Commands.add('saveStory', () => {
  cy.get('[data-cy=save-story-button]').click();
  cy.get('[data-cy=save-success-message]').should('be.visible');
});

// Character commands
Cypress.Commands.add('createCharacter', (name: string, role = 'protagonist') => {
  cy.get('[data-cy=characters-tab]').click();
  cy.get('[data-cy=add-character-button]').click();
  cy.get('[data-cy=character-name-input]').type(name);
  cy.get('[data-cy=character-role-select]').select(role);
  cy.get('[data-cy=save-character-button]').click();
  cy.get(`[data-cy=character-${name.toLowerCase().replace(/\s+/g, '-')}]`).should('be.visible');
});

Cypress.Commands.add('editCharacter', (name: string) => {
  cy.get('[data-cy=characters-tab]').click();
  cy.get(`[data-cy=character-${name.toLowerCase().replace(/\s+/g, '-')}]`).click();
  cy.get('[data-cy=character-editor]').should('be.visible');
});

// Navigation commands
Cypress.Commands.add('navigateToHome', () => {
  cy.get('[data-cy=home-nav]').click();
  cy.get('[data-cy=home-screen]').should('be.visible');
});

Cypress.Commands.add('navigateToStories', () => {
  cy.get('[data-cy=stories-nav]').click();
  cy.get('[data-cy=stories-screen]').should('be.visible');
});

Cypress.Commands.add('navigateToCharacters', () => {
  cy.get('[data-cy=characters-nav]').click();
  cy.get('[data-cy=characters-screen]').should('be.visible');
});

Cypress.Commands.add('navigateToSettings', () => {
  cy.get('[data-cy=settings-nav]').click();
  cy.get('[data-cy=settings-screen]').should('be.visible');
});

// Utility commands
Cypress.Commands.add('waitForLoad', () => {
  cy.get('[data-cy=loading-indicator]').should('not.exist');
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
// This command tries multiple selector strategies to work with React Native Web's attribute handling
Cypress.Commands.add('getByDataCy', (selector: string) => {
  // Try multiple selector patterns for React Native Web compatibility
  return cy.get(
    `[data-cy="${selector}"], [data-testid="${selector}"], [testID="${selector}"]`
  );
});

// Helper to check if an element exists with any of the test attributes
Cypress.Commands.add('shouldHaveTestAttr', (selector: string) => {
  cy.get('body').then(($body) => {
    const found = 
      $body.find(`[data-cy="${selector}"]`).length > 0 ||
      $body.find(`[data-testid="${selector}"]`).length > 0 ||
      $body.find(`[testID="${selector}"]`).length > 0;
    expect(found).to.be.true;
  });
});

// Export to prevent TypeScript errors
export {};