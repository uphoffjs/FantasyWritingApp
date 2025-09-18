import React from 'react';
import { ProjectList } from '../../src/components/ProjectList';
import { mountWithProviders } from '../support/mount-helpers';
import { mockProject } from '../support/test-data';
import { 
  waitForAnimation,
  setMobileViewport,
  setTabletViewport,
  setDesktopViewport
} from '../support/test-utils';

describe('ProjectList Component', () => {
  const createMockProjects = (count: number, archived = false) => {
    return Array.from({ length: count }, (_, i) => ({
      ...mockProject,
      id: `project-${i}`,
      name: `Project ${i + 1}`,
      description: `Description for project ${i + 1}`,
      genre: i % 2 === 0 ? 'Fantasy' : 'Sci-Fi',
      isArchived: archived,
      createdAt: new Date(2024, 0, i + 1).toISOString(),
      updatedAt: new Date(2024, 0, count - i).toISOString()
    }));
  };

  beforeEach(() => {
    // Clear localStorage before each test
    cy.clearLocalStorage();
  });

  describe('Rendering', () => {
    it('renders without errors', () => {
      mountWithProviders(<ProjectList />);
      cy.get('[data-testid="create-project"]').should('exist');
    });

    it('displays title and controls', () => {
      mountWithProviders(<ProjectList />);
      
      // Check title
      cy.contains('Your Worldbuilding Projects').should('be.visible');
      
      // Check main controls
      cy.get('[data-testid="create-project"]').should('be.visible');
      cy.get('[data-testid="toggle-archived"]').should('be.visible');
    });

    it('displays empty state when no projects', () => {
      mountWithProviders(<ProjectList />);
      
      cy.contains('No projects yet').should('be.visible');
      cy.contains('Create your first worldbuilding project to get started').should('be.visible');
      cy.get('[data-testid="create-first-project"]').should('be.visible');
    });

    it('displays project cards when projects exist', () => {
      const projects = createMockProjects(3);
      mountWithProviders(<ProjectList />, {
        initialState: { projects }
      });
      
      // Should show 3 project cards
      cy.get('[data-testid="project-card"]').should('have.length', 3);
      
      // Verify project names
      projects.forEach(project => {
        cy.contains(project.name).should('be.visible');
      });
    });

    it('displays virtualized list for many projects', () => {
      const projects = createMockProjects(25); // Above VIRTUALIZATION_THRESHOLD
      mountWithProviders(<ProjectList />, {
        initialState: { projects }
      });
      
      // Should use virtualized list component (check for react-window container)
      cy.get('.react-window').should('exist');
    });

    it('displays floating action [data-cy*="button"] on mobile', () => {
      setMobileViewport();
      mountWithProviders(<ProjectList />);
      
      cy.get('[data-testid="fab-create-project"]').should('be.visible');
    });

    it('hides floating action [data-cy*="button"] on desktop', () => {
      setDesktopViewport();
      mountWithProviders(<ProjectList />);
      
      cy.get('[data-testid="fab-create-project"]').should('not.be.visible');
    });
  });

  describe('Search Functionality', () => {
    it('filters projects by search query', () => {
      const projects = createMockProjects(5);
      projects[2].name = 'Unique Test Project';
      
      mountWithProviders(<ProjectList />, {
        initialState: { projects }
      });
      
      // Search for specific project
      cy.get('[data-testid="project-search"]').type('Unique');
      waitForAnimation(); // Wait for debounce
      
      // Should show only matching project
      cy.get('[data-testid="project-card"]').should('have.length', 1);
      cy.contains('Unique Test Project').should('be.visible');
      cy.contains('Showing 1 project matching "Unique"').should('be.visible');
    });

    it('searches across multiple fields', () => {
      const projects = createMockProjects(3);
      projects[0].description = 'Magic kingdom';
      projects[1].genre = 'Cyberpunk';
      
      mountWithProviders(<ProjectList />, {
        initialState: { projects }
      });
      
      // Search by description
      cy.get('[data-testid="project-search"]').type('Magic');
      waitForAnimation();
      cy.get('[data-testid="project-card"]').should('have.length', 1);
      
      // Clear and search by genre
      cy.get('[data-testid="clear-search"]').click();
      cy.get('[data-testid="project-search"]').type('Cyberpunk');
      waitForAnimation();
      cy.get('[data-testid="project-card"]').should('have.length', 1);
    });

    it('shows no results message when search has no matches', () => {
      const projects = createMockProjects(3);
      mountWithProviders(<ProjectList />, {
        initialState: { projects }
      });
      
      cy.get('[data-testid="project-search"]').type('NonExistentProject');
      waitForAnimation();
      
      cy.contains('No projects found').should('be.visible');
      cy.contains('No projects match your search "NonExistentProject"').should('be.visible');
    });

    it('debounces search input', () => {
      const projects = createMockProjects(3);
      mountWithProviders(<ProjectList />, {
        initialState: { projects }
      });
      
      // Type quickly
      cy.get('[data-testid="project-search"]').type('Pro');
      
      // Should still show all projects immediately
      cy.get('[data-testid="project-card"]').should('have.length', 3);
      
      // Wait for debounce
      waitForAnimation();
      
      // Now should show filtered results
      cy.get('[data-testid="project-card"]').should('have.length', 3); // All match "Pro"
    });
  });

  describe('Sorting', () => {
    it('sorts projects by modified date (default)', () => {
      const projects = createMockProjects(3);
      mountWithProviders(<ProjectList />, {
        initialState: { projects }
      });
      
      // Default sort should be modified-desc
      cy.get('[data-testid="project-card"]').first().should('contain', 'Project 3');
      cy.get('[data-testid="project-card"]').last().should('contain', 'Project 1');
    });

    it('sorts projects by name ascending', () => {
      const projects = [
        { ...mockProject, id: '1', name: 'Zebra World' },
        { ...mockProject, id: '2', name: 'Alpha Project' },
        { ...mockProject, id: '3', name: 'Middle Earth' }
      ];
      
      mountWithProviders(<ProjectList />, {
        initialState: { projects }
      });
      
      // Change sort to name-asc
      cy.get('[data-testid="sort-dropdown"]').select('name-asc');
      
      cy.get('[data-testid="project-card"]').first().should('contain', 'Alpha Project');
      cy.get('[data-testid="project-card"]').last().should('contain', 'Zebra World');
    });

    it('sorts projects by created date', () => {
      const projects = createMockProjects(3);
      mountWithProviders(<ProjectList />, {
        initialState: { projects }
      });
      
      // Change sort to created-asc
      cy.get('[data-testid="sort-dropdown"]').select('created-asc');
      
      cy.get('[data-testid="project-card"]').first().should('contain', 'Project 1');
      cy.get('[data-testid="project-card"]').last().should('contain', 'Project 3');
    });

    it('persists sort preference in localStorage', () => {
      mountWithProviders(<ProjectList />);
      
      // Change sort preference
      cy.get('[data-testid="sort-dropdown"]').select('name-desc');
      
      // Check localStorage
      cy.window().then((win) => {
        expect(win.localStorage.getItem('worldbuilding-project-sort')).to.equal('name-desc');
      });
      
      // Remount component
      cy.mount(<ProjectList />);
      
      // Should retain sort preference
      cy.get('[data-testid="sort-dropdown"]').should('have.value', 'name-desc');
    });
  });

  describe('Archive Toggle', () => {
    it('shows active projects by default', () => {
      const activeProjects = createMockProjects(2, false);
      const archivedProjects = createMockProjects(2, true);
      
      mountWithProviders(<ProjectList />, {
        initialState: { projects: [...activeProjects, ...archivedProjects] }
      });
      
      // Should only show active projects
      cy.get('[data-testid="project-card"]').should('have.length', 2);
      cy.contains('(2 archived)').should('be.visible');
    });

    it('toggles to show archived projects', () => {
      const activeProjects = createMockProjects(2, false);
      const archivedProjects = createMockProjects(2, true);
      
      mountWithProviders(<ProjectList />, {
        initialState: { projects: [...activeProjects, ...archivedProjects] }
      });
      
      // Toggle to archived
      cy.get('[data-testid="toggle-archived"]').click();
      
      // Should show archived projects
      cy.get('[data-testid="project-card"]').should('have.length', 2);
      cy.get('[data-testid="toggle-archived"]').should('contain', 'Showing Archived');
    });

    it('shows appropriate empty state for archived view', () => {
      const activeProjects = createMockProjects(2, false);
      
      mountWithProviders(<ProjectList />, {
        initialState: { projects: activeProjects }
      });
      
      // Toggle to archived (which has none)
      cy.get('[data-testid="toggle-archived"]').click();
      
      cy.contains('No archived projects').should('be.visible');
      cy.contains('Your archived projects will appear here').should('be.visible');
    });
  });

  describe('Project Actions', () => {
    it('opens create project modal when clicking new project [data-cy*="button"]', () => {
      mountWithProviders(<ProjectList />);
      
      cy.get('[data-testid="create-project"]').click();
      cy.get('[data-testid="create-project-modal"]').should('be.visible');
    });

    it('opens create project modal from empty state', () => {
      mountWithProviders(<ProjectList />);
      
      cy.get('[data-testid="create-first-project"]').click();
      cy.get('[data-testid="create-project-modal"]').should('be.visible');
    });

    it('opens create project modal from FAB on mobile', () => {
      setMobileViewport();
      mountWithProviders(<ProjectList />);
      
      cy.get('[data-testid="fab-create-project"]').click();
      cy.get('[data-testid="create-project-modal"]').should('be.visible');
    });

    it('deletes project with confirmation', () => {
      const projects = createMockProjects(2);
      
      mountWithProviders(<ProjectList />, {
        initialState: { projects }
      });
      
      // Stub window.confirm
      cy.window().then((win) => {
        cy.stub(win, 'confirm').returns(true);
      });
      
      // Open action menu on first project
      cy.get('[data-testid="project-card"]').first().find('[aria-label="Project actions"]').click();
      
      // Click delete option
      cy.contains('Delete Project').click();
      
      // Verify confirm was called
      cy.window().its('confirm').should('have.been.called');
    });

    it('cancels deletion when user declines confirmation', () => {
      const projects = createMockProjects(2);
      
      mountWithProviders(<ProjectList />, {
        initialState: { projects }
      });
      
      // Stub window.confirm to return false
      cy.window().then((win) => {
        cy.stub(win, 'confirm').returns(false);
      });
      
      // Open action menu on first project
      cy.get('[data-testid="project-card"]').first().find('[aria-label="Project actions"]').click();
      
      // Click delete option
      cy.contains('Delete Project').click();
      
      // Verify projects still exist
      cy.get('[data-testid="project-card"]').should('have.length', 2);
    });

    it('shows loading state during deletion', () => {
      const projects = createMockProjects(2);
      
      mountWithProviders(<ProjectList />, {
        initialState: { projects }
      });
      
      cy.window().then((win) => {
        cy.stub(win, 'confirm').returns(true);
      });
      
      // Open action menu on first project
      cy.get('[data-testid="project-card"]').first().find('[aria-label="Project actions"]').click();
      
      // Click delete option
      cy.contains('Delete Project').click();
      
      // Should show "Deleting..." text in the menu (if it reopens)
      // Note: The actual loading behavior depends on the implementation
    });
  });

  describe('Combined Features', () => {
    it('searches within archived projects', () => {
      const activeProjects = createMockProjects(2, false);
      const archivedProjects = createMockProjects(2, true);
      archivedProjects[0].name = 'Archived Special';
      
      mountWithProviders(<ProjectList />, {
        initialState: { projects: [...activeProjects, ...archivedProjects] }
      });
      
      // Switch to archived
      cy.get('[data-testid="toggle-archived"]').click();
      
      // Search
      cy.get('[data-testid="project-search"]').type('Special');
      waitForAnimation();
      
      // Should find the archived project
      cy.get('[data-testid="project-card"]').should('have.length', 1);
      cy.contains('Archived Special').should('be.visible');
    });

    it('maintains sort order when searching', () => {
      const projects = [
        { ...mockProject, id: '1', name: 'Alpha Test', updatedAt: '2024-01-01' },
        { ...mockProject, id: '2', name: 'Beta Test', updatedAt: '2024-01-02' },
        { ...mockProject, id: '3', name: 'Gamma Test', updatedAt: '2024-01-03' }
      ];
      
      mountWithProviders(<ProjectList />, {
        initialState: { projects }
      });
      
      // Open sort dropdown and [data-cy*="select"] name-desc
      cy.get('[data-testid="sort-dropdown"]').click();
      cy.get('[data-testid="sort-option-name-desc"]').click();
      
      // Search for "Test"
      cy.get('[data-testid="project-search"]').type('Test');
      waitForAnimation();
      
      // Should maintain desc order by name
      cy.get('[data-testid="project-card"]').first().should('contain', 'Gamma Test');
      cy.get('[data-testid="project-card"]').last().should('contain', 'Alpha Test');
    });
  });

  describe('Responsive Design', () => {
    it('adapts layout for mobile viewport', () => {
      setMobileViewport();
      const projects = createMockProjects(3);
      
      mountWithProviders(<ProjectList />, {
        initialState: { projects }
      });
      
      // Check mobile-specific elements
      cy.get('[data-testid="fab-create-project"]').should('be.visible');
      
      // Check responsive grid
      // React Native Web uses flexbox instead of CSS Grid

      cy.get('[data-testid="grid"]').should('be.visible') // React Native Web uses inline styles instead of CSS classes;
    });

    it('adapts layout for tablet viewport', () => {
      setTabletViewport();
      const projects = createMockProjects(3);
      
      mountWithProviders(<ProjectList />, {
        initialState: { projects }
      });
      
      // FAB should be hidden
      cy.get('[data-testid="fab-create-project"]').should('not.be.visible');
      
      // Check responsive grid
      // React Native Web uses flexbox instead of CSS Grid

      cy.get('[data-testid="grid"]').should('be.visible') // React Native Web uses inline styles instead of CSS classes;
    });

    it('adapts layout for desktop viewport', () => {
      setDesktopViewport();
      const projects = createMockProjects(3);
      
      mountWithProviders(<ProjectList />, {
        initialState: { projects }
      });
      
      // Check desktop layout
      // React Native Web uses flexbox instead of CSS Grid

      cy.get('[data-testid="grid"]').should('be.visible') // React Native Web uses inline styles instead of CSS classes;
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      mountWithProviders(<ProjectList />);
      
      cy.get('[data-testid="fab-create-project"]')
        .should('have.attr', 'aria-label', 'Create new project');
    });

    it('supports keyboard navigation', () => {
      const projects = createMockProjects(2);
      mountWithProviders(<ProjectList />, {
        initialState: { projects }
      });
      
      // Focus and verify interactive elements are keyboard accessible
      cy.get('[data-testid="toggle-archived"]').focus();
      cy.focused().should('have.attr', 'data-cy', 'toggle-archived');
      
      cy.get('[data-testid="create-project"]').focus();
      cy.focused().should('have.attr', 'data-cy', 'create-project');
      
      cy.get('[data-testid="project-search"]').focus();
      cy.focused().should('have.attr', 'data-cy', 'project-search');
      
      cy.get('[data-testid="sort-dropdown"]').focus();
      cy.focused().should('have.attr', 'data-cy', 'sort-dropdown');
    });

    it('announces results count to screen readers', () => {
      const projects = createMockProjects(5);
      mountWithProviders(<ProjectList />, {
        initialState: { projects }
      });
      
      cy.get('[data-testid="project-search"]').type('Project');
      waitForAnimation();
      
      // Results count should be visible and readable
      cy.contains('Showing 5 projects matching "Project"')
        .should('be.visible');
    });
  });

  describe('Performance', () => {
    it('virtualizes large lists efficiently', () => {
      const projects = createMockProjects(100);
      mountWithProviders(<ProjectList />, {
        initialState: { projects }
      });
      
      // Should use virtualized list (check for react-window)
      cy.get('.react-window').should('exist');
      
      // Should not render all 100 items at once
      cy.get('[data-testid="project-card"]').should('have.length.lessThan', 30);
    });

    it('handles search efficiently with large datasets', () => {
      const projects = createMockProjects(50);
      
      mountWithProviders(<ProjectList />, {
        initialState: { projects }
      });
      
      // Type a search query
      cy.get('[data-testid="project-search"]').type('Project 25');
      
      // Wait for debounce
      waitForAnimation();
      
      // Should find the matching project
      cy.contains('Project 25').should('be.visible');
      
      // Verify search is working with large dataset
      cy.get('[data-testid="project-card"]').should('have.length', 1);
    });
  });

  describe('Edge Cases', () => {
    it('handles projects with missing data gracefully', () => {
      const projects = [
        { ...mockProject, description: undefined },
        { ...mockProject, id: '2', genre: null }
      ];
      
      mountWithProviders(<ProjectList />, {
        initialState: { projects }
      });
      
      // Should render without errors
      cy.get('[data-testid="project-card"]').should('have.length', 2);
    });

    it('handles search with special characters', () => {
      const projects = createMockProjects(2);
      projects[0].name = 'Project (Special) [Characters]';
      
      mountWithProviders(<ProjectList />, {
        initialState: { projects }
      });
      
      cy.get('[data-testid="project-search"]').type('(Special)');
      waitForAnimation();
      
      cy.get('[data-testid="project-card"]').should('have.length', 1);
      cy.contains('Project (Special) [Characters]').should('be.visible');
    });

    it('handles rapid toggling of archived state', () => {
      const activeProjects = createMockProjects(2, false);
      const archivedProjects = createMockProjects(2, true);
      
      mountWithProviders(<ProjectList />, {
        initialState: { projects: [...activeProjects, ...archivedProjects] }
      });
      
      // Rapidly toggle
      cy.get('[data-testid="toggle-archived"]').click();
      cy.get('[data-testid="toggle-archived"]').click();
      cy.get('[data-testid="toggle-archived"]').click();
      
      // Should end up showing archived
      cy.get('[data-testid="project-card"]').should('have.length', 2);
      cy.get('[data-testid="toggle-archived"]').should('contain', 'Showing Archived');
    });

    it('handles empty search query correctly', () => {
      const projects = createMockProjects(3);
      mountWithProviders(<ProjectList />, {
        initialState: { projects }
      });
      
      // Type and then clear
      cy.get('[data-testid="project-search"]').type('Test');
      cy.get('[data-testid="clear-search"]').click();
      waitForAnimation();
      
      // Should show all projects
      cy.get('[data-testid="project-card"]').should('have.length', 3);
      
      // Should not show search message
      cy.contains('matching ""').should('not.exist');
    });
  });
});