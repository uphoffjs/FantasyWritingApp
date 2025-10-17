/// <reference types="cypress" />

/**
 * Element CRUD Stub Helpers for Cypress Tests
 *
 * * Purpose: Stub Supabase element API calls for frontend testing
 * * Strategy: Use cy.intercept() to mock element operations without backend dependency
 * * Usage: Import and call stub functions in test files
 *
 * @see claudedocs/STUB-BASED-TESTING-GUIDE.md for complete documentation
 */

// * ============================================================================
// * TYPE DEFINITIONS
// * ============================================================================

interface ElementStub {
  id: string;
  project_id: string;
  name: string;
  type: 'character' | 'location' | 'item' | 'concept' | 'event' | 'faction';
  content?: string;
  tags?: string[];
  user_id: string;
  created_at: string;
  updated_at: string;
}

// * ============================================================================
// * ELEMENT RETRIEVAL STUBS
// * ============================================================================

/**
 * Stub fetching all elements for a project (empty list)
 *
 * @param projectId - Project ID to fetch elements for
 *
 * @example
 * beforeEach(() => {
 *   stubNoElements('project-123');
 * });
 *
 * it('should show empty state', () => {
 *   cy.visit('/projects/project-123/elements');
 *   cy.wait('@getElements');
 *   cy.get('[data-cy="empty-state"]').should('be.visible');
 *   cy.get('[data-cy="empty-message"]').should('contain', 'No elements yet');
 * });
 */
export const stubNoElements = (projectId: string) => {
  cy.intercept('GET', `**/rest/v1/elements?project_id=eq.${projectId}**`, {
    statusCode: 200,
    body: []
  }).as('getElements');
};

/**
 * Stub fetching all elements for a project (with data)
 *
 * @param projectId - Project ID to fetch elements for
 * @param elements - Array of element data (default: 5 sample elements)
 * @returns Array of element stubs
 *
 * @example
 * beforeEach(() => {
 *   const elements = [
 *     { name: 'Aragorn', type: 'character' as const, content: 'Ranger of the North' },
 *     { name: 'Rivendell', type: 'location' as const, content: 'Elven stronghold' }
 *   ];
 *   stubGetElements('project-123', elements);
 * });
 *
 * it('should display elements', () => {
 *   cy.visit('/projects/project-123/elements');
 *   cy.wait('@getElements');
 *   cy.get('[data-cy="element-card"]').should('have.length', 2);
 *   cy.contains('Aragorn').should('be.visible');
 * });
 */
export const stubGetElements = (
  projectId: string,
  elements?: Array<Partial<ElementStub>>
): ElementStub[] => {
  const timestamp = Date.now();
  const defaultElements: ElementStub[] = [
    {
      id: `element-1-${timestamp}`,
      project_id: projectId,
      name: 'Hero Character',
      type: 'character',
      content: 'Brave warrior from the north',
      tags: ['protagonist', 'warrior'],
      user_id: `user-${timestamp}`,
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-02T00:00:00.000Z'
    },
    {
      id: `element-2-${timestamp}`,
      project_id: projectId,
      name: 'Ancient Castle',
      type: 'location',
      content: 'Fortress on the mountain',
      tags: ['castle', 'fortress'],
      user_id: `user-${timestamp}`,
      created_at: '2024-01-03T00:00:00.000Z',
      updated_at: '2024-01-04T00:00:00.000Z'
    },
    {
      id: `element-3-${timestamp}`,
      project_id: projectId,
      name: 'Magic Sword',
      type: 'item',
      content: 'Legendary weapon of power',
      tags: ['weapon', 'magic'],
      user_id: `user-${timestamp}`,
      created_at: '2024-01-05T00:00:00.000Z',
      updated_at: '2024-01-06T00:00:00.000Z'
    },
    {
      id: `element-4-${timestamp}`,
      project_id: projectId,
      name: 'The Dark Empire',
      type: 'faction',
      content: 'Evil organization seeking world domination',
      tags: ['antagonist', 'empire'],
      user_id: `user-${timestamp}`,
      created_at: '2024-01-07T00:00:00.000Z',
      updated_at: '2024-01-08T00:00:00.000Z'
    },
    {
      id: `element-5-${timestamp}`,
      project_id: projectId,
      name: 'The Great War',
      type: 'event',
      content: 'War that changed the world',
      tags: ['history', 'war'],
      user_id: `user-${timestamp}`,
      created_at: '2024-01-09T00:00:00.000Z',
      updated_at: '2024-01-10T00:00:00.000Z'
    }
  ];

  const elementData = elements
    ? elements.map((e, idx) => ({
        id: e.id || `element-${idx + 1}-${timestamp}`,
        project_id: projectId,
        name: e.name || `Element ${idx + 1}`,
        type: e.type || 'concept',
        content: e.content || '',
        tags: e.tags || [],
        user_id: e.user_id || `user-${timestamp}`,
        created_at: e.created_at || new Date().toISOString(),
        updated_at: e.updated_at || new Date().toISOString()
      }))
    : defaultElements;

  cy.intercept('GET', `**/rest/v1/elements?project_id=eq.${projectId}**`, {
    statusCode: 200,
    body: elementData
  }).as('getElements');

  return elementData;
};

