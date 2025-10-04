// * Core project commands for FantasyWritingApp
// ! All commands follow Cypress best practices with data-cy selectors

/**
 * Create a new project
 * @param name - Project name
 * @param description - Optional project description
 * @param genre - Optional genre
 * @example cy.createProject('My Fantasy Novel', 'Epic fantasy story', 'Fantasy')
 */
Cypress.Commands.add('createProject', (
  name: string,
  description?: string,
  genre?: string
) => {
  cy.task('log', `Creating project: ${name}`);

  // * Open create project modal
  cy.get('[data-cy="create-project-button"]').click();

  // * Enter project details
  cy.get('[data-cy="project-name-input"]').type(name);

  if (description) {
    cy.get('[data-cy="project-description-input"]').type(description);
  }

  if (genre) {
    cy.get('[data-cy="project-genre-selector"]').click();
    cy.get(`[data-cy="genre-option-${genre}"]`).click();
  }

  // * Save the project
  cy.get('[data-cy="save-project-button"]').click();

  // * Verify project was created
  cy.get('[data-cy="toast-success"]').should('contain', 'Project created successfully');

  cy.task('log', `Project created: ${name}`);
});

/**
 * Open a project
 * @param name - Project name to open
 * @example cy.openProject('My Fantasy Novel')
 */
Cypress.Commands.add('openProject', (name: string) => {
  cy.task('log', `Opening project: ${name}`);

  // * Click on project card
  cy.get(`[data-cy="project-card-${name}"]`).click();

  // * Wait for project to load
  cy.get('[data-cy="project-workspace"]').should('be.visible');
  cy.get('[data-cy="project-title"]').should('contain', name);

  cy.task('log', `Project opened: ${name}`);
});

/**
 * Delete a project
 * @param name - Project name to delete
 * @example cy.deleteProject('Old Project')
 */
Cypress.Commands.add('deleteProject', (name: string) => {
  cy.task('log', `Deleting project: ${name}`);

  // * Open project options
  cy.get(`[data-cy="project-card-${name}"]`)
    .find('[data-cy="project-options"]')
    .click();

  // * Click delete option
  cy.get('[data-cy="delete-project-option"]').click();

  // * Confirm deletion
  cy.get('[data-cy="confirm-delete-project"]').click();

  // * Verify deletion
  cy.get('[data-cy="toast-success"]').should('contain', 'Project deleted');
  cy.get(`[data-cy="project-card-${name}"]`).should('not.exist');

  cy.task('log', `Project deleted: ${name}`);
});

/**
 * Edit project details
 * @param name - Current project name
 * @param updates - Object with properties to update
 * @example cy.editProject('My Novel', { name: 'My Epic Novel', genre: 'Epic Fantasy' })
 */
Cypress.Commands.add('editProject', (
  name: string,
  updates: {
    name?: string;
    description?: string;
    genre?: string;
    status?: 'draft' | 'in-progress' | 'review' | 'completed';
  }
) => {
  cy.task('log', `Editing project: ${name}`);

  // * Open project edit modal
  cy.get(`[data-cy="project-card-${name}"]`)
    .find('[data-cy="project-options"]')
    .click();
  cy.get('[data-cy="edit-project-option"]').click();

  // * Update properties
  if (updates.name) {
    cy.get('[data-cy="project-name-input"]').clear().type(updates.name);
  }

  if (updates.description) {
    cy.get('[data-cy="project-description-input"]').clear().type(updates.description);
  }

  if (updates.genre) {
    cy.get('[data-cy="project-genre-selector"]').click();
    cy.get(`[data-cy="genre-option-${updates.genre}"]`).click();
  }

  if (updates.status) {
    cy.get('[data-cy="project-status-selector"]').click();
    cy.get(`[data-cy="status-option-${updates.status}"]`).click();
  }

  // * Save changes
  cy.get('[data-cy="save-project-changes"]').click();

  // * Verify update
  cy.get('[data-cy="toast-success"]').should('contain', 'Project updated');

  cy.task('log', `Project updated: ${name}`);
});

/**
 * Add elements to a project
 * @param projectName - Project name
 * @param elementNames - Array of element names to add
 * @example cy.addElementsToProject('My Novel', ['Gandalf', 'Shire'])
 */
Cypress.Commands.add('addElementsToProject', (
  projectName: string,
  elementNames: string[]
) => {
  cy.task('log', `Adding ${elementNames.length} elements to project: ${projectName}`);

  // * Open project
  cy.openProject(projectName);

  // * Open element manager
  cy.get('[data-cy="manage-project-elements"]').click();

  // * Select elements to add
  elementNames.forEach(elementName => {
    cy.get('[data-cy="available-elements-list"]')
      .find(`[data-cy="element-option-${elementName}"]`)
      .click();
  });

  // * Add selected elements
  cy.get('[data-cy="add-elements-to-project"]').click();

  // * Verify elements were added
  cy.get('[data-cy="toast-success"]').should('contain', 'Elements added to project');

  elementNames.forEach(elementName => {
    cy.get('[data-cy="project-elements-list"]')
      .find(`[data-cy="project-element-${elementName}"]`)
      .should('exist');
  });

  cy.task('log', `Added ${elementNames.length} elements to project`);
});

