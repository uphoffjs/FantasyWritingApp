/// <reference types="cypress" />

/**
 * Search and Filter Flows E2E Test
 *
 * Comprehensive user journey for searching and filtering content
 * Following Cypress best practices with data-cy attributes
 */

describe('Search and Filter Flows', () => {
  // * Test data for seeding
  const testData = {
    projects: [
      { name: 'Fantasy World', genre: 'Fantasy', status: 'active' },
      { name: 'Sci-Fi Universe', genre: 'Science Fiction', status: 'active' },
      { name: 'Mystery Manor', genre: 'Mystery', status: 'draft' },
      { name: 'Romance Story', genre: 'Romance', status: 'archived' }
    ],
    elements: [
      { name: 'Aragorn', type: 'character', tags: ['hero', 'ranger', 'king'] },
      { name: 'Gandalf', type: 'character', tags: ['wizard', 'mentor'] },
      { name: 'Mordor', type: 'location', tags: ['evil', 'fortress'] },
      { name: 'The One Ring', type: 'item', tags: ['magical', 'powerful'] },
      { name: 'Battle of Helm\'s Deep', type: 'event', tags: ['battle', 'victory'] }
    ]
  };

  beforeEach(() => {
    
    // * Clean state BEFORE test (Cypress best practice)
    cy.task('db:clean');

    // * Seed test data via API (faster than UI)
    cy.task('db:seed', testData);

    // * Use session for auth
    cy.session('authenticated-user', () => {
      cy.visit('/login');
      cy.get('[data-cy="email-input"]').type('test@example.com');
      cy.get('[data-cy="password-input"]').type('password123');
      cy.get('[data-cy="login-button"]').click();
      cy.url().should('include', '/projects');
    }, {
      validate() {
        cy.getCookie('auth-token').should('exist');
      }
    });

    cy.visit('/projects');
  });

  describe('Global Search', () => {
    it('should search across all content types', () => {
      // * Open global search
      cy.get('[data-cy="global-search-trigger"]').click();
      cy.get('[data-cy="global-search-modal"]').should('be.visible');

      // * Search for a term that appears in multiple types
      cy.get('[data-cy="global-search-input"]').type('ring');

      // * Wait for debounced search (no arbitrary wait)
      cy.get('[data-cy="search-results"]').should('be.visible');

      // * Verify results from different types
      cy.get('[data-cy="search-result-items"]').should('contain', 'The One Ring');
      cy.get('[data-cy="search-result-items"]').should('contain', 'Aragorn'); // Contains 'ranger'

      // * Filter by type
      cy.get('[data-cy="search-filter-type"]').select('item');
      cy.get('[data-cy="search-result-items"]').should('have.length', 1);
      cy.get('[data-cy="search-result-items"]').should('contain', 'The One Ring');
    });

    it('should handle keyboard navigation', () => {
      // * Trigger search with keyboard shortcut
      cy.get('body').type('{cmd}k');
      cy.get('[data-cy="global-search-modal"]').should('be.visible');

      // * Type search query
      cy.get('[data-cy="global-search-input"]').type('Gandalf');

      // * Navigate with arrow keys
      cy.get('[data-cy="global-search-input"]').type('{downarrow}');
      cy.get('[data-cy="search-result-items"]').first().should('have.class', 'highlighted');

      // * Select with Enter
      cy.get('[data-cy="global-search-input"]').type('{enter}');
      cy.url().should('include', '/element/');
      cy.get('[data-cy="element-name"]').should('contain', 'Gandalf');
    });

    it('should show recent searches', () => {
      // * Perform a search
      cy.get('[data-cy="global-search-trigger"]').click();
      cy.get('[data-cy="global-search-input"]').type('wizard{enter}');

      // * Close and reopen search
      cy.get('[data-cy="global-search-close"]').click();
      cy.get('[data-cy="global-search-trigger"]').click();

      // * Verify recent search appears
      cy.get('[data-cy="recent-searches"]').should('be.visible');
      cy.get('[data-cy="recent-search-item"]').should('contain', 'wizard');

      // * Click recent search to repeat
      cy.get('[data-cy="recent-search-item"]').first().click();
      cy.get('[data-cy="global-search-input"]').should('have.value', 'wizard');
    });

    it('should handle empty results gracefully', () => {
      cy.get('[data-cy="global-search-trigger"]').click();
      cy.get('[data-cy="global-search-input"]').type('nonexistentterm12345');

      cy.get('[data-cy="no-results-message"]').should('be.visible');
      cy.get('[data-cy="no-results-message"]').should('contain', 'No results found');
      cy.get('[data-cy="search-suggestions"]').should('be.visible');
    });
  });

  describe('Project Filtering', () => {
    beforeEach(() => {
    
      cy.visit('/projects');
      cy.get('[data-cy="projects-list"]').should('be.visible');
    });

    it('should filter projects by genre', () => {
      // * Initially all projects visible
      cy.get('[data-cy="project-card"]').should('have.length', 4);

      // * Apply genre filter
      cy.get('[data-cy="genre-filter"]').select('Fantasy');
      cy.get('[data-cy="project-card"]').should('have.length', 1);
      cy.get('[data-cy="project-card"]').should('contain', 'Fantasy World');

      // * Change filter
      cy.get('[data-cy="genre-filter"]').select('Science Fiction');
      cy.get('[data-cy="project-card"]').should('have.length', 1);
      cy.get('[data-cy="project-card"]').should('contain', 'Sci-Fi Universe');

      // * Clear filter
      cy.get('[data-cy="genre-filter"]').select('All Genres');
      cy.get('[data-cy="project-card"]').should('have.length', 4);
    });

    it('should filter projects by status', () => {
      // * Filter by active status
      cy.get('[data-cy="status-filter-active"]').click();
      cy.get('[data-cy="project-card"]').should('have.length', 2);

      // * Filter by draft status
      cy.get('[data-cy="status-filter-active"]').click(); // Uncheck active
      cy.get('[data-cy="status-filter-draft"]').click();
      cy.get('[data-cy="project-card"]').should('have.length', 1);
      cy.get('[data-cy="project-card"]').should('contain', 'Mystery Manor');

      // * Multiple status filters
      cy.get('[data-cy="status-filter-archived"]').click();
      cy.get('[data-cy="project-card"]').should('have.length', 2);
    });

    it('should combine search and filters', () => {
      // * Apply genre filter
      cy.get('[data-cy="genre-filter"]').select('Fantasy');

      // * Add search term
      cy.get('[data-cy="project-search-input"]').type('World');

      // * Should only show matching filtered results
      cy.get('[data-cy="project-card"]').should('have.length', 1);
      cy.get('[data-cy="project-card"]').should('contain', 'Fantasy World');

      // * Clear search but keep filter
      cy.get('[data-cy="project-search-input"]').clear();
      cy.get('[data-cy="project-card"]').should('have.length', 1);
    });

    it('should persist filter preferences', () => {
      // * Set filters
      cy.get('[data-cy="genre-filter"]').select('Mystery');
      cy.get('[data-cy="status-filter-draft"]').click();

      // * Navigate away and back
      cy.get('[data-cy="nav-elements"]').click();
      cy.get('[data-cy="nav-projects"]').click();

      // * Verify filters are persisted
      cy.get('[data-cy="genre-filter"]').should('have.value', 'Mystery');
      cy.get('[data-cy="status-filter-draft"]').should('be.checked');
      cy.get('[data-cy="project-card"]').should('have.length', 1);
    });
  });

  describe('Element Filtering', () => {
    beforeEach(() => {
    
      cy.visit('/elements');
      cy.get('[data-cy="elements-list"]').should('be.visible');
    });

    it('should filter elements by type', () => {
      // * Initially all elements visible
      cy.get('[data-cy="element-card"]').should('have.length', 5);

      // * Filter by character type
      cy.get('[data-cy="element-type-character"]').click();
      cy.get('[data-cy="element-card"]').should('have.length', 2);

      // * Add location type
      cy.get('[data-cy="element-type-location"]').click();
      cy.get('[data-cy="element-card"]').should('have.length', 3);

      // * Clear all type filters
      cy.get('[data-cy="clear-type-filters"]').click();
      cy.get('[data-cy="element-card"]').should('have.length', 5);
    });

    it('should filter elements by tags', () => {
      // * Click on a tag to filter
      cy.get('[data-cy="tag-hero"]').first().click();
      cy.get('[data-cy="element-card"]').should('have.length', 1);
      cy.get('[data-cy="element-card"]').should('contain', 'Aragorn');

      // * Add another tag (OR logic)
      cy.get('[data-cy="tag-wizard"]').first().click();
      cy.get('[data-cy="element-card"]').should('have.length', 2);

      // * Switch to AND logic
      cy.get('[data-cy="tag-logic-toggle"]').click();
      cy.get('[data-cy="element-card"]').should('have.length', 0); // No element has both tags

      // * Clear tag filters
      cy.get('[data-cy="clear-tag-filters"]').click();
      cy.get('[data-cy="element-card"]').should('have.length', 5);
    });

    it('should search within filtered results', () => {
      // * Filter by type first
      cy.get('[data-cy="element-type-character"]').click();
      cy.get('[data-cy="element-card"]').should('have.length', 2);

      // * Search within filtered results
      cy.get('[data-cy="element-search-input"]').type('Ara');
      cy.get('[data-cy="element-card"]').should('have.length', 1);
      cy.get('[data-cy="element-card"]').should('contain', 'Aragorn');

      // * Clear search
      cy.get('[data-cy="element-search-clear"]').click();
      cy.get('[data-cy="element-card"]').should('have.length', 2);
    });
  });

  describe('Advanced Search', () => {
    it('should support complex search queries', () => {
      cy.visit('/search/advanced');

      // * Build complex query
      cy.get('[data-cy="search-field-name"]').type('ring');
      cy.get('[data-cy="search-field-type"]').select('item');
      cy.get('[data-cy="search-field-tags"]').type('magical{enter}powerful{enter}');

      // * Add date range filter
      cy.get('[data-cy="date-range-toggle"]').click();
      cy.get('[data-cy="date-from"]').type('2024-01-01');
      cy.get('[data-cy="date-to"]').type('2024-12-31');

      // * Execute search
      cy.get('[data-cy="execute-search"]').click();

      // * Verify results
      cy.get('[data-cy="search-results-count"]').should('contain', '1 result');
      cy.get('[data-cy="search-result"]').should('contain', 'The One Ring');
    });

    it('should save and load search queries', () => {
      cy.visit('/search/advanced');

      // * Build a query
      cy.get('[data-cy="search-field-name"]').type('Battle');
      cy.get('[data-cy="search-field-type"]').select('event');

      // * Save the query
      cy.get('[data-cy="save-search-button"]').click();
      cy.get('[data-cy="search-name-input"]').type('Battle Events Search');
      cy.get('[data-cy="save-search-confirm"]').click();

      // * Navigate away and back
      cy.visit('/projects');
      cy.visit('/search/advanced');

      // * Load saved search
      cy.get('[data-cy="saved-searches-dropdown"]').click();
      cy.get('[data-cy="saved-search-Battle Events Search"]').click();

      // * Verify query is loaded
      cy.get('[data-cy="search-field-name"]').should('have.value', 'Battle');
      cy.get('[data-cy="search-field-type"]').should('have.value', 'event');
    });
  });

  describe('Sort and View Options', () => {
    beforeEach(() => {
    
      cy.visit('/elements');
    });

    it('should sort elements by different criteria', () => {
      // * Sort by name (A-Z)
      cy.get('[data-cy="sort-dropdown"]').select('Name (A-Z)');
      cy.get('[data-cy="element-card"]').first().should('contain', 'Aragorn');

      // * Sort by name (Z-A)
      cy.get('[data-cy="sort-dropdown"]').select('Name (Z-A)');
      cy.get('[data-cy="element-card"]').first().should('contain', 'The One Ring');

      // * Sort by date created (newest first)
      cy.get('[data-cy="sort-dropdown"]').select('Newest First');
      // * Would verify based on actual creation dates

      // * Sort by type
      cy.get('[data-cy="sort-dropdown"]').select('Type');
      // * Characters should appear first alphabetically
      cy.get('[data-cy="element-card"]').first()
        .find('[data-cy="element-type-badge"]')
        .should('contain', 'character');
    });

    it('should switch between grid and list views', () => {
      // * Default is grid view
      cy.get('[data-cy="view-grid"]').should('have.class', 'active');
      cy.get('[data-cy="elements-list"]').should('have.class', 'grid-view');

      // * Switch to list view
      cy.get('[data-cy="view-list"]').click();
      cy.get('[data-cy="view-list"]').should('have.class', 'active');
      cy.get('[data-cy="elements-list"]').should('have.class', 'list-view');

      // * List view shows more details
      cy.get('[data-cy="element-description"]').should('be.visible');
      cy.get('[data-cy="element-tags-full"]').should('be.visible');

      // * Switch back to grid
      cy.get('[data-cy="view-grid"]').click();
      cy.get('[data-cy="elements-list"]').should('have.class', 'grid-view');
    });

    it('should adjust items per page', () => {
      // * Create more test data for pagination
      const moreElements = Array.from({ length: 30 }, (_, i) => ({
        name: `Element ${i}`,
        type: 'character'
      }));
      cy.task('db:seed', { elements: moreElements });
      cy.reload();

      // * Default shows 20 items
      cy.get('[data-cy="element-card"]').should('have.length', 20);
      cy.get('[data-cy="pagination-info"]').should('contain', '1-20 of 35');

      // * Change to 10 items per page
      cy.get('[data-cy="items-per-page"]').select('10');
      cy.get('[data-cy="element-card"]').should('have.length', 10);
      cy.get('[data-cy="pagination-info"]').should('contain', '1-10 of 35');

      // * Navigate to next page
      cy.get('[data-cy="pagination-next"]').click();
      cy.get('[data-cy="pagination-info"]').should('contain', '11-20 of 35');

      // * Change to show all
      cy.get('[data-cy="items-per-page"]').select('All');
      cy.get('[data-cy="element-card"]').should('have.length', 35);
    });
  });

  describe('Quick Filters', () => {
    it('should apply quick filter presets', () => {
      cy.visit('/elements');

      // * Apply "My Recent" quick filter
      cy.get('[data-cy="quick-filter-my-recent"]').click();
      // * Should show elements created/modified by current user recently

      // * Apply "Favorites" quick filter
      cy.get('[data-cy="quick-filter-favorites"]').click();
      // * Should show only favorited elements

      // * Apply "Incomplete" quick filter
      cy.get('[data-cy="quick-filter-incomplete"]').click();
      // * Should show elements with completion < 100%

      // * Clear quick filters
      cy.get('[data-cy="clear-quick-filter"]').click();
      cy.get('[data-cy="element-card"]').should('have.length.greaterThan', 0);
    });

    it('should combine quick filters with search', () => {
      cy.visit('/elements');

      // * Apply quick filter
      cy.get('[data-cy="quick-filter-characters"]').click();

      // * Add search
      cy.get('[data-cy="element-search-input"]').type('Gandalf');

      // * Should show filtered and searched results
      cy.get('[data-cy="element-card"]').should('have.length', 1);
      cy.get('[data-cy="element-card"]').should('contain', 'Gandalf');
    });
  });

  // ! NOTE: Failure handling is done globally in cypress/support/e2e.ts
  // ! Following Cypress best practices - no conditional statements in tests
});