/**
 * Stub fetching a single element by ID
 *
 * @param elementId - Element ID
 * @param elementData - Partial element data to merge
 * @returns Element stub
 *
 * @example
 * beforeEach(() => {
 *   stubGetElement('element-123', {
 *     name: 'Gandalf',
 *     type: 'character',
 *     content: 'Wise wizard'
 *   });
 * });
 *
 * it('should display element details', () => {
 *   cy.visit('/elements/element-123');
 *   cy.wait('@getElement');
 *   cy.contains('Gandalf').should('be.visible');
 *   cy.contains('Wise wizard').should('be.visible');
 * });
 */
export const stubGetElement = (
  elementId: string,
  elementData?: Partial<ElementStub>
): ElementStub => {
  const timestamp = Date.now();

  const element: ElementStub = {
    id: elementId,
    project_id: elementData?.project_id || `project-${timestamp}`,
    name: elementData?.name || 'Sample Element',
    type: elementData?.type || 'concept',
    content: elementData?.content || 'Element content',
    tags: elementData?.tags || [],
    user_id: elementData?.user_id || `user-${timestamp}`,
    created_at: elementData?.created_at || '2024-01-01T00:00:00.000Z',
    updated_at: elementData?.updated_at || new Date().toISOString()
  };

  cy.intercept('GET', `**/rest/v1/elements?id=eq.${elementId}**`, {
    statusCode: 200,
    body: [element]
  }).as('getElement');

  return element;
};

// * ============================================================================
// * ELEMENT CREATE STUBS
// * ============================================================================

/**
 * Stub creating a new element
 *
 * @param projectId - Project ID to create element in
 * @param elementData - Partial element data to merge
 * @returns Created element stub
 *
 * @example
 * beforeEach(() => {
 *   stubCreateElement('project-123', {
 *     name: 'New Character',
 *     type: 'character'
 *   });
 * });
 *
 * it('should create new element', () => {
 *   cy.visit('/projects/project-123/elements');
 *   cy.get('[data-cy="new-element-button"]').click();
 *   cy.get('[data-cy="element-name-input"]').type('New Character');
 *   cy.get('[data-cy="element-type-select"]').select('character');
 *   cy.get('[data-cy="create-button"]').click();
 *   cy.wait('@createElement');
 *   cy.url().should('match', /\/elements\/element-\d+/);
 * });
 */
export const stubCreateElement = (
  projectId: string,
  elementData?: Partial<ElementStub>
): ElementStub => {
  const timestamp = Date.now();

  const element: ElementStub = {
    id: `element-${timestamp}`,
    project_id: projectId,
    name: elementData?.name || 'New Element',
    type: elementData?.type || 'concept',
    content: elementData?.content || '',
    tags: elementData?.tags || [],
    user_id: elementData?.user_id || `user-${timestamp}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  cy.intercept('POST', '**/rest/v1/elements**', {
    statusCode: 201,
    body: [element]
  }).as('createElement');

  return element;
};

// * ============================================================================
// * ELEMENT UPDATE STUBS
// * ============================================================================

/**
 * Stub updating an existing element
 *
 * @param elementId - Element ID to update
 * @param updates - Fields to update
 * @returns Updated element stub
 *
 * @example
 * beforeEach(() => {
 *   stubUpdateElement('element-123', {
 *     name: 'Updated Name',
 *     content: 'Updated content'
 *   });
 * });
 *
 * it('should update element', () => {
 *   cy.visit('/elements/element-123');
 *   cy.get('[data-cy="edit-button"]').click();
 *   cy.get('[data-cy="element-name-input"]').clear().type('Updated Name');
 *   cy.get('[data-cy="save-button"]').click();
 *   cy.wait('@updateElement');
 *   cy.contains('Updated Name').should('be.visible');
 * });
 */
export const stubUpdateElement = (
  elementId: string,
  updates: Partial<ElementStub>
): ElementStub => {
  const timestamp = Date.now();

  const element: ElementStub = {
    id: elementId,
    project_id: updates.project_id || `project-${timestamp}`,
    name: updates.name || 'Updated Element',
    type: updates.type || 'concept',
    content: updates.content || 'Updated content',
    tags: updates.tags || [],
    user_id: updates.user_id || `user-${timestamp}`,
    created_at: updates.created_at || '2024-01-01T00:00:00.000Z',
    updated_at: new Date().toISOString()
  };

  cy.intercept('PATCH', `**/rest/v1/elements?id=eq.${elementId}**`, {
    statusCode: 200,
    body: [element]
  }).as('updateElement');

  return element;
};

// * ============================================================================
// * ELEMENT DELETE STUBS
// * ============================================================================

/**
 * Stub deleting an element
 *
 * @param elementId - Element ID to delete
 *
 * @example
 * beforeEach(() => {
 *   stubDeleteElement('element-123');
 * });
 *
 * it('should delete element', () => {
 *   cy.visit('/elements/element-123');
 *   cy.get('[data-cy="delete-button"]').click();
 *   cy.get('[data-cy="confirm-delete-button"]').click();
 *   cy.wait('@deleteElement');
 *   cy.url().should('include', '/elements');
 *   cy.contains('Element deleted').should('be.visible');
 * });
 */
export const stubDeleteElement = (elementId: string) => {
  cy.intercept('DELETE', `**/rest/v1/elements?id=eq.${elementId}**`, {
    statusCode: 204,
    body: {}
  }).as('deleteElement');
};

// * ============================================================================
// * ELEMENT FILTERING STUBS
// * ============================================================================

/**
 * Stub fetching elements by type
 *
 * @param projectId - Project ID
 * @param type - Element type to filter by
 * @param elements - Array of element data (default: 3 elements of specified type)
 * @returns Array of element stubs
 *
 * @example
 * beforeEach(() => {
 *   stubGetElementsByType('project-123', 'character');
 * });
 *
 * it('should filter by character type', () => {
 *   cy.visit('/projects/project-123/elements');
 *   cy.get('[data-cy="type-filter"]').select('character');
 *   cy.wait('@getElementsByType');
 *   cy.get('[data-cy="element-card"]').each(($card) => {
 *     cy.wrap($card).should('contain', 'Character');
 *   });
 * });
 */
export const stubGetElementsByType = (
  projectId: string,
  type: ElementStub['type'],
  elements?: Array<Partial<ElementStub>>
): ElementStub[] => {
  const timestamp = Date.now();
  const defaultElements: ElementStub[] = Array.from({ length: 3 }, (_, idx) => ({
    id: `element-${idx + 1}-${timestamp}`,
    project_id: projectId,
    name: `${type} ${idx + 1}`,
    type: type,
    content: `Sample ${type} content`,
    tags: [type],
    user_id: `user-${timestamp}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));

  const elementData = elements
    ? elements.map((e, idx) => ({
        id: e.id || `element-${idx + 1}-${timestamp}`,
        project_id: projectId,
        name: e.name || `${type} ${idx + 1}`,
        type: type,
        content: e.content || '',
        tags: e.tags || [],
        user_id: e.user_id || `user-${timestamp}`,
        created_at: e.created_at || new Date().toISOString(),
        updated_at: e.updated_at || new Date().toISOString()
      }))
    : defaultElements;

  cy.intercept(
    'GET',
    `**/rest/v1/elements?project_id=eq.${projectId}&type=eq.${type}**`,
    {
      statusCode: 200,
      body: elementData
    }
  ).as('getElementsByType');

  return elementData;
};

