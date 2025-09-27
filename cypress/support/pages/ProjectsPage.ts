/**
 * Projects Page Object
 * Handles project listing, creation, and management
 */

import { BasePage } from './BasePage';

export class ProjectsPage extends BasePage {
  // * Page-specific selectors
  private pageSelectors = {
    // * Project list
    projectCard: '[data-cy="project-card"]',
    projectList: '[data-cy="project-list"]',
    emptyState: '[data-cy="empty-state"]',

    // * Actions
    createProjectButton: '[data-cy="create-project-button"]',
    editProjectButton: '[data-cy="edit-project-button"]',
    deleteProjectButton: '[data-cy="delete-project-button"]',
    searchInput: '[data-cy="project-search-input"]',
    filterButton: '[data-cy="filter-button"]',
    sortDropdown: '[data-cy="sort-dropdown"]',

    // * Create/Edit modal
    projectNameInput: '[data-cy="project-name-input"]',
    projectDescriptionInput: '[data-cy="project-description-input"]',
    projectGenreSelect: '[data-cy="project-genre-select"]',
    saveProjectButton: '[data-cy="save-project-button"]',
    cancelButton: '[data-cy="cancel-button"]',

    // * Project card elements
    projectTitle: '[data-cy="project-title"]',
    projectDescription: '[data-cy="project-description"]',
    elementCount: '[data-cy="element-count"]',
    lastUpdated: '[data-cy="last-updated"]',

    // * Confirmation dialog
    confirmDeleteButton: '[data-cy="confirm-delete"]',
    cancelDeleteButton: '[data-cy="cancel-delete"]',
  };

  /**
   * Navigate to projects page
   */
  visit(): void {
    super.visit('/projects');
    this.waitForPageLoad();
  }

  /**
   * Click create new project button
   */
  clickCreateProject(): void {
    cy.get(this.pageSelectors.createProjectButton).click();
  }

  /**
   * Fill in project details
   */
  fillProjectDetails(name: string, description: string, genre?: string): void {
    cy.get(this.pageSelectors.projectNameInput).clear().type(name);
    cy.get(this.pageSelectors.projectDescriptionInput).clear().type(description);

    if (genre) {
      cy.get(this.pageSelectors.projectGenreSelect).select(genre);
    }
  }

  /**
   * Save project (in create/edit modal)
   */
  saveProject(): void {
    cy.get(this.pageSelectors.saveProjectButton).click();
  }

  /**
   * Cancel project creation/editing
   */
  cancelProjectForm(): void {
    cy.get(this.pageSelectors.cancelButton).click();
  }

  /**
   * Create a new project
   */
  createProject(name: string, description: string, genre?: string): void {
    this.clickCreateProject();
    this.fillProjectDetails(name, description, genre);
    this.saveProject();
  }

  /**
   * Search for a project
   */
  searchProject(searchTerm: string): void {
    cy.get(this.pageSelectors.searchInput).clear().type(searchTerm);
  }

  /**
   * Clear search
   */
  clearSearch(): void {
    cy.get(this.pageSelectors.searchInput).clear();
  }

  /**
   * Sort projects
   */
  sortBy(sortOption: 'name' | 'date' | 'elements'): void {
    cy.get(this.pageSelectors.sortDropdown).select(sortOption);
  }

  /**
   * Get all project cards
   */
  getProjectCards(): Cypress.Chainable {
    return cy.get(this.pageSelectors.projectCard);
  }

  /**
   * Get project card by name
   */
  getProjectByName(name: string): Cypress.Chainable {
    return cy.get(this.pageSelectors.projectCard)
      .contains(this.pageSelectors.projectTitle, name)
      .closest(this.pageSelectors.projectCard);
  }

  /**
   * Click on a project card
   */
  openProject(projectName: string): void {
    this.getProjectByName(projectName).click();
  }

