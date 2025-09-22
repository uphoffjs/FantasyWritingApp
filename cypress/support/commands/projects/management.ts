// * Project management commands for bulk operations
// ! All commands follow Cypress best practices with data-cy selectors

/**
 * Create multiple projects in batch
 * @param projects - Array of project data to create
 * @example cy.createMultipleProjects([{ name: 'Project 1', genre: 'Fantasy' }, { name: 'Project 2', genre: 'Sci-Fi' }])
 */
Cypress.Commands.add('createMultipleProjects', (
  projects: Array<{
    name: string;
    description?: string;
    genre?: string;
    status?: 'draft' | 'in-progress' | 'review' | 'completed';
  }>
) => {
  cy.task('log', `Creating ${projects.length} projects in batch`);

  projects.forEach((project) => {
    cy.createProject(project.name, project.description, project.genre);

    // * Set status if provided
    if (project.status && project.status !== 'draft') {
      cy.editProject(project.name, { status: project.status });
    }
  });

  cy.task('log', `Batch creation completed: ${projects.length} projects`);
});

/**
 * Filter projects by status
 * @param status - Project status to filter by
 * @example cy.filterProjectsByStatus('in-progress')
 */
Cypress.Commands.add('filterProjectsByStatus', (
  status: 'all' | 'draft' | 'in-progress' | 'review' | 'completed' | 'archived'
) => {
  cy.task('log', `Filtering projects by status: ${status}`);

  // * Open filter menu
  cy.get('[data-cy="project-filter-button"]').click();

  // * Select status filter
  cy.get(`[data-cy="filter-status-${status}"]`).click();

  // * Apply filter
  cy.get('[data-cy="apply-project-filter"]').click();

  // * Verify filter is active
  if (status !== 'all') {
    cy.get('[data-cy="active-filter-badge"]').should('contain', status);
  }

  cy.task('log', `Projects filtered by status: ${status}`);
});

/**
 * Search for projects
 * @param searchTerm - Search term
 * @example cy.searchProjects('fantasy')
 */
Cypress.Commands.add('searchProjects', (searchTerm: string) => {
  cy.task('log', `Searching for projects: ${searchTerm}`);

  cy.get('[data-cy="project-search-input"]').clear().type(searchTerm);

  // * Wait for search results
  cy.get('[data-cy="project-list"]').should('be.visible');

  cy.task('log', `Project search completed: ${searchTerm}`);
});

/**
 * Sort projects by criteria
 * @param sortBy - Sort criteria
 * @param order - Sort order
 * @example cy.sortProjects('name', 'asc')
 */
Cypress.Commands.add('sortProjects', (
  sortBy: 'name' | 'created' | 'modified' | 'status',
  order: 'asc' | 'desc' = 'asc'
) => {
  cy.task('log', `Sorting projects by ${sortBy} (${order})`);

  // * Open sort menu
  cy.get('[data-cy="project-sort-button"]').click();

  // * Select sort criteria
  cy.get(`[data-cy="sort-projects-by-${sortBy}"]`).click();

  // * Select order
  cy.get(`[data-cy="sort-projects-order-${order}"]`).click();

  // * Apply sort
  cy.get('[data-cy="apply-project-sort"]').click();

  // * Verify sort indicator
  cy.get('[data-cy="current-project-sort"]').should('contain', sortBy);

  cy.task('log', `Projects sorted by ${sortBy} (${order})`);
});

/**
 * Bulk update project status
 * @param projectNames - Array of project names
 * @param newStatus - New status to apply
 * @example cy.bulkUpdateProjectStatus(['Project 1', 'Project 2'], 'completed')
 */
Cypress.Commands.add('bulkUpdateProjectStatus', (
  projectNames: string[],
  newStatus: 'draft' | 'in-progress' | 'review' | 'completed'
) => {
  cy.task('log', `Bulk updating ${projectNames.length} projects to status: ${newStatus}`);

  // * Select projects
  projectNames.forEach(name => {
    cy.get(`[data-cy="project-card-${name}"]`)
      .find('[data-cy="project-checkbox"]')
      .click();
  });

  // * Open bulk actions
  cy.get('[data-cy="bulk-project-actions"]').click();
  cy.get('[data-cy="bulk-update-status"]').click();

  // * Select new status
  cy.get(`[data-cy="bulk-status-option-${newStatus}"]`).click();

  // * Apply update
  cy.get('[data-cy="apply-bulk-status-update"]').click();

  // * Verify update
  cy.get('[data-cy="toast-success"]').should('contain', 'Projects updated');

  cy.task('log', `Bulk status update completed: ${projectNames.length} projects → ${newStatus}`);
});

/**
 * Archive multiple projects
 * @param projectNames - Array of project names to archive
 * @example cy.archiveMultipleProjects(['Old Project 1', 'Old Project 2'])
 */
Cypress.Commands.add('archiveMultipleProjects', (projectNames: string[]) => {
  cy.task('log', `Archiving ${projectNames.length} projects`);

  // * Select projects
  projectNames.forEach(name => {
    cy.get(`[data-cy="project-card-${name}"]`)
      .find('[data-cy="project-checkbox"]')
      .click();
  });

  // * Bulk archive
  cy.get('[data-cy="bulk-project-actions"]').click();
  cy.get('[data-cy="bulk-archive-projects"]').click();

  // * Confirm archive
  cy.get('[data-cy="confirm-bulk-archive"]').click();

  // * Verify archival
  cy.get('[data-cy="toast-success"]').should('contain', 'Projects archived');

  projectNames.forEach(name => {
    cy.get(`[data-cy="project-card-${name}"]`).should('not.exist');
  });

  cy.task('log', `Archived ${projectNames.length} projects`);
});

