// * Character-related Cypress commands

/**
 * Create a new character
 * @param name - Character name
 * @param role - Character role (default: protagonist)
 */
Cypress.Commands.add('createCharacter', (name: string, role = 'protagonist') => {
  cy.get('[data-cy="characters-tab"]').click();
  cy.get('[data-cy="add-character-button"]').click();
  cy.get('[data-cy="character-name-input"]').type(name);
  cy.get('[data-cy="character-role-select"]').select(role);
  cy.get('[data-cy="save-character-button"]').click();
  
  const characterId = name.toLowerCase().replace(/\s+/g, '-');
  cy.get(`[data-cy="character-${characterId}"]`).should('be.visible');
});

/**
 * Edit an existing character
 * @param name - Name of the character to edit
 */
Cypress.Commands.add('editCharacter', (name: string) => {
  cy.get('[data-cy="characters-tab"]').click();
  const characterId = name.toLowerCase().replace(/\s+/g, '-');
  cy.get(`[data-cy="character-${characterId}"]`).click();
  cy.get('[data-cy="character-editor"]').should('be.visible');
});

/**
 * Delete a character
 * @param name - Name of the character to delete
 */
Cypress.Commands.add('deleteCharacter', (name: string) => {
  const characterId = name.toLowerCase().replace(/\s+/g, '-');
  cy.get(`[data-cy="character-${characterId}"]`).rightclick();
  cy.get('[data-cy="delete-character-option"]').click();
  cy.get('[data-cy="confirm-delete-button"]').click();
  cy.get(`[data-cy="character-${characterId}"]`).should('not.exist');
});

/**
 * Add character description
 * @param name - Character name
 * @param description - Character description text
 */
Cypress.Commands.add('addCharacterDescription', (name: string, description: string) => {
  cy.editCharacter(name);
  cy.get('[data-cy="character-description-input"]').clear().type(description);
  cy.get('[data-cy="save-character-button"]').click();
  cy.get('[data-cy="save-success-message"]').should('be.visible');
});

// * Export empty object to prevent TS errors
export {};