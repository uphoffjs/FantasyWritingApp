// * Navigation-related Cypress commands

/**
 * Navigate to home screen
 */
Cypress.Commands.add('navigateToHome', () => {
  cy.get('[data-cy="home-nav"]').click();
  cy.get('[data-cy="home-screen"]').should('be.visible');
});

/**
 * Navigate to stories screen
 */
Cypress.Commands.add('navigateToStories', () => {
  cy.get('[data-cy="stories-nav"]').click();
  cy.get('[data-cy="stories-screen"]').should('be.visible');
});

/**
 * Navigate to characters screen
 */
Cypress.Commands.add('navigateToCharacters', () => {
  cy.get('[data-cy="characters-nav"]').click();
  cy.get('[data-cy="characters-screen"]').should('be.visible');
});

/**
 * Navigate to settings screen
 */
Cypress.Commands.add('navigateToSettings', () => {
  cy.get('[data-cy="settings-nav"]').click();
  cy.get('[data-cy="settings-screen"]').should('be.visible');
});

/**
 * Navigate to a specific project
 * @param projectName - Name of the project to navigate to
 */
Cypress.Commands.add('navigateToProject', (projectName: string) => {
  cy.visit('/projects');
  cy.get(`[data-cy="project-card-${projectName.toLowerCase().replace(/\s+/g, '-')}"]`).click();
  cy.url().should('include', '/project/');
});

/**
 * Go back using navigation
 */
Cypress.Commands.add('goBack', () => {
  cy.get('[data-cy="back-button"]').click();
});

// * Export empty object to prevent TS errors
export {};