// * ============================================================================
// * ERROR STUBS
// * ============================================================================

/**
 * Stub a failed element creation (validation error)
 *
 * @param errorMessage - Custom error message
 *
 * @example
 * beforeEach(() => {
 *   stubFailedElementCreate('Name is required');
 * });
 *
 * it('should show validation error', () => {
 *   cy.visit('/projects/project-123/elements');
 *   cy.get('[data-cy="new-element-button"]').click();
 *   cy.get('[data-cy="create-button"]').click();
 *   cy.wait('@createElementFailed');
 *   cy.get('[data-cy="error-message"]').should('contain', 'Name is required');
 * });
 */
export const stubFailedElementCreate = (errorMessage = 'Validation failed') => {
  cy.intercept('POST', '**/rest/v1/elements**', {
    statusCode: 422,
    body: {
      error: 'validation_error',
      message: errorMessage
    }
  }).as('createElementFailed');
};

/**
 * Stub a failed element update (unauthorized)
 *
 * @example
 * beforeEach(() => {
 *   stubFailedElementUpdate();
 * });
 *
 * it('should show unauthorized error', () => {
 *   cy.visit('/elements/element-123');
 *   cy.get('[data-cy="edit-button"]').click();
 *   cy.get('[data-cy="element-name-input"]').type('Updated');
 *   cy.get('[data-cy="save-button"]').click();
 *   cy.wait('@updateElementFailed');
 *   cy.get('[data-cy="error-message"]').should('be.visible');
 * });
 */
export const stubFailedElementUpdate = () => {
  cy.intercept('PATCH', '**/rest/v1/elements**', {
    statusCode: 403,
    body: {
      error: 'unauthorized',
      message: 'You do not have permission to update this element'
    }
  }).as('updateElementFailed');
};

/**
 * Stub an element not found error (404)
 *
 * @param elementId - Element ID that doesn't exist
 *
 * @example
 * beforeEach(() => {
 *   stubElementNotFound('nonexistent-id');
 * });
 *
 * it('should show not found error', () => {
 *   cy.visit('/elements/nonexistent-id');
 *   cy.wait('@elementNotFound');
 *   cy.get('[data-cy="error-message"]').should('contain', 'not found');
 * });
 */
export const stubElementNotFound = (elementId: string) => {
  cy.intercept('GET', `**/rest/v1/elements?id=eq.${elementId}**`, {
    statusCode: 404,
    body: {
      error: 'not_found',
      message: 'Element not found'
    }
  }).as('elementNotFound');
};