/**
 * Restore archived projects
 * @param projectNames - Array of project names to restore
 * @example cy.restoreProjects(['Old Project 1'])
 */
Cypress.Commands.add('restoreProjects', (projectNames: string[]) => {
  cy.task('log', `Restoring ${projectNames.length} archived projects`);

  // * Navigate to archive view
  cy.get('[data-cy="view-archived-projects"]').click();

  // * Select projects to restore
  projectNames.forEach(name => {
    cy.get(`[data-cy="archived-project-${name}"]`)
      .find('[data-cy="project-checkbox"]')
      .click();
  });

  // * Restore selected
  cy.get('[data-cy="restore-selected-projects"]').click();

  // * Confirm restoration
  cy.get('[data-cy="confirm-restore-projects"]').click();

  // * Verify restoration
  cy.get('[data-cy="toast-success"]').should('contain', 'Projects restored');

  // * Return to main view
  cy.get('[data-cy="exit-archive-view"]').click();

  // * Verify projects are back
  projectNames.forEach(name => {
    cy.get(`[data-cy="project-card-${name}"]`).should('exist');
  });

  cy.task('log', `Restored ${projectNames.length} projects`);
});

/**
 * Import projects from fixture
 * @param fixtureName - Name of the fixture file containing project data
 * @example cy.importProjectsFromFixture('test-projects.json')
 */
Cypress.Commands.add('importProjectsFromFixture', (fixtureName: string) => {
  cy.fixture(fixtureName).then((projects) => {
    cy.task('log', `Importing projects from fixture: ${fixtureName}`);

    // * Open import dialog
    cy.get('[data-cy="import-projects-button"]').click();

    // * Upload fixture data
    cy.get('[data-cy="import-projects-file"]').selectFile(
      `cypress/fixtures/${fixtureName}`,
      { force: true }
    );

    // * Confirm import
    cy.get('[data-cy="confirm-import-projects"]').click();

    // * Verify import success
    cy.get('[data-cy="toast-success"]').should('contain', 'Projects imported successfully');

    cy.task('log', `Imported projects from: ${fixtureName}`);
  });
});

/**
 * Export all projects
 * @param format - Export format
 * @example cy.exportAllProjects('json')
 */
Cypress.Commands.add('exportAllProjects', (format: 'json' | 'csv' | 'zip' = 'json') => {
  cy.task('log', `Exporting all projects as ${format}`);

  // * Open export dialog
  cy.get('[data-cy="export-all-projects"]').click();

  // * Select format
  cy.get(`[data-cy="export-projects-format-${format}"]`).click();

  // * Export
  cy.get('[data-cy="confirm-export-all-projects"]').click();

  // * Verify export
  cy.get('[data-cy="toast-success"]').should('contain', 'Export completed');

  cy.task('log', `Exported all projects as ${format}`);
});

/**
 * Clear all projects (dangerous operation)
 * @param confirm - Must be true to execute
 * @example cy.clearAllProjects(true)
 */
Cypress.Commands.add('clearAllProjects', (confirm: boolean) => {
  if (!confirm) {
    cy.task('log', 'Clear all projects aborted - confirmation required');
    return;
  }

  cy.task('log', 'WARNING: Clearing all projects');

  // * Select all projects
  cy.get('[data-cy="select-all-projects"]').click();

  // * Bulk delete
  cy.get('[data-cy="bulk-project-actions"]').click();
  cy.get('[data-cy="bulk-delete-projects"]').click();

  // * Confirm deletion
  cy.get('[data-cy="confirm-delete-all-warning"]').type('DELETE ALL');
  cy.get('[data-cy="confirm-bulk-delete-projects"]').click();

  // * Verify deletion
  cy.get('[data-cy="project-list"]').should('contain', 'No projects found');

  cy.task('log', 'All projects cleared');
});

/**
 * Verify project count
 * @param expectedCount - Expected number of projects
 * @param status - Optional status filter
 * @example cy.verifyProjectCount(5, 'in-progress')
 */
Cypress.Commands.add('verifyProjectCount', (
  expectedCount: number,
  status?: 'draft' | 'in-progress' | 'review' | 'completed' | 'archived'
) => {
  cy.task('log', `Verifying project count: ${expectedCount}${status ? ` (${status})` : ''}`);

  if (status) {
    cy.filterProjectsByStatus(status);
  }

  // * Check count display
  cy.get('[data-cy="project-count"]')
    .should('contain', `${expectedCount} project${expectedCount === 1 ? '' : 's'}`);

  // * Verify actual card count
  cy.get('[data-cy^="project-card-"]').should('have.length', expectedCount);

  cy.task('log', `Project count verified: ${expectedCount}`);
});

/**
 * Get project statistics
 * @example cy.getProjectStats().then(stats => { console.log(stats); })
 */
Cypress.Commands.add('getProjectStats', () => {
  cy.task('log', 'Getting project statistics');

  return cy.get('[data-cy="project-stats"]').then($stats => {
    const stats = {
      total: parseInt($stats.find('[data-cy="stat-total"]').text(), 10),
      draft: parseInt($stats.find('[data-cy="stat-draft"]').text(), 10),
      inProgress: parseInt($stats.find('[data-cy="stat-in-progress"]').text(), 10),
      review: parseInt($stats.find('[data-cy="stat-review"]').text(), 10),
      completed: parseInt($stats.find('[data-cy="stat-completed"]').text(), 10),
      archived: parseInt($stats.find('[data-cy="stat-archived"]').text(), 10),
    };

    cy.task('log', `Project stats: ${JSON.stringify(stats)}`);
    return stats;
  });
});

// * Export empty object to prevent TS errors
export {};