/**
 * ProjectListPage - Page object for project list and management
 */

import BasePage from './BasePage';

class ProjectListPage extends BasePage {
  constructor() {
    super();
    this.path = '/projects';
  }

  // * Page elements
  get createProjectButton() {
    return this.getByDataCy('create-project-button');
  }

  get projectCards() {
    return cy.get('[data-cy^="project-card-"]');
  }

  get searchInput() {
    return this.getByDataCy('project-search-input');
  }

  get filterDropdown() {
    return this.getByDataCy('project-filter-dropdown');
  }

  get sortDropdown() {
    return this.getByDataCy('project-sort-dropdown');
  }

  get loadingIndicator() {
    return this.getByDataCy('projects-loading');
  }

  get emptyState() {
    return this.getByDataCy('projects-empty-state');
  }

  get createProjectModal() {
    return this.getByDataCy('create-project-modal');
  }

  get projectNameInput() {
    return this.getByDataCy('project-name-input');
  }

  get projectDescriptionInput() {
    return this.getByDataCy('project-description-input');
  }

  get projectGenreSelect() {
    return this.getByDataCy('project-genre-select');
  }

  get saveProjectButton() {
    return this.getByDataCy('save-project-button');
  }

  get cancelButton() {
    return this.getByDataCy('cancel-button');
  }

  // * Page actions
  visit() {
    super.visit(this.path);
    this.waitForProjectsToLoad();
    return this;
  }

  waitForProjectsToLoad() {
    cy.get('[data-cy="projects-loading"]', { timeout: 10000 }).should('not.exist');
    return this;
  }

  clickCreateProject() {
    this.createProjectButton.click();
    return this;
  }

  searchProjects(searchTerm) {
    this.searchInput.clear().type(searchTerm);
    this.waitForProjectsToLoad();
    return this;
  }

  filterByGenre(genre) {
    this.filterDropdown.select(genre);
    this.waitForProjectsToLoad();
    return this;
  }

  sortProjects(sortOption) {
    this.sortDropdown.select(sortOption);
    this.waitForProjectsToLoad();
    return this;
  }

  selectProject(projectName) {
    cy.contains('[data-cy^="project-card-"]', projectName).click();
    return this;
  }

  selectProjectByIndex(index) {
    this.projectCards.eq(index).click();
    return this;
  }

  getProjectCard(projectName) {
    return cy.contains('[data-cy^="project-card-"]', projectName);
  }

  getProjectCardByIndex(index) {
    return this.projectCards.eq(index);
  }

  // * Create project workflow
  createNewProject(projectData) {
    this.clickCreateProject();
    this.fillProjectForm(projectData);
    this.saveProjectButton.click();
    this.waitForModalToClose();
    return this;
  }

  fillProjectForm(projectData) {
    if (projectData.name) {
      this.projectNameInput.clear().type(projectData.name);
    }
    if (projectData.description) {
      this.projectDescriptionInput.clear().type(projectData.description);
    }
    if (projectData.genre) {
      this.projectGenreSelect.select(projectData.genre);
    }
    if (projectData.tags) {
      projectData.tags.forEach(tag => {
        this.getByDataCy('tag-input').type(`${tag}{enter}`);
      });
    }
    return this;
  }

  waitForModalToClose() {
    this.createProjectModal.should('not.exist');
    return this;
  }

  // * Edit project
  editProject(projectName) {
    this.getProjectCard(projectName)
      .find('[data-cy="edit-project-button"]')
      .click();
    return this;
  }

  // * Delete project
  deleteProject(projectName) {
    this.getProjectCard(projectName)
      .find('[data-cy="delete-project-button"]')
      .click();

    // Confirm deletion
    this.getByDataCy('confirm-delete-button').click();
    this.waitForProjectsToLoad();
    return this;
  }

  // * Bulk operations
  selectMultipleProjects(projectNames) {
    projectNames.forEach(name => {
      this.getProjectCard(name)
        .find('[data-cy="project-checkbox"]')
        .check();
    });
    return this;
  }