/**
 * Remove elements from a project
 * @param projectName - Project name
 * @param elementNames - Array of element names to remove
 * @example cy.removeElementsFromProject('My Novel', ['Old Character'])
 */
Cypress.Commands.add('removeElementsFromProject', (
  projectName: string,
  elementNames: string[]
) => {
  cy.task('log', `Removing ${elementNames.length} elements from project: ${projectName}`);

  // * Open project
  cy.openProject(projectName);

  // * Open element manager
  cy.get('[data-cy="manage-project-elements"]').click();

  // * Select elements to remove
  elementNames.forEach(elementName => {
    cy.get('[data-cy="project-elements-list"]')
      .find(`[data-cy="project-element-${elementName}"]`)
      .find('[data-cy="remove-element"]')
      .click();
  });

  // * Confirm removal
  cy.get('[data-cy="confirm-remove-elements"]').click();

  // * Verify elements were removed
  cy.get('[data-cy="toast-success"]').should('contain', 'Elements removed');

  elementNames.forEach(elementName => {
    cy.get('[data-cy="project-elements-list"]')
      .find(`[data-cy="project-element-${elementName}"]`)
      .should('not.exist');
  });

  cy.task('log', `Removed ${elementNames.length} elements from project`);
});

/**
 * Set project as active/current
 * @param projectName - Project name to set as active
 * @example cy.setActiveProject('My Novel')
 */
Cypress.Commands.add('setActiveProject', (projectName: string) => {
  cy.task('log', `Setting active project: ${projectName}`);

  // * Open project options
  cy.get(`[data-cy="project-card-${projectName}"]`)
    .find('[data-cy="project-options"]')
    .click();

  // * Set as active
  cy.get('[data-cy="set-active-project-option"]').click();

  // * Verify it's active
  cy.get(`[data-cy="project-card-${projectName}"]`)
    .should('have.attr', 'data-active', 'true');

  cy.task('log', `Project set as active: ${projectName}`);
});

/**
 * Archive a project
 * @param projectName - Project name to archive
 * @example cy.archiveProject('Completed Novel')
 */
Cypress.Commands.add('archiveProject', (projectName: string) => {
  cy.task('log', `Archiving project: ${projectName}`);

  // * Open project options
  cy.get(`[data-cy="project-card-${projectName}"]`)
    .find('[data-cy="project-options"]')
    .click();

  // * Click archive option
  cy.get('[data-cy="archive-project-option"]').click();

  // * Confirm archive
  cy.get('[data-cy="confirm-archive-project"]').click();

  // * Verify archival
  cy.get('[data-cy="toast-success"]').should('contain', 'Project archived');
  cy.get(`[data-cy="project-card-${projectName}"]`).should('not.exist');

  cy.task('log', `Project archived: ${projectName}`);
});

/**
 * Duplicate a project
 * @param projectName - Project name to duplicate
 * @param newName - Name for the duplicated project
 * @example cy.duplicateProject('My Novel', 'My Novel - Copy')
 */
Cypress.Commands.add('duplicateProject', (
  projectName: string,
  newName: string
) => {
  cy.task('log', `Duplicating project: ${projectName} as ${newName}`);

  // * Open project options
  cy.get(`[data-cy="project-card-${projectName}"]`)
    .find('[data-cy="project-options"]')
    .click();

  // * Click duplicate option
  cy.get('[data-cy="duplicate-project-option"]').click();

  // * Enter new name
  cy.get('[data-cy="duplicate-project-name"]').type(newName);

  // * Confirm duplication
  cy.get('[data-cy="confirm-duplicate-project"]').click();

  // * Verify duplication
  cy.get('[data-cy="toast-success"]').should('contain', 'Project duplicated');
  cy.get(`[data-cy="project-card-${newName}"]`).should('exist');

  cy.task('log', `Project duplicated: ${projectName} → ${newName}`);
});

/**
 * Export project data
 * @param projectName - Project name to export
 * @param format - Export format
 * @example cy.exportProject('My Novel', 'json')
 */
Cypress.Commands.add('exportProject', (
  projectName: string,
  format: 'json' | 'markdown' | 'docx' = 'json'
) => {
  cy.task('log', `Exporting project: ${projectName} as ${format}`);

  // * Open project options
  cy.get(`[data-cy="project-card-${projectName}"]`)
    .find('[data-cy="project-options"]')
    .click();

  // * Click export option
  cy.get('[data-cy="export-project-option"]').click();

  // * Select format
  cy.get(`[data-cy="export-format-${format}"]`).click();

  // * Export
  cy.get('[data-cy="confirm-export-project"]').click();

  // * Verify export
  cy.get('[data-cy="toast-success"]').should('contain', 'Project exported');

  cy.task('log', `Project exported: ${projectName} as ${format}`);
});

// * Export empty object to prevent TS errors
export {};