  /**
   * Edit a project
   */
  editProject(projectName: string): void {
    this.getProjectByName(projectName)
      .find(this.pageSelectors.editProjectButton)
      .click();
  }

  /**
   * Delete a project
   */
  deleteProject(projectName: string, confirm: boolean = true): void {
    this.getProjectByName(projectName)
      .find(this.pageSelectors.deleteProjectButton)
      .click();

    if (confirm) {
      cy.get(this.pageSelectors.confirmDeleteButton).click();
    } else {
      cy.get(this.pageSelectors.cancelDeleteButton).click();
    }
  }

  /**
   * Verify project exists in list
   */
  verifyProjectExists(projectName: string): void {
    cy.get(this.pageSelectors.projectCard)
      .contains(this.pageSelectors.projectTitle, projectName)
      .should('be.visible');
  }

  /**
   * Verify project does not exist
   */
  verifyProjectDoesNotExist(projectName: string): void {
    cy.get(this.pageSelectors.projectCard)
      .contains(this.pageSelectors.projectTitle, projectName)
      .should('not.exist');
  }

  /**
   * Verify project count
   */
  verifyProjectCount(expectedCount: number): void {
    cy.get(this.pageSelectors.projectCard).should('have.length', expectedCount);
  }

  /**
   * Verify empty state is shown
   */
  verifyEmptyState(): void {
    cy.get(this.pageSelectors.emptyState).should('be.visible');
    cy.get(this.pageSelectors.projectCard).should('not.exist');
  }

  /**
   * Verify project details
   */
  verifyProjectDetails(projectName: string, details: {
    description?: string;
    elementCount?: number;
  }): void {
    const projectCard = this.getProjectByName(projectName);

    if (details.description) {
      projectCard
        .find(this.pageSelectors.projectDescription)
        .should('contain', details.description);
    }

    if (details.elementCount !== undefined) {
      projectCard
        .find(this.pageSelectors.elementCount)
        .should('contain', details.elementCount.toString());
    }
  }

  /**
   * Verify create project modal is open
   */
  verifyCreateModalOpen(): void {
    cy.get(this.pageSelectors.projectNameInput).should('be.visible');
    cy.get(this.pageSelectors.saveProjectButton).should('be.visible');
  }

  /**
   * Verify create project modal is closed
   */
  verifyCreateModalClosed(): void {
    cy.get(this.pageSelectors.projectNameInput).should('not.exist');
  }

  /**
   * Get element count for a project
   */
  getElementCount(projectName: string): Cypress.Chainable<number> {
    return this.getProjectByName(projectName)
      .find(this.pageSelectors.elementCount)
      .invoke('text')
      .then((text) => {
        const match = text.match(/(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      });
  }

  /**
   * Verify search results
   */
  verifySearchResults(expectedProjects: string[]): void {
    // * Verify correct count
    cy.get(this.pageSelectors.projectCard).should('have.length', expectedProjects.length);

    // * Verify each project is present
    expectedProjects.forEach((projectName) => {
      this.verifyProjectExists(projectName);
    });
  }

  /**
   * Open filter menu
   */
  openFilterMenu(): void {
    cy.get(this.pageSelectors.filterButton).click();
  }

  /**
   * Apply genre filter
   */
  filterByGenre(genre: string): void {
    this.openFilterMenu();
    cy.get(`[data-cy="genre-filter-${genre}"]`).click();
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    cy.get('[data-cy="clear-filters-button"]').click();
  }

  /**
   * Verify page is loaded
   */
  verifyPageLoaded(): void {
    cy.get(this.pageSelectors.projectList).should('be.visible');
    this.waitForPageLoad();
  }

  /**
   * Create multiple projects quickly
   */
  createMultipleProjects(projects: Array<{ name: string; description: string }>): void {
    projects.forEach((project) => {
      this.createProject(project.name, project.description);
      // * Wait for modal to close
      this.verifyCreateModalClosed();
      // * Wait a bit between creations
      cy.wait(500);
    });
  }
}