  deleteSelectedProjects() {
    this.getByDataCy('bulk-delete-button').click();
    this.getByDataCy('confirm-bulk-delete-button').click();
    this.waitForProjectsToLoad();
    return this;
  }

  // * Project card actions
  openProjectMenu(projectName) {
    this.getProjectCard(projectName)
      .find('[data-cy="project-menu-button"]')
      .click();
    return this;
  }

  duplicateProject(projectName) {
    this.openProjectMenu(projectName);
    this.getByDataCy('duplicate-project-option').click();
    return this;
  }

  archiveProject(projectName) {
    this.openProjectMenu(projectName);
    this.getByDataCy('archive-project-option').click();
    return this;
  }

  exportProject(projectName) {
    this.openProjectMenu(projectName);
    this.getByDataCy('export-project-option').click();
    return this;
  }

  // * Assertions
  shouldHaveProjectCount(count) {
    this.projectCards.should('have.length', count);
    return this;
  }

  shouldShowProject(projectName) {
    this.getProjectCard(projectName).should('be.visible');
    return this;
  }

  shouldNotShowProject(projectName) {
    cy.contains('[data-cy^="project-card-"]', projectName).should('not.exist');
    return this;
  }

  shouldShowEmptyState() {
    this.emptyState.should('be.visible');
    return this;
  }

  shouldNotShowEmptyState() {
    this.emptyState.should('not.exist');
    return this;
  }

  shouldShowCreateModal() {
    this.createProjectModal.should('be.visible');
    return this;
  }

  shouldNotShowCreateModal() {
    this.createProjectModal.should('not.exist');
    return this;
  }

  shouldHaveProjectWithElementCount(projectName, count) {
    this.getProjectCard(projectName)
      .find('[data-cy="element-count"]')
      .should('contain', count);
    return this;
  }

  shouldHaveProjectWithStatus(projectName, status) {
    this.getProjectCard(projectName)
      .find('[data-cy="project-status"]')
      .should('contain', status);
    return this;
  }

  shouldShowSuccessMessage(message) {
    this.getByDataCy('success-message')
      .should('be.visible')
      .and('contain', message);
    return this;
  }

  shouldShowErrorMessage(message) {
    this.getByDataCy('error-message')
      .should('be.visible')
      .and('contain', message);
    return this;
  }

  // * Utility methods
  getProjectsCount() {
    return this.projectCards.then($cards => $cards.length);
  }

  getProjectNames() {
    return this.projectCards.then($cards => {
      const names = [];
      $cards.each((index, card) => {
        names.push(Cypress.$(card).find('[data-cy="project-name"]').text());
      });
      return names;
    });
  }

  clearSearch() {
    this.searchInput.clear();
    this.waitForProjectsToLoad();
    return this;
  }

  resetFilters() {
    this.filterDropdown.select('All');
    this.sortDropdown.select('Recent');
    this.clearSearch();
    return this;
  }

  // * Performance testing
  measureLoadTime() {
    this.markPerformanceStart('project-list-load');
    this.visit();
    this.markPerformanceEnd('project-list-load');
    return this.getPerformanceMeasure('project-list-load');
  }

  // * Pagination (if applicable)
  goToNextPage() {
    this.getByDataCy('next-page-button').click();
    this.waitForProjectsToLoad();
    return this;
  }

  goToPreviousPage() {
    this.getByDataCy('previous-page-button').click();
    this.waitForProjectsToLoad();
    return this;
  }

  goToPage(pageNumber) {
    this.getByDataCy(`page-${pageNumber}-button`).click();
    this.waitForProjectsToLoad();
    return this;
  }

  // * View toggle
  switchToGridView() {
    this.getByDataCy('grid-view-button').click();
    return this;
  }

  switchToListView() {
    this.getByDataCy('list-view-button').click();
    return this;
  }
}

export default ProjectListPage;