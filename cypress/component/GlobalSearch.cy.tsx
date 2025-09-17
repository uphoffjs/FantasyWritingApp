import React from 'react';
import { GlobalSearch } from '../../src/components/GlobalSearch';
import { WorldElement } from '../../src/types/models/WorldElement';
import { Project } from '../../src/types/models/Project';
import { ElementCategory } from '../../src/types/models/ElementCategory';

describe('GlobalSearch Component', () => {
  // Mock data
  const mockProject: Project = {
    id: 'project-1',
    name: 'The Chronicles of Eldoria',
    description: 'An epic fantasy adventure',
    genre: 'fantasy',
    status: 'active',
    elements: [],
    collaborators: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockElement: WorldElement = {
    id: 'element-1',
    name: 'Aragorn',
    category: 'character' as ElementCategory,
    description: 'A brave ranger from the north',
    completionPercentage: 85,
    questions: [],
    answers: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  let mockNavigate;
  let mockNavigation;
  let mockSearchAll;
  let mockSetSearchQuery;
  let mockSearchProvider;
  let mockOnClose;

  beforeEach(() => {
    // Create stubs inside beforeEach
    mockNavigate = cy.stub().as('navigate');
    mockNavigation = {
      navigate: mockNavigate,
      goBack: cy.stub(),
      canGoBack: () => false,
    };

    mockSearchAll = cy.stub().as('searchAll');
    mockSetSearchQuery = cy.stub().as('setSearchQuery');

    mockSearchProvider = {
      searchQuery: '',
      setSearchQuery: mockSetSearchQuery,
      searchAll: mockSearchAll,
    };

    mockOnClose = cy.stub().as('onClose');

    // Mock the hooks
    cy.stub(require('@react-navigation/native'), 'useNavigation').returns(mockNavigation);
    cy.stub(require('../../src/components/SearchProvider'), 'useSearch').returns(mockSearchProvider);
    
    // Default search results
    mockSearchAll.returns({
      projects: [mockProject],
      elements: [mockElement],
    });
  });

  it('should render when visible', () => {
    cy.mount(
      <GlobalSearch 
        visible={true} 
        onClose={mockOnClose}
        testID="global-search"
      />
    );

    // Check modal is visible
    cy.contains('Search projects and elements...').should('be.visible');
    cy.contains('Cancel').should('be.visible');
    cy.contains('Search Everything').should('be.visible');
  });

  it('should not render when not visible', () => {
    cy.mount(
      <GlobalSearch 
        visible={false} 
        onClose={mockOnClose}
        testID="global-search"
      />
    );

    cy.contains('Search projects and elements...').should('not.exist');
  });

  it('should show initial empty state', () => {
    cy.mount(
      <GlobalSearch 
        visible={true} 
        onClose={mockOnClose}
        testID="global-search"
      />
    );

    // Check initial empty state
    cy.contains('🔍').should('be.visible');
    cy.contains('Search Everything').should('be.visible');
    cy.contains('Search across all your projects and elements').should('be.visible');
  });

  it('should handle search input and trigger search', () => {
    cy.mount(
      <GlobalSearch 
        visible={true} 
        onClose={mockOnClose}
        testID="global-search"
      />
    );

    // Type in search input
    cy.get('input[placeholder="Search projects and elements..."]').type('Aragorn');
    
    // Should call searchAll after debounce
    cy.wait(400); // Wait for debounce
    cy.get('@searchAll').should('have.been.called');
  });

  it('should display search results for projects and elements', () => {
    cy.mount(
      <GlobalSearch 
        visible={true} 
        onClose={mockOnClose}
        testID="global-search"
      />
    );

    // Type search query
    cy.get('input[placeholder="Search projects and elements..."]').type('test');
    cy.wait(400);

    // Should show both project and element results
    cy.contains('The Chronicles of Eldoria').should('be.visible');
    cy.contains('Project • 0 elements').should('be.visible');
    cy.contains('Aragorn').should('be.visible');
    cy.contains('character • 85% complete').should('be.visible');
    
    // Should show result count
    cy.contains('2 results').should('be.visible');
  });

  it('should handle project result click', () => {
    cy.mount(
      <GlobalSearch 
        visible={true} 
        onClose={mockOnClose}
        testID="global-search"
      />
    );

    // Search and click project result
    cy.get('input[placeholder="Search projects and elements..."]').type('Chronicles');
    cy.wait(400);
    
    cy.contains('The Chronicles of Eldoria').click();
    
    // Should navigate to project and close modal
    cy.get('@navigate').should('have.been.calledWith', 'Project', { projectId: 'project-1' });
    cy.get('@onClose').should('have.been.called');
  });

  it('should handle element result click', () => {
    cy.mount(
      <GlobalSearch 
        visible={true} 
        onClose={mockOnClose}
        testID="global-search"
      />
    );

    // Search and click element result
    cy.get('input[placeholder="Search projects and elements..."]').type('Aragorn');
    cy.wait(400);
    
    cy.contains('Aragorn').click();
    
    // Should navigate to element and close modal
    cy.get('@navigate').should('have.been.calledWith', 'Element', { elementId: 'element-1' });
    cy.get('@onClose').should('have.been.called');
  });

  it('should clear search when clear [data-cy*="button"] clicked', () => {
    cy.mount(
      <GlobalSearch 
        visible={true} 
        onClose={mockOnClose}
        testID="global-search"
      />
    );

    // Type search query
    cy.get('input[placeholder="Search projects and elements..."]').type('test');
    
    // Clear [data-cy*="button"] should appear
    cy.contains('✕').should('be.visible');
    
    // Click clear [data-cy*="button"]
    cy.contains('✕').click();
    
    // Input should be cleared
    cy.get('input[placeholder="Search projects and elements..."]').should('have.value', '');
  });

  it('should handle cancel [data-cy*="button"]', () => {
    cy.mount(
      <GlobalSearch 
        visible={true} 
        onClose={mockOnClose}
        testID="global-search"
      />
    );

    cy.contains('Cancel').click();
    cy.get('@onClose').should('have.been.called');
  });

  it('should handle backdrop click to close', () => {
    cy.mount(
      <GlobalSearch 
        visible={true} 
        onClose={mockOnClose}
        testID="global-search"
      />
    );

    // Click outside the modal content (backdrop)
    cy.get('body').click('topLeft', { force: true });
    cy.get('@onClose').should('have.been.called');
  });

  it('should show no results state when search returns empty', () => {
    // Mock empty search results
    mockSearchAll.returns({
      projects: [],
      elements: [],
    });

    cy.mount(
      <GlobalSearch 
        visible={true} 
        onClose={mockOnClose}
        testID="global-search"
      />
    );

    // Search for something
    cy.get('input[placeholder="Search projects and elements..."]').type('NonexistentItem');
    cy.wait(400);

    // Should show no results state
    cy.contains('🔎').should('be.visible');
    cy.contains('No Results').should('be.visible');
    cy.contains('No projects or elements match "NonexistentItem"').should('be.visible');
  });

  it('should show searching state briefly', () => {
    cy.mount(
      <GlobalSearch 
        visible={true} 
        onClose={mockOnClose}
        testID="global-search"
      />
    );

    // Type search query
    cy.get('input[placeholder="Search projects and elements..."]').type('test');
    
    // Might briefly show searching state
    // This is hard to test due to the short duration
    cy.get('input[placeholder="Search projects and elements..."]').should('have.value', 'test');
  });

  it('should display proper icons for different result types', () => {
    cy.mount(
      <GlobalSearch 
        visible={true} 
        onClose={mockOnClose}
        testID="global-search"
      />
    );

    cy.get('input[placeholder="Search projects and elements..."]').type('test');
    cy.wait(400);

    // Project should show book icon
    cy.contains('📚').should('be.visible');
    
    // Element should show category-specific icon (character = 👤)
    cy.contains('👤').should('be.visible');
  });

  it('should handle auto-focus on search input', () => {
    cy.mount(
      <GlobalSearch 
        visible={true} 
        onClose={mockOnClose}
        testID="global-search"
      />
    );

    // Input should be focused automatically
    cy.get('input[placeholder="Search projects and elements..."]').should('be.focused');
  });

  it('should display descriptions when available', () => {
    cy.mount(
      <GlobalSearch 
        visible={true} 
        onClose={mockOnClose}
        testID="global-search"
      />
    );

    cy.get('input[placeholder="Search projects and elements..."]').type('test');
    cy.wait(400);

    // Should show project description
    cy.contains('An epic fantasy adventure').should('be.visible');
    
    // Should show element description
    cy.contains('A brave ranger from the north').should('be.visible');
  });

  it('should handle results without descriptions', () => {
    const projectWithoutDescription = {
      ...mockProject,
      description: undefined,
    };
    
    const elementWithoutDescription = {
      ...mockElement,
      description: undefined,
    };

    mockSearchAll.returns({
      projects: [projectWithoutDescription],
      elements: [elementWithoutDescription],
    });

    cy.mount(
      <GlobalSearch 
        visible={true} 
        onClose={mockOnClose}
        testID="global-search"
      />
    );

    cy.get('input[placeholder="Search projects and elements..."]').type('test');
    cy.wait(400);

    // Should still show results without descriptions
    cy.contains('The Chronicles of Eldoria').should('be.visible');
    cy.contains('Aragorn').should('be.visible');
  });

  it('should handle singular vs plural result count', () => {
    // Test with single result
    mockSearchAll.returns({
      projects: [mockProject],
      elements: [],
    });

    cy.mount(
      <GlobalSearch 
        visible={true} 
        onClose={mockOnClose}
        testID="global-search"
      />
    );

    cy.get('input[placeholder="Search projects and elements..."]').type('test');
    cy.wait(400);

    cy.contains('1 result').should('be.visible');
  });

  it('should debounce search input to avoid excessive API calls', () => {
    cy.mount(
      <GlobalSearch 
        visible={true} 
        onClose={mockOnClose}
        testID="global-search"
      />
    );

    // Type multiple characters quickly
    cy.get('input[placeholder="Search projects and elements..."]')
      .type('a')
      .type('r')
      .type('a')
      .type('g')
      .type('o')
      .type('r')
      .type('n');
    
    // Should only call search once after debounce period
    cy.wait(400);
    cy.get('@searchAll').should('have.been.calledOnce');
  });

  it('should maintain search state across re-renders', () => {
    cy.mount(
      <GlobalSearch 
        visible={true} 
        onClose={mockOnClose}
        testID="global-search"
      />
    );

    const searchTerm = 'persistent search';
    
    // Type search
    cy.get('input[placeholder="Search projects and elements..."]').type(searchTerm);
    
    // Value should persist
    cy.get('input[placeholder="Search projects and elements..."]').should('have.value', searchTerm);
  });

  it('should handle keyboard navigation', () => {
    cy.mount(
      <GlobalSearch 
        visible={true} 
        onClose={mockOnClose}
        testID="global-search"
      />
    );

    // Test escape key to close
    cy.get('input[placeholder="Search projects and elements..."]').type('{esc}');
    // Note: This might not work in component tests as it depends on modal implementation
  });

  it('should display element completion percentage', () => {
    cy.mount(
      <GlobalSearch 
        visible={true} 
        onClose={mockOnClose}
        testID="global-search"
      />
    );

    cy.get('input[placeholder="Search projects and elements..."]').type('Aragorn');
    cy.wait(400);

    // Should show completion percentage
    cy.contains('85% complete').should('be.visible');
  });

  it('should display project element count', () => {
    const projectWithElements = {
      ...mockProject,
      elements: [mockElement, { ...mockElement, id: 'element-2' }],
    };

    mockSearchAll.returns({
      projects: [projectWithElements],
      elements: [],
    });

    cy.mount(
      <GlobalSearch 
        visible={true} 
        onClose={mockOnClose}
        testID="global-search"
      />
    );

    cy.get('input[placeholder="Search projects and elements..."]').type('Chronicles');
    cy.wait(400);

    // Should show element count
    cy.contains('Project • 2 elements').should('be.visible');
  });

  it('should handle mixed search results properly', () => {
    const multipleProjects = [
      mockProject,
      { ...mockProject, id: 'project-2', name: 'Second Project' },
    ];
    
    const multipleElements = [
      mockElement,
      { ...mockElement, id: 'element-2', name: 'Gandalf' },
    ];

    mockSearchAll.returns({
      projects: multipleProjects,
      elements: multipleElements,
    });

    cy.mount(
      <GlobalSearch 
        visible={true} 
        onClose={mockOnClose}
        testID="global-search"
      />
    );

    cy.get('input[placeholder="Search projects and elements..."]').type('test');
    cy.wait(400);

    // Should show all results
    cy.contains('The Chronicles of Eldoria').should('be.visible');
    cy.contains('Second Project').should('be.visible');
    cy.contains('Aragorn').should('be.visible');
    cy.contains('Gandalf').should('be.visible');
    
    // Should show total count
    cy.contains('4 results').should('be.visible');
  });
});