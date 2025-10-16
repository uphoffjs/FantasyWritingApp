/// <reference types="cypress" />

/**
 * Project CRUD Stub Helpers for Cypress Tests
 *
 * * Purpose: Stub Supabase project API calls for frontend testing
 * * Strategy: Use cy.intercept() to mock project operations without backend dependency
 * * Usage: Import and call stub functions in test files
 *
 * @see claudedocs/STUB-BASED-TESTING-GUIDE.md for complete documentation
 */

// * ============================================================================
// * TYPE DEFINITIONS
// * ============================================================================

interface ProjectStub {
  id: string;
  title: string;
  description?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

// * ============================================================================
// * PROJECT RETRIEVAL STUBS
// * ============================================================================

/**
 * Stub fetching all projects for a user (empty list)
 *
 * @example
 * beforeEach(() => {
 *   stubNoProjects();
 * });
 *
 * it('should show empty state', () => {
 *   cy.visit('/projects');
 *   cy.wait('@getProjects');
 *   cy.get('[data-cy="empty-state"]').should('be.visible');
 *   cy.get('[data-cy="empty-message"]').should('contain', 'No projects yet');
 * });
 */
export const stubNoProjects = () => {
  cy.intercept('GET', '**/rest/v1/projects**', {
    statusCode: 200,
    body: []
  }).as('getProjects');
};

/**
 * Stub fetching all projects for a user (with data)
 *
 * @param projects - Array of project data (default: 3 sample projects)
 * @returns Array of project stubs
 *
 * @example
 * beforeEach(() => {
 *   const projects = [
 *     { title: 'Fantasy Novel', description: 'Epic fantasy story' },
 *     { title: 'Sci-Fi Short', description: 'Space adventure' }
 *   ];
 *   stubGetProjects(projects);
 * });
 *
 * it('should display projects', () => {
 *   cy.visit('/projects');
 *   cy.wait('@getProjects');
 *   cy.get('[data-cy="project-card"]').should('have.length', 2);
 *   cy.contains('Fantasy Novel').should('be.visible');
 * });
 */
export const stubGetProjects = (
  projects?: Array<Partial<ProjectStub>>
): ProjectStub[] => {
  const timestamp = Date.now();
  const defaultProjects: ProjectStub[] = [
    {
      id: `project-1-${timestamp}`,
      title: 'Epic Fantasy Novel',
      description: 'A tale of heroes and dragons',
      user_id: `user-${timestamp}`,
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-02T00:00:00.000Z'
    },
    {
      id: `project-2-${timestamp}`,
      title: 'Sci-Fi Adventure',
      description: 'Journey through the stars',
      user_id: `user-${timestamp}`,
      created_at: '2024-01-03T00:00:00.000Z',
      updated_at: '2024-01-04T00:00:00.000Z'
    },
    {
      id: `project-3-${timestamp}`,
      title: 'Mystery Thriller',
      description: 'Unraveling the truth',
      user_id: `user-${timestamp}`,
      created_at: '2024-01-05T00:00:00.000Z',
      updated_at: '2024-01-06T00:00:00.000Z'
    }
  ];

  const projectData = projects
    ? projects.map((p, idx) => ({
        id: p.id || `project-${idx + 1}-${timestamp}`,
        title: p.title || `Project ${idx + 1}`,
        description: p.description || '',
        user_id: p.user_id || `user-${timestamp}`,
        created_at: p.created_at || new Date().toISOString(),
        updated_at: p.updated_at || new Date().toISOString()
      }))
    : defaultProjects;

  cy.intercept('GET', '**/rest/v1/projects**', {
    statusCode: 200,
    body: projectData
  }).as('getProjects');

  return projectData;
};

/**
 * Stub fetching a single project by ID
 *
 * @param projectId - Project ID (default: generated)
 * @param projectData - Partial project data to merge
 * @returns Project stub
 *
 * @example
 * beforeEach(() => {
 *   stubGetProject('project-123', {
 *     title: 'My Novel',
 *     description: 'A great story'
 *   });
 * });
 *
 * it('should display project details', () => {
 *   cy.visit('/projects/project-123');
 *   cy.wait('@getProject');
 *   cy.contains('My Novel').should('be.visible');
 *   cy.contains('A great story').should('be.visible');
 * });
 */
export const stubGetProject = (
  projectId?: string,
  projectData?: Partial<ProjectStub>
): ProjectStub => {
  const timestamp = Date.now();
  const id = projectId || `project-${timestamp}`;

  const project: ProjectStub = {
    id: id,
    title: projectData?.title || 'Sample Project',
    description: projectData?.description || 'Project description',
    user_id: projectData?.user_id || `user-${timestamp}`,
    created_at: projectData?.created_at || '2024-01-01T00:00:00.000Z',
    updated_at: projectData?.updated_at || new Date().toISOString()
  };

  cy.intercept('GET', `**/rest/v1/projects?id=eq.${id}**`, {
    statusCode: 200,
    body: [project]
  }).as('getProject');

  return project;
};

// * ============================================================================
// * PROJECT CREATE STUBS
// * ============================================================================

/**
 * Stub creating a new project
 *
 * @param projectData - Partial project data to merge
 * @returns Created project stub
 *
 * @example
 * beforeEach(() => {
 *   stubCreateProject({ title: 'New Project' });
 * });
 *
 * it('should create new project', () => {
 *   cy.visit('/projects');
 *   cy.get('[data-cy="new-project-button"]').click();
 *   cy.get('[data-cy="project-title-input"]').type('New Project');
 *   cy.get('[data-cy="project-description-input"]').type('Project description');
 *   cy.get('[data-cy="create-button"]').click();
 *   cy.wait('@createProject');
 *   cy.url().should('match', /\/projects\/project-\d+/);
 * });
 */
export const stubCreateProject = (
  projectData?: Partial<ProjectStub>
): ProjectStub => {
  const timestamp = Date.now();

  const project: ProjectStub = {
    id: `project-${timestamp}`,
    title: projectData?.title || 'New Project',
    description: projectData?.description || '',
    user_id: projectData?.user_id || `user-${timestamp}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  cy.intercept('POST', '**/rest/v1/projects**', {
    statusCode: 201,
    body: [project]
  }).as('createProject');

  return project;
};

// * ============================================================================
// * PROJECT UPDATE STUBS
// * ============================================================================

/**
 * Stub updating an existing project
 *
 * @param projectId - Project ID to update
 * @param updates - Fields to update
 * @returns Updated project stub
 *
 * @example
 * beforeEach(() => {
 *   stubUpdateProject('project-123', { title: 'Updated Title' });
 * });
 *
 * it('should update project title', () => {
 *   cy.visit('/projects/project-123');
 *   cy.get('[data-cy="edit-button"]').click();
 *   cy.get('[data-cy="project-title-input"]').clear().type('Updated Title');
 *   cy.get('[data-cy="save-button"]').click();
 *   cy.wait('@updateProject');
 *   cy.contains('Updated Title').should('be.visible');
 * });
 */
export const stubUpdateProject = (
  projectId: string,
  updates: Partial<ProjectStub>
): ProjectStub => {
  const timestamp = Date.now();

  const project: ProjectStub = {
    id: projectId,
    title: updates.title || 'Updated Project',
    description: updates.description || 'Updated description',
    user_id: updates.user_id || `user-${timestamp}`,
    created_at: updates.created_at || '2024-01-01T00:00:00.000Z',
    updated_at: new Date().toISOString()
  };

  cy.intercept('PATCH', `**/rest/v1/projects?id=eq.${projectId}**`, {
    statusCode: 200,
    body: [project]
  }).as('updateProject');

  return project;
};

// * ============================================================================
// * PROJECT DELETE STUBS
// * ============================================================================

/**
 * Stub deleting a project
 *
 * @param projectId - Project ID to delete
 *
 * @example
 * beforeEach(() => {
 *   stubDeleteProject('project-123');
 * });
 *
 * it('should delete project', () => {
 *   cy.visit('/projects/project-123');
 *   cy.get('[data-cy="delete-button"]').click();
 *   cy.get('[data-cy="confirm-delete-button"]').click();
 *   cy.wait('@deleteProject');
 *   cy.url().should('include', '/projects');
 *   cy.contains('Project deleted').should('be.visible');
 * });
 */
export const stubDeleteProject = (projectId: string) => {
  cy.intercept('DELETE', `**/rest/v1/projects?id=eq.${projectId}**`, {
    statusCode: 204,
    body: {}
  }).as('deleteProject');
};

// * ============================================================================
// * ERROR STUBS
// * ============================================================================

/**
 * Stub a failed project creation (validation error)
 *
 * @param errorMessage - Custom error message
 *
 * @example
 * beforeEach(() => {
 *   stubFailedProjectCreate('Title is required');
 * });
 *
 * it('should show validation error', () => {
 *   cy.visit('/projects');
 *   cy.get('[data-cy="new-project-button"]').click();
 *   cy.get('[data-cy="create-button"]').click();
 *   cy.wait('@createProjectFailed');
 *   cy.get('[data-cy="error-message"]').should('contain', 'Title is required');
 * });
 */
export const stubFailedProjectCreate = (errorMessage = 'Validation failed') => {
  cy.intercept('POST', '**/rest/v1/projects**', {
    statusCode: 422,
    body: {
      error: 'validation_error',
      message: errorMessage
    }
  }).as('createProjectFailed');
};

/**
 * Stub a failed project update (unauthorized)
 *
 * @example
 * beforeEach(() => {
 *   stubFailedProjectUpdate();
 * });
 *
 * it('should show unauthorized error', () => {
 *   cy.visit('/projects/project-123');
 *   cy.get('[data-cy="edit-button"]').click();
 *   cy.get('[data-cy="project-title-input"]').type('Updated');
 *   cy.get('[data-cy="save-button"]').click();
 *   cy.wait('@updateProjectFailed');
 *   cy.get('[data-cy="error-message"]').should('be.visible');
 * });
 */
export const stubFailedProjectUpdate = () => {
  cy.intercept('PATCH', '**/rest/v1/projects**', {
    statusCode: 403,
    body: {
      error: 'unauthorized',
      message: 'You do not have permission to update this project'
    }
  }).as('updateProjectFailed');
};

/**
 * Stub a project not found error (404)
 *
 * @param projectId - Project ID that doesn't exist
 *
 * @example
 * beforeEach(() => {
 *   stubProjectNotFound('nonexistent-id');
 * });
 *
 * it('should show not found error', () => {
 *   cy.visit('/projects/nonexistent-id');
 *   cy.wait('@projectNotFound');
 *   cy.get('[data-cy="error-message"]').should('contain', 'not found');
 * });
 */
export const stubProjectNotFound = (projectId: string) => {
  cy.intercept('GET', `**/rest/v1/projects?id=eq.${projectId}**`, {
    statusCode: 404,
    body: {
      error: 'not_found',
      message: 'Project not found'
    }
  }).as('projectNotFound